import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const i18nDir = resolve(__dirname, '../src/i18n')
const requiredFiles = ['types.ts', 'en.ts', 'zh.ts', 'catalog.ts', 'runtime.ts', 'context.tsx', 'index.ts']

let failed = false

for (const file of requiredFiles) {
  const source = readFileSync(resolve(i18nDir, file), 'utf8')

  if (source.trim().length === 0) {
    console.error(`i18n file is empty: ${file}`)
    failed = true
  }
}

const enSource = readFileSync(resolve(i18nDir, 'en.ts'), 'utf8')
const zhSource = readFileSync(resolve(i18nDir, 'zh.ts'), 'utf8')

if (!enSource.includes('Translations')) {
  console.error('en.ts must satisfy the Translations type contract.')
  failed = true
}

if (!zhSource.includes('Translations')) {
  console.error('zh.ts must satisfy the Translations type contract.')
  failed = true
}

if (failed) {
  process.exit(1)
}

console.log('i18n locale check passed: official typed i18n catalog is present.')
