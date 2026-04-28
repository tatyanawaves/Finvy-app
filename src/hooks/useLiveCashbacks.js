// ─────────────────────────────────────────────────────────────────────────────
// useLiveCashbacks
// Подгружает актуальный снапшот кэшбеков из Supabase (view `current_cashbacks`).
// Фолбэк — статический BANKS из src/data/bankCashbacks.js.
// Снапшоты обновляются ежедневно Edge Function `update-cashbacks` (pg_cron 03:00 UTC).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BANKS as STATIC_BANKS } from '../data/bankCashbacks'

const STATIC_FALLBACK = {
  banks: STATIC_BANKS,
  version: 0,
  source: 'static',
  updatedAt: null,
  loading: false,
  error: null,
}

let cache = null
let inflight = null
const listeners = new Set()

function notify() {
  for (const l of listeners) l(cache)
}

function pickBanks(snapshot) {
  // Поддерживаем два варианта: data может быть массивом (legacy) или { banks: [...] }
  if (!snapshot) return null
  if (Array.isArray(snapshot)) return snapshot
  if (Array.isArray(snapshot.banks)) return snapshot.banks
  return null
}

async function fetchOnce() {
  if (cache && cache.source === 'live') return cache
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const { data, error } = await supabase
        .from('current_cashbacks')
        .select('data, version, created_at')
        .maybeSingle()

      if (error) throw error

      const banks = pickBanks(data?.data)
      if (banks && banks.length > 0) {
        cache = {
          banks,
          version: data.version ?? 0,
          source: 'live',
          updatedAt: data.created_at ?? null,
          loading: false,
          error: null,
        }
      } else {
        cache = { ...STATIC_FALLBACK }
      }
    } catch (e) {
      console.warn('[useLiveCashbacks] live fetch failed, using static fallback:', e?.message || e)
      cache = { ...STATIC_FALLBACK, error: e?.message || String(e) }
    } finally {
      inflight = null
      notify()
    }
    return cache
  })()

  return inflight
}

/**
 * React-хук для получения актуального списка банков и карт.
 * Возвращает сразу статику (мгновенный рендер), затем заменяется live-данными.
 */
export function useLiveCashbacks() {
  const [state, setState] = useState(cache || { ...STATIC_FALLBACK, loading: true })

  useEffect(() => {
    listeners.add(setState)
    if (!cache) {
      fetchOnce()
    } else {
      setState(cache)
    }
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return state
}

/** Принудительно перезапросить снапшот (например, после ручного триггера админом). */
export function refreshLiveCashbacks() {
  cache = null
  return fetchOnce()
}
