import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { User } from '../../user/user.entity';
import { Role } from '../../role/role.entity';
import { Permission } from '../../permission/permission.entity';
import { Resource } from '../../resource/resource.entity';
import { Organization } from '../../organization/organization.entity';

const RESOURCE_ID = 'c27bb2a6-5fa6-4b80-91a2-f3763c4f1c35';

describe('/permissions/check (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    await dataSource.synchronize(true);

    // Seed minimal test data manually
    const permissionRepo = dataSource.getRepository(Permission);
    const roleRepo = dataSource.getRepository(Role);
    const userRepo = dataSource.getRepository(User);
    const orgRepo = dataSource.getRepository(Organization);
    const resourceRepo = dataSource.getRepository(Resource);

    const read = await permissionRepo.save({ name: 'read' });

    const viewerRole = await roleRepo.save({
      name: 'Viewer',
      permissions: [read],
    });

    const hospital = await orgRepo.save({ name: 'Central Hospital', level: 1 });
    const clinic = await orgRepo.save({
      name: 'Clinic A',
      level: 2,
      parent: hospital,
    });

    const viewer = await userRepo.save({
      name: 'Viewer User',
      email: 'viewer@clinic.com',
      role: viewerRole,
      organization: clinic,
    });

    await resourceRepo.save({
      resource_id: RESOURCE_ID,
      patient_name: 'VIP',
      patient_identifier: 'MRN-VIP',
      organization: clinic,
      owner: viewer,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should grant access to admin with read permission', async () => {
    const res = await request(app.getHttpServer())
      .get('/permissions/check')
      .query({
        user_email: 'admin@hospital.com',
        resource_id: RESOURCE_ID,
        permission: 'read',
      })
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.granted).toBe(true);
  });

  it('should deny access if permission is missing', async () => {
    const res = await request(app.getHttpServer())
      .get('/permissions/check')
      .query({
        user_email: 'viewer@clinic.com',
        resource_id: RESOURCE_ID,
        permission: 'update',
      })
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.granted).toBe(false);
  });

  it('should deny access if user is invalid', async () => {
    await request(app.getHttpServer())
      .get('/permissions/check')
      .query({
        user_email: 'nonexistent@domain.com',
        resource_id: RESOURCE_ID,
        permission: 'read',
      })
      .expect(403);
  });

  it('should deny access if resource is invalid', async () => {
    await request(app.getHttpServer())
      .get('/permissions/check')
      .query({
        user_email: 'admin@hospital.com',
        resource_id: 'non-existent-id',
        permission: 'read',
      })
      .expect(403);
  });
});
