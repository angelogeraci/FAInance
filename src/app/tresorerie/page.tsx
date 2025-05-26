'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, FilterIcon, SearchIcon, EuroIcon, X, TrendingUp, TrendingDown, PiggyBank, Banknote, Users, Trash, Pencil, Loader2, CheckCircle2, Edit2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Combobox, ComboboxOption } from "@/components/ui/combobox";

interface Transaction {
  id: string
  date: string
  fournisseur: string
  description: string
  amount: number
  category: string | null
  type?: '+' | '-'
}

// Fonction utilitaire pour générer une couleur pastel à partir d'une couleur hex
function pastelize(hex: string, ratio = 0.7) {
  // hex: #RRGGBB
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return '#f3f4f6' // gris clair par défaut
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // Mélange avec blanc
  const pastel = (c: number) => Math.round((1 - ratio) * c + ratio * 255)
  return `rgb(${pastel(r)}, ${pastel(g)}, ${pastel(b)})`
}

export default function TresoreriePage () {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [bulkEdit, setBulkEdit] = useState(false)
  const [editModal, setEditModal] = useState<{ open: boolean, transaction: Transaction | null }>({ open: false, transaction: null })
  const [createModal, setCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string, type: 'success'|'error' }|null>(null)

  // Filtres
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined })
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [filterFournisseurs, setFilterFournisseurs] = useState<string[]>([])
  const [descInput, setDescInput] = useState('')
  const [amountRange, setAmountRange] = useState<{ min: string, max: string }>({ min: '', max: '' })

  // Remplacer fakeCategories par un state dynamique
  const [categories, setCategories] = useState<{ id: string, name: string, color: string }[]>([])

  const [editCat, setEditCat] = useState<{ id: string, name: string, color: string }|null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatColor, setEditCatColor] = useState('')
  const [editCatLoading, setEditCatLoading] = useState(false)

  // Fetch transactions depuis l'API
  useEffect(() => {
    setLoading(true)
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data.map((t: any) => ({
        ...t,
        category: typeof t.category === 'object' && t.category !== null ? t.category.name : (t.category || '')
      }))))
      .finally(() => setLoading(false))
  }, [])

  // Fetch categories depuis l'API
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  // Filtrage dynamique
  const filtered = transactions.filter((t: Transaction) => {
    if (dateRange.from && new Date(t.date) < dateRange.from) return false
    if (dateRange.to && new Date(t.date) > dateRange.to) return false
    if (filterCategories.length && !filterCategories.includes(t.category || '')) return false
    if (filterFournisseurs.length && !filterFournisseurs.includes(t.fournisseur)) return false
    if (descInput && !t.description.toLowerCase().includes(descInput.toLowerCase())) return false
    if (amountRange.min && t.amount < Number(amountRange.min)) return false
    if (amountRange.max && t.amount > Number(amountRange.max)) return false
    return true
  })

  function handleCategoryChange (id: string, newCategory: string) {
    setTransactions(transactions => transactions.map(t => t.id === id ? { ...t, category: newCategory } : t))
    setEditId(null)
  }
  function handleBulkCategoryChange (newCategory: string) {
    setTransactions(transactions => transactions.map(t => selected.includes(t.id) ? { ...t, category: newCategory } : t))
    setBulkEdit(false)
    setSelected([])
  }
  function handleSelect (id: string, checked: boolean) {
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
    const selectedCategory = categories.find(cat => cat.name === updated.category)
    const categoryId = selectedCategory ? selectedCategory.id : null
    fetch('/api/transactions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: updated.id,
        label: updated.description,
        description: updated.description,
        amount: updated.amount,
        date: updated.date,
        categoryId,
        companyId: 'cmb0rsrpi0000t2kr9l2hxznt',
        fournisseur: updated.fournisseur
      })
    })
      .then(res => res.json())
      .then(() => {
        fetch('/api/transactions')
          .then(res => res.json())
          .then(data => setTransactions(data.map((t: any) => ({
            ...t,
            category: typeof t.category === 'object' && t.category !== null ? t.category.name : (t.category || '')
          }))))
        setEditModal({ open: false, transaction: null })
        setToast({ message: 'Transaction modifiée avec succès', type: 'success' })
      })
  }

  function handleCreateModalSave(newT: Transaction) {
    const selectedCategory = categories.find(cat => cat.name === newT.category)
    const categoryId = selectedCategory ? selectedCategory.id : null
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: newT.description,
        description: newT.description,
        amount: newT.amount,
        date: newT.date,
        categoryId,
        companyId: 'cmb0rsrpi0000t2kr9l2hxznt',
        fournisseur: newT.fournisseur
      })
    })
      .then(res => res.json())
      .then(() => {
        fetch('/api/transactions')
          .then(res => res.json())
          .then(data => setTransactions(data.map((t: any) => ({
            ...t,
            category: typeof t.category === 'object' && t.category !== null ? t.category.name : (t.category || '')
          }))))
        setCreateModal(false)
        setToast({ message: 'Transaction ajoutée avec succès', type: 'success' })
      })
  }

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  function getCategoryStyle(name: string) {
    return categories.find(c => c.name === name)?.color || 'bg-gray-200 text-gray-800'
  }

  function handleEditCatOpen(cat: { id: string, name: string, color: string }) {
    setEditCat(cat)
    setEditCatName(cat.name)
    setEditCatColor(cat.color)
  }
  function handleEditCatSave(e: React.FormEvent) {
    e.preventDefault()
    setEditCatLoading(true)
    fetch('/api/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editCat?.id, name: editCatName, color: editCatColor })
    })
      .then(res => res.json())
      .then(cat => {
        setCategories(cats => cats.map(c => c.id === cat.id ? cat : c))
        setEditCat(null)
      })
      .finally(() => setEditCatLoading(false))
  }

  return (
    <main className='max-w-6xl mx-auto py-10'>
      {/* Loader */}
      {loading && (
        <div className='flex justify-center items-center mb-6'>
          <Loader2 className='animate-spin w-6 h-6 text-muted-foreground' />
          <span className='ml-2 text-muted-foreground text-sm'>Chargement des transactions…</span>
        </div>
      )}

      {/* Header + Actions */}
      <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold mb-1'>Gestion de la trésorerie</h1>
          <p className='text-muted-foreground'>Suivez et gérez vos flux financiers en toute simplicité.</p>
        </div>
        <div className='flex gap-2'>
          <Button disabled>Importer un fichier (à venir)</Button>
          <Button onClick={() => setCreateModal(true)}>Ajouter une transaction</Button>
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
            {categories.map(cat => (
              <DropdownMenuCheckboxItem
                key={cat.id}
                checked={filterCategories.includes(cat.name)}
                onCheckedChange={checked => setFilterCategories(cats => checked ? [...cats, cat.name] : cats.filter(c => c !== cat.name))}
                className='flex items-center gap-2'
              >
                <span className='w-2 h-2 rounded-full inline-block' style={{ background: cat.color }}></span>
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
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`px-3 py-1 rounded-full font-medium text-xs border border-transparent hover:border-black transition`}
                  style={{ background: cat.color, color: '#222' }}
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
            {loading && (
              <tr>
                <td colSpan={7} className='py-8 text-center'>
                  <Loader2 className='animate-spin w-6 h-6 text-muted-foreground mx-auto' />
                  <div className='text-muted-foreground text-sm mt-2'>Chargement des transactions…</div>
                </td>
              </tr>
            )}
            {filtered.map((t: Transaction) => (
              <tr key={t.id} className='border-b last:border-0'>
                <td className='px-2 py-2 text-center'>
                  <input type='checkbox' checked={selected.includes(t.id)} onChange={e => handleSelect(t.id, e.target.checked)} />
                </td>
                <td className='px-4 py-2 whitespace-nowrap'>{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                <td className='px-4 py-2'>{t.fournisseur}</td>
                <td className='px-4 py-2'>{t.description}</td>
                <td className={'px-4 py-2 font-mono ' + (t.amount < 0 ? 'text-red-600' : 'text-green-700')}>{t.amount.toFixed(2)} €</td>
                <td className='px-4 py-2'>
                  <div className='relative group inline-block'>
                    {t.category ? (
                      (() => {
                        const cat = categories.find(c => c.name === t.category)
                        if (!cat) return <span className='text-muted-foreground'>-</span>
                        const pastel = pastelize(cat.color)
                        return (
                          <span
                            className='px-3 py-1 rounded-full font-medium text-xs border transition'
                            style={{
                              background: pastel,
                              color: cat.color,
                              borderColor: cat.color
                            }}
                          >
                            {cat.name}
                          </span>
                        )
                      })()
                    ) : (
                      <span className='text-muted-foreground'>-</span>
                    )}
                    <button
                      className='absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow border border-gray-200'
                      style={{ marginRight: '-18px' }}
                      onClick={e => {
                        e.stopPropagation()
                        const cat = categories.find(c => c.name === t.category)
                        if (cat) handleEditCatOpen(cat)
                      }}
                      title='Éditer la catégorie'
                    >
                      <Edit2 className='w-3 h-3 text-muted-foreground'/>
                    </button>
                  </div>
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
              categories={categories}
              onCancel={handleEditModalClose}
              onSave={handleEditModalSave}
              onCategoryAdded={cat => setCategories(cats => [...cats, cat])}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de création */}
      <Dialog open={createModal} onOpenChange={open => !open && setCreateModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une transaction</DialogTitle>
          </DialogHeader>
          <EditTransactionForm
            transaction={{ id: '', date: new Date().toISOString().slice(0, 10), fournisseur: '', description: '', amount: 0, category: null, type: '+' }}
            categories={categories}
            onCancel={() => setCreateModal(false)}
            onSave={handleCreateModalSave}
            isCreate
            onCategoryAdded={cat => setCategories(cats => [...cats, cat])}
          />
        </DialogContent>
      </Dialog>

      {/* Mini-modale édition catégorie */}
      {editCat && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <form className='bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4 min-w-[320px]' onSubmit={handleEditCatSave}>
            <div className='font-bold text-lg mb-2'>Modifier la catégorie</div>
            <div>
              <label className='block text-xs mb-1'>Nom</label>
              <input className='border rounded px-2 py-1 w-full' value={editCatName} onChange={e => setEditCatName(e.target.value)} />
            </div>
            <div>
              <label className='block text-xs mb-1'>Couleur</label>
              <input type='color' className='w-10 h-8 p-0 border rounded' value={editCatColor} onChange={e => setEditCatColor(e.target.value)} />
            </div>
            <div className='flex gap-2 justify-end mt-2'>
              <Button type='button' variant='ghost' onClick={() => setEditCat(null)}>Annuler</Button>
              <Button type='submit' variant='default' disabled={editCatLoading}>Enregistrer</Button>
            </div>
          </form>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-200 shadow-lg rounded-lg px-6 py-3 flex items-center gap-2 animate-fade-in'>
          <CheckCircle2 className='text-green-600 w-5 h-5' />
          <span className='text-green-700 font-medium'>{toast.message}</span>
        </div>
      )}
    </main>
  )
}

function EditTransactionForm({ transaction, categories, onCancel, onSave, isCreate, onCategoryAdded }: {
  transaction: Transaction & { type?: '+' | '-' },
  categories: { id: string, name: string, color: string }[],
  onCancel: () => void,
  onSave: (t: Transaction) => void,
  isCreate?: boolean,
  onCategoryAdded: (cat: { id: string, name: string, color: string }) => void
}) {
  const initialDate = transaction.date ? new Date(transaction.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    ...transaction,
    date: initialDate,
    amount: isCreate ? '' : transaction.amount
  })
  const [type, setType] = useState<'+' | '-'>(isCreate ? '-' : ((transaction.type as any) || (transaction.amount < 0 ? '-' : '+')))
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [catError, setCatError] = useState('')
  const [catQuery, setCatQuery] = useState('');
  const filteredCategories: ComboboxOption[] = (catQuery
    ? categories.filter(cat => cat.name.toLowerCase().includes(catQuery.toLowerCase()))
    : categories
  ).map(cat => ({
    value: cat.name,
    label: cat.name,
    color: cat.color
  }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = type === '-' ? -Math.abs(Number(form.amount)) : Math.abs(Number(form.amount))
    onSave({ ...form, amount })
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    setCatError('')
    if (!newCatName.trim()) {
      setCatError('Nom requis')
      return
    }
    setAddingCat(true)
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName, companyId: 'cmb0rsrpi0000t2kr9l2hxznt' })
    })
      .then(res => res.json())
      .then(cat => {
        if (cat.error) setCatError(cat.error)
        else {
          onCategoryAdded(cat)
          setForm(f => ({ ...f, category: cat.name }))
          setNewCatName('')
        }
      })
      .finally(() => setAddingCat(false))
  }

  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
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
          <input
            type='number'
            className='border rounded px-2 py-1 w-full'
            value={Math.abs(Number(form.amount))}
            placeholder='Montant'
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            min='0'
          />
        </div>
        <div className='flex-1'>
          <label className='block text-xs mb-1'>Type</label>
          <select className='border rounded px-2 py-1 w-full' value={type} onChange={e => setType(e.target.value as any)}>
            <option value='-'>Coût</option>
            <option value='+'>Revenu</option>
          </select>
        </div>
      </div>
      <div>
        <label className='block text-xs mb-1'>Catégorie</label>
        <Combobox
          value={form.category || ''}
          onValueChange={(value: string) => setForm(f => ({ ...f, category: value || null }))}
          onInputChange={(v: string) => setCatQuery(v)}
          options={filteredCategories}
          placeholder="Sélectionner ou ajouter une catégorie"
          renderOption={(option: ComboboxOption) => (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: option.color }} />
              <span>{option.label}</span>
            </div>
          )}
          allowCustomValue
          onCustomValue={(name: string) => {
            setNewCatName(name);
            setAddingCat(true);
            fetch('/api/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, companyId: 'cmb0rsrpi0000t2kr9l2hxznt' })
            })
              .then(res => res.json())
              .then(cat => {
                if (cat.error) setCatError(cat.error)
                else {
                  onCategoryAdded(cat);
                  setForm(f => ({ ...f, category: cat.name }));
                  setNewCatName('');
                }
              })
              .finally(() => setAddingCat(false));
          }}
        />
        {catError && <div className='text-xs text-red-600 mt-1'>{catError}</div>}
      </div>
      <DialogFooter className='gap-2'>
        <Button type='button' variant='ghost' onClick={onCancel}>Annuler</Button>
        <Button type='submit' variant='default'>Enregistrer</Button>
      </DialogFooter>
    </form>
  )
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