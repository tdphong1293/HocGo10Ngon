import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserSessionModeDocument = HydratedDocument<UserSessionMode>;

@Schema({
    timestamps: true,
    collection: 'user_session_modes'
})
export class UserSessionMode {
    @Prop({ required: true, unique: true })
    userid: string;

    @Prop({ required: true, lowercase: true })
    modeName: string;

    @Prop({ type: Object, default: {} })
    config: Record<string, any>;

    @Prop({ type: Object, default: {} })
    subConfig?: Record<string, any>;
}

export const UserSessionModeSchema = SchemaFactory.createForClass(UserSessionMode);