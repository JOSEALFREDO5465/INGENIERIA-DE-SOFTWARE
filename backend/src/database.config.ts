import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from './modules/users/entities/user.entity';
import { MemberEntity } from './modules/members/entities/member.entity';
import { MinistryEntity } from './modules/ministries/entities/ministry.entity';
import { GroupEntity } from './modules/groups/entities/group.entity';
import { InventoryEntity } from './modules/inventory/entities/inventory.entity';
import { ActivityEntity } from './modules/activities/entities/activity.entity';
import { EconomicMovementEntity } from './modules/economic/entities/economic-movement.entity';

dotenv.config();

export const getDatabaseConfig = (): any => {
  const dbHost = process.env.DB_HOST || process.env.DB_HOSTNAME || 'localhost';
  const dbUser = process.env.DB_USER || process.env.DB_USERNAME || 'root';
  const dbPass = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || process.env.DB_DATABASE || 'IglesiaFiladelfia';
  const hasMysql = !!dbHost && !!dbUser && !!dbName;

  const entities = [
    UserEntity,
    MemberEntity,
    MinistryEntity,
    GroupEntity,
    InventoryEntity,
    ActivityEntity,
    EconomicMovementEntity,
  ];

  if (hasMysql) {
    console.log('--- Connecting to MySQL Database at', dbHost);
    return {
      type: 'mysql',
      host: dbHost,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: dbUser,
      password: dbPass,
      database: dbName,
      entities,
      synchronize: false,
    };
  } else {
    console.log('--- MySQL not configured. Using SQLite fallback for local execution...');
    return {
      type: 'sqlite',
      database: 'database.sqlite',
      entities,
      synchronize: false,
    };
  }
};
