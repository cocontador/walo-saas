import { ArrowUpRight, DollarSign, MessageSquare, ShoppingBag } from "lucide-react"

interface DashboardStatsProps {
    stats: {
        totalRevenue: number
        totalOrders: number
        whatsappClicks: number
    }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

    const cardData = [
        {
            title: "Total Ventas",
            value: formatter.format(stats.totalRevenue),
            helper: "Ingresos confirmados",
            icon: DollarSign,
            color: "text-emerald-700 bg-emerald-50 border-emerald-100",
        },
        {
            title: "Pedidos Completados",
            value: stats.totalOrders.toString(), // <-- Corregido: ya no es stats.stats
            helper: "Compras registradas",
            icon: ShoppingBag,
            color: "text-sky-700 bg-sky-50 border-sky-100",
        },
        {
            title: "Clics en WhatsApp",
            value: stats.whatsappClicks.toString(), // <-- Corregido
            helper: "Intención de contacto",
            icon: MessageSquare,
            color: "text-lime-700 bg-lime-50 border-lime-100",
        },
    ]

    return (
        <div className="mb-8 grid gap-4 md:grid-cols-3">
            {cardData.map((card, index) => {
                const Icon = card.icon
                return (
                    <div
                        key={index}
                        className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="text-sm font-semibold text-gray-500">{card.title}</span>
                                <p className="mt-1 text-xs text-gray-400">{card.helper}</p>
                            </div>
                            <div className={`rounded-xl border p-2.5 ${card.color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-5 flex items-end justify-between gap-3">
                            <span className="text-3xl font-black tracking-tight text-gray-950">
                                {card.value}
                            </span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition group-hover:bg-emerald-50 group-hover:text-emerald-700">
                                <ArrowUpRight className="h-4 w-4" />
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
