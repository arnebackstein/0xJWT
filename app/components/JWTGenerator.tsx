"use client";
import { useState, useEffect } from "react";
import { createJWT, verifyJWT, base64UrlDecode, base64UrlEncode, signHS256 } from "../util";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function JWTGenerator() {
  const [secret, setSecret] = useState("my-secret-key");
  const [header, setHeader] = useState('{"alg": "HS256", "typ": "JWT"}');
  const [payload, setPayload] = useState('{"sub": "12345", "name": "John Doe"}');
  const [jwt, setJwt] = useState("");
  const [isValidHeader, setIsValidHeader] = useState(true);
  const [isValidPayload, setIsValidPayload] = useState(true);
  const [signatureValid, setSignatureValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateJWT = async () => {
      try {
        const parsedHeader = JSON.parse(header);
        const parsedPayload = JSON.parse(payload);
        
        const token = await createJWT(parsedHeader, parsedPayload, secret);
        setJwt(token);
        setIsValidHeader(true);
        setIsValidPayload(true);
        setError(null);
      } catch (error) {
        setError("Failed to generate JWT: Invalid JSON in header or payload");
      }
    };

    if (header && payload) {
      generateJWT();
    }
  }, [header, payload, secret]);

  useEffect(() => {
    const parseJWT = async () => {
      if (!jwt) return;

      const parts = jwt.split('.');
      if (parts.length !== 3) {
        setError("Invalid JWT format - should have three parts");
        return;
      }

      const [headerB64, payloadB64, signatureB64] = parts;

      try {
        try {
          const decodedHeader = await base64UrlDecode(headerB64);
          const parsedHeader = JSON.parse(decodedHeader);
          setHeader(JSON.stringify(parsedHeader, null, 2));
          setIsValidHeader(true);
        } catch (e) {
          setIsValidHeader(false);
          setError("Could not decode header");
        }

        try {
          const decodedPayload = await base64UrlDecode(payloadB64);
          const parsedPayload = JSON.parse(decodedPayload);
          setPayload(JSON.stringify(parsedPayload, null, 2));
          setIsValidPayload(true);
        } catch (e) {
          setIsValidPayload(false);
          setError("Could not decode payload");
        }

        const expectedSignature = await signHS256(`${headerB64}.${payloadB64}`, secret);
        setSignatureValid(signatureB64 === expectedSignature);
        
        if (signatureB64 !== expectedSignature) {
          setError("Invalid signature - header and payload shown are decoded but not verified");
        } else {
          setError(null);
        }
      } catch (error) {
        setError("Error processing JWT");
      }
    };

    parseJWT();
  }, [jwt, secret]);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-center">JWT Generator (HS256)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Secret Key</label>
          <Input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Header (JSON)</label>
          <Textarea
            rows={4}
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            className={`font-mono text-sm ${!isValidHeader ? "border-red-500" : ""}`}
          />
          {!isValidHeader && (
            <p className="text-sm text-red-500">Invalid JSON format in header</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Payload (JSON)</label>
          <Textarea
            rows={7}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className={`font-mono text-sm ${!isValidPayload ? "border-red-500" : ""}`}
          />
          {!isValidPayload && (
            <p className="text-sm text-red-500">Invalid JSON format in payload</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">JWT</label>
          <Textarea
            value={jwt}
            onChange={(e) => setJwt(e.target.value)}
            className="font-mono text-sm"
            rows={4}
          />
        </div>

        {jwt && (
          signatureValid ? (
            <Alert variant="default" className="border-green-500 bg-green-50 text-green-700">
              <AlertCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>Signature valid - JWT verified successfully</AlertDescription>
            </Alert>
          ) : error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )
        )}
      </CardContent>
    </Card>
  );
} 