import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

// Define your own local type that mirrors jsonwebtoken's StringValue
type JwtExpiresIn = `${number}${"s" | "m" | "h" | "d" | "y"}` | number;

const JWT_EXPIRES_IN: JwtExpiresIn = (process.env.JWT_EXPIRES_IN || "1h") as JwtExpiresIn;

export interface JwtPayload {
  id: string;
  email: string;
}

export const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
