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

describe('/records (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testRecord: Resource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    await dataSource.synchronize(true);

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
    const adminRole = await roleRepo.save({
      name: 'Admin',
      permissions: [read],
    });

    const parentOrg = await orgRepo.save({ name: 'Main Hospital', level: 1 });
    const childOrg = await orgRepo.save({
      name: 'Child Clinic',
      level: 2,
      parent: parentOrg,
    });

    const viewer = await userRepo.save({
      name: 'Viewer',
      email: 'viewer@child.com',
      role: viewerRole,
      organization: childOrg,
    });

    await userRepo.save({
      name: 'Admin',
      email: 'admin@hospital.com',
      role: adminRole,
      organization: parentOrg,
    });

    testRecord = await resourceRepo.save({
      patient_name: 'Test Record',
      patient_identifier: 'MRN-001',
      demographics: 'Demo',
      medical_history: 'None',
      prescriptions: 'None',
      appointments: 'Tomorrow',
      owner: viewer,
      organization: childOrg,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /records should return resources visible to parent org admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/records')
      .query({ user_email: 'admin@hospital.com' })
      .expect(200);

    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ resource_id: testRecord.resource_id }),
      ]),
    );
  });

  it('GET /records/:id should return resource to allowed viewer', async () => {
    const res = await request(app.getHttpServer())
      .get(`/records/${testRecord.resource_id}`)
      .query({ user_email: 'viewer@child.com' })
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.resource_id).toBe(testRecord.resource_id);
  });

  it('GET /records/:id should deny access to unrelated viewer', async () => {
    const outsider = await dataSource.getRepository(User).save({
      name: 'Outsider',
      email: 'viewer@outside.com',
      role: await dataSource
        .getRepository(Role)
        .findOneByOrFail({ name: 'Viewer' }),
      organization: await dataSource
        .getRepository(Organization)
        .save({ name: 'Unrelated Org', level: 1 }),
    });

    await request(app.getHttpServer())
      .get(`/records/${testRecord.resource_id}`)
      .query({ user_email: outsider.email })
      .expect(403);
  });
});
