'use server'

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { khipuConfig, validateKhipuConfig } from '@/lib/khipu'
import { logError } from '@/lib/logger'
import { OrderStatus } from '@prisma/client'

type PaymentData = {
    storeId: string
    storeName: string
    items: any[]
    totalAmount: number
    customerNotes?: string
}

export async function createPaymentIntent(data: PaymentData) {
    try {
        validateKhipuConfig()

        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    storeId: data.storeId,
                    totalAmount: data.totalAmount,
                    customerNotes: data.customerNotes || null,
                    itemsSnapshot: data.items,
                    status: OrderStatus.PENDING,
                },
            })

            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            const endpoint = `${khipuConfig.apiUrl}/payments`
            const isLocalhost = appUrl.startsWith('http://localhost') || appUrl.startsWith('http://127.')

            const payload: Record<string, string> = {
                amount: data.totalAmount.toString(),
                currency: 'CLP',
                ...(isLocalhost ? {} : { notify_url: `${appUrl}/api/webhooks/khipu` }),
                return_url: `${appUrl}/pago/${order.id}`,
                subject: `Compra en ${data.storeName}`,
                transaction_id: order.id,
            }

            const sortedKeys = Object.keys(payload).sort()
            const bodyParams = new URLSearchParams()
            sortedKeys.forEach((key) => bodyParams.append(key, payload[key]))

            let toSign = `POST&${encodeURIComponent(endpoint)}`
            sortedKeys.forEach((key) => {
                toSign += `&${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`
            })

            const hash = crypto
                .createHmac('sha256', khipuConfig.secret)
                .update(toSign)
                .digest('hex')

            const authorization = `${khipuConfig.receiverId}:${hash}`

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: authorization,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: bodyParams.toString(),
            })

            const responseText = await response.text()

            if (!response.ok) {
                throw new Error(`Khipu API Error: ${responseText}`)
            }

            const khipuData = JSON.parse(responseText)

            await tx.paymentAttempt.create({
                data: {
                    orderId: order.id,
                    khipuPaymentId: khipuData.payment_id,
                    khipuPaymentUrl: khipuData.payment_url,
                    amount: data.totalAmount,
                    status: 'pending',
                },
            })

            return { paymentUrl: khipuData.payment_url }
        })

        return { success: true, paymentUrl: result.paymentUrl }
    } catch (error) {
        logError({
            event: 'payment.create_intent.error',
            scope: 'payment',
            message: 'Error createPaymentIntent',
        })
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al iniciar el pago',
        }
    }
}