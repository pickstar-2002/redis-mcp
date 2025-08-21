/**
 * Redis MCP 类型定义
 */
export interface RedisConnectionConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
    db?: number;
    tls?: boolean;
    connectTimeout?: number;
    maxRetriesPerRequest?: number;
}
export interface RedisOperationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}
export interface RedisKeyValue {
    key: string;
    value: string;
}
export interface RedisHashField {
    field: string;
    value: string;
}
export interface RedisSortedSetMember {
    member: string;
    score: number;
}
export interface RedisKeyInfo {
    key: string;
    type: string;
    ttl: number;
    size?: number;
}
export interface RedisBackupOptions {
    filename?: string;
    path?: string;
    includePatterns?: string[];
    excludePatterns?: string[];
}
export interface RedisRestoreOptions {
    filename: string;
    path?: string;
    flushBeforeRestore?: boolean;
}
export interface RedisMCPTool {
    name: string;
    description: string;
    inputSchema: object;
}
