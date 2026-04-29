export type User = {
  id: string;
  email: string;
  displayName: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type SignupRequest = {
  email: string;
  displayName: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};