import { RedisService } from './redisService';
import { RedisBackupOptions, RedisOperationResult, RedisRestoreOptions } from '../types';
/**
 * Redis 备份与恢复服务
 */
export declare class RedisBackupService {
    private redisService;
    constructor(redisService: RedisService);
    /**
     * 备份 Redis 数据
     */
    backup(options?: RedisBackupOptions): Promise<RedisOperationResult<string>>;
    /**
     * 从备份恢复 Redis 数据
     */
    restore(options: RedisRestoreOptions): Promise<RedisOperationResult<string>>;
}
