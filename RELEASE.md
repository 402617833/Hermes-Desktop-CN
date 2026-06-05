# Hermes Desktop CN 发布说明

## 版本

- 中文版版本：`0.15.1 CN`
- 上游版本：Hermes Desktop `0.15.1`
- 适用平台：Windows

## 推荐下载

如果 GitHub Releases 中已经上传成品包，优先下载：

```text
Hermes-Chinese-win-unpacked.zip
```

解压后运行：

```text
Hermes.exe
```

## 自行构建

### 1. 克隆仓库后进入源码目录

```powershell
cd source
```

### 2. 安装依赖

```powershell
npm install
```

### 3. 构建便携版

```powershell
npm --prefix apps/desktop run pack
```

生成目录：

```text
source/apps/desktop/release/win-unpacked
```

可执行文件：

```text
source/apps/desktop/release/win-unpacked/Hermes.exe
```

### 4. 构建 Windows 安装器

```powershell
npm --prefix apps/desktop run dist:win
```

输出目录：

```text
source/apps/desktop/release/
```

## 发布到 GitHub Releases

建议上传以下文件：

```text
Hermes-Chinese-win-unpacked.zip
```

压缩来源：

```text
source/apps/desktop/release/win-unpacked
```

Release 标题建议：

```text
Hermes Desktop CN 0.15.1
```

Release 简介建议：

```text
基于 Hermes Desktop 0.15.1 的中文汉化版。已内置中文 i18n，并修复 Windows Desktop 构建链路。下载 Hermes-Chinese-win-unpacked.zip，解压后运行 Hermes.exe。
```

## 已知说明

- 本仓库不是上游官方仓库，是中文汉化发行版本
- 完整源码位于 `source/` 目录
- 构建前请确保 Node.js 版本满足 `source/apps/desktop/package.json` 中的 engines 要求
- 构建产物不会提交到源码仓库，建议通过 GitHub Releases 单独发布
