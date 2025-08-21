/**
 * Redis 排行榜示例
 * 
 * 这个示例展示了如何使用 Redis 的有序集合实现排行榜功能
 */

import { RedisService } from '../services/redisService';
import { RedisSortedSetMember } from '../types';

// 排行榜类
class Leaderboard {
  private redisService: RedisService;
  private leaderboardKey: string;
  
  constructor(redisService: RedisService, leaderboardName: string) {
    this.redisService = redisService;
    this.leaderboardKey = `leaderboard:${leaderboardName}`;
  }
  
  // 更新分数
  async updateScore(userId: string, score: number): Promise<boolean> {
    const result = await this.redisService.zadd(this.leaderboardKey, {
      member: userId,
      score
    });
    
    return result.success;
  }
  
  // 增加分数
  async incrementScore(userId: string, increment: number): Promise<number> {
    // 获取当前分数
    const currentScoreResult = await this.redisService.zrange(
      this.leaderboardKey,
      0,
      -1,
      true
    );
    
    if (!currentScoreResult.success) {
      throw new Error('Failed to get current score');
    }
    
    const scores = currentScoreResult.data as Array<{ value: string, score: number }>;
    const userScore = scores.find(item => item.value === userId);
    
    // 计算新分数
    const newScore = userScore ? userScore.score + increment : increment;
    
    // 更新分数
    await this.updateScore(userId, newScore);
    
    return newScore;
  }
  
  // 获取用户排名（从0开始）
  async getRank(userId: string): Promise<number | null> {
    const result = await this.redisService.zrange(
      this.leaderboardKey,
      0,
      -1,
      true
    );
    
    if (!result.success || !result.data) {
      return null;
    }
    
    const scores = result.data as Array<{ value: string, score: number }>;
    
    // 按分数降序排序
    scores.sort((a, b) => b.score - a.score);
    
    // 查找用户排名
    const index = scores.findIndex(item => item.value === userId);
    return index !== -1 ? index : null;
  }
  
  // 获取用户分数
  async getScore(userId: string): Promise<number | null> {
    const result = await this.redisService.zrange(
      this.leaderboardKey,
      0,
      -1,
      true
    );
    
    if (!result.success || !result.data) {
      return null;
    }
    
    const scores = result.data as Array<{ value: string, score: number }>;
    const userScore = scores.find(item => item.value === userId);
    
    return userScore ? userScore.score : null;
  }
  
  // 获取前N名
  async getTopN(n: number): Promise<Array<{ userId: string, score: number, rank: number }>> {
    const result = await this.redisService.zrange(
      this.leaderboardKey,
      0,
      -1,
      true
    );
    
    if (!result.success || !result.data) {
      return [];
    }
    
    const scores = result.data as Array<{ value: string, score: number }>;
    
    // 按分数降序排序
    scores.sort((a, b) => b.score - a.score);
    
    // 返回前N名
    return scores.slice(0, n).map((item, index) => ({
      userId: item.value,
      score: item.score,
      rank: index
    }));
  }
  
  // 重置排行榜
  async reset(): Promise<boolean> {
    const result = await this.redisService.del(this.leaderboardKey);
    return result.success;
  }
}

// 示例使用
async function runLeaderboardExample() {
  // 创建 Redis 服务
  const redisService = new RedisService({
    host: 'localhost',
    port: 6379
  });
  
  try {
    // 连接到 Redis
    await redisService.connect();
    
    // 创建游戏排行榜
    const gameLeaderboard = new Leaderboard(redisService, 'game-scores');
    
    // 重置排行榜
    await gameLeaderboard.reset();
    
    // 添加一些玩家分数
    console.log('添加玩家分数...');
    await gameLeaderboard.updateScore('player1', 100);
    await gameLeaderboard.updateScore('player2', 85);
    await gameLeaderboard.updateScore('player3', 150);
    await gameLeaderboard.updateScore('player4', 120);
    await gameLeaderboard.updateScore('player5', 200);
    
    // 获取前3名
    console.log('\n获取前3名玩家:');
    const top3 = await gameLeaderboard.getTopN(3);
    top3.forEach(player => {
      console.log(`排名 #${player.rank + 1}: ${player.userId} - ${player.score}分`);
    });
    
    // 获取特定玩家排名
    const player2Rank = await gameLeaderboard.getRank('player2');
    console.log(`\nplayer2 的排名: #${(player2Rank !== null ? player2Rank + 1 : '未上榜')}`);
    
    // 增加玩家分数
    console.log('\n增加 player2 的分数...');
    const newScore = await gameLeaderboard.incrementScore('player2', 70);
    console.log(`player2 的新分数: ${newScore}`);
    
    // 再次获取排名
    const newRank = await gameLeaderboard.getRank('player2');
    console.log(`player2 的新排名: #${(newRank !== null ? newRank + 1 : '未上榜')}`);
    
    // 获取更新后的前3名
    console.log('\n更新后的前3名玩家:');
    const updatedTop3 = await gameLeaderboard.getTopN(3);
    updatedTop3.forEach(player => {
      console.log(`排名 #${player.rank + 1}: ${player.userId} - ${player.score}分`);
    });
  } catch (error) {
    console.error('排行榜示例运行失败:', error);
  } finally {
    // 断开连接
    await redisService.disconnect();
  }
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  runLeaderboardExample()
    .then(() => console.log('排行榜示例运行完成'))
    .catch(console.error);
}

export { runLeaderboardExample };