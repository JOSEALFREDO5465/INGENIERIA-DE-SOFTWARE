import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { MinistriesModule } from './modules/ministries/ministries.module';
import { GroupsModule } from './modules/groups/groups.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    UsersModule,
    AuthModule,
    MembersModule,
    MinistriesModule,
    GroupsModule,
    InventoryModule,
    ActivitiesModule,
    DashboardModule,
  ],
})
export class AppModule {}
