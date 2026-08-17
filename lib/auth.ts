import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-32-chars-long-min-temp';
  return new TextEncoder().encode(secret);
};

export async function signJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Expires in 24 hours
    .sign(getSecretKey());
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}
