import { RedisMCPService } from './services/mcpService';

/**
 * Redis MCP 主入口
 */
async function main() {
  try {
    // 创建 Redis MCP 服务
    const redisMCP = new RedisMCPService();
    
    // 获取端口号（默认为 3000）
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    
    // 启动服务
    await redisMCP.start(port);
    
    // 处理进程退出
    const handleExit = async () => {
      console.log('Shutting down Redis MCP Server...');
      await redisMCP.stop();
      process.exit(0);
    };
    
    // 注册信号处理
    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
    
    console.log(`Redis MCP Server is running on port ${port}`);
    console.log('Press Ctrl+C to stop the server');
  } catch (error) {
    console.error('Failed to start Redis MCP Server:', error);
    process.exit(1);
  }
}

// 启动服务
main();