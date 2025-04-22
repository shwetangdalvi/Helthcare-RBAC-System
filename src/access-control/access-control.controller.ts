import { Controller, Get, Query, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Resource } from '../resource/resource.entity';
import { AccessControlService } from './access-control.service';
import { AuditService } from '../audit/audit.service';
import { CheckPermissionQueryDto } from './dto/check-permission-query.dto';

@Controller('permissions')
export class AccessControlController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Resource)
    private readonly resourceRepo: Repository<Resource>,

    private readonly accessService: AccessControlService,
    private readonly auditService: AuditService,
  ) {}

  @Get('check')
  async checkPermission(
    @Query() query: CheckPermissionQueryDto,
  ): Promise<{ granted: boolean }> {
    const { user_email, resource_id, permission } = query;

    const user = await this.userRepo.findOne({
      where: { email: user_email },
      relations: [
        'organization',
        'organization.parent',
        'role',
        'role.permissions',
      ],
    });

    const resource = await this.resourceRepo.findOne({
      where: { resource_id },
      relations: ['owner', 'organization', 'organization.parent'],
    });

    if (!user || !resource) {
      this.auditService.logAccessAttempt({
        userEmail: user_email,
        resourceId: resource_id,
        permission,
        granted: false,
      });

      throw new ForbiddenException(
        !user
          ? `User not found: ${user_email}`
          : `Resource not found: ${resource_id}`,
      );
    }

    const granted = this.accessService.canAccessResource(
      user,
      resource,
      permission,
    );

    this.auditService.logAccessAttempt({
      userEmail: user.email,
      resourceId: resource.resource_id,
      permission,
      granted,
    });

    return { granted };
  }
}
