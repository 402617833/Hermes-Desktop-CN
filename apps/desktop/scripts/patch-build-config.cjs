const fs = require('fs')
const path = require('path')
const { createRequire } = require('module')

const desktopDir = path.resolve(__dirname, '..')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function patchTsConfig() {
  const tsconfigPath = path.join(desktopDir, 'tsconfig.json')
  const tsconfig = readJson(tsconfigPath)

  tsconfig.compilerOptions = tsconfig.compilerOptions || {}
  tsconfig.compilerOptions.target = 'ES2023'
  tsconfig.compilerOptions.lib = ['DOM', 'DOM.Iterable', 'ES2023']

  writeJson(tsconfigPath, tsconfig)
}

function resolveElectronVersion() {
  const requireFromDesktop = createRequire(path.join(desktopDir, 'package.json'))
  const electronPackagePath = requireFromDesktop.resolve('electron/package.json')
  return readJson(electronPackagePath).version
}

function patchPackageJson() {
  const packagePath = path.join(desktopDir, 'package.json')
  const packageJson = readJson(packagePath)
  const electronVersion = resolveElectronVersion()

  packageJson.build = packageJson.build || {}
  packageJson.build.electronVersion = electronVersion

  writeJson(packagePath, packageJson)
  return electronVersion
}

function patchViteConfig() {
  const viteConfigPath = path.join(desktopDir, 'vite.config.ts')
  let source = fs.readFileSync(viteConfigPath, 'utf8')

  if (!source.includes("import { realpathSync } from 'fs'")) {
    source = source.replace("import path from 'path'", "import path from 'path'\nimport { realpathSync } from 'fs'")
  }

  if (!source.includes('const desktopRoot = realpathSync(__dirname)')) {
    source = source.replace(/import \{ realpathSync \} from 'fs'\r?\n/, "import { realpathSync } from 'fs'\n\nconst desktopRoot = realpathSync(__dirname)\n")
  }

  if (!source.includes('root: desktopRoot,')) {
    source = source.replace(/export default defineConfig\(\{\r?\n/, 'export default defineConfig({\n  root: desktopRoot,\n')
  }

  source = source.replaceAll('path.resolve(__dirname,', 'path.resolve(desktopRoot,')

  fs.writeFileSync(viteConfigPath, source)
}

patchTsConfig()
patchViteConfig()
const electronVersion = patchPackageJson()

console.log(`[patch-build-config] desktop tsconfig ES2023, Vite realpath root, electronVersion ${electronVersion}`)
