/**
 * Redis 缓存示例
 * 
 * 这个示例展示了如何使用 Redis 作为缓存系统
 */

import { RedisService } from '../services/redisService';

// 模拟数据库查询函数
async function queryDatabase(userId: string): Promise<any> {
  console.log(`从数据库查询用户 ${userId} 的数据...`);
  
  // 模拟数据库查询延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 返回模拟数据
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    createdAt: new Date().toISOString()
  };
}

// 使用 Redis 缓存的用户数据获取函数
async function getUserWithCache(redisService: RedisService, userId: string): Promise<any> {
  // 缓存键
  const cacheKey = `user:${userId}`;
  
  // 尝试从缓存获取
  const cachedResult = await redisService.get(cacheKey);
  
  if (cachedResult.success && cachedResult.data) {
    console.log(`从缓存获取用户 ${userId} 的数据`);
    return JSON.parse(cachedResult.data);
  }
  
  // 缓存未命中，从数据库查询
  console.log(`缓存未命中，查询数据库...`);
  const userData = await queryDatabase(userId);
  
  // 将结果存入缓存，设置 30 分钟过期
  await redisService.set(cacheKey, JSON.stringify(userData), 1800);
  
  return userData;
}

// 示例使用
async function runCacheExample() {
  // 创建 Redis 服务
  const redisService = new RedisService({
    host: 'localhost',
    port: 6379
  });
  
  try {
    // 连接到 Redis
    await redisService.connect();
    
    // 第一次获取用户数据（从数据库）
    console.log('第一次获取用户数据:');
    const user1 = await getUserWithCache(redisService, '123');
    console.log(user1);
    
    // 第二次获取相同用户数据（从缓存）
    console.log('\n第二次获取相同用户数据:');
    const user2 = await getUserWithCache(redisService, '123');
    console.log(user2);
    
    // 获取不同用户数据（从数据库）
    console.log('\n获取不同用户数据:');
    const user3 = await getUserWithCache(redisService, '456');
    console.log(user3);
    
    // 清除缓存
    console.log('\n清除缓存:');
    await redisService.del('user:123');
    console.log('已清除用户 123 的缓存');
    
    // 再次获取用户数据（从数据库）
    console.log('\n清除缓存后再次获取用户数据:');
    const user4 = await getUserWithCache(redisService, '123');
    console.log(user4);
  } catch (error) {
    console.error('缓存示例运行失败:', error);
  } finally {
    // 断开连接
    await redisService.disconnect();
  }
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  runCacheExample()
    .then(() => console.log('缓存示例运行完成'))
    .catch(console.error);
}

export { runCacheExample };