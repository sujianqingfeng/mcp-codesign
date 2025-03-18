#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

const server = new McpServer({
	name: "codesign",
	version: "1.0.2",
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

async function main() {
	const transport = new StdioServerTransport()
	await server.connect(transport)
	console.error("Codesign MCP Server running on stdio")
}

main().catch((error) => {
	console.error("Fatal error in main():", error)
	process.exit(1)
})
