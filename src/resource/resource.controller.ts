import {
  Controller,
  Get,
  Param,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './resource.entity';
import { User } from '../user/user.entity';
import { AccessControlService } from '../access-control/access-control.service';
import { AuditService } from '../audit/audit.service';

@Controller('records')
export class ResourceController {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: Repository<Resource>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly accessControl: AccessControlService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  async getAccessibleRecords(
    @Query('user_email') email: string,
  ): Promise<Resource[]> {
    if (!email) {
      throw new ForbiddenException('Missing user_email');
    }

    const user = await this.userRepo.findOne({
      where: { email },
      relations: [
        'organization',
        'organization.parent',
        'role',
        'role.permissions',
      ],
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const allRecords = await this.resourceRepo.find({
      relations: ['owner', 'organization', 'organization.parent'],
    });

    const accessible = allRecords.filter((record) => {
      const granted = this.accessControl.canAccessResource(user, record, 'read');

      this.auditService.logAccessAttempt({
        userEmail: user.email,
        resourceId: record.resource_id,
        permission: 'read',
        granted,
      });

      return granted;
    });

    return accessible;
  }

  @Get(':id')
  async getRecordById(
    @Param('id') id: string,
    @Query('user_email') email: string,
  ): Promise<Resource> {
    if (!email) {
      throw new ForbiddenException('Missing user_email');
    }

    const user = await this.userRepo.findOne({
      where: { email },
      relations: [
        'organization',
        'organization.parent',
        'role',
        'role.permissions',
      ],
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const record = await this.resourceRepo.findOne({
      where: { resource_id: id },
      relations: ['owner', 'organization', 'organization.parent'],
    });

    if (!record) {
      throw new ForbiddenException('Record not found');
    }

    const canAccess = this.accessControl.canAccessResource(user, record, 'read');

    this.auditService.logAccessAttempt({
      userEmail: user.email,
      resourceId: id,
      permission: 'read',
      granted: canAccess,
    });

    if (!canAccess) {
      throw new ForbiddenException('Access denied to this record');
    }

    return record;
  }
}
