// Cek login
if (localStorage.getItem('isLoggedIn') !== 'true') {
  window.location.href = 'index.html'
}

import { supabase } from './supabase.js'

const tabelLaporan = document.getElementById('tabelLaporan')
const totalTransaksiEl = document.getElementById('totalTransaksi')
const totalOmzetEl = document.getElementById('totalOmzet')
const rataRataEl = document.getElementById('rataRata')
const modalDetail = document.getElementById('modalDetail')
const isiDetail = document.getElementById('isiDetail')

// Set tanggal default (hari ini)
const hariIni = new Date().toISOString().split('T')[0]
document.getElementById('dariTanggal').value = hariIni
document.getElementById('sampaiTanggal').value = hariIni

async function loadLaporan() {
  const dari = document.getElementById('dariTanggal').value
  const sampai = document.getElementById('sampaiTanggal').value

  if (!dari || !sampai) {
    alert('Pilih rentang tanggal terlebih dahulu')
    return
  }

  const { data, error } = await supabase
    .from('transaksi')
    .select('*')
    .gte('created_at', dari + 'T00:00:00')
    .lte('created_at', sampai + 'T23:59:59')
    .order('created_at', { ascending: false })

  if (error) {
    alert('Gagal memuat laporan: ' + error.message)
    return
  }

  // Ringkasan
  const totalTransaksi = data.length
  const totalOmzet = data.reduce((sum, t) => sum + t.total, 0)
  const rataRata = totalTransaksi > 0 ? Math.round(totalOmzet / totalTransaksi) : 0

  totalTransaksiEl.textContent = totalTransaksi
  totalOmzetEl.textContent = 'Rp ' + totalOmzet.toLocaleString('id-ID')
  rataRataEl.textContent = 'Rp ' + rataRata.toLocaleString('id-ID')

  // Tabel
  tabelLaporan.innerHTML = ''

  if (data.length === 0) {
    tabelLaporan.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-gray-500">
          Tidak ada transaksi pada rentang tanggal ini
        </td>
      </tr>`
    return
  }

  data.forEach((t, index) => {
    const tanggal = new Date(t.created_at).toLocaleString('id-ID')
    const tr = document.createElement('tr')
    tr.className = 'border-t hover:bg-gray-50'
    tr.innerHTML = `
      <td class="px-4 py-3">${index + 1}</td>
      <td class="px-4 py-3">${tanggal}</td>
      <td class="px-4 py-3 text-right font-medium">Rp ${t.total.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right">Rp ${t.bayar.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right">Rp ${t.kembalian.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-center">
        <button onclick="lihatDetail(${t.id})" class="text-blue-600 hover:underline text-sm">Detail</button>
      </td>
    `
    tabelLaporan.appendChild(tr)
  })
}

// Lihat detail transaksi
window.lihatDetail = async function(id) {
  const { data: detail, error } = await supabase
    .from('detail_transaksi')
    .select('*')
    .eq('transaksi_id', id)

  if (error) {
    alert(error.message)
    return
  }

  let html = ''
  detail.forEach(d => {
    html += `
      <div class="flex justify-between border-b pb-2">
        <div>
          <div class="font-medium">${d.nama_produk}</div>
          <div class="text-gray-500 text-xs">${d.qty} x Rp ${d.harga.toLocaleString('id-ID')}</div>
        </div>
        <div class="font-medium">Rp ${d.subtotal.toLocaleString('id-ID')}</div>
      </div>
    `
  })

  isiDetail.innerHTML = html || '<p class="text-gray-500">Tidak ada detail</p>'
  modalDetail.classList.remove('hidden')
  modalDetail.classList.add('flex')
}

window.tutupDetail = function() {
  modalDetail.classList.add('hidden')
  modalDetail.classList.remove('flex')
}

// Load saat halaman dibuka
loadLaporan()