// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Organization } from '../organization/organization.entity';
import { Role } from '../role/role.entity';
import { Permission } from '../permission/permission.entity';
import { Resource } from '../resource/resource.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const dataSource = new DataSource({
          type: 'sqlite',
          database: 'rbac.sqlite',
          synchronize: true,
          logging: true,
          entities: [User, Organization, Role, Permission, Resource],
        });

        // Prevent recreating connection if it already exists
        if (!dataSource.isInitialized) {
          await dataSource.initialize();
        }

        return dataSource.options;
      },
    }),
  ],
})
export class DatabaseModule {}
