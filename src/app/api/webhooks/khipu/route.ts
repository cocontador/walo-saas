import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { khipuConfig } from "@/lib/khipu";
import { OrderStatus } from "@prisma/client";
import { logError } from "@/lib/logger";

async function logKhipu(context: string, message: string, orderId?: string) {
    try {
        await prisma.khipuLog.create({
            data: { context, message, orderId }
        });
    } catch (e) {
        console.error("Error crítico: Falló el registro en KhipuLog", e);
        logError({
            event: 'khipu.log.failed',
            scope: 'webhook',
            message: 'Falló el registro en KhipuLog',
        })
    }
}

const khipuNotificationSchema = z.object({
    api_version: z.string(),
    notification_token: z.string(),
});

export async function POST(req: NextRequest) {
    const bodyText = await req.text();

    await logKhipu("WEBHOOK_RECEIVED", bodyText);

    try {
        const params = new URLSearchParams(bodyText);
        const notificationToken = params.get("notification_token");

        const payload = {
            api_version: params.get("api_version") || "",
            notification_token: notificationToken || "",
        };

        const parsedData = khipuNotificationSchema.safeParse(payload);
        if (!parsedData.success) {
            await logKhipu("INVALID_PAYLOAD", JSON.stringify(parsedData.error));
            return new NextResponse("Invalid payload", { status: 400 });
        }

        const { notification_token } = parsedData.data;

        const khipuEndpoint = `${khipuConfig.apiUrl}/payments`;
        const toSign = `GET&${encodeURI(khipuEndpoint)}&notification_token=${notification_token}`;
        const hash = crypto.createHmac("sha256", khipuConfig.secret).update(toSign).digest("hex");
        const authorizationHeader = `${khipuConfig.receiverId}:${hash}`;

        const khipuResponse = await fetch(`${khipuEndpoint}?notification_token=${notification_token}`, {
            method: "GET",
            headers: { "Authorization": authorizationHeader },
        });

        if (!khipuResponse.ok) {
            await logKhipu("VERIFICATION_FAILED", `Status: ${khipuResponse.status}`, notificationToken || "N/A");
            return new NextResponse("Verification failed", { status: 400 });
        }

        const paymentData = await khipuResponse.json();
        const { payment_id, status } = paymentData;

        const paymentAttempt = await prisma.paymentAttempt.findUnique({
            where: { khipuPaymentId: payment_id },
            include: { order: true },
        });

        if (!paymentAttempt) {
            await logKhipu("PAYMENT_NOT_FOUND", `ID: ${payment_id}`);
            return new NextResponse("Payment attempt not found", { status: 404 });
        }

        if (paymentAttempt.status === "done" || paymentAttempt.order.status === OrderStatus.PAID) {
            return new NextResponse("OK", { status: 200 });
        }

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
            await logKhipu("PAYMENT_SUCCESS", `Orden ${paymentAttempt.orderId} pagada`, paymentAttempt.orderId);
        } else if (status === "rejected") {
            await prisma.paymentAttempt.update({
                where: { id: paymentAttempt.id },
                data: { status: "rejected" },
            });
            await logKhipu("PAYMENT_REJECTED", `Orden ${paymentAttempt.orderId} rechazada`, paymentAttempt.orderId);
        }

        return new NextResponse("OK", { status: 200 });

    } catch (error: any) {
        await logKhipu("CRITICAL_ERROR", error.message);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}