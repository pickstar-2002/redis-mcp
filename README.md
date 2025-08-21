# 🚀 Redis MCP

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fredis-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fredis-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Downloads](https://img.shields.io/npm/dm/@pickstar-2002/redis-mcp.svg)](https://www.npmjs.com/package/@pickstar-2002/redis-mcp)

> 🔧 基于 Model Context Protocol (MCP) 的 Redis 操作工具，为 AI 助手提供强大的 Redis 数据库操作能力

## ✨ 功能特点

- 🔌 **完整的 MCP 协议支持** - 与各种 AI 助手无缝集成
- 🗄️ **全面的 Redis 操作** - 支持所有主要数据结构（String、Hash、List、Set、Sorted Set）
- 🚀 **批量操作** - 高效的批量设置、获取和删除操作
- 🔍 **智能搜索** - 支持键的模糊搜索与批量删除
- ⏰ **TTL 管理** - 完整的过期时间设置与查询功能
- 💾 **备份恢复** - 简易的数据备份与恢复接口
- 📊 **应用场景示例** - 缓存、排行榜、消息队列等实用示例
- 🔒 **安全连接** - 支持密码认证和 TLS 连接

## 📦 安装

```bash
# 使用 npm（推荐使用 @latest 获取最新版本）
npm install @pickstar-2002/redis-mcp@latest

# 使用 yarn
yarn add @pickstar-2002/redis-mcp@latest

# 使用 pnpm
pnpm add @pickstar-2002/redis-mcp@latest
```

## 🚀 快速开始

### 在 AI 助手中配置

#### 🎯 Cursor AI 配置

在 Cursor 的设置中添加 MCP 服务器：

```json
{
  "mcpServers": {
    "redis-mcp": {
      "command": "npx",
      "args": ["@pickstar-2002/redis-mcp@latest"]
    }
  }
}
```

#### 🤖 Claude Desktop 配置

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "redis-mcp": {
      "command": "npx",
      "args": ["@pickstar-2002/redis-mcp@latest"]
    }
  }
}
```

#### 🌊 WindSurf 配置

在 WindSurf 的 MCP 设置中添加：

```json
{
  "redis-mcp": {
    "command": "npx",
    "args": ["@pickstar-2002/redis-mcp@latest"]
  }
}
```

#### 🔧 CodeBuddy 配置

在 CodeBuddy 的 MCP 设置中添加：

```json
{
  "redis-mcp": {
    "command": "npx",
    "args": ["@pickstar-2002/redis-mcp@latest"]
  }
}
```

### 💡 基本使用

配置完成后，您可以在 AI 助手中直接使用 Redis 操作：

```
请帮我连接到本地 Redis 服务器，然后设置一个键值对
```

```
请在 Redis 中创建一个排行榜，添加几个用户的分数
```

```
请帮我查询所有以 "user:" 开头的键
```

## 🛠️ API 文档

### 🔗 连接管理

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `connect_redis` | 连接到 Redis 服务器 | `host`, `port`, `username`, `password`, `db`, `tls` |
| `disconnect_redis` | 断开 Redis 连接 | 无 |

### 📝 String 操作

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `string_set` | 设置字符串键值 | `key`, `value`, `expireSeconds?` |
| `string_get` | 获取字符串值 | `key` |
| `string_incr` | 递增数值 | `key`, `increment?` |
| `string_decr` | 递减数值 | `key`, `decrement?` |
| `string_mset` | 批量设置键值 | `pairs` |
| `string_mget` | 批量获取键值 | `keys` |

### 🗂️ Hash 操作

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `hash_set` | 设置哈希字段 | `key`, `field`, `value` |
| `hash_mset` | 批量设置哈希字段 | `key`, `fields` |
| `hash_get` | 获取哈希字段 | `key`, `field` |
| `hash_getall` | 获取所有哈希字段 | `key` |
| `hash_del` | 删除哈希字段 | `key`, `fields` |

### 📋 List 操作

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `list_lpush` | 左侧推入列表 | `key`, `values` |
| `list_rpush` | 右侧推入列表 | `key`, `values` |
| `list_lpop` | 左侧弹出列表 | `key`, `count?` |
| `list_rpop` | 右侧弹出列表 | `key`, `count?` |
| `list_range` | 获取列表范围 | `key`, `start`, `stop` |

### 🎯 Set 操作

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `set_add` | 添加集合成员 | `key`, `members` |
| `set_remove` | 移除集合成员 | `key`, `members` |
| `set_members` | 获取集合所有成员 | `key` |

### 🏆 Sorted Set 操作

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `zset_add` | 添加有序集合成员 | `key`, `members` |
| `zset_remove` | 移除有序集合成员 | `key`, `members` |
| `zset_range` | 获取有序集合范围 | `key`, `start`, `stop`, `withScores?` |

### 🔑 键管理

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `key_delete` | 删除键 | `keys` |
| `key_expire` | 设置键过期时间 | `key`, `seconds` |
| `key_ttl` | 获取键过期时间 | `key` |
| `key_search` | 查找匹配的键 | `pattern` |
| `key_type` | 获取键类型 | `key` |
| `key_info` | 获取键信息 | `key` |
| `key_delete_pattern` | 批量删除匹配的键 | `pattern` |
| `db_flush` | 清空当前数据库 | 无 |

### 💾 备份与恢复

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `backup_create` | 创建数据备份 | `filename?` |
| `backup_restore` | 从备份恢复数据 | `filename` |

## 📚 使用示例

### 🗄️ 缓存系统

```javascript
// 连接 Redis
await connectRedis({ host: 'localhost', port: 6379 });

// 设置缓存
await stringSet({ key: 'user:1001', value: JSON.stringify(userData), expireSeconds: 3600 });

// 获取缓存
const cachedData = await stringGet({ key: 'user:1001' });
```

### 🏆 排行榜系统

```javascript
// 添加用户分数
await zsetAdd({ 
  key: 'leaderboard', 
  members: [
    { score: 1000, member: 'player1' },
    { score: 950, member: 'player2' }
  ]
});

// 获取排行榜前10名
const topPlayers = await zsetRange({ 
  key: 'leaderboard', 
  start: 0, 
  stop: 9, 
  withScores: true 
});
```

### 📨 消息队列

```javascript
// 发送消息
await listRpush({ key: 'message_queue', values: ['message1', 'message2'] });

// 接收消息
const message = await listLpop({ key: 'message_queue' });
```

### 🔍 批量操作

```javascript
// 批量设置键值
await stringMset({ 
  pairs: [
    { key: 'key1', value: 'value1' },
    { key: 'key2', value: 'value2' }
  ]
});

// 批量获取键值
const values = await stringMget({ keys: ['key1', 'key2'] });
```

## 🔧 开发

### 构建项目

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

### 启动服务

```bash
npm start
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=pickstar-2002/redis-mcp&type=Date)](https://star-history.com/#pickstar-2002/redis-mcp&Date)

## 👨‍💻 作者

**pickstar-2002**

- GitHub: [@pickstar-2002](https://github.com/pickstar-2002)
- 微信: pickstar_love2002

---

⭐ 如果这个项目对您有帮助，请给它一个星标！