// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById('hljs-theme').href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('hljs-theme').href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
  }
}

async function loadSkill() {
  const params = new URLSearchParams(window.location.search);
  const skillId = params.get('id');

  if (!skillId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const response = await fetch('https://raw.githubusercontent.com/FilippoDeSilva/skills/main/skills-index.json');
    const skills = await response.json();
    const skill = skills.find(s => s.name === skillId);

    if (!skill) {
      document.getElementById('skill-name').textContent = 'Skill not found';
      return;
    }

    // Render metadata in sidebar
    document.getElementById('skill-name').textContent = skill.name;
    document.getElementById('skill-description').textContent = skill.description;
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
    await loadMarkdown(skill.path, skill.name);

  } catch (error) {
    console.error('Failed to load skill:', error);
    document.getElementById('skill-name').textContent = 'Error loading skill';
  }
}

async function loadMarkdown(skillPath, skillName) {
  try {
    // Fetch from GitHub raw content
    const githubRawUrl = `https://raw.githubusercontent.com/FilippoDeSilva/skills/main/${skillPath}/SKILL.md`;
    const response = await fetch(githubRawUrl);
    
    if (!response.ok) {
      throw new Error('Markdown file not found');
    }

    let fullMarkdown = await response.text();
    
    // Store full markdown for copy button
    window.fullMarkdown = fullMarkdown;
    
    // Trim YAML frontmatter for display
    let markdown = fullMarkdown;
    const startIndex = markdown.indexOf('---');
    if (startIndex === 0) {
      const endIndex = markdown.indexOf('---', startIndex + 3);
      if (endIndex !== -1) {
        markdown = markdown.substring(endIndex + 3);
        // Remove any remaining whitespace/newlines after the closing ---
        markdown = markdown.replace(/^[\r\n]+/, '');
      }
    }
    
    // Remove the first heading (title) and the paragraph that follows it (description)
    // This handles cases where the heading differs from the skill name (e.g., "Framer Motion Animator" vs "framer-motion")
    markdown = markdown.replace(/^#\s+.+\n[^\n#]+(?:\n[^\n#]+)*/m, '');
    
    // Remove redundant sections that are already in sidebar (including their content)
    // This removes the heading and all content until the next heading at same or higher level
    const sectionsToRemove = ['Description', 'Author', 'Version', 'Tags', 'License', 'Metadata', 'Compatibility'];
    sectionsToRemove.forEach(section => {
      // Match ## SectionName and all content until next ## or ###
      const sectionRegex = new RegExp(`^#{1,3}\\s+${section}\\s*\\n[\\s\\S]*?(?=\\n#{1,3}\\s|$)`, 'gim');
      markdown = markdown.replace(sectionRegex, '');
    });
    
    // Clean up empty lines after removing sections
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    markdown = markdown.trim();
    
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

    // Setup copy button
    const copyButton = document.getElementById('copy-button');
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.fullMarkdown);
        const originalHTML = copyButton.innerHTML;
        copyButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7"/>
          </svg>
          Copied!
        `;
        setTimeout(() => {
          copyButton.innerHTML = originalHTML;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
      }
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
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadSkill();
});
