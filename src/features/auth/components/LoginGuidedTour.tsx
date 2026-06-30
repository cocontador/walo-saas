'use client'

import { HelpCircle } from 'lucide-react'
import { driver, type DriveStep } from 'driver.js'

type LoginTourStep = DriveStep & {
  element: string
}

const loginTourSteps: LoginTourStep[] = [
  {
    element: '[data-tour="login-form"]',
    popover: {
      title: 'Inicio de sesión',
      description: 'Desde aquí puedes ingresar a WALO para administrar tu tienda digital.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="login-email"]',
    popover: {
      title: 'Correo electrónico',
      description: 'Ingresa el correo que usaste al crear tu cuenta.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="login-password"]',
    popover: {
      title: 'Contraseña',
      description: 'Escribe tu contraseña para acceder de forma segura a tu cuenta.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="login-submit"]',
    popover: {
      title: 'Ingresar a WALO',
      description: 'Presiona este botón para entrar a tu dashboard y administrar tu catálogo.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="login-register-link"]',
    popover: {
      title: 'Crear cuenta',
      description: 'Si todavía no tienes cuenta, puedes registrarte desde este enlace para comenzar a usar WALO.',
      side: 'bottom',
      align: 'center',
    },
  },
]

function getAvailableSteps() {
  return loginTourSteps.flatMap((step) => {
    const element = getFirstVisibleElement(step.element)

    if (!element) {
      return []
    }

    return [{ ...step, element }]
  })
}

function getFirstVisibleElement(selector: string) {
  return Array.from(document.querySelectorAll(selector)).find((element) => {
    const styles = window.getComputedStyle(element)

    return (
      styles.display !== 'none' &&
      styles.visibility !== 'hidden' &&
      (element.clientWidth > 0 || element.clientHeight > 0 || element.getClientRects().length > 0)
    )
  })
}

export function LoginGuidedTour() {
  const startTour = () => {
    const availableSteps = getAvailableSteps()

    if (availableSteps.length === 0) {
      return
    }

    const loginTour = driver({
      steps: availableSteps,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.56,
      stagePadding: 8,
      stageRadius: 14,
      popoverClass: 'walo-driver-popover',
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
    })

    loginTour.drive()
  }

  return (
    <button
      type="button"
      data-tour="login-help-button"
      onClick={startTour}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      <HelpCircle className="h-4 w-4" />
      Ver ayuda para iniciar sesión
    </button>
  )
}
