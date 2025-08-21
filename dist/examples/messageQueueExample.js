"use strict";
/**
 * Redis 消息队列示例
 *
 * 这个示例展示了如何使用 Redis 的列表实现简单的消息队列功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMessageQueueExample = runMessageQueueExample;
const redisService_1 = require("../services/redisService");
// 消息队列类
class MessageQueue {
    constructor(redisService, queueName) {
        this.redisService = redisService;
        this.queueKey = `queue:${queueName}`;
    }
    // 发送消息到队列
    async sendMessage(message) {
        const result = await this.redisService.rpush(this.queueKey, message);
        return result.success && result.data !== undefined;
    }
    // 批量发送消息
    async sendMessages(messages) {
        const result = await this.redisService.rpush(this.queueKey, messages);
        return result.success && result.data !== undefined;
    }
    // 接收消息（阻塞方式）
    async receiveMessage() {
        const result = await this.redisService.lpop(this.queueKey);
        if (!result.success || !result.data) {
            return null;
        }
        return typeof result.data === 'string' ? result.data : null;
    }
    // 批量接收消息
    async receiveMessages(count) {
        const result = await this.redisService.lpop(this.queueKey, count);
        if (!result.success || !result.data) {
            return [];
        }
        return Array.isArray(result.data) ? result.data : [result.data];
    }
    // 查看队列中的消息（不消费）
    async peekMessages(start = 0, end = -1) {
        const result = await this.redisService.lrange(this.queueKey, start, end);
        if (!result.success || !result.data) {
            return [];
        }
        return result.data;
    }
    // 获取队列长度
    async getLength() {
        const result = await this.redisService.lrange(this.queueKey, 0, -1);
        if (!result.success || !result.data) {
            return 0;
        }
        return result.data.length;
    }
    // 清空队列
    async clear() {
        const result = await this.redisService.del(this.queueKey);
        return result.success && result.data !== undefined;
    }
}
// 示例使用
async function runMessageQueueExample() {
    // 创建 Redis 服务
    const redisService = new redisService_1.RedisService({
        host: 'localhost',
        port: 6379
    });
    try {
        // 连接到 Redis
        await redisService.connect();
        // 创建消息队列
        const taskQueue = new MessageQueue(redisService, 'tasks');
        // 清空队列（确保从空队列开始）
        await taskQueue.clear();
        // 生产者：发送一些消息
        console.log('生产者：发送消息到队列...');
        await taskQueue.sendMessage('任务1：处理用户数据');
        await taskQueue.sendMessage('任务2：生成报表');
        await taskQueue.sendMessages([
            '任务3：备份数据库',
            '任务4：清理缓存',
            '任务5：发送通知'
        ]);
        // 查看队列长度
        const queueLength = await taskQueue.getLength();
        console.log(`队列中有 ${queueLength} 条消息`);
        // 查看队列中的所有消息（不消费）
        console.log('\n查看队列中的所有消息:');
        const allMessages = await taskQueue.peekMessages();
        allMessages.forEach((msg, index) => {
            console.log(`[${index}] ${msg}`);
        });
        // 消费者：接收并处理消息
        console.log('\n消费者：接收并处理消息...');
        // 接收单条消息
        const message1 = await taskQueue.receiveMessage();
        console.log(`处理消息: ${message1}`);
        // 批量接收消息
        const messages = await taskQueue.receiveMessages(2);
        console.log('批量处理消息:');
        messages.forEach(msg => {
            console.log(`- ${msg}`);
        });
        // 查看剩余消息
        console.log('\n剩余消息:');
        const remainingMessages = await taskQueue.peekMessages();
        remainingMessages.forEach((msg, index) => {
            console.log(`[${index}] ${msg}`);
        });
        // 消费剩余所有消息
        console.log('\n消费剩余所有消息:');
        const remainingCount = remainingMessages.length;
        const finalMessages = await taskQueue.receiveMessages(remainingCount);
        finalMessages.forEach(msg => {
            console.log(`- ${msg}`);
        });
        // 确认队列为空
        const finalLength = await taskQueue.getLength();
        console.log(`\n队列现在有 ${finalLength} 条消息`);
    }
    catch (error) {
        console.error('消息队列示例运行失败:', error);
    }
    finally {
        // 断开连接
        await redisService.disconnect();
    }
}
// 如果直接运行此文件，则执行示例
if (require.main === module) {
    runMessageQueueExample()
        .then(() => console.log('消息队列示例运行完成'))
        .catch(console.error);
}
