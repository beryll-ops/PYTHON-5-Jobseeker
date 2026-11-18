export type AuthMode = "signin" | "magic-link";

export interface SignInCredentials {
  email: string;
  password?: string;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
  needsEmailConfirmation?: boolean;
}
