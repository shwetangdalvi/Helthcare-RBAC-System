import { Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AccessControlController } from './access-control.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Resource } from '../resource/resource.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Resource]), AuditModule],
  controllers: [AccessControlController],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule {}
