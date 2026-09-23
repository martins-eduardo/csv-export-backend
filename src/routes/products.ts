import type { FastifyInstance } from  'fastify'
import { db } from '../db/index'
import { products } from '../db/schema'
import { asc, eq } from 'drizzle-orm'
import { gerarCsv } from '../utils/csv'

const formatPrice = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
})

const formatDateHour = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

type ListQuery = {
    category?: string
}

function searchProducts(category?: string) {
    return db.select().from(products).where(category ? eq(products.category, category) : undefined).orderBy(asc(products.id))
}

export async function productsRoutes(app: FastifyInstance) {
    app.get<{ Querystring: ListQuery }>('/products', async (request) => {
        return searchProducts(request.query.category)
    })

    app.get<{ Querystring: ListQuery }>('/products/export', async (request, reply) => {
        const list = await searchProducts(request.query.category)

        const header = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Active', 'Created At']

        const rows = list.map((p) => [
            p.id,
            p.name,
            p.category,
            formatPrice.format(p.priceCents / 100),
            p.stock,
            p.active ? 'Yes' : 'No',
            formatDateHour.format(p.createdAt),
        ])

        const csv = gerarCsv(header, rows)

        const today = new Date().toISOString().slice(0, 10)
        const fileName = `products-${today}.csv`

        return reply.header('Content-Type', 'text/csv; charset=utf-8').header('Content-Disposition', `attachment; filename=${fileName}`).send(csv)
    })
}