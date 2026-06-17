import type { PlanCatalogItem } from '../types'
import { PlanChangeForm } from './PlanChangeForm'

interface PlanComparisonCardsProps {
  plans: PlanCatalogItem[]
}

export function PlanComparisonCards({ plans }: PlanComparisonCardsProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {plans.map((plan) => {
        const isFeatured = plan.isPopular && !plan.isCurrent

        return (
          <article
            key={plan.slug}
            className={`relative flex min-h-full flex-col rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
              isFeatured ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'
            } ${plan.isCurrent ? 'border-green-500 bg-green-50/40' : ''}`}
          >
            <div className="flex min-h-8 items-center gap-2">
              {plan.isCurrent && (
                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                  Plan actual
                </span>
              )}
              {plan.isPopular && (
                <span className="rounded-full bg-gray-950 px-3 py-1 text-xs font-semibold text-white">
                  Más popular
                </span>
              )}
            </div>

            <div className="mt-5">
              <h3 className="text-xl font-bold text-gray-950">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-950">{plan.price}</span>
                {plan.priceDetail && (
                  <span className="text-sm font-medium text-gray-500">{plan.priceDetail}</span>
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-emerald-700">{plan.domainLabel}</p>
              <p className="mt-3 min-h-12 text-sm leading-6 text-gray-600">{plan.description}</p>
            </div>

            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-bold uppercase text-gray-500">Límite principal</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{plan.productLimitLabel}</p>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm leading-5 text-gray-700">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {plan.limitations.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-5">
                <p className="text-xs font-bold uppercase text-gray-500">Restricciones</p>
                <ul className="mt-3 space-y-2">
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex gap-3 text-sm leading-5 text-gray-500">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto pt-8">
              {plan.isCurrent ? (
                <span className="block w-full rounded-lg border border-green-200 bg-green-100 px-4 py-3 text-center text-sm font-semibold text-green-800">
                  Vigente
                </span>
              ) : (
                <PlanChangeForm
                  planSlug={plan.slug}
                  ctaLabel={plan.ctaLabel}
                  isFeatured={isFeatured}
                />
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
