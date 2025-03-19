# MCP Codesign

Model Context Protocol integration for Codesign，提供浏览器插件与 MCP 服务器之间的通信能力。

## 架构

项目包含两个主要组件：

1. **WebSocket 中转服务** - 用于在浏览器插件和多个 MCP 服务器实例之间中转消息
2. **MCP 服务器** - 提供 MCP 工具功能，通过 WebSocket 客户端连接到中转服务

这种架构避免了多个 MCP 服务器实例在同一台机器上运行时的端口冲突问题。

## 安装

```bash
# 使用 pnpm 安装依赖
pnpm install
```

## 构建

```bash
pnpm run build
```

## 运行

需要先启动 WebSocket 中转服务，然后再启动 MCP 服务器：

### 1. 启动 WebSocket 中转服务

```bash
# 默认端口：浏览器插件 3690，MCP服务器 3691
pnpm run start:bridge

# 或者指定自定义端口
WS_PORT=8080 HTTP_PORT=8081 pnpm run start:bridge
```

### 2. 启动 MCP 服务器

```bash
# 默认连接到 ws://localhost:3691
pnpm run start

# 或者指定自定义中转服务地址
WS_BRIDGE_URL=ws://localhost:8081 pnpm run start
```

## 环境变量

- `WS_PORT` - 浏览器插件连接的端口（默认：3690）
- `HTTP_PORT` - MCP 服务器连接的端口（默认：3691）
- `WS_BRIDGE_URL` - MCP 服务器连接的 WebSocket 中转服务地址（默认：ws://localhost:3691）

## 功能

该工具主要用于处理图片 URL，支持根据指定的宽度、高度和缩放比例生成优化后的图片链接。适用于需要在不同设备上展示不同尺寸图片的场景。

## 配置说明

在 MCP 配置文件中添加以下配置:

```json
{
  "mcpServers": {
    "codesign": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-codesign@latest"
      ],
      "env": {}
    }
  }
}
```

## 使用示例

该工具提供 `get_upload_url` 方法，接受以下参数：

- `originUrl`: 原始图片 URL
- `width`: 目标宽度
- `height`: 目标高度
- `scale`: 缩放比例

返回经过优化处理的图片 URL，支持高分辨率设备的二倍图处理。

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 发布
pnpm release
```

## 许可证

ISC

