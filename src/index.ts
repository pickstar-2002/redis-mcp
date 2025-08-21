#!/usr/bin/env node

import { RedisMCPService } from './services/mcpService.js';
import { RedisConnectionConfig } from './types/index.js';

/**
 * 解析命令行参数
 */
function parseArgs(): Partial<RedisConnectionConfig> {
  const args = process.argv.slice(2);
  const config: Partial<RedisConnectionConfig> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    switch (arg) {
      case '--host':
        if (nextArg) config.host = nextArg;
        i++;
        break;
      case '--port':
        if (nextArg) config.port = parseInt(nextArg, 10);
        i++;
        break;
      case '--username':
        if (nextArg) config.username = nextArg;
        i++;
        break;
      case '--password':
        if (nextArg) config.password = nextArg;
        i++;
        break;
      case '--db':
        if (nextArg) config.db = parseInt(nextArg, 10);
        i++;
        break;
      case '--tls':
        config.tls = true;
        break;
    }
  }
  
  return config;
}

/**
 * Redis MCP 主入口
 */
async function main() {
  try {
    // 解析命令行参数
    const defaultConfig = parseArgs();
    
    // 创建 Redis MCP 服务
    const redisMCP = new RedisMCPService(defaultConfig);
    
    // 启动服务
    await redisMCP.start();
    
    // 处理进程退出
    const handleExit = async () => {
      console.error('Shutting down Redis MCP Server...');
      await redisMCP.stop();
      process.exit(0);
    };
    
    // 注册信号处理
    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
    
    // 输出启动信息到 stderr（避免干扰 MCP 通信）
    console.error('Redis MCP Server is running');
    if (defaultConfig.host || defaultConfig.port) {
      console.error(`Default Redis connection: ${defaultConfig.host || 'localhost'}:${defaultConfig.port || 6379}`);
    }
  } catch (error) {
    console.error('Failed to start Redis MCP Server:', error);
    process.exit(1);
  }
}

// 启动服务
main();
