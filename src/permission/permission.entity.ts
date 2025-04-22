import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from '../role/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  permission_id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
