import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localeDir = resolve(__dirname, '../src/i18n/locales')
const enPath = resolve(localeDir, 'en.ts')
const zhPath = resolve(localeDir, 'zh.ts')

function collectKeys(filePath) {
  const source = readFileSync(filePath, 'utf8')
  const keyPattern = /(['"])([^'"\n]+)\1\s*:/g
  const keys = []
  const counts = new Map()
  let match

  while ((match = keyPattern.exec(source))) {
    const key = match[2]

    if (!key.includes('.')) {
      continue
    }

    keys.push(key)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return { keys, keySet: new Set(keys), duplicates: [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key) }
}

const en = collectKeys(enPath)
const zh = collectKeys(zhPath)
const missing = en.keys.filter(key => !zh.keySet.has(key))
const extra = zh.keys.filter(key => !en.keySet.has(key))

let failed = false

function reportError(title, items) {
  if (items.length === 0) {
    return
  }

  failed = true
  console.error(`\n${title} (${items.length})`)

  for (const item of items) {
    console.error(`- ${item}`)
  }
}

function reportWarning(title, items) {
  if (items.length === 0) {
    return
  }

  console.warn(`\n${title} (${items.length})`)

  for (const item of items) {
    console.warn(`- ${item}`)
  }
}

reportError('Duplicate keys in en.ts', en.duplicates)
reportError('Duplicate keys in zh.ts', zh.duplicates)
reportError('Missing explicit zh translations', missing)
reportWarning('Extra zh keys not present in en.ts', extra)

if (failed) {
  process.exit(1)
}

console.log(`i18n locale check passed: ${en.keys.length} keys are explicitly translated in zh.ts.`)
