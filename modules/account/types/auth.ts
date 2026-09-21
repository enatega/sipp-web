export type AuthUser = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  profile?: string | null;
};

export type AuthSuccess = {
  user: AuthUser;
  accessToken: string;
  profiles?: Array<{ key: string; data: unknown }>;
  impersonation?: ImpersonationSession;
};

export type ImpersonationSession = {
  adminId: string;
  targetUserId: string;
  startedAt: string;
  adminReturnUrl?: string;
};

export type SessionResponse = {
  authenticated: boolean;
  user: AuthUser | null;
  impersonation?: ImpersonationSession | null;
};
