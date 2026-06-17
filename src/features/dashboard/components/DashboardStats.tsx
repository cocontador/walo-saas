import { ShoppingBag, MessageSquare, DollarSign } from "lucide-react"

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
            icon: DollarSign,
            color: "text-green-600 bg-green-50",
        },
        {
            title: "Pedidos Completados",
            value: stats.totalOrders.toString(), // <-- Corregido: ya no es stats.stats
            icon: ShoppingBag,
            color: "text-blue-600 bg-blue-50",
        },
        {
            title: "Clics en WhatsApp",
            value: stats.whatsappClicks.toString(), // <-- Corregido
            icon: MessageSquare,
            color: "text-emerald-600 bg-emerald-50",
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
            {cardData.map((card, index) => {
                const Icon = card.icon
                return (
                    <div key={index} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">{card.title}</span>
                            <div className={`p-2 rounded-xl ${card.color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-3xl font-bold tracking-tight text-gray-900">
                                {card.value}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}