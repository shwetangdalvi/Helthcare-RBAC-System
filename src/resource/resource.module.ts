import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './resource.entity';
import { User } from '../user/user.entity';
import { ResourceController } from './resource.controller';
import { AccessControlService } from '../access-control/access-control.service';

@Module({
  imports: [TypeOrmModule.forFeature([Resource, User])],
  controllers: [ResourceController],
  providers: [AccessControlService],
})
export class ResourceModule {}
