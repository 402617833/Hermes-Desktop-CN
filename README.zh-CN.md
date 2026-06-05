# Hermes Desktop CN

![Hermes Agent](source/assets/banner.png)

Hermes Desktop CN 是 Hermes Desktop 的中文汉化版，基于 NousResearch/hermes-agent 修改。

本仓库把完整上游源码统一放在 `source/` 目录下，根目录只保留项目说明、中文更新日志、发布说明和许可证。这样 GitHub 首页更干净，想直接下载的用户可以看 Release，想自行构建的开发者可以进入 `source/` 构建。

## 目录结构

```text
.
├─ README.md
├─ README.zh-CN.md
├─ CHANGELOG_CN.md
├─ RELEASE.md
├─ LICENSE
└─ source/              # 完整 Hermes 汉化源码
   ├─ apps/desktop/     # Desktop/Electron 应用
   ├─ apps/shared/
   ├─ agent/
   ├─ hermes_cli/
   └─ ...
```

## 项目状态

- 基于 Hermes Desktop `0.15.1`
- 支持中文/英文 i18n 资源
- 默认保留 Hermes、Nous、OpenRouter、Claude、Grok 等品牌名称
- 已修复 Windows Desktop 打包链路中的 TypeScript、Vite realpath、Electron 版本同步问题
- 构建脚本会在 desktop build 前自动应用必要补丁，避免安装器 retry 覆盖手动修复

## 已汉化范围

- 主界面与侧边栏
- 聊天输入框、附件菜单、提示片段
- 设置页与配置项
- 模型设置、模型选择器、模型可见性弹窗
- MCP 设置
- Gateway 网关设置
- Provider / API Keys 页面
- 消息平台配置
- 更新弹窗与 About / Updates 页面
- 桌面安装、启动失败、引导覆盖层
- 通知、分页、右侧文件树等常用 UI

## Windows 直接使用

如果 Releases 已提供 Windows 包，下载：

```text
Hermes-Chinese-win-unpacked.zip
```

解压后运行：

```text
Hermes.exe
```

如果提供安装器，也可以下载 `Hermes-*-win-*.exe` 双击安装。

## 从源码构建

### 1. 进入源码目录

```powershell
cd source
```

### 2. 安装依赖

```powershell
npm install
```

### 3. 打包便携版

```powershell
npm --prefix apps/desktop run pack
```

生成位置：

```text
source/apps/desktop/release/win-unpacked/Hermes.exe
```

### 4. 打包 Windows 安装器

```powershell
npm --prefix apps/desktop run dist:win
```

生成位置：

```text
source/apps/desktop/release/
```

## 汉化实现

本仓库使用 `i18next` + `react-i18next`：

```text
source/apps/desktop/src/i18n/index.ts
source/apps/desktop/src/i18n/locales/en.ts
source/apps/desktop/src/i18n/locales/zh.ts
```

应用启动时会加载 i18n，UI 组件通过 `useTranslation()` 调用翻译 key。

## Windows 构建修复

本仓库包含以下构建修复：

- `source/apps/desktop/tsconfig.json` 使用 ES2023
- `source/apps/desktop/vite.config.ts` 使用 `realpathSync(__dirname)` 处理 Windows Junction / 真实路径混用问题
- `source/apps/desktop/package.json` 的 Electron 打包版本同步到实际安装版本
- `source/apps/desktop/scripts/patch-build-config.cjs` 在构建前自动修补上述配置
- `source/scripts/install.ps1` 与 `source/scripts/install.sh` 在 desktop build 前运行补丁脚本

## 发布 Release 建议

1. 进入源码目录并打包：

```powershell
cd source
npm --prefix apps/desktop run pack
```

1. 压缩目录：

```text
source/apps/desktop/release/win-unpacked
```

1. 上传到 GitHub Releases，建议命名：

```text
Hermes-Chinese-win-unpacked.zip
```

1. Release 说明可以参考 [RELEASE.md](RELEASE.md)。

## 与上游关系

本项目是中文汉化发行版本，基于 NousResearch/hermes-agent 修改。原项目版权与许可证归原作者所有，本仓库遵循原项目许可证。

上游项目：

```text
https://github.com/NousResearch/hermes-agent
```

## License

MIT License. See `LICENSE`.
