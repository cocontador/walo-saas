"use client"

import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"

import {
  setStoreActiveFromForm,
  type SetStoreActiveFormState,
} from "@/features/admin/actions/setStoreActive"

type StoreModerationFormProps = {
  storeId: string
  isActive: boolean
}

const INITIAL_STATE: SetStoreActiveFormState = {
  status: "idle",
  message: "",
}

function SubmitButton({ isActive }: { isActive: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
        isActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {pending ? "Guardando..." : isActive ? "Desactivar tienda" : "Reactivar tienda"}
    </button>
  )
}

export function StoreModerationForm({ storeId, isActive }: StoreModerationFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useActionState(setStoreActiveFromForm, INITIAL_STATE)

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset()
      router.refresh()
    }
  }, [router, state.status])

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="storeId" value={storeId} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Motivo
        </span>
        <textarea
          name="reason"
          required
          minLength={3}
          rows={3}
          className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          placeholder={
            isActive
              ? "Ej. incumplimiento de condiciones de uso"
              : "Ej. revisión completada y tienda autorizada"
          }
        />
      </label>
      <SubmitButton isActive={isActive} />
      {state.status !== "idle" && (
        <p
          className={`rounded-lg border px-3 py-2 text-xs font-medium ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
