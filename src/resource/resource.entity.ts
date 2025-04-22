import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../organization/organization.entity';
import { User } from '../user/user.entity';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  resource_id: string;

  @Column({ length: 100 })
  patient_name: string;

  @Column({ length: 100, unique: true })
  patient_identifier: string;

  @Column({ type: 'text', nullable: true })
  demographics: string;

  @Column({ type: 'text', nullable: true })
  medical_history: string;

  @Column({ type: 'text', nullable: true })
  prescriptions: string;

  @Column({ type: 'text', nullable: true })
  appointments: string;

  @ManyToOne(() => Organization, (org) => org.resources, { eager: true })
  organization: Organization;

  @ManyToOne(() => User, { eager: true })
  owner: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
