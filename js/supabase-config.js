/**
 * STUDYVAULT - Active Supabase Cloud Database Integration
 * Project: studyvault-db (ap-south-1)
 * Organization: technologiainsaan's Org
 */

class SupabaseService {
  constructor() {
    this.projectUrl = "https://zzuzttvkucghbwdugdmm.supabase.co";
    this.anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dXp0dHZrdWNnaGJ3ZHVnZG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyODUwNDgsImV4cCI6MjExMDg2MTA0OH0.Nq7wxO3p0LNJrlCSKrwXLJtj1cDTL2iMZ1U8pdmGdoY";
    this.client = null;
    this.isConnected = false;

    this.init();
  }

  init() {
    if (window.supabase) {
      try {
        this.client = window.supabase.createClient(this.projectUrl, this.anonKey);
        this.isConnected = true;
        console.log("⚡ Supabase Connected Live to studyvault-db!");
      } catch (err) {
        console.warn("Failed to initialize Supabase:", err);
        this.isConnected = false;
      }
    }
  }

  // ================= USERS & AUTHENTICATION =================
  async findUserByGmail(gmail) {
    if (!this.isConnected || !this.client) return null;
    try {
      const { data, error } = await this.client
        .from("users")
        .select("*")
        .eq("gmail", gmail.toLowerCase().trim())
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("Supabase findUser error:", error.message);
      }
      return data;
    } catch (e) {
      console.warn("Supabase findUser exception:", e);
      return null;
    }
  }

  async saveUser(user) {
    if (!this.isConnected || !this.client) return null;
    try {
      const { data, error } = await this.client
        .from("users")
        .upsert([{
          id: user.id || "user-" + Date.now(),
          name: user.name,
          gmail: user.gmail.toLowerCase().trim(),
          password_hash: user.passwordHash,
          created_at: new Date().toISOString()
        }], { onConflict: "gmail" });

      if (error) {
        console.error("Supabase user save error:", error.message);
        throw error;
      }
      return data;
    } catch (e) {
      console.warn("Supabase user save exception:", e);
      throw e;
    }
  }

  async updateUserPassword(gmail, newPasswordHash) {
    if (!this.isConnected || !this.client) return false;
    try {
      const { data, error } = await this.client
        .from("users")
        .update({ password_hash: newPasswordHash })
        .eq("gmail", gmail.toLowerCase().trim());

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase updateUserPassword error:", e);
      throw e;
    }
  }

  // ================= ORDERS (BUY REQUESTS, UTR, SCREENSHOT) =================
  async saveOrder(order) {
    if (!this.isConnected || !this.client) return null;
    try {
      // Create readable plain text summary of requested notes
      const notesSummary = (order.items && order.items.length)
        ? order.items.map(i => `${i.title} (₹${i.price})`).join(", ")
        : "Study Note Package (₹50)";

      const { data, error } = await this.client
        .from("orders")
        .insert([{
          order_id: order.orderId,
          student_name: order.name,
          gmail: order.gmail.toLowerCase().trim(),
          utr: order.utr,
          notes_requested: notesSummary,
          screenshot_data: order.screenshot,
          items: order.items,
          total_amount: order.totalAmount,
          status: order.status || "Pending Verification",
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error("Supabase order insert error:", error.message);
      } else {
        console.log("⚡ Order synced to Supabase orders table with notes_requested:", notesSummary);
      }
      return data;
    } catch (e) {
      console.warn("Supabase saveOrder exception:", e);
    }
  }

  async getAllOrders() {
    if (!this.isConnected || !this.client) return [];
    try {
      const { data, error } = await this.client
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map(d => ({
          orderId: d.order_id,
          name: d.student_name,
          gmail: d.gmail,
          utr: d.utr,
          notesRequested: d.notes_requested || (d.items && d.items.length ? d.items.map(i => i.title).join(", ") : "Study Notes"),
          screenshot: d.screenshot_data,
          items: d.items || [],
          totalAmount: d.total_amount,
          status: d.status,
          date: new Date(d.created_at).toLocaleDateString()
        }));
      }
    } catch (e) {
      console.warn("Supabase getAllOrders exception:", e);
    }
    return [];
  }

  async getOrdersByGmail(gmail) {
    if (!this.isConnected || !this.client) return null;
    try {
      const { data, error } = await this.client
        .from("orders")
        .select("*")
        .eq("gmail", gmail.toLowerCase().trim())
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(d => ({
          orderId: d.order_id,
          name: d.student_name,
          gmail: d.gmail,
          utr: d.utr,
          notesRequested: d.notes_requested || (d.items && d.items.length ? d.items.map(i => i.title).join(", ") : "Study Notes"),
          screenshot: d.screenshot_data,
          items: d.items || [],
          totalAmount: d.total_amount,
          status: d.status,
          date: new Date(d.created_at).toLocaleDateString()
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch orders exception:", e);
    }
    return null;
  }

  async updateOrderStatus(orderId, newStatus) {
    if (!this.isConnected || !this.client) return false;
    try {
      const { data, error } = await this.client
        .from("orders")
        .update({ status: newStatus })
        .eq("order_id", orderId);

      if (error) throw error;
      console.log(`⚡ Order #${orderId} status updated in Supabase to: ${newStatus}`);
      return true;
    } catch (e) {
      console.error("Supabase updateOrderStatus error:", e);
      throw e;
    }
  }

  // ================= ADMIN CONFIG =================
  async getAdminConfig() {
    if (!this.isConnected || !this.client) return null;
    try {
      const { data, error } = await this.client
        .from("admin_config")
        .select("*")
        .eq("id", "default_admin")
        .maybeSingle();

      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase getAdminConfig error:", e);
    }
    return null;
  }

  async updateAdminPassword(newPasswordHash) {
    if (!this.isConnected || !this.client) return false;
    try {
      const { data, error } = await this.client
        .from("admin_config")
        .upsert([{
          id: "default_admin",
          username: "admin",
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase updateAdminPassword error:", e);
      throw e;
    }
  }

  // ================= COMPLAINTS =================
  async saveComplaint(complaint) {
    if (!this.isConnected || !this.client) return null;
    try {
      const { data, error } = await this.client
        .from("complaints")
        .insert([{
          ticket_id: complaint.ticketId,
          order_id: complaint.orderId,
          gmail: complaint.gmail.toLowerCase().trim(),
          reason: complaint.reason,
          message: complaint.message,
          status: complaint.status || "Under Review",
          created_at: new Date().toISOString()
        }]);

      if (error) console.error("Supabase complaint error:", error.message);
      else console.log("⚡ Complaint synced to Supabase complaints table!");
      return data;
    } catch (e) {
      console.warn("Supabase complaint exception:", e);
    }
  }

  async getAllComplaints() {
    if (!this.isConnected || !this.client) return [];
    try {
      const { data, error } = await this.client
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase getAllComplaints error:", e);
    }
    return [];
  }

  // ================= REVIEWS & FEEDBACK =================
  async saveReview(review) {
    if (!this.isConnected || !this.client) return null;
    try {
      const { data, error } = await this.client
        .from("reviews")
        .insert([{
          id: review.id || "rev-" + Date.now(),
          name: review.name,
          course: review.course,
          rating: review.rating,
          review_text: review.text,
          created_at: new Date().toISOString()
        }]);

      if (error) console.error("Supabase review error:", error.message);
      else console.log("⚡ Review synced to Supabase reviews table!");
      return data;
    } catch (e) {
      console.warn("Supabase review exception:", e);
    }
  }

  async getReviews() {
    if (!this.isConnected || !this.client) return null;
    try {
      const { data, error } = await this.client
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(r => ({
          id: r.id,
          name: r.name,
          course: r.course,
          rating: r.rating,
          text: r.review_text,
          date: "Verified"
        }));
      }
    } catch (e) {
      console.warn("Supabase getReviews exception:", e);
    }
    return null;
  }
}

window.supabaseService = new SupabaseService();
