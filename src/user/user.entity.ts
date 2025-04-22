import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../organization/organization.entity';
import { Role } from '../role/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, unique: true })
  email: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Organization, (org) => org.users, { eager: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;
}
