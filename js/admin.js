/**
 * STUDYVAULT - Admin Portal Logic
 * Manages Adding, Deleting, Supabase Connection & Configuration
 */

class AdminApp {
  constructor() {
    this.directDeleteActive = false;
    this.init();
  }

  init() {
    // Populate SQL preview
    const sqlPreview = document.getElementById("sql-script-preview");
    if (sqlPreview && window.storeService) {
      sqlPreview.textContent = window.storeService.getSqlScript();
    }

    // Pre-fill Supabase inputs if stored
    const savedUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL);
    const savedKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY);

    const urlInput = document.getElementById("sb-url-input");
    const keyInput = document.getElementById("sb-key-input");
    if (urlInput && savedUrl) urlInput.value = savedUrl;
    if (keyInput && savedKey) keyInput.value = savedKey;
  }

  openAdminModal(initialTab = "items") {
    const modal = document.getElementById("admin-modal");
    if (!modal) return;

    this.switchTab(initialTab);
    this.renderStats();
    this.renderTable();

    modal.classList.add("active");
  }

  closeAdminModal() {
    const modal = document.getElementById("admin-modal");
    if (modal) modal.classList.remove("active");
  }

  switchTab(tabName, clickedBtn) {
    // Toggle Tab Buttons
    document.querySelectorAll(".admin-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });

    // Toggle Tab Contents
    const tabs = ["items", "add", "supabase"];
    tabs.forEach(t => {
      const el = document.getElementById(`admin-tab-${t}`);
      if (el) el.style.display = (t === tabName) ? "block" : "none";
    });

    if (tabName === "items") {
      this.renderStats();
      this.renderTable();
    }
  }

  async renderStats() {
    const products = await window.storeService.getProducts();
    const totalEl = document.getElementById("stat-total-items");
    const avgPriceEl = document.getElementById("stat-avg-price");

    if (totalEl) totalEl.textContent = products.length;

    if (avgPriceEl && products.length > 0) {
      const avg = products.reduce((acc, p) => acc + Number(p.price || 0), 0) / products.length;
      avgPriceEl.textContent = `$${avg.toFixed(2)}`;
    }
  }

  async renderTable(searchTerm = "") {
    const tbody = document.getElementById("admin-items-table-body");
    if (!tbody) return;

    const products = await window.storeService.getProducts();
    const query = searchTerm.toLowerCase().trim();

    const filtered = products.filter(p => 
      p.title.toLowerCase().includes(query) ||
      (p.subject && p.subject.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">
            No items match your search.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => `
      <tr>
        <td>
          <img class="table-img" src="${item.image}" alt="" onerror="this.src='https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=100&q=80'">
        </td>
        <td>
          <strong>${item.title}</strong>
        </td>
        <td>
          <span style="background:var(--bg-card); padding:2px 8px; border-radius:var(--radius-sm); font-size:0.75rem; text-transform:uppercase;">
            ${item.category}
          </span>
        </td>
        <td>${item.subject || '-'}</td>
        <td style="font-weight:700; color:var(--accent-camel);">$${Number(item.price).toFixed(2)}</td>
        <td>
          ${item.badge ? `<span style="background:var(--bg-dark); color:#fff; font-size:0.68rem; font-weight:700; padding:2px 6px; border-radius:2px;">${item.badge}</span>` : '-'}
        </td>
        <td style="text-align:right;">
          <button class="btn-delete-row" onclick="adminApp.confirmDelete('${item.id}', '${item.title.replace(/'/g, "\\'")}')">
            Delete
          </button>
        </td>
      </tr>
    `).join("");
  }

  // ================= ADD PRODUCT =================
  async handleCreateProduct(e) {
    e.preventDefault();

    const title = document.getElementById("new-item-title").value.trim();
    const category = document.getElementById("new-item-category").value;
    const subject = document.getElementById("new-item-subject").value.trim();
    const price = parseFloat(document.getElementById("new-item-price").value);
    const originalPrice = parseFloat(document.getElementById("new-item-original-price").value) || price * 1.5;
    const badge = document.getElementById("new-item-badge").value.trim() || "NEW";
    const pages = document.getElementById("new-item-pages").value.trim() || "PDF Asset";
    const image = document.getElementById("new-item-image").value.trim();
    const fileUrl = document.getElementById("new-item-file").value.trim() || "sample-downloads/sample.pdf";
    const description = document.getElementById("new-item-desc").value.trim();
    const highlightsRaw = document.getElementById("new-item-highlights").value.trim();

    const highlights = highlightsRaw ? highlightsRaw.split(",").map(s => s.trim()).filter(Boolean) : [
      "Instant PDF Download",
      "Lifetime Updates",
      "Verified Solution Keys"
    ];

    const newProduct = {
      title,
      category,
      subject,
      price,
      originalPrice,
      badge,
      pages,
      image,
      fileUrl,
      description,
      highlights,
      isFeatured: true
    };

    try {
      await window.storeService.addProduct(newProduct);
      window.storeApp.showToast(`Published "${title}" successfully!`, "success");

      // Reset form
      e.target.reset();

      // Refresh storefront & admin views
      await window.storeApp.refreshProducts();
      this.switchTab("items");
    } catch (err) {
      console.error(err);
      window.storeApp.showToast("Failed to create product: " + err.message, "error");
    }
  }

  setImagePreset(type) {
    const input = document.getElementById("new-item-image");
    if (!input) return;

    const presets = {
      dsa: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=700&q=80",
      design: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=700&q=80",
      pyq: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=700&q=80",
      mindmap: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=700&q=80"
    };

    if (presets[type]) {
      input.value = presets[type];
      window.storeApp.showToast(`Applied ${type.toUpperCase()} image preset`, "info");
    }
  }

  // ================= DELETE PRODUCT =================
  async confirmDelete(id, title) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await this.deleteItem(id);
    }
  }

  async quickDelete(id) {
    if (confirm(`Delete this item from the store?`)) {
      await this.deleteItem(id);
    }
  }

  async deleteItem(id) {
    try {
      await window.storeService.deleteProduct(id);
      window.storeApp.showToast("Item deleted successfully", "success");
      await window.storeApp.refreshProducts();
      this.renderStats();
      this.renderTable();
    } catch (err) {
      console.error(err);
      window.storeApp.showToast("Error deleting item: " + err.message, "error");
    }
  }

  toggleDirectDeleteMode() {
    this.directDeleteActive = !this.directDeleteActive;
    document.body.classList.toggle("admin-mode-active", this.directDeleteActive);
    
    const btn = document.getElementById("btn-toggle-delete-overlay");
    if (btn) {
      btn.textContent = this.directDeleteActive ? "✅ Direct Delete Active on Storefront" : "🗑️ Enable Direct Delete on Grid";
      btn.style.backgroundColor = this.directDeleteActive ? "#B91C1C" : "";
      btn.style.color = this.directDeleteActive ? "#fff" : "";
    }

    window.storeApp.showToast(
      this.directDeleteActive ? "Direct Delete Enabled! Red (✕) buttons now appear on product cards." : "Direct Delete Disabled",
      "info"
    );
  }

  // ================= SUPABASE INTEGRATION =================
  async handleSupabaseConnect(e) {
    e.preventDefault();
    const url = document.getElementById("sb-url-input").value.trim();
    const key = document.getElementById("sb-key-input").value.trim();

    if (!url || !key) {
      window.storeApp.showToast("Please enter both URL and Key", "error");
      return;
    }

    const btn = document.getElementById("btn-save-supabase");
    if (btn) btn.textContent = "Connecting...";

    try {
      const res = await window.storeService.connectSupabase(url, key);
      window.storeApp.showToast("Successfully connected to Supabase!", "success");
      
      window.storeApp.updateBackendStatusIndicators();
      await window.storeApp.refreshProducts();
      this.renderStats();
      this.renderTable();
    } catch (err) {
      console.error(err);
      window.storeApp.showToast("Supabase Connection Error: " + err.message, "error");
    } finally {
      if (btn) btn.textContent = "SAVE & CONNECT SUPABASE";
    }
  }

  async syncToSupabase() {
    const btn = document.getElementById("btn-sync-supabase");
    if (btn) btn.textContent = "Syncing...";

    try {
      const count = await window.storeService.syncLocalToSupabase();
      window.storeApp.showToast(`Synced ${count} items to Supabase products table!`, "success");
    } catch (err) {
      console.error(err);
      window.storeApp.showToast("Sync Error: " + err.message, "error");
    } finally {
      if (btn) btn.textContent = "SYNC LOCAL ITEMS TO SUPABASE";
    }
  }

  disconnectSupabase() {
    if (confirm("Disconnect from Supabase and switch back to Local Storage?")) {
      window.storeService.disconnectSupabase();
      window.storeApp.updateBackendStatusIndicators();
      window.storeApp.showToast("Switched back to Local Storage", "info");
      window.storeApp.refreshProducts();
      this.renderStats();
      this.renderTable();
    }
  }

  copySqlScript() {
    const sql = window.storeService.getSqlScript();
    navigator.clipboard.writeText(sql).then(() => {
      window.storeApp.showToast("SQL Schema script copied to clipboard!", "success");
    }).catch(err => {
      console.error(err);
      window.storeApp.showToast("Failed to copy. Please copy manually from the box below.", "error");
    });
  }

  resetDataPrompt() {
    if (confirm("Reset catalog back to initial 12 default study materials & roadmaps?")) {
      window.storeService.resetToDefaultData();
      window.storeApp.refreshProducts();
      this.renderStats();
      this.renderTable();
      window.storeApp.showToast("Reset to default catalog items!", "info");
    }
  }
}

window.adminApp = new AdminApp();
