import 'dotenv/config'

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

const INITIAL_FEATURES = [
  'Vitrina digital con diseño estándar',
  'Catálogo de hasta 15 productos activos',
  'Categorización básica de inventario',
  'Carga de logotipo de la tienda',
  'Pedidos vía WhatsApp con mensaje estructurado',
  'Indexación SEO base SSR',
  'Subdominio compartido walo.cl/tu-tienda',
]

const PRO_FEATURES = [
  'Todo lo del Plan Inicial',
  'Catálogo ilimitado de productos',
  'Módulo de analítica: ingresos, pedidos y clics a WhatsApp',
  'Pasarela de pagos Khipu',
  'Motor de plantillas premium (Próximamente)',
  'Conexión de dominio externo CNAME/A Records (Próximamente)',
  'Personalización de colores y diseño (Próximamente)',
]

const BUSINESS_FEATURES = [
  'Todo lo del Plan Pro',
  'Multi-tienda: hasta 3 tiendas en una cuenta (Próximamente)',
  'Analítica avanzada: productos de alta rotación (Próximamente)',
  'Optimización de metadatos por producto (Próximamente)',
  'Soporte prioritario con SLA garantizado',
]

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  const initialPlan = await prisma.plan.upsert({
    where: { slug: 'initial' },
    update: {
      features: INITIAL_FEATURES,
      limitations: {
        maxProducts: 15,
        maxStores: 1,
        customDomain: false,
        analytics: false,
        premiumTemplates: false,
      },
    },
    create: {
      name: 'Inicial',
      slug: 'initial',
      description: 'Digitalización base para microemprendedores en etapa temprana.',
      priceMonthly: 0,
      priceYearly: 0,
      currency: 'CLP',
      productLimit: 15,
      customDomain: false,
      analytics: false,
      premiumTemplates: false,
      supportLevel: 'basic',
      features: INITIAL_FEATURES,
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
    update: {
      features: PRO_FEATURES,
      analytics: true,
      premiumTemplates: false,
      customDomain: false,
    },
    create: {
      name: 'Pro',
      slug: 'pro',
      description: 'Para negocios establecidos que quieren crecer y posicionar su marca.',
      priceMonthly: 5990,
      priceYearly: null,
      currency: 'CLP',
      productLimit: null,
      customDomain: false,
      analytics: true,
      premiumTemplates: false,
      supportLevel: 'email',
      features: PRO_FEATURES,
      isActive: true,
      sortOrder: 2,
    },
  })

  const businessPlan = await prisma.plan.upsert({
    where: { slug: 'business' },
    update: {
      features: BUSINESS_FEATURES,
    },
    create: {
      name: 'Business',
      slug: 'business',
      description: 'Para gestión avanzada y centralización de múltiples operaciones comerciales.',
      priceMonthly: 12990,
      priceYearly: null,
      currency: 'CLP',
      productLimit: null,
      customDomain: true,
      analytics: true,
      premiumTemplates: true,
      supportLevel: 'priority',
      features: BUSINESS_FEATURES,
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
