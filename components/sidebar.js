/**
 * PRODUK_LOKAL BY KOPIA - COMPONENTS / SIDEBAR
 * UI Reusable untuk Navigasi Menu Admin (Desktop & Mobile Drawer)
 */

window.SidebarComponent = {
  render(targetSelector, activePage = 'dashboard', onNavigate, onCloseSidebar) {
    const container = document.querySelector(targetSelector);
    if (!container) return;

    container.innerHTML = `
      <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
      <aside class="admin-sidebar" id="adminSidebar">
        <!-- Sidebar Brand Header -->
        <div class="sidebar-header">
          <div class="sidebar-brand-box">
            <div class="sidebar-logo-icon">
              <span class="material-symbols-outlined">inventory_2</span>
            </div>
            <div class="sidebar-brand-title">
              <strong>Admin Panel</strong>
              <small>Versi 2.4 • Kopia</small>
            </div>
          </div>
          <button type="button" class="sidebar-close-btn" id="sidebarCloseBtn" aria-label="Tutup Menu">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          <div class="nav-section-label">MENU UTAMA</div>
          
          <button type="button" class="sidebar-nav-item ${activePage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
            <span class="material-symbols-outlined nav-icon">query_stats</span>
            <span class="nav-label">Ringkasan Statistik</span>
            <span class="nav-badge" id="sidebarStatBadge">Live</span>
          </button>

          <button type="button" class="sidebar-nav-item ${activePage === 'products' ? 'active' : ''}" data-page="products">
            <span class="material-symbols-outlined nav-icon">inventory</span>
            <span class="nav-label">Manajemen Produk</span>
            <span class="nav-counter" id="sidebarProductCount">0</span>
          </button>

          <button type="button" class="sidebar-nav-item ${activePage === 'leads' ? 'active' : ''}" data-page="leads">
            <span class="material-symbols-outlined nav-icon">chat</span>
            <span class="nav-label">Log Klik WhatsApp</span>
            <span class="nav-badge new-badge" id="sidebarWaBadge">WA</span>
          </button>

          <div class="nav-section-label">PINTASAN</div>

          <a href="index.html" class="sidebar-nav-item external-nav" target="_blank">
            <span class="material-symbols-outlined nav-icon">storefront</span>
            <span class="nav-label">Lihat Toko Publik</span>
            <span class="material-symbols-outlined nav-arrow">arrow_outward</span>
          </a>
        </nav>

        <!-- Sidebar Footer / Status Quick Card -->
        <div class="sidebar-footer">
          <div class="sidebar-system-card">
            <div class="system-card-header">
              <span class="material-symbols-outlined" style="font-size:18px; color:var(--primary);">shield</span>
              <span>Direct Commerce UMKM</span>
            </div>
            <p>Database tersinkronisasi otomatis dengan Firestore & Landing Page.</p>
          </div>
        </div>
      </aside>
    `;

    // Event listeners
    container.querySelectorAll('.sidebar-nav-item[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.getAttribute('data-page');
        if (onNavigate) onNavigate(page);
        if (onCloseSidebar) onCloseSidebar();
      });
    });

    const backdrop = container.querySelector('#sidebarBackdrop');
    if (backdrop && onCloseSidebar) {
      backdrop.addEventListener('click', onCloseSidebar);
    }

    const closeBtn = container.querySelector('#sidebarCloseBtn');
    if (closeBtn && onCloseSidebar) {
      closeBtn.addEventListener('click', onCloseSidebar);
    }
  },

  updateProductCount(count) {
    const el = document.getElementById('sidebarProductCount');
    if (el) el.textContent = count;
  }
};
