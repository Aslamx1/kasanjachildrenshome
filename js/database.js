// Legacy Supabase adapter. The current application uses the MySQL API client
// in js/api.js; this file is intentionally not loaded by index.html.
window.KCH_DB_CONFIG = {
  provider: 'supabase',
  supabaseUrl: '',
  supabaseAnonKey: ''
};

const KCHDatabase = (() => {
  const cfg = window.KCH_DB_CONFIG || {};
  const isConfigured = () => Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);

  async function request(path, options = {}) {
    if (!isConfigured()) throw new Error('Database is not configured.');

    const response = await fetch(`${cfg.supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Database request failed: ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  function byEmail(email) {
    return `profiles?email=eq.${encodeURIComponent(email)}&select=*`;
  }

  return {
    isConfigured,

    async getUsers() {
      return request('profiles?select=*');
    },

    async findUser(email) {
      const rows = await request(byEmail(email));
      return rows[0] || null;
    },

    async createUser(user) {
      const rows = await request('profiles', {
        method: 'POST',
        body: JSON.stringify(user)
      });
      return rows[0] || user;
    },

    async getBlogPosts() {
      return request('blog_posts?select=*&order=created_at.desc');
    },

    async upsertBlogPost(post) {
      const payload = {
        id: post.id,
        title: post.title,
        category: post.category,
        image: post.image,
        excerpt: post.excerpt,
        content: post.content,
        published: post.published,
        created_at: post.createdAt,
        updated_at: post.updatedAt
      };

      const rows = await request('blog_posts', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(payload)
      });
      return rows[0] || payload;
    },

    async deleteBlogPost(id) {
      return request(`blog_posts?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }
  };
})();

window.KCHDatabase = KCHDatabase;
