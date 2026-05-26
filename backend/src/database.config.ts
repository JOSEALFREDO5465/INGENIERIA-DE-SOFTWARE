import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from './modules/users/entities/user.entity';
import { MemberEntity } from './modules/members/entities/member.entity';
import { MinistryEntity } from './modules/ministries/entities/ministry.entity';
import { GroupEntity } from './modules/groups/entities/group.entity';
import { InventoryEntity } from './modules/inventory/entities/inventory.entity';
import { ActivityEntity } from './modules/activities/entities/activity.entity';

dotenv.config();

export const getDatabaseConfig = (): any => {
  const hasMysql = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

  const entities = [
    UserEntity,
    MemberEntity,
    MinistryEntity,
    GroupEntity,
    InventoryEntity,
    ActivityEntity,
  ];

  if (hasMysql) {
    console.log('--- Connecting to MySQL Database at', process.env.DB_HOST);
    return {
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities,
      synchronize: true, // Automatically synchronize schema in development / production
    };
  } else {
    console.log('--- Using SQLite fallback for secure local execution...');
    return {
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities,
      synchronize: true,
    };
  }
};
