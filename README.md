# Hermes Desktop CN

![Hermes Agent](source/assets/banner.png)

Hermes Desktop CN 是 Hermes Desktop 的中文汉化发行版，基于 NousResearch/hermes-agent 制作。

[下载最新版](https://github.com/402617833/Hermes-Desktop-CN/releases) · [中文说明](README.zh-CN.md) · [发布说明](RELEASE.md) · [反馈问题](https://github.com/402617833/Hermes-Desktop-CN/issues)

## 这个仓库怎么用

- 普通用户：从 [Releases](https://github.com/402617833/Hermes-Desktop-CN/releases) 下载 `Hermes-Chinese-win-unpacked.zip`，解压后运行 `Hermes.exe`。
- 开发者：查看 `cn-source` 分支或本分支的 `source/` 目录，按源码说明自行构建。
- 反馈者：通过 Issues 选择中文模板提交 Bug、安装问题、未翻译文本或功能建议。

## 分支用途

| 分支 | 用途 |
| --- | --- |
| `main` | 干净展示页、下载说明、Issue 模板、可见 Actions 入口 |
| `cn-source` | 完整中文源码、构建、i18n 检查、上游同步、桌面更新源 |

不要把 GitHub 提示里的 `cn-source -> main` Compare & pull request 直接合并；那会把完整源码铺到 `main` 根目录，破坏展示分支结构。

## 下载和更新

推荐始终从 [Releases](https://github.com/402617833/Hermes-Desktop-CN/releases) 获取新版中文包。

```text
Hermes-Chinese-win-unpacked.zip
```

解压后运行：

```text
Hermes.exe
```

如果你正在使用旧版中文包，更新方式是下载新的 zip，解压覆盖或替换旧目录。不要使用官方 Hermes 的更新入口覆盖中文版本。

## 目录结构

```text
.
├─ README.md
├─ README.zh-CN.md
├─ CHANGELOG_CN.md
├─ RELEASE.md
├─ LICENSE
├─ .github/                 # Issue 模板和可见 Actions 入口
└─ source/                  # 完整 Hermes 汉化源码快照
   ├─ apps/desktop/         # Desktop/Electron 应用
   ├─ apps/shared/
   ├─ agent/
   ├─ hermes_cli/
   └─ ...
```

完整维护源码位于 `cn-source` 分支；`main` 的 `source/` 是便于浏览和复现构建的源码快照。

## 项目状态

- 基于 Hermes Desktop `0.15.1`
- 支持中文/英文 i18n 资源
- 默认保留 Hermes、Nous、OpenRouter、Claude、Grok 等品牌名称
- 已修复 Windows Desktop 打包链路中的 TypeScript、Vite realpath、Electron 版本同步问题
- `cn-source` 已加入 i18n 显式翻译检查、Release 构建 workflow、上游同步 workflow

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

## 从源码构建

建议直接使用 `cn-source` 分支构建：

```powershell
git switch cn-source
npm install
npm --prefix apps/desktop run i18n:check
npm --prefix apps/desktop run pack
```

也可以在 `main` 分支的源码快照中构建：

```powershell
cd source
npm install
npm --prefix apps/desktop run pack
```

生成位置：

```text
apps/desktop/release/win-unpacked/Hermes.exe
```

在 `main/source` 构建时路径是：

```text
source/apps/desktop/release/win-unpacked/Hermes.exe
```

## 自动化

- `Build CN Release`：手动从 `cn-source` 构建 Windows 便携 zip，并创建 draft Release。
- `Sync Upstream`：手动把官方 `upstream/main` 合并到 `sync/upstream-*` 分支，并创建 PR 到 `cn-source`。
- `Desktop CN Checks`：位于 `cn-source` 分支，检查 i18n、TypeScript 和 lint。

## 与上游关系

本项目是中文汉化发行版本，基于 NousResearch/hermes-agent 修改。原项目版权与许可证归原作者所有，本仓库遵循原项目许可证。

上游项目：

```text
https://github.com/NousResearch/hermes-agent
```

## License

MIT License. See [LICENSE](LICENSE).
