/**
 * Redis MCP 示例运行器
 */

import { runCacheExample } from './cacheExample';
import { runLeaderboardExample } from './leaderboardExample';
import { runMessageQueueExample } from './messageQueueExample';

// 示例列表
const examples = [
  { name: '缓存示例', run: runCacheExample },
  { name: '排行榜示例', run: runLeaderboardExample },
  { name: '消息队列示例', run: runMessageQueueExample }
];

// 运行所有示例
async function runAllExamples() {
  for (const example of examples) {
    console.log(`\n========== 运行 ${example.name} ==========\n`);
    try {
      await example.run();
      console.log(`\n${example.name}运行完成`);
    } catch (error) {
      console.error(`${example.name}运行失败:`, error);
    }
    console.log('\n=======================================\n');
  }
}

// 如果直接运行此文件，则运行所有示例
if (require.main === module) {
  runAllExamples()
    .then(() => console.log('所有示例运行完成'))
    .catch(console.error);
}

export { runAllExamples };