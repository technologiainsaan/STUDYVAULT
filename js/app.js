/**
 * STUDYVAULT - Full Interactive Platform
 * - User Accounts (Sign up, Login, Profile)
 * - UPI QR Payment (DIPANSHU kumar, 8579823872@fam, assets/upi_qr.jpg)
 * - Order Status Tracking (Pending / Dispatched to Gmail)
 * - Raise a Complaint / Support Ticket System
 * - Feedback & Star Reviews System
 */

class StoreApp {
  constructor() {
    this.products = REAL_PRODUCTS;
    this.filteredProducts = [...REAL_PRODUCTS];
    this.currentCategory = "all";
    this.cart = [];
    this.activeCheckoutItem = null;
    this.uploadedScreenshotData = null;
    
    // Exact UPI payment details from uploaded image
    this.upiName = "DIPANSHU kumar";
    this.upiId = "8579823872@fam";
    this.upiQrImage = "assets/upi_qr.jpg";

    this.currentUser = null;
    this.reviews = [];
    this.selectedStarRating = 5;
    this.pendingPurchaseAction = null; // Stores action if user clicked buy before signup

    this.init();
  }

  init() {
    this.loadUserSession();
    this.loadCart();
    this.loadReviews();
    this.applyFilter();
    this.setupScreenshotUpload();
    this.renderReviewsSection();
  }

  // ================= USER ACCOUNT SYSTEM =================
  loadUserSession() {
    try {
      const savedUser = localStorage.getItem("studyvault_current_user");
      this.currentUser = savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      this.currentUser = null;
    }
    this.updateAuthUI();
  }

  updateAuthUI() {
    const authContainer = document.getElementById("nav-auth-container");
    if (!authContainer) return;

    if (this.currentUser) {
      authContainer.innerHTML = `
        <div class="user-dropdown">
          <button class="user-account-btn" onclick="storeApp.toggleUserDropdown()">
            <span>👤 ${this.currentUser.name.split(" ")[0]}</span>
            <span style="font-size:0.65rem;">▼</span>
          </button>
          <div class="user-dropdown-menu" id="user-dropdown-menu">
            <div style="padding:10px 16px; background:var(--bg-card); font-size:0.75rem; border-bottom:1px solid var(--border-light);">
              <div style="font-weight:700;">${this.currentUser.name}</div>
              <div style="color:var(--text-secondary);">${this.currentUser.gmail}</div>
            </div>
            <div class="dropdown-item" onclick="storeApp.openMyPurchasesModal(); storeApp.toggleUserDropdown(false);">
              <span>📦</span> My Purchased Notes
            </div>
            <div class="dropdown-item" onclick="storeApp.openComplaintModal(); storeApp.toggleUserDropdown(false);">
              <span>⚠️</span> Raise a Complaint
            </div>
            <div class="dropdown-item" onclick="storeApp.openReviewModal(); storeApp.toggleUserDropdown(false);">
              <span>⭐</span> Give Feedback & Review
            </div>
            <div class="dropdown-item" onclick="storeApp.openChangePasswordModal(); storeApp.toggleUserDropdown(false);">
              <span>🔑</span> Change Password
            </div>
            <div class="dropdown-item" style="color:#B91C1C;" onclick="storeApp.logoutUser(); storeApp.toggleUserDropdown(false);">
              <span>🚪</span> Sign Out
            </div>
          </div>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <button class="user-account-btn" onclick="storeApp.openAuthModal('login')">
          <span>👤 LOG IN / SIGN UP</span>
        </button>
      `;
    }
  }

  toggleUserDropdown(forceState) {
    const menu = document.getElementById("user-dropdown-menu");
    if (!menu) return;
    if (typeof forceState === "boolean") {
      menu.classList.toggle("active", forceState);
    } else {
      menu.classList.toggle("active");
    }
  }

  // ================= SECURE AUTHENTICATION HELPERS =================
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "_studyvault_secure_salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  setAuthError(message) {
    const banner = document.getElementById("auth-error-banner");
    if (banner) {
      banner.textContent = message;
      banner.style.display = "block";
    }
  }

  clearAuthError() {
    const banner = document.getElementById("auth-error-banner");
    if (banner) {
      banner.textContent = "";
      banner.style.display = "none";
    }
  }

  openAuthModal(mode = "login") {
    const modal = document.getElementById("auth-modal");
    if (!modal) return;
    this.clearAuthError();
    this.switchAuthTab(mode);
    modal.classList.add("active");
  }

  closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.classList.remove("active");
    this.clearAuthError();
  }

  switchAuthTab(mode) {
    this.clearAuthError();
    const loginForm = document.getElementById("auth-login-form");
    const registerForm = document.getElementById("auth-register-form");
    const tabLogin = document.getElementById("tab-auth-login");
    const tabRegister = document.getElementById("tab-auth-register");

    if (mode === "login") {
      if (loginForm) loginForm.style.display = "block";
      if (registerForm) registerForm.style.display = "none";
      if (tabLogin) tabLogin.classList.add("active");
      if (tabRegister) tabRegister.classList.remove("active");
    } else {
      if (loginForm) loginForm.style.display = "none";
      if (registerForm) registerForm.style.display = "block";
      if (tabLogin) tabLogin.classList.remove("active");
      if (tabRegister) tabRegister.classList.add("active");
    }
  }

  // Strict Register with Full Validation & Cloud Sync
  async handleRegister(e) {
    e.preventDefault();
    this.clearAuthError();

    const nameInput = document.getElementById("reg-name");
    const gmailInput = document.getElementById("reg-gmail");
    const passwordInput = document.getElementById("reg-password");

    const name = (nameInput ? nameInput.value : "").trim();
    const gmail = (gmailInput ? gmailInput.value : "").trim().toLowerCase();
    const password = passwordInput ? passwordInput.value : "";

    // 1. Validate full name
    if (!name || name.length < 2) {
      this.setAuthError("Please enter your real full name (at least 2 letters).");
      this.showToast("Please enter a valid full name", "error");
      return;
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!gmail || !emailRegex.test(gmail)) {
      this.setAuthError("Please enter a valid email address (e.g. yourname@gmail.com).");
      this.showToast("Invalid email address format", "error");
      return;
    }

    // 3. Validate password strength
    if (!password || password.length < 6) {
      this.setAuthError("Password must be at least 6 characters long.");
      this.showToast("Password must be at least 6 characters", "error");
      return;
    }

    const submitBtn = document.getElementById("btn-signup-submit");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "CREATING ACCOUNT...";
    }

    try {
      // 4. Check if account already exists in Supabase or local storage
      let existingUser = null;

      // Check Supabase
      if (window.supabaseService && window.supabaseService.isConnected) {
        existingUser = await window.supabaseService.findUserByGmail(gmail);
      }

      // Check LocalStorage cache
      if (!existingUser) {
        const localUsers = JSON.parse(localStorage.getItem("studyvault_registered_users") || "[]");
        existingUser = localUsers.find(u => u.gmail.toLowerCase() === gmail);
      }

      if (existingUser) {
        this.setAuthError("An account with this email already exists. Please switch to LOG IN.");
        this.showToast("Email already registered! Please Log In.", "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "CREATE ACCOUNT & SIGN UP";
        }
        return;
      }

      // 5. Generate secure SHA-256 password hash
      const passwordHash = await this.hashPassword(password);
      const newUser = {
        id: "user-" + Date.now(),
        name,
        gmail,
        passwordHash,
        joinedAt: new Date().toLocaleDateString()
      };

      // 6. Save to Supabase Cloud
      if (window.supabaseService && window.supabaseService.isConnected) {
        await window.supabaseService.saveUser(newUser);
      }

      // 7. Save to local registered users cache
      const localUsers = JSON.parse(localStorage.getItem("studyvault_registered_users") || "[]");
      localUsers.push(newUser);
      localStorage.setItem("studyvault_registered_users", JSON.stringify(localUsers));

      // 8. Establish Authenticated Session
      this.currentUser = newUser;
      localStorage.setItem("studyvault_current_user", JSON.stringify(newUser));

      this.closeAuthModal();
      this.updateAuthUI();
      this.showToast(`Account created successfully! Welcome, ${name}.`, "success");

      // Resume pending purchase if user clicked buy before signing up
      if (this.pendingPurchaseAction) {
        const pending = this.pendingPurchaseAction;
        this.pendingPurchaseAction = null;
        setTimeout(() => {
          if (pending.type === "buyNow") {
            this.buyNowDirect(pending.productId);
          } else if (pending.type === "cart") {
            this.proceedFromCart();
          }
        }, 300);
      }
    } catch (err) {
      console.error("Registration error:", err);
      this.setAuthError("Registration failed: " + (err.message || "Please check your network."));
      this.showToast("Failed to create account", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "CREATE ACCOUNT & SIGN UP";
      }
    }
  }

  // Strict Login with Zero Bypass
  async handleLogin(e) {
    e.preventDefault();
    this.clearAuthError();

    const gmailInput = document.getElementById("login-gmail");
    const passwordInput = document.getElementById("login-password");

    const gmail = (gmailInput ? gmailInput.value : "").trim().toLowerCase();
    const password = passwordInput ? passwordInput.value : "";

    if (!gmail || !password) {
      this.setAuthError("Please enter both your email address and password.");
      this.showToast("Please enter email and password", "error");
      return;
    }

    const submitBtn = document.getElementById("btn-login-submit");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "VERIFYING CREDENTIALS...";
    }

    try {
      const passwordHash = await this.hashPassword(password);
      let foundUser = null;

      // 1. Check in Supabase Cloud Database first
      if (window.supabaseService && window.supabaseService.isConnected) {
        const sbUser = await window.supabaseService.findUserByGmail(gmail);
        if (sbUser) {
          foundUser = {
            id: sbUser.id,
            name: sbUser.name,
            gmail: sbUser.gmail,
            passwordHash: sbUser.password_hash || ""
          };
        }
      }

      // 2. Fallback to LocalStorage registered users cache
      if (!foundUser) {
        const localUsers = JSON.parse(localStorage.getItem("studyvault_registered_users") || "[]");
        foundUser = localUsers.find(u => u.gmail.toLowerCase() === gmail);
      }

      // STRICT CHECK 1: User does NOT exist
      if (!foundUser) {
        this.setAuthError("No account found with this email. Please click 'SIGN UP' to create an account first.");
        this.showToast("No account found. Please Sign Up first.", "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "LOG IN TO MY ACCOUNT";
        }
        return; // HALT COMPLETELY! NO LOGGING IN!
      }

      // STRICT CHECK 2: Password Hash does NOT match
      if (foundUser.passwordHash && foundUser.passwordHash !== passwordHash) {
        this.setAuthError("Incorrect password. Please verify your password and try again.");
        this.showToast("Incorrect password. Access denied.", "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "LOG IN TO MY ACCOUNT";
        }
        return; // HALT COMPLETELY! NO LOGGING IN!
      }

      // CREDENTIALS VERIFIED: Establish Authenticated Session
      this.currentUser = {
        id: foundUser.id,
        name: foundUser.name,
        gmail: foundUser.gmail
      };
      localStorage.setItem("studyvault_current_user", JSON.stringify(this.currentUser));

      this.closeAuthModal();
      this.updateAuthUI();
      this.showToast(`Welcome back, ${foundUser.name}!`, "success");

      // Resume pending purchase if user clicked buy before signing in
      if (this.pendingPurchaseAction) {
        const pending = this.pendingPurchaseAction;
        this.pendingPurchaseAction = null;
        setTimeout(() => {
          if (pending.type === "buyNow") {
            this.buyNowDirect(pending.productId);
          } else if (pending.type === "cart") {
            this.proceedFromCart();
          }
        }, 300);
      }
    } catch (err) {
      console.error("Login verification error:", err);
      this.setAuthError("Login failed: " + (err.message || "Please check your network."));
      this.showToast("Login error", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "LOG IN TO MY ACCOUNT";
      }
    }
  }

  logoutUser() {
    this.currentUser = null;
    localStorage.removeItem("studyvault_current_user");
    this.updateAuthUI();
    this.showToast("Signed out successfully", "info");
  }

  // ================= CATEGORY FILTERING =================
  applyFilter() {
    const comingSoonBlock = document.getElementById("category-coming-soon-banner");
    const grid = document.getElementById("product-grid");
    const emptyState = document.getElementById("catalog-empty");
    const countDisplay = document.getElementById("active-item-count");
    const catalogTitle = document.getElementById("catalog-title");

    const upcoming = COMING_SOON_CATEGORIES.find(c => c.code === this.currentCategory);

    if (upcoming) {
      if (grid) grid.style.display = "none";
      if (emptyState) emptyState.style.display = "none";
      if (countDisplay) countDisplay.textContent = "Coming Soon...";
      if (catalogTitle) catalogTitle.textContent = upcoming.name.toUpperCase();

      if (comingSoonBlock) {
        comingSoonBlock.style.display = "block";
        comingSoonBlock.innerHTML = `
          <div class="coming-soon-card-box">
            <div style="display:inline-block; background:var(--bg-dark); color:#fff; font-size:0.75rem; font-weight:700; letter-spacing:0.1em; padding:6px 14px; border-radius:var(--radius-sm); margin-bottom:14px;">
              COMING SOON...
            </div>
            <h3 style="font-size:2rem; margin-bottom:10px; font-family:var(--font-heading);">${upcoming.name}</h3>
            <p style="color:var(--text-secondary); max-width:520px; margin:0 auto 18px; font-size:0.95rem; line-height:1.6;">
              ${upcoming.description}. Currently in syllabus verification.
            </p>
            <div style="color:var(--accent-camel); font-weight:700; font-size:0.88rem; text-transform:uppercase; margin-bottom:20px;">
              ⏳ Status: ${upcoming.expectedDrop}
            </div>
            <div>
              <button class="btn-primary" onclick="storeApp.filterCategory('all')">
                VIEW AVAILABLE NOTES (₹50 EACH)
              </button>
            </div>
          </div>
        `;
      }
      return;
    }

    if (comingSoonBlock) comingSoonBlock.style.display = "none";
    if (grid) grid.style.display = "grid";

    if (this.currentCategory === "all") {
      this.filteredProducts = [...this.products];
      if (catalogTitle) catalogTitle.textContent = "AVAILABLE STUDY RESOURCES (₹50 EACH)";
    } else {
      this.filteredProducts = this.products.filter(p => p.category === this.currentCategory);
      if (catalogTitle) {
        catalogTitle.textContent = this.currentCategory === "discrete-math" ? "DISCRETE MATHEMATICS NOTES" : "E-COMMERCE NOTES & SLIDES";
      }
    }

    this.renderProducts();
  }

  filterCategory(cat) {
    this.currentCategory = cat;

    document.querySelectorAll(".category-filter-bar .filter-tab").forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-cat") === cat);
    });

    document.querySelectorAll(".nav-menu .nav-link").forEach(link => {
      link.classList.remove("active");
    });

    const catalogSec = document.getElementById("catalog-section");
    if (catalogSec && window.scrollY > 200) {
      catalogSec.scrollIntoView({ behavior: "smooth" });
    }

    this.applyFilter();
  }

  renderProducts() {
    const grid = document.getElementById("product-grid");
    const countDisplay = document.getElementById("active-item-count");
    if (!grid) return;

    if (countDisplay) {
      countDisplay.textContent = `${this.filteredProducts.length} Notes Available`;
    }

    grid.innerHTML = this.filteredProducts.map(product => `
      <article class="product-card" id="card-${product.id}">
        <div class="card-media-wrap">
          <span class="card-badge-pill">${product.badge}</span>
          <img class="card-img" src="${product.image}" alt="${product.title}" loading="lazy">
          
          <div class="card-hover-actions">
            <button class="btn-card-action" onclick="storeApp.openPreviewModal('${product.id}')">
              PREVIEW
            </button>
            <button class="btn-card-action" onclick="storeApp.addToCart('${product.id}')">
              + CART
            </button>
          </div>
        </div>

        <div class="card-info">
          <span class="card-subject">${product.subject}</span>
          <h3 class="card-title" title="${product.title}">${product.title}</h3>
          
          <div class="card-price-row">
            <span class="card-price">₹${product.price}</span>
            <span class="card-price-original">₹${product.originalPrice}</span>
          </div>

          <div style="margin-top:12px;">
            <button class="btn-primary" style="width:100%; justify-content:center; padding:9px 12px; font-size:0.78rem;" onclick="storeApp.buyNowDirect('${product.id}')">
              BUY NOW • ₹50
            </button>
          </div>
        </div>
      </article>
    `).join("");
  }

  // ================= CART MANAGEMENT =================
  loadCart() {
    try {
      const saved = localStorage.getItem("studyvault_cart_v4");
      this.cart = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.cart = [];
    }
    this.updateCartUI();
  }

  saveCart() {
    localStorage.setItem("studyvault_cart_v4", JSON.stringify(this.cart));
    this.updateCartUI();
  }

  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existing = this.cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.categoryLabel,
        quantity: 1
      });
    }

    this.saveCart();
    this.showToast(`Added to cart (₹50)`, "success");
    this.toggleCartDrawer(true);
  }

  removeFromCart(itemId) {
    this.cart = this.cart.filter(item => item.id !== itemId);
    this.saveCart();
  }

  updateCartUI() {
    const counter = document.getElementById("cart-counter");
    const drawerCounter = document.getElementById("cart-drawer-count");
    const container = document.getElementById("cart-items-container");
    const subtotalEl = document.getElementById("cart-subtotal");

    const totalCount = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (counter) counter.textContent = totalCount;
    if (drawerCounter) drawerCounter.textContent = totalCount;

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;

    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px 10px; color:var(--text-muted);">
          <p>Your cart is empty.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" alt="">
        <div class="cart-item-info">
          <div class="cart-item-cat">${item.category}</div>
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">₹${item.price * item.quantity}</div>
          <span class="cart-item-remove" onclick="storeApp.removeFromCart('${item.id}')">Remove</span>
        </div>
      </div>
    `).join("");
  }

  toggleCartDrawer(open) {
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("cart-backdrop");
    if (!drawer || !backdrop) return;

    if (open) {
      drawer.classList.add("active");
      backdrop.classList.add("active");
    } else {
      drawer.classList.remove("active");
      backdrop.classList.remove("active");
    }
  }

  // ================= UPI PAYMENT & UTR SUBMISSION =================
  buyNowDirect(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Strict Enforcement: No one can buy without signup
    if (!this.currentUser) {
      this.pendingPurchaseAction = { type: "buyNow", productId };
      this.showToast("Account required! Please sign up or login to buy notes.", "info");
      this.openAuthModal("register");
      return;
    }

    this.activeCheckoutItem = product;
    this.openPaymentModal([product], product.price);
  }

  proceedFromCart() {
    if (this.cart.length === 0) {
      this.showToast("Your cart is empty!", "error");
      return;
    }

    // Strict Enforcement: No one can buy without signup
    if (!this.currentUser) {
      this.pendingPurchaseAction = { type: "cart" };
      this.toggleCartDrawer(false);
      this.showToast("Account required! Please sign up or login to complete your purchase.", "info");
      this.openAuthModal("register");
      return;
    }

    this.toggleCartDrawer(false);
    this.activeCheckoutItem = null;
    const items = [...this.cart];
    const total = this.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    this.openPaymentModal(items, total);
  }

  openPaymentModal(items, totalAmount) {
    // Extra safety check
    if (!this.currentUser) {
      this.openAuthModal("register");
      return;
    }

    const modal = document.getElementById("upi-payment-modal");
    const totalDisplay = document.getElementById("upi-modal-amount");
    const itemsList = document.getElementById("upi-modal-items-list");
    const nameInput = document.getElementById("buyer-name");
    const gmailInput = document.getElementById("buyer-gmail");

    if (!modal) return;

    if (totalDisplay) totalDisplay.textContent = `₹${totalAmount}`;

    if (itemsList) {
      itemsList.innerHTML = items.map(item => `
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px; padding-bottom:4px; border-bottom:1px solid var(--border-light);">
          <span style="font-weight:600; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.title}</span>
          <span style="color:var(--accent-camel); font-weight:700;">₹${item.price * (item.quantity || 1)}</span>
        </div>
      `).join("");
    }

    // Auto-fill and lock to logged-in user account details
    if (nameInput) {
      nameInput.value = this.currentUser.name;
      nameInput.readOnly = true;
      nameInput.style.backgroundColor = "var(--bg-card)";
    }
    if (gmailInput) {
      gmailInput.value = this.currentUser.gmail;
      gmailInput.readOnly = true;
      gmailInput.style.backgroundColor = "var(--bg-card)";
    }

    this.uploadedScreenshotData = null;
    const preview = document.getElementById("screenshot-preview");
    if (preview) {
      preview.src = "";
      preview.style.display = "none";
    }

    modal.classList.add("active");
  }

  closePaymentModal() {
    const modal = document.getElementById("upi-payment-modal");
    if (modal) modal.classList.remove("active");
  }

  copyUpiId() {
    navigator.clipboard.writeText(this.upiId).then(() => {
      this.showToast(`UPI ID "${this.upiId}" copied!`, "success");
    }).catch(() => {
      this.showToast(`UPI ID: ${this.upiId}`, "info");
    });
  }

  setupScreenshotUpload() {
    const fileInput = document.getElementById("payment-screenshot-file");
    const preview = document.getElementById("screenshot-preview");
    const uploadText = document.getElementById("upload-hint-text");

    if (!fileInput) return;

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        this.uploadedScreenshotData = event.target.result;
        if (preview) {
          preview.src = this.uploadedScreenshotData;
          preview.style.display = "block";
        }
        if (uploadText) {
          uploadText.textContent = `Attached: ${file.name}`;
          uploadText.style.color = "#059669";
        }
        this.showToast("Screenshot attached!", "success");
      };
      reader.readAsDataURL(file);
    });
  }

  submitUpiPayment(e) {
    e.preventDefault();

    const name = document.getElementById("buyer-name").value.trim();
    const gmail = document.getElementById("buyer-gmail").value.trim();
    const utr = document.getElementById("buyer-utr").value.trim();

    if (!name || !gmail || !utr) {
      this.showToast("Please complete all required fields", "error");
      return;
    }

    if (!this.uploadedScreenshotData) {
      this.showToast("Please attach your payment screenshot", "error");
      return;
    }

    const orderId = "SV-" + Math.floor(100000 + Math.random() * 900000);
    const orderItems = this.activeCheckoutItem ? [this.activeCheckoutItem] : [...this.cart];
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const notesSummary = orderItems.map(i => `${i.title} (₹${i.price})`).join(", ");

    const orderRecord = {
      orderId,
      name,
      gmail,
      utr,
      screenshot: this.uploadedScreenshotData,
      notesRequested: notesSummary,
      notes_requested: notesSummary,
      items: orderItems.map(i => ({ title: i.title, price: i.price })),
      totalAmount,
      date: new Date().toLocaleString(),
      status: "Pending Verification" // Options: "Pending Verification" | "Notes Sent to Gmail"
    };

    // Save order locally
    const currentOrders = JSON.parse(localStorage.getItem("studyvault_orders") || "[]");
    currentOrders.unshift(orderRecord);
    localStorage.setItem("studyvault_orders", JSON.stringify(currentOrders));

    // If user is logged in, attach to user orders
    if (this.currentUser) {
      const userOrders = JSON.parse(localStorage.getItem(`studyvault_user_orders_${this.currentUser.gmail}`) || "[]");
      userOrders.unshift(orderRecord);
      localStorage.setItem(`studyvault_user_orders_${this.currentUser.gmail}`, JSON.stringify(userOrders));
    }

    // Sync Order (UTR & Screenshot) to Supabase
    if (window.supabaseService) {
      window.supabaseService.saveOrder(orderRecord);
    }

    this.closePaymentModal();

    if (window.confetti) {
      window.confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
    }

    this.showConfirmationModal(orderRecord);

    if (!this.activeCheckoutItem) {
      this.cart = [];
      this.saveCart();
    }
  }

  showConfirmationModal(order) {
    const modal = document.getElementById("order-confirmation-modal");
    const body = document.getElementById("confirmation-modal-body");
    if (!modal || !body) return;

    body.innerHTML = `
      <div style="text-align:center; padding:10px 0;">
        <div style="width:60px; height:60px; border-radius:50%; background:#D1FAE5; color:#059669; display:inline-flex; align-items:center; justify-content:center; font-size:1.8rem; margin-bottom:14px;">
          ✓
        </div>
        <h2 style="font-size:1.8rem; margin-bottom:6px;">PAYMENT DETAILS SUBMITTED!</h2>
        <p style="color:var(--text-secondary); font-size:0.92rem; max-width:440px; margin:0 auto 20px;">
          Your order has been placed. We will verify your UTR and dispatch the notes to <strong>${order.gmail}</strong>.
        </p>

        <div style="background:var(--bg-card); border-radius:var(--radius-sm); border:1px solid var(--border-light); padding:16px; text-align:left; margin-bottom:20px; font-size:0.88rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:var(--text-secondary);">Order ID:</span>
            <strong>#${order.orderId}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:var(--text-secondary);">Delivery Gmail:</span>
            <strong style="color:var(--accent-camel);">${order.gmail}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:var(--text-secondary);">Submitted UTR:</span>
            <strong style="font-family:monospace;">${order.utr}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:var(--text-secondary);">Amount Paid:</span>
            <strong style="color:var(--accent-camel);">₹${order.totalAmount}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:1px solid var(--border-light);">
            <span style="color:var(--text-secondary);">Status:</span>
            <span class="status-pill pending">🟡 PENDING VERIFICATION</span>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn-primary" style="flex:1; justify-content:center;" onclick="storeApp.closeConfirmationModal(); storeApp.openMyPurchasesModal();">
            TRACK IN MY PURCHASES
          </button>
          <button class="btn-secondary" onclick="storeApp.closeConfirmationModal()">
            CONTINUE
          </button>
        </div>
      </div>
    `;

    modal.classList.add("active");
  }

  closeConfirmationModal() {
    const modal = document.getElementById("order-confirmation-modal");
    if (modal) modal.classList.remove("active");
  }

  // ================= PURCHASES & ORDER STATUS TRACKER =================
  async openMyPurchasesModal() {
    // Authorization Check: Must be logged in
    if (!this.currentUser) {
      this.showToast("Please Log In or Sign Up to view your purchased notes and status.", "info");
      this.openAuthModal("login");
      return;
    }

    const modal = document.getElementById("purchases-modal");
    const container = document.getElementById("my-purchases-container");
    if (!modal || !container) return;

    let orders = [];

    // 1. Fetch from Supabase Cloud first
    if (window.supabaseService && window.supabaseService.isConnected) {
      const sbOrders = await window.supabaseService.getOrdersByGmail(this.currentUser.gmail);
      if (sbOrders && sbOrders.length > 0) {
        orders = sbOrders;
      }
    }

    // 2. Fallback to LocalStorage user orders
    if (orders.length === 0) {
      orders = JSON.parse(localStorage.getItem(`studyvault_user_orders_${this.currentUser.gmail}`) || "[]");
    }

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px 10px; color:var(--text-muted);">
          <p>You have not placed any orders yet.</p>
          <button class="btn-primary" style="margin-top:14px;" onclick="storeApp.closeMyPurchasesModal(); storeApp.filterCategory('all');">
            BROWSE NOTES (₹50)
          </button>
        </div>
      `;
    } else {
      container.innerHTML = orders.map(ord => {
        const isSent = ord.status === "Notes Sent to Gmail";
        return `
          <div style="background:#fff; border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:18px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <div>
                <strong style="font-size:1.05rem;">Order #${ord.orderId}</strong>
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">Placed on ${ord.date}</div>
              </div>
              <span class="status-pill ${isSent ? 'sent' : 'pending'}">
                ${isSent ? '🟢 NOTES SENT TO GMAIL' : '🟡 PENDING VERIFICATION'}
              </span>
            </div>

            <div style="background:var(--bg-card); padding:10px 14px; border-radius:var(--radius-sm); margin-bottom:12px; font-size:0.84rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Recipient Gmail:</span>
                <strong>${ord.gmail}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>UTR Reference:</span>
                <span style="font-family:monospace; font-weight:700;">${ord.utr}</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Total Amount:</span>
                <strong style="color:var(--accent-camel);">₹${ord.totalAmount}</strong>
              </div>
            </div>

            <div style="margin-bottom:12px;">
              <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary); display:block; margin-bottom:4px;">Notes Requested:</span>
              <div style="font-size:0.88rem; color:var(--text-primary); font-weight:600;">
                ${ord.notesRequested || (ord.items && ord.items.length ? ord.items.map(item => `${item.title} (₹${item.price})`).join(", ") : "Study Notes (₹50)")}
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; align-items:center; border-top:1px solid var(--border-light); padding-top:12px;">
              <button class="btn-secondary" style="font-size:0.75rem; padding:6px 12px; color:#B91C1C; border-color:#FCA5A5;" onclick="storeApp.openComplaintModal('${ord.orderId}')">
                ⚠️ Raise Complaint for this Order
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    modal.classList.add("active");
  }

  closeMyPurchasesModal() {
    const modal = document.getElementById("purchases-modal");
    if (modal) modal.classList.remove("active");
  }

  toggleOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem("studyvault_orders") || "[]");
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      order.status = (order.status === "Notes Sent to Gmail") ? "Pending Verification" : "Notes Sent to Gmail";
      localStorage.setItem("studyvault_orders", JSON.stringify(orders));

      if (this.currentUser) {
        const uOrders = JSON.parse(localStorage.getItem(`studyvault_user_orders_${this.currentUser.gmail}`) || "[]");
        const uOrder = uOrders.find(o => o.orderId === orderId);
        if (uOrder) {
          uOrder.status = order.status;
          localStorage.setItem(`studyvault_user_orders_${this.currentUser.gmail}`, JSON.stringify(uOrders));
        }
      }

      this.showToast(`Order #${orderId} status updated to: ${order.status}`, "success");
      this.openMyPurchasesModal();
    }
  }

  // ================= COMPLAINT & SUPPORT SYSTEM =================
  openComplaintModal(prefilledOrderId = "") {
    // Authorization Check: Must be logged in
    if (!this.currentUser) {
      this.showToast("Please Log In or Sign Up to raise a complaint or support ticket.", "info");
      this.openAuthModal("login");
      return;
    }

    const modal = document.getElementById("complaint-modal");
    const orderInput = document.getElementById("complaint-order-id");
    const gmailInput = document.getElementById("complaint-gmail");

    if (!modal) return;

    if (orderInput && prefilledOrderId) {
      orderInput.value = prefilledOrderId;
    }

    if (gmailInput && this.currentUser) {
      gmailInput.value = this.currentUser.gmail;
      gmailInput.readOnly = true;
      gmailInput.style.backgroundColor = "var(--bg-card)";
    }

    modal.classList.add("active");
  }

  closeComplaintModal() {
    const modal = document.getElementById("complaint-modal");
    if (modal) modal.classList.remove("active");
  }

  submitComplaint(e) {
    e.preventDefault();

    const orderId = document.getElementById("complaint-order-id").value.trim();
    const gmail = document.getElementById("complaint-gmail").value.trim();
    const reason = document.getElementById("complaint-reason").value;
    const message = document.getElementById("complaint-message").value.trim();

    if (!gmail || !message) {
      this.showToast("Please fill all required fields", "error");
      return;
    }

    const ticketId = "TICKET-" + Math.floor(1000 + Math.random() * 9000);
    const complaintRecord = {
      ticketId,
      orderId: orderId || "General Inquiry",
      gmail,
      reason,
      message,
      status: "Under Review by Dipanshu",
      date: new Date().toLocaleDateString()
    };

    const complaints = JSON.parse(localStorage.getItem("studyvault_complaints") || "[]");
    complaints.unshift(complaintRecord);
    localStorage.setItem("studyvault_complaints", JSON.stringify(complaints));

    // Sync complaint to Supabase
    if (window.supabaseService) {
      window.supabaseService.saveComplaint(complaintRecord);
    }

    this.closeComplaintModal();
    this.showToast(`Complaint submitted (Ref #${ticketId}). We will email you at ${gmail} within 2 hours.`, "success");
  }

  // ================= REVIEWS & FEEDBACK SYSTEM =================
  loadReviews() {
    try {
      const saved = localStorage.getItem("studyvault_reviews");
      this.reviews = saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch (e) {
      this.reviews = INITIAL_REVIEWS;
    }
  }

  saveReviews() {
    localStorage.setItem("studyvault_reviews", JSON.stringify(this.reviews));
    this.renderReviewsSection();
  }

  renderReviewsSection() {
    const grid = document.getElementById("student-reviews-grid");
    if (!grid) return;

    grid.innerHTML = this.reviews.map(rev => `
      <div class="review-card">
        <div class="review-stars">${"★".repeat(rev.rating)}${"☆".repeat(5 - rev.rating)}</div>
        <p class="review-text">"${rev.text}"</p>
        <div class="review-author-wrap">
          <div>
            <div class="review-author-name">${rev.name}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">${rev.course || "Verified Student"}</div>
          </div>
          <span class="review-badge-verified">✓ Verified Buyer</span>
        </div>
      </div>
    `).join("");
  }

  openReviewModal() {
    // Authorization Check: Must be logged in
    if (!this.currentUser) {
      this.showToast("Please Log In or Sign Up to write a review.", "info");
      this.openAuthModal("login");
      return;
    }

    const modal = document.getElementById("review-modal");
    const nameInput = document.getElementById("rev-author-name");
    if (!modal) return;

    if (nameInput && this.currentUser) {
      nameInput.value = this.currentUser.name;
    }

    modal.classList.add("active");
  }

  closeReviewModal() {
    const modal = document.getElementById("review-modal");
    if (modal) modal.classList.remove("active");
  }

  setRating(stars) {
    this.selectedStarRating = stars;
    document.querySelectorAll(".star-rating-select span").forEach((s, idx) => {
      s.style.color = (idx < stars) ? "#F59E0B" : "#D1D5DB";
    });
  }

  submitReview(e) {
    e.preventDefault();
    const name = document.getElementById("rev-author-name").value.trim() || "Anonymous Student";
    const course = document.getElementById("rev-author-course").value.trim() || "B.Tech / BCA";
    const text = document.getElementById("rev-text").value.trim();

    if (!text) {
      this.showToast("Please write a review comment", "error");
      return;
    }

    const newRev = {
      id: "rev-" + Date.now(),
      name,
      course,
      rating: this.selectedStarRating,
      text,
      date: "Just now"
    };

    this.reviews.unshift(newRev);
    this.saveReviews();

    // Sync review to Supabase
    if (window.supabaseService) {
      window.supabaseService.saveReview(newRev);
    }
    this.closeReviewModal();
    this.showToast("Thank you for your feedback!", "success");

    const revSec = document.getElementById("reviews-section");
    if (revSec) revSec.scrollIntoView({ behavior: "smooth" });
  }

  // ================= PREVIEW MODAL =================
  openPreviewModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("preview-modal");
    const body = document.getElementById("preview-modal-body");
    const title = document.getElementById("preview-modal-title");

    if (!modal || !body) return;

    if (title) title.textContent = product.title;

    body.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:24px;">
        <div>
          <div style="border-radius:var(--radius-sm); overflow:hidden; border:1px solid var(--border-light);">
            <img src="${product.image}" alt="${product.title}" style="width:100%; height:260px; object-fit:cover;">
          </div>
          <div style="margin-top:12px; background:var(--bg-card); padding:12px; border-radius:var(--radius-sm); font-size:0.8rem;">
            <div><strong>Format:</strong> ${product.format}</div>
            <div style="margin-top:4px;"><strong>Subject:</strong> ${product.subject}</div>
            <div style="margin-top:4px;"><strong>Delivery:</strong> Direct to Gmail after UPI payment verification</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column;">
          <div style="font-size:0.75rem; letter-spacing:0.1em; color:var(--accent-camel); font-weight:700; text-transform:uppercase;">
            ${product.categoryLabel}
          </div>
          <h2 style="font-size:1.6rem; margin:4px 0 10px; line-height:1.15;">${product.title}</h2>
          
          <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:14px;">
            <span style="font-size:1.7rem; font-weight:700; color:var(--accent-camel);">₹${product.price}</span>
            <span style="font-size:1rem; color:var(--text-muted); text-decoration:line-through;">₹${product.originalPrice}</span>
          </div>

          <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.55; margin-bottom:16px;">
            ${product.description}
          </p>

          <div style="margin-bottom:20px;">
            <h4 style="font-size:0.8rem; letter-spacing:0.06em; margin-bottom:6px;">KEY HIGHLIGHTS:</h4>
            <ul style="list-style:none; display:flex; flex-direction:column; gap:4px; font-size:0.82rem; color:var(--text-secondary);">
              ${product.highlights.map(h => `<li style="display:flex; align-items:center; gap:6px;"><span style="color:#059669; font-weight:bold;">✓</span> ${h}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-top:auto; display:flex; gap:10px;">
            <button class="btn-primary" style="flex:1; justify-content:center;" onclick="storeApp.closePreviewModal(); storeApp.buyNowDirect('${product.id}');">
              BUY NOW VIA UPI • ₹50
            </button>
            <button class="btn-secondary" onclick="storeApp.addToCart('${product.id}'); storeApp.closePreviewModal();">
              + CART
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
  }

  closePreviewModal() {
    const modal = document.getElementById("preview-modal");
    if (modal) modal.classList.remove("active");
  }

  // ================= SEARCH =================
  toggleSearchModal(open = true) {
    const modal = document.getElementById("search-modal");
    if (!modal) return;
    if (open) {
      modal.classList.add("active");
      const input = document.getElementById("quick-search-input");
      if (input) {
        input.value = "";
        input.focus();
      }
      this.handleSearchInput("");
    } else {
      modal.classList.remove("active");
    }
  }

  handleSearchInput(query) {
    const resultsContainer = document.getElementById("quick-search-results");
    if (!resultsContainer) return;

    const trimmed = query.trim().toLowerCase();
    const matches = this.products.filter(p => 
      p.title.toLowerCase().includes(trimmed) || 
      p.subject.toLowerCase().includes(trimmed) ||
      p.description.toLowerCase().includes(trimmed)
    ).slice(0, 8);

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<div style="padding:14px; text-align:center; color:var(--text-muted); font-size:0.85rem;">No matching notes found.</div>`;
      return;
    }

    resultsContainer.innerHTML = matches.map(p => `
      <div style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--bg-card); border-radius:var(--radius-sm); cursor:pointer;" onclick="storeApp.openPreviewModal('${p.id}'); storeApp.toggleSearchModal(false);">
        <img src="${p.image}" style="width:40px; height:40px; object-fit:cover; border-radius:var(--radius-sm);" alt="">
        <div style="flex-grow:1;">
          <div style="font-weight:700; font-family:var(--font-heading); font-size:0.95rem;">${p.title}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">${p.subject}</div>
        </div>
        <div style="font-weight:700; color:var(--accent-camel);">₹${p.price}</div>
      </div>
    `).join("");
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ================= USER CHANGE PASSWORD =================
  openChangePasswordModal() {
    if (!this.currentUser) {
      this.showToast("Please log in first to change your password", "info");
      this.openAuthModal("login");
      return;
    }
    const banner = document.getElementById("user-pwd-error-banner");
    if (banner) banner.style.display = "none";
    const form = document.getElementById("user-pwd-form");
    if (form) form.reset();
    const modal = document.getElementById("user-change-password-modal");
    if (modal) modal.classList.add("active");
  }

  closeChangePasswordModal() {
    const modal = document.getElementById("user-change-password-modal");
    if (modal) modal.classList.remove("active");
  }

  async handleUserPasswordChange(e) {
    e.preventDefault();
    if (!this.currentUser) return;

    const currPwd = document.getElementById("user-curr-pwd").value;
    const newPwd = document.getElementById("user-new-pwd").value;
    const confirmPwd = document.getElementById("user-confirm-pwd").value;
    const banner = document.getElementById("user-pwd-error-banner");

    const showError = (msg) => {
      if (banner) {
        banner.textContent = msg;
        banner.style.display = "block";
      }
    };

    if (newPwd !== confirmPwd) {
      showError("New password and confirmation do not match.");
      return;
    }

    if (newPwd.length < 6) {
      showError("New password must be at least 6 characters.");
      return;
    }

    const currHash = await this.hashPassword(currPwd);
    if (this.currentUser.passwordHash && this.currentUser.passwordHash !== currHash) {
      showError("Incorrect current password.");
      return;
    }

    const newHash = await this.hashPassword(newPwd);
    try {
      if (window.supabaseService) {
        await window.supabaseService.updateUserPassword(this.currentUser.gmail, newHash);
      }

      // Update in localStorage users array
      const localUsers = JSON.parse(localStorage.getItem("studyvault_users") || "[]");
      const idx = localUsers.findIndex(u => u.gmail.toLowerCase() === this.currentUser.gmail.toLowerCase());
      if (idx !== -1) {
        localUsers[idx].passwordHash = newHash;
        localStorage.setItem("studyvault_users", JSON.stringify(localUsers));
      }

      this.currentUser.passwordHash = newHash;
      localStorage.setItem("studyvault_current_user", JSON.stringify(this.currentUser));

      this.closeChangePasswordModal();
      this.showToast("Password updated successfully in Cloud!", "success");
    } catch (err) {
      showError("Failed to update password: " + (err.message || "Unknown error"));
    }
  }

  // ================= ADMIN PORTAL & MANAGEMENT =================
  openAdminModal() {
    if (sessionStorage.getItem("studyvault_admin_auth") === "true") {
      this.openAdminDashboardModal();
    } else {
      this.openAdminLoginModal();
    }
  }

  openAdminLoginModal() {
    const banner = document.getElementById("admin-login-error");
    if (banner) banner.style.display = "none";
    const passInput = document.getElementById("admin-pass-input");
    if (passInput) passInput.value = "";
    const modal = document.getElementById("admin-login-modal");
    if (modal) modal.classList.add("active");
  }

  closeAdminLoginModal() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) modal.classList.remove("active");
  }

  async handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById("admin-user-input").value.trim();
    const pass = document.getElementById("admin-pass-input").value;
    const banner = document.getElementById("admin-login-error");

    const showError = (msg) => {
      if (banner) {
        banner.textContent = msg;
        banner.style.display = "block";
      }
    };

    if (user !== "admin") {
      showError("Invalid admin username. Please use 'admin'.");
      return;
    }

    const inputHash = await this.hashPassword(pass);
    let valid = false;

    // 1. Check Supabase admin_config
    if (window.supabaseService) {
      const config = await window.supabaseService.getAdminConfig();
      if (config && config.password_hash) {
        valid = (config.password_hash === inputHash);
      }
    }

    // 2. Default admin123 hash or local override
    const defaultHash = "b23487df00dc4d4dcc336068a299c729c17421f8162b85acafe8eb8a807634eb";
    const localSavedAdminHash = localStorage.getItem("studyvault_admin_pwd_hash");

    if (localSavedAdminHash) {
      valid = valid || (localSavedAdminHash === inputHash);
    } else {
      valid = valid || (defaultHash === inputHash) || (pass === "admin123");
    }

    if (valid) {
      sessionStorage.setItem("studyvault_admin_auth", "true");
      this.closeAdminLoginModal();
      this.openAdminDashboardModal();
      this.showToast("Welcome, Administrator!", "success");
    } else {
      showError("Incorrect administrator password.");
    }
  }

  openAdminDashboardModal() {
    const modal = document.getElementById("admin-dashboard-modal");
    if (modal) modal.classList.add("active");
    this.switchAdminTab("orders");
  }

  closeAdminDashboardModal() {
    const modal = document.getElementById("admin-dashboard-modal");
    if (modal) modal.classList.remove("active");
  }

  switchAdminTab(tab) {
    const ordersTab = document.getElementById("admin-tab-orders");
    const complaintsTab = document.getElementById("admin-tab-complaints");
    const pwdTab = document.getElementById("admin-tab-password");

    const ordersBtn = document.getElementById("admin-tab-orders-btn");
    const complaintsBtn = document.getElementById("admin-tab-complaints-btn");
    const pwdBtn = document.getElementById("admin-tab-pwd-btn");

    if (ordersTab) ordersTab.style.display = (tab === "orders") ? "block" : "none";
    if (complaintsTab) complaintsTab.style.display = (tab === "complaints") ? "block" : "none";
    if (pwdTab) pwdTab.style.display = (tab === "password") ? "block" : "none";

    if (ordersBtn) ordersBtn.classList.toggle("active", tab === "orders");
    if (complaintsBtn) complaintsBtn.classList.toggle("active", tab === "complaints");
    if (pwdBtn) pwdBtn.classList.toggle("active", tab === "password");

    if (tab === "orders") this.loadAdminOrders();
    if (tab === "complaints") this.loadAdminComplaints();
  }

  async loadAdminOrders() {
    const container = document.getElementById("admin-orders-table-container");
    const countSpan = document.getElementById("admin-orders-count");
    if (!container) return;

    container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">Fetching orders live from Supabase...</div>`;

    let orders = [];
    if (window.supabaseService) {
      orders = await window.supabaseService.getAllOrders();
    }
    if (!orders || orders.length === 0) {
      orders = JSON.parse(localStorage.getItem("studyvault_orders") || "[]");
    }

    if (countSpan) countSpan.textContent = orders.length;

    if (orders.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">No student orders placed yet.</div>`;
      return;
    }

    this.adminOrdersCache = orders;

    container.innerHTML = `
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.83rem; text-align:left;">
          <thead>
            <tr style="background:var(--bg-card); border-bottom:2px solid var(--border-light); color:var(--text-secondary); text-transform:uppercase; font-size:0.72rem; letter-spacing:0.05em;">
              <th style="padding:10px 12px;">Order ID / Date</th>
              <th style="padding:10px 12px;">Student (Gmail)</th>
              <th style="padding:10px 12px;">Notes Requested</th>
              <th style="padding:10px 12px;">Payment (UTR)</th>
              <th style="padding:10px 12px;">Status</th>
              <th style="padding:10px 12px; text-align:right;">Admin Action</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(ord => {
              const isSent = ord.status === "Notes Sent to Gmail";
              const notesText = ord.notesRequested || (ord.items && ord.items.length ? ord.items.map(i => `${i.title} (₹${i.price})`).join(", ") : "Study Notes (₹50)");
              return `
                <tr style="border-bottom:1px solid var(--border-light); vertical-align:middle;">
                  <td style="padding:12px;">
                    <div style="font-weight:700; color:var(--text-primary);">#${ord.orderId}</div>
                    <div style="font-size:0.72rem; color:var(--text-secondary);">${ord.date || "Recent"}</div>
                  </td>
                  <td style="padding:12px;">
                    <div style="font-weight:600;">${ord.name || "Student"}</div>
                    <div style="color:var(--accent-camel); font-size:0.78rem;">${ord.gmail}</div>
                  </td>
                  <td style="padding:12px; max-width:240px;">
                    <div style="font-weight:600; color:#1F2937; line-height:1.3;">${notesText}</div>
                    <div style="font-size:0.75rem; color:var(--accent-camel); font-weight:700; margin-top:2px;">₹${ord.totalAmount || 50}</div>
                  </td>
                  <td style="padding:12px;">
                    <div style="font-family:monospace; font-weight:700; font-size:0.82rem; background:#F3F4F6; padding:3px 6px; border-radius:3px; display:inline-block; margin-bottom:4px;">
                      ${ord.utr}
                    </div>
                    ${ord.screenshot ? `
                      <div>
                        <button class="btn-secondary" style="font-size:0.7rem; padding:3px 7px;" onclick="storeApp.openScreenshotViewer('${ord.orderId}')">
                          📷 View Screenshot
                        </button>
                      </div>
                    ` : '<div style="font-size:0.7rem; color:var(--text-muted);">No image attached</div>'}
                  </td>
                  <td style="padding:12px;">
                    <span class="status-pill ${isSent ? 'sent' : 'pending'}" style="font-size:0.72rem; padding:3px 8px;">
                      ${isSent ? '🟢 SENT TO GMAIL' : '🟡 PENDING'}
                    </span>
                  </td>
                  <td style="padding:12px; text-align:right;">
                    ${isSent ? `
                      <button class="btn-secondary" style="font-size:0.72rem; padding:5px 9px; color:#4B5563;" onclick="storeApp.markOrderAsSent('${ord.orderId}', 'Pending Verification')">
                        ↺ Reset to Pending
                      </button>
                    ` : `
                      <button class="btn-primary" style="font-size:0.72rem; padding:6px 12px; background:#059669; border-color:#059669; white-space:nowrap;" onclick="storeApp.markOrderAsSent('${ord.orderId}', 'Notes Sent to Gmail')">
                        ✉️ MARK AS SENT
                      </button>
                    `}
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  async markOrderAsSent(orderId, newStatus) {
    try {
      if (window.supabaseService) {
        await window.supabaseService.updateOrderStatus(orderId, newStatus);
      }

      // Update local storage orders
      const localOrders = JSON.parse(localStorage.getItem("studyvault_orders") || "[]");
      const ordIdx = localOrders.findIndex(o => o.orderId === orderId);
      if (ordIdx !== -1) {
        localOrders[ordIdx].status = newStatus;
        localStorage.setItem("studyvault_orders", JSON.stringify(localOrders));
        
        // Also update student's local user orders if matched
        const buyerGmail = localOrders[ordIdx].gmail;
        if (buyerGmail) {
          const userOrders = JSON.parse(localStorage.getItem(`studyvault_user_orders_${buyerGmail}`) || "[]");
          const uIdx = userOrders.findIndex(o => o.orderId === orderId);
          if (uIdx !== -1) {
            userOrders[uIdx].status = newStatus;
            localStorage.setItem(`studyvault_user_orders_${buyerGmail}`, JSON.stringify(userOrders));
          }
        }
      }

      this.showToast(`Order #${orderId} marked as "${newStatus}"!`, "success");
      this.loadAdminOrders();
    } catch (e) {
      this.showToast("Failed to update status in Supabase: " + e.message, "error");
    }
  }

  async loadAdminComplaints() {
    const container = document.getElementById("admin-complaints-table-container");
    const countSpan = document.getElementById("admin-complaints-count");
    if (!container) return;

    let complaints = [];
    if (window.supabaseService) {
      complaints = await window.supabaseService.getAllComplaints();
    }
    if (!complaints || complaints.length === 0) {
      complaints = JSON.parse(localStorage.getItem("studyvault_complaints") || "[]");
    }

    if (countSpan) countSpan.textContent = complaints.length;

    if (complaints.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">No student complaints submitted yet.</div>`;
      return;
    }

    container.innerHTML = `
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.83rem; text-align:left;">
          <thead>
            <tr style="background:var(--bg-card); border-bottom:2px solid var(--border-light); color:var(--text-secondary); text-transform:uppercase; font-size:0.72rem; letter-spacing:0.05em;">
              <th style="padding:10px 12px;">Ticket ID</th>
              <th style="padding:10px 12px;">Student Gmail</th>
              <th style="padding:10px 12px;">Order ID</th>
              <th style="padding:10px 12px;">Reason</th>
              <th style="padding:10px 12px;">Message</th>
              <th style="padding:10px 12px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${complaints.map(c => `
              <tr style="border-bottom:1px solid var(--border-light); vertical-align:top;">
                <td style="padding:12px; font-weight:700;">#${c.ticket_id || c.ticketId}</td>
                <td style="padding:12px; color:var(--accent-camel); font-weight:600;">${c.gmail}</td>
                <td style="padding:12px; font-family:monospace;">${c.order_id || c.orderId || "N/A"}</td>
                <td style="padding:12px; font-weight:600;">${c.reason}</td>
                <td style="padding:12px; max-width:260px; line-height:1.4;">${c.message}</td>
                <td style="padding:12px;">
                  <span class="status-pill pending" style="font-size:0.72rem; padding:3px 8px;">
                    ${c.status || "Under Review"}
                  </span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  openScreenshotViewer(orderIdOrData) {
    let src = orderIdOrData;
    if (this.adminOrdersCache) {
      const ord = this.adminOrdersCache.find(o => o.orderId === orderIdOrData);
      if (ord && ord.screenshot) {
        src = ord.screenshot;
      }
    }
    const modal = document.getElementById("screenshot-viewer-modal");
    const img = document.getElementById("full-screenshot-img");
    if (modal && img) {
      img.src = src;
      modal.classList.add("active");
    }
  }

  closeScreenshotViewerModal() {
    const modal = document.getElementById("screenshot-viewer-modal");
    if (modal) modal.classList.remove("active");
  }

  async handleAdminPasswordChange(e) {
    e.preventDefault();
    const curr = document.getElementById("admin-curr-pwd").value;
    const newPwd = document.getElementById("admin-new-pwd").value;
    const confirmPwd = document.getElementById("admin-confirm-pwd").value;
    const banner = document.getElementById("admin-pwd-error-banner");

    const showError = (msg) => {
      if (banner) {
        banner.textContent = msg;
        banner.style.display = "block";
      }
    };

    if (newPwd !== confirmPwd) {
      showError("New password and confirmation do not match.");
      return;
    }

    if (newPwd.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    // Verify current admin password
    const currHash = await this.hashPassword(curr);
    let valid = false;
    if (window.supabaseService) {
      const config = await window.supabaseService.getAdminConfig();
      if (config && config.password_hash) {
        valid = (config.password_hash === currHash);
      }
    }
    const defaultHash = "b23487df00dc4d4dcc336068a299c729c17421f8162b85acafe8eb8a807634eb";
    const localHash = localStorage.getItem("studyvault_admin_pwd_hash");
    if (localHash) {
      valid = valid || (localHash === currHash);
    } else {
      valid = valid || (defaultHash === currHash) || (curr === "admin123");
    }

    if (!valid) {
      showError("Incorrect current administrator password.");
      return;
    }

    const newHash = await this.hashPassword(newPwd);
    try {
      if (window.supabaseService) {
        await window.supabaseService.updateAdminPassword(newHash);
      }
      localStorage.setItem("studyvault_admin_pwd_hash", newHash);
      if (banner) banner.style.display = "none";
      document.getElementById("admin-change-pwd-form").reset();
      this.showToast("Admin password updated successfully in Supabase!", "success");
      this.switchAdminTab("orders");
    } catch (err) {
      showError("Failed to update password in Supabase: " + err.message);
    }
  }
}

window.storeApp = new StoreApp();
