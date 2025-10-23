import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';

@Global()
@Module({
    imports: [
        NestCacheModule.registerAsync({
            isGlobal: true,
            useFactory: async (configService: ConfigService) => {
                return {
                    stores: [
                        new KeyvRedis(configService.get<string>('REDIS_URL')),
                    ],
                };
            },
            inject: [ConfigService],
        })
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule { }