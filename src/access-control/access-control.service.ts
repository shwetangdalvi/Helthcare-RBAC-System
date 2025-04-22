import { Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';
import { Resource } from '../resource/resource.entity';
import { Organization } from '../organization/organization.entity';

@Injectable()
export class AccessControlService {
  /**
   * Check if user has permission to access a resource
   */
  canAccessResource(
    user: User,
    resource: Resource,
    permission: string,
  ): boolean {
    if (!user || !resource) return false;

    const hasPermission = user.role?.permissions?.some(
      (perm) => perm.name === permission,
    );
    if (!hasPermission) return false;

    const userOrg = user.organization;
    const resourceOrg = resource.organization;

    // Same organization
    if (userOrg?.organization_id === resourceOrg?.organization_id) {
      return true;
    }

    // Parent-to-child access (hierarchical)
    return this.isAncestor(userOrg, resourceOrg);
  }

  /**
   * Recursively checks if userOrg is an ancestor of resourceOrg
   */
  private isAncestor(
    userOrg: Organization,
    resourceOrg: Organization,
  ): boolean {
    let current = resourceOrg.parent;
    while (current) {
      if (current.organization_id === userOrg.organization_id) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  /**
   * Filter list of resources a user can access
   */
  filterResourcesForUser(
    user: User,
    resources: Resource[],
    permission: string,
  ): Resource[] {
    return resources.filter((res) =>
      this.canAccessResource(user, res, permission),
    );
  }
}
