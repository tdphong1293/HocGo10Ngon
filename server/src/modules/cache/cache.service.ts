import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async get(key: string): Promise<any> {
        return this.cacheManager.get(key);
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        await this.cacheManager.set(key, value, ttl);
    }

    async del(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }

    async ttl(key: string): Promise<number | undefined> {
        return await this.cacheManager.ttl(key);
    }
}
