import { Injectable } from '@nestjs/common';

export interface AuditLogEntry {
  timestamp?: Date;
  userEmail: string;
  resourceId: string;
  permission: string;
  granted: boolean;
}

@Injectable()
export class AuditService {
  private logs: AuditLogEntry[] = [];

  logAccessAttempt(entry: AuditLogEntry): void {
    this.logs.push({
      ...entry,
      timestamp: new Date(),
    });
  }

  getLogs(): AuditLogEntry[] {
    return this.logs;
  }
}
