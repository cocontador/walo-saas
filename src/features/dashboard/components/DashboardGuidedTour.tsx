'use client'

import { useCallback, useEffect, useRef } from 'react'
import { HelpCircle } from 'lucide-react'
import { driver, type DriveStep } from 'driver.js'

const TOUR_STORAGE_KEY = 'walo-dashboard-tour-completed'

type TourStepDefinition = DriveStep & {
  element: string
}

const tourSteps: TourStepDefinition[] = [
  {
    element: '[data-tour="dashboard-title"]',
    popover: {
      title: 'Bienvenida a tu dashboard',
      description:
        'Desde aquí puedes administrar tu tienda digital WALO, revisar tus productos y preparar tu catálogo para vender.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="store-summary"]',
    popover: {
      title: 'Tu tienda',
      description:
        'Aquí puedes revisar la información principal de tu tienda, como nombre, logo, colores o enlace público, según las opciones disponibles.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour="dashboard-products-card"]',
    popover: {
      title: 'Productos',
      description: 'En esta sección puedes crear, editar y administrar los productos que verán tus clientes.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="store-summary-public-catalog-link"]',
    popover: {
      title: 'Catálogo público',
      description: 'Este enlace te permite revisar cómo tus clientes ven tu tienda.',
      side: 'top',
      align: 'end',
    },
  },
  {
    element: '[data-tour="whatsapp-orders"]',
    popover: {
      title: 'Pedidos por WhatsApp',
      description: 'Tus clientes pueden contactarte rápidamente para comprar o consultar por tus productos.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="onboarding-checklist"]',
    popover: {
      title: 'Listo para comenzar',
      description: 'Completa tu tienda, agrega productos y comparte tu catálogo con tus clientes.',
      side: 'top',
      align: 'start',
    },
  },
]

function getAvailableSteps() {
  return tourSteps.flatMap((step) => {
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

function markTourAsCompleted() {
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, 'true')
  } catch {
    // El tour debe seguir funcionando aunque el navegador bloquee localStorage.
  }
}

function hasCompletedTour() {
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === 'true'
  } catch {
    return true
  }
}

type DashboardGuidedTourProps = {
  compact?: boolean
  autoStart?: boolean
}

export function DashboardGuidedTour({
  compact = false,
  autoStart = true,
}: DashboardGuidedTourProps) {
  const hasAutoStarted = useRef(false)

  const startTour = useCallback(() => {
    const availableSteps = getAvailableSteps()

    if (availableSteps.length === 0) {
      markTourAsCompleted()
      return
    }

    const tour = driver({
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
      onDestroyed: markTourAsCompleted,
    })

    tour.drive()
  }, [])

  useEffect(() => {
    if (!autoStart || hasAutoStarted.current || hasCompletedTour()) {
      return
    }

    hasAutoStarted.current = true
    const timer = window.setTimeout(startTour, 600)

    return () => window.clearTimeout(timer)
  }, [startTour, autoStart])

  return (
    <button
      type="button"
      onClick={startTour}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white text-sm font-bold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
        compact ? 'h-10 w-10 px-0' : 'px-4 py-2.5'
      }`}
      aria-label="Ver recorrido guiado"
      title="Ver recorrido guiado"
    >
      <HelpCircle className="h-4 w-4" />
      {!compact && <span>Ver recorrido guiado</span>}
    </button>
  )
}
