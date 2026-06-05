# Hermes Desktop CN 发布说明

## 推荐下载

请优先从 GitHub Releases 下载：

```text
Hermes-Chinese-win-unpacked.zip
```

解压后运行：

```text
Hermes.exe
```

这是便携版，不需要安装器。更新时下载新版 zip，解压覆盖或替换旧目录即可。

## 当前版本

- 中文版版本：`0.15.1 CN`
- 上游版本：Hermes Desktop `0.15.1`
- 适用平台：Windows
- 源码分支：`cn-source`

## 不建议的更新方式

不要使用官方 Hermes 的更新入口覆盖中文版本。中文版本的更新入口会引导到本仓库 Releases，避免拉取官方仓库后把中文覆盖掉。

## 自行构建

推荐直接使用 `cn-source` 分支：

```powershell
git switch cn-source
npm install
npm --prefix apps/desktop run i18n:check
npm --prefix apps/desktop run pack
```

生成目录：

```text
apps/desktop/release/win-unpacked
```

可执行文件：

```text
apps/desktop/release/win-unpacked/Hermes.exe
```

如果你在 `main` 分支的 `source/` 快照中构建：

```powershell
cd source
npm install
npm --prefix apps/desktop run pack
```

生成目录：

```text
source/apps/desktop/release/win-unpacked
```

## 自动生成 Release

仓库提供 `Build CN Release` workflow：

1. 在 GitHub Actions 中手动运行 `Build CN Release`。
1. 输入 tag，例如 `v0.15.1-cn.1`。
1. workflow 会 checkout `cn-source`，运行 i18n/type/lint 检查并构建便携版。
1. 产物会压缩为 `Hermes-Chinese-win-unpacked.zip`。
1. workflow 会创建 draft Release，确认可运行后再公开发布。

## 上游同步

仓库提供 `Sync Upstream` workflow：

1. 手动运行 workflow。
1. workflow 拉取官方 `NousResearch/hermes-agent` 的 `main`。
1. 创建 `sync/upstream-*` 分支。
1. 尝试合并到同步分支并创建 PR 到 `cn-source`。
1. 如有冲突，需要人工解决后再合并。

这个流程不会自动合并到 `main`，也不会破坏展示分支。

## 发布文案建议

Release 标题：

```text
Hermes Desktop CN 0.15.1
```

Release 简介：

```text
基于 Hermes Desktop 0.15.1 的中文汉化版。已内置中文 i18n，并修复 Windows Desktop 构建链路。下载 Hermes-Chinese-win-unpacked.zip，解压后运行 Hermes.exe。
```

## 已知说明

- 本仓库不是上游官方仓库，是中文汉化发行版本。
- 完整维护源码位于 `cn-source` 分支。
- 构建前请确保 Node.js 版本满足 `apps/desktop/package.json` 中的 engines 要求。
- 构建产物不会提交到源码仓库，应通过 GitHub Releases 单独发布。
