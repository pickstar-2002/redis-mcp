import { RedisConnectionConfig, RedisOperationResult, RedisKeyValue, RedisHashField, RedisSortedSetMember, RedisKeyInfo } from '../types';
/**
 * Redis 服务类 - 提供 Redis 基础操作
 */
export declare class RedisService {
    private client;
    private config;
    private connected;
    constructor(config: RedisConnectionConfig);
    /**
     * 连接到 Redis 服务器
     */
    connect(): Promise<RedisOperationResult<string>>;
    /**
     * 断开 Redis 连接
     */
    disconnect(): Promise<RedisOperationResult<string>>;
    /**
     * 检查连接状态
     */
    private ensureConnection;
    /**
     * 执行 Redis 命令的包装方法
     */
    private executeCommand;
    /**
     * 设置字符串键值
     */
    set(key: string, value: string, expireSeconds?: number): Promise<RedisOperationResult<string>>;
    /**
     * 获取字符串值
     */
    get(key: string): Promise<RedisOperationResult<string | null>>;
    /**
     * 删除键
     */
    del(key: string | string[]): Promise<RedisOperationResult<number>>;
    /**
     * 递增数值
     */
    incr(key: string, increment?: number): Promise<RedisOperationResult<number>>;
    /**
     * 递减数值
     */
    decr(key: string, decrement?: number): Promise<RedisOperationResult<number>>;
    /**
     * 批量设置键值
     */
    mset(keyValues: RedisKeyValue[]): Promise<RedisOperationResult<string>>;
    /**
     * 批量获取键值
     */
    mget(keys: string[]): Promise<RedisOperationResult<(string | null)[]>>;
    /**
     * 设置哈希字段
     */
    hset(key: string, field: string, value: string): Promise<RedisOperationResult<number>>;
    /**
     * 批量设置哈希字段
     */
    hmset(key: string, fieldValues: RedisHashField[]): Promise<RedisOperationResult<number>>;
    /**
     * 获取哈希字段
     */
    hget(key: string, field: string): Promise<RedisOperationResult<string | null>>;
    /**
     * 获取所有哈希字段
     */
    hgetall(key: string): Promise<RedisOperationResult<Record<string, string>>>;
    /**
     * 删除哈希字段
     */
    hdel(key: string, fields: string | string[]): Promise<RedisOperationResult<number>>;
    /**
     * 左侧推入列表
     */
    lpush(key: string, values: string | string[]): Promise<RedisOperationResult<number>>;
    /**
     * 右侧推入列表
     */
    rpush(key: string, values: string | string[]): Promise<RedisOperationResult<number>>;
    /**
     * 左侧弹出列表
     */
    lpop(key: string, count?: number): Promise<RedisOperationResult<string | string[] | null>>;
    /**
     * 右侧弹出列表
     */
    rpop(key: string, count?: number): Promise<RedisOperationResult<string | string[] | null>>;
    /**
     * 获取列表范围
     */
    lrange(key: string, start: number, stop: number): Promise<RedisOperationResult<string[]>>;
    /**
     * 添加集合成员
     */
    sadd(key: string, members: string | string[]): Promise<RedisOperationResult<number>>;
    /**
     * 移除集合成员
     */
    srem(key: string, members: string | string[]): Promise<RedisOperationResult<number>>;
    /**
     * 获取集合所有成员
     */
    smembers(key: string): Promise<RedisOperationResult<string[]>>;
    /**
     * 添加有序集合成员
     */
    zadd(key: string, members: RedisSortedSetMember | RedisSortedSetMember[]): Promise<RedisOperationResult<number>>;
    /**
     * 移除有序集合成员
     */
    zrem(key: string, members: string | string[]): Promise<RedisOperationResult<number>>;
    /**
     * 获取有序集合范围
     */
    zrange(key: string, start: number, stop: number, withScores?: boolean): Promise<RedisOperationResult<string[] | Array<{
        value: string;
        score: number;
    }>>>;
    /**
     * 设置键过期时间
     */
    expire(key: string, seconds: number): Promise<RedisOperationResult<boolean>>;
    /**
     * 获取键过期时间
     */
    ttl(key: string): Promise<RedisOperationResult<number>>;
    /**
     * 查找匹配的键
     */
    keys(pattern: string): Promise<RedisOperationResult<string[]>>;
    /**
     * 获取键类型
     */
    type(key: string): Promise<RedisOperationResult<string>>;
    /**
     * 获取键信息
     */
    getKeyInfo(key: string): Promise<RedisOperationResult<RedisKeyInfo>>;
    /**
     * 批量删除匹配的键
     */
    deleteByPattern(pattern: string): Promise<RedisOperationResult<number>>;
    /**
     * 清空数据库
     */
    flushdb(): Promise<RedisOperationResult<string>>;
    /**
     * 清空所有数据库
     */
    flushAll(): Promise<RedisOperationResult<string>>;
}
