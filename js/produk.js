import { supabase } from './supabase.js'

const tabelProduk = document.getElementById('tabelProduk')
const modal = document.getElementById('modal')
const formProduk = document.getElementById('formProduk')
const judulModal = document.getElementById('judulModal')

let modeEdit = false

// Ambil semua produk
async function loadProduk() {
  const { data, error } = await supabase
    .from('produk')
    .select('*')
    .order('nama')

  if (error) {
    alert('Gagal memuat produk: ' + error.message)
    return
  }

  tabelProduk.innerHTML = ''

  if (data.length === 0) {
    tabelProduk.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-gray-500">
          Belum ada produk. Klik tombol "+ Tambah Produk"
        </td>
      </tr>`
    return
  }

  data.forEach(p => {
    const tr = document.createElement('tr')
    tr.className = 'border-t hover:bg-gray-50'
    tr.innerHTML = `
      <td class="px-4 py-3 font-medium">${p.nama}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded text-xs ${p.kategori === 'ATK' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}">
          ${p.kategori}
        </span>
      </td>
      <td class="px-4 py-3 text-right">Rp ${p.harga_jual.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right ${p.stok <= 5 ? 'text-red-600 font-bold' : ''}">${p.stok}</td>
      <td class="px-4 py-3">${p.satuan || 'pcs'}</td>
      <td class="px-4 py-3 text-center space-x-2">
        <button onclick="editProduk(${p.id})" class="text-blue-600 hover:underline">Edit</button>
        <button onclick="hapusProduk(${p.id})" class="text-red-600 hover:underline">Hapus</button>
      </td>
    `
    tabelProduk.appendChild(tr)
  })
}

// Buka modal tambah
window.bukaModal = function() {
  modeEdit = false
  judulModal.textContent = 'Tambah Produk'
  formProduk.reset()
  document.getElementById('produkId').value = ''
  modal.classList.remove('hidden')
  modal.classList.add('flex')
}

// Tutup modal
window.tutupModal = function() {
  modal.classList.add('hidden')
  modal.classList.remove('flex')
}

// Simpan produk (tambah / edit)
formProduk.addEventListener('submit', async (e) => {
  e.preventDefault()

  const data = {
    nama: document.getElementById('nama').value.trim(),
    kategori: document.getElementById('kategori').value,
    harga_jual: Number(document.getElementById('harga_jual').value),
    harga_modal: Number(document.getElementById('harga_modal').value) || 0,
    stok: Number(document.getElementById('stok').value),
    satuan: document.getElementById('satuan').value
  }

  let error

  if (modeEdit) {
    const id = document.getElementById('produkId').value
    const res = await supabase.from('produk').update(data).eq('id', id)
    error = res.error
  } else {
    const res = await supabase.from('produk').insert([data])
    error = res.error
  }

  if (error) {
    alert('Gagal menyimpan: ' + error.message)
    return
  }

  tutupModal()
  loadProduk()
})

// Edit produk
window.editProduk = async function(id) {
  const { data, error } = await supabase.from('produk').select('*').eq('id', id).single()
  if (error) return alert(error.message)

  modeEdit = true
  judulModal.textContent = 'Edit Produk'
  document.getElementById('produkId').value = data.id
  document.getElementById('nama').value = data.nama
  document.getElementById('kategori').value = data.kategori
  document.getElementById('harga_jual').value = data.harga_jual
  document.getElementById('harga_modal').value = data.harga_modal || 0
  document.getElementById('stok').value = data.stok
  document.getElementById('satuan').value = data.satuan || 'pcs'

  modal.classList.remove('hidden')
  modal.classList.add('flex')
}

// Hapus produk
window.hapusProduk = async function(id) {
  if (!confirm('Yakin ingin menghapus produk ini?')) return

  const { error } = await supabase.from('produk').delete().eq('id', id)
  if (error) {
    alert('Gagal menghapus: ' + error.message)
    return
  }
  loadProduk()
}

// Jalankan saat halaman dibuka
loadProduk()