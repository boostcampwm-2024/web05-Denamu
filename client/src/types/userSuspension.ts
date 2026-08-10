export interface SuspendedUserTarget {
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

export interface CreateUserSuspensionPayload {
  userId: number;
  suspendedUntil?: string;
  detail: string;
}
