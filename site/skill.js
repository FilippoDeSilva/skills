async function loadSkill() {
  const params = new URLSearchParams(window.location.search);
  const skillId = params.get('id');

  if (!skillId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const response = await fetch('data/skills.json');
    const skills = await response.json();
    const skill = skills.find(s => s.name === skillId);

    if (!skill) {
      document.getElementById('skill-name').textContent = 'Skill not found';
      return;
    }

    // Render metadata
    document.getElementById('skill-name').textContent = skill.name;
    document.getElementById('skill-version').textContent = `v${skill.version}`;
    document.getElementById('skill-author').textContent = skill.author;

    // Render tags
    const tagsContainer = document.getElementById('skill-tags');
    tagsContainer.innerHTML = skill.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    // Render additional metadata
    const metadataContainer = document.getElementById('skill-metadata');
    let metadataHtml = '';
    
    if (skill.license) {
      metadataHtml += `<p><strong>License:</strong> ${skill.license}</p>`;
    }
    if (skill.compatibility) {
      metadataHtml += `<p><strong>Compatibility:</strong> ${skill.compatibility}</p>`;
    }
    if (skill.path) {
      metadataHtml += `<p><strong>Path:</strong> <code>${skill.path}</code></p>`;
    }
    
    metadataContainer.innerHTML = metadataHtml || '<p>No additional metadata</p>';

    // Load and render markdown
    await loadMarkdown(skill.path);

  } catch (error) {
    console.error('Failed to load skill:', error);
    document.getElementById('skill-name').textContent = 'Error loading skill';
  }
}

async function loadMarkdown(skillPath) {
  try {
    // Fetch from GitHub raw content
    const githubRawUrl = `https://raw.githubusercontent.com/FilippoDeSilva/skills/main/${skillPath}/SKILL.md`;
    const response = await fetch(githubRawUrl);
    
    if (!response.ok) {
      throw new Error('Markdown file not found');
    }

    const markdown = await response.text();
    
    // Configure marked
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });

    const html = marked.parse(markdown);
    document.getElementById('skill-markdown').innerHTML = html;

    // Apply syntax highlighting to code blocks
    document.querySelectorAll('#skill-markdown pre code').forEach((block) => {
      hljs.highlightElement(block);
    });

  } catch (error) {
    console.error('Failed to load markdown:', error);
    document.getElementById('skill-markdown').innerHTML = `
      <p class="error">Failed to load skill content from GitHub.</p>
      <p><strong>URL attempted:</strong> https://raw.githubusercontent.com/FilippoDeSilva/skills/main/${skillPath}/SKILL.md</p>
    `;
  }
}

// Initialize
loadSkill();
