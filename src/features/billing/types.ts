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

export type { Plan, StoreSubscription, SubscriptionStatus }
