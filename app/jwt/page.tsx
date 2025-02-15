import { JWTGenerator } from "./components/JWTGenerator";

export default function Home() {
    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-6xl px-6">
                <div className="my-8">
                    <JWTGenerator />
                </div>

                <article className="prose prose-slate lg:prose-lg mx-auto bg-white p-8 rounded-lg shadow mb-8">
                    <h1>Understanding HS256 (HMAC-SHA256) JWTs</h1>
                    <p>
                        This is an educational project. I wanted to understand how JavaScript Web Tokens (JWTs) work, so I implemented them from scratch.
                    </p>

                    <h2>1. JWT Structure</h2>
                    <p>A JSON Web Token (JWT) consists of three Base64Url-encoded parts:</p>
                    <pre>
                        JWT = Base64Url(Header) + &quot;.&quot; + Base64Url(Payload) + &quot;.&quot; + Base64Url(Signature)
                    </pre>

                    <h2>2. Header and Payload</h2>
                    <p>The header specifies the algorithm:</p>
                    <pre>{'{ "alg": "HS256", "typ": "JWT" }'}</pre>
                    <p>The payload contains claims:</p>
                    <pre>{'{ "sub": "1234567890", "name": "John Doe", "iat": 1706535400 }'}</pre>

                    <h2>3. HMAC-SHA256 Signature</h2>
                    <p>The signature ensures integrity using a secret key K:</p>
                    <pre>
                        Signature = HMAC-SHA256(K, Header.Payload)
                    </pre>
                    <p>HMAC (see <a href="https://datatracker.ietf.org/doc/html/rfc2104">RFC 2104</a> and <a href="https://en.wikipedia.org/wiki/HMAC">HMAC Wikipedia</a>) is defined as:</p>
                    <pre>
                        HMAC(K, M) = H( (K ⊕ opad) || H( (K ⊕ ipad) || M ) )
                    </pre>
                    <p>where:</p>
                    <ul>
                        <li>K is the secret key</li>
                        <li>M is the message (header + payload)</li>
                        <li>H is SHA-256</li>
                        <li>⊕ (XOR operator)</li>
                        <li>ipad = 0x36 and opad = 0x5C are padding constants</li>
                    </ul>

                    <h2>4. References</h2>
                    <p>I recommend reading the following resources to learn more about JWTs, and how they work. Also check out the <a href="https://jwt.io/">JWT.io debugger</a>. Since this here is only an educational project, I advise you to not use this for other purposes.</p>
                    <p>If you want to learn more on JWTs, I recommend checking out the <a href="https://jwt.io/introduction">JWT.io introduction</a>. And the official <a href="https://datatracker.ietf.org/doc/html/rfc7519">RFC 7519</a> specification.</p>
                    
                </article>

            </div>
        </div>
    );
}
