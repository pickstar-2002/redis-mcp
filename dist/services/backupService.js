"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisBackupService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Redis 备份与恢复服务
 */
class RedisBackupService {
    constructor(redisService) {
        this.redisService = redisService;
    }
    /**
     * 备份 Redis 数据
     */
    async backup(options = {}) {
        try {
            // 设置默认选项
            const filename = options.filename || `redis-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            const backupPath = options.path || './backups';
            const includePatterns = options.includePatterns || ['*'];
            const excludePatterns = options.excludePatterns || [];
            // 确保备份目录存在
            if (!fs_1.default.existsSync(backupPath)) {
                fs_1.default.mkdirSync(backupPath, { recursive: true });
            }
            const fullPath = path_1.default.join(backupPath, filename);
            const backupData = {};
            // 处理包含的模式
            for (const pattern of includePatterns) {
                // 获取匹配的键
                const keysResult = await this.redisService.keys(pattern);
                if (!keysResult.success || !keysResult.data) {
                    continue;
                }
                const keys = keysResult.data;
                // 过滤排除的键
                const filteredKeys = keys.filter(key => {
                    return !excludePatterns.some(excludePattern => {
                        // 支持简单的通配符匹配
                        const regexPattern = excludePattern
                            .replace(/\*/g, '.*')
                            .replace(/\?/g, '.');
                        return new RegExp(`^${regexPattern}$`).test(key);
                    });
                });
                // 处理每个键
                for (const key of filteredKeys) {
                    const typeResult = await this.redisService.type(key);
                    if (!typeResult.success || !typeResult.data) {
                        continue;
                    }
                    const type = typeResult.data;
                    const ttlResult = await this.redisService.ttl(key);
                    const ttl = ttlResult.success ? ttlResult.data : -1;
                    // 根据类型获取数据
                    switch (type) {
                        case 'string': {
                            const valueResult = await this.redisService.get(key);
                            if (valueResult.success && valueResult.data !== null) {
                                backupData[key] = {
                                    type,
                                    ttl,
                                    value: valueResult.data
                                };
                            }
                            break;
                        }
                        case 'hash': {
                            const valueResult = await this.redisService.hgetall(key);
                            if (valueResult.success && valueResult.data) {
                                backupData[key] = {
                                    type,
                                    ttl,
                                    value: valueResult.data
                                };
                            }
                            break;
                        }
                        case 'list': {
                            const valueResult = await this.redisService.lrange(key, 0, -1);
                            if (valueResult.success && valueResult.data) {
                                backupData[key] = {
                                    type,
                                    ttl,
                                    value: valueResult.data
                                };
                            }
                            break;
                        }
                        case 'set': {
                            const valueResult = await this.redisService.smembers(key);
                            if (valueResult.success && valueResult.data) {
                                backupData[key] = {
                                    type,
                                    ttl,
                                    value: valueResult.data
                                };
                            }
                            break;
                        }
                        case 'zset': {
                            const valueResult = await this.redisService.zrange(key, 0, -1, true);
                            if (valueResult.success && valueResult.data) {
                                backupData[key] = {
                                    type,
                                    ttl,
                                    value: valueResult.data
                                };
                            }
                            break;
                        }
                    }
                }
            }
            // 写入备份文件
            fs_1.default.writeFileSync(fullPath, JSON.stringify(backupData, null, 2));
            return {
                success: true,
                data: `Backup completed successfully. Saved to ${fullPath}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Backup failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * 从备份恢复 Redis 数据
     */
    async restore(options) {
        try {
            const { filename, path: restorePath = './backups', flushBeforeRestore = false } = options;
            const fullPath = path_1.default.join(restorePath, filename);
            // 检查文件是否存在
            if (!fs_1.default.existsSync(fullPath)) {
                return {
                    success: false,
                    error: `Backup file not found: ${fullPath}`
                };
            }
            // 读取备份文件
            const backupContent = fs_1.default.readFileSync(fullPath, 'utf8');
            const backupData = JSON.parse(backupContent);
            // 如果需要，先清空数据库
            if (flushBeforeRestore) {
                const flushResult = await this.redisService.flushDb();
                if (!flushResult.success) {
                    return {
                        success: false,
                        error: `Failed to flush database before restore: ${flushResult.error}`
                    };
                }
            }
            // 恢复每个键
            for (const [key, data] of Object.entries(backupData)) {
                const { type, ttl, value } = data;
                // 根据类型恢复数据
                switch (type) {
                    case 'string': {
                        await this.redisService.set(key, value);
                        break;
                    }
                    case 'hash': {
                        const fields = Object.entries(value).map(([field, val]) => ({
                            field,
                            value: val
                        }));
                        await this.redisService.hmset(key, fields);
                        break;
                    }
                    case 'list': {
                        // 先删除可能存在的键，以避免追加到现有列表
                        await this.redisService.del(key);
                        if (Array.isArray(value) && value.length > 0) {
                            await this.redisService.rpush(key, value);
                        }
                        break;
                    }
                    case 'set': {
                        if (Array.isArray(value) && value.length > 0) {
                            await this.redisService.sadd(key, value);
                        }
                        break;
                    }
                    case 'zset': {
                        if (Array.isArray(value) && value.length > 0) {
                            const members = value.map((item) => ({
                                member: item.value,
                                score: item.score
                            }));
                            await this.redisService.zadd(key, members);
                        }
                        break;
                    }
                }
                // 设置过期时间（如果有）
                if (ttl > 0) {
                    await this.redisService.expire(key, ttl);
                }
            }
            return {
                success: true,
                data: `Restore completed successfully from ${fullPath}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Restore failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}
exports.RedisBackupService = RedisBackupService;
