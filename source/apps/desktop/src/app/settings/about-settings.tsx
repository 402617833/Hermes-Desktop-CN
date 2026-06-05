import { useStore } from '@nanostores/react'
import type { TFunction } from 'i18next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Sparkles } from '@/lib/icons'
import { cn } from '@/lib/utils'
import {
  $desktopVersion,
  $updateApply,
  $updateChecking,
  $updateStatus,
  checkUpdates,
  openUpdatesWindow,
  refreshDesktopVersion
} from '@/store/updates'

import { ListRow, SectionHeading, SettingsContent } from './primitives'

const RELEASE_NOTES_URL = 'https://github.com/NousResearch/hermes-agent/releases'

function relativeTime(ms: number | undefined, t: TFunction) {
  if (!ms) {
    return t('relativeTime.never')
  }

  const diff = Date.now() - ms

  if (diff < 60_000) {
    return t('relativeTime.justNow')
  }

  if (diff < 3_600_000) {
    return t('relativeTime.minutesAgo', { count: Math.round(diff / 60_000) })
  }

  if (diff < 86_400_000) {
    return t('relativeTime.hoursAgo', { count: Math.round(diff / 3_600_000) })
  }

  return t('relativeTime.daysAgo', { count: Math.round(diff / 86_400_000) })
}

export function AboutSettings() {
  const { t } = useTranslation()
  const version = useStore($desktopVersion)
  const status = useStore($updateStatus)
  const apply = useStore($updateApply)
  const checking = useStore($updateChecking)
  const [justChecked, setJustChecked] = useState(false)

  // The version atom is loaded once at app boot, which makes About show a
  // stale number after a self-update (the running binary is current, the
  // displayed string is not). Re-read on mount so opening About always
  // reflects the running build.
  useEffect(() => {
    void refreshDesktopVersion()
  }, [])

  const behind = status?.behind ?? 0
  const supported = status?.supported !== false
  const applying = apply.applying || apply.stage === 'restart'

  const handleCheck = async () => {
    setJustChecked(false)
    const next = await checkUpdates()
    setJustChecked(Boolean(next))
  }

  let statusLine: string
  let statusTone: 'idle' | 'available' | 'error' = 'idle'

  if (!supported) {
    statusLine = status?.message ?? t('settings.about.updates.unsupported')
    statusTone = 'error'
  } else if (status?.error) {
    statusLine = t('settings.about.updates.serverUnreachable')
    statusTone = 'error'
  } else if (applying) {
    statusLine = t('settings.about.updates.installing')
    statusTone = 'available'
  } else if (behind > 0) {
    statusLine = t('settings.about.updates.ready', { count: behind })
    statusTone = 'available'
  } else if (status) {
    statusLine = t('settings.about.updates.latest')
  } else {
    statusLine = t('settings.about.updates.promptCheck')
  }

  return (
    <SettingsContent>
      <div className="flex flex-col items-center gap-3 pt-6 pb-2 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-8" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t('settings.about.appName')}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {version?.appVersion ? t('settings.about.version', { version: version.appVersion }) : t('settings.about.versionUnavailable')}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-4 w-full max-w-2xl">
        <SectionHeading icon={RefreshCw} title={t('settings.about.updates.title')} />

        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            statusTone === 'available' && 'border-primary/30 bg-primary/5 text-foreground',
            statusTone === 'error' && 'border-destructive/35 bg-destructive/5 text-destructive',
            statusTone === 'idle' && 'border-border/70 bg-muted/20 text-foreground'
          )}
        >
          <div className="min-w-0">
            <p className="font-medium">{statusLine}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('settings.about.updates.lastChecked', { time: relativeTime(status?.fetchedAt, t) })}
              {justChecked && !checking ? ' · ' + t('relativeTime.justNow') : ''}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Button
              disabled={checking || applying || !supported}
              onClick={() => void handleCheck()}
              size="sm"
              variant="textStrong"
            >
              {checking && <Loader2 className="size-3 animate-spin" />}
              {checking ? t('settings.about.updates.checking') : t('settings.about.updates.checkNow')}
            </Button>

            {behind > 0 && supported && !applying && (
              <Button onClick={() => openUpdatesWindow()} size="sm">
                {t('settings.about.updates.seeWhatsNew')}
              </Button>
            )}

            <Button asChild className="ml-auto" size="sm" variant="text">
              <a
                href={RELEASE_NOTES_URL}
                onClick={event => {
                  event.preventDefault()
                  void window.hermesDesktop?.openExternal?.(RELEASE_NOTES_URL)
                }}
                rel="noreferrer"
                target="_blank"
              >
                {t('settings.about.updates.releaseNotes')}
              </a>
            </Button>
          </div>
        </div>

        <ListRow
          description={t('settings.about.updates.automaticDescription')}
          hint={t('settings.about.updates.branchCommit', {
            branch: status?.branch ?? t('common.unknown'),
            commit: status?.currentSha?.slice(0, 7) ?? t('common.unknown')
          })}
          title={t('settings.about.updates.automaticTitle')}
        />
      </div>
    </SettingsContent>
  )
}
