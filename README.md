# mcp-codesign

一个基于 MCP (Model Context Protocol) 的图片链接处理工具，用于优化图片 URL 以控制图片尺寸与质量。

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

