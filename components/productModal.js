/**
 * PRODUK_LOKAL BY KOPIA - COMPONENTS / PRODUCT MODAL FORM
 * UI Reusable untuk Tambah Produk & Edit Produk (CRUD)
 */

window.ProductModalComponent = {
  // Preset gambar berkualitas tinggi jika admin ingin memilih cepat
  IMAGE_PRESETS: [
    { label: 'Kopi Arabika', url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80' },
    { label: 'Kemeja Linen', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80' },
    { label: 'Serum Alami', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80' },
    { label: 'Tas Tenun Ikat', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80' },
    { label: 'Sambal Kuliner', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80' },
    { label: 'Kerajinan Kayu', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=700&q=80' }
  ],

  render() {
    let modal = document.getElementById('productCrudModal');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'productCrudModal';
    modal.className = 'admin-modal-backdrop';
    modal.innerHTML = `
      <div class="admin-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="productModalTitle">
        <div class="admin-modal-header">
          <div class="modal-header-info">
            <span class="material-symbols-outlined modal-header-icon" id="productModalIcon">add_box</span>
            <div>
              <h3 class="modal-title" id="productModalTitle">Tambah Produk Baru</h3>
              <p class="modal-subtitle" id="productModalSubtitle">Lengkapi detail produk untuk ditampilkan langsung di etalase pembeli</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" id="productModalCloseBtn" aria-label="Tutup Dialog">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form id="productCrudForm" class="product-form-body">
          <input type="hidden" id="formProductId" value="">

          <div class="form-grid">
            <!-- 1. Judul / Nama Produk -->
            <div class="form-group full-width">
              <label for="formTitle" class="form-label required">Nama / Judul Produk</label>
              <input type="text" id="formTitle" class="form-input" placeholder="Contoh: Kopi Robusta Temanggung Organik 250g" required>
            </div>

            <!-- 2. Kategori -->
            <div class="form-group">
              <label for="formCategory" class="form-label required">Kategori</label>
              <select id="formCategory" class="form-select" required>
                <option value="kopi">☕ Kopi & Minuman Nusantara</option>
                <option value="fashion">👕 Fashion & Tekstil Lokal</option>
                <option value="beauty">✨ Kecantikan & Perawatan Alami</option>
                <option value="kriya">🧵 Kriya & Kerajinan Tangan</option>
                <option value="kuliner">🍲 Kuliner & Makanan Khas</option>
                <option value="gadget">📱 Kreatif & Aksesori Gadget</option>
              </select>
            </div>

            <!-- 3. Stok Tersedia -->
            <div class="form-group">
              <label for="formStock" class="form-label required">Jumlah Stok (Pcs)</label>
              <input type="number" id="formStock" class="form-input" min="0" placeholder="10" required>
            </div>

            <!-- 4. Harga Normal & Promo -->
            <div class="form-group">
              <label for="formOriginalPrice" class="form-label required">Harga Normal (Coret)</label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">Rp</span>
                <input type="number" id="formOriginalPrice" class="form-input" placeholder="150000" min="0" required>
              </div>
            </div>

            <div class="form-group">
              <label for="formPromoPrice" class="form-label required">Harga Promo (Kopia)</label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">Rp</span>
                <input type="number" id="formPromoPrice" class="form-input" placeholder="89000" min="0" required>
              </div>
              <div class="price-discount-preview" id="formDiscountPreview">Diskon: 0%</div>
            </div>

            <!-- 5. Nama Penjual & Lokasi -->
            <div class="form-group">
              <label for="formSeller" class="form-label required">Nama Toko / UMKM Penjual</label>
              <input type="text" id="formSeller" class="form-input" placeholder="Contoh: Sangrai Nusantara" required>
            </div>

            <div class="form-group">
              <label for="formLocation" class="form-label required">Kota / Asal Pengiriman</label>
              <input type="text" id="formLocation" class="form-input" placeholder="Contoh: Temanggung, Jawa Tengah" required>
            </div>

            <!-- 6. Nomor WhatsApp Penjual -->
            <div class="form-group">
              <label for="formPhone" class="form-label required">Nomor WhatsApp Admin Toko</label>
              <input type="text" id="formPhone" class="form-input" placeholder="6285771624349" required>
              <small class="form-hint">Format diawali kode negara 62 (contoh: 6285771624349)</small>
            </div>

            <!-- 7. Varian Produk -->
            <div class="form-group">
              <label for="formVariants" class="form-label">Pilihan Varian (Pisahkan Koma)</label>
              <input type="text" id="formVariants" class="form-input" placeholder="Biji Utuh, Bubuk Kasar, Bubuk Halus">
              <small class="form-hint">Contoh: Ukuran S, Ukuran M, Ukuran L</small>
            </div>

            <!-- 8. URL Gambar & Pratinjau -->
            <div class="form-group full-width">
              <label for="formImg" class="form-label required">Link Foto Produk (URL Image)</label>
              <div class="image-input-row">
                <input type="url" id="formImg" class="form-input" placeholder="https://images.unsplash.com/photo-..." required>
                <div class="image-preview-box" id="formImgPreviewBox">
                  <img id="formImgPreview" src="" alt="Pratinjau Foto" style="display:none;">
                  <span class="material-symbols-outlined" id="formImgPlaceholder">image</span>
                </div>
              </div>

              <!-- Pilihan Cepat Preset Gambar -->
              <div class="preset-images-group">
                <span class="preset-label">Gunakan contoh foto siap pakai:</span>
                <div class="preset-chips">
                  ${this.IMAGE_PRESETS.map(p => `
                    <button type="button" class="preset-chip-btn" data-url="${p.url}">
                      ${p.label}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- 9. Deskripsi Produk -->
            <div class="form-group full-width">
              <label for="formDescription" class="form-label">Deskripsi Lengkap Produk</label>
              <textarea id="formDescription" class="form-textarea" rows="3" placeholder="Ceritakan keunggulan bahan, cara pembuatan, atau proses produk UMKM ini..."></textarea>
            </div>

            <!-- 10. Tag / Badge Keunggulan -->
            <div class="form-group full-width">
              <label class="form-label">Keunggulan & Metode Pengiriman</label>
              <div class="checkbox-options-grid">
                <label class="checkbox-item">
                  <input type="checkbox" id="formUspCod" checked>
                  <span>Bisa Bayar di Tempat (COD)</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" id="formUspFreeShip" checked>
                  <span>Gratis Ongkir Promo</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" id="formUspVerified" checked>
                  <span>Kurasi Kopia Terverifikasi</span>
                </label>
              </div>
            </div>
          </div>

          <div class="admin-modal-footer">
            <button type="button" class="btn-secondary" id="productModalCancelBtn">Batal</button>
            <button type="submit" class="btn-primary" id="productModalSaveBtn">
              <span class="material-symbols-outlined">save</span>
              <span id="saveBtnText">Simpan Produk</span>
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.bindEvents(modal);
  },

  bindEvents(modal) {
    const closeBtn = modal.querySelector('#productModalCloseBtn');
    const cancelBtn = modal.querySelector('#productModalCancelBtn');
    const form = modal.querySelector('#productCrudForm');
    const originalInput = modal.querySelector('#formOriginalPrice');
    const promoInput = modal.querySelector('#formPromoPrice');
    const imgInput = modal.querySelector('#formImg');
    const imgPreview = modal.querySelector('#formImgPreview');
    const imgPlaceholder = modal.querySelector('#formImgPlaceholder');

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Hitung diskon otomatis saat harga diisi
    const updateDiscount = () => {
      const orig = Number(originalInput.value) || 0;
      const promo = Number(promoInput.value) || 0;
      const preview = modal.querySelector('#formDiscountPreview');
      if (orig > promo && orig > 0) {
        const disc = Math.round(((orig - promo) / orig) * 100);
        preview.textContent = `Hemat: Rp ${(orig - promo).toLocaleString('id-ID')} (Diskon ${disc}%)`;
        preview.className = 'price-discount-preview active';
      } else {
        preview.textContent = 'Tidak ada potongan diskon';
        preview.className = 'price-discount-preview';
      }
    };

    originalInput.addEventListener('input', updateDiscount);
    promoInput.addEventListener('input', updateDiscount);

    // Update pratinjau gambar
    const updateImage = (url) => {
      if (url && url.trim().length > 5) {
        imgPreview.src = url;
        imgPreview.style.display = 'block';
        imgPlaceholder.style.display = 'none';
      } else {
        imgPreview.src = '';
        imgPreview.style.display = 'none';
        imgPlaceholder.style.display = 'block';
      }
    };

    imgInput.addEventListener('input', () => updateImage(imgInput.value));

    // Preset chip clicks
    modal.querySelectorAll('.preset-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        imgInput.value = url;
        updateImage(url);
      });
    });

    // Handle form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = modal.querySelector('#productModalSaveBtn');
      const saveText = modal.querySelector('#saveBtnText');
      
      saveBtn.disabled = true;
      saveText.textContent = 'Menyimpan...';

      const id = modal.querySelector('#formProductId').value.trim();
      const title = modal.querySelector('#formTitle').value.trim();
      const category = modal.querySelector('#formCategory').value;
      const originalPrice = Number(modal.querySelector('#formOriginalPrice').value) || 0;
      const promoPrice = Number(modal.querySelector('#formPromoPrice').value) || originalPrice;
      const stockLeft = Number(modal.querySelector('#formStock').value) || 0;
      const seller = modal.querySelector('#formSeller').value.trim();
      const location = modal.querySelector('#formLocation').value.trim();
      const phone = modal.querySelector('#formPhone').value.trim() || '6285771624349';
      const img = modal.querySelector('#formImg').value.trim() || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80';
      const description = modal.querySelector('#formDescription').value.trim();
      
      const rawVariants = modal.querySelector('#formVariants').value.trim();
      const variants = rawVariants 
        ? rawVariants.split(',').map(v => v.trim()).filter(Boolean)
        : ['Standar'];

      const usp = [];
      if (modal.querySelector('#formUspCod').checked) usp.push('Bisa COD');
      if (modal.querySelector('#formUspFreeShip').checked) usp.push('Gratis Ongkir');
      if (modal.querySelector('#formUspVerified').checked) usp.push('Kurasi Kopia');

      const categoryLabels = {
        kopi: 'Kopi Nusantara',
        fashion: 'Fashion Lokal',
        beauty: 'Kecantikan Alami',
        kriya: 'Kriya & Kerajinan',
        kuliner: 'Kuliner Nusantara',
        gadget: 'Kreatif & Gadget'
      };

      const payload = {
        title,
        category,
        categoryLabel: categoryLabels[category] || 'Produk Lokal',
        originalPrice,
        promoPrice,
        stockLeft,
        seller,
        location,
        phone,
        img,
        description,
        variants,
        usp,
        rating: 5.0,
        reviews: 24
      };

      try {
        if (id) {
          // Update
          await window.FirebaseService.updateProduct(id, payload);
          window.ToastComponent.show(`Produk "${title}" berhasil diperbarui!`, 'success');
        } else {
          // Create
          await window.FirebaseService.createProduct(payload);
          window.ToastComponent.show(`Produk baru "${title}" berhasil ditambahkan ke etalase!`, 'success');
        }
        closeModal();
      } catch (err) {
        console.error('Error saving product:', err);
        window.ToastComponent.show('Gagal menyimpan produk: ' + err.message, 'error');
      } finally {
        saveBtn.disabled = false;
        saveText.textContent = 'Simpan Produk';
      }
    });
  },

  openForCreate() {
    this.render();
    const modal = document.getElementById('productCrudModal');
    const form = modal.querySelector('#productCrudForm');
    form.reset();

    modal.querySelector('#productModalTitle').textContent = 'Tambah Produk Baru';
    modal.querySelector('#productModalSubtitle').textContent = 'Lengkapi detail produk untuk ditampilkan langsung di etalase pembeli';
    modal.querySelector('#productModalIcon').textContent = 'add_box';
    modal.querySelector('#formProductId').value = '';
    modal.querySelector('#saveBtnText').textContent = 'Simpan Produk Baru';

    // Default values
    modal.querySelector('#formStock').value = '15';
    modal.querySelector('#formPhone').value = '6285771624349';
    modal.querySelector('#formImgPreview').style.display = 'none';
    modal.querySelector('#formImgPlaceholder').style.display = 'block';
    modal.querySelector('#formDiscountPreview').className = 'price-discount-preview';
    modal.querySelector('#formDiscountPreview').textContent = 'Diskon: 0%';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  openForEdit(product) {
    this.render();
    const modal = document.getElementById('productCrudModal');
    const form = modal.querySelector('#productCrudForm');
    form.reset();

    modal.querySelector('#productModalTitle').textContent = 'Edit Data Produk';
    modal.querySelector('#productModalSubtitle').textContent = `Mengubah data "${product.title}"`;
    modal.querySelector('#productModalIcon').textContent = 'edit_note';
    modal.querySelector('#formProductId').value = product.id;
    modal.querySelector('#saveBtnText').textContent = 'Simpan Perubahan';

    modal.querySelector('#formTitle').value = product.title || '';
    modal.querySelector('#formCategory').value = product.category || 'kopi';
    modal.querySelector('#formStock').value = product.stockLeft ?? 10;
    modal.querySelector('#formOriginalPrice').value = product.originalPrice || '';
    modal.querySelector('#formPromoPrice').value = product.promoPrice || '';
    modal.querySelector('#formSeller').value = product.seller || '';
    modal.querySelector('#formLocation').value = product.location || '';
    modal.querySelector('#formPhone').value = product.phone || '6285771624349';
    modal.querySelector('#formVariants').value = Array.isArray(product.variants) ? product.variants.join(', ') : (product.variants || '');
    modal.querySelector('#formDescription').value = product.description || '';

    const imgInput = modal.querySelector('#formImg');
    const imgPreview = modal.querySelector('#formImgPreview');
    const imgPlaceholder = modal.querySelector('#formImgPlaceholder');

    imgInput.value = product.img || '';
    if (product.img) {
      imgPreview.src = product.img;
      imgPreview.style.display = 'block';
      imgPlaceholder.style.display = 'none';
    } else {
      imgPreview.style.display = 'none';
      imgPlaceholder.style.display = 'block';
    }

    // Trigger hitung diskon
    const orig = Number(product.originalPrice) || 0;
    const promo = Number(product.promoPrice) || 0;
    const preview = modal.querySelector('#formDiscountPreview');
    if (orig > promo && orig > 0) {
      const disc = Math.round(((orig - promo) / orig) * 100);
      preview.textContent = `Hemat: Rp ${(orig - promo).toLocaleString('id-ID')} (Diskon ${disc}%)`;
      preview.className = 'price-discount-preview active';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};
