import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

import { logError, logWarn } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Rate limiter en memoria — una sola instancia (escalar a Redis en Sprint 3)
// Clave: IP del cliente. Ventana deslizante de 15 minutos, máximo 5 intentos.
// ---------------------------------------------------------------------------
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

type RateEntry = { count: number; windowStart: number }
const rateLimitStore = new Map<string, RateEntry>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now })
    return false
  }

  entry.count += 1

  if (entry.count > MAX_ATTEMPTS) {
    return true
  }

  return false
}

// ---------------------------------------------------------------------------

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (isRateLimited(ip)) {
    logWarn({
      event: 'auth.register.rate_limited',
      scope: 'auth',
      message: 'Rate limit de registro alcanzado',
      meta: { ip },
    })
    return NextResponse.json(
      { error: 'Demasiados intentos. Intenta de nuevo más tarde.' },
      { status: 429 }
    )
  }

  try {
    const { prisma } = await import('@/lib/prisma')
    const { registerSchema } = await import('@/features/auth/schema/register.schema')

    const body = await req.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error?.issues[0]?.message ?? 'Datos inválidos.' },
        { status: 400 }
      )
    }

    const { name, storeName, slug: requestedSlug, whatsappPhone, email, password } = validation.data
    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      // No confirmamos si el correo existe para evitar enumeración de cuentas.
      logWarn({
        event: 'auth.register.email_already_exists',
        scope: 'auth',
        message: 'Intento de registro con correo ya registrado',
      })
      return NextResponse.json(
        { message: 'Si los datos son válidos, tu cuenta será creada.' },
        { status: 201 }
      )
    }

    let slug = requestedSlug
    let suffix = 1

    while (await prisma.store.findUnique({ where: { slug } })) {
      slug = `${requestedSlug}-${suffix++}`
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const { user, store } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
        },
      })

      const store = await tx.store.create({
        data: {
          name: storeName.trim(),
          slug,
          whatsappPhone: whatsappPhone.trim(),
          acceptedTermsAt: new Date(),
          memberships: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
      })

      return { user, store }
    })

    return NextResponse.json(
      {
        message: 'Cuenta creada exitosamente.',
        user: { id: user.id, email: user.email, name: user.name },
        store: { id: store.id, slug: store.slug, name: store.name },
      },
      { status: 201 }
    )
  } catch (error) {
    logError({
      event: 'auth.register.failed',
      scope: 'auth',
      message: 'Fallo inesperado en el registro',
      errorCode: 'REGISTER_FAILED',
      meta: { errorName: error instanceof Error ? error.name : 'UnknownError' },
    })
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
