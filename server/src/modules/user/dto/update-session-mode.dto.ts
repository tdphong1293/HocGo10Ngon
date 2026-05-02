import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateSessionModeDto {
    @IsString()
    @IsNotEmpty()
    modeName!: string;

    @IsObject()
    config!: Record<string, any>;

    @IsObject()
    @IsOptional()
    subConfig?: Record<string, any>;
}
