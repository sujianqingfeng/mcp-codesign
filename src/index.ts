#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import { WebSocket } from "ws"

// WebSocket中转服务的连接参数
const WS_BRIDGE_URL = process.env.WS_BRIDGE_URL || "ws://localhost:3691"
// WebSocket客户端连接
let wsClient: WebSocket | null = null

// 连接到WebSocket中转服务
function connectToWsBridge() {
	wsClient = new WebSocket(WS_BRIDGE_URL)
	
	wsClient.on("open", () => {
		console.error("Connected to WebSocket Bridge")
	})
	
	wsClient.on("close", () => {
		setTimeout(connectToWsBridge, 5000) // 尝试重新连接
	})
	
	wsClient.on("error", (error) => {
		console.error("WebSocket connection error:", error)
	})
}

const server = new McpServer({
	name: "codesign",
	version: "1.0.3",
})

server.tool(
	"get_upload_url",
	"get upload url from codesign",
	{
		originUrl: z.string().describe("url"),
    width: z.number().describe("width"),
    height: z.number().describe("height"),
    scale: z.number().describe("scale"),
	},
	async ({ originUrl, width, height, scale }) => {

    const doubleWidth = Math.floor(width / scale) * 2
    const doubleHeight = Math.floor(height / scale) * 2

    const url = `${originUrl}?imageMogr2/thumbnail/${doubleWidth}x${doubleHeight}/interlace/1`
		
		return {
			content: [
				{
					type: "text",
					text: url,
				},
			],
		}
	},
)

// 添加获取标注数据的工具
server.tool(
	"get_annotation_data",
	"get annotation data from codesign",
	{},
	async () => {
    let annotationData: any = null
    let errorMessage: string | null = null
    
		// 主动向WebSocket中转服务请求最新数据
		if (wsClient && wsClient.readyState === WebSocket.OPEN) {
			// 创建一个Promise，当接收到消息时解决
			const annotationPromise = new Promise<any>((resolve) => {
				// 使用once只监听一次message事件
				wsClient!.once("message", (message) => {
					try {
						const data = JSON.parse(message.toString())
						if (data.type === "annotation") {
							resolve(data.data)
						} else if (data.type === "error") {
              errorMessage = data.message || "Unknown error occurred"
              resolve(null)
            } else {
							resolve(null) // 如果收到的不是标注数据，则返回null
						}
					} catch (error) {
						console.error("Error parsing message:", error)
						errorMessage = "Error parsing message from server"
						resolve(null)
					}
				})
				
				// 监听error事件
				wsClient!.once("error", (error) => {
					errorMessage = error.message || "WebSocket error occurred during request"
					resolve(null)
				})
				
				// 设置超时，防止无限等待
				setTimeout(() => {
					errorMessage = errorMessage || "Request timed out after 5 seconds"
					resolve(null)
				}, 5000)
			})
			
			// 发送获取标注数据的请求
			wsClient.send(JSON.stringify({
				type: "getAnnotation"
			}))
			
			// 等待数据返回
			const newAnnotationData = await annotationPromise
      if (newAnnotationData) {
        annotationData = newAnnotationData
      }
		} else {
      errorMessage = "WebSocket is not connected"
    }
		
		// 返回当前的标注数据
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(
            annotationData 
              ? annotationData  
              : { error: errorMessage || "No annotation data available" }
          ),
				},
			],
		}
	},
)

async function main() {
	// 连接到WebSocket中转服务
	connectToWsBridge()
	
	const transport = new StdioServerTransport()
	await server.connect(transport)
	console.error("Codesign MCP Server running on stdio")
	console.error(`Connected to WebSocket Bridge at ${WS_BRIDGE_URL}`)
}

main().catch((error) => {
	console.error("Fatal error in main():", error)
	process.exit(1)
})
