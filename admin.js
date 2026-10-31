/**
 * PRODUK_LOKAL BY KOPIA - ADMIN CONTROLLER ENGINE
 * Orchestrator aplikasi Admin Dashboard, state manager & router
 */

const AdminApp = {
  // Application State
  state: {
    currentUser: null,
    currentPage: 'dashboard',
    products: [],
    stats: {
      totalVisitors: 1248,
      waClicks: 386,
      totalOrders: 94
    },
    leads: [],
    isSidebarOpen: false,
    activePageOptions: null
  },

  // Inisialisasi Aplikasi
  async init() {
    console.log('🚀 [AdminApp] Menginisialisasi Admin Portal Kopia...');

    // Inisialisasi Firebase Service
    window.FirebaseService.initFirebaseService();

    // Pantau status login pengguna (Firebase Auth + localStorage)
    window.FirebaseService.onAuthChange((user) => {
      this.state.currentUser = user;
      if (user) {
        console.log('👤 [AdminApp] Pengguna terotentikasi:', user.email);
        this.renderAuthenticatedApp();
      } else {
        console.log('🔒 [AdminApp] Pengguna belum login. Menampilkan LoginPage.');
        this.renderLoginPage();
      }
    });
  },

  // Render Halaman Login jika belum ada sesi
  renderLoginPage() {
    window.LoginPage.render('#adminAppRoot', (user) => {
      this.state.currentUser = user;
      this.renderAuthenticatedApp();
    });
  },

  // Render Shell Aplikasi Utama Admin
  renderAuthenticatedApp() {
    const root = document.getElementById('adminAppRoot');
    if (!root) return;

    root.innerHTML = `
      <div class="admin-layout" id="adminLayout">
        <!-- Sidebar Navigation -->
        <div id="sidebarMount"></div>

        <!-- Main Wrapper (Topbar + Content) -->
        <div class="admin-main-wrapper">
          <div id="navbarMount"></div>
          <main class="admin-main-content" id="mainAdminContent">
            <!-- Isi Halaman Aktif -->
          </main>
        </div>
      </div>
    `;

    // Render Navbar & Sidebar
    this.renderNavbar();
    this.renderSidebar();

    // Inisialisasi Listener Data Realtime dari Firebase
    this.initDataSubscriptions();

    // Tampilkan Halaman Awal
    this.navigateTo(this.state.currentPage);
  },

  // Render Reusable Navbar
  renderNavbar() {
    window.NavbarComponent.render(
      '#navbarMount',
      this.state.currentUser,
      () => this.toggleSidebar(),
      () => this.handleLogout()
    );
  },

  // Render Reusable Sidebar
  renderSidebar() {
    window.SidebarComponent.render(
      '#sidebarMount',
      this.state.currentPage,
      (page) => this.navigateTo(page),
      () => this.closeSidebar()
    );
  },

  // Toggle Sidebar untuk Mobile & Tablet
  toggleSidebar() {
    this.state.isSidebarOpen = !this.state.isSidebarOpen;
    const sidebar = document.getElementById('adminSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.toggle('open', this.state.isSidebarOpen);
    if (backdrop) backdrop.classList.toggle('active', this.state.isSidebarOpen);
  },

  closeSidebar() {
    this.state.isSidebarOpen = false;
    const sidebar = document.getElementById('adminSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  },

  // Router Internal Navigasi Antar Halaman
  navigateTo(pageName, options = null) {
    this.state.currentPage = pageName;
    this.state.activePageOptions = options;

    // Perbarui active state pada menu sidebar
    document.querySelectorAll('.sidebar-nav-item[data-page]').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-page') === pageName);
    });

    const contentTarget = '#mainAdminContent';

    if (pageName === 'dashboard') {
      window.DashboardPage.render(contentTarget, {
        stats: this.state.stats,
        products: this.state.products,
        leads: this.state.leads,
        user: this.state.currentUser,
        onNavigate: (p, opt) => this.navigateTo(p, opt),
        onOpenAddProduct: () => this.openAddProductModal(),
        onOpenEditProduct: (p) => this.openEditProductModal(p)
      });
    } else if (pageName === 'products') {
      window.ProductsPage.render(contentTarget, {
        products: this.state.products,
        onOpenAddProduct: () => this.openAddProductModal(),
        onOpenEditProduct: (p) => this.openEditProductModal(p),
        onOpenDeleteConfirm: (id, title) => this.openDeleteConfirmModal(id, title),
        initialFilter: options
      });
    } else if (pageName === 'leads') {
      window.LeadsPage.render(contentTarget, {
        leads: this.state.leads,
        stats: this.state.stats,
        onNavigate: (p) => this.navigateTo(p)
      });
    }

    // Scroll to top saat berpindah halaman
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Sinkronisasi Data Realtime (Produk, Stats, Leads)
  initDataSubscriptions() {
    // 1. Subscribe ke koleksi products
    window.FirebaseService.subscribeProducts((productList) => {
      this.state.products = productList;
      console.log(`📦 [AdminApp] ${productList.length} produk tersinkron.`);
      
      // Update badge jumlah produk di sidebar
      window.SidebarComponent.updateProductCount(productList.length);

      // Re-render halaman aktif jika sedang menampilkan data yang dipengaruhi produk
      if (this.state.currentPage === 'dashboard') {
        this.navigateTo('dashboard');
      } else if (this.state.currentPage === 'products') {
        window.ProductsPage.render('#mainAdminContent', {
          products: this.state.products,
          onOpenAddProduct: () => this.openAddProductModal(),
          onOpenEditProduct: (p) => this.openEditProductModal(p),
          onOpenDeleteConfirm: (id, title) => this.openDeleteConfirmModal(id, title),
          initialFilter: this.state.activePageOptions
        });
      }
    });

    // 2. Subscribe ke statistik (Total Pengunjung, Klik WA)
    window.FirebaseService.subscribeStats((statsData) => {
      this.state.stats = { ...this.state.stats, ...statsData };
      if (this.state.currentPage === 'dashboard') {
        this.navigateTo('dashboard');
      }
    });

    // 3. Ambil log leads WhatsApp terkini
    window.FirebaseService.fetchRecentLeads(15).then(leadsData => {
      this.state.leads = leadsData;
      if (this.state.currentPage === 'dashboard' || this.state.currentPage === 'leads') {
        this.navigateTo(this.state.currentPage);
      }
    });
  },

  // Modal Handlers
  openAddProductModal() {
    window.ProductModalComponent.openForCreate();
  },

  openEditProductModal(product) {
    window.ProductModalComponent.openForEdit(product);
  },

  openDeleteConfirmModal(productId, productTitle) {
    window.DeleteConfirmModalComponent.open(productId, productTitle);
  },

  // Logout Handler
  async handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari sesi admin?')) {
      await window.FirebaseService.logoutAdmin();
      window.ToastComponent.show('Anda telah berhasil keluar dari akun admin.', 'info');
      this.state.currentUser = null;
      this.renderLoginPage();
    }
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
