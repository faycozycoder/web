/**
 * PRODUK_LOKAL BY KOPIA - PAGES / LOGIN PAGE
 * Komponen Halaman Login & Registrasi Admin Firebase
 */

window.LoginPage = {
  activeTab: 'login', // 'login' | 'register'

  render(targetSelector, onLoginSuccess) {
    const container = document.querySelector(targetSelector);
    if (!container) return;

    container.innerHTML = `
      <div class="login-wrapper">
        <div class="login-container">
          <!-- Header Card -->
          <div class="login-header">
            <div class="login-logo-badge">
              <span class="material-symbols-outlined">storefront</span>
            </div>
            <h1 class="login-brand-title">Produk_lokal <span class="brand-tag">by kopia</span></h1>
            <p class="login-brand-sub">Portal Akses Khusus Administrator UMKM</p>
          </div>

          <!-- Tab Switcher -->
          <div class="login-tabs">
            <button type="button" class="login-tab-btn ${this.activeTab === 'login' ? 'active' : ''}" id="tabLoginBtn">
              <span class="material-symbols-outlined" style="font-size:18px;">lock</span>
              <span>Masuk Admin</span>
            </button>
            <button type="button" class="login-tab-btn ${this.activeTab === 'register' ? 'active' : ''}" id="tabRegisterBtn">
              <span class="material-symbols-outlined" style="font-size:18px;">person_add</span>
              <span>Daftar Baru</span>
            </button>
          </div>

          <!-- Alert / Error Box -->
          <div class="login-alert" id="loginAlertBox" style="display:none;">
            <span class="material-symbols-outlined alert-icon" id="loginAlertIcon">error</span>
            <span class="alert-text" id="loginAlertText"></span>
          </div>

          <!-- Form Login / Register -->
          <form id="adminAuthForm" class="login-form">
            <div class="form-group">
              <label for="authEmail" class="form-label">Alamat Email Admin</label>
              <div class="input-icon-wrap">
                <span class="material-symbols-outlined input-icon">mail</span>
                <input type="email" id="authEmail" class="form-input with-icon" placeholder="admin@umkm.id" required autocomplete="email">
              </div>
            </div>

            <div class="form-group">
              <label for="authPassword" class="form-label">Kata Sandi</label>
              <div class="input-icon-wrap">
                <span class="material-symbols-outlined input-icon">key</span>
                <input type="password" id="authPassword" class="form-input with-icon" placeholder="Minimal 6 karakter" required autocomplete="current-password">
                <button type="button" class="password-toggle-btn" id="togglePasswordBtn" aria-label="Lihat kata sandi">
                  <span class="material-symbols-outlined" id="togglePasswordIcon">visibility</span>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-primary btn-block btn-lg" id="authSubmitBtn">
              <span class="material-symbols-outlined" id="authBtnIcon">login</span>
              <span id="authBtnText">Masuk ke Dashboard</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="login-divider">
            <span>atau pilih metode instan</span>
          </div>

          <!-- Pilihan Login Alternatif -->
          <div class="alt-auth-group">
            <!-- Google Sign In -->
            <button type="button" class="btn-social-auth" id="googleAuthBtn">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Masuk dengan Google</span>
            </button>
          </div>

          <!-- Footer Tautan -->
          <div class="login-footer">
            <a href="index.html" class="back-to-store-link">
              <span class="material-symbols-outlined" style="font-size:16px;">arrow_back</span>
              <span>Kembali ke Halaman Toko Pembeli</span>
            </a>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container, onLoginSuccess);
  },

  bindEvents(container, onLoginSuccess) {
    const tabLogin = container.querySelector('#tabLoginBtn');
    const tabRegister = container.querySelector('#tabRegisterBtn');
    const authForm = container.querySelector('#adminAuthForm');
    const submitBtn = container.querySelector('#authSubmitBtn');
    const submitText = container.querySelector('#authBtnText');
    const submitIcon = container.querySelector('#authBtnIcon');
    const emailInput = container.querySelector('#authEmail');
    const passwordInput = container.querySelector('#authPassword');
    const togglePassBtn = container.querySelector('#togglePasswordBtn');
    const togglePassIcon = container.querySelector('#togglePasswordIcon');
    const googleBtn = container.querySelector('#googleAuthBtn');
    const alertBox = container.querySelector('#loginAlertBox');
    const alertText = container.querySelector('#loginAlertText');

    const showAlert = (msg, isError = true) => {
      alertBox.className = `login-alert ${isError ? 'alert-error' : 'alert-success'}`;
      alertBox.querySelector('#loginAlertIcon').textContent = isError ? 'error' : 'check_circle';
      alertText.textContent = msg;
      alertBox.style.display = 'flex';
    };

    const hideAlert = () => {
      alertBox.style.display = 'none';
    };

    // Tab Switcher
    tabLogin.addEventListener('click', () => {
      this.activeTab = 'login';
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      submitText.textContent = 'Masuk ke Dashboard';
      submitIcon.textContent = 'login';
      hideAlert();
    });

    tabRegister.addEventListener('click', () => {
      this.activeTab = 'register';
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      submitText.textContent = 'Buat Akun & Masuk';
      submitIcon.textContent = 'person_add';
      hideAlert();
    });

    // Password Toggle
    togglePassBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassIcon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });

    // Form Submit
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showAlert('Silakan isi email dan kata sandi.');
        return;
      }

      submitBtn.disabled = true;
      submitText.textContent = 'Memproses...';

      let result;
      if (this.activeTab === 'register') {
        result = await window.FirebaseService.registerWithEmail(email, password);
      } else {
        result = await window.FirebaseService.loginWithEmail(email, password);
      }

      submitBtn.disabled = false;
      submitText.textContent = this.activeTab === 'register' ? 'Buat Akun & Masuk' : 'Masuk ke Dashboard';

      if (result.success) {
        window.ToastComponent.show(`Selamat datang, ${result.user.displayName || email}!`, 'success');
        if (onLoginSuccess) onLoginSuccess(result.user);
      } else {
        showAlert(result.error);
      }
    });

    // Google Sign-In
    googleBtn.addEventListener('click', async () => {
      hideAlert();
      googleBtn.disabled = true;
      const res = await window.FirebaseService.loginWithGoogle();
      googleBtn.disabled = false;

      if (res.success) {
        window.ToastComponent.show(`Berhasil login dengan Google: ${res.user.displayName || res.user.email}`, 'success');
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else {
        showAlert(res.error);
      }
    });
  }
};
