# 中文更新日志

## 0.15.1 CN

基于 Hermes Desktop `0.15.1` 的中文汉化发行版本。

### 新增

- 新增中文 i18n 资源：`source/apps/desktop/src/i18n/locales/zh.ts`
- 新增英文 i18n 资源：`source/apps/desktop/src/i18n/locales/en.ts`
- 新增 i18n 初始化入口：`source/apps/desktop/src/i18n/index.ts`
- Desktop UI 组件接入 `i18next` + `react-i18next`
- 根目录整理为发布型仓库结构，完整源码统一放入 `source/`

### 汉化范围

- 主界面与侧边栏
- 聊天输入框、附件菜单、提示片段
- 设置页与常用配置项
- 模型设置、模型选择器、模型可见性弹窗
- MCP 设置
- Gateway 网关设置
- Provider / API Keys 页面
- 消息平台配置
- 更新弹窗与 About / Updates 页面
- 桌面安装、启动失败、引导覆盖层
- 通知、分页、右侧文件树等常用 UI

### Windows 构建修复

- 将 Desktop TypeScript 配置调整为 ES2023
- Vite 配置使用 `realpathSync(__dirname)` 处理 Windows Junction / 真实路径混用问题
- Electron 打包版本同步为实际安装版本 `40.10.2`
- 新增 `source/apps/desktop/scripts/patch-build-config.cjs`
- Desktop build 前自动执行补丁脚本，避免安装器 retry 覆盖手动修复

### 说明

- Hermes、Nous、OpenRouter、Claude、Grok 等品牌名称默认保留英文
- 发行包建议使用 `Hermes-Chinese-win-unpacked.zip` 命名
- 若需要自行构建，请先进入 `source/` 目录再执行构建命令
