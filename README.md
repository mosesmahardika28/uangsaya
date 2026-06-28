# 💰 UangSaya

> **Personal Financial Operating System** — Bukan sekadar aplikasi pencatat uang.

![UangSaya Banner](https://img.shields.io/badge/UangSaya-Personal%20Finance-7F77DD?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek0xMSAxN3YtNkg5bDMtNCAzIDRoLTJ2NmgtMnoiLz48L3N2Zz4=)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📱 Demo

🔗 **[Coba Langsung → gleaming-melomakarona-4eccae.netlify.app]([https://mellow-tulumba-7b4d4f.netlify.app](https://gleaming-melomakarona-4eccae.netlify.app/))**

> Aplikasi berjalan **100% offline** di browser. Data tersimpan lokal di device kamu — tidak ada server, tidak ada akun, tidak ada iklan.

---

## ✨ Fitur Utama

### 💳 Manajemen Dompet
- Kelola banyak dompet sekaligus (BCA, DANA, OVO, Cash, dll.)
- Saldo dihitung otomatis dari transaksi — bukan disimpan manual
- Transfer antar dompet dengan riwayat lengkap
- Arsip dompet yang tidak aktif

### 📊 Pencatatan Transaksi
- Catat pemasukan, pengeluaran, dan transfer
- **Quick Add** — input cepat dengan teks bebas: `25000 makan dana`
- Filter berdasarkan waktu, dompet, dan kategori
- Search transaksi berdasarkan nama, catatan, atau dompet
- Edit dan hapus transaksi dengan konfirmasi

### 📈 Statistik & Analitik
- Pie chart pengeluaran per kategori
- Line chart tren bulanan
- Bar chart perbandingan pemasukan vs pengeluaran
- Statistik detail per kategori dengan riwayat transaksi
- Analisis dompet paling aktif

### 🎯 Budget & Goal
- Atur budget per kategori dengan progress bar dan peringatan
- Goal tabungan terintegrasi sebagai dompet khusus
- Transfer dana dari dompet ke goal secara langsung
- Riwayat tabungan per goal

### 💡 Insight Engine
- Analisis otomatis berbasis rule engine (tanpa AI cloud)
- Deteksi kenaikan/penurunan pengeluaran per kategori
- Peringatan budget hampir habis
- Info dompet paling aktif minggu ini
- Semua berjalan **100% offline**

### 💾 Backup & Restore
- Export data ke **JSON** (backup lengkap)
- Export transaksi ke **CSV** (untuk spreadsheet)
- Import & restore dari file backup
- Reset data dengan konfirmasi

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Komponen UI | shadcn/ui (Radix) |
| Database | Dexie.js (IndexedDB) |
| State Management | Zustand |
| Charts | Recharts |
| Date Utility | date-fns |
| PWA | vite-plugin-pwa |
| Icons | Lucide React |
| Routing | React Router v6 |

---

## 🏗️ Arsitektur

```
src/
├── components/
│   ├── layout/          # AppLayout, BottomNav
│   └── shared/          # Komponen reusable (Card, Chart, dll.)
├── pages/               # Halaman utama aplikasi
├── database/
│   ├── db.ts            # Schema Dexie.js
│   └── seed.ts          # Data inisialisasi
├── stores/              # Zustand state management
├── services/
│   ├── quickAddParser.ts    # Parser input teks bebas
│   ├── insightEngine.ts     # Rule-based insight
│   ├── statisticsService.ts # Kalkulasi statistik
│   └── backupService.ts     # Export/import data
├── utils/
│   └── finance.ts       # Kalkulasi saldo & format Rupiah
└── types/               # TypeScript interfaces
```

### Alur Data
```
IndexedDB (Dexie)
      ↓
Zustand Store
      ↓
React Components
      ↓
UI
```

### Schema Database
```
wallets       → id, name, icon, color, initialBalance, isGoal, goalTarget, ...
categories    → id, name, type, icon, color, isArchived
transactions  → id, type, walletId, categoryId, amount, note, date, ...
transfers     → id, fromWalletId, toWalletId, amount, note, date
budgets       → id, categoryId, amount, period
settings      → id, currency, theme, firstDayOfWeek
```

---

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+
- npm atau yarn

### Instalasi

```bash
# Clone repository
git clone https://github.com/USERNAME/uangsaya.git
cd uangsaya

# Install dependensi
npm install

# Jalankan development server
npm run dev
```

Buka `http://localhost:5173` di browser.

### Build Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

---

## 📲 Install sebagai PWA

### Android (Chrome)
1. Buka [mellow-tulumba-7b4d4f.netlify.app](https://mellow-tulumba-7b4d4f.netlify.app) di Chrome
2. Tap menu (⋮) → **"Add to Home Screen"**
3. Tap **Install**
4. Aplikasi siap digunakan offline!

### Desktop (Chrome/Edge)
1. Buka URL aplikasi
2. Klik ikon install (➕) di address bar
3. Klik **Install**

---

## 📖 Cara Penggunaan

### Quick Add
Fitur unggulan untuk mencatat transaksi dengan cepat:
```
Format: [nominal] [kategori] [dompet] [catatan opsional]

Contoh:
25000 makan dana          → Rp25.000, Makan & Minum, DANA
15rb transportasi ovo     → Rp15.000, Transportasi, OVO
500000 beasiswa bca       → Rp500.000, Beasiswa, BCA
1.5jt belanja cash        → Rp1.500.000, Belanja, Cash
```

### Manajemen Goal
Goal terintegrasi sebagai dompet khusus:
1. Buat goal baru (nama, target, deadline)
2. Transfer dana dari dompet mana saja ke goal
3. Progress otomatis terhitung dari total transfer masuk
4. Riwayat tabungan tersimpan lengkap

### Backup & Pindah Device
```
Device lama → Pengaturan → Export JSON → simpan file
Device baru → Pengaturan → Import Data → pilih file JSON
```

---

## 🗺️ Roadmap

- [ ] Dark mode
- [ ] Notifikasi pengingat harian
- [ ] Widget home screen Android
- [ ] Laporan PDF bulanan
- [ ] Recurring transaction (transaksi berulang)
- [ ] Multi-currency support
- [ ] Sinkronisasi cloud opsional

---

## 🤝 Kontribusi

Kontribusi sangat welcome! Silakan:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'feat: tambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

---

## 📄 Lisensi

Didistribusikan di bawah lisensi MIT. Lihat [`LICENSE`](LICENSE) untuk informasi lebih lanjut.

---

## 👤 Developer

Dibuat dengan ❤️ sebagai proyek personal finance management.

> *"Financial freedom is available to those who learn about it and work for it."*

---

<div align="center">
  <sub>Built with React + TypeScript + Dexie.js • 100% Offline • No Server Required</sub>
</div>
