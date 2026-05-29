# Dashboard Metrics — Implementation Plan

## Ringkasan Data Model

Berdasarkan schema Prisma, entitas utama yang tersedia:
- **Order** — `orderStatus` (PENDING/DONE), `paymentStatus` (UNPAID/PAID), `totalPrice`, `discountAmount`, `createdAt`
- **OrderItem** — `qty`, `price`, `subtotal`, relasi ke `Service`
- **Customer** — `transactionCount`, `createdAt`
- **Service** — `name`, `unit`, `price`
- **DiscountRule** — aturan diskon otomatis/manual

---

## Rekomendasi Metrics untuk Halaman Beranda Admin

### 1. Summary Cards (KPI Utama)

| Metric | Deskripsi | Entitas |
|--------|-----------|---------|
| **Pendapatan Hari Ini** | Total `totalPrice` order PAID hari ini | Order |
| **Pendapatan Bulan Ini** | Total `totalPrice` order PAID bulan berjalan | Order |
| **Order Hari Ini** | Jumlah order yang dibuat hari ini (semua status) | Order |
| **Order Belum Lunas** | Jumlah + total nominal order dengan `paymentStatus = UNPAID` | Order |
| **Order Dalam Proses** | Jumlah order dengan `orderStatus = PENDING` | Order |
| **Total Pelanggan Aktif** | Jumlah customer yang punya minimal 1 order | Customer |

---

### 2. Revenue Trend Chart

**Grafik Pendapatan Harian (30 hari terakhir)**
- X-axis: tanggal
- Y-axis: total revenue (sum `totalPrice` where `paymentStatus = PAID`)
- Berguna untuk melihat tren naik/turun dan hari ramai

---

### 3. Order Status Breakdown

**Donut/Pie Chart:**
- PENDING vs DONE (order status)
- UNPAID vs PAID (payment status)

Menunjukkan berapa % order yang sudah selesai dan sudah dibayar.

---

### 4. Top Services

**Bar Chart / List:**
- 5 layanan paling banyak dipesan (COUNT order items per service)
- Bisa juga berdasarkan revenue (SUM subtotal per service)

---

### 5. Pelanggan Teratas

**List (Top 5):**
- Pelanggan dengan `transactionCount` tertinggi
- Atau pelanggan dengan total spending tertinggi bulan ini

---

### 6. Order Terbaru

**Tabel mini (5–10 baris terakhir):**
- Kolom: Order Number, Nama Customer, Total, Status Order, Status Bayar, Waktu
- Quick-link ke halaman detail order

---

### 7. Ringkasan Diskon Bulan Ini

| Metric | Deskripsi |
|--------|-----------|
| Total diskon diberikan | SUM `discountAmount` bulan ini |
| Jumlah order dapat diskon | COUNT order where `discountAmount > 0` |
| Diskon AUTO vs MANUAL | Breakdown berdasarkan `discountSource` |

---

## Arsitektur Implementasi

```
src/
└── dashboard/
    ├── dashboard.module.ts
    ├── dashboard.controller.ts
    ├── dashboard.service.ts
    └── dto/
        ├── dashboard-summary.dto.ts      ← Summary cards
        ├── revenue-trend.dto.ts          ← Revenue chart data
        ├── order-status-breakdown.dto.ts ← Pie chart data
        ├── top-services.dto.ts           ← Top services
        └── dashboard-query.dto.ts        ← Query params (range filter)
```

---

## Endpoint yang Perlu Dibuat

```
GET /dashboard/summary
GET /dashboard/revenue-trend?range=30d|7d|today
GET /dashboard/order-breakdown
GET /dashboard/top-services?limit=5
GET /dashboard/top-customers?limit=5
GET /dashboard/recent-orders?limit=10
GET /dashboard/discount-summary
```

Semua endpoint dilindungi JWT + role ADMIN.

---

## Prisma Query Strategy

### Summary Cards
```ts
// Revenue hari ini
prisma.order.aggregate({
  _sum: { totalPrice: true },
  where: {
    paymentStatus: 'PAID',
    deletedAt: null,
    createdAt: { gte: startOfToday, lte: endOfToday },
  },
});

// Order belum lunas
prisma.order.aggregate({
  _sum: { totalPrice: true },
  _count: true,
  where: { paymentStatus: 'UNPAID', deletedAt: null },
});
```

### Revenue Trend (Raw Query)
```ts
// Gunakan prisma.$queryRaw untuk GROUP BY DATE
prisma.$queryRaw`
  SELECT DATE(created_at) as date, SUM(total_price) as revenue
  FROM orders
  WHERE payment_status = 'PAID'
    AND deleted_at IS NULL
    AND created_at >= ${startDate}
  GROUP BY DATE(created_at)
  ORDER BY date ASC
`
```

### Top Services
```ts
prisma.orderItem.groupBy({
  by: ['serviceId'],
  _count: { id: true },
  _sum: { subtotal: true },
  orderBy: { _count: { id: 'desc' } },
  take: 5,
});
```

---

## Urutan Pengerjaan (Priority)

| Prioritas | Item |
|-----------|------|
| 🔴 High | Summary cards (revenue + order counts) |
| 🔴 High | Order terbaru |
| 🟡 Medium | Revenue trend chart (30 hari) |
| 🟡 Medium | Order status breakdown |
| 🟢 Low | Top services |
| 🟢 Low | Top customers |
| 🟢 Low | Ringkasan diskon |

---

## Catatan Teknis

- Semua query harus filter `deletedAt: null` untuk menghindari data soft-deleted order.
- Gunakan `$transaction` untuk mengambil multiple aggregate sekaligus di `/summary`.
- Pertimbangkan **caching** (TTL 1–5 menit) pada endpoint summary jika traffic tinggi — bisa pakai `cache-manager` dari NestJS.
- Revenue hanya dihitung dari order dengan `paymentStatus = PAID`. Order UNPAID masuk ke metric "piutang".
- Untuk `revenue-trend` dengan `$queryRaw`, pastikan sanitasi input tanggal untuk menghindari SQL injection.
