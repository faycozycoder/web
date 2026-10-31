/**
 * PRODUK_LOKAL BY KOPIA - COMPONENTS / DELETE CONFIRM MODAL
 * UI Reusable untuk Konfirmasi Hapus Produk
 */

window.DeleteConfirmModalComponent = {
  activeProductId: null,
  activeProductTitle: null,

  render() {
    let modal = document.getElementById('deleteConfirmModal');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'deleteConfirmModal';
    modal.className = 'admin-modal-backdrop';
    modal.innerHTML = `
      <div class="admin-modal-dialog modal-dialog-sm" role="dialog" aria-modal="true" aria-labelledby="deleteModalTitle">
        <div class="delete-modal-content">
          <div class="delete-modal-icon-wrap">
            <span class="material-symbols-outlined">delete_forever</span>
          </div>

          <h3 class="delete-modal-title" id="deleteModalTitle">Hapus Produk Ini?</h3>
          <p class="delete-modal-desc">
            Apakah Anda yakin ingin menghapus produk <strong id="deleteModalProductName">"..."</strong> dari etalase? 
            Produk ini tidak akan lagi tampil untuk pembeli.
          </p>

          <div class="delete-modal-actions">
            <button type="button" class="btn-secondary" id="cancelDeleteBtn">Batal</button>
            <button type="button" class="btn-danger" id="confirmDeleteBtn">
              <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
              <span id="confirmDeleteBtnText">Ya, Hapus Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cancelBtn = modal.querySelector('#cancelDeleteBtn');
    const confirmBtn = modal.querySelector('#confirmDeleteBtn');

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      this.activeProductId = null;
      this.activeProductTitle = null;
    };

    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    confirmBtn.addEventListener('click', async () => {
      if (!this.activeProductId) return;
      const btnText = modal.querySelector('#confirmDeleteBtnText');
      confirmBtn.disabled = true;
      btnText.textContent = 'Menghapus...';

      try {
        await window.FirebaseService.deleteProduct(this.activeProductId);
        window.ToastComponent.show(`Produk "${this.activeProductTitle || ''}" berhasil dihapus.`, 'success');
        closeModal();
      } catch (err) {
        console.error('Error deleting product:', err);
        window.ToastComponent.show('Gagal menghapus produk: ' + err.message, 'error');
      } finally {
        confirmBtn.disabled = false;
        btnText.textContent = 'Ya, Hapus Sekarang';
      }
    });
  },

  open(productId, productTitle) {
    this.render();
    this.activeProductId = productId;
    this.activeProductTitle = productTitle;

    const modal = document.getElementById('deleteConfirmModal');
    const nameEl = modal.querySelector('#deleteModalProductName');
    if (nameEl) nameEl.textContent = `"${productTitle}"`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};
