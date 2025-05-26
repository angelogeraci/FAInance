import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { category: true }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des transactions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { label, description, amount, date, categoryId, category, companyId, fournisseur } = data
    if (!label || !amount || !date || !companyId) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }
    const transaction = await prisma.transaction.create({
      data: {
        label,
        description: description || label,
        amount: Number(amount),
        date: new Date(date),
        categoryId: categoryId || null,
        companyId,
        fournisseur: fournisseur || null
      }
    })
    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la transaction' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json()
    const { id, label, description, amount, date, categoryId, companyId, fournisseur } = data
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        label,
        description,
        amount: amount !== undefined ? Number(amount) : undefined,
        date: date ? new Date(date) : undefined,
        categoryId: categoryId || undefined,
        companyId: companyId || undefined,
        fournisseur: fournisseur || undefined
      }
    })
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la modification de la transaction' }, { status: 500 })
  }
} 