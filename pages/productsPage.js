/**
 * PRODUK_LOKAL BY KOPIA - PAGES / PRODUCTS CRUD PAGE
 * Komponen Halaman Tabel CRUD Manajemen Produk Responsif (Desktop & Mobile)
 */

window.ProductsPage = {
  searchTerm: '',
  selectedCategory: 'all',
  selectedStockFilter: 'all',
  sortBy: 'latest',

  render(targetSelector, { products, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm, initialFilter }) {
    const container = document.querySelector(targetSelector);
    if (!container) return;

    if (initialFilter && initialFilter.filter === 'lowStock') {
      this.selectedStockFilter = 'low';
    }

    const allProducts = products || [];

    // Filter produk
    let filtered = allProducts.filter(p => {
      // 1. Search filter
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(term);
        const matchSeller = (p.seller || '').toLowerCase().includes(term);
        const matchLoc = (p.location || '').toLowerCase().includes(term);
        if (!matchTitle && !matchSeller && !matchLoc) return false;
      }

      // 2. Category filter
      if (this.selectedCategory !== 'all') {
        if (p.category !== this.selectedCategory) return false;
      }

      // 3. Stock filter
      if (this.selectedStockFilter === 'available') {
        if (Number(p.stockLeft) <= 0) return false;
      } else if (this.selectedStockFilter === 'low') {
        if (Number(p.stockLeft) > 5) return false;
      } else if (this.selectedStockFilter === 'out') {
        if (Number(p.stockLeft) > 0) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (this.sortBy === 'priceAsc') return (a.promoPrice || 0) - (b.promoPrice || 0);
      if (this.sortBy === 'priceDesc') return (b.promoPrice || 0) - (a.promoPrice || 0);
      if (this.sortBy === 'discount') return (b.discount || 0) - (a.discount || 0);
      if (this.sortBy === 'stock') return (b.stockLeft || 0) - (a.stockLeft || 0);
      // latest
      return (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0));
    });

    container.innerHTML = `
      <div class="page-content">
        <!-- 1. Header Halaman CRUD -->
        <div class="page-header-row">
          <div class="page-title-block">
            <h2 class="page-main-title">
              <span class="material-symbols-outlined page-title-icon">inventory</span>
              Manajemen Produk & Etalase UMKM
            </h2>
            <p class="page-subtitle">Kelola penambahan, pengubahan harga, stok promo, dan kurasi etalase secara langsung ke Cloud Firestore</p>
          </div>
          <div class="page-actions-block">
            <button type="button" class="btn-primary" id="tableAddProductBtn">
              <span class="material-symbols-outlined">add_box</span>
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        </div>

        <!-- 2. Toolbar Filter & Pencarian -->
        <div class="crud-toolbar-card">
          <!-- Input Search & Filter Group -->
          <div class="toolbar-search-row">
            <div class="search-input-box">
              <span class="material-symbols-outlined">search</span>
              <input type="text" id="productSearchInput" class="table-search-field" placeholder="Cari berdasarkan nama produk, toko UMKM, atau kota..." value="${this.searchTerm}">
              ${this.searchTerm ? `
                <button type="button" class="search-clear-btn" id="clearSearchBtn">
                  <span class="material-symbols-outlined">close</span>
                </button>
              ` : ''}
            </div>

            <div class="toolbar-filters-right">
              <!-- Filter Stok -->
              <div class="select-filter-group">
                <label for="stockFilterSelect" class="filter-label">Filter Stok:</label>
                <select id="stockFilterSelect" class="toolbar-select">
                  <option value="all" ${this.selectedStockFilter === 'all' ? 'selected' : ''}>Semua Status Stok</option>
                  <option value="available" ${this.selectedStockFilter === 'available' ? 'selected' : ''}>Tersedia (>0 pcs)</option>
                  <option value="low" ${this.selectedStockFilter === 'low' ? 'selected' : ''}>⚠️ Menipis (≤5 pcs)</option>
                  <option value="out" ${this.selectedStockFilter === 'out' ? 'selected' : ''}>Habis (0 pcs)</option>
                </select>
              </div>

              <!-- Sorting -->
              <div class="select-filter-group">
                <label for="sortBySelect" class="filter-label">Urutkan:</label>
                <select id="sortBySelect" class="toolbar-select">
                  <option value="latest" ${this.sortBy === 'latest' ? 'selected' : ''}>Paling Baru</option>
                  <option value="discount" ${this.sortBy === 'discount' ? 'selected' : ''}>Diskon Tertinggi</option>
                  <option value="priceAsc" ${this.sortBy === 'priceAsc' ? 'selected' : ''}>Harga Termurah</option>
                  <option value="priceDesc" ${this.sortBy === 'priceDesc' ? 'selected' : ''}>Harga Tertinggi</option>
                  <option value="stock" ${this.sortBy === 'stock' ? 'selected' : ''}>Stok Terbanyak</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Kategori Tabs -->
          <div class="category-tabs-scroll">
            <button type="button" class="cat-tab-btn ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">
              Semua Kategori (${allProducts.length})
            </button>
            <button type="button" class="cat-tab-btn ${this.selectedCategory === 'kopi' ? 'active' : ''}" data-cat="kopi">
              ☕ Kopi (${allProducts.filter(p => p.category === 'kopi').length})
            </button>
            <button type="button" class="cat-tab-btn ${this.selectedCategory === 'fashion' ? 'active' : ''}" data-cat="fashion">
              👕 Fashion (${allProducts.filter(p => p.category === 'fashion').length})
            </button>
            <button type="button" class="cat-tab-btn ${this.selectedCategory === 'beauty' ? 'active' : ''}" data-cat="beauty">
              ✨ Kecantikan (${allProducts.filter(p => p.category === 'beauty').length})
            </button>
            <button type="button" class="cat-tab-btn ${this.selectedCategory === 'kriya' ? 'active' : ''}" data-cat="kriya">
              🧵 Kriya (${allProducts.filter(p => p.category === 'kriya').length})
            </button>
            <button type="button" class="cat-tab-btn ${this.selectedCategory === 'kuliner' ? 'active' : ''}" data-cat="kuliner">
              🍲 Kuliner (${allProducts.filter(p => p.category === 'kuliner').length})
            </button>
            <button type="button" class="cat-tab-btn ${this.selectedCategory === 'gadget' ? 'active' : ''}" data-cat="gadget">
              📱 Gadget (${allProducts.filter(p => p.category === 'gadget').length})
            </button>
          </div>
        </div>

        <!-- 3. Tabel Data Produk CRUD (Desktop & Mobile) -->
        <div class="table-card">
          <div class="table-meta-bar">
            <span>Menampilkan <strong>${filtered.length}</strong> dari total <strong>${allProducts.length}</strong> produk</span>
            ${(this.searchTerm || this.selectedCategory !== 'all' || this.selectedStockFilter !== 'all') ? `
              <button type="button" class="btn-text-reset" id="resetTableFilterBtn">
                <span class="material-symbols-outlined" style="font-size:15px;">refresh</span>
                Reset Filter
              </button>
            ` : ''}
          </div>

          ${filtered.length > 0 ? `
            <!-- Tampilan Tabel untuk Desktop -->
            <div class="table-responsive desktop-table-wrap">
              <table class="crud-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">Foto</th>
                    <th>Detail Produk & Kategori</th>
                    <th>Harga & Diskon</th>
                    <th>Stok</th>
                    <th>Penjual / UMKM</th>
                    <th style="width: 140px; text-align: center;">Aksi CRUD</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map((p, idx) => {
                    const orig = Number(p.originalPrice) || 0;
                    const promo = Number(p.promoPrice) || 0;
                    const stock = Number(p.stockLeft) || 0;

                    let stockBadgeClass = 'badge-stock-in';
                    let stockLabel = `${stock} pcs`;
                    if (stock === 0) {
                      stockBadgeClass = 'badge-stock-out';
                      stockLabel = 'Habis';
                    } else if (stock <= 5) {
                      stockBadgeClass = 'badge-stock-low';
                      stockLabel = `Tinggal ${stock} pcs`;
                    }

                    return `
                      <tr class="table-row-item" data-id="${p.id}">
                        <td>
                          <div class="table-thumb-wrap">
                            <img src="${p.img || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=120&q=80'}" alt="${p.title}" class="table-product-thumb" loading="lazy">
                          </div>
                        </td>
                        <td>
                          <div class="table-product-title">${p.title}</div>
                          <div class="table-product-tags">
                            <span class="badge-cat-sm">${p.categoryLabel || p.category}</span>
                            ${Array.isArray(p.variants) && p.variants.length > 0 ? `
                              <span class="badge-variant-count" title="${p.variants.join(', ')}">
                                ${p.variants.length} Varian
                              </span>
                            ` : ''}
                          </div>
                        </td>
                        <td>
                          <div class="table-price-promo">Rp ${promo.toLocaleString('id-ID')}</div>
                          ${orig > promo ? `
                            <div class="table-price-orig">
                              <span class="price-strikethrough">Rp ${orig.toLocaleString('id-ID')}</span>
                              <span class="table-disc-badge">-${p.discount || 0}%</span>
                            </div>
                          ` : ''}
                        </td>
                        <td>
                          <span class="badge-stock ${stockBadgeClass}">${stockLabel}</span>
                        </td>
                        <td>
                          <div class="table-seller-name">${p.seller || '-'}</div>
                          <div class="table-seller-location">📍 ${p.location || 'Indonesia'}</div>
                          ${p.phone ? `
                            <a href="https://wa.me/${p.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo, konfirmasi stok produk ' + p.title)}" target="_blank" class="table-wa-chip" title="Chat WhatsApp penjual">
                              <span class="material-symbols-outlined" style="font-size:13px;">chat</span>
                              <span>+${p.phone}</span>
                            </a>
                          ` : ''}
                        </td>
                        <td style="text-align: center;">
                          <div class="table-action-btns">
                            <button type="button" class="btn-action-edit edit-product-btn" title="Edit Produk" data-id="${p.id}">
                              <span class="material-symbols-outlined">edit</span>
                              <span>Edit</span>
                            </button>
                            <button type="button" class="btn-action-delete delete-product-btn" title="Hapus Produk" data-id="${p.id}" data-title="${p.title.replace(/"/g, '&quot;')}">
                              <span class="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <!-- Tampilan Cards Khusus Mobile & Layar Kecil (Responsif) -->
            <div class="mobile-product-cards-list">
              ${filtered.map(p => {
                const orig = Number(p.originalPrice) || 0;
                const promo = Number(p.promoPrice) || 0;
                const stock = Number(p.stockLeft) || 0;

                let stockBadgeClass = 'badge-stock-in';
                let stockLabel = `${stock} pcs`;
                if (stock === 0) {
                  stockBadgeClass = 'badge-stock-out';
                  stockLabel = 'Habis';
                } else if (stock <= 5) {
                  stockBadgeClass = 'badge-stock-low';
                  stockLabel = `Sisa ${stock} pcs`;
                }

                return `
                  <div class="mobile-product-card" data-id="${p.id}">
                    <div class="mobile-card-top">
                      <img src="${p.img || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=200&q=80'}" alt="${p.title}" class="mobile-card-thumb">
                      <div class="mobile-card-header-info">
                        <span class="badge-cat-sm">${p.categoryLabel || p.category}</span>
                        <h4 class="mobile-card-title">${p.title}</h4>
                        <div class="mobile-card-seller">Toko: <strong>${p.seller}</strong> (${p.location})</div>
                      </div>
                    </div>

                    <div class="mobile-card-body">
                      <div class="mobile-price-row">
                        <div>
                          <span class="mobile-price-promo">Rp ${promo.toLocaleString('id-ID')}</span>
                          ${orig > promo ? `
                            <span class="mobile-price-orig">Rp ${orig.toLocaleString('id-ID')}</span>
                            <span class="table-disc-badge">-${p.discount || 0}%</span>
                          ` : ''}
                        </div>
                        <span class="badge-stock ${stockBadgeClass}">${stockLabel}</span>
                      </div>
                    </div>

                    <div class="mobile-card-actions">
                      <button type="button" class="btn-secondary btn-sm edit-product-btn" data-id="${p.id}">
                        <span class="material-symbols-outlined" style="font-size:16px;">edit</span>
                        Edit
                      </button>
                      <button type="button" class="btn-danger-outline btn-sm delete-product-btn" data-id="${p.id}" data-title="${p.title.replace(/"/g, '&quot;')}">
                        <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
                        Hapus
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="table-empty-box">
              <span class="material-symbols-outlined empty-icon">search_off</span>
              <h4 class="empty-title">Tidak ada produk yang cocok</h4>
              <p class="empty-desc">Coba sesuaikan kata kunci pencarian atau ubah filter kategori dan stok yang aktif.</p>
              <button type="button" class="btn-secondary" id="emptyResetFilterBtn">Reset Semua Filter</button>
            </div>
          `}
        </div>
      </div>
    `;

    this.bindEvents(container, { allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm });
  },

  bindEvents(container, { allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm }) {
    // Tombol Tambah Produk
    const addBtn = container.querySelector('#tableAddProductBtn');
    if (addBtn && onOpenAddProduct) {
      addBtn.addEventListener('click', onOpenAddProduct);
    }

    // Input Search
    const searchInput = container.querySelector('#productSearchInput');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchTerm = searchInput.value.trim();
          this.render('#mainAdminContent', { products: allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm });
        }, 300);
      });
    }

    // Clear Search
    const clearBtn = container.querySelector('#clearSearchBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.searchTerm = '';
        this.render('#mainAdminContent', { products: allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm });
      });
    }

    // Filter Kategori Tabs
    container.querySelectorAll('.cat-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedCategory = btn.getAttribute('data-cat');
        this.render('#mainAdminContent', { products: allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm });
      });
    });

    // Filter Stok Select
    const stockSelect = container.querySelector('#stockFilterSelect');
    if (stockSelect) {
      stockSelect.addEventListener('change', () => {
        this.selectedStockFilter = stockSelect.value;
        this.render('#mainAdminContent', { products: allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm });
      });
    }

    // Sort Select
    const sortSelect = container.querySelector('#sortBySelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.sortBy = sortSelect.value;
        this.render('#mainAdminContent', { products: allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm });
      });
    }

    // Reset Buttons
    const resetBtn = container.querySelector('#resetTableFilterBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters(allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm));
    }

    const emptyResetBtn = container.querySelector('#emptyResetFilterBtn');
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', () => this.resetFilters(allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm));
    }

    // Tombol Edit Produk (Desktop & Mobile)
    container.querySelectorAll('.edit-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prod = allProducts.find(p => p.id === id);
        if (prod && onOpenEditProduct) {
          onOpenEditProduct(prod);
        }
      });
    });

    // Tombol Hapus Produk (Desktop & Mobile)
    container.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        if (onOpenDeleteConfirm) {
          onOpenDeleteConfirm(id, title);
        }
      });
    });
  },

  resetFilters(allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm) {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedStockFilter = 'all';
    this.sortBy = 'latest';
    this.render('#mainAdminContent', { products: allProducts, onOpenAddProduct, onOpenEditProduct, onOpenDeleteConfirm });
  }
};
