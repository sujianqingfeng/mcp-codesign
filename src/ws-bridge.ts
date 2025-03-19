#!/usr/bin/env node

import { WebSocketServer, WebSocket } from "ws"
import * as http from "http"

// 配置
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3690
const HTTP_PORT = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3691

// 存储连接的客户端（浏览器插件）
const browserClients = new Set<WebSocket>()
// 存储MCP服务器客户端
const mcpClients = new Set<WebSocket>()

// 创建HTTP服务器用于MCP服务器的连接
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('WebSocket Bridge Server')
})

// 创建WebSocket服务器给浏览器插件使用
const browserWss = new WebSocketServer({ port: WS_PORT })

// 创建WebSocket服务器给MCP服务器使用
const mcpWss = new WebSocketServer({ server: httpServer })

// 当浏览器插件连接时
browserWss.on("connection", (ws) => {
  console.log("Browser extension connected")
  browserClients.add(ws)

  // 处理来自浏览器插件的消息
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString())
      console.log("Received data from browser extension:", data)
      mcpClients.forEach((client) => {
        client.send(message.toString())
      })
    } catch (error) {
      console.error("Error parsing message from browser extension:", error)
    }
  })

  // 处理断开连接
  ws.on("close", () => {
    console.log("Browser extension disconnected")
    browserClients.delete(ws)
  })
})

// 当MCP服务器连接时
mcpWss.on("connection", (ws) => {
  console.log("MCP server connected")
  mcpClients.add(ws)

  // 处理来自MCP服务器的消息
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString())
      console.log(`Received data from MCP server: ${browserClients.size} browser clients`, data)

      if (browserClients.size > 0) {
        browserClients.forEach(client => {
          client.send(message.toString())
        })
      }
    } catch (error) {
      console.error("Error parsing message from MCP server:", error)
    }
  })

  // 处理断开连接
  ws.on("close", () => {
    console.log("MCP server disconnected")
    mcpClients.delete(ws)
  })
})

// 启动HTTP服务器
httpServer.listen(HTTP_PORT, () => {
  console.log(`WebSocket Bridge running on ports:`)
  console.log(`- Browser clients: ws://localhost:${WS_PORT}`)
  console.log(`- MCP servers: ws://localhost:${HTTP_PORT}`)
}) 