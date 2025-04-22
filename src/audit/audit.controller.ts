import { Controller, Get } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLogEntry } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  getLogs(): AuditLogEntry[] {
    return this.auditService.getLogs();
  }
}
