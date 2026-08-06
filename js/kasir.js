// Cek login
if (localStorage.getItem('isLoggedIn') !== 'true') {
  window.location.href = 'index.html'
}

import { supabase } from './supabase.js'

let semuaProduk = []
let keranjang = []

const daftarProduk = document.getElementById('daftarProduk')
const keranjangEl = document.getElementById('keranjang')
const totalBelanjaEl = document.getElementById('totalBelanja')
const uangBayarEl = document.getElementById('uangBayar')
const kembalianEl = document.getElementById('kembalian')
const btnBayar = document.getElementById('btnBayar')
const modalStruk = document.getElementById('modalStruk')
const isiStruk = document.getElementById('isiStruk')

// Ambil produk dari database
async function loadProduk() {
  const { data, error } = await supabase
    .from('produk')
    .select('*')
    .order('nama')

  if (error) {
    alert('Gagal memuat produk: ' + error.message)
    return
  }

  semuaProduk = data
  tampilkanProduk(data)
}

// Tampilkan produk
function tampilkanProduk(data) {
  daftarProduk.innerHTML = ''

  if (data.length === 0) {
    daftarProduk.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">Belum ada produk</p>`
    return
  }

  data.forEach(p => {
    const div = document.createElement('div')
    div.className = 'bg-white border rounded-xl p-3 hover:shadow cursor-pointer transition'
    div.onclick = () => tambahKeKeranjang(p)
 div.innerHTML = `
  <div class="font-medium text-sm mb-1">${p.nama}</div>
  <div class="text-xs text-gray-500 mb-2">
    ${p.kategori} • Stok: 
    <span class="${p.stok <= 5 ? 'text-red-600 font-bold' : ''}">${p.stok}</span>
    ${p.stok <= 5 ? '<span class="text-red-500">⚠</span>' : ''}
  </div>
  <div class="font-bold text-blue-600">Rp ${p.harga_jual.toLocaleString('id-ID')}</div>
    `
    daftarProduk.appendChild(div)
  })
}

// Cari produk
document.getElementById('cariProduk').addEventListener('input', (e) => {
  const keyword = e.target.value.toLowerCase()
  const hasil = semuaProduk.filter(p => p.nama.toLowerCase().includes(keyword))
  tampilkanProduk(hasil)
})

// Tambah ke keranjang
function tambahKeKeranjang(produk) {
  const ada = keranjang.find(item => item.id === produk.id)

  if (ada) {
    if (ada.qty + 1 > produk.stok && produk.kategori === 'ATK') {
      alert('Stok tidak cukup!')
      return
    }
    ada.qty++
  } else {
    keranjang.push({
      id: produk.id,
      nama: produk.nama,
      harga: produk.harga_jual,
      qty: 1,
      stok: produk.stok,
      kategori: produk.kategori
    })
  }

  renderKeranjang()
}

// Render keranjang
function renderKeranjang() {
  if (keranjang.length === 0) {
    keranjangEl.innerHTML = `<p class="text-gray-400 text-sm text-center py-6">Keranjang masih kosong</p>`
    totalBelanjaEl.textContent = 'Rp 0'
    btnBayar.disabled = true
    return
  }

  keranjangEl.innerHTML = ''
  let total = 0

  keranjang.forEach((item, index) => {
    const subtotal = item.harga * item.qty
    total += subtotal

    const div = document.createElement('div')
    div.className = 'flex justify-between items-center text-sm border-b pb-2'
    div.innerHTML = `
      <div class="flex-1">
        <div class="font-medium">${item.nama}</div>
        <div class="text-gray-500">Rp ${item.harga.toLocaleString('id-ID')} x ${item.qty}</div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="ubahQty(${index}, -1)" class="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300">-</button>
        <span>${item.qty}</span>
        <button onclick="ubahQty(${index}, 1)" class="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300">+</button>
      </div>
    `
    keranjangEl.appendChild(div)
  })

  totalBelanjaEl.textContent = 'Rp ' + total.toLocaleString('id-ID')
  btnBayar.disabled = false
  hitungKembalian()
}

// Ubah jumlah
window.ubahQty = function(index, perubahan) {
  const item = keranjang[index]
  const baru = item.qty + perubahan

  if (baru < 1) {
    keranjang.splice(index, 1)
  } else if (baru > item.stok && item.kategori === 'ATK') {
    alert('Stok tidak cukup!')
    return
  } else {
    item.qty = baru
  }

  renderKeranjang()
}

// Hitung kembalian
uangBayarEl.addEventListener('input', hitungKembalian)

function hitungKembalian() {
  const total = keranjang.reduce((sum, item) => sum + (item.harga * item.qty), 0)
  const bayar = Number(uangBayarEl.value) || 0
  const kembalian = bayar - total

  kembalianEl.textContent = 'Rp ' + (kembalian >= 0 ? kembalian.toLocaleString('id-ID') : 0)
  kembalianEl.className = kembalian >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
}

// Proses Bayar
window.prosesBayar = async function() {
  const total = keranjang.reduce((sum, item) => sum + (item.harga * item.qty), 0)
  const bayar = Number(uangBayarEl.value) || 0

  if (bayar < total) {
    alert('Uang bayar kurang!')
    return
  }

  const kembalian = bayar - total

  // Simpan transaksi
  const { data: transaksi, error: errTransaksi } = await supabase
    .from('transaksi')
    .insert([{ total, bayar, kembalian }])
    .select()
    .single()

  if (errTransaksi) {
    alert('Gagal menyimpan transaksi: ' + errTransaksi.message)
    return
  }

  // Simpan detail + kurangi stok
  for (const item of keranjang) {
    await supabase.from('detail_transaksi').insert([{
      transaksi_id: transaksi.id,
      produk_id: item.id,
      nama_produk: item.nama,
      harga: item.harga,
      qty: item.qty,
      subtotal: item.harga * item.qty
    }])

    // Kurangi stok (hanya untuk ATK)
    if (item.kategori === 'ATK') {
      const produk = semuaProduk.find(p => p.id === item.id)
      if (produk) {
        await supabase
          .from('produk')
          .update({ stok: produk.stok - item.qty })
          .eq('id', item.id)
      }
    }
  }

  // Tampilkan struk
  tampilkanStruk(transaksi, keranjang, total, bayar, kembalian)

  // Reset
  keranjang = []
  uangBayarEl.value = ''
  renderKeranjang()
  
  // Download struk sebagai Gambar
window.downloadStrukGambar = async function() {
  const elemen = document.getElementById('isiStruk')
  const canvas = await html2canvas(elemen, { scale: 2, backgroundColor: '#ffffff' })
  const link = document.createElement('a')
  link.download = `struk-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// Download struk sebagai PDF
window.downloadStrukPDF = async function() {
  const { jsPDF } = window.jspdf
  const elemen = document.getElementById('isiStruk')
  const canvas = await html2canvas(elemen, { scale: 2, backgroundColor: '#ffffff' })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 120]          // ukuran mirip struk thermal
  })

  const width = pdf.internal.pageSize.getWidth()
  const height = (canvas.height * width) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, width, height)
  pdf.save(`struk-${Date.now()}.pdf`)
}
  
  loadProduk() // refresh stok
}

// Tampilkan struk
function tampilkanStruk(transaksi, items, total, bayar, kembalian) {
  const tanggal = new Date(transaksi.created_at).toLocaleString('id-ID')
  const namaToko = localStorage.getItem('namaToko') || 'ATK & Fotokopi'
  const alamat = localStorage.getItem('alamat') || ''
  const whatsapp = localStorage.getItem('whatsapp') || ''

  let html = `
    <div class="text-center mb-3">
      <div class="font-bold text-lg">${namaToko}</div>
      ${alamat ? `<div class="text-xs text-gray-600">${alamat}</div>` : ''}
      ${whatsapp ? `<div class="text-xs text-gray-600">WA: ${whatsapp}</div>` : ''}
      <div class="text-xs text-gray-500 mt-1">${tanggal}</div>
      <div class="text-xs">No: #${transaksi.id}</div>
    </div>
    <div class="border-t border-b py-2 space-y-1 text-sm">
  `

  items.forEach(item => {
    html += `
      <div class="flex justify-between">
        <span>${item.nama} x${item.qty}</span>
        <span>Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</span>
      </div>
    `
  })

  html += `
    </div>
    <div class="mt-3 space-y-1 text-sm">
      <div class="flex justify-between font-bold">
        <span>Total</span>
        <span>Rp ${total.toLocaleString('id-ID')}</span>
      </div>
      <div class="flex justify-between">
        <span>Bayar</span>
        <span>Rp ${bayar.toLocaleString('id-ID')}</span>
      </div>
      <div class="flex justify-between">
        <span>Kembalian</span>
        <span>Rp ${kembalian.toLocaleString('id-ID')}</span>
      </div>
    </div>
    <div class="text-center text-xs text-gray-500 mt-4">Terima kasih telah berbelanja</div>
  `

  isiStruk.innerHTML = html
  modalStruk.classList.remove('hidden')
  modalStruk.classList.add('flex')
}

window.tutupStruk = function() {
  modalStruk.classList.add('hidden')
  modalStruk.classList.remove('flex')
}

// Jalankan
loadProduk()