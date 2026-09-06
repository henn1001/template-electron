import type { Session } from '@template/shared/models/session';

const initialSessions: Session[] = [
  {
    id: 'workspace-sync',
    name: 'Workspace sync',
    description: 'Keep project context up to date',
    status: 'running',
    lastActivityAt: new Date().toISOString(),
  },
  {
    id: 'release-checklist',
    name: 'Release checklist',
    description: 'Review the next milestone',
    status: 'running',
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'design-notes',
    name: 'Design notes',
    description: 'Capture ideas for the next iteration',
    status: 'idle',
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
  },
];

export class SessionManager {
  private sessions = initialSessions;

  list(): Session[] {
    return this.sessions.map((session) => ({ ...session }));
  }

  start(id: string): Session {
    return this.update(id, 'running');
  }

  stop(id: string): Session {
    return this.update(id, 'idle');
  }

  private update(id: string, status: Session['status']): Session {
    const session = this.sessions.find((item) => item.id === id);
    if (!session) {
      throw new Error(`Session not found: ${id}`);
    }

    session.status = status;
    session.lastActivityAt = new Date().toISOString();
    return { ...session };
  }
}

export const sessionManager = new SessionManager();
