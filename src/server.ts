import Fastify from 'fastify'
import cors from '@fastify/cors'
import { productsRoutes } from './routes/products'

const app = Fastify({logger: true})

await app.register(cors, { origin: 'http://localhost:5173', exposedHeaders: ['Content-Disposition'] })
await app.register(productsRoutes)

app.get('/health', async () => {
    return { status: 'ok'}
})

app.listen({port: 3333}).then(() => {
    console.log('Servidor rodando em http://localhost:3333')
})