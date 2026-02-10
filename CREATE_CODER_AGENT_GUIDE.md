# 创建 Coder 代理 - 完整指南

本指南说明如何在 swarm-ide 系统中创建和配置 coder 代理。

## 目录

1. [快速开始](#快速开始)
2. [前置要求](#前置要求)
3. [创建方式](#创建方式)
4. [高级配置](#高级配置)
5. [测试和验证](#测试和验证)

---

## 快速开始

### 方式 1：使用 UI（推荐）

1. **启动系统**
   ```bash
   cd backend
   docker compose up -d      # 启动 PostgreSQL 和 Redis
   npm install
   GLM_API_KEY=xxx npm run dev
   ```

2. **初始化数据库**
   ```bash
   curl -X POST http://localhost:3017/api/admin/init-db
   ```

3. **访问 IM 界面**
   - 打开浏览器访问 `http://localhost:3017/im`
   - 在主窗口中输入：`/create coder` 或 `/hire coder`
   - 按 Enter 创建代理

### 方式 2：使用 Node.js 脚本

```bash
# 需要先启动后端服务（见方式1第1-2步）

# 创建默认 coder 代理
node create-coder-agent.js --workspace-id <workspace-id>

# 创建带自定义指导的 coder 代理
node create-coder-agent.js \
  --workspace-id abc123 \
  --creator-id def456 \
  --guidance "You are an expert Python developer"
```

### 方式 3：使用 Bash 脚本

```bash
chmod +x create-coder-agent.sh

# 基本用法
./create-coder-agent.sh <workspace-id>

# 自定义指导
./create-coder-agent.sh <workspace-id> <creator-id> "Custom guidance text"
```

### 方式 4：直接调用 API

```bash
curl -X POST http://localhost:3017/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "workspace-123",
    "creatorId": "creator-456",
    "role": "coder",
    "guidance": "You are a professional coder. Write clean, maintainable code."
  }'
```

---

## 前置要求

### 系统环境

- Node.js 18+ 或 Bun
- Docker 和 Docker Compose
- PostgreSQL（通过 Docker）
- Redis（通过 Docker）

### 环境变量

在 `backend` 目录创建 `.env.local` 或 `.env` 文件：

```env
# 数据库
DATABASE_URL=postgres://user:password@localhost:5432/agent_wechat

# Redis
REDIS_URL=redis://localhost:6379

# LLM 配置
LLM_PROVIDER=glm          # 或 openrouter
GLM_API_KEY=your_api_key
GLM_MODEL=glm-4-7         # 默认

# 或者使用 OpenRouter
OPENROUTER_API_KEY=your_api_key
```

### 检查依赖

```bash
cd backend
npm install      # 或 bun install
```

---

## 创建方式

### 代理结构

创建的 coder 代理将包含以下信息：

```typescript
interface Agent {
  id: string;                    // 唯一标识符
  workspaceId: string;          // 工作空间
  role: string;                 // 角色："coder"
  parentId?: string;            // 创建者 ID
  llmHistory: string;           // LLM 对话历史（JSON 格式）
  createdAt: Date;              // 创建时间
}
```

### 创建参数

| 参数 | 类型 | 必需 | 说明 |
|-----|------|------|------|
| `workspaceId` | string | ✓ | 工作空间 ID |
| `creatorId` | string | ✓ | 创建者（通常是 human agent ID） |
| `role` | string | ✓ | 代理角色，固定为 "coder" |
| `guidance` | string | ✗ | 自定义系统提示或指导（可选） |

### 默认系统提示

如果不指定 `guidance`，系统将使用以下默认提示：

```
You are an agent in an IM system.
Your agent_id is: [自动填充].
Your workspace_id is: [自动填充].
Your role is: coder.
Act strictly as this role when replying. Be concise and helpful.
Your replies are NOT automatically delivered to humans.
To send messages, you MUST call tools like send_group_message or send_direct_message.
If you need to coordinate with other agents, you may use tools like:
  - create: Create a sub-agent
  - send/send_direct_message/send_group_message: Send messages
  - list_agents, list_groups, list_group_members: Query information
  - create_group, get_group_messages: Manage groups
```

---

## 高级配置

### 创建配置集类型的代理

为不同场景创建特定的代理版本：

```bash
# Python 专家
node create-coder-agent.js \
  --workspace-id abc123 \
  --guidance "You are a Python expert. Write Pythonic, efficient code."

# 前端开发者
node create-coder-agent.js \
  --workspace-id abc123 \
  --guidance "You are a React/TypeScript frontend expert. Focus on UI/UX and performance."

# 全栈工程师
node create-coder-agent.js \
  --workspace-id abc123 \
  --guidance "You are a full-stack engineer. Handle both backend and frontend tasks."

# 代码审查员
node create-coder-agent.js \
  --workspace-id abc123 \
  --role "code-reviewer" \
  --guidance "Review code for quality, security, and best practices."
```

### 链式创建

多个代理可以链式创建（一个代理创建另一个）：

```bash
# 首先创建 coder1
CODER1=$(node create-coder-agent.js \
  --workspace-id abc123 | grep "Agent ID" | awk '{print $NF}')

# 然后让 coder1 创建 coder2
node create-coder-agent.js \
  --workspace-id abc123 \
  --creator-id $CODER1 \
  --guidance "You are a specialized SQL query optimizer."
```

---

## 测试和验证

### 1. 验证代理创建

```bash
# 查看工作空间中的所有代理
curl http://localhost:3017/api/agents?workspaceId=abc123

# 获取特定代理信息
curl http://localhost:3017/api/agents/agent-id-123
```

### 2. 测试代理通信

在 IM 界面中：

```
# 消息流程
你："/create coder"
系统：创建 coder 代理...
你：进入 coder 代理对话
你：请帮我写一个 Python 函数来反转字符串
Coder 代理：[处理中...] → 回复代码示例
```

### 3. 查看代理日志

```bash
# 查看代理历史（LLM 对话记录）
curl http://localhost:3017/api/agents/agent-id-123/context-stream
```

### 4. 监测代理状态

访问代理图表界面（Graph）：
- 打开 `http://localhost:3017/graph`
- 查看代理间的消息流和状态

---

## 常见问题

### Q: 创建代理时报错 "workspace not found"

**A:** 确保：
1. 工作空间已初始化：`curl -X POST http://localhost:3017/api/admin/init-db`
2. `workspaceId` 参数正确

### Q: 代理没有响应

**A:** 
1. 检查后端日志：`npm run dev` 的输出
2. 验证 LLM API Key 配置
3. 检查 Redis 连接：`redis-cli ping`

### Q: 如何删除代理？

**A:** 目前 MVP 版本没有删除接口，可以清数据库重来：
```bash
curl -X POST http://localhost:3017/api/admin/clear-db
curl -X POST http://localhost:3017/api/admin/init-db
```

### Q: 代理可以自己创建子代理吗？

**A:** 是的！代理可以使用 `create` 工具创建子代理，例如：
```javascript
// 代理通过 LLM 调用
const subAgentId = await create({ role: "code-reviewer" });
```

---

## 进阶：创建自定义代理工厂

如果你需要批量创建多个代理，可以创建一个工厂脚本：

```javascript
// agents-factory.js
async function createAgentTeam(workspaceId, teamConfig) {
  const agents = [];
  
  for (const config of teamConfig) {
    const agent = await fetch('http://localhost:3017/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        creatorId: workspaceId,
        role: config.role,
        guidance: config.guidance,
      }),
    }).then(r => r.json());
    
    agents.push(agent);
  }
  
  return agents;
}

// 使用示例
const team = await createAgentTeam('workspace-123', [
  { role: 'coder', guidance: 'Python expert...' },
  { role: 'reviewer', guidance: 'Code reviewer...' },
  { role: 'tester', guidance: 'QA engineer...' },
]);
```

---

## 资源链接

- [系统架构](../README.md)
- [技术方案](./tech_stack.md)
- [API 文档](../../backend/README.md)
- [GitHub 仓库](https://github.com/chmod777john/swarm-ide)

---

## 支持

如有问题，请查看：
- 项目日志：`backend/.logs/`
- GitHub Issues：提交 Bug 报告
