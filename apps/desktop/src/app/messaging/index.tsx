import type { TFunction } from 'i18next'
import type * as React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageLoader } from '@/components/page-loader'
import { StatusDot, type StatusTone } from '@/components/status-dot'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DisclosureCaret } from '@/components/ui/disclosure-caret'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  getMessagingPlatforms,
  type MessagingEnvVarInfo,
  type MessagingPlatformInfo,
  updateMessagingPlatform
} from '@/hermes'
import { AlertTriangle, ExternalLink, Save, Trash2 } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { notify, notifyError } from '@/store/notifications'

import { useRefreshHotkey } from '../hooks/use-refresh-hotkey'
import { useRouteEnumParam } from '../hooks/use-route-enum-param'
import { PageSearchShell } from '../page-search-shell'
import type { SetStatusbarItemGroup } from '../shell/statusbar-controls'

import { PlatformAvatar } from './platform-icon'

interface MessagingViewProps extends React.ComponentProps<'section'> {
  setStatusbarItemGroup?: SetStatusbarItemGroup
}

type EditMap = Record<string, Record<string, string>>

const TONE_VARIANT: Record<StatusTone, BadgeProps['variant']> = {
  good: 'default',
  muted: 'muted',
  warn: 'warn',
  bad: 'destructive'
}

const stateLabel = (state: null | string | undefined, t: TFunction) =>
  state ? t(`messaging.states.${state}`, { defaultValue: state.replace(/_/g, ' ') }) : t('messaging.unknown')

const stateHint = (state: null | string | undefined, gatewayRunning: boolean, t: TFunction) => {
  const key = state === 'pending_restart' ? 'pending_restart' : !gatewayRunning ? 'gateway_stopped' : ''

  return key ? t(`messaging.hints.${key}`) : null
}

function stateTone({ enabled, state }: MessagingPlatformInfo): StatusTone {
  if (!enabled) {
    return 'muted'
  }

  if (state === 'connected') {
    return 'good'
  }

  if (state === 'fatal' || state === 'startup_failed') {
    return 'bad'
  }

  return 'warn'
}

const trimEdits = (edits: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(edits)
      .map(([k, v]) => [k, v.trim()])
      .filter(([, v]) => v)
  )

const FIELD_COPY: Record<string, { advanced?: boolean; helpKey?: string; labelKey: string; placeholder?: string }> = {
  TELEGRAM_BOT_TOKEN: {
    labelKey: 'messaging.fieldLabels.botToken',
    helpKey: 'messaging.fieldHelp.telegramBotToken',
    placeholder: '123456:ABC...'
  },
  TELEGRAM_ALLOWED_USERS: {
    labelKey: 'messaging.fieldLabels.allowedTelegramUsers',
    helpKey: 'messaging.fieldHelp.telegramAllowedUsers'
  },
  TELEGRAM_PROXY: {
    labelKey: 'messaging.fieldLabels.proxyUrl',
    helpKey: 'messaging.fieldHelp.telegramProxy',
    advanced: true
  },
  DISCORD_BOT_TOKEN: {
    labelKey: 'messaging.fieldLabels.botToken',
    helpKey: 'messaging.fieldHelp.discordBotToken'
  },
  DISCORD_ALLOWED_USERS: {
    labelKey: 'messaging.fieldLabels.allowedDiscordUsers',
    helpKey: 'messaging.fieldHelp.discordAllowedUsers'
  },
  DISCORD_REPLY_TO_MODE: {
    labelKey: 'messaging.fieldLabels.replyStyle',
    helpKey: 'messaging.fieldHelp.discordReplyMode',
    advanced: true
  },
  SLACK_BOT_TOKEN: {
    labelKey: 'messaging.fieldLabels.slackBotToken',
    helpKey: 'messaging.fieldHelp.slackBotToken',
    placeholder: 'xoxb-...'
  },
  SLACK_APP_TOKEN: {
    labelKey: 'messaging.fieldLabels.slackAppToken',
    helpKey: 'messaging.fieldHelp.slackAppToken',
    placeholder: 'xapp-...'
  },
  SLACK_ALLOWED_USERS: {
    labelKey: 'messaging.fieldLabels.allowedSlackUsers',
    helpKey: 'messaging.fieldHelp.slackAllowedUsers'
  },
  MATTERMOST_URL: {
    labelKey: 'messaging.fieldLabels.serverUrl',
    placeholder: 'https://mattermost.example.com'
  },
  MATTERMOST_TOKEN: {
    labelKey: 'messaging.fieldLabels.botToken'
  },
  MATTERMOST_ALLOWED_USERS: {
    labelKey: 'messaging.fieldLabels.allowedUserIds',
    helpKey: 'messaging.fieldHelp.mattermostAllowedUsers'
  },
  MATRIX_HOMESERVER: {
    labelKey: 'messaging.fieldLabels.homeserverUrl',
    placeholder: 'https://matrix.org'
  },
  MATRIX_ACCESS_TOKEN: {
    labelKey: 'messaging.fieldLabels.accessToken'
  },
  MATRIX_USER_ID: {
    labelKey: 'messaging.fieldLabels.botUserId',
    placeholder: '@hermes:example.org'
  },
  MATRIX_ALLOWED_USERS: {
    labelKey: 'messaging.fieldLabels.allowedMatrixUsers',
    helpKey: 'messaging.fieldHelp.matrixAllowedUsers'
  },
  SIGNAL_HTTP_URL: {
    labelKey: 'messaging.fieldLabels.signalBridgeUrl',
    placeholder: 'http://127.0.0.1:8080',
    helpKey: 'messaging.fieldHelp.signalHttpUrl'
  },
  SIGNAL_ACCOUNT: {
    labelKey: 'messaging.fieldLabels.phoneNumber',
    helpKey: 'messaging.fieldHelp.signalAccount'
  },
  SIGNAL_ALLOWED_USERS: {
    labelKey: 'messaging.fieldLabels.allowedSignalUsers',
    helpKey: 'messaging.fieldHelp.signalAllowedUsers'
  },
  WHATSAPP_ENABLED: {
    labelKey: 'messaging.fieldLabels.enableWhatsAppBridge',
    helpKey: 'messaging.fieldHelp.whatsappEnabled',
    advanced: true
  },
  WHATSAPP_MODE: {
    labelKey: 'messaging.fieldLabels.bridgeMode',
    advanced: true
  },
  WHATSAPP_ALLOWED_USERS: {
    labelKey: 'messaging.fieldLabels.allowedWhatsAppUsers',
    helpKey: 'messaging.fieldHelp.whatsappAllowedUsers'
  }
}

function fieldCopy(field: MessagingEnvVarInfo, t: TFunction) {
  const copy = FIELD_COPY[field.key]

  return {
    label: copy ? t(copy.labelKey) : field.prompt || field.key,
    help: copy?.helpKey ? t(copy.helpKey) : field.description,
    placeholder: copy?.placeholder || field.prompt,
    advanced: Boolean(copy?.advanced || field.advanced)
  }
}

export function MessagingView({ setStatusbarItemGroup: _setStatusbarItemGroup, ...props }: MessagingViewProps) {
  const { t } = useTranslation()
  const [platforms, setPlatforms] = useState<MessagingPlatformInfo[] | null>(null)
  const [edits, setEdits] = useState<EditMap>({})
  const [query, setQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const platformIds = useMemo(() => platforms?.map(p => p.id) ?? [], [platforms])
  const [selectedId, setSelectedId] = useRouteEnumParam('platform', platformIds, platformIds[0] ?? '')

  const refreshPlatforms = useCallback(async (silent = false) => {
    if (!silent) {
      setRefreshing(true)
    }

    try {
      const result = await getMessagingPlatforms()
      setPlatforms(result.platforms)
    } catch (err) {
      if (!silent) {
        notifyError(err, t('messaging.failedToLoad'))
      }
    } finally {
      if (!silent) {
        setRefreshing(false)
      }
    }
  }, [])

  useRefreshHotkey(() => void refreshPlatforms())

  useEffect(() => {
    void refreshPlatforms()
  }, [refreshPlatforms])

  // Auto-poll while the user is on the messaging page so connection status
  // updates without a manual "check" click. Pause when the tab is hidden.
  useEffect(() => {
    let cancelled = false

    function tick() {
      if (cancelled || document.hidden) {
        return
      }

      void refreshPlatforms(true)
    }

    const id = window.setInterval(tick, 6000)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [refreshPlatforms])

  const selected = useMemo(() => {
    if (!platforms) {
      return null
    }

    return platforms.find(platform => platform.id === selectedId) || platforms[0] || null
  }, [platforms, selectedId])

  const visiblePlatforms = useMemo(() => {
    if (!platforms) {
      return []
    }

    const q = query.trim().toLowerCase()

    if (!q) {
      return platforms
    }

    return platforms.filter(platform =>
      [platform.id, platform.name, platform.description, platform.state]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(q))
    )
  }, [platforms, query])

  async function handleToggle(platform: MessagingPlatformInfo, enabled: boolean) {
    setSaving(`enabled:${platform.id}`)

    try {
      await updateMessagingPlatform(platform.id, { enabled })
      setPlatforms(
        current =>
          current?.map(row =>
            row.id === platform.id
              ? {
                  ...row,
                  enabled,
                  state: enabled ? (row.configured ? 'pending_restart' : 'not_configured') : 'disabled'
                }
              : row
          ) ?? current
      )
      notify({
        kind: 'success',
        title: t(enabled ? 'messaging.enabledTitle' : 'messaging.disabledTitle', { name: platform.name }),
        message: t('messaging.gatewayRestartRequired')
      })
    } catch (err) {
      notifyError(err, t('messaging.failedToUpdate', { name: platform.name }))
    } finally {
      setSaving(null)
    }
  }

  async function handleSave(platform: MessagingPlatformInfo) {
    const env = trimEdits(edits[platform.id] || {})

    if (Object.keys(env).length === 0) {
      return
    }

    setSaving(`env:${platform.id}`)

    try {
      await updateMessagingPlatform(platform.id, { env })
      setEdits(current => ({ ...current, [platform.id]: {} }))
      await refreshPlatforms()
      notify({
        kind: 'success',
        title: t('messaging.setupSavedTitle', { name: platform.name }),
        message: t('messaging.gatewayReconnectRequired')
      })
    } catch (err) {
      notifyError(err, t('messaging.failedToSave', { name: platform.name }))
    } finally {
      setSaving(null)
    }
  }

  async function handleClear(platform: MessagingPlatformInfo, key: string) {
    setSaving(`clear:${key}`)

    try {
      await updateMessagingPlatform(platform.id, { clear_env: [key] })
      setEdits(current => ({
        ...current,
        [platform.id]: {
          ...(current[platform.id] || {}),
          [key]: ''
        }
      }))
      await refreshPlatforms()
      notify({ kind: 'success', title: t('messaging.clearedTitle', { key }), message: t('messaging.setupUpdated', { name: platform.name }) })
    } catch (err) {
      notifyError(err, t('messaging.failedToClear', { key }))
    } finally {
      setSaving(null)
    }
  }

  return (
    <PageSearchShell
      {...props}
      onSearchChange={setQuery}
      searchHidden={(platforms?.length ?? 0) === 0}
      searchPlaceholder={t('messaging.search')}
      searchValue={query}
    >
      {!platforms ? (
        <PageLoader label={t('messaging.loading')} />
      ) : (
        <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto p-2">
            <ul className="space-y-1">
              {visiblePlatforms.map(platform => (
                <li key={platform.id}>
                  <PlatformRow
                    active={selected?.id === platform.id}
                    onSelect={() => setSelectedId(platform.id)}
                    platform={platform}
                  />
                </li>
              ))}
            </ul>
          </aside>

          <main className="min-h-0 overflow-hidden">
            {selected && (
              <PlatformDetail
                edits={edits[selected.id] || {}}
                onClear={key => void handleClear(selected, key)}
                onEdit={(key, value) =>
                  setEdits(current => ({
                    ...current,
                    [selected.id]: {
                      ...(current[selected.id] || {}),
                      [key]: value
                    }
                  }))
                }
                onSave={() => void handleSave(selected)}
                onToggle={enabled => void handleToggle(selected, enabled)}
                platform={selected}
                saving={saving}
                t={t}
              />
            )}
          </main>
        </div>
      )}
    </PageSearchShell>
  )
}

function PlatformRow({
  active,
  onSelect,
  platform
}: {
  active: boolean
  onSelect: () => void
  platform: MessagingPlatformInfo
}) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
        active
          ? 'bg-(--ui-row-active-background) text-foreground'
          : 'text-(--ui-text-secondary) hover:bg-(--ui-row-hover-background) hover:text-foreground'
      )}
      onClick={onSelect}
      type="button"
    >
      <PlatformAvatar platformId={platform.id} platformName={platform.name} />
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="truncate text-[length:var(--conversation-text-font-size)] font-normal">{platform.name}</span>
        <StatusDot tone={stateTone(platform)} />
      </span>
    </button>
  )
}

function PlatformDetail({
  edits,
  onClear,
  onEdit,
  onSave,
  onToggle,
  platform,
  saving,
  t
}: {
  edits: Record<string, string>
  onClear: (key: string) => void
  onEdit: (key: string, value: string) => void
  onSave: () => void
  onToggle: (enabled: boolean) => void
  platform: MessagingPlatformInfo
  saving: string | null
  t: TFunction
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasEdits = Object.keys(trimEdits(edits)).length > 0
  const requiredFields = platform.env_vars.filter(field => field.required)
  const optionalFields = platform.env_vars.filter(field => !field.required && !fieldCopy(field, t).advanced)
  const advancedFields = platform.env_vars.filter(field => !field.required && fieldCopy(field, t).advanced)
  const hiddenCount = advancedFields.length
  const isSavingEnv = saving === `env:${platform.id}`

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-5 px-5 py-4">
          <header className="flex items-start gap-3">
            <PlatformAvatar platformId={platform.id} platformName={platform.name} />
            <div className="min-w-0 flex-1">
              <h3 className="text-[0.9375rem] font-semibold tracking-tight">{platform.name}</h3>
              <p className="mt-1 text-[length:var(--conversation-caption-font-size)] leading-(--conversation-caption-line-height) text-(--ui-text-tertiary)">
                {platform.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatePill tone={stateTone(platform)}>{stateLabel(platform.state, t)}</StatePill>
                <SetupPill active={platform.configured}>
                  {platform.configured ? t('messaging.credentialsSet') : t('messaging.needsSetup')}
                </SetupPill>
                {!platform.gateway_running && <SetupPill active={false}>{t('messaging.gatewayStopped')}</SetupPill>}
              </div>
              <PlatformHint platform={platform} t={t} />
            </div>
          </header>

          {platform.error_message && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[length:var(--conversation-caption-font-size)] leading-(--conversation-caption-line-height) text-destructive">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span>{platform.error_message}</span>
            </div>
          )}

          <section>
            <SectionTitle>{t('messaging.getCredentials')}</SectionTitle>
            <p className="mt-1 text-[length:var(--conversation-caption-font-size)] leading-(--conversation-caption-line-height) text-(--ui-text-tertiary)">
              {introCopy(platform, t)}
            </p>
            <div className="mt-3">
              <Button asChild size="sm" variant="textStrong">
                <a href={platform.docs_url} rel="noreferrer" target="_blank">
                  {t('messaging.openSetupGuide')}
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </div>
          </section>

          <section>
            <SectionTitle>{t('messaging.required')}</SectionTitle>
            <div className="mt-3 space-y-4">
              {requiredFields.length > 0 ? (
                requiredFields.map(field => (
                  <MessagingField
                    edits={edits}
                    field={field}
                    key={field.key}
                    onClear={onClear}
                    onEdit={onEdit}
                    saving={saving}
                    t={t}
                  />
                ))
              ) : (
                <p className="text-[length:var(--conversation-caption-font-size)] leading-(--conversation-caption-line-height) text-(--ui-text-tertiary)">
                  {t('messaging.noTokenNeeded')}
                </p>
              )}
            </div>
          </section>

          {optionalFields.length > 0 && (
            <section>
              <SectionTitle>{t('messaging.recommended')}</SectionTitle>
              <div className="mt-3 space-y-4">
                {optionalFields.map(field => (
                  <MessagingField
                    edits={edits}
                    field={field}
                    key={field.key}
                    onClear={onClear}
                    onEdit={onEdit}
                    saving={saving}
                    t={t}
                  />
                ))}
              </div>
            </section>
          )}

          {hiddenCount > 0 && (
            <section>
              <button
                className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                onClick={() => setShowAdvanced(value => !value)}
                type="button"
              >
                <span>{t('messaging.advanced')} ({hiddenCount})</span>
                <DisclosureCaret open={showAdvanced} size="0.875rem" />
              </button>
              {showAdvanced && (
                <div className="mt-3 space-y-4">
                  {advancedFields.map(field => (
                    <MessagingField
                      edits={edits}
                      field={field}
                      key={field.key}
                      onClear={onClear}
                      onEdit={onEdit}
                      saving={saving}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <footer className="bg-(--ui-chat-surface-background) px-5 py-2.5">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-2">
          <Switch
            aria-label={t(platform.enabled ? 'messaging.disablePlatform' : 'messaging.enablePlatform', { name: platform.name })}
            checked={platform.enabled}
            disabled={saving === `enabled:${platform.id}`}
            onCheckedChange={onToggle}
            size="xs"
          />

          <div className="ml-auto flex items-center gap-2">
            {hasEdits && <span className="text-xs text-muted-foreground">{t('messaging.unsavedChanges')}</span>}
            <Button disabled={!hasEdits || isSavingEnv} onClick={onSave} size="sm">
              <Save />
              {isSavingEnv ? t('messaging.saving') : t('messaging.saveChanges')}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

const introCopy = (platform: MessagingPlatformInfo, t: TFunction) =>
  t(`messaging.intros.${platform.id}`, { defaultValue: platform.description })

function MessagingField({
  edits,
  field,
  onClear,
  onEdit,
  saving,
  t
}: {
  edits: Record<string, string>
  field: MessagingEnvVarInfo
  onClear: (key: string) => void
  onEdit: (key: string, value: string) => void
  saving: string | null
  t: TFunction
}) {
  const copy = fieldCopy(field, t)

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor={`messaging-field-${field.key}`}>
          {copy.label}
        </label>
        {field.is_set && <span className="text-[0.66rem] font-medium text-primary">{t('messaging.saved')}</span>}
      </div>
      <div className="flex items-center gap-2">
        <Input
          className="font-mono"
          id={`messaging-field-${field.key}`}
          onChange={event => onEdit(field.key, event.target.value)}
          placeholder={field.is_set ? field.redacted_value || t('messaging.replaceCurrentValue') : copy.placeholder}
          type={field.is_password ? 'password' : 'text'}
          value={edits[field.key] || ''}
        />
        {field.url && (
          <Button asChild size="icon-sm" title={t('messaging.openDocs')} variant="ghost">
            <a href={field.url} rel="noreferrer" target="_blank">
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        )}
        {field.is_set && (
          <Button
            disabled={saving === `clear:${field.key}`}
            onClick={() => onClear(field.key)}
            size="icon-sm"
            title={t('messaging.clearField', { key: field.key })}
            variant="ghost"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
      {copy.help && <p className="text-xs leading-5 text-muted-foreground">{copy.help}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{children}</h4>
}

function PlatformHint({ platform, t }: { platform: MessagingPlatformInfo; t: TFunction }) {
  if (!platform.enabled || platform.state === 'connected') {
    return null
  }

  const hint = stateHint(platform.state, platform.gateway_running, t)

  return hint ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p> : null
}

function StatePill({ children, tone }: { children: string; tone: StatusTone }) {
  return (
    <Badge variant={TONE_VARIANT[tone]}>
      <StatusDot tone={tone} />
      {children}
    </Badge>
  )
}

function SetupPill({ active, children }: { active: boolean; children: string }) {
  return <Badge variant={active ? 'default' : 'muted'}>{children}</Badge>
}
