'use client'

import React from 'react'
import type { PlanDetails, PlanUsageInfo } from '../types'
import { PLAN_DETAILS_MAP } from '../utils/limits'

interface PlanLimitsCardProps {
  plan: PlanDetails
  usage: PlanUsageInfo
  upgradeHref?: string
}

export function PlanLimitsCard({ plan, usage, upgradeHref }: PlanLimitsCardProps) {
  const planSlug = plan.slug.toLowerCase()
  const planDetails = PLAN_DETAILS_MAP[planSlug] || {
    price: '$0',
    features: plan.features as string[],
    limitations: (plan.limitations as string[]) || [],
  }

  const usagePercentage = usage.usagePercentage
  const isLimitReached = usage.shouldUpgrade && !usage.isNearLimit
  const shouldShowAlert = !usage.isUnlimited && usage.shouldUpgrade

  // Color de barra y textos según porcentaje/estado
  let progressBgColor = 'bg-green-500'
  let borderAlertColor = 'border-green-100'
  let bgAlertColor = 'bg-green-50'
  let textAlertColor = 'text-green-800'
  let badgeColor = 'bg-green-100 text-green-700'
  let alertTitle = 'Tu plan está al día'
  let alertMessage = 'Tienes espacio disponible para seguir creando productos.'

  if (isLimitReached) {
    progressBgColor = 'bg-red-500 animate-pulse'
    borderAlertColor = 'border-red-200'
    bgAlertColor = 'bg-red-50'
    textAlertColor = 'text-red-800'
    badgeColor = 'bg-red-100 text-red-700'
    alertTitle = 'Límite alcanzado'
    alertMessage = 'Has llegado al límite máximo de productos activos. Sube de plan para permitir que tus clientes vean tus nuevos productos.'
  } else if (usage.isNearLimit) {
    progressBgColor = 'bg-amber-500'
    borderAlertColor = 'border-amber-200'
    bgAlertColor = 'bg-amber-50'
    textAlertColor = 'text-amber-800'
    badgeColor = 'bg-amber-100 text-amber-700'
    alertTitle = 'Cerca del límite'
    alertMessage = `Has utilizado el ${Math.round(usagePercentage)}% de tu límite de productos. Considera subir de plan para evitar interrupciones.`
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all md:p-8">
      {/* Header del Plan */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${badgeColor}`}>
            Plan {plan.name}
          </span>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">{planDetails.price}</h3>
          <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
        </div>
        {plan.slug !== 'business' && (
          <a
            href={upgradeHref ?? '/dashboard/billing#upgrade-plans'}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:from-green-600 hover:to-emerald-700 hover:shadow-md sm:w-auto"
          >
            Mejorar plan
          </a>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Uso de Productos */}
      <div>
        <div className="flex items-center justify-between text-sm font-medium text-gray-700">
          <span>Productos Activos</span>
          <span>
            {usage.activeProducts}{' '}
            <span className="text-gray-400">
              / {usage.isUnlimited ? 'Ilimitados' : plan.productLimit}
            </span>
          </span>
        </div>

        {!usage.isUnlimited && (
          <div className="mt-3">
            <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressBgColor}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-gray-500">
              {Math.round(usagePercentage)}% consumido
            </p>
          </div>
        )}
      </div>

      {/* Alerta de Umbral */}
      {shouldShowAlert && (
        <div className={`rounded-xl border ${borderAlertColor} ${bgAlertColor} p-4`}>
          <div className="flex gap-3">
            <div className="mt-0.5">
              {isLimitReached ? (
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${textAlertColor}`}>{alertTitle}</h4>
              <p className={`mt-1 text-xs leading-relaxed ${textAlertColor}`}>{alertMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Funciones del plan */}
      <div className="grid gap-6 border-t border-gray-100 pt-6 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">¿Qué incluye tu plan?</h4>
          <ul className="mt-3 space-y-2.5">
            {planDetails.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {planDetails.limitations.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Restricciones</h4>
            <ul className="mt-3 space-y-2.5">
              {planDetails.limitations.map((limitation, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
