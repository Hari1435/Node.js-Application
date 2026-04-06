export interface JWTPayload {
  userId: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: unknown;
}
