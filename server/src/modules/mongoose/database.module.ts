import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
	imports: [
		MongooseModule.forFeature([
			// Add your schemas here, e.g. { name: 'User', schema: UserSchema }
		]),
	],
	exports: [MongooseModule],
})
export class DatabaseModule { }
