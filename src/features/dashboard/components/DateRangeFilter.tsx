'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'

type Preset = '1d' | '7d' | '30d' | 'custom'

const PRESETS: { label: string; value: Preset }[] = [
    { label: 'Hoy', value: '1d' },
    { label: '7 días', value: '7d' },
    { label: '30 días', value: '30d' },
    { label: 'Personalizado', value: 'custom' },
]

function toDateStr(d: Date): string {
    return d.toISOString().slice(0, 10)
}

function presetDates(preset: Exclude<Preset, 'custom'>): { from: string; to: string } {
    const now = new Date()
    const to = toDateStr(now)
    const from = new Date(now)
    const days = preset === '1d' ? 0 : preset === '7d' ? 6 : 29
    from.setDate(now.getDate() - days)
    return { from: toDateStr(from), to }
}

function detectActivePreset(from: string | null, to: string | null): Preset {
    if (!from || !to) return '30d'
    const candidates: Exclude<Preset, 'custom'>[] = ['1d', '7d', '30d']
    for (const p of candidates) {
        const expected = presetDates(p)
        if (expected.from === from && expected.to === to) return p
    }
    return 'custom'
}

interface Props {
    currentFrom?: string
    currentTo?: string
}

export function DateRangeFilter({ currentFrom, currentTo }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const detectedPreset = detectActivePreset(currentFrom ?? null, currentTo ?? null)
    const [showCustom, setShowCustom] = useState(detectedPreset === 'custom')
    const activePreset = showCustom ? 'custom' : detectedPreset
    const [customFrom, setCustomFrom] = useState(currentFrom ?? '')
    const [customTo, setCustomTo] = useState(currentTo ?? '')

    function navigate(from: string, to: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('from', from)
        params.set('to', to)
        router.replace(`${pathname}?${params.toString()}`)
    }

    function handlePreset(preset: Preset) {
        if (preset === 'custom') {
            setShowCustom(true)
            return
        }
        setShowCustom(false)
        const { from, to } = presetDates(preset)
        navigate(from, to)
    }

    function handleCustomSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!customFrom || !customTo || customFrom > customTo) return
        navigate(customFrom, customTo)
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                {PRESETS.map((preset) => (
                    <button
                        key={preset.value}
                        type="button"
                        onClick={() => handlePreset(preset.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            activePreset === preset.value
                                ? 'bg-green-500 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {showCustom && (
                <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
                    <input
                        type="date"
                        value={customFrom}
                        max={customTo || undefined}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <span className="text-xs text-gray-400">—</span>
                    <input
                        type="date"
                        value={customTo}
                        min={customFrom || undefined}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors"
                    >
                        Aplicar
                    </button>
                </form>
            )}
        </div>
    )
}
