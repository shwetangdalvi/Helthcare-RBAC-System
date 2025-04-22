import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import { Role } from './role/role.entity';
import { Permission } from './permission/permission.entity';
import { Organization } from './organization/organization.entity';
import { Resource } from './resource/resource.entity';

const dataSource = new DataSource({
  type: 'sqlite',
  database: 'rbac.sqlite',
  synchronize: true,
  entities: [User, Role, Permission, Organization, Resource],
});

async function seed() {
  await dataSource.initialize();

  const orgRepo = dataSource.getRepository(Organization);
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const permRepo = dataSource.getRepository(Permission);
  const resourceRepo = dataSource.getRepository(Resource);

  await resourceRepo.clear();
  await userRepo.clear();
  await roleRepo.clear();
  await permRepo.clear();
  await orgRepo.clear();

  const permissionNames = ['read', 'create', 'update', 'delete'];
  const permissions = await permRepo.save(
    permissionNames.map((name) => ({ name })),
  );

  const permMap = Object.fromEntries(
    permissions.map((perm) => [perm.name, perm]),
  );

  const viewerRole = await roleRepo.save({
    name: 'Viewer',
    permissions: [permMap['read']],
  });

  const adminRole = await roleRepo.save({
    name: 'Admin',
    permissions: [permMap['read'], permMap['create'], permMap['update']],
  });

  const ownerRole = await roleRepo.save({
    name: 'Owner',
    permissions,
  });

  const centralHospital = await orgRepo.save({
    name: 'Central Hospital',
    level: 1,
  });
  const radiology = await orgRepo.save({
    name: 'Radiology Department',
    level: 2,
    parent: centralHospital,
  });
  const clinicA = await orgRepo.save({
    name: 'Clinic A',
    level: 2,
    parent: centralHospital,
  });
  const pediatrics = await orgRepo.save({
    name: 'Pediatrics Unit',
    level: 2,
    parent: clinicA,
  });
  const labServices = await orgRepo.save({
    name: 'Laboratory Services',
    level: 2,
    parent: centralHospital,
  });

  const users = await userRepo.save([
    {
      user_id: 'uuid-owner-hospital',
      name: 'Owner - Hospital',
      email: 'owner@hospital.com',
      organization: centralHospital,
      role: ownerRole,
    },
    {
      user_id: 'uuid-admin-radiology',
      name: 'Admin - Radiology',
      email: 'admin@radiology.com',
      organization: radiology,
      role: adminRole,
    },
    {
      user_id: 'uuid-viewer-radiology',
      name: 'Viewer - Radiology',
      email: 'viewer@radiology.com',
      organization: radiology,
      role: viewerRole,
    },
    {
      user_id: 'uuid-admin-clinica',
      name: 'Admin - Clinic A',
      email: 'admin@clinica.com',
      organization: clinicA,
      role: adminRole,
    },
    {
      user_id: 'uuid-viewer-clinica',
      name: 'Viewer - Clinic A',
      email: 'viewer@clinica.com',
      organization: clinicA,
      role: viewerRole,
    },
    {
      user_id: 'uuid-admin-pediatrics',
      name: 'Admin - Pediatrics',
      email: 'admin@pediatrics.com',
      organization: pediatrics,
      role: adminRole,
    },
    {
      user_id: 'uuid-viewer-pediatrics',
      name: 'Viewer - Pediatrics',
      email: 'viewer@pediatrics.com',
      organization: pediatrics,
      role: viewerRole,
    },
    {
      user_id: 'uuid-admin-lab',
      name: 'Admin - Lab',
      email: 'admin@lab.com',
      organization: labServices,
      role: adminRole,
    },
    {
      user_id: 'uuid-viewer-lab',
      name: 'Viewer - Lab',
      email: 'viewer@lab.com',
      organization: labServices,
      role: viewerRole,
    },
  ]);

  const resources = await resourceRepo.save([
    {
      resource_id: 'uuid-record-radiology-1',
      patient_name: 'Radiology Patient 1',
      patient_identifier: 'MRN-RAD-001',
      demographics: 'Male, 55',
      medical_history: 'MRI needed',
      prescriptions: 'None',
      appointments: '2025-05-01',
      organization: radiology,
      owner: users.find((u) => u.email === 'viewer@radiology.com'),
    },
    {
      resource_id: 'uuid-record-clinic-1',
      patient_name: 'Clinic Patient',
      patient_identifier: 'MRN-CLINIC-001',
      demographics: 'Female, 33',
      medical_history: 'Fever',
      prescriptions: 'Tylenol',
      appointments: '2025-05-02',
      organization: clinicA,
      owner: users.find((u) => u.email === 'admin@clinica.com'),
    },
    {
      resource_id: 'uuid-record-pediatrics-1',
      patient_name: 'Pediatrics Child',
      patient_identifier: 'MRN-PED-001',
      demographics: 'Female, 6',
      medical_history: 'Allergy',
      prescriptions: 'Antihistamine',
      appointments: '2025-05-03',
      organization: pediatrics,
      owner: users.find((u) => u.email === 'viewer@pediatrics.com'),
    },
    {
      resource_id: 'uuid-record-lab-1',
      patient_name: 'Lab Case 1',
      patient_identifier: 'MRN-LAB-001',
      demographics: 'Male, 40',
      medical_history: 'Blood work',
      prescriptions: 'N/A',
      appointments: '2025-05-04',
      organization: labServices,
      owner: users.find((u) => u.email === 'admin@lab.com'),
    },
    {
      resource_id: 'uuid-record-vip',
      patient_name: 'Hospital VIP',
      patient_identifier: 'MRN-VIP-001',
      demographics: 'Female, 60',
      medical_history: 'Surgery',
      prescriptions: 'Painkillers',
      appointments: '2025-05-05',
      organization: centralHospital,
      owner: users.find((u) => u.email === 'owner@hospital.com'),
    },
  ]);

  console.log('Seed complete!\n');

  users.forEach((u) =>
    console.log(`${u.role.name}: ${u.email} (${u.organization.name})`),
  );

  resources.forEach((r, idx) =>
    console.log(`Record ${idx + 1}: ${r.patient_name} (${r.resource_id})`),
  );

  await dataSource.destroy();
}

seed();
