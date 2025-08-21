# 🚀 Redis MCP Server

[![npm version](https://img.shields.io/npm/v/@pickstar-2002/redis-mcp.svg)](https://www.npmjs.com/package/@pickstar-2002/redis-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

> 🔧 一个功能强大的 Redis MCP (Model Context Protocol) 服务器，为 AI 编辑器提供完整的 Redis 数据库操作能力

## ✨ 特性

- 🔌 **即插即用**: 支持所有主流 AI 编辑器 (Cursor, WindSurf, CodeBuddy 等)
- 🛠️ **全功能覆盖**: 支持 Redis 所有数据类型操作
- 🔒 **安全连接**: 支持 TLS/SSL 加密连接
- 📦 **批量操作**: 支持批量数据导入导出
- 💾 **备份恢复**: 内置数据备份和恢复功能
- 🎯 **类型安全**: 完整的 TypeScript 类型定义
- ⚡ **高性能**: 基于官方 Redis 客户端优化

## 📋 支持的操作

### 🔤 字符串操作
- `string_set` / `string_get` - 设置/获取字符串值
- `string_incr` / `string_decr` - 数值递增/递减
- `string_mset` / `string_mget` - 批量设置/获取

### 🗂️ 哈希操作
- `hash_set` / `hash_get` - 设置/获取哈希字段
- `hash_mset` / `hash_getall` - 批量操作和获取所有字段
- `hash_del` - 删除哈希字段

### 📝 列表操作
- `list_lpush` / `list_rpush` - 左/右侧推入
- `list_lpop` / `list_rpop` - 左/右侧弹出
- `list_range` - 获取列表范围

### 🎯 集合操作
- `set_add` / `set_remove` - 添加/移除成员
- `set_members` - 获取所有成员

### 📊 有序集合操作
- `zset_add` / `zset_remove` - 添加/移除成员
- `zset_range` - 获取范围数据

### 🔑 键管理
- `key_delete` / `key_expire` / `key_ttl` - 键操作
- `key_search` / `key_type` / `key_info` - 键查询
- `key_delete_pattern` - 批量删除

### 💾 数据库管理
- `db_flush` - 清空数据库
- `backup_create` / `backup_restore` - 备份恢复

## 🚀 快速开始

### 安装要求

- Node.js >= 18.0.0
- Redis 服务器 (本地或远程)

### 在 AI 编辑器中使用

#### 🎯 推荐用法 (使用 @latest)

```json
{
  "mcpServers": {
    "redis-mcp": {
      "command": "npx",
      "args": [
        "@pickstar-2002/redis-mcp@latest",
        "--host", "localhost",
        "--port", "6379"
      ]
    }
  }
}
```

#### 🔧 完整配置示例

```json
{
  "mcpServers": {
    "redis-mcp": {
      "command": "npx",
      "args": [
        "@pickstar-2002/redis-mcp@latest",
        "--host", "localhost",
        "--port", "6379",
        "--password", "your_password",
        "--db", "0",
        "--username", "your_username"
      ]
    }
  }
}
```

#### 🔒 TLS 连接配置

```json
{
  "mcpServers": {
    "redis-mcp": {
      "command": "npx",
      "args": [
        "@pickstar-2002/redis-mcp@latest",
        "--host", "your-redis-host.com",
        "--port", "6380",
        "--password", "your_password",
        "--tls", "true"
      ]
    }
  }
}
```

### 📍 配置文件位置

不同 AI 编辑器的配置文件位置：

| 编辑器 | 配置文件路径 |
|--------|-------------|
| **Cursor** | `~/.cursor/mcp_settings.json` |
| **WindSurf** | `~/.windsurf/mcp_settings.json` |
| **CodeBuddy** | `~/.codebuddy/mcp_settings.json` |
| **Claude Desktop** | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)<br>`%APPDATA%\Claude\claude_desktop_config.json` (Windows) |

## 🎮 使用示例

### 基础连接

```typescript
// AI 编辑器中直接使用
// 连接到 Redis
await connectRedis("localhost", 6379, "password")

// 设置字符串
await stringSet("user:1001", "张三", 3600)

// 获取字符串
const value = await stringGet("user:1001")
```

### 哈希操作

```typescript
// 设置用户信息
await hashMset("user:profile:1001", [
  { field: "name", value: "张三" },
  { field: "age", value: "25" },
  { field: "city", value: "北京" }
])

// 获取所有字段
const profile = await hashGetall("user:profile:1001")
```

### 列表操作

```typescript
// 创建任务队列
await listLpush("tasks", ["任务1", "任务2", "任务3"])

// 处理任务
const task = await listRpop("tasks")
```

## 🔧 命令行参数

| 参数 | 描述 | 默认值 | 必需 |
|------|------|--------|------|
| `--host` | Redis 服务器地址 | `localhost` | ❌ |
| `--port` | Redis 服务器端口 | `6379` | ❌ |
| `--password` | Redis 密码 | - | ❌ |
| `--username` | Redis 用户名 | - | ❌ |
| `--db` | 数据库索引 | `0` | ❌ |
| `--tls` | 启用 TLS 连接 | `false` | ❌ |

## 📚 API 文档

### 连接管理

#### `connect_redis`
连接到 Redis 服务器

```json
{
  "host": "localhost",
  "port": 6379,
  "password": "optional_password",
  "username": "optional_username",
  "db": 0,
  "tls": false
}
```

#### `disconnect_redis`
断开 Redis 连接

### 字符串操作

#### `string_set`
设置字符串键值

```json
{
  "key": "mykey",
  "value": "myvalue",
  "expireSeconds": 3600
}
```

#### `string_get`
获取字符串值

```json
{
  "key": "mykey"
}
```

### 更多 API

详细的 API 文档请参考源码中的类型定义文件 `src/types/index.ts`。

## 🛠️ 开发

### 本地开发

```bash
# 克隆项目
git clone https://github.com/pickstar-2002/redis-mcp.git
cd redis-mcp

# 安装依赖
npm install

# 构建项目
npm run build

# 本地测试
npm start -- --host localhost --port 6379
```

### 项目结构

```
redis-mcp/
├── src/
│   ├── index.ts              # 入口文件
│   ├── services/
│   │   ├── redisService.ts   # Redis 操作服务
│   │   ├── mcpService.ts     # MCP 协议服务
│   │   └── backupService.ts  # 备份恢复服务
│   └── types/
│       └── index.ts          # 类型定义
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

## 🔗 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Redis 官方文档](https://redis.io/documentation)
- [NPM 包地址](https://www.npmjs.com/package/@pickstar-2002/redis-mcp)

## 📞 联系方式

如有问题或建议，欢迎联系：

**微信**: pickstar_loveXX

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！