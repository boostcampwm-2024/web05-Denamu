export interface SuspendedUserTarget {
  id: number;
  userName: string;
  email: string;
}

export interface SuspensionAdmin {
  name: string;
}

export interface SuspendedUserItem {
  id: number;
  user: SuspendedUserTarget;
  admin: SuspensionAdmin | null;
  detail: string;
  suspendedUntil: string | null;
  createdAt: string;
}

export interface SuspensionFormPayload {
  suspendedUntil?: string;
  detail: string;
}

export interface CreateUserSuspensionPayload extends SuspensionFormPayload {
  userId: number;
}

export type UpdateUserSuspensionPayload = CreateUserSuspensionPayload;
