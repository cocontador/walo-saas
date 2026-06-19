import 'dotenv/config'
import { Pool } from 'pg'
import { parse } from 'pg-connection-string'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const { host, port, user, password, database } = parse(connectionString)
const needsSsl = connectionString.includes('ssl')

const pool = new Pool({
  host: host ?? undefined,
  port: port ? Number(port) : undefined,
  user: user ?? undefined,
  password: password ?? undefined,
  database: database ?? undefined,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

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
      description: 'Digitalización base para microemprendedores en etapa temprana.',
      priceMonthly: 0,
      priceYearly: 0,
      currency: 'CLP',
      productLimit: 15,
      customDomain: false,
      analytics: false,
      premiumTemplates: false,
      supportLevel: 'basic',
      features: [
        'Vitrina digital con diseño estándar',
        'Catálogo de hasta 15 productos activos',
        'Categorización básica de inventario',
        'Carga de logotipo de la tienda',
        'Pedidos vía WhatsApp con mensaje estructurado',
        'Indexación SEO base SSR',
        'Subdominio compartido walo.cl/tu-tienda',
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
      description: 'Para negocios establecidos que quieren crecer y posicionar su marca.',
      priceMonthly: 5990,
      priceYearly: null,
      currency: 'CLP',
      productLimit: null, // ilimitado
      customDomain: true,
      analytics: true,
      premiumTemplates: true,
      supportLevel: 'email',
      features: [
        'Todo lo del Plan Inicial',
        'Catálogo ilimitado de productos',
        'Motor de plantillas premium',
        'Conexión de dominio externo CNAME/A Records',
        'Módulo de analítica: visitas y clics por producto',
        'Soporte técnico por correo electrónico',
        'Personalización de colores y diseño',
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
      description: 'Para gestión avanzada y centralización de múltiples operaciones comerciales.',
      priceMonthly: 12990, // 12990 CLP en pesos
      priceYearly: null,
      currency: 'CLP',
      productLimit: null, // ilimitado
      customDomain: true,
      analytics: true,
      premiumTemplates: true,
      supportLevel: 'priority',
      features: [
        'Todo lo del Plan Pro',
        'Multi-tienda: hasta 3 tiendas en una cuenta',
        'Pasarela de pagos: Khipu, Flow y otros',
        'Analítica avanzada: productos de alta rotación',
        'Mapas de calor de tráfico y tasa de conversión',
        'Secciones personalizadas',
        'Optimización de metadatos avanzada',
        'Soporte prioritario con SLA garantizado',
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
