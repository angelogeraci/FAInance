'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, FilterIcon, SearchIcon, EuroIcon, X, TrendingUp, TrendingDown, PiggyBank, Banknote, Users, Trash, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface Transaction {
  id: number
  date: string
  fournisseur: string
  description: string
  amount: number
  category: string
}

const fakeCategories = [
  { name: 'Alimentation', color: 'bg-green-200 text-green-800' },
  { name: 'Transports', color: 'bg-blue-200 text-blue-800' },
  { name: 'Salaire', color: 'bg-yellow-200 text-yellow-800' },
  { name: 'Abonnement', color: 'bg-purple-200 text-purple-800' },
  { name: 'Autre', color: 'bg-gray-200 text-gray-800' },
]
const fakeTransactions: Transaction[] = [
  { id: 1, date: '2024-06-01', fournisseur: 'Carrefour', description: 'Supermarché Carrefour', amount: -54.23, category: 'Alimentation' },
  { id: 2, date: '2024-06-02', fournisseur: 'Entreprise', description: 'Salaire Juin', amount: 2500, category: 'Salaire' },
  { id: 3, date: '2024-06-03', fournisseur: 'Netflix', description: 'Netflix', amount: -13.99, category: 'Abonnement' },
  { id: 4, date: '2024-06-04', fournisseur: 'Total', description: 'Essence Total', amount: -72.5, category: 'Transports' },
  { id: 5, date: '2024-06-05', fournisseur: 'Collègue', description: 'Remboursement collègue', amount: 30, category: 'Autre' },
]

function getCategoryStyle(name: string) {
  return fakeCategories.find(c => c.name === name)?.color || 'bg-gray-200 text-gray-800'
}

function uniqueDescriptions(transactions: Transaction[]): string[] {
  return Array.from(new Set(transactions.map((t: Transaction) => t.description)))
}

function uniqueFournisseurs(transactions: Transaction[]): string[] {
  return Array.from(new Set(transactions.map((t: Transaction) => t.fournisseur)))
}

function formatNumber(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function TresoreriePage () {
  const [transactions, setTransactions] = useState<Transaction[]>(fakeTransactions)
  const [selected, setSelected] = useState<number[]>([])
  const [editId, setEditId] = useState<number | null>(null)
  const [bulkEdit, setBulkEdit] = useState(false)
  const [editModal, setEditModal] = useState<{ open: boolean, transaction: Transaction | null }>({ open: false, transaction: null })

  // Filtres
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined })
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [filterFournisseurs, setFilterFournisseurs] = useState<string[]>([])
  const [descInput, setDescInput] = useState('')
  const [amountRange, setAmountRange] = useState<{ min: string, max: string }>({ min: '', max: '' })

  // Filtrage dynamique
  const filtered = transactions.filter((t: Transaction) => {
    if (dateRange.from && new Date(t.date) < dateRange.from) return false
    if (dateRange.to && new Date(t.date) > dateRange.to) return false
    if (filterCategories.length && !filterCategories.includes(t.category)) return false
    if (filterFournisseurs.length && !filterFournisseurs.includes(t.fournisseur)) return false
    if (descInput && !t.description.toLowerCase().includes(descInput.toLowerCase())) return false
    if (amountRange.min && t.amount < Number(amountRange.min)) return false
    if (amountRange.max && t.amount > Number(amountRange.max)) return false
    return true
  })

  function handleCategoryChange (id: number, newCategory: string) {
    setTransactions(transactions => transactions.map(t => t.id === id ? { ...t, category: newCategory } : t))
    setEditId(null)
  }
  function handleBulkCategoryChange (newCategory: string) {
    setTransactions(transactions => transactions.map(t => selected.includes(t.id) ? { ...t, category: newCategory } : t))
    setBulkEdit(false)
    setSelected([])
  }
  function handleSelect (id: number, checked: boolean) {
    setSelected(sel => checked ? [...sel, id] : sel.filter(i => i !== id))
  }
  function handleSelectAll (checked: boolean) {
    setSelected(checked ? filtered.map(t => t.id) : [])
  }
  function handleBulkDelete () {
    setTransactions(transactions => transactions.filter(t => !selected.includes(t.id)))
    setSelected([])
  }
  function resetFilters() {
    setDateRange({ from: undefined, to: undefined })
    setFilterCategories([])
    setFilterFournisseurs([])
    setDescInput('')
    setAmountRange({ min: '', max: '' })
  }

  function handleEditClick(t: Transaction) {
    setEditModal({ open: true, transaction: t })
  }
  function handleEditModalClose() {
    setEditModal({ open: false, transaction: null })
  }
  function handleEditModalSave(updated: Transaction) {
    setTransactions(ts => ts.map(t => t.id === updated.id ? updated : t))
    setEditModal({ open: false, transaction: null })
  }

  return (
    <main className='max-w-6xl mx-auto py-10'>
      {/* Header + Actions */}
      <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold mb-1'>Gestion de la trésorerie</h1>
          <p className='text-muted-foreground'>Suivez et gérez vos flux financiers en toute simplicité.</p>
        </div>
        <div className='flex gap-2'>
          <Button disabled>Importer un fichier (à venir)</Button>
          <Button disabled>Ajouter une transaction (à venir)</Button>
        </div>
      </div>

      {/* Metrics cards */}
      <div className='flex gap-4 mb-6'>
        <Card className='flex-1 p-4 flex flex-col items-center bg-green-50 border-green-200'>
          <div className='flex items-center gap-2 mb-1'>
            <TrendingUp className='w-5 h-5 text-green-600'/>
            <span className='text-xs text-green-700 font-medium'>Revenus</span>
          </div>
          <span className='text-2xl font-bold text-green-700'>{formatNumber(filtered.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0))} €</span>
        </Card>
        <Card className='flex-1 p-4 flex flex-col items-center bg-red-50 border-red-200'>
          <div className='flex items-center gap-2 mb-1'>
            <TrendingDown className='w-5 h-5 text-red-600'/>
            <span className='text-xs text-red-700 font-medium'>Dépenses</span>
          </div>
          <span className='text-2xl font-bold text-red-600'>{formatNumber(filtered.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0))} €</span>
        </Card>
        <Card className='flex-1 p-4 flex flex-col items-center bg-blue-50 border-blue-200'>
          <div className='flex items-center gap-2 mb-1'>
            <PiggyBank className='w-5 h-5 text-blue-600'/>
            <span className='text-xs text-blue-700 font-medium'>Solde</span>
          </div>
          <span className='text-2xl font-bold text-blue-700'>{formatNumber(filtered.reduce((acc, t) => acc + t.amount, 0))} €</span>
        </Card>
        <Card className='flex-1 p-4 flex flex-col items-center bg-yellow-50 border-yellow-200'>
          <div className='flex items-center gap-2 mb-1'>
            <Banknote className='w-5 h-5 text-yellow-600'/>
            <span className='text-xs text-yellow-700 font-medium'>Situation de la trésorerie</span>
          </div>
          <span className='text-2xl font-bold text-yellow-700'>—</span>
        </Card>
      </div>

      {/* Filtres compacts */}
      <div className='flex flex-wrap gap-2 items-center mb-4'>
        {/* Date filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' size='sm' className='flex items-center gap-2'>
              <CalendarIcon className='w-4 h-4'/>
              {dateRange.from ? (dateRange.to ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}` : dateRange.from.toLocaleDateString()) : 'Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar
              mode='range'
              selected={dateRange.from || dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
              onSelect={(range: { from?: Date; to?: Date } | undefined) => {
                setDateRange({ from: range?.from, to: range?.to })
              }}
              numberOfMonths={2}
            />
            <div className='flex justify-end p-2'>
              <Button size='sm' variant='ghost' onClick={() => setDateRange({ from: undefined, to: undefined })}>Réinitialiser</Button>
            </div>
          </PopoverContent>
        </Popover>
        {/* Montant filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' size='sm' className='flex items-center gap-2'>
              <EuroIcon className='w-4 h-4'/>
              {amountRange.min || amountRange.max ? `${amountRange.min || '...'} - ${amountRange.max || '...'}` : 'Montant'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-56'>
            <div className='flex flex-col gap-2 p-2'>
              <input type='number' placeholder='Min' value={amountRange.min} onChange={e => setAmountRange(a => ({ ...a, min: e.target.value }))} className='border rounded px-2 py-1'/>
              <input type='number' placeholder='Max' value={amountRange.max} onChange={e => setAmountRange(a => ({ ...a, max: e.target.value }))} className='border rounded px-2 py-1'/>
              <Button size='sm' variant='ghost' onClick={() => setAmountRange({ min: '', max: '' })}>Réinitialiser</Button>
            </div>
          </PopoverContent>
        </Popover>
        {/* Catégories filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='flex items-center gap-2'>
              <FilterIcon className='w-4 h-4'/>
              {filterCategories.length ? `${filterCategories.length} catégorie${filterCategories.length > 1 ? 's' : ''}` : 'Catégories'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-48'>
            {fakeCategories.map(cat => (
              <DropdownMenuCheckboxItem
                key={cat.name}
                checked={filterCategories.includes(cat.name)}
                onCheckedChange={checked => setFilterCategories(cats => checked ? [...cats, cat.name] : cats.filter(c => c !== cat.name))}
                className='flex items-center gap-2'
              >
                <span className={`w-2 h-2 rounded-full inline-block ${cat.color}`}></span>
                {cat.name}
              </DropdownMenuCheckboxItem>
            ))}
            <div className='flex justify-end p-2'>
              <Button size='sm' variant='ghost' onClick={() => setFilterCategories([])}>Réinitialiser</Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Fournisseur filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='flex items-center gap-2'>
              <Users className='w-4 h-4'/>
              {filterFournisseurs.length ? `${filterFournisseurs.length} fournisseur${filterFournisseurs.length > 1 ? 's' : ''}` : 'Fournisseurs'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-48'>
            {uniqueFournisseurs(transactions).map(f => (
              <DropdownMenuCheckboxItem
                key={f}
                checked={filterFournisseurs.includes(f)}
                onCheckedChange={checked => setFilterFournisseurs(fs => checked ? [...fs, f] : fs.filter(ff => ff !== f))}
                className='flex items-center gap-2'
              >
                {f}
              </DropdownMenuCheckboxItem>
            ))}
            <div className='flex justify-end p-2'>
              <Button size='sm' variant='ghost' onClick={() => setFilterFournisseurs([])}>Réinitialiser</Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Description filter */}
        <div className='relative'>
          <input
            type='text'
            value={descInput}
            onChange={e => setDescInput(e.target.value)}
            list='desc-list'
            className='border rounded px-2 py-1 pl-8 text-sm w-40'
            placeholder='Description...'
          />
          <SearchIcon className='absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground'/>
          <datalist id='desc-list'>
            {uniqueDescriptions(transactions).map((desc: string) => (
              <option key={desc} value={desc} />
            ))}
          </datalist>
        </div>
        {/* Réinitialiser */}
        <Button variant='ghost' size='icon' onClick={resetFilters} title='Réinitialiser les filtres'>
          <X className='w-4 h-4'/>
        </Button>
      </div>

      {/* Actions groupées */}
      {selected.length > 0 && (
        <Card className='mb-4 p-4 flex items-center gap-4'>
          <span className='font-medium'>{selected.length} sélectionnée{selected.length > 1 ? 's' : ''}</span>
          <Button size='sm' variant='destructive' onClick={handleBulkDelete}>Supprimer</Button>
          <Button size='sm' variant='outline' onClick={() => setBulkEdit(true)}>Changer catégorie</Button>
          {bulkEdit && (
            <div className='flex gap-2 ml-4'>
              {fakeCategories.map(cat => (
                <button
                  key={cat.name}
                  className={`px-3 py-1 rounded-full font-medium text-xs border ${cat.color} border-transparent hover:border-black transition`}
                  onClick={() => handleBulkCategoryChange(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tableau transactions */}
      <Card className='overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead>
            <tr className='bg-muted'>
              <th className='px-2 py-2'><input type='checkbox' checked={selected.length === filtered.length && filtered.length > 0} onChange={e => handleSelectAll(e.target.checked)} /></th>
              <th className='px-4 py-2 text-left font-semibold'>Date</th>
              <th className='px-4 py-2 text-left font-semibold'>Fournisseur</th>
              <th className='px-4 py-2 text-left font-semibold'>Description</th>
              <th className='px-4 py-2 text-left font-semibold'>Montant</th>
              <th className='px-4 py-2 text-left font-semibold'>Catégorie</th>
              <th className='px-4 py-2'></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t: Transaction) => (
              <tr key={t.id} className='border-b last:border-0'>
                <td className='px-2 py-2 text-center'>
                  <input type='checkbox' checked={selected.includes(t.id)} onChange={e => handleSelect(t.id, e.target.checked)} />
                </td>
                <td className='px-4 py-2 whitespace-nowrap'>{t.date}</td>
                <td className='px-4 py-2'>{t.fournisseur}</td>
                <td className='px-4 py-2'>{t.description}</td>
                <td className={'px-4 py-2 font-mono ' + (t.amount < 0 ? 'text-red-600' : 'text-green-700')}>{t.amount.toFixed(2)} €</td>
                <td className='px-4 py-2'>
                  {editId === t.id ? (
                    <div className='flex gap-2'>
                      {fakeCategories.map(cat => (
                        <button
                          key={cat.name}
                          className={`px-3 py-1 rounded-full font-medium text-xs border ${cat.color} border-transparent hover:border-black transition`}
                          onClick={() => handleCategoryChange(t.id, cat.name)}
                        >
                          {cat.name}
                        </button>
                      ))}
                      <Button size='sm' variant='ghost' onClick={() => setEditId(null)}>Annuler</Button>
                    </div>
                  ) : (
                    <button
                      className={`px-3 py-1 rounded-full font-medium text-xs border ${getCategoryStyle(t.category)} border-transparent hover:border-black transition`}
                      onClick={() => setEditId(t.id)}
                    >
                      {t.category}
                    </button>
                  )}
                </td>
                <td className='px-4 py-2 text-right flex gap-2 justify-end'>
                  <Button size='icon' variant='outline' onClick={() => handleEditClick(t)} title='Modifier'>
                    <Pencil className='w-4 h-4'/>
                  </Button>
                  <Button size='icon' variant='outline' disabled title='Supprimer'>
                    <Trash className='w-4 h-4'/>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal d'édition */}
      <Dialog open={editModal.open} onOpenChange={open => !open && handleEditModalClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la transaction</DialogTitle>
          </DialogHeader>
          {editModal.transaction && (
            <EditTransactionForm
              transaction={editModal.transaction}
              categories={fakeCategories}
              onCancel={handleEditModalClose}
              onSave={handleEditModalSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}

function EditTransactionForm({ transaction, categories, onCancel, onSave }: {
  transaction: Transaction,
  categories: { name: string, color: string }[],
  onCancel: () => void,
  onSave: (t: Transaction) => void
}) {
  const [form, setForm] = useState<Transaction>({ ...transaction })
  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={e => {
        e.preventDefault()
        onSave(form)
      }}
    >
      <div className='flex gap-2'>
        <div className='flex-1'>
          <label className='block text-xs mb-1'>Fournisseur</label>
          <input className='border rounded px-2 py-1 w-full' value={form.fournisseur} onChange={e => setForm(f => ({ ...f, fournisseur: e.target.value }))} />
        </div>
        <div className='flex-1'>
          <label className='block text-xs mb-1'>Date</label>
          <input type='date' className='border rounded px-2 py-1 w-full' value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className='block text-xs mb-1'>Description</label>
        <input className='border rounded px-2 py-1 w-full' value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className='flex gap-2'>
        <div className='flex-1'>
          <label className='block text-xs mb-1'>Montant</label>
          <input type='number' className='border rounded px-2 py-1 w-full' value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
        </div>
        <div className='flex-1'>
          <label className='block text-xs mb-1'>Catégorie</label>
          <select className='border rounded px-2 py-1 w-full' value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      <DialogFooter className='gap-2'>
        <Button type='button' variant='ghost' onClick={onCancel}>Annuler</Button>
        <Button type='submit' variant='default'>Enregistrer</Button>
      </DialogFooter>
    </form>
  )
} 