import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionMode, SessionModeSchema } from './schemas/session_mode.schema';

@Global()
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Session.name, schema: SessionSchema },
			{ name: SessionMode.name, schema: SessionModeSchema }
		]),
	],
	exports: [MongooseModule],
})
export class DatabaseModule { }
