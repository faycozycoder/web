/**
 * PRODUK_LOKAL BY KOPIA - PAGES / LEADS & WHATSAPP LOG PAGE
 * Komponen Halaman Riwayat & Log Klik WhatsApp Pembeli
 */

window.LeadsPage = {
  render(targetSelector, { leads, stats, onNavigate }) {
    const container = document.querySelector(targetSelector);
    if (!container) return;

    const safeLeads = leads || [];
    const totalWaClicks = stats && stats.waClicks ? stats.waClicks : safeLeads.length;

    container.innerHTML = `
      <div class="page-content">
        <!-- 1. Header Halaman Leads -->
        <div class="page-header-row">
          <div class="page-title-block">
            <h2 class="page-main-title">
              <span class="material-symbols-outlined page-title-icon" style="color:#059669;">chat</span>
              Log Klik WhatsApp & Prospek Pembeli
            </h2>
            <p class="page-subtitle">Rekam jejak pembeli yang menekan tombol chat WhatsApp atau checkout langsung ke penjual UMKM</p>
          </div>
          <div class="page-actions-block">
            <div class="stat-pill-highlight">
              <span class="material-symbols-outlined" style="font-size:18px; color:#059669;">mark_chat_read</span>
              <span>Total Klik WhatsApp: <strong>${totalWaClicks.toLocaleString('id-ID')}</strong></span>
            </div>
          </div>
        </div>

        <!-- 2. Informasi Sistem Direct Commerce -->
        <div class="admin-notice-banner info">
          <span class="material-symbols-outlined notice-icon">verified_user</span>
          <div class="notice-text">
            <strong>Direct Commerce Transparan:</strong> Setiap klik tombol WhatsApp pada etalase landing page langsung diarahkan ke nomor produsen/penjual resmi tanpa penahanan saldo atau markup biaya admin.
          </div>
        </div>

        <!-- 3. Tabel Log Leads -->
        <div class="table-card">
          <div class="table-meta-bar">
            <span>Daftar Interaksi Terbaru (${safeLeads.length} rekaman)</span>
            <button type="button" class="btn-text-reset" id="refreshLeadsBtn">
              <span class="material-symbols-outlined" style="font-size:15px;">sync</span>
              Segarkan Data
            </button>
          </div>

          ${safeLeads.length > 0 ? `
            <div class="table-responsive">
              <table class="crud-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">#</th>
                    <th>Waktu / Jam</th>
                    <th>Target Toko / UMKM</th>
                    <th>Produk yang Diminati</th>
                    <th>Sumber Event</th>
                    <th style="text-align: right;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${safeLeads.map((l, idx) => {
                    let formattedDate = 'Baru saja';
                    if (l.timestampStr) {
                      const d = new Date(l.timestampStr);
                      formattedDate = d.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    }

                    return `
                      <tr>
                        <td><span class="table-index-num">${idx + 1}</span></td>
                        <td>
                          <div class="table-time-text">
                            <span class="material-symbols-outlined" style="font-size:13px; color:#64748b;">schedule</span>
                            <span>${formattedDate}</span>
                          </div>
                        </td>
                        <td>
                          <strong style="color:var(--text-dark);">${l.seller || 'Admin Kopia'}</strong>
                        </td>
                        <td>
                          <div class="table-lead-product">
                            <span class="material-symbols-outlined" style="font-size:14px; color:var(--primary);">local_mall</span>
                            <span>${l.productId || l.productTitle || 'Katalog Promo Umum'}</span>
                          </div>
                        </td>
                        <td>
                          <span class="badge-source">${l.source || 'Modal Detail / WA Direct'}</span>
                        </td>
                        <td style="text-align: right;">
                          <span class="badge-status-lead">
                            <span class="status-dot-sm"></span>
                            Terkirim ke WhatsApp
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="table-empty-box">
              <span class="material-symbols-outlined empty-icon">forum</span>
              <h4 class="empty-title">Belum Ada Rekaman Klik WhatsApp</h4>
              <p class="empty-desc">Saat pengunjung mengklik tombol WhatsApp pada landing page, data interaksi akan muncul otomatis di sini.</p>
            </div>
          `}
        </div>
      </div>
    `;

    const refreshBtn = container.querySelector('#refreshLeadsBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        const freshLeads = await window.FirebaseService.fetchRecentLeads(20);
        this.render(targetSelector, { leads: freshLeads, stats, onNavigate });
        window.ToastComponent.show('Log WhatsApp berhasil disegarkan!', 'info');
      });
    }
  }
};
