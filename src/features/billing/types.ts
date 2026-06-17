import type { Plan, StoreSubscription, SubscriptionStatus } from '@prisma/client'

export type PlanDetails = Plan

export interface CurrentPlanInfo {
  plan: PlanDetails
  subscription: StoreSubscription | null
  isTrialing: boolean
  isExpired: boolean
}

export interface PlanUsageInfo {
  activeProducts: number
  productLimit: number | null
  isUnlimited: boolean
  usagePercentage: number
  isNearLimit: boolean // true si >= 80% of limit
  shouldUpgrade: boolean // true si at limit o near limit and not unlimited
}

export interface PlanCatalogItem {
  plan: PlanDetails
  slug: string
  name: string
  description: string
  price: string
  priceDetail: string
  domainLabel: string
  productLimitLabel: string
  features: string[]
  limitations: string[]
  ctaLabel: string
  isCurrent: boolean
  isPopular: boolean
}

export interface PlanCatalogInfo {
  plans: PlanCatalogItem[]
  currentPlanSlug: string
}

export type PlanChangeStatus =
  | 'idle'
  | 'success'
  | 'current'
  | 'invalid_plan'
  | 'payment_error'
  | 'unauthorized'
  | 'error'

export interface PlanChangeState {
  status: PlanChangeStatus
  message: string
}

export type { Plan, StoreSubscription, SubscriptionStatus }
