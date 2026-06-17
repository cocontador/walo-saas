import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar planes existentes (opcional, descomentar si es necesario)
  // await prisma.plan.deleteMany({})

  // Crear planes base
  const initialPlan = await prisma.plan.upsert({
    where: { slug: 'initial' },
    update: {},
    create: {
      name: 'Inicial',
      slug: 'initial',
      description: 'Plan gratuito para empezar',
      priceMonthly: 0,
      priceYearly: 0,
      currency: 'CLP',
      productLimit: 15,
      customDomain: false,
      analytics: false,
      premiumTemplates: false,
      supportLevel: 'basic',
      features: [
        'Vitrina digital estándar',
        'Carga de logotipo',
        'Pedidos vía WhatsApp',
        'SEO base',
      ],
      limitations: {
        maxProducts: 15,
        maxStores: 1,
        customDomain: false,
        analytics: false,
        premiumTemplates: false,
      },
      isActive: true,
      sortOrder: 1,
    },
  })

  const proPlan = await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Pro',
      slug: 'pro',
      description: 'Plan profesional con dominio propio',
      priceMonthly: 5990,
      priceYearly: null,
      currency: 'CLP',
      productLimit: null, // ilimitado
      customDomain: true,
      analytics: true,
      premiumTemplates: true,
      supportLevel: 'email',
      features: [
        'Productos ilimitados',
        'Dominio propio',
        'Plantillas premium',
        'Analítica básica',
        'Personalización de colores',
        'Soporte por correo',
      ],
      isActive: true,
      sortOrder: 2,
    },
  })

  const businessPlan = await prisma.plan.upsert({
    where: { slug: 'business' },
    update: {},
    create: {
      name: 'Business',
      slug: 'business',
      description: 'Plan empresarial con soporte prioritario',
      priceMonthly: 12990, // 12990 CLP en pesos
      priceYearly: null,
      currency: 'CLP',
      productLimit: null, // ilimitado
      customDomain: true,
      analytics: true,
      premiumTemplates: true,
      supportLevel: 'priority',
      features: [
        'Productos ilimitados',
        'Multi-tienda hasta 3',
        'Pasarela de pagos (próximamente)',
        'Analítica avanzada',
        'Soporte prioritario',
        'Integración API',
      ],
      isActive: true,
      sortOrder: 3,
    },
  })

  console.log('✅ Planes creados exitosamente:')
  console.log(`  - ${initialPlan.name} (${initialPlan.slug})`)
  console.log(`  - ${proPlan.name} (${proPlan.slug})`)
  console.log(`  - ${businessPlan.name} (${businessPlan.slug})`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n✨ Seed completado')
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
