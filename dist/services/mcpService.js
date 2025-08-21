"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisMCPService = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const redisService_js_1 = require("./redisService.js");
const backupService_js_1 = require("./backupService.js");
/**
 * Redis MCP 服务类 - 提供 MCP 协议接口
 */
class RedisMCPService {
    constructor() {
        this.redisService = null;
        this.backupService = null;
        this.server = new index_js_1.Server({
            name: 'redis-mcp',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    /**
     * 启动 MCP 服务器
     */
    async start() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('Redis MCP Server started');
    }
    /**
     * 停止 MCP 服务器
     */
    async stop() {
        await this.server.close();
        console.error('Redis MCP Server stopped');
        // 断开 Redis 连接
        if (this.redisService) {
            await this.redisService.disconnect();
        }
    }
    /**
     * 设置工具处理器
     */
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: [
                    // 连接管理工具
                    {
                        name: 'connect_redis',
                        description: '连接到 Redis 服务器',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                host: { type: 'string', description: 'Redis 服务器地址' },
                                port: { type: 'number', description: 'Redis 服务器端口' },
                                username: { type: 'string', description: '用户名（可选）' },
                                password: { type: 'string', description: '密码（可选）' },
                                db: { type: 'number', description: '数据库索引（可选）' },
                                tls: { type: 'boolean', description: '是否使用 TLS 连接（可选）' }
                            },
                            required: ['host', 'port']
                        }
                    },
                    {
                        name: 'disconnect_redis',
                        description: '断开与 Redis 服务器的连接',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    },
                    // String 操作工具
                    {
                        name: 'string_set',
                        description: '设置字符串键值',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '键名' },
                                value: { type: 'string', description: '值' },
                                expireSeconds: { type: 'number', description: '过期时间（秒）（可选）' }
                            },
                            required: ['key', 'value']
                        }
                    },
                    {
                        name: 'string_get',
                        description: '获取字符串值',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '键名' }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'string_incr',
                        description: '递增数值',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '键名' },
                                increment: { type: 'number', description: '增量值（可选，默认为 1）' }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'string_decr',
                        description: '递减数值',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '键名' },
                                decrement: { type: 'number', description: '减量值（可选，默认为 1）' }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'string_mset',
                        description: '批量设置键值',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                keyValues: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            key: { type: 'string', description: '键名' },
                                            value: { type: 'string', description: '值' }
                                        },
                                        required: ['key', 'value']
                                    },
                                    description: '键值对数组'
                                }
                            },
                            required: ['keyValues']
                        }
                    },
                    {
                        name: 'string_mget',
                        description: '批量获取键值',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                keys: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: '键名数组'
                                }
                            },
                            required: ['keys']
                        }
                    },
                    // Hash 操作工具
                    {
                        name: 'hash_set',
                        description: '设置哈希字段',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '哈希键名' },
                                field: { type: 'string', description: '字段名' },
                                value: { type: 'string', description: '字段值' }
                            },
                            required: ['key', 'field', 'value']
                        }
                    },
                    {
                        name: 'hash_mset',
                        description: '批量设置哈希字段',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '哈希键名' },
                                fieldValues: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            field: { type: 'string', description: '字段名' },
                                            value: { type: 'string', description: '字段值' }
                                        },
                                        required: ['field', 'value']
                                    },
                                    description: '字段值对数组'
                                }
                            },
                            required: ['key', 'fieldValues']
                        }
                    },
                    {
                        name: 'hash_get',
                        description: '获取哈希字段',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '哈希键名' },
                                field: { type: 'string', description: '字段名' }
                            },
                            required: ['key', 'field']
                        }
                    },
                    {
                        name: 'hash_getall',
                        description: '获取所有哈希字段',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '哈希键名' }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'hash_del',
                        description: '删除哈希字段',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '哈希键名' },
                                fields: {
                                    oneOf: [
                                        { type: 'string', description: '字段名' },
                                        {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: '字段名数组'
                                        }
                                    ],
                                    description: '要删除的字段名或字段名数组'
                                }
                            },
                            required: ['key', 'fields']
                        }
                    },
                    // List 操作工具
                    {
                        name: 'list_lpush',
                        description: '左侧推入列表',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '列表键名' },
                                values: {
                                    oneOf: [
                                        { type: 'string', description: '值' },
                                        {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: '值数组'
                                        }
                                    ],
                                    description: '要推入的值或值数组'
                                }
                            },
                            required: ['key', 'values']
                        }
                    },
                    {
                        name: 'list_rpush',
                        description: '右侧推入列表',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '列表键名' },
                                values: {
                                    oneOf: [
                                        { type: 'string', description: '值' },
                                        {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: '值数组'
                                        }
                                    ],
                                    description: '要推入的值或值数组'
                                }
                            },
                            required: ['key', 'values']
                        }
                    },
                    {
                        name: 'list_lpop',
                        description: '左侧弹出列表',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '列表键名' },
                                count: { type: 'number', description: '弹出数量（可选）' }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'list_rpop',
                        description: '右侧弹出列表',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '列表键名' },
                                count: { type: 'number', description: '弹出数量（可选）' }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'list_range',
                        description: '获取列表范围',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '列表键名' },
                                start: { type: 'number', description: '起始索引' },
                                stop: { type: 'number', description: '结束索引' }
                            },
                            required: ['key', 'start', 'stop']
                        }
                    },
                    // Set 操作工具
                    {
                        name: 'set_add',
                        description: '添加集合成员',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '集合键名' },
                                members: {
                                    oneOf: [
                                        { type: 'string', description: '成员' },
                                        {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: '成员数组'
                                        }
                                    ],
                                    description: '要添加的成员或成员数组'
                                }
                            },
                            required: ['key', 'members']
                        }
                    },
                    {
                        name: 'set_remove',
                        description: '移除集合成员',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '集合键名' },
                                members: {
                                    oneOf: [
                                        { type: 'string', description: '成员' },
                                        {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: '成员数组'
                                        }
                                    ],
                                    description: '要移除的成员或成员数组'
                                }
                            },
                            required: ['key', 'members']
                        }
                    },
                    {
                        name: 'set_members',
                        description: '获取集合所有成员',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '集合键名' }
                            },
                            required: ['key']
                        }
                    },
                    // Sorted Set 操作工具
                    {
                        name: 'zset_add',
                        description: '添加有序集合成员',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '有序集合键名' },
                                members: {
                                    oneOf: [
                                        {
                                            type: 'object',
                                            properties: {
                                                member: { type: 'string', description: '成员' },
                                                score: { type: 'number', description: '分数' }
                                            },
                                            required: ['member', 'score'],
                                            description: '单个成员'
                                        },
                                        {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    member: { type: 'string', description: '成员' },
                                                    score: { type: 'number', description: '分数' }
                                                },
                                                required: ['member', 'score']
                                            },
                                            description: '成员数组'
                                        }
                                    ],
                                    description: '要添加的成员或成员数组'
                                }
                            },
                            required: ['key', 'members']
                        }
                    },
                    {
                        name: 'zset_remove',
                        description: '移除有序集合成员',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '有序集合键名' },
                                members: {
                                    oneOf: [
                                        { type: 'string', description: '成员' },
                                        {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: '成员数组'
                                        }
                                    ],
                                    description: '要移除的成员或成员数组'
                                }
                            },
                            required: ['key', 'members']
                        }
                    },
                    {
                        name: 'zset_range',
                        description: '获取有序集合范围',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '有序集合键名' },
                                start: { type: 'number', description: '起始索引' },
                                stop: { type: 'number', description: '结束索引' },
                                withScores: { type: 'boolean', description: '是否返回分数（可选）' }
                            },
                            required: ['key', 'start', 'stop']
                        }
                    },
                    // 键管理工具
                    {
                        name: 'key_delete',
                        description: '删除键',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                keys: {
                                    oneOf: [
                                        { type: 'string', description: '键名' },
                                        {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: '键名数组'
                                        }
                                    ],
                                    description: '要删除的键名或键名数组'
                                }
                            },
                            required: ['keys']
                        }
                    },
                    {
                        name: 'key_expire',
                        description: '设置键过期时间',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '键名' },
                                seconds: { type: 'number', description: '过期时间（秒）' }
                            },
                            required: ['key', 'seconds']
                        }
                    },
                    {
                        name: 'key_ttl',
                        description: '获取键过期时间',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '键名' }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'key_search',
                        description: '查找匹配的键',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                pattern: { type: 'string', description: '匹配模式（支持通配符 * ? []）' }
                            },
                            required: ['pattern']
                        }
                    },
                    {
                        name: 'key_type',
                        description: '获取键类型',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '键名' }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'key_info',
                        description: '获取键信息',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', description: '键名' }
                            },
                            required: ['key']
                        }
                    },
                    {
                        name: 'key_delete_pattern',
                        description: '批量删除匹配的键',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                pattern: { type: 'string', description: '匹配模式（支持通配符 * ? []）' }
                            },
                            required: ['pattern']
                        }
                    },
                    {
                        name: 'db_flush',
                        description: '清空当前数据库',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    },
                    // 备份与恢复工具
                    {
                        name: 'backup_create',
                        description: '创建 Redis 数据备份',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filename: { type: 'string', description: '备份文件名（可选）' },
                                path: { type: 'string', description: '备份路径（可选）' },
                                includePatterns: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: '包含的键模式数组（可选，默认为 ["*"]）'
                                },
                                excludePatterns: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: '排除的键模式数组（可选）'
                                }
                            }
                        }
                    },
                    {
                        name: 'backup_restore',
                        description: '从备份恢复 Redis 数据',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filename: { type: 'string', description: '备份文件名' },
                                path: { type: 'string', description: '备份路径（可选）' },
                                flushBeforeRestore: {
                                    type: 'boolean',
                                    description: '恢复前是否清空数据库（可选，默认为 false）'
                                }
                            },
                            required: ['filename']
                        }
                    }
                ],
            };
        });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    // 连接管理
                    case 'connect_redis':
                        return await this.handleConnectRedis(args);
                    case 'disconnect_redis':
                        return await this.handleDisconnectRedis();
                    // String 操作
                    case 'string_set':
                        return await this.handleStringSet(args);
                    case 'string_get':
                        return await this.handleStringGet(args);
                    case 'string_incr':
                        return await this.handleStringIncr(args);
                    case 'string_decr':
                        return await this.handleStringDecr(args);
                    case 'string_mset':
                        return await this.handleStringMset(args);
                    case 'string_mget':
                        return await this.handleStringMget(args);
                    // Hash 操作
                    case 'hash_set':
                        return await this.handleHashSet(args);
                    case 'hash_mset':
                        return await this.handleHashMset(args);
                    case 'hash_get':
                        return await this.handleHashGet(args);
                    case 'hash_getall':
                        return await this.handleHashGetall(args);
                    case 'hash_del':
                        return await this.handleHashDel(args);
                    // List 操作
                    case 'list_lpush':
                        return await this.handleListLpush(args);
                    case 'list_rpush':
                        return await this.handleListRpush(args);
                    case 'list_lpop':
                        return await this.handleListLpop(args);
                    case 'list_rpop':
                        return await this.handleListRpop(args);
                    case 'list_range':
                        return await this.handleListRange(args);
                    // Set 操作
                    case 'set_add':
                        return await this.handleSetAdd(args);
                    case 'set_remove':
                        return await this.handleSetRemove(args);
                    case 'set_members':
                        return await this.handleSetMembers(args);
                    // Sorted Set 操作
                    case 'zset_add':
                        return await this.handleZsetAdd(args);
                    case 'zset_remove':
                        return await this.handleZsetRemove(args);
                    case 'zset_range':
                        return await this.handleZsetRange(args);
                    // 键管理
                    case 'key_delete':
                        return await this.handleKeyDelete(args);
                    case 'key_expire':
                        return await this.handleKeyExpire(args);
                    case 'key_ttl':
                        return await this.handleKeyTtl(args);
                    case 'key_search':
                        return await this.handleKeySearch(args);
                    case 'key_type':
                        return await this.handleKeyType(args);
                    case 'key_info':
                        return await this.handleKeyInfo(args);
                    case 'key_delete_pattern':
                        return await this.handleKeyDeletePattern(args);
                    case 'db_flush':
                        return await this.handleDbFlush();
                    // 备份与恢复
                    case 'backup_create':
                        return await this.handleBackupCreate(args);
                    case 'backup_restore':
                        return await this.handleBackupRestore(args);
                    default:
                        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                if (error instanceof types_js_1.McpError) {
                    throw error;
                }
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    /**
     * 设置错误处理
     */
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', async () => {
            await this.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            await this.stop();
            process.exit(0);
        });
    }
    /**
     * 检查 Redis 连接
     */
    ensureRedisConnection() {
        if (!this.redisService) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, 'Not connected to Redis. Please use connect_redis first.');
        }
    }
    // ========== 工具处理方法 ==========
    /**
     * 连接到 Redis
     */
    async handleConnectRedis(args) {
        const config = {
            host: args.host,
            port: args.port,
            username: args.username,
            password: args.password,
            db: args.db,
            tls: args.tls
        };
        this.redisService = new redisService_js_1.RedisService(config);
        this.backupService = new backupService_js_1.RedisBackupService(this.redisService);
        const result = await this.redisService.connect();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 断开 Redis 连接
     */
    async handleDisconnectRedis() {
        if (!this.redisService) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ success: false, error: 'Not connected to Redis' }, null, 2)
                    }
                ]
            };
        }
        const result = await this.redisService.disconnect();
        this.redisService = null;
        this.backupService = null;
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 设置字符串值
     */
    async handleStringSet(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.set(args.key, args.value, args.expireSeconds);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 获取字符串值
     */
    async handleStringGet(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.get(args.key);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 递增数值
     */
    async handleStringIncr(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.incr(args.key, args.increment);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 递减数值
     */
    async handleStringDecr(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.decr(args.key, args.decrement);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 批量设置键值
     */
    async handleStringMset(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.mset(args.keyValues);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 批量获取键值
     */
    async handleStringMget(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.mget(args.keys);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 设置哈希字段
     */
    async handleHashSet(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.hset(args.key, args.field, args.value);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 批量设置哈希字段
     */
    async handleHashMset(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.hmset(args.key, args.fieldValues);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 获取哈希字段
     */
    async handleHashGet(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.hget(args.key, args.field);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 获取所有哈希字段
     */
    async handleHashGetall(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.hgetall(args.key);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 删除哈希字段
     */
    async handleHashDel(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.hdel(args.key, args.fields);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 左侧推入列表
     */
    async handleListLpush(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.lpush(args.key, args.values);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 右侧推入列表
     */
    async handleListRpush(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.rpush(args.key, args.values);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 左侧弹出列表
     */
    async handleListLpop(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.lpop(args.key, args.count);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 右侧弹出列表
     */
    async handleListRpop(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.rpop(args.key, args.count);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 获取列表范围
     */
    async handleListRange(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.lrange(args.key, args.start, args.stop);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 添加集合成员
     */
    async handleSetAdd(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.sadd(args.key, args.members);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 移除集合成员
     */
    async handleSetRemove(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.srem(args.key, args.members);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 获取集合所有成员
     */
    async handleSetMembers(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.smembers(args.key);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 添加有序集合成员
     */
    async handleZsetAdd(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.zadd(args.key, args.members);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 移除有序集合成员
     */
    async handleZsetRemove(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.zrem(args.key, args.members);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 获取有序集合范围
     */
    async handleZsetRange(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.zrange(args.key, args.start, args.stop, args.withScores);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 删除键
     */
    async handleKeyDelete(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.del(args.keys);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 设置键过期时间
     */
    async handleKeyExpire(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.expire(args.key, args.seconds);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 获取键过期时间
     */
    async handleKeyTtl(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.ttl(args.key);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 查找匹配的键
     */
    async handleKeySearch(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.keys(args.pattern);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 获取键类型
     */
    async handleKeyType(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.type(args.key);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 获取键信息
     */
    async handleKeyInfo(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.getKeyInfo(args.key);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 批量删除匹配的键
     */
    async handleKeyDeletePattern(args) {
        this.ensureRedisConnection();
        const result = await this.redisService.deleteByPattern(args.pattern);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 清空当前数据库
     */
    async handleDbFlush() {
        this.ensureRedisConnection();
        const result = await this.redisService.flushdb();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 创建备份
     */
    async handleBackupCreate(args) {
        this.ensureRedisConnection();
        if (!this.backupService) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, 'Backup service not initialized');
        }
        const options = {
            filename: args.filename,
            path: args.path,
            includePatterns: args.includePatterns,
            excludePatterns: args.excludePatterns
        };
        const result = await this.backupService.backup(options);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    /**
     * 恢复备份
     */
    async handleBackupRestore(args) {
        this.ensureRedisConnection();
        if (!this.backupService) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, 'Backup service not initialized');
        }
        const options = {
            filename: args.filename,
            path: args.path,
            flushBeforeRestore: args.flushBeforeRestore
        };
        const result = await this.backupService.restore(options);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
}
exports.RedisMCPService = RedisMCPService;
