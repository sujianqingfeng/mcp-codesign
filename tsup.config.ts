import { defineConfig } from "tsup"

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"], // 同时输出 CommonJS 和 ESM 格式
	dts: true, // 生成类型声明文件
	splitting: false,
	sourcemap: false,
	clean: true, // 每次构建前清理输出目录
	minify: false, // 不压缩代码，方便调试
	outDir: "dist",
	noExternal: ["zod-to-json-schema"], // 将 zod-to-json-schema 打包到输出文件中
})
