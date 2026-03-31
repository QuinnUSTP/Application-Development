(() => {
  let refreshTimer = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderRelationships(root, relationships = []) {
    if (!root) return;

    if (!relationships.length) {
      root.innerHTML = `
        <h3 style="margin-top:0;">Relationships</h3>
        <p class="small-muted">No foreign key relationships detected from model refs.</p>
      `;
      return;
    }

    root.innerHTML = `
      <h3 style="margin-top:0;">Relationships</h3>
      <table class="schema-table">
        <thead>
          <tr>
            <th>From</th>
            <th>Foreign Key Field</th>
            <th>To</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          ${relationships.map((r) => `
            <tr>
              <td>${escapeHtml(r.fromModel)} <span class="small-muted">(${escapeHtml(r.fromCollection)})</span></td>
              <td><span class="chip fk">FK</span> ${escapeHtml(r.fromField)}</td>
              <td>${escapeHtml(r.toModel)}</td>
              <td>${escapeHtml(r.relationship)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function formatDefault(v) {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'object') return escapeHtml(JSON.stringify(v));
    return escapeHtml(String(v));
  }

  function renderEntity(entity) {
    const indexInfo = (entity.indexes || []).length
      ? `<details><summary>Indexes (${entity.indexes.length})</summary><pre style="white-space:pre-wrap; margin-top:8px;">${escapeHtml(JSON.stringify(entity.indexes, null, 2))}</pre></details>`
      : '<div class="small-muted">No additional indexes</div>';

    return `
      <div class="schema-card">
        <div class="schema-top">
          <h3 style="margin:0;">${escapeHtml(entity.model)}</h3>
          <div class="small-muted">collection: <code>${escapeHtml(entity.collection)}</code> • docs: <strong>${Number(entity.documentCount || 0)}</strong></div>
        </div>

        <table class="schema-table">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Type</th>
              <th>Keys / Constraints</th>
              <th>References</th>
              <th>Default</th>
              <th>Enum</th>
            </tr>
          </thead>
          <tbody>
            ${(entity.fields || []).map((f) => {
              const chips = [
                f.isPrimaryKey ? '<span class="chip pk">PK</span>' : '',
                f.isForeignKey ? '<span class="chip fk">FK</span>' : '',
                f.required ? '<span class="chip req">required</span>' : '',
                f.unique ? '<span class="chip unique">unique</span>' : '',
                f.index ? '<span class="chip">index</span>' : '',
                f.isArray ? '<span class="chip">array</span>' : '',
              ].filter(Boolean).join(' ');

              return `
                <tr>
                  <td><code>${escapeHtml(f.name)}</code></td>
                  <td>${escapeHtml(f.type)}</td>
                  <td>${chips || '—'}</td>
                  <td>${f.references ? escapeHtml(f.references) : '—'}</td>
                  <td>${formatDefault(f.default)}</td>
                  <td>${(f.enumValues && f.enumValues.length) ? escapeHtml(f.enumValues.join(', ')) : '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div style="margin-top:10px;">${indexInfo}</div>
      </div>
    `;
  }

  async function fetchSchemaAndRender() {
    const statusText = document.getElementById('statusText');
    const relationshipsRoot = document.getElementById('relationshipsRoot');
    const entitiesRoot = document.getElementById('entitiesRoot');

    try {
      await apiService.requireLogin();

      const me = await apiService.getUserProfile();
      if (!me || me.role !== 'admin') {
        statusText.innerHTML = '<span class="danger">Admin access required for schema view.</span>';
        relationshipsRoot.innerHTML = '';
        entitiesRoot.innerHTML = `
          <div class="schema-card"><p class="danger">You are logged in but not an admin. Use an admin account to access <code>/api/admin/schema</code>.</p></div>
        `;
        return;
      }

      const res = await apiService.request('/admin/schema', { method: 'GET' });
      const data = res?.data || {};

      const generatedAt = data.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—';
      const dbName = data?.database?.name || '(unknown)';
      statusText.textContent = `Connected as ${me.username} (admin) • DB: ${dbName} • Updated: ${generatedAt}`;

      renderRelationships(relationshipsRoot, data.relationships || []);
      entitiesRoot.innerHTML = (data.entities || []).map(renderEntity).join('');
    } catch (e) {
      statusText.innerHTML = `<span class="danger">${escapeHtml(e?.message || 'Failed to load schema')}</span>`;
      relationshipsRoot.innerHTML = '';
      entitiesRoot.innerHTML = `
        <div class="schema-card">
          <p class="danger">Unable to load schema metadata.</p>
          <p class="small-muted">Make sure backend is running and you are logged in as an admin.</p>
        </div>
      `;
    }
  }

  function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount && window.cartManager && typeof cartManager.getItemCount === 'function') {
      cartCount.textContent = cartManager.getItemCount();
    }
  }

  function init() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn?.addEventListener('click', fetchSchemaAndRender);

    fetchSchemaAndRender();
    updateCartCount();

    // Near real-time refresh (schema + counts)
    refreshTimer = setInterval(fetchSchemaAndRender, 3000);
    window.addEventListener('beforeunload', () => {
      if (refreshTimer) clearInterval(refreshTimer);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
