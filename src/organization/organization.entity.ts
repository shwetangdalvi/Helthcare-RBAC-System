import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Resource } from '../resource/resource.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  organization_id: number;

  @Column({ length: 50 })
  name: string;

  @Column()
  level: number;

  @ManyToOne(() => Organization, (org) => org.children, { nullable: true })
  parent: Organization;

  @OneToMany(() => Organization, (org) => org.parent)
  children: Organization[];

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Resource, (resource) => resource.organization)
  resources: Resource[];
}
