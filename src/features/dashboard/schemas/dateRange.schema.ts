import { z } from 'zod'

export const dateRangeSchema = z
    .object({
        from: z.string().date().optional(),
        to: z.string().date().optional(),
    })
    .refine(({ from, to }) => !from || !to || from <= to, {
        message: 'from debe ser anterior o igual a to',
        path: ['from'],
    })

export type DateRangeInput = z.infer<typeof dateRangeSchema>

export type DateRange = {
    from: Date
    to: Date
}

const DEFAULT_DAYS = 30

export function parseDateRange(params: { from?: string; to?: string }): DateRange {
    const result = dateRangeSchema.safeParse(params)
    const now = new Date()

    if (!result.success || !result.data.from || !result.data.to) {
        const from = new Date(now)
        from.setDate(now.getDate() - DEFAULT_DAYS)
        from.setHours(0, 0, 0, 0)
        const to = new Date(now)
        to.setHours(23, 59, 59, 999)
        return { from, to }
    }

    const [fy, fm, fd] = result.data.from.split('-').map(Number)
    const from = new Date(fy, fm - 1, fd, 0, 0, 0, 0)
    const [ty, tm, td] = result.data.to.split('-').map(Number)
    const to = new Date(ty, tm - 1, td, 23, 59, 59, 999)
    return { from, to }
}
