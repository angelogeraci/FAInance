import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma/client'

const prisma = new PrismaClient()

function randomColor() {
  // Palette simple de couleurs pastel
  const colors = [
    '#A7F3D0', '#FDE68A', '#FCA5A5', '#BFDBFE', '#DDD6FE', '#FBCFE8', '#FCD34D', '#6EE7B7', '#F9A8D4', '#FECACA'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export async function GET() {
  const categories = await prisma.category.findMany()
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const { name, color, companyId } = await req.json()
  if (!name || !companyId) return NextResponse.json({ error: 'Nom et companyId requis' }, { status: 400 })
  const cat = await prisma.category.create({
    data: {
      name,
      color: color || randomColor(),
      companyId
    }
  })
  return NextResponse.json(cat, { status: 201 })
}

export async function PATCH(req: Request) {
  const { id, name, color } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  const cat = await prisma.category.update({
    where: { id },
    data: { name, color }
  })
  return NextResponse.json(cat)
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
} 