import { createClient, RedisClientType } from 'redis';
import { 
  RedisConnectionConfig, 
  RedisOperationResult,
  RedisKeyValue,
  RedisHashField,
  RedisSortedSetMember,
  RedisKeyInfo
} from '../types';

/**
 * Redis 服务类 - 提供 Redis 基础操作
 */
export class RedisService {
  private client: RedisClientType | null = null;
  private config: RedisConnectionConfig;
  private connected: boolean = false;

  constructor(config: RedisConnectionConfig) {
    this.config = config;
  }

  /**
   * 连接到 Redis 服务器
   */
  async connect(): Promise<RedisOperationResult<string>> {
    try {
      if (this.connected && this.client) {
        return { success: true, data: 'Already connected' };
      }

      const { host, port, username, password, db, tls } = this.config;
      
      this.client = createClient({
        socket: {
          host,
          port,
          tls: tls ? true : false,
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
        },
        username: username || undefined,
        password: password || undefined,
        database: db || 0
      });

      // 设置错误处理
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.client.connect();
      this.connected = true;
      return { success: true, data: 'Connected to Redis server' };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to connect to Redis: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * 断开 Redis 连接
   */
  async disconnect(): Promise<RedisOperationResult<string>> {
    try {
      if (!this.connected || !this.client) {
        return { success: true, data: 'Not connected' };
      }

      await this.client.disconnect();
      this.connected = false;
      return { success: true, data: 'Disconnected from Redis server' };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to disconnect: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * 检查连接状态
   */
  private async ensureConnection(): Promise<void> {
    if (!this.connected || !this.client) {
      await this.connect();
      if (!this.connected || !this.client) {
        throw new Error('Not connected to Redis server');
      }
    }
  }

  /**
   * 执行 Redis 命令的包装方法
   */
  private async executeCommand<T>(command: () => Promise<T>): Promise<RedisOperationResult<T>> {
    try {
      await this.ensureConnection();
      const result = await command();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: `Redis operation failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  // ========== String 操作 ==========

  /**
   * 设置字符串键值
   */
  async set(key: string, value: string, expireSeconds?: number): Promise<RedisOperationResult<string>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (expireSeconds !== undefined) {
        return await this.client.set(key, value, { EX: expireSeconds });
      } else {
        return await this.client.set(key, value);
      }
    });
  }

  /**
   * 获取字符串值
   */
  async get(key: string): Promise<RedisOperationResult<string | null>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      const result = await this.client.get(key);
      return result;
    });
  }

  /**
   * 删除键
   */
  async del(key: string | string[]): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (Array.isArray(key)) {
        return await this.client.del(key);
      } else {
        return await this.client.del(key);
      }
    });
  }

  /**
   * 递增数值
   */
  async incr(key: string, increment: number = 1): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (increment === 1) {
        return await this.client.incr(key);
      } else {
        return await this.client.incrBy(key, increment);
      }
    });
  }

  /**
   * 递减数值
   */
  async decr(key: string, decrement: number = 1): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (decrement === 1) {
        return await this.client.decr(key);
      } else {
        return await this.client.decrBy(key, decrement);
      }
    });
  }

  /**
   * 批量设置键值
   */
  async mset(keyValues: RedisKeyValue[]): Promise<RedisOperationResult<string>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      const args: Record<string, string> = {};
      keyValues.forEach(kv => {
        args[kv.key] = kv.value;
      });
      
      return await this.client.mSet(args);
    });
  }

  /**
   * 批量获取键值
   */
  async mget(keys: string[]): Promise<RedisOperationResult<(string | null)[]>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      return await this.client.mGet(keys);
    });
  }

  // ========== Hash 操作 ==========

  /**
   * 设置哈希字段
   */
  async hset(key: string, field: string, value: string): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      return await this.client.hSet(key, field, value);
    });
  }

  /**
   * 批量设置哈希字段
   */
  async hmset(key: string, fieldValues: RedisHashField[]): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      const fields: Record<string, string> = {};
      fieldValues.forEach(fv => {
        fields[fv.field] = fv.value;
      });
      
      return await this.client.hSet(key, fields);
    });
  }

  /**
   * 获取哈希字段
   */
  async hget(key: string, field: string): Promise<RedisOperationResult<string | null>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      const result = await this.client.hGet(key, field);
      return result || null;
    });
  }

  /**
   * 获取所有哈希字段
   */
  async hgetall(key: string): Promise<RedisOperationResult<Record<string, string>>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      return await this.client.hGetAll(key);
    });
  }

  /**
   * 删除哈希字段
   */
  async hdel(key: string, fields: string | string[]): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (Array.isArray(fields)) {
        return await this.client.hDel(key, fields);
      } else {
        return await this.client.hDel(key, [fields]);
      }
    });
  }

  // ========== List 操作 ==========

  /**
   * 左侧推入列表
   */
  async lpush(key: string, values: string | string[]): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (Array.isArray(values)) {
        return await this.client.lPush(key, values);
      } else {
        return await this.client.lPush(key, values);
      }
    });
  }

  /**
   * 右侧推入列表
   */
  async rpush(key: string, values: string | string[]): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (Array.isArray(values)) {
        return await this.client.rPush(key, values);
      } else {
        return await this.client.rPush(key, values);
      }
    });
  }

  /**
   * 左侧弹出列表
   */
  async lpop(key: string, count?: number): Promise<RedisOperationResult<string | string[] | null>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (count !== undefined && count > 1) {
        return await this.client.lPopCount(key, count);
      } else {
        return await this.client.lPop(key);
      }
    });
  }

  /**
   * 右侧弹出列表
   */
  async rpop(key: string, count?: number): Promise<RedisOperationResult<string | string[] | null>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (count !== undefined && count > 1) {
        return await this.client.rPopCount(key, count);
      } else {
        return await this.client.rPop(key);
      }
    });
  }

  /**
   * 获取列表范围
   */
  async lrange(key: string, start: number, stop: number): Promise<RedisOperationResult<string[]>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      return await this.client.lRange(key, start, stop);
    });
  }

  // ========== Set 操作 ==========

  /**
   * 添加集合成员
   */
  async sadd(key: string, members: string | string[]): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (Array.isArray(members)) {
        return await this.client.sAdd(key, members);
      } else {
        return await this.client.sAdd(key, members);
      }
    });
  }

  /**
   * 移除集合成员
   */
  async srem(key: string, members: string | string[]): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (Array.isArray(members)) {
        return await this.client.sRem(key, members);
      } else {
        return await this.client.sRem(key, members);
      }
    });
  }

  /**
   * 获取集合所有成员
   */
  async smembers(key: string): Promise<RedisOperationResult<string[]>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      return await this.client.sMembers(key);
    });
  }

  // ========== Sorted Set 操作 ==========

  /**
   * 添加有序集合成员
   */
  async zadd(key: string, members: RedisSortedSetMember | RedisSortedSetMember[]): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (Array.isArray(members)) {
        const args: Array<{ score: number, value: string }> = members.map(m => ({
          score: m.score,
          value: m.member
        }));
        return await this.client.zAdd(key, args);
      } else {
        return await this.client.zAdd(key, { score: members.score, value: members.member });
      }
    });
  }

  /**
   * 移除有序集合成员
   */
  async zrem(key: string, members: string | string[]): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (Array.isArray(members)) {
        return await this.client.zRem(key, members);
      } else {
        return await this.client.zRem(key, members);
      }
    });
  }

  /**
   * 获取有序集合范围
   */
  async zrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<RedisOperationResult<string[] | Array<{ value: string, score: number }>
>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      if (withScores) {
        return await this.client.zRangeWithScores(key, start, stop);
      } else {
        return await this.client.zRange(key, start, stop);
      }
    });
  }

  // ========== 键管理操作 ==========

  /**
   * 设置键过期时间
   */
  async expire(key: string, seconds: number): Promise<RedisOperationResult<boolean>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      const result = await this.client.expire(key, seconds);
      return Boolean(result);
    });
  }

  /**
   * 获取键过期时间
   */
  async ttl(key: string): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      return await this.client.ttl(key);
    });
  }

  /**
   * 查找匹配的键
   */
  async keys(pattern: string): Promise<RedisOperationResult<string[]>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      return await this.client.keys(pattern);
    });
  }

  /**
   * 获取键类型
   */
  async type(key: string): Promise<RedisOperationResult<string>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      return await this.client.type(key);
    });
  }

  /**
   * 获取键信息
   */
  async getKeyInfo(key: string): Promise<RedisOperationResult<RedisKeyInfo>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      const [type, ttl] = await Promise.all([
        this.client.type(key),
        this.client.ttl(key)
      ]);
      
      return {
        key,
        type,
        ttl
      };
    });
  }

  /**
   * 批量删除匹配的键
   */
  async deleteByPattern(pattern: string): Promise<RedisOperationResult<number>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      
      return await this.client.del(keys);
    });
  }

  /**
   * 清空数据库
   */
  async flushdb(): Promise<RedisOperationResult<string>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      return await this.client.flushDb();
    });
  }

  /**
   * 清空所有数据库
   */
  async flushAll(): Promise<RedisOperationResult<string>> {
    return this.executeCommand(async () => {
      if (!this.client) throw new Error('Redis client not initialized');
      return await this.client.flushAll();
    });
  }
}