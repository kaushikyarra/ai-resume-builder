// APP.JS - FINAL VERSION WITH EXACT ATS SCORING

// CONSTANTS
const COLORS = [
    { name: 'Teal', value: 'hsl(168, 60%, 40%)' },
    { name: 'Navy', value: 'hsl(220, 60%, 35%)' },
    { name: 'Burgundy', value: 'hsl(345, 60%, 35%)' },
    { name: 'Forest', value: 'hsl(150, 50%, 30%)' },
    { name: 'Charcoal', value: 'hsl(0, 0%, 25%)' }
];

const TEMPLATES = [
    { id: 'classic', name: 'Classic' },
    { id: 'modern', name: 'Modern' },
    { id: 'minimal', name: 'Minimal' }
];

// STATE
const state = {
    template: 'classic',
    color: COLORS[0].value,
    resume: {
        personal: { name: '', email: '', phone: '', location: '', github: '', linkedin: '' },
        summary: '',
        education: [],
        experience: [],
        projects: [],
        skills: { technical: [], soft: [], tools: [] }
    }
};

// SAMPLE DATA
const sampleData = {
    personal: { name: 'Alex Johnson', email: 'alex.johnson@example.com', phone: '(555) 123-4567', location: 'San Francisco, CA', github: 'github.com/alexj', linkedin: 'linkedin.com/in/alexj' },
    summary: 'Senior Software Engineer with 8+ years of experience building scalable web applications. Expert in JavaScript, React, and Node.js. Passionate about clean code and user-centric design.',
    education: [{ institution: 'University of California, Berkeley', degree: 'B.S. Computer Science', year: '2016' }],
    experience: [
        { company: 'TechCorp', role: 'Senior Engineer', duration: '2020 - Present', description: 'Led a team of 5 engineers to rebuild the core product catalog. Improved load times by 40%.' },
        { company: 'StartupInc', role: 'Software Engineer', duration: '2016 - 2020', description: 'Developed full-stack features for a high-growth e-commerce platform.' }
    ],
    projects: [{ id: 1, title: 'AI Resume Builder', description: 'A web application to generate ATS-friendly resumes using AI.', techStack: ['JavaScript', 'HTML/CSS', 'LocalStorage'], liveUrl: 'https://resume.ai', githubUrl: 'github.com/alexj/resume-builder' }],
    skills: { technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'], soft: ['Leadership', 'Communication'], tools: ['Git', 'Docker', 'AWS'] }
};

// PERSISTENCE
function saveData() {
    const data = { resume: state.resume, template: state.template, color: state.color };
    localStorage.setItem('resumeBuilderData', JSON.stringify(data));
    updateScoreUI();
}

function loadData() {
    const saved = localStorage.getItem('resumeBuilderData');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.resume) {
            state.resume = parsed.resume;
            state.template = parsed.template || 'classic';
            state.color = parsed.color || COLORS[0].value;
            // Migrations
            if (typeof state.resume.skills === 'string') {
                const oldSkills = state.resume.skills.split(',').map(s => s.trim()).filter(Boolean);
                state.resume.skills = { technical: oldSkills, soft: [], tools: [] };
            }
            if (state.resume.projects.length > 0 && !state.resume.projects[0].techStack) {
                state.resume.projects = state.resume.projects.map(p => ({ ...p, id: Date.now() + Math.random(), title: p.name || '', techStack: [], liveUrl: p.link || '', githubUrl: '' }));
            }
        } else { state.resume = parsed; }

        if (!state.resume.education) state.resume.education = [];
        if (!state.resume.experience) state.resume.experience = [];
        if (!state.resume.projects) state.resume.projects = [];
        if (!state.resume.skills) state.resume.skills = { technical: [], soft: [], tools: [] };
    }
}

// GUIDANCE & ACTION VERBS
const ACTION_VERBS = ['Built', 'Developed', 'Designed', 'Implemented', 'Led', 'Improved', 'Created', 'Optimized', 'Automated', 'Managed', 'Orchestrated', 'Spearheaded', 'Launched', 'Reduced', 'Increased', 'Saved', 'Generated', 'Delivered'];

function getGuidance(text) {
    if (!text || text.trim().length === 0) return null;
    const firstWord = text.trim().split(' ')[0];
    const isActionVerb = ACTION_VERBS.some(v => v.toLowerCase() === firstWord.toLowerCase().replace(/[^a-z]/g, ''));
    if (!isActionVerb) return { type: 'warning', message: 'Start with a strong action verb (e.g., Built, Led).' };
    if (!/\d+|%/.test(text)) return { type: 'suggestion', message: 'Add measurable impact (numbers, %, $).' };
    return null;
}

// ROUTER & APP
const app = document.getElementById('app-content');
function render() {
    const route = window.location.hash || '#/';
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if (route.includes('builder')) document.getElementById('nav-builder')?.classList.add('active');
    else if (route.includes('preview')) document.getElementById('nav-preview')?.classList.add('active');
    else if (route.includes('proof')) document.getElementById('nav-proof')?.classList.add('active');

    if (route === '#/') renderHome();
    else if (route === '#/builder') renderBuilder();
    else if (route === '#/preview') renderPreviewRoute();
    else if (route === '#/proof') renderProof();
    else renderHome();
    document.documentElement.style.setProperty('--resume-accent', state.color);
}

function renderHome() {
    app.innerHTML = `
        <div class="empty-state" style="margin-top: 100px;">
            <h1 style="font-size: 48px; margin-bottom: 24px; font-family: var(--font-serif);">Build a Resume That Gets Read.</h1>
            <p class="text-large text-muted mb-lg">Professional, clean, and ATS-optimized. No distractions. <span style="font-size: 12px; color: #999; border: 1px solid #eee; padding: 2px 6px; border-radius: 4px;">v2.3</span></p>
            <a href="#/builder" class="btn btn-primary" style="padding: 16px 32px; font-size: 18px;">Start Building</a>
            <div id="toast" class="toast">PDF export ready! Check your downloads.</div>
        </div>
    `;
}

function renderBuilder() {
    const s = state.resume.skills;
    app.innerHTML = `
        <div class="builder-layout">
            <div class="builder-form">
                <div id="score-card-container"></div>
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h2 class="card__title" style="margin: 0;">Resume Details</h2>
                        <button class="btn btn-secondary btn-small" onclick="loadSampleData()">Load Sample Data</button>
                    </div>
                    
                    <h3 class="mb-sm">Personal Info</h3>
                    <div class="input-group"><label class="input-label">Full Name</label><input type="text" class="input" value="${state.resume.personal.name}" oninput="updatePersonal('name', this.value)"></div>
                    <div class="input-group"><label class="input-label">Email</label><input type="text" class="input" value="${state.resume.personal.email}" oninput="updatePersonal('email', this.value)"></div>
                    <div class="input-group"><label class="input-label">Phone</label><input type="text" class="input" value="${state.resume.personal.phone}" oninput="updatePersonal('phone', this.value)"></div>
                    <div class="input-group"><label class="input-label">Location</label><input type="text" class="input" value="${state.resume.personal.location}" oninput="updatePersonal('location', this.value)"></div>
                    <div class="input-group"><label class="input-label">GitHub</label><input type="text" class="input" value="${state.resume.personal.github}" oninput="updatePersonal('github', this.value)"></div>
                    <div class="input-group"><label class="input-label">LinkedIn</label><input type="text" class="input" value="${state.resume.personal.linkedin}" oninput="updatePersonal('linkedin', this.value)"></div>

                    <h3 class="mt-md mb-sm">Professional Summary</h3>
                    <div class="input-group"><textarea class="input" rows="4" oninput="updateSummary(this.value)">${state.resume.summary}</textarea></div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Skills</h3>
                        <button class="btn btn-secondary btn-small" id="btn-suggest-skills" onclick="suggestSkills()">✨ Suggest Skills</button>
                    </div>
                    ${renderSkillCategory('Technical Skills', 'technical', s.technical)}
                    ${renderSkillCategory('Soft Skills', 'soft', s.soft)}
                    ${renderSkillCategory('Tools & Technologies', 'tools', s.tools)}

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Projects</h3>
                        <button class="btn btn-secondary btn-small" onclick="addProject()">+ Add Project</button>
                    </div>
                    <div id="projects-list">
                         ${state.resume.projects.map((proj, index) => {
        const guidance = getGuidance(proj.description);
        return `
                            <details ${proj.title ? '' : 'open'}>
                                <summary><span>${proj.title || '(Untitled Project)'}</span><button class="btn btn-secondary btn-small" style="padding: 2px 8px;" onclick="event.preventDefault(); removeArrayItem('projects', ${index})">×</button></summary>
                                <div class="accordion-content">
                                    <div class="input-group"><label class="input-label">Title</label><input type="text" class="input" value="${proj.title}" oninput="updateArrayItem('projects', ${index}, 'title', this.value)"></div>
                                    <div class="input-group"><label class="input-label">Description <span class="char-counter" style="float: right; font-size: 11px; color: #999;">${proj.description.length}/200</span></label><textarea class="input" rows="3" maxlength="200" oninput="updateArrayItem('projects', ${index}, 'description', this.value)">${proj.description}</textarea>${guidance ? `<div class="input-guidance ${guidance.type === 'warning' ? 'warning' : ''}">${guidance.message}</div>` : ''}</div>
                                    <div class="input-group"><label class="input-label">Tech Stack</label><div class="tag-input-container" onclick="document.getElementById('proj-tech-${index}').focus()">${proj.techStack.map((tech, tIndex) => `<div class="tag-chip">${tech} <span onclick="removeProjectTech(${index}, ${tIndex})">×</span></div>`).join('')}<input type="text" id="proj-tech-${index}" class="tag-input" placeholder="Add..." onkeydown="handleProjectTechKey(event, ${index})"></div></div>
                                     <div class="input-group"><label class="input-label">Live URL</label><input type="text" class="input" value="${proj.liveUrl || ''}" oninput="updateArrayItem('projects', ${index}, 'liveUrl', this.value)"></div>
                                     <div class="input-group"><label class="input-label">GitHub URL</label><input type="text" class="input" value="${proj.githubUrl || ''}" oninput="updateArrayItem('projects', ${index}, 'githubUrl', this.value)"></div>
                                </div>
                            </details>
                        `}).join('')}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Experience</h3>
                        <button class="btn btn-secondary btn-small" onclick="addExperience()">+ Add</button>
                    </div>
                    <div id="experience-list">
                        ${state.resume.experience.map((exp, index) => {
            const guidance = getGuidance(exp.description);
            return `
                            <div class="card" style="background: #f9f9f9; padding: 16px;">
                                <div class="input-group"><label class="input-label">Company</label><input type="text" class="input" value="${exp.company}" oninput="updateArrayItem('experience', ${index}, 'company', this.value)"></div>
                                <div class="input-group"><label class="input-label">Role</label><input type="text" class="input" value="${exp.role}" oninput="updateArrayItem('experience', ${index}, 'role', this.value)"></div>
                                <div class="input-group"><label class="input-label">Duration</label><input type="text" class="input" value="${exp.duration}" oninput="updateArrayItem('experience', ${index}, 'duration', this.value)"></div>
                                <div class="input-group"><label class="input-label">Description</label><textarea class="input" rows="3" oninput="updateArrayItem('experience', ${index}, 'description', this.value)">${exp.description}</textarea>${guidance ? `<div class="input-guidance ${guidance.type === 'warning' ? 'warning' : ''}">${guidance.message}</div>` : ''}</div>
                                <button class="btn btn-secondary btn-small" onclick="removeArrayItem('experience', ${index})">Remove</button>
                            </div>
                        `}).join('')}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Education</h3>
                        <button class="btn btn-secondary btn-small" onclick="addEducation()">+ Add</button>
                    </div>
                    <div id="education-list">
                        ${state.resume.education.map((edu, index) => `<div class="card" style="background: #f9f9f9; padding: 16px;"><div class="input-group"><label class="input-label">Institution</label><input type="text" class="input" value="${edu.institution}" oninput="updateArrayItem('education', ${index}, 'institution', this.value)"></div><div class="input-group"><label class="input-label">Degree</label><input type="text" class="input" value="${edu.degree}" oninput="updateArrayItem('education', ${index}, 'degree', this.value)"></div><div class="input-group"><label class="input-label">Year</label><input type="text" class="input" value="${edu.year}" oninput="updateArrayItem('education', ${index}, 'year', this.value)"></div><button class="btn btn-secondary btn-small" onclick="removeArrayItem('education', ${index})">Remove</button></div>`).join('')}
                    </div>

                    <div id="toast" class="toast">PDF export ready! Check your downloads.</div>
                </div>
            </div>
            <div class="builder-preview">
                <div class="template-picker">${renderTemplatePicker()}</div>
                <div class="color-picker">${renderColorPicker()}</div>
                <div class="preview-container">${getResumeHTML()}</div>
            </div>
        </div>
    `;
    updateScoreUI();
}

// HELPERS (Template Picker, Color Picker, Skills)
function renderTemplatePicker() {
    return TEMPLATES.map(t => `<div class="template-card ${state.template === t.id ? 'active' : ''}" onclick="setTemplate('${t.id}')"><div class="template-preview-sketch"><div style="height: 10px; background: #ddd; margin: 10px 10px 0;"></div><div style="height: 10px; width: 60%; background: #eee; margin: 4px 10px 10px;"></div>${t.id === 'modern' ? `<div style="display:flex; height: 80px; margin: 0 10px;"><div style="width: 30%; background:#333; margin-right:4px;"></div><div style="flex:1; background:#f4f4f4;"></div></div>` : `<div style="height: 60px; background: #f9f9f9; margin: 0 10px;"></div>`}</div><div class="template-name">${t.name}</div></div>`).join('');
}
function renderColorPicker() {
    return COLORS.map(c => `<div class="color-swatch ${state.color === c.value ? 'active' : ''}" style="background: ${c.value};" onclick="setColor('${c.value}')" title="${c.name}"></div>`).join('');
}
function renderSkillCategory(label, key, items) {
    return `<div class="mb-md"><label class="input-label">${label} (${items.length})</label><div class="tag-input-container" onclick="document.getElementById('skill-${key}').focus()">${items.map((skill, index) => `<div class="tag-chip">${skill} <span onclick="removeSkill('${key}', ${index})">×</span></div>`).join('')}<input type="text" id="skill-${key}" class="tag-input" placeholder="Add..." onkeydown="handleSkillKey(event, '${key}')"></div></div>`;
}

function renderPreviewRoute() {
    app.innerHTML = `
        <div style="max-width: 800px; margin: 40px auto;">
            <div class="template-picker">${renderTemplatePicker()}</div>
             <div class="color-picker">${renderColorPicker()}</div>
            <div class="card" style="margin-bottom: 32px; padding: 20px; display: flex; gap: 16px; align-items: center; justify-content: space-between; background: #fff;">
                <div><h3 style="margin: 0 0 4px 0;">Export Your Resume</h3><p style="margin: 0; font-size: 14px; color: #666;">Save as PDF or copy text.</p></div>
                <div style="display: flex; gap: 12px;"><button class="btn btn-secondary" onclick="copyResumeToClipboard()">Copy Text</button><button class="btn btn-primary" onclick="validateAndPrint()">Print / Save PDF</button></div>
            </div>
            ${getResumeHTML()}
            <div id="toast" class="toast">PDF export ready! Check your downloads.</div>
        </div>
    `;
}
// SUBMISSION STATE
const submissionState = {
    lovableLink: '',
    githubLink: '',
    deployedLink: '',
    steps: [
        { id: 'step1', label: 'Project Setup & Structure', checked: false },
        { id: 'step2', label: 'Basic Resume Form (HTML/CSS)', checked: false },
        { id: 'step3', label: 'Live Preview Implementation', checked: false },
        { id: 'step4', label: 'PDF Export Logic', checked: false },
        { id: 'step5', label: 'Persistence (LocalStorage)', checked: false },
        { id: 'step6', label: 'ATS Scoring Algorithm', checked: false },
        { id: 'step7', label: 'Visual Customization (Themes)', checked: false },
        { id: 'step8', label: 'Final Polish & Verification', checked: false }
    ],
    checklist: [
        { id: 'check1', label: 'All form sections save to localStorage', checked: false },
        { id: 'check2', label: 'Live preview updates in real-time', checked: false },
        { id: 'check3', label: 'Template switching preserves data', checked: false },
        { id: 'check4', label: 'Color theme persists after refresh', checked: false },
        { id: 'check5', label: 'ATS score calculates correctly', checked: false },
        { id: 'check6', label: 'Score updates live on edit', checked: false },
        { id: 'check7', label: 'Export buttons work (copy/download)', checked: false },
        { id: 'check8', label: 'Empty states handled gracefully', checked: false },
        { id: 'check9', label: 'Mobile responsive layout works', checked: false },
        { id: 'check10', label: 'No console errors on any page', checked: false }
    ]
};

// LOAD SUBMISSION DATA
function loadSubmissionData() {
    const saved = localStorage.getItem('rb_final_submission');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lovableLink) submissionState.lovableLink = parsed.lovableLink;
        if (parsed.githubLink) submissionState.githubLink = parsed.githubLink;
        if (parsed.deployedLink) submissionState.deployedLink = parsed.deployedLink;

        // Restore checks if IDs match
        if (parsed.steps) {
            parsed.steps.forEach(s => {
                const existing = submissionState.steps.find(e => e.id === s.id);
                if (existing) existing.checked = s.checked;
            });
        }
        if (parsed.checklist) {
            parsed.checklist.forEach(c => {
                const existing = submissionState.checklist.find(e => e.id === c.id);
                if (existing) existing.checked = c.checked;
            });
        }
    }
}

function saveSubmissionData() {
    localStorage.setItem('rb_final_submission', JSON.stringify(submissionState));
    renderProof(); // Re-render to update status
}

function isShipped() {
    const allSteps = submissionState.steps.every(s => s.checked);
    const allChecks = submissionState.checklist.every(c => c.checked);
    const linksInfo = submissionState.lovableLink && submissionState.githubLink && submissionState.deployedLink;
    return allSteps && allChecks && linksInfo;
}

// RENDER PROOF
function renderProof() {
    const shipped = isShipped();

    app.innerHTML = `
        <div style="max-width: 800px; margin: 40px auto; padding-bottom: 80px;">
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 16px;">
                    <div>
                        <h2 class="card__title" style="margin: 0;">Proof of Work</h2>
                        <p style="margin: 4px 0 0; color: #666; font-size: 14px;">Final verification for Project 3.</p>
                    </div>
                    <div class="status-badge ${shipped ? 'shipped' : 'in-progress'}">
                        ${shipped ? '✓ Shipped' : 'In Progress'}
                    </div>
                </div>

                <!-- 1. Dev Steps -->
                <h3 style="margin-bottom: 16px; font-size: 16px;">A) Development Steps</h3>
                <div class="checklist-grid">
                    ${submissionState.steps.map((step, i) => `
                        <label class="checklist-item">
                            <input type="checkbox" onchange="toggleSubmissionCheck('steps', '${step.id}')" ${step.checked ? 'checked' : ''}>
                            <span>${i + 1}. ${step.label}</span>
                        </label>
                    `).join('')}
                </div>

                <!-- 2. Test Checklist -->
                <h3 style="margin: 32px 0 16px; font-size: 16px;">B) Verification Checklist (Required)</h3>
                <div class="checklist-grid">
                    ${submissionState.checklist.map(item => `
                        <label class="checklist-item">
                            <input type="checkbox" onchange="toggleSubmissionCheck('checklist', '${item.id}')" ${item.checked ? 'checked' : ''}>
                            <span>${item.label}</span>
                        </label>
                    `).join('')}
                </div>

                <!-- 3. Artifacts -->
                <h3 style="margin: 32px 0 16px; font-size: 16px;">C) Artifact Collection (Required)</h3>
                <div class="input-group">
                    <label class="input-label">Lovable Project Link</label>
                    <input type="text" class="input" placeholder="https://..." value="${submissionState.lovableLink}" oninput="updateSubmissionLink('lovableLink', this.value)">
                </div>
                <div class="input-group">
                    <label class="input-label">GitHub Repository Link</label>
                    <input type="text" class="input" placeholder="https://..." value="${submissionState.githubLink}" oninput="updateSubmissionLink('githubLink', this.value)">
                </div>
                <div class="input-group">
                    <label class="input-label">Deployed URL</label>
                    <input type="text" class="input" placeholder="https://..." value="${submissionState.deployedLink}" oninput="updateSubmissionLink('deployedLink', this.value)">
                </div>

                <!-- 4. Export -->
                <div style="margin-top: 40px; text-align: right; padding-top: 24px; border-top: 1px solid #eee;">
                    ${shipped ?
            `<div style="margin-bottom: 16px; color: var(--color-success); font-weight: 600;">Project 3 Shipped Successfully.</div>`
            : `<div style="margin-bottom: 16px; color: #666; font-size: 13px;">Complete all items to ship.</div>`
        }
                    <button class="btn btn-primary" onclick="copySubmission()" ${!shipped ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        Copy Final Submission
                    </button>
                    <div id="copy-message" style="margin-top: 8px; font-size: 12px; color: var(--color-success); opacity: 0; transition: opacity 0.3s;">Copied to clipboard!</div>
                </div>
            </div>
        </div>
    `;
}

// SUBMISSION HANDLERS
window.toggleSubmissionCheck = function (type, id) {
    const item = submissionState[type].find(i => i.id === id);
    if (item) {
        item.checked = !item.checked;
        saveSubmissionData();
    }
};

window.updateSubmissionLink = function (key, value) {
    submissionState[key] = value;
    saveSubmissionData();
};

window.copySubmission = function () {
    if (!isShipped()) {
        alert("Please complete all steps, checklist items, and links before submitting.");
        return;
    }

    const text = `
------------------------------------------
AI Resume Builder — Final Submission

Lovable Project: ${submissionState.lovableLink}
GitHub Repository: ${submissionState.githubLink}
Live Deployment: ${submissionState.deployedLink}

Core Capabilities:
- Structured resume builder
- Deterministic ATS scoring
- Template switching
- PDF export with clean formatting
- Persistence + validation checklist
------------------------------------------
`.trim();

    navigator.clipboard.writeText(text).then(() => {
        const msg = document.getElementById('copy-message');
        if (msg) msg.style.opacity = 1;
        setTimeout(() => { if (msg) msg.style.opacity = 0; }, 3000);
    });
};

loadSubmissionData();


// RESUME HTML GENERATOR
function getResumeHTML() {
    const { personal, summary, education, experience, projects, skills } = state.resume;
    const hasSkills = skills.technical.length > 0 || skills.soft.length > 0 || skills.tools.length > 0;
    const contactHtml = [personal.location, personal.phone, personal.email, personal.github, personal.linkedin].filter(Boolean).join(' | ');
    const skillsHtml = `${skills.technical.length > 0 ? `<div style="margin-bottom: 8px;"><strong>Technical:</strong> ${skills.technical.join(', ')}</div>` : ''}${skills.tools.length > 0 ? `<div style="margin-bottom: 8px;"><strong>Tools:</strong> ${skills.tools.join(', ')}</div>` : ''}${skills.soft.length > 0 ? `<div><strong>Soft Skills:</strong> ${skills.soft.join(', ')}</div>` : ''}`;

    const experienceHtml = experience.length > 0 ? `<div class="section-content"><h2>Experience</h2>${experience.map(exp => `<div style="margin-bottom: 12px;"><div style="display: flex; justify-content: space-between; font-weight: 600; font-family: inherit;"><span>${exp.company} - ${exp.role}</span><span>${exp.duration}</span></div><p>${exp.description}</p></div>`).join('')}</div>` : '';
    const projectsHtml = projects.length > 0 ? `<div class="section-content"><h2>Projects</h2>${projects.map(proj => `<div class="preview-project-card"><div class="preview-project-header"><span class="preview-project-title">${proj.title || 'Untitled'}</span><div class="preview-project-links">${proj.liveUrl ? `<a href="${proj.liveUrl}" target="_blank">Live Demo ↗</a>` : ''}${proj.githubUrl ? `<a href="${proj.githubUrl}" target="_blank">GitHub ↗</a>` : ''}</div></div><p style="margin-bottom: 4px;">${proj.description}</p>${proj.techStack && proj.techStack.length > 0 ? `<div class="preview-tech-stack">${proj.techStack.map(ts => `<span class="tech-badge">${ts}</span>`).join('')}</div>` : ''}</div>`).join('')}</div>` : '';
    const educationHtml = education.length > 0 ? `<div class="section-content"><h2>Education</h2>${education.map(edu => `<div style="display: flex; justify-content: space-between;"><span><strong>${edu.institution}</strong>, ${edu.degree}</span><span>${edu.year}</span></div>`).join('')}</div>` : '';

    if (state.template === 'modern') {
        return `
            <div class="resume-preview resume-template-modern-container">
                <div class="modern-sidebar">
                    <h1>${personal.name || 'Your Name'}</h1>
                    <div style="margin-top: 24px; font-size: 13px; line-height: 1.6;">${[personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean).map(i => `<div>${i}</div>`).join('')}</div>
                    ${education.length > 0 ? `<h2>Education</h2>${education.map(edu => `<div style="margin-bottom: 12px;"><div style="font-weight: 700;">${edu.degree}</div><div>${edu.institution}</div><div style="opacity: 0.8;">${edu.year}</div></div>`).join('')}` : ''}
                    ${hasSkills ? `<h2>Skills</h2>${skills.technical.length > 0 ? `<div style="margin-bottom: 8px; font-weight:700;">Technical</div><div style="margin-bottom: 12px;">${skills.technical.join(', ')}</div>` : ''}${skills.tools.length > 0 ? `<div style="margin-bottom: 8px; font-weight:700;">Tools</div><div style="margin-bottom: 12px;">${skills.tools.join(', ')}</div>` : ''}${skills.soft.length > 0 ? `<div style="margin-bottom: 8px; font-weight:700;">Soft Skills</div><div>${skills.soft.join(', ')}</div>` : ''}` : ''}
                </div>
                <div class="modern-main">${summary ? `<div class="section-content"><h2>Professional Summary</h2><p>${summary}</p></div>` : ''}${experienceHtml}${projectsHtml}</div>
            </div>`;
    }

    return `<div class="resume-preview resume-template-${state.template}"><h1>${personal.name || 'Your Name'}</h1><div class="resume-contact-info">${contactHtml}</div>${summary ? `<div class="section-content"><h2>Professional Summary</h2><p>${summary}</p></div>` : ''}${hasSkills ? `<div class="section-content"><h2>Skills</h2>${skillsHtml}</div>` : ''}${experienceHtml}${projectsHtml}${educationHtml}</div>`;
}

// EXACT ATS SCORING
function calculateScore() {
    let score = 0;
    const suggestions = [];
    const r = state.resume;

    if (r.personal.name) score += 10; else suggestions.push("Add Name (+10)");
    if (r.personal.email) score += 10; else suggestions.push("Add Email (+10)");
    if (r.summary.length > 50) score += 10; else suggestions.push("Summary > 50 chars (+10)");
    if (r.experience.length >= 1) score += 15; else suggestions.push("Add Experience (+15)");
    if (r.education.length >= 1) score += 10; else suggestions.push("Add Education (+10)");
    const totalSkills = r.skills.technical.length + r.skills.soft.length + r.skills.tools.length;
    if (totalSkills >= 5) score += 10; else suggestions.push("Add 5+ Skills (+10)");
    if (r.projects.length >= 1) score += 10; else suggestions.push("Add 1+ Project (+10)");
    if (r.personal.phone) score += 5; else suggestions.push("Add Phone (+5)");
    if (r.personal.linkedin) score += 5; else suggestions.push("Add LinkedIn (+5)");
    if (r.personal.github) score += 5; else suggestions.push("Add GitHub (+5)");

    const allText = r.summary + " " + [...r.experience.map(e => e.description), ...r.projects.map(p => p.description)].join(' ');
    const hasActionWords = ACTION_VERBS.some(v => allText.toLowerCase().includes(v.toLowerCase()));
    if (hasActionWords) score += 10; else suggestions.push("Use Action Verbs in Summary/Bullets (+10)");

    return { score: Math.min(score, 100), suggestions };
}

function updateScoreUI() {
    const container = document.getElementById('score-card-container');
    if (!container) return;
    const { score, suggestions } = calculateScore();

    // Circle Color & Status
    let color = '#ef4444'; // Red
    let statusText = 'Needs Work';
    let statusClass = 'needs-work';

    if (score >= 71) {
        color = '#10b981'; // Green
        statusText = 'Strong Resume';
        statusClass = 'strong';
    } else if (score >= 41) {
        color = '#f59e0b'; // Amber
        statusText = 'Getting There';
        statusClass = 'getting-there';
    }

    // Circumference = 2 * PI * 54 = ~339.292
    const circumference = 339.292;
    const offset = circumference - (score / 100) * circumference;

    container.innerHTML = `
        <div class="score-card">
            <div class="score-circle-container">
                <svg class="score-svg" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" class="score-circle-bg"></circle>
                    <circle cx="60" cy="60" r="54" class="score-circle-progress" style="stroke: ${color}; stroke-dashoffset: ${offset};"></circle>
                </svg>
                <div class="score-text-center">
                    <span class="score-value-large">${score}</span>
                    <span class="score-label-small">OF 100</span>
                </div>
            </div>
            <div class="score-status ${statusClass}">${statusText}</div>
            
            ${suggestions.length > 0 ? `<div style="font-size: 13px; font-weight: 600; text-align: left; margin-top: 12px; margin-bottom: 4px;">Ways to Improve:</div><div class="suggestion-list">${suggestions.slice(0, 5).map(s => `<div class="suggestion-item">${s}</div>`).join('')}</div>` : '<div style="margin-top:16px; font-size:13px; color:#059669;">Great job! Your resume is ATS optimized.</div>'}
        </div>
    `;
}

// HANDLERS (Same as before)
window.handleSkillKey = function (event, category) { if (event.key === 'Enter') { const val = event.target.value.trim(); if (val) { state.resume.skills[category].push(val); event.target.value = ''; saveData(); render(); } } };
window.removeSkill = function (category, index) { state.resume.skills[category].splice(index, 1); saveData(); render(); };
window.suggestSkills = function () { const btn = document.getElementById('btn-suggest-skills'); btn.innerText = 'Loading...'; btn.disabled = true; setTimeout(() => { const suggestions = { technical: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'], soft: ['Team Leadership', 'Problem Solving'], tools: ['Git', 'Docker', 'AWS'] }; state.resume.skills.technical = [...new Set([...state.resume.skills.technical, ...suggestions.technical])]; state.resume.skills.soft = [...new Set([...state.resume.skills.soft, ...suggestions.soft])]; state.resume.skills.tools = [...new Set([...state.resume.skills.tools, ...suggestions.tools])]; saveData(); render(); }, 1000); };
window.handleProjectTechKey = function (event, projIndex) { if (event.key === 'Enter') { const val = event.target.value.trim(); if (val) { if (!state.resume.projects[projIndex].techStack) state.resume.projects[projIndex].techStack = []; state.resume.projects[projIndex].techStack.push(val); event.target.value = ''; saveData(); render(); } } };
window.removeProjectTech = function (projIndex, techIndex) { state.resume.projects[projIndex].techStack.splice(techIndex, 1); saveData(); render(); };
window.setTemplate = function (templateName) { state.template = templateName; saveData(); render(); };
window.setColor = function (colorValue) { state.color = colorValue; saveData(); render(); };
window.loadSampleData = function () { state.resume = JSON.parse(JSON.stringify(sampleData)); saveData(); render(); };
window.updatePersonal = function (field, value) { state.resume.personal[field] = value; saveData(); refreshPreview(); };
window.updateSummary = function (value) { state.resume.summary = value; saveData(); refreshPreview(); };
window.addEducation = function () { state.resume.education.push({ institution: '', degree: '', year: '' }); saveData(); render(); };
window.addExperience = function () { state.resume.experience.push({ company: '', role: '', duration: '', description: '' }); saveData(); render(); };
window.addProject = function () { state.resume.projects.push({ id: Date.now(), title: '', description: '', techStack: [], liveUrl: '', githubUrl: '' }); saveData(); render(); };
window.removeArrayItem = function (key, index) { state.resume[key].splice(index, 1); saveData(); render(); };
window.updateArrayItem = function (key, index, field, value) { state.resume[key][index][field] = value; saveData(); if (field === 'description' || field === 'title') render(); else refreshPreview(); };
window.validateAndPrint = function () { const errors = []; if (!state.resume.personal.name) errors.push("Missing Name"); if (state.resume.experience.length === 0 && state.resume.projects.length === 0) errors.push("No Experience or Projects"); if (errors.length > 0) { if (!confirm(`Your resume looks incomplete (${errors.join(', ')}). \n\nDo you still want to export?`)) return; } const toast = document.getElementById('toast'); if (toast) { toast.classList.add('visible'); setTimeout(() => toast.classList.remove('visible'), 3000); } setTimeout(() => window.print(), 500); };
window.copyResumeToClipboard = function () { const r = state.resume; const flatSkills = [...r.skills.technical, ...r.skills.tools, ...r.skills.soft].join(', '); const flatProjects = r.projects.map(p => `${p.title} (${p.liveUrl || p.githubUrl || ''})\n${p.description}\nTech: ${p.techStack.join(', ')}`).join('\n\n'); const text = [r.personal.name.toUpperCase(), [r.personal.email, r.personal.phone, r.personal.location].filter(Boolean).join(' | '), '', 'SUMMARY', r.summary, '', 'SKILLS', flatSkills, '', 'EXPERIENCE', ...r.experience.map(e => `${e.company} - ${e.role} (${e.duration})\n${e.description}`), '', 'PROJECTS', flatProjects, '', 'EDUCATION', ...r.education.map(e => `${e.institution} - ${e.degree} (${e.year})`)].join('\n'); navigator.clipboard.writeText(text).then(() => { const btn = document.querySelector('button[onclick="copyResumeToClipboard()"]'); if (btn) { const t = btn.innerText; btn.innerText = "Copied!"; setTimeout(() => btn.innerText = t, 2000); } }); };
function refreshPreview() { const container = document.querySelector('.preview-container'); if (container) container.innerHTML = getResumeHTML(); updateScoreUI(); }
window.addEventListener('hashchange', render);
loadData();
render();
