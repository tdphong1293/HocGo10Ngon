import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

interface KeystrokeData {
    key: string;
    timestamp: number;
    isCorrect: boolean;
    deltaTime?: number;
}

export enum SessionType {
    PRACTICE = 'PRACTICE',
    LESSON = 'LESSON',
}

export enum LessonType {
    PRACTICE = 'PRACTICE',
    KEY_LESSON = 'KEY_LESSON',
}

@Schema({
    timestamps: true,
    collection: 'sessions'
})
export class Session {
    @Prop({ required: true })
    userid: string;

    @Prop({
        required: true,
        enum: Object.values(SessionType)
    })
    sessionType: SessionType;

    
    @Prop({
        enum: Object.values(LessonType)
    })
    @IsOptional()
    lessonType?: LessonType;

    @Prop({ required: true })
    languageCode: string;

    @Prop()
    lessonid: string;

    @Prop()
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
        timestamp: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        deltaTime: { type: Number }
    }])
    keystrokes: KeystrokeData[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);