import { db } from './index'
import { products } from './schema'

const categorys = ['Eletronics', 'Office', 'House', 'Books']

async function seed() {
  await db.delete(products)

  const list = Array.from({ length: 50 }, (_, i) => ({
    name: `Product ${i + 1}`,
    category: categorys[i % categorys.length],
    priceCents: Math.floor(Math.random() * 100000) + 100,
    stock: Math.floor(Math.random() * 200),
    active: i % 7 !== 0,
  }))

  // Casos "chatos" de propósito, para testar o CSV depois
  list.push(
    { name: 'Caderno "Premium"', category: 'Escritório', priceCents: 2590, stock: 10, active: true },
    { name: 'Cabo HDMI; 2 metros', category: 'Eletrônicos', priceCents: 3990, stock: 5, active: true },
    { name: 'Pão de açúcar & Cia', category: 'Casa', priceCents: 1290, stock: 0, active: false },
    { name: 'Livro com\nquebra de linha', category: 'Livros', priceCents: 5900, stock: 3, active: true },
  )

  await db.insert(products).values(list)
  console.log(`Seeding complete: ${list.length} products inserted`)
}

seed()