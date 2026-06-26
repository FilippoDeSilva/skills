let skills = [];
let fuse = null;

async function loadSkills() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/FilippoDeSilva/skills/main/skills-index.json');
    skills = await response.json();
    
    // Initialize Fuse.js for search
    fuse = new Fuse(skills, {
      keys: ['name', 'description', 'tags'],
      threshold: 0.3,
      includeScore: true
    });

    updateStats();
    createFilters();
    renderSkills(skills);
  } catch (error) {
    console.error('Failed to load skills:', error);
    document.getElementById('skills-grid').innerHTML = '<p class="error">Failed to load skills data from GitHub.</p>';
  }
}

function updateStats() {
  document.getElementById('skill-count').textContent = `${skills.length} Skills`;
  
  const categories = new Set();
  skills.forEach(skill => {
    skill.tags.forEach(tag => categories.add(tag));
  });
  document.getElementById('category-count').textContent = `${categories.size} Categories`;
  
  const now = new Date();
  document.getElementById('last-updated').textContent = `Generated ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function createFilters() {
  const categories = new Set();
  skills.forEach(skill => {
    skill.tags.forEach(tag => categories.add(tag));
  });

  const filtersContainer = document.querySelector('.filters');
  filtersContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All</button>';

  Array.from(categories).sort().forEach(category => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = category;
    btn.dataset.filter = category;
    filtersContainer.appendChild(btn);
  });

  filtersContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      const filter = e.target.dataset.filter;
      if (filter === 'all') {
        renderSkills(skills);
      } else {
        const filtered = skills.filter(skill => skill.tags.includes(filter));
        renderSkills(filtered);
      }
    }
  });
}

function renderSkills(skillsToRender) {
  const grid = document.getElementById('skills-grid');
  
  if (skillsToRender.length === 0) {
    grid.innerHTML = '<p class="no-results">No skills found matching your search.</p>';
    return;
  }

  grid.innerHTML = skillsToRender.map(skill => `
    <a href="skill.html?id=${encodeURIComponent(skill.name)}" class="skill-card">
      <div class="skill-header">
        <div class="skill-name">${skill.name}</div>
        <div class="skill-version">v${skill.version}</div>
      </div>
      <div class="skill-author">${skill.author}</div>
      <div class="skill-description">${skill.description}</div>
      <div class="tags">
        ${skill.tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
        ${skill.tags.length > 4 ? `<span class="tag">+${skill.tags.length - 4}</span>` : ''}
      </div>
    </a>
  `).join('');
}

// Search functionality
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  
  if (!query) {
    renderSkills(skills);
    return;
  }

  const results = fuse.search(query);
  renderSkills(results.map(result => result.item));
});

// Initialize
loadSkills();
