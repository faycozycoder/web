/**
 * PRODUK_LOKAL BY KOPIA - PAGES / DASHBOARD PAGE
 * Komponen Halaman Ringkasan Statistik & Ikhtisar Operasional
 */

window.DashboardPage = {
  render(targetSelector, { stats, products, leads, user, onNavigate, onOpenAddProduct, onOpenEditProduct }) {
    const container = document.querySelector(targetSelector);
    if (!container) return;

    const safeStats = stats || { totalVisitors: 1248, waClicks: 386, totalOrders: 94 };
    const safeProducts = products || [];
    const safeLeads = leads || [];
    const displayName = user ? (user.displayName || user.email.split('@')[0]) : 'Admin';

    // Cek produk dengan stok menipis (<= 5)
    const lowStockProducts = safeProducts.filter(p => Number(p.stockLeft) <= 5);

    // Ambil 5 produk terbaru untuk preview
    const recentProducts = safeProducts.slice(0, 5);

    container.innerHTML = `
      <div class="page-content">
        <!-- 1. Header Sambutan & Waktu -->
        <div class="dashboard-banner">
          <div class="banner-text">
            <span class="banner-badge">
              <span class="material-symbols-outlined" style="font-size:14px;">check_circle</span>
              Sistem Aktif & Terhubung ke Firestore
            </span>
            <h2 class="banner-title">Selamat Datang, ${displayName}! 👋</h2>
            <p class="banner-desc">Pantau performa trafik pengunjung, konversi klik WhatsApp pembeli, dan kelola katalog produk lokal secara real-time.</p>
          </div>
          <div class="banner-actions">
            <button type="button" class="btn-primary" id="dashAddProductBtn">
              <span class="material-symbols-outlined">add_circle</span>
              <span>Tambah Produk Baru</span>
            </button>
            <a href="index.html" target="_blank" class="btn-secondary" id="dashViewStoreBtn">
              <span class="material-symbols-outlined">visibility</span>
              <span>Lihat Toko Publik</span>
            </a>
          </div>
        </div>

        <!-- 2. Ringkasan Statistik (Total Pengunjung, Klik WhatsApp, Jumlah Produk) -->
        <div class="section-block">
          <div class="section-header">
            <h3 class="section-title">
              <span class="material-symbols-outlined section-icon">analytics</span>
              Ringkasan Statistik Real-Time
            </h3>
            <span class="section-meta">Diperbarui otomatis via Cloud Firestore</span>
          </div>
          ${window.StatCardComponent.renderAll(safeStats, safeProducts.length)}
        </div>

        <!-- 3. Alert Stok Menipis (Jika ada) -->
        ${lowStockProducts.length > 0 ? `
          <div class="admin-notice-banner warning">
            <span class="material-symbols-outlined notice-icon">warning</span>
            <div class="notice-text">
              <strong>Perhatian Stok Menipis:</strong> Ada <strong>${lowStockProducts.length} produk</strong> dengan stok 5 pcs atau kurang (${lowStockProducts.map(p => p.title).slice(0, 2).join(', ')}${lowStockProducts.length > 2 ? ', dll.' : ''}).
            </div>
            <button type="button" class="btn-notice-action" id="viewLowStockBtn">Periksa Produk</button>
          </div>
        ` : ''}

        <!-- 4. Dua Kolom: Produk Unggulan & Log Interaksi WhatsApp -->
        <div class="dashboard-two-col">
          <!-- Kolom Kiri: Produk Terbaru di Etalase -->
          <div class="card-box">
            <div class="card-box-header">
              <div class="header-left">
                <span class="material-symbols-outlined card-box-icon">inventory_2</span>
                <div>
                  <h4 class="card-box-title">Katalog Produk Terkurasi</h4>
                  <small class="card-box-sub">Total ${safeProducts.length} produk tayang di landing page</small>
                </div>
              </div>
              <button type="button" class="btn-link" id="dashViewAllProductsBtn">
                Lihat Semua (${safeProducts.length}) &rarr;
              </button>
            </div>

            <div class="recent-products-list">
              ${recentProducts.length > 0 ? recentProducts.map(p => `
                <div class="recent-product-item" data-id="${p.id}">
                  <img src="${p.img || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=120&q=80'}" alt="${p.title}" class="recent-product-thumb">
                  <div class="recent-product-info">
                    <div class="recent-product-name">${p.title}</div>
                    <div class="recent-product-meta">
                      <span class="badge-cat">${p.categoryLabel || p.category}</span>
                      <span>• Toko: <strong>${p.seller}</strong></span>
                    </div>
                  </div>
                  <div class="recent-product-pricing">
                    <div class="recent-price-promo">Rp ${(p.promoPrice || 0).toLocaleString('id-ID')}</div>
                    ${p.discount ? `<span class="badge-discount">${p.badge || `Diskon ${p.discount}%`}</span>` : ''}
                  </div>
                  <button type="button" class="btn-icon edit-quick-btn" title="Edit Produk" data-id="${p.id}">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                </div>
              `).join('') : `
                <div class="empty-state-box">
                  <span class="material-symbols-outlined">inventory</span>
                  <p>Belum ada produk di database.</p>
                  <button type="button" class="btn-primary btn-sm" id="emptyAddProductBtn">Tambah Produk Pertama</button>
                </div>
              `}
            </div>
          </div>

          <!-- Kolom Kanan: Aktivitas Klik WhatsApp & Prospek Pembeli -->
          <div class="card-box">
            <div class="card-box-header">
              <div class="header-left">
                <span class="material-symbols-outlined card-box-icon" style="color:#059669;">chat</span>
                <div>
                  <h4 class="card-box-title">Aktivitas Klik WhatsApp Pembeli</h4>
                  <small class="card-box-sub">Prospek pembeli yang menghubungi penjual</small>
                </div>
              </div>
              <button type="button" class="btn-link" id="dashViewAllLeadsBtn">
                Riwayat Lengkap &rarr;
              </button>
            </div>

            <div class="recent-leads-list">
              ${safeLeads.length > 0 ? safeLeads.map(l => {
                const timeStr = l.timestampStr 
                  ? new Date(l.timestampStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  : 'Baru saja';
                return `
                  <div class="recent-lead-item">
                    <div class="lead-icon-wrap">
                      <span class="material-symbols-outlined">support_agent</span>
                    </div>
                    <div class="lead-info">
                      <div class="lead-seller">Chat Ditujukan ke: <strong>${l.seller || 'Admin Toko'}</strong></div>
                      <div class="lead-product">Terkait: ${l.productId || l.productTitle || 'Produk Promo Kopia'}</div>
                    </div>
                    <div class="lead-time">
                      <span class="material-symbols-outlined" style="font-size:12px;">schedule</span>
                      ${timeStr}
                    </div>
                  </div>
                `;
              }).join('') : `
                <div class="empty-state-box">
                  <span class="material-symbols-outlined">forum</span>
                  <p>Belum ada log klik WhatsApp tercatat hari ini.</p>
                </div>
              `}
            </div>

            <!-- Ringkasan Konversi WhatsApp -->
            <div class="conversion-summary-card">
              <div class="conversion-row">
                <span>Rasio Minat Beli (Klik WA):</span>
                <strong>${safeStats.totalVisitors > 0 ? ((safeStats.waClicks / safeStats.totalVisitors) * 100).toFixed(1) : '30.9'}%</strong>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width: ${Math.min(100, Math.round((safeStats.waClicks / (safeStats.totalVisitors || 1)) * 100))}%"></div>
              </div>
              <small class="progress-hint">Setiap ${safeStats.totalVisitors > 0 ? Math.max(1, Math.round(safeStats.totalVisitors / (safeStats.waClicks || 1))) : 3} pengunjung landing page, rata-rata 1 pengunjung melakukan klik chat WhatsApp.</small>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind event listeners
    const addBtn = container.querySelector('#dashAddProductBtn');
    if (addBtn && onOpenAddProduct) {
      addBtn.addEventListener('click', onOpenAddProduct);
    }

    const emptyAddBtn = container.querySelector('#emptyAddProductBtn');
    if (emptyAddBtn && onOpenAddProduct) {
      emptyAddBtn.addEventListener('click', onOpenAddProduct);
    }

    const viewAllBtn = container.querySelector('#dashViewAllProductsBtn');
    if (viewAllBtn && onNavigate) {
      viewAllBtn.addEventListener('click', () => onNavigate('products'));
    }

    const viewLeadsBtn = container.querySelector('#dashViewAllLeadsBtn');
    if (viewLeadsBtn && onNavigate) {
      viewLeadsBtn.addEventListener('click', () => onNavigate('leads'));
    }

    const viewLowStockBtn = container.querySelector('#viewLowStockBtn');
    if (viewLowStockBtn && onNavigate) {
      viewLowStockBtn.addEventListener('click', () => onNavigate('products', { filter: 'lowStock' }));
    }

    // Quick edit buttons
    container.querySelectorAll('.edit-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prod = safeProducts.find(p => p.id === id);
        if (prod && onOpenEditProduct) {
          onOpenEditProduct(prod);
        }
      });
    });
  }
};
