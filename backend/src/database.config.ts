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
  // Soporte para Supabase (PostgreSQL)
  // Opción 1: URL de conexión completa
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  const entities = [
    UserEntity,
    MemberEntity,
    MinistryEntity,
    GroupEntity,
    InventoryEntity,
    ActivityEntity,
    EconomicMovementEntity,
  ];

  if (databaseUrl) {
    console.log('--- Connecting to PostgreSQL via DATABASE_URL...');
    const isPooler = databaseUrl.includes('pooler.supabase.com') || databaseUrl.includes('pgbouncer=true');
    return {
      type: 'postgres',
      url: databaseUrl,
      entities,
      synchronize: false,
      ssl: { rejectUnauthorized: false },
      // pgbouncer (transaction mode) no soporta prepared statements
      extra: isPooler
        ? {
            max: 10,
            idleTimeoutMillis: 30000,
            // Deshabilitar prepared statements para pgbouncer (transaction mode)
            prepare: false,
          }
        : {
            max: 10,
            idleTimeoutMillis: 30000,
          },
    };
  }

  // Opción 2: Parámetros individuales (Supabase o PostgreSQL local)
  const dbHost = process.env.DB_HOST || process.env.SUPABASE_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  const dbUser = process.env.DB_USER || process.env.SUPABASE_USER || 'postgres';
  const dbPass = process.env.DB_PASSWORD || process.env.SUPABASE_PASSWORD || '';
  const dbName = process.env.DB_NAME || process.env.SUPABASE_DB_NAME || 'postgres';

  console.log('--- Connecting to PostgreSQL at', dbHost, ':', dbPort);

  return {
    type: 'postgres',
    host: dbHost,
    port: dbPort,
    username: dbUser,
    password: dbPass,
    database: dbName,
    entities,
    synchronize: false,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    extra: {
      max: 10,
      idleTimeoutMillis: 30000,
    },
  };
};
