'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'

import { changePlan } from '../actions/changePlan'
import type { PlanChangeState } from '../types'

interface PlanChangeFormProps {
  planSlug: string
  ctaLabel: string
  isFeatured?: boolean
}

const INITIAL_PLAN_CHANGE_STATE: PlanChangeState = {
  status: 'idle',
  message: '',
}

function SubmitButton({
  ctaLabel,
  isFeatured,
}: {
  ctaLabel: string
  isFeatured?: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
        isFeatured
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'bg-gray-950 text-white hover:bg-gray-800'
      }`}
    >
      {pending ? 'Confirmando...' : ctaLabel}
    </button>
  )
}

function getFeedbackClasses(state: PlanChangeState) {
  if (state.status === 'success') {
    return 'border-green-200 bg-green-50 text-green-800'
  }

  if (state.status === 'current') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  return 'border-red-200 bg-red-50 text-red-800'
}

export function PlanChangeForm({ planSlug, ctaLabel, isFeatured }: PlanChangeFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(changePlan, INITIAL_PLAN_CHANGE_STATE)

  useEffect(() => {
    if (state.status === 'success') {
      router.refresh()
    }
  }, [router, state.status])

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="planSlug" value={planSlug} />
      <SubmitButton ctaLabel={ctaLabel} isFeatured={isFeatured} />
      {state.status !== 'idle' && (
        <p className={`rounded-lg border px-3 py-2 text-xs font-medium ${getFeedbackClasses(state)}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}
