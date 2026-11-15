import type { UserProfileKind } from "./scenario";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  profile: UserProfileKind;
  organization?: string;
}

export interface AuthSession {
  user: AuthUser;
  /** Jeton de démonstration uniquement (mocks). */
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput extends LoginInput {
  fullName: string;
  profile: UserProfileKind;
}

export const PROFILE_LABELS: Record<UserProfileKind, string> = {
  PLANNER: "Planificateur",
  EDUCATOR: "Éducateur",
  EXPLORER: "Explorateur",
};
