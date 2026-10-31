/**
 * PRODUK_LOKAL BY KOPIA - COMPONENTS / TOAST NOTIFICATION
 * UI Reusable untuk notifikasi aksi (sukses, error, info)
 */

window.ToastComponent = {
  container: null,

  init() {
    if (!this.container) {
      let el = document.getElementById('adminToastContainer');
      if (!el) {
        el = document.createElement('div');
        el.id = 'adminToastContainer';
        el.className = 'admin-toast-container';
        document.body.appendChild(el);
      }
      this.container = el;
    }
  },

  show(message, type = 'success', duration = 3500) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `admin-toast admin-toast-${type}`;

    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    const iconName = icons[type] || 'info';

    toast.innerHTML = `
      <div class="toast-icon">
        <span class="material-symbols-outlined">${iconName}</span>
      </div>
      <div class="toast-message">${message}</div>
      <button type="button" class="toast-close-btn" aria-label="Tutup">
        <span class="material-symbols-outlined" style="font-size:16px;">close</span>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    const removeToast = () => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    closeBtn.addEventListener('click', removeToast);

    this.container.appendChild(toast);

    // Animasi masuk
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto dismiss
    setTimeout(removeToast, duration);
  }
};
