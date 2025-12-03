import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SessionDocument } from './schemas/session.schema';
import { SessionModeDocument, SessionMode } from './schemas/session_mode.schema';

@Injectable()
export class DatabaseService {
    constructor(
        @InjectModel('Session') private sessionModel: Model<SessionDocument>,
        @InjectModel('SessionMode') private sessionModeModel: Model<SessionModeDocument>,
    ) { }

    async seedSessionModes(modes: SessionMode[], truncate: boolean = false): Promise<void> {
        try {
            console.log('Seeding session modes...');
            if (truncate) {
                await this.sessionModeModel.deleteMany({});
            }
            const count = await this.sessionModeModel.countDocuments();
            if (count > 0) {
                console.log('Session modes already exist. Skipping seeding.');
                return;
            }
            await this.sessionModeModel.insertMany(modes);
            console.log('Session modes seeded successfully.');
        } catch (error) {
            console.error('Error seeding session modes:', error);
        }
    }
}