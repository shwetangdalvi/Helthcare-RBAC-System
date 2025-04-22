import { AccessControlService } from '../access-control.service';
import { User } from '../../user/user.entity';
import { Role } from '../../role/role.entity';
import { Permission } from '../../permission/permission.entity';
import { Organization } from '../../organization/organization.entity';
import { Resource } from '../../resource/resource.entity';

describe('AccessControlService', () => {
  let service: AccessControlService;

  const readPermission: Permission = {
    permission_id: 1,
    name: 'read',
    description: undefined,
    roles: [],
  };

  const updatePermission: Permission = {
    permission_id: 2,
    name: 'update',
    description: undefined,
    roles: [],
  };

  const orgA: Organization = {
    organization_id: 1,
    name: 'Org A',
    level: 1,
    parent: undefined as unknown as Organization,
    children: [],
    users: [],
    resources: [],
  };

  const orgB: Organization = {
    organization_id: 2,
    name: 'Org B',
    level: 2,
    parent: orgA,
    children: [],
    users: [],
    resources: [],
  };

  const orgC: Organization = {
    organization_id: 3,
    name: 'Org C',
    level: 2,
    parent: orgA,
    children: [],
    users: [],
    resources: [],
  };

  const viewerRole: Role = {
    role_id: 1,
    name: 'Viewer',
    permissions: [readPermission],
    users: [],
  };

  const adminRole: Role = {
    role_id: 2,
    name: 'Admin',
    permissions: [readPermission, updatePermission],
    users: [],
  };

  const makeUser = (email: string, org: Organization, role: Role): User => ({
    user_id: email,
    email,
    name: email,
    role,
    organization: org,
  });

  const makeResource = (org: Organization, owner: User): Resource => ({
    resource_id: 'res-1',
    patient_name: 'Test Patient',
    patient_identifier: 'MRN-123',
    demographics: '',
    medical_history: '',
    prescriptions: '',
    appointments: '',
    created_at: new Date(),
    updated_at: new Date(),
    organization: org,
    owner,
  });

  beforeEach(() => {
    service = new AccessControlService();
  });

  it('should allow access by direct ownership if permission granted', () => {
    const user = makeUser('owner@orgb.com', orgB, adminRole);
    const record = makeResource(orgB, user);
    expect(service.canAccessResource(user, record, 'read')).toBe(true);
  });

  it('should allow access through organizational role in parent org', () => {
    const parentUser = makeUser('admin@orga.com', orgA, adminRole);
    const record = makeResource(
      orgB,
      makeUser('viewer@orgb.com', orgB, viewerRole),
    );
    expect(service.canAccessResource(parentUser, record, 'read')).toBe(true);
  });

  it('should deny access if permission is missing even in same org', () => {
    const user = makeUser('viewer@orgb.com', orgB, viewerRole);
    const record = makeResource(orgB, user);
    expect(service.canAccessResource(user, record, 'update')).toBe(false);
  });

  it('should deny access from unrelated organization (no hierarchy)', () => {
    const outsider = makeUser('admin@orgc.com', orgC, adminRole);
    const record = makeResource(
      orgB,
      makeUser('viewer@orgb.com', orgB, viewerRole),
    );
    expect(service.canAccessResource(outsider, record, 'read')).toBe(false);
  });
});
