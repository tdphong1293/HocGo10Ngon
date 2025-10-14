import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SessionModeDocument = HydratedDocument<SessionMode>;

@Schema({
    timestamps: true,
    collection: 'session_modes'
})
export class SessionMode {
    @Prop({ required: true, unique: true, lowercase: true })
    modeName: string;

    @Prop({ type: Object, default: {} })
    config: Record<string, any>;

    @Prop({ type: Object, default: {} })
    subConfig: Record<string, any>;
}

export const SessionModeSchema = SchemaFactory.createForClass(SessionMode);