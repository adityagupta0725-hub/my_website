/**
 * ADITYA GUPTA - ELECTRICAL ENGINEERING @ IIT KHARAGPUR
 * High-performance Frontend Application Logic
 */

// Application State
const state = {
  portfolio: null,
  activeCertCategory: 'all',
  certSearchTerm: ''
};

// SVG Badge Icons Registry
const BADGE_ICONS = {
  aws: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none"><path d="M18.8 17.5c-2.4 1.8-5.6 2.5-8.6 1.8-3.1-.7-5.8-2.6-7.5-5.2-.4-.6.1-1.3.8-.9 2.5 1.4 5.3 2 8.3 1.7 2.6-.3 5-1.4 7-3.1.5-.4 1.1.2.7.7z" fill="#FF9900"/><path d="M19.7 15.7c-.3-.4-1.9-.2-2.8-.1-.3 0-.4-.2-.2-.4 1.2-1.3 3.1-.9 3.3-.7.3.3.1 2.2-.9 3.2-.2.2-.4.1-.3-.2.3-.6.9-1.4.9-1.8z" fill="#FF9900"/><path d="M8.2 7.7v4.6c0 .8-.5 1.2-1.2 1.2-.6 0-1-.3-1.1-.9L4 6.8h1.6l1.2 4.3 1.2-4.3h1.7l1.2 4.3 1.2-4.3h1.6l-1.9 5.8c-.1.6-.5.9-1.1.9-.7 0-1.2-.4-1.2-1.2V7.7H8.2z" fill="#ffffff"/></svg>`,
  gcp: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#4285F4"/><path d="M12 8l4 4h-3v4h-2v-4H8l4-4z" fill="#ffffff"/></svg>`,
  meta: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none"><path d="M12 6.5c-3.1 0-5.7 2.4-7.4 5.2-1.1 1.8-1.9 3.5-2.3 4.6-.2.5.2 1 .7 1 .2 0 .5-.1.6-.3.4-.9 1.2-2.5 2.2-4.1 1.5-2.5 3.7-4.6 6.2-4.6 2.3 0 4.1 1.7 4.9 3.9.7 1.9 2.5 3.3 4.7 3.3 2.9 0 5.2-2.3 5.2-5.2S21.5 5 18.6 5c-2.4 0-4.5 1.6-5.1 3.9-.3-.9-.9-1.7-1.5-2.4z" fill="#0081FB"/></svg>`,
  mongodb: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none"><path d="M12 2C11.5 2 9 7.2 9 12.3c0 4.2 2 7.7 3 9.7 1-2 3-5.5 3-9.7C15 7.2 12.5 2 12 2z" fill="#00ED64"/><path d="M12 2v20c.5-.3 1.5-1.5 2-3 1.2-3.6.5-12.7-2-17z" fill="#00684A"/></svg>`,
  kubernetes: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none"><polygon points="12 2 21 7.2 21 16.8 12 22 3 16.8 3 7.2" stroke="#326CE5" stroke-width="2" fill="rgba(50, 108, 229, 0.2)"/><circle cx="12" cy="12" r="4" fill="#326CE5"/></svg>`,
  nodejs: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none"><polygon points="12 2 21.5 7.5 21.5 18.5 12 24 2.5 18.5 2.5 7.5" fill="#339933"/><text x="12" y="15" fill="#ffffff" font-size="7" font-weight="bold" text-anchor="middle" font-family="sans-serif">NODE</text></svg>`,
  default: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" stroke-width="1.8"/><circle cx="12" cy="10" r="3" fill="#06b6d4"/></svg>`
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  fetchPortfolio();
});

// Fetch complete portfolio data from backend
async function fetchPortfolio() {
  try {
    const res = await fetch('/api/portfolio');
    if (!res.ok) throw new Error('Failed to load portfolio data');
    const json = await res.json();
    state.portfolio = json.data;
    renderAll();
  } catch (err) {
    console.error('Error loading portfolio:', err);
    showToast('Failed to connect to backend server. Ensure node server.js is running.', 'error');
  }
}

// Master Render Function
function renderAll() {
  if (!state.portfolio) return;
  const { profile, commitments, certifications, projects, achievements } = state.portfolio;

  renderHero(profile);
  renderEducation(profile?.education || []);
  renderCurrentPosition(profile?.currentPosition);
  renderCommitments(commitments || []);
  renderCertifications(certifications || []);
  renderProjects(projects || []);
  renderSkills(profile?.skills || {});
  renderAchievements(achievements || []);
  populatePositionForm(profile?.currentPosition);
}

// ============================================================================
// COMPONENT RENDERERS
// ============================================================================

// 1. Render Hero Section
function renderHero(profile) {
  if (!profile) return;

  const nameEl = document.getElementById('hero-name');
  const taglineEl = document.getElementById('hero-tagline-text');
  const bioEl = document.getElementById('hero-bio-text');
  const availEl = document.getElementById('hero-availability-text');

  if (nameEl && profile.name) nameEl.textContent = profile.name;
  if (taglineEl && profile.title) taglineEl.textContent = profile.title;
  if (bioEl && profile.tagline) bioEl.textContent = profile.tagline;
  if (availEl && profile.currentPosition?.availability) {
    availEl.textContent = profile.currentPosition.availability;
  }

  // Stats Counters
  if (profile.stats) {
    const jeeEl = document.getElementById('stat-jee');
    const cgpaEl = document.getElementById('stat-cgpa');
    const chessEl = document.getElementById('stat-chess');
    const jeeAdvEl = document.getElementById('stat-jeeadv');

    if (jeeEl) jeeEl.textContent = profile.stats.jeeMainsRank || 'AIR 896';
    if (cgpaEl) cgpaEl.textContent = profile.stats.cgpa || '8.49';
    if (chessEl) chessEl.textContent = profile.stats.chessFideRating || '1581';
    if (jeeAdvEl) jeeAdvEl.textContent = 'Top 1%';
  }
}

// 2. Render Education & Academic Pedigree
function renderEducation(educationList) {
  const container = document.getElementById('education-container');
  if (!container) return;

  if (!educationList || educationList.length === 0) {
    container.innerHTML = `<p style="grid-column:1/-1; color:var(--text-muted); text-align:center;">No education details listed.</p>`;
    return;
  }

  container.innerHTML = educationList.map(item => `
    <article class="glass-panel education-card">
      <div>
        <div class="education-header">
          <span class="education-period">${escapeHtml(item.period || '')}</span>
          <span class="education-score-badge">${escapeHtml(item.score || '')}</span>
        </div>
        <h3 class="education-title">${escapeHtml(item.institution || '')}</h3>
        <div class="education-sub">${escapeHtml(item.degree || '')}</div>
        <p class="education-details">${escapeHtml(item.details || '')}</p>
      </div>
    </article>
  `).join('');
}

// 3. Render Current Position Spotlight
function renderCurrentPosition(pos) {
  if (!pos) return;
  const roleEl = document.getElementById('display-pos-role');
  const companyEl = document.getElementById('display-pos-company');
  const focusEl = document.getElementById('display-pos-focus');
  const locEl = document.getElementById('display-pos-location');
  const statusEl = document.getElementById('display-pos-status');

  if (roleEl) roleEl.textContent = pos.role || 'Embedded System Engineer & Researcher';
  if (companyEl) {
    companyEl.innerHTML = `<span>${pos.company || ''}</span> <span class="position-period">• ${pos.period || 'Present'}</span>`;
  }
  if (focusEl) focusEl.textContent = pos.focus || '';
  if (locEl) locEl.textContent = pos.location || '';
  if (statusEl) statusEl.textContent = pos.status || 'Active';
}

// 4. Render Current Commitments & Ongoing Work
function renderCommitments(commitments) {
  const container = document.getElementById('commitments-container');
  if (!container) return;

  if (commitments.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <p>No active commitments listed. Click "Add New Commitment" to showcase what you're working on!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = commitments.map(c => {
    const progress = Math.min(100, Math.max(0, Number(c.progress) || 0));
    const deliverablesHtml = (c.deliverables && c.deliverables.length)
      ? `<ul class="deliverables-list">
          ${c.deliverables.map(d => `
            <li class="deliverable-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${escapeHtml(d)}</span>
            </li>
          `).join('')}
         </ul>`
      : '';

    const techTagsHtml = (c.techStack && c.techStack.length)
      ? `<div class="tags-row">
          ${c.techStack.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}
         </div>`
      : '';

    return `
      <article class="glass-panel commitment-card" id="${c.id}">
        <div>
          <div class="commitment-top">
            <span class="commitment-type">${escapeHtml(c.type || 'Active Initiative')}</span>
            <span class="commitment-status-chip">${escapeHtml(c.status || 'In Progress')}</span>
          </div>

          <h3 class="commitment-title">${escapeHtml(c.title)}</h3>
          <p class="commitment-desc">${escapeHtml(c.description || '')}</p>

          <div class="progress-container">
            <div class="progress-header">
              <span>Sprint Progress</span>
              <span style="color:#ffffff; font-weight:700;">${progress}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
          </div>

          ${deliverablesHtml}
        </div>

        <div>
          ${techTagsHtml}
          <div class="commitment-footer">
            <span>Target: <strong>${escapeHtml(c.target || 'Ongoing')}</strong></span>
            <div class="commitment-actions">
              <button class="btn-icon-danger" onclick="deleteCommitment('${c.id}')" title="Delete Commitment">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// 5. Render Certifications Hub
function renderCertifications(certs) {
  const container = document.getElementById('certifications-container');
  if (!container) return;

  // Filter based on category and search
  let filtered = certs.filter(c => {
    const matchesCat = state.activeCertCategory === 'all' || 
      (c.category && c.category.toLowerCase().includes(state.activeCertCategory.toLowerCase()));
    
    const query = state.certSearchTerm.toLowerCase();
    const matchesSearch = !query || 
      (c.title && c.title.toLowerCase().includes(query)) ||
      (c.issuer && c.issuer.toLowerCase().includes(query)) ||
      (c.skills && c.skills.some(s => s.toLowerCase().includes(query)));

    return matchesCat && matchesSearch;
  });

  const cardsHtml = filtered.map(c => {
    const badgeSvg = BADGE_ICONS[c.badgeIcon] || BADGE_ICONS['default'];
    const skillsHtml = (c.skills && c.skills.length)
      ? `<div class="cert-skills-wrap">
          ${c.skills.map(s => `<span class="tag-chip">${escapeHtml(s)}</span>`).join('')}
         </div>`
      : '';

    return `
      <article class="glass-panel cert-card" id="${c.id}">
        <div>
          <div class="cert-card-header">
            <div class="cert-issuer-badge">
              ${badgeSvg}
            </div>
            <div class="cert-header-meta">
              <div class="cert-category-tag">${escapeHtml(c.category || 'Certification')}</div>
              <h3 class="cert-title">${escapeHtml(c.title)}</h3>
              <div class="cert-issuer-name">${escapeHtml(c.issuer)}</div>
            </div>
          </div>

          <div class="cert-meta-info">
            <div class="cert-meta-field">
              <span class="cert-meta-label">Issued</span>
              <span class="cert-meta-val">${formatDate(c.issueDate)}</span>
            </div>
            <div class="cert-meta-field">
              <span class="cert-meta-label">Expires</span>
              <span class="cert-meta-val">${c.expiryDate || 'No Expiry'}</span>
            </div>
          </div>

          <div class="cert-id-row">
            <div>
              <span style="color:var(--text-dim); margin-right:4px;">ID:</span>
              <span class="cert-id-text mono">${escapeHtml(c.credentialId || 'Verified')}</span>
            </div>
            <button class="btn-copy-id" onclick="copyToClipboard('${c.credentialId || ''}')" title="Copy Credential ID">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </button>
          </div>

          ${skillsHtml}
        </div>

        <div class="cert-card-footer">
          <div class="cert-actions-left">
            <button class="btn-view-credential" onclick="openCertViewer('${c.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              <span>View Credential</span>
            </button>

            ${c.credentialUrl && c.credentialUrl !== '#' ? `
              <a href="${escapeHtml(c.credentialUrl)}" target="_blank" rel="noopener noreferrer" class="link-btn" title="External Verification">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ` : ''}
          </div>

          <button class="btn-icon-danger" onclick="deleteCertification('${c.id}')" title="Remove Certificate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </article>
    `;
  }).join('');

  // Append Interactive "+ Upload Card" at end of grid
  const uploadDropCardHtml = `
    <div class="upload-drop-card" onclick="openModalWithTab('tab-upload-cert')">
      <div class="upload-icon-circle">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
      <h3 class="upload-card-title">Add New Certificate</h3>
      <p class="upload-card-subtitle">Upload your credential image, PDF file, or badge details.</p>
      <button class="btn btn-secondary btn-sm" type="button">
        + Upload Credential
      </button>
    </div>
  `;

  container.innerHTML = cardsHtml + uploadDropCardHtml;
}

// 6. Render Projects Showcase
function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;

  if (projects.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); text-align: center;">No projects added yet.</p>`;
    return;
  }

  container.innerHTML = projects.map(p => {
    const techTagsHtml = (p.techStack && p.techStack.length)
      ? `<div class="tags-row" style="margin-bottom:1.25rem;">
          ${p.techStack.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}
         </div>`
      : '';

    return `
      <article class="glass-panel project-card" id="${p.id}">
        <div>
          <div class="project-category-tag">${escapeHtml(p.category || 'Data Analytics')}</div>
          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          ${p.subtitle ? `<div class="project-subtitle">${escapeHtml(p.subtitle)}</div>` : ''}
          <p class="project-desc">${escapeHtml(p.description || '')}</p>

          ${p.metrics ? `
            <div class="project-metrics-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              <span>${escapeHtml(p.metrics)}</span>
            </div>
          ` : ''}

          ${techTagsHtml}
        </div>

        <div class="project-footer">
          <div class="project-links">
            ${p.liveUrl && p.liveUrl !== '#' ? `
              <a href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener noreferrer" class="link-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                <span>Live System / Model</span>
              </a>
            ` : ''}

            ${p.githubUrl && p.githubUrl !== '#' ? `
              <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="link-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                <span>Code Repo</span>
              </a>
            ` : ''}
          </div>

          <button class="btn-icon-danger" onclick="deleteProject('${p.id}')" title="Delete Project">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// 7. Render Technical Arsenal
function renderSkills(skills) {
  const container = document.getElementById('skills-container');
  if (!container) return;

  const categories = [
    { title: 'Mathematical Foundations & Analytics', icon: '📐', items: skills.mathsAnalytics || [] },
    { title: 'Embedded Systems & Controls', icon: '🤖', items: skills.embeddedControls || [] },
    { title: 'Programming & Development Tools', icon: '💻', items: skills.programmingTools || [] }
  ];

  container.innerHTML = categories.map(cat => `
    <div class="glass-panel skill-category-card">
      <h3 class="skill-category-title">
        <span>${cat.icon}</span>
        <span>${cat.title}</span>
      </h3>
      <div class="skill-pills-wrap">
        ${cat.items.map(s => `<span class="skill-pill">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// 8. Render Achievements, Competitive Milestones & Chess
function renderAchievements(achievements) {
  const container = document.getElementById('achievements-container');
  if (!container) return;

  if (achievements.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); text-align: center;">No honors recorded yet.</p>`;
    return;
  }

  container.innerHTML = achievements.map(a => `
    <article class="glass-panel achievement-card" id="${a.id}">
      <div>
        <div class="achievement-top">
          <span style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-amber); font-weight:700;">
            ${escapeHtml(a.category || 'Honors')}
          </span>
          <span class="achievement-year">${escapeHtml(a.year || '')}</span>
        </div>
        <h3 class="achievement-title">${escapeHtml(a.title)}</h3>
        <div class="achievement-org">${escapeHtml(a.organization || '')}</div>
        <p class="achievement-desc">${escapeHtml(a.description || '')}</p>
      </div>

      <div style="display:flex; justify-content:flex-end; margin-top:1rem;">
        <button class="btn-icon-danger" onclick="deleteAchievement('${a.id}')" title="Delete Honor">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </article>
  `).join('');
}

// Pre-fill position form
function populatePositionForm(pos) {
  if (!pos) return;
  const roleIn = document.getElementById('input-pos-role');
  const compIn = document.getElementById('input-pos-company');
  const perIn = document.getElementById('input-pos-period');
  const locIn = document.getElementById('input-pos-location');
  const statIn = document.getElementById('input-pos-status');
  const focIn = document.getElementById('input-pos-focus');
  const availIn = document.getElementById('input-pos-avail');

  if (roleIn) roleIn.value = pos.role || '';
  if (compIn) compIn.value = pos.company || '';
  if (perIn) perIn.value = pos.period || '';
  if (locIn) locIn.value = pos.location || '';
  if (statIn) statIn.value = pos.status || '';
  if (focIn) focIn.value = pos.focus || '';
  if (availIn) availIn.value = pos.availability || '';
}

// ============================================================================
// MODAL CONTROLS & EVENT LISTENERS
// ============================================================================
function initEventListeners() {
  const manageModal = document.getElementById('manage-modal');
  const btnOpenManage = document.getElementById('btn-open-manage-modal');
  const btnCloseManage = document.getElementById('btn-close-manage-modal');
  const btnQuickEdit = document.getElementById('btn-quick-edit-position');
  const btnAddCommitment = document.getElementById('btn-add-commitment-trigger');
  const btnUploadCertHero = document.getElementById('btn-upload-cert-hero');
  const btnAddProject = document.getElementById('btn-add-project-trigger');
  const btnAddAch = document.getElementById('btn-add-achievement-trigger');

  // Open modal handlers
  if (btnOpenManage) btnOpenManage.addEventListener('click', () => openModalWithTab('tab-upload-cert'));
  if (btnQuickEdit) btnQuickEdit.addEventListener('click', () => openModalWithTab('tab-edit-position'));
  if (btnAddCommitment) btnAddCommitment.addEventListener('click', () => openModalWithTab('tab-add-commitment'));
  if (btnUploadCertHero) btnUploadCertHero.addEventListener('click', () => openModalWithTab('tab-upload-cert'));
  if (btnAddProject) btnAddProject.addEventListener('click', () => openModalWithTab('tab-add-project'));
  if (btnAddAch) btnAddAch.addEventListener('click', () => openModalWithTab('tab-add-achievement'));

  if (btnCloseManage) {
    btnCloseManage.addEventListener('click', () => {
      manageModal.classList.remove('active');
    });
  }

  // Close modal when clicking on backdrop
  if (manageModal) {
    manageModal.addEventListener('click', (e) => {
      if (e.target === manageModal) manageModal.classList.remove('active');
    });
  }

  // Modal Tab switching
  const tabBtns = document.querySelectorAll('.modal-tabs .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      switchModalTab(tabTarget);
    });
  });

  // Certificate Viewer Modal Close
  const certViewerModal = document.getElementById('cert-viewer-modal');
  const btnCloseViewer = document.getElementById('btn-close-cert-viewer');
  if (btnCloseViewer) {
    btnCloseViewer.addEventListener('click', () => {
      certViewerModal.classList.remove('active');
    });
  }
  if (certViewerModal) {
    certViewerModal.addEventListener('click', (e) => {
      if (e.target === certViewerModal) certViewerModal.classList.remove('active');
    });
  }

  // Cert Category Filter Buttons
  const filterBtns = document.querySelectorAll('#cert-filter-pills .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCertCategory = btn.getAttribute('data-category') || 'all';
      renderCertifications(state.portfolio?.certifications || []);
    });
  });

  // Cert Search Input
  const searchInput = document.getElementById('cert-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.certSearchTerm = e.target.value.trim();
      renderCertifications(state.portfolio?.certifications || []);
    });
  }

  // File Upload Drag-and-drop & Instant Preview
  setupFileUploadDropzone();

  // Form Submissions
  setupFormSubmissions();
}

function openModalWithTab(tabId) {
  const modal = document.getElementById('manage-modal');
  if (!modal) return;
  modal.classList.add('active');
  switchModalTab(tabId);
}

function switchModalTab(tabId) {
  const tabBtns = document.querySelectorAll('.modal-tabs .tab-btn');
  const tabPanes = document.querySelectorAll('.modal-body .tab-pane');

  tabBtns.forEach(b => {
    if (b.getAttribute('data-tab') === tabId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  tabPanes.forEach(p => {
    if (p.id === tabId) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
}

// ============================================================================
// FILE UPLOAD DROPZONE LOGIC
// ============================================================================
function setupFileUploadDropzone() {
  const dropzone = document.getElementById('cert-dropzone');
  const fileInput = document.getElementById('cert-file-input');
  const previewBox = document.getElementById('cert-file-preview');
  const previewImg = document.getElementById('cert-preview-img');
  const previewName = document.getElementById('cert-preview-name');
  const previewSize = document.getElementById('cert-preview-size');
  const btnClearFile = document.getElementById('btn-cert-clear-file');

  if (!dropzone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelected(fileInput.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  function handleFileSelected(file) {
    if (!file) return;
    previewName.textContent = file.name;
    previewSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
    previewBox.style.display = 'flex';

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      // PDF or non-image
      previewImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="%23f43f5e"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
    }
  }

  if (btnClearFile) {
    btnClearFile.addEventListener('click', () => {
      fileInput.value = '';
      previewBox.style.display = 'none';
      previewImg.src = '';
    });
  }
}

// ============================================================================
// FORM SUBMISSION HANDLERS
// ============================================================================
function setupFormSubmissions() {
  // 1. Upload Certificate Form
  const formCert = document.getElementById('form-upload-cert');
  if (formCert) {
    formCert.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-cert');
      btn.disabled = true;
      btn.textContent = 'Uploading...';

      try {
        const formData = new FormData(formCert);
        const res = await fetch('/api/certifications', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Error uploading certificate');
        }

        showToast('Certificate successfully published to portfolio!', 'success');
        formCert.reset();
        document.getElementById('cert-file-preview').style.display = 'none';
        document.getElementById('manage-modal').classList.remove('active');
        await fetchPortfolio();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Publish Certificate
        `;
      }
    });
  }

  // 2. Edit Position Form
  const formPos = document.getElementById('form-edit-position');
  if (formPos) {
    formPos.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        currentPosition: {
          role: document.getElementById('input-pos-role').value.trim(),
          company: document.getElementById('input-pos-company').value.trim(),
          period: document.getElementById('input-pos-period').value.trim(),
          location: document.getElementById('input-pos-location').value.trim(),
          status: document.getElementById('input-pos-status').value.trim(),
          focus: document.getElementById('input-pos-focus').value.trim(),
          availability: document.getElementById('input-pos-avail').value.trim()
        }
      };

      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update position');

        showToast('Current position & research focus updated!', 'success');
        document.getElementById('manage-modal').classList.remove('active');
        await fetchPortfolio();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // 3. Add Commitment Form
  const formCommitment = document.getElementById('form-add-commitment');
  if (formCommitment) {
    formCommitment.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('input-com-title').value.trim(),
        type: document.getElementById('input-com-type').value.trim(),
        status: document.getElementById('input-com-status').value.trim(),
        progress: Number(document.getElementById('input-com-progress').value) || 50,
        target: document.getElementById('input-com-target').value.trim(),
        description: document.getElementById('input-com-desc').value.trim(),
        techStack: document.getElementById('input-com-tech').value.trim(),
        deliverables: document.getElementById('input-com-deliv').value.trim()
      };

      try {
        const res = await fetch('/api/commitments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to add commitment');

        showToast('New commitment & active research added!', 'success');
        formCommitment.reset();
        document.getElementById('manage-modal').classList.remove('active');
        await fetchPortfolio();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // 4. Add Project Form
  const formProj = document.getElementById('form-add-project');
  if (formProj) {
    formProj.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formProj);

      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save project');

        showToast('Project added to showcase!', 'success');
        formProj.reset();
        document.getElementById('manage-modal').classList.remove('active');
        await fetchPortfolio();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // 5. Add Achievement Form
  const formAch = document.getElementById('form-add-achievement');
  if (formAch) {
    formAch.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('input-ach-title').value.trim(),
        category: document.getElementById('input-ach-category').value.trim(),
        organization: document.getElementById('input-ach-org').value.trim(),
        year: document.getElementById('input-ach-year').value.trim(),
        description: document.getElementById('input-ach-desc').value.trim()
      };

      try {
        const res = await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to add achievement');

        showToast('Honor & Achievement recorded!', 'success');
        formAch.reset();
        document.getElementById('manage-modal').classList.remove('active');
        await fetchPortfolio();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

// ============================================================================
// DELETE ACTIONS
// ============================================================================
window.deleteCertification = async function(id) {
  if (!confirm('Are you sure you want to remove this certification?')) return;
  try {
    const res = await fetch(`/api/certifications/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast('Certification removed', 'info');
    await fetchPortfolio();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteCommitment = async function(id) {
  if (!confirm('Are you sure you want to remove this commitment?')) return;
  try {
    const res = await fetch(`/api/commitments/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast('Commitment removed', 'info');
    await fetchPortfolio();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteProject = async function(id) {
  if (!confirm('Are you sure you want to remove this project?')) return;
  try {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast('Project removed', 'info');
    await fetchPortfolio();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteAchievement = async function(id) {
  if (!confirm('Are you sure you want to remove this achievement?')) return;
  try {
    const res = await fetch(`/api/achievements/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast('Achievement removed', 'info');
    await fetchPortfolio();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ============================================================================
// CREDENTIAL INSPECTOR & VIEWER
// ============================================================================
window.openCertViewer = function(certId) {
  const cert = state.portfolio?.certifications.find(c => c.id === certId);
  if (!cert) return;

  const modal = document.getElementById('cert-viewer-modal');
  const body = document.getElementById('cert-viewer-body');
  const title = document.getElementById('cert-viewer-title');

  title.textContent = cert.title;

  let fileContent = '';
  if (cert.fileUrl) {
    if (cert.fileUrl.endsWith('.pdf')) {
      fileContent = `
        <div style="margin: 1.5rem 0; height: 450px;">
          <iframe src="${cert.fileUrl}" style="width: 100%; height: 100%; border: 1px solid var(--border-subtle); border-radius: var(--radius-md);"></iframe>
        </div>
      `;
    } else {
      fileContent = `
        <img src="${cert.fileUrl}" alt="${escapeHtml(cert.title)}" class="cred-doc-preview">
      `;
    }
  } else {
    // Elegant authentic certificate presentation graphic
    fileContent = `
      <div class="credential-display-box">
        <div class="credential-watermark">CERTIFIED</div>
        <div class="cred-gold-seal">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
        </div>

        <div style="font-size:0.85rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--accent-cyan); font-weight:700; margin-bottom:0.5rem;">
          Verified Credential of Achievement
        </div>

        <h2 style="font-size:1.75rem; font-weight:800; color:#ffffff; margin-bottom:0.75rem;">
          ${escapeHtml(cert.title)}
        </h2>

        <p style="font-size:1rem; color:#cbd5e1; margin-bottom:1.5rem;">
          Conferred upon <strong>${escapeHtml(state.portfolio?.profile?.name || 'Aditya Gupta')}</strong> by <strong>${escapeHtml(cert.issuer)}</strong>
        </p>

        <div style="display:inline-flex; align-items:center; gap:1.5rem; padding:0.75rem 1.5rem; background:rgba(0,0,0,0.4); border-radius:var(--radius-pill); border:1px solid rgba(255,255,255,0.1); font-size:0.85rem;">
          <div>Issued: <strong style="color:#fff;">${formatDate(cert.issueDate)}</strong></div>
          <div>•</div>
          <div>Credential ID: <strong class="mono" style="color:var(--accent-cyan);">${escapeHtml(cert.credentialId)}</strong></div>
        </div>
      </div>
    `;
  }

  body.innerHTML = `
    ${fileContent}

    <div style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
      <div style="font-size:0.85rem; color:var(--text-muted);">
        Verified by <strong>${escapeHtml(cert.issuer)}</strong>
      </div>
      <div style="display:flex; gap:0.75rem;">
        ${cert.fileUrl ? `
          <a href="${cert.fileUrl}" download class="btn btn-secondary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Document
          </a>
        ` : ''}

        ${cert.credentialUrl && cert.credentialUrl !== '#' ? `
          <a href="${escapeHtml(cert.credentialUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            Verify on Official Issuer Website ↗
          </a>
        ` : ''}
      </div>
    </div>
  `;

  modal.classList.add('active');
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
window.copyToClipboard = function(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied Credential ID "${text}" to clipboard!`, 'success');
  }).catch(() => {
    showToast('Could not copy to clipboard', 'error');
  });
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : type === 'error'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <div style="flex:1;">${escapeHtml(message)}</div>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 3800);
  }, 4200);
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
