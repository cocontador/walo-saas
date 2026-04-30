import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const storeId = await getUserStoreId()

    if (!storeId) {
      return NextResponse.json(
        { message: 'Usuario no tiene una tienda asociada' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, price, description } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { message: 'El nombre del producto es requerido' },
        { status: 400 }
      )
    }

    if (price === undefined || price === null || typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { message: 'El precio debe ser un número válido mayor o igual a 0' },
        { status: 400 }
      )
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        storeId,
        name: name.trim(),
        price: Math.round(price), // Ensure it's stored as integer (in cents)
        description: description?.trim() || null,
        visible: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Producto creado exitosamente',
        product,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { message: 'Error al crear el producto' },
      { status: 500 }
    )
  }
}
