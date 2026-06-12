import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { khipuConfig } from "@/lib/khipu";
import { OrderStatus } from "@prisma/client";

// Schema para validar el payload inicial de Khipu
const khipuNotificationSchema = z.object({
    api_version: z.string(),
    notification_token: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        // 1. Leer datos del formulario (Khipu envía webhooks como form-urlencoded)
        const bodyText = await req.text();
        const params = new URLSearchParams(bodyText);

        // WALO-591: Observabilidad básica
        const notificationToken = params.get("notification_token");
        console.log("[WEBHOOK KHIPU RECIBIDO] Token:", notificationToken);

        const payload = {
            api_version: params.get("api_version") || "",
            notification_token: notificationToken || "",
        };

        const parsedData = khipuNotificationSchema.safeParse(payload);
        if (!parsedData.success) {
            console.error("Payload inválido:", parsedData.error);
            return new NextResponse("Invalid payload", { status: 400 });
        }

        const { notification_token } = parsedData.data;

        // 2. WALO-537: Verificación criptográfica con Khipu
        const khipuEndpoint = `${khipuConfig.apiUrl}/payments`;
        const toSign = `GET&${encodeURI(khipuEndpoint)}&notification_token=${notification_token}`;
        const hash = crypto.createHmac("sha256", khipuConfig.secret).update(toSign).digest("hex");
        const authorizationHeader = `${khipuConfig.receiverId}:${hash}`;

        const khipuResponse = await fetch(`${khipuEndpoint}?notification_token=${notification_token}`, {
            method: "GET",
            headers: {
                "Authorization": authorizationHeader,
            },
        });

        if (!khipuResponse.ok) {
            console.error("No se pudo verificar el token con Khipu");
            return new NextResponse("Verification failed", { status: 400 });
        }

        const paymentData = await khipuResponse.json();
        const { payment_id, status } = paymentData;

        // 3. WALO-539: Idempotencia
        const paymentAttempt = await prisma.paymentAttempt.findUnique({
            where: { khipuPaymentId: payment_id },
            include: { order: true },
        });

        if (!paymentAttempt) {
            console.error(`Intento de pago no encontrado en DB: ${payment_id}`);
            return new NextResponse("Payment attempt not found", { status: 404 });
        }

        // Si ya está pagado, no volvemos a procesar
        if (paymentAttempt.status === "done" || paymentAttempt.order.status === OrderStatus.PAID) {
            return new NextResponse("OK", { status: 200 });
        }

        // 4. WALO-528: Actualización transaccional
        if (status === "done") {
            await prisma.$transaction([
                prisma.paymentAttempt.update({
                    where: { id: paymentAttempt.id },
                    data: { status: "done" },
                }),
                prisma.order.update({
                    where: { id: paymentAttempt.orderId },
                    data: { status: OrderStatus.PAID },
                }),
            ]);
            console.log(`¡Pago exitoso! Orden ID: ${paymentAttempt.orderId}`);
        } else if (status === "rejected") {
            await prisma.paymentAttempt.update({
                where: { id: paymentAttempt.id },
                data: { status: "rejected" },
            });
            console.log(`Pago rechazado. Orden ID: ${paymentAttempt.orderId}`);
        }

        return new NextResponse("OK", { status: 200 });

    } catch (error) {
        console.error("Error crítico en Webhook Khipu:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}