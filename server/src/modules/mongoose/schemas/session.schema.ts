import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

interface KeystrokeData {
    key: string;
    timestamp: number;
}

@Schema({
    timestamps: true,
    collection: 'sessions'
})
export class Session {
    @Prop({ required: true, unique: true })
    sessionid: string;

    @Prop({ required: true })
    userid: string;

    @Prop({ required: true })
    languageid: string;

    @Prop({ required: true })
    modeName: string;

    @Prop({ type: Object, default: {} })
    usedConfig: Record<string, any>;

    @Prop({ type: Object, default: {} })
    usedSubConfig: Record<string, any>;

    @Prop()
    CPM: number;

    @Prop()
    WPM: number;

    @Prop()
    accuracy: number;

    @Prop()
    errorCount: number;

    @Prop()
    duration: number;

    @Prop()
    rawInput: string;

    @Prop([{
        key: { type: String, required: true },
        timestamp: { type: Number, required: true }
    }])
    keystrokes: KeystrokeData[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);