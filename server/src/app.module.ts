import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { DatabaseModule } from './modules/mongoose/database.module';
import { CacheModule } from './modules/cache/cache.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SessionModule } from './modules/session/session.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			expandVariables: true,
		}),
		ScheduleModule.forRoot(),
		PrismaModule,
		DatabaseModule,
		CacheModule,
		AuthModule,
		UserModule,
		SessionModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
