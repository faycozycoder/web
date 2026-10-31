/**
 * PRODUK_LOKAL BY KOPIA - COMPONENTS / NAVBAR
 * UI Reusable untuk Header & Top Bar Admin
 */

window.NavbarComponent = {
  render(targetSelector, user, onToggleSidebar, onLogout) {
    const container = document.querySelector(targetSelector);
    if (!container) return;

    const email = user ? user.email : 'admin@umkm.id';
    const name = user ? (user.displayName || email.split('@')[0]) : 'Administrator';
    const photo = user && user.photoURL ? user.photoURL : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
    const isDemo = user && user.isDemo;

    container.innerHTML = `
      <header class="admin-topbar">
        <div class="topbar-left">
          <button type="button" class="sidebar-toggle-btn" id="sidebarToggleBtn" aria-label="Toggle Sidebar Menu">
            <span class="material-symbols-outlined">menu</span>
          </button>
          
          <div class="topbar-brand">
            <div class="brand-badge-icon">
              <span class="material-symbols-outlined">storefront</span>
            </div>
            <div>
              <div class="brand-title">Produk_lokal <span class="brand-tag">by kopia</span></div>
              <div class="brand-subtitle">Portal Manajemen Admin UMKM</div>
            </div>
          </div>
        </div>

        <div class="topbar-right">
          <!-- Buka Web Publik -->
          <a href="index.html" target="_blank" class="topbar-action-link" title="Buka Landing Page Pembeli">
            <span class="material-symbols-outlined">open_in_new</span>
            <span class="action-text">Lihat Toko Publik</span>
          </a>

          <!-- Indikator Koneksi Firebase -->
          <div class="firebase-status-badge ${isDemo ? 'status-demo' : 'status-live'}" title="${isDemo ? 'Mode Demo Lokal' : 'Terhubung ke Cloud Firestore'}">
            <span class="status-dot"></span>
            <span class="status-label">${isDemo ? 'Mode Demo' : 'Firestore Live'}</span>
          </div>

          <!-- Profil User Admin -->
          <div class="admin-profile-dropdown">
            <div class="profile-pill">
              <img src="${photo}" alt="${name}" class="profile-avatar">
              <div class="profile-info">
                <span class="profile-name">${name}</span>
                <span class="profile-role">Super Admin</span>
              </div>
            </div>

            <!-- Tombol Keluar -->
            <button type="button" class="btn-logout" id="adminLogoutBtn" title="Keluar dari sesi admin">
              <span class="material-symbols-outlined">logout</span>
              <span class="logout-text">Keluar</span>
            </button>
          </div>
        </div>
      </header>
    `;

    // Attach event listeners
    const toggleBtn = container.querySelector('#sidebarToggleBtn');
    if (toggleBtn && onToggleSidebar) {
      toggleBtn.addEventListener('click', onToggleSidebar);
    }

    const logoutBtn = container.querySelector('#adminLogoutBtn');
    if (logoutBtn && onLogout) {
      logoutBtn.addEventListener('click', onLogout);
    }
  }
};
