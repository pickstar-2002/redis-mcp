/**
 * Redis MCP 类型定义
 */

// Redis 连接配置
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

// Redis 操作结果
export interface RedisOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Redis 键值对
export interface RedisKeyValue {
  key: string;
  value: string;
}

// Redis Hash 字段值对
export interface RedisHashField {
  field: string;
  value: string;
}

// Redis 排序集合成员
export interface RedisSortedSetMember {
  member: string;
  score: number;
}

// Redis 键信息
export interface RedisKeyInfo {
  key: string;
  type: string;
  ttl: number;
  size?: number;
}

// Redis 备份选项
export interface RedisBackupOptions {
  filename?: string;
  path?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
}

// Redis 恢复选项
export interface RedisRestoreOptions {
  filename: string;
  path?: string;
  flushBeforeRestore?: boolean;
}

// MCP 工具定义
export interface RedisMCPTool {
  name: string;
  description: string;
  inputSchema: object;
}