/**
 * Redis MCP 服务类 - 提供 MCP 协议接口
 */
export declare class RedisMCPService {
    private server;
    private redisService;
    private backupService;
    constructor();
    /**
     * 启动 MCP 服务器
     */
    start(): Promise<void>;
    /**
     * 停止 MCP 服务器
     */
    stop(): Promise<void>;
    /**
     * 设置工具处理器
     */
    private setupToolHandlers;
    /**
     * 设置错误处理
     */
    private setupErrorHandling;
    /**
     * 检查 Redis 连接
     */
    private ensureRedisConnection;
    /**
     * 连接到 Redis
     */
    private handleConnectRedis;
    /**
     * 断开 Redis 连接
     */
    private handleDisconnectRedis;
    /**
     * 设置字符串值
     */
    private handleStringSet;
    /**
     * 获取字符串值
     */
    private handleStringGet;
    /**
     * 递增数值
     */
    private handleStringIncr;
    /**
     * 递减数值
     */
    private handleStringDecr;
    /**
     * 批量设置键值
     */
    private handleStringMset;
    /**
     * 批量获取键值
     */
    private handleStringMget;
    /**
     * 设置哈希字段
     */
    private handleHashSet;
    /**
     * 批量设置哈希字段
     */
    private handleHashMset;
    /**
     * 获取哈希字段
     */
    private handleHashGet;
    /**
     * 获取所有哈希字段
     */
    private handleHashGetall;
    /**
     * 删除哈希字段
     */
    private handleHashDel;
    /**
     * 左侧推入列表
     */
    private handleListLpush;
    /**
     * 右侧推入列表
     */
    private handleListRpush;
    /**
     * 左侧弹出列表
     */
    private handleListLpop;
    /**
     * 右侧弹出列表
     */
    private handleListRpop;
    /**
     * 获取列表范围
     */
    private handleListRange;
    /**
     * 添加集合成员
     */
    private handleSetAdd;
    /**
     * 移除集合成员
     */
    private handleSetRemove;
    /**
     * 获取集合所有成员
     */
    private handleSetMembers;
    /**
     * 添加有序集合成员
     */
    private handleZsetAdd;
    /**
     * 移除有序集合成员
     */
    private handleZsetRemove;
    /**
     * 获取有序集合范围
     */
    private handleZsetRange;
    /**
     * 删除键
     */
    private handleKeyDelete;
    /**
     * 设置键过期时间
     */
    private handleKeyExpire;
    /**
     * 获取键过期时间
     */
    private handleKeyTtl;
    /**
     * 查找匹配的键
     */
    private handleKeySearch;
    /**
     * 获取键类型
     */
    private handleKeyType;
    /**
     * 获取键信息
     */
    private handleKeyInfo;
    /**
     * 批量删除匹配的键
     */
    private handleKeyDeletePattern;
    /**
     * 清空当前数据库
     */
    private handleDbFlush;
    /**
     * 创建备份
     */
    private handleBackupCreate;
    /**
     * 恢复备份
     */
    private handleBackupRestore;
}
