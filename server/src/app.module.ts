import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from './modules/prisma/prisma.module';
import { DatabaseModule } from './modules/mongoose/database.module';
import { CacheModule } from './modules/cache/cache.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			expandVariables: true,
		}),
		MongooseModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				uri: configService.get<string>('MONGO_URL'),
			}),
			inject: [ConfigService],
		}),
		PrismaModule,
		DatabaseModule,
		CacheModule,
		AuthModule,
		UserModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
