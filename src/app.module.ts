import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessControlModule } from './access-control/access-control.module';
import { ResourceModule } from './resource/resource.module';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [AccessControlModule, ResourceModule, DatabaseModule, AuditModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
