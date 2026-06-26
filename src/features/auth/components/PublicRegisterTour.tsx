'use client'

import { HelpCircle } from 'lucide-react'
import { driver, type DriveStep } from 'driver.js'

type PublicTourStep = DriveStep & {
  element: string
}

type PublicRegisterTourProps = {
  label?: string
  compact?: boolean
}

const publicTourSteps: PublicTourStep[] = [
  {
    element: '[data-tour="public-hero"]',
    popover: {
      title: 'Bienvenido a WALO',
      description:
        'WALO te permite crear una tienda digital para mostrar tus productos y compartir tu catálogo con tus clientes.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="public-register-cta"]',
    popover: {
      title: 'Crea tu cuenta',
      description: 'Desde aquí puedes registrarte para comenzar a configurar tu tienda digital.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="register-form"]',
    popover: {
      title: 'Completa tus datos',
      description: 'Ingresa la información solicitada para crear tu cuenta de emprendedor.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="register-name"]',
    popover: {
      title: 'Datos de tu tienda',
      description: 'Agrega tu nombre y la información principal de tu tienda para crear tu catálogo.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="register-email"]',
    popover: {
      title: 'Datos de acceso',
      description: 'Usarás este correo para iniciar sesión y administrar tu tienda.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="register-password"]',
    popover: {
      title: 'Protege tu cuenta',
      description: 'Define una contraseña para acceder de forma segura a tu panel de WALO.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="register-submit"]',
    popover: {
      title: 'Accede a tu dashboard',
      description: 'Después de registrarte, podrás ingresar al panel donde administrarás tu tienda y tus productos.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="login-link"]',
    popover: {
      title: 'Ingresa cuando ya tengas cuenta',
      description: 'Si ya te registraste, entra desde aquí para continuar trabajando en tu tienda.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="catalog-preview"]',
    popover: {
      title: 'Prepara tu catálogo',
      description: 'Una vez dentro de WALO, podrás agregar productos, imágenes y compartir tu catálogo público.',
      side: 'left',
      align: 'center',
    },
  },
]

function getAvailableSteps() {
  return publicTourSteps.flatMap((step) => {
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

export function PublicRegisterTour({
  label = 'Ver cómo registrarme',
  compact = false,
}: PublicRegisterTourProps) {
  const startTour = () => {
    const availableSteps = getAvailableSteps()

    if (availableSteps.length === 0) {
      return
    }

    const publicTour = driver({
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

    publicTour.drive()
  }

  return (
    <button
      type="button"
      onClick={startTour}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white font-bold text-[#191c1d] shadow-sm transition hover:bg-[#f3f4f5] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2 ${
        compact ? 'h-10 w-10 px-0 text-sm' : 'px-6 py-3 text-base'
      }`}
      aria-label={label}
      title={label}
    >
      <HelpCircle className="h-4 w-4" />
      {!compact && <span>{label}</span>}
    </button>
  )
}
