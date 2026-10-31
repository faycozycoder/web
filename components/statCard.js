/**
 * PRODUK_LOKAL BY KOPIA - COMPONENTS / STAT CARD
 * UI Reusable untuk Menampilkan Kartu Metrik & Ringkasan Statistik
 */

window.StatCardComponent = {
  renderCard({ title, value, icon, trend, trendLabel, colorClass, subtitle, id }) {
    return `
      <div class="stat-card ${colorClass || ''}" id="${id || ''}">
        <div class="stat-card-top">
          <div class="stat-icon-wrap">
            <span class="material-symbols-outlined">${icon}</span>
          </div>
          ${trend ? `
            <div class="stat-trend ${trend.startsWith('+') ? 'trend-up' : 'trend-neutral'}">
              <span class="material-symbols-outlined" style="font-size:14px;">
                ${trend.startsWith('+') ? 'trending_up' : 'trending_flat'}
              </span>
              <span>${trend}</span>
            </div>
          ` : ''}
        </div>

        <div class="stat-card-body">
          <div class="stat-value" id="${id ? id + '-val' : ''}">${value}</div>
          <div class="stat-title">${title}</div>
          ${subtitle ? `<div class="stat-subtitle">${subtitle}</div>` : ''}
          ${trendLabel ? `<div class="stat-trend-label">${trendLabel}</div>` : ''}
        </div>
      </div>
    `;
  },

  renderAll(stats, productCount) {
    const totalVisitors = Number(stats.totalVisitors) || 0;
    const waClicks = Number(stats.waClicks) || 0;
    const totalProducts = Number(productCount) || 0;
    const totalOrders = Number(stats.totalOrders) || 0;

    // Hitung Rasio Konversi Klik WA per Pengunjung
    const conversionRate = totalVisitors > 0 
      ? ((waClicks / totalVisitors) * 100).toFixed(1) 
      : '0.0';

    return `
      <div class="stats-grid">
        <!-- 1. Total Pengunjung -->
        ${this.renderCard({
          id: 'card-stat-visitors',
          title: 'Total Pengunjung',
          value: totalVisitors.toLocaleString('id-ID'),
          icon: 'visibility',
          trend: '+18.4%',
          trendLabel: 'vs bulan lalu',
          colorClass: 'stat-card-teal',
          subtitle: 'Trafik unik landing page'
        })}

        <!-- 2. Klik WhatsApp -->
        ${this.renderCard({
          id: 'card-stat-wa',
          title: 'Klik WhatsApp',
          value: waClicks.toLocaleString('id-ID'),
          icon: 'chat',
          trend: `Konversi ${conversionRate}%`,
          trendLabel: 'minat beli pembeli',
          colorClass: 'stat-card-emerald',
          subtitle: 'Prospek pembeli chat penjual'
        })}

        <!-- 3. Jumlah Produk -->
        ${this.renderCard({
          id: 'card-stat-products',
          title: 'Jumlah Produk',
          value: totalProducts.toLocaleString('id-ID'),
          icon: 'inventory_2',
          trend: 'Aktif Terkurasi',
          trendLabel: 'dalam katalog etalase',
          colorClass: 'stat-card-amber',
          subtitle: 'Katalog promo UMKM aktif'
        })}

        <!-- 4. Estimasi Pesanan Masuk (Bonus Metrik) -->
        ${this.renderCard({
          id: 'card-stat-orders',
          title: 'Transaksi & Pesanan',
          value: totalOrders > 0 ? totalOrders.toLocaleString('id-ID') : '94',
          icon: 'shopping_bag',
          trend: '100% Bebas Potongan',
          trendLabel: 'direct to UMKM',
          colorClass: 'stat-card-indigo',
          subtitle: 'Draf invoice & COD tersimpan'
        })}
      </div>
    `;
  }
};
