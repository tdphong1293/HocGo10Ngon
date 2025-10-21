import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from './modules/prisma/prisma.module';
import { DatabaseModule } from './modules/mongoose/database.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
		CacheModule.registerAsync({
			isGlobal: true,
			useFactory: async (configService: ConfigService) => {
				return {
					stores: [
						new KeyvRedis(configService.get<string>('REDIS_URL')),
					],
				};
			},
			inject: [ConfigService],
		}),
		PrismaModule,
		DatabaseModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
