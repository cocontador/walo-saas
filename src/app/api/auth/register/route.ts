import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
const { registerSchema } = await import('@/features/auth/schema/register.schema')

    const body = await req.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error?.issues[0]?.message ?? 'Datos invalidos.' },
        { status: 400 }
      )
    }

    const { name, storeName, email, password } = validation.data
    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese correo.' },
        { status: 409 }
      )
    }

    const baseSlug = generateSlug(storeName)
    let slug = baseSlug
    let suffix = 1

    while (await prisma.store.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
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
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}