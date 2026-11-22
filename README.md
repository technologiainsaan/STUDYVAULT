# STUDYVAULT — College Study Notes & Presentation Platform

A full-stack, high-conversion academic study marketplace and delivery tracking system designed for students to purchase college notes, study units, and presentations for **₹50** via UPI, with live cloud synchronization to Supabase and automated admin order fulfillment.

---

## 🌟 Key Features

1. **Academic Storefront**:
   - Curated study materials across Discrete Mathematics and E-Commerce.
   - Clean editorial aesthetic inspired by premium typography (`Oswald`, `Plus Jakarta Sans`, `#F5EFEB` cream sand, `#121212` charcoal, `#B28D69` camel bronze accent).
   - Instant search and category filtering with clear "Coming Soon..." badges for upcoming subjects.

2. **Secure Student Accounts & Authentication**:
   - Strict signup and login flow with salted SHA-256 password hashing.
   - Zero bypass: every credential verified against Supabase cloud database (`public.users`) with graceful local caching.
   - In-app password change for students directly updating cloud records.

3. **Seamless UPI Payment & QR Integration**:
   - Verified UPI ID: `8579823872@fam` (DIPANSHU kumar).
   - One-click copy for UPI ID & scannable QR code (`assets/upi_qr.jpg`).
   - 12-digit UTR verification and payment screenshot proof upload.

4. **Live Order Tracking ("My Purchased Notes")**:
   - Real-time order tracking for students.
   - Displays requested notes title & price in plain readable text.
   - Live status indicator: `🟡 PENDING VERIFICATION` / `🟢 NOTES SENT TO GMAIL`.

5. **Integrated Support & Reviews**:
   - Student complaint ticket system synced to Supabase `public.complaints`.
   - Verified student star ratings & testimonials synced to Supabase `public.reviews`.

6. **Admin Portal**:
   - Accessible via the **⚙️ Admin Portal** link in the footer.
   - View all buy requests with student Gmail, requested notes, 12-digit UTR, and proof screenshot viewer.
   - One-click **"MARK AS SENT TO GMAIL"** updates status instantly in Supabase.
   - Secure Administrator password management.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Vanilla JavaScript (ES6+ Class Architecture), CSS3 Custom Properties.
- **Cloud Backend**: Supabase (PostgreSQL with Row Level Security).
- **Authentication**: Salted SHA-256 Client-Side Hashing & Supabase Auth Records.
- **Storage & State**: Live Supabase Cloud Sync with fallback LocalStorage caching.

---

## 🚀 Running Locally

### Option 1 (One-Click Start):
Simply double-click **`start_website.bat`** in the project folder. It starts the local server and automatically opens the website in your browser!

### Option 2 (Via Terminal / CMD):
Make sure your terminal is inside the project directory:
```bash
# 1. Switch drive and navigate to project folder
d:
cd "D:\WEBSITES\FIRST WEBSITE TRY 2"

# 2. Start Python server
python -m http.server 3000
```
Then visit: **`http://localhost:3000`** in your browser.

---

## 📁 Repository Structure

```
├── index.html            # Main single-page web app
├── css/
│   └── style.css         # Complete responsive styles & design tokens
├── js/
│   ├── app.js            # Core store application, auth, payment & admin logic
│   ├── data.js           # Real notes catalog & sample data
│   └── supabase-config.js# Supabase cloud database service integration
├── assets/
│   ├── upi_qr.jpg        # Official payment QR code
│   ├── discrete_math/    # Course PDFs (Sets, Induction, Relations)
│   └── e_commerce/       # Unit presentations & documentation
└── README.md
```

---

&copy; 2026 STUDYVAULT. All rights reserved.
