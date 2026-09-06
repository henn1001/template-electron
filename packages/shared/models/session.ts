export type SessionStatus = 'running' | 'idle' | 'stopped';

export interface Session {
  id: string;
  name: string;
  description: string;
  status: SessionStatus;
  lastActivityAt: string;
}
