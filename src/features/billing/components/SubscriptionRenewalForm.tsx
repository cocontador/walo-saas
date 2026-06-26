'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'

import { cancelPlanRenewal } from '../actions/cancelPlanRenewal'
import { reactivatePlan } from '../actions/reactivatePlan'
import type { SubscriptionRenewalActionState } from '../types'

type RenewalAction = 'cancel' | 'reactivate'

interface SubscriptionRenewalFormProps {
  actionType: RenewalAction
}

const INITIAL_STATE: SubscriptionRenewalActionState = {
  status: 'idle',
  message: '',
}

const ACTION_CONFIG = {
  cancel: {
    action: cancelPlanRenewal,
    label: 'Cancelar renovación',
    pendingLabel: 'Cancelando...',
    className:
      'border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:bg-white',
  },
  reactivate: {
    action: reactivatePlan,
    label: 'Reactivar plan',
    pendingLabel: 'Reactivando...',
    className:
      'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-600',
  },
} satisfies Record<
  RenewalAction,
  {
    action: (
      previousState: SubscriptionRenewalActionState,
      formData: FormData
    ) => Promise<SubscriptionRenewalActionState>
    label: string
    pendingLabel: string
    className: string
  }
>

function SubmitButton({ actionType }: SubscriptionRenewalFormProps) {
  const { pending } = useFormStatus()
  const config = ACTION_CONFIG[actionType]

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${config.className}`}
    >
      {pending ? config.pendingLabel : config.label}
    </button>
  )
}

function getFeedbackClasses(state: SubscriptionRenewalActionState) {
  if (state.status === 'success') {
    return 'border-green-200 bg-green-50 text-green-800'
  }

  if (
    state.status === 'already_canceled' ||
    state.status === 'not_canceling' ||
    state.status === 'expired'
  ) {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  return 'border-red-200 bg-red-50 text-red-800'
}

export function SubscriptionRenewalForm({ actionType }: SubscriptionRenewalFormProps) {
  const router = useRouter()
  const config = ACTION_CONFIG[actionType]
  const [state, formAction] = useActionState(config.action, INITIAL_STATE)

  useEffect(() => {
    if (state.status === 'success') {
      router.refresh()
    }
  }, [router, state.status])

  return (
    <form action={formAction} className="space-y-3">
      <SubmitButton actionType={actionType} />
      {state.status !== 'idle' && (
        <p className={`rounded-lg border px-3 py-2 text-xs font-medium ${getFeedbackClasses(state)}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}
