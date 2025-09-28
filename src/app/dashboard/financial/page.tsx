'use client'

import { useState, useEffect } from 'react'

interface FinancialTransaction {
  id: string
  accountId: string
  type: 'DEBIT' | 'CREDIT'
  category: string
  amount: number
  description?: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate?: string
  paidDate?: string
  paymentMethod?: string
  paymentReference?: string
  notes?: string
  createdAt: string
  updatedAt: string
  account?: {
    student: {
      name: string
      nim: string
    }
  }
}

interface FinancialAccount {
  id: string
  studentId: string
  balance: number
  totalDebt: number
  totalPaid: number
  createdAt: string
  updatedAt: string
  student: {
    name: string
    nim: string
    program: string
  }
  transactions: FinancialTransaction[]
}

export default function FinancialPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/financial/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/financial/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return

    try {
      const response = await fetch(`/api/financial/transactions/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTransactions(transactions.filter(transaction => transaction.id !== id))
        alert('Transaksi berhasil dihapus')
        fetchAccounts() // Refresh account balances
      } else {
        alert('Gagal menghapus transaksi')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/financial/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          paidDate: newStatus === 'PAID' ? new Date().toISOString() : null
        }),
      })

      if (response.ok) {
        setTransactions(transactions.map(transaction => 
          transaction.id === id ? { 
            ...transaction, 
            status: newStatus as any,
            paidDate: newStatus === 'PAID' ? new Date().toISOString() : transaction.paidDate
          } : transaction
        ))
        alert('Status berhasil diperbarui')
        fetchAccounts() // Refresh account balances
      } else {
        alert('Gagal memperbarui status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Terjadi kesalahan saat memperbarui status')
    }
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.account?.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.account?.student.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(transaction => 
    statusFilter ? transaction.status === statusFilter : true
  ).filter(transaction => 
    typeFilter ? transaction.type === typeFilter : true
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manajemen Keuangan
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola transaksi keuangan mahasiswa STIM Surakarta
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Tambah Transaksi
              </button>
              <a
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Kembali ke Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari berdasarkan nama mahasiswa, NIM, kategori, atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Lunas</option>
                <option value="OVERDUE">Jatuh Tempo</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Tipe</option>
                <option value="DEBIT">Piutang</option>
                <option value="CREDIT">Pembayaran</option>
              </select>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
              >
                Cetak
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              Rp {transactions.reduce((sum, t) => sum + (t.type === 'DEBIT' ? t.amount : 0), 0).toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-gray-500">Total Piutang</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              Rp {transactions.reduce((sum, t) => sum + (t.type === 'CREDIT' ? t.amount : 0), 0).toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-gray-500">Total Pembayaran</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              Rp {transactions.filter(t => t.status === 'PENDING' && t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0).toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-gray-500">Piutang Pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              Rp {transactions.filter(t => t.status === 'OVERDUE').reduce((sum, t) => sum + t.amount, 0).toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-gray-500">Jatuh Tempo</div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Daftar Transaksi ({filteredTransactions.length} dari {transactions.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mahasiswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{transaction.account?.student.name}</div>
                        <div className="text-gray-500">{transaction.account?.student.nim}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{transaction.category}</div>
                        {transaction.description && (
                          <div className="text-gray-500 text-xs">{transaction.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'DEBIT' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {transaction.type === 'DEBIT' ? 'Piutang' : 'Pembayaran'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-medium ${
                        transaction.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'DEBIT' ? '-' : '+'}Rp {transaction.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'PAID' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'OVERDUE'
                          ? 'bg-red-100 text-red-800'
                          : transaction.status === 'CANCELLED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Due: {transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString('id-ID') : '-'}</div>
                        {transaction.paidDate && (
                          <div className="text-gray-500 text-xs">Paid: {new Date(transaction.paidDate).toLocaleDateString('id-ID')}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setEditingTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      {transaction.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(transaction.id, 'PAID')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Bayar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm || statusFilter || typeFilter ? 'Tidak ada transaksi yang sesuai dengan filter' : 'Belum ada data transaksi'}
              </div>
            </div>
          )}
        </div>

        {/* Accounts Summary */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Rekening Mahasiswa</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mahasiswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hutang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Bayar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{account.student.name}</div>
                          <div className="text-gray-500">{account.student.nim} - {account.student.program}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Rp {account.balance.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp {account.totalDebt.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp {account.totalPaid.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Transaction Modal */}
      {(showAddForm || editingTransaction) && (
        <TransactionFormModal
          transaction={editingTransaction}
          accounts={accounts}
          onClose={() => {
            setShowAddForm(false)
            setEditingTransaction(null)
          }}
          onSave={() => {
            fetchTransactions()
            fetchAccounts()
            setShowAddForm(false)
            setEditingTransaction(null)
          }}
        />
      )}
    </div>
  )
}

// Transaction Form Modal Component
function TransactionFormModal({ transaction, accounts, onClose, onSave }: {
  transaction: FinancialTransaction | null
  accounts: FinancialAccount[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    accountId: transaction?.accountId || '',
    type: transaction?.type || 'DEBIT',
    category: transaction?.category || '',
    amount: transaction?.amount || 0,
    description: transaction?.description || '',
    status: transaction?.status || 'PENDING',
    dueDate: transaction?.dueDate || '',
    paymentMethod: transaction?.paymentMethod || '',
    paymentReference: transaction?.paymentReference || '',
    notes: transaction?.notes || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = transaction ? `/api/financial/transactions/${transaction.id}` : '/api/financial/transactions'
      const method = transaction ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount.toString()),
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        }),
      })

      if (response.ok) {
        alert(transaction ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil ditambahkan')
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert('Terjadi kesalahan saat menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mahasiswa</label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Mahasiswa</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.student.name} - {account.student.nim}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tipe Transaksi</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="DEBIT">Piutang</option>
                <option value="CREDIT">Pembayaran</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="SPP">SPP</option>
                <option value="Uang Pangkal">Uang Pangkal</option>
                <option value="Ujian">Biaya Ujian</option>
                <option value="Praktikum">Biaya Praktikum</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Jatuh Tempo</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Lunas</option>
                <option value="OVERDUE">Jatuh Tempo</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Metode</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="E-Wallet">E-Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">No. Referensi</label>
              <input
                type="text"
                value={formData.paymentReference}
                onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : (transaction ? 'Perbarui' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
