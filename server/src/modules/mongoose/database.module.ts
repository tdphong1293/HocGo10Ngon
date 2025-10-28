import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionMode, SessionModeSchema } from './schemas/session_mode.schema';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				uri: configService.get<string>('MONGO_URL'),
			}),
			inject: [ConfigService],
		}),
		MongooseModule.forFeature([
			{ name: Session.name, schema: SessionSchema },
			{ name: SessionMode.name, schema: SessionModeSchema }
		]),
	],
	providers: [DatabaseService],
	exports: [MongooseModule, DatabaseService],
})
export class DatabaseModule { }
