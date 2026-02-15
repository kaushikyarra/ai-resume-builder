// APP.JS - FINAL VERSION WITH AUTOSAVE, SCORING, TEMPLATES, GUIDANCE, EXPORT, ADVANCED SKILLS & PROJECTS

// STATE
const state = {
    template: 'classic',
    resume: {
        personal: {
            name: '',
            email: '',
            phone: '',
            location: '',
            github: '',
            linkedin: ''
        },
        summary: '',
        education: [],
        experience: [],
        projects: [], // Array of objects { id, title, description, techStack: [], liveUrl: '', githubUrl: '' }
        skills: {
            technical: [],
            soft: [],
            tools: []
        }
    }
};

// SAMPLE DATA
// Updated to match new structure
const sampleData = {
    personal: {
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        phone: '(555) 123-4567',
        location: 'San Francisco, CA',
        github: 'github.com/alexj',
        linkedin: 'linkedin.com/in/alexj'
    },
    summary: 'Senior Software Engineer with 8+ years of experience building scalable web applications. Expert in JavaScript, React, and Node.js. Passionate about clean code and user-centric design.',
    education: [
        { institution: 'University of California, Berkeley', degree: 'B.S. Computer Science', year: '2016' }
    ],
    experience: [
        { company: 'TechCorp', role: 'Senior Engineer', duration: '2020 - Present', description: 'Led a team of 5 engineers to rebuild the core product catalog. Improved load times by 40%.' },
        { company: 'StartupInc', role: 'Software Engineer', duration: '2016 - 2020', description: 'Developed full-stack features for a high-growth e-commerce platform.' }
    ],
    projects: [
        {
            id: 1,
            title: 'AI Resume Builder',
            description: 'A web application to generate ATS-friendly resumes using AI.',
            techStack: ['JavaScript', 'HTML/CSS', 'LocalStorage'],
            liveUrl: 'https://resume.ai',
            githubUrl: 'github.com/alexj/resume-builder'
        }
    ],
    skills: {
        technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
        soft: ['Leadership', 'Communication'],
        tools: ['Git', 'Docker', 'AWS']
    }
};

// PERSISTENCE
function saveData() {
    const data = {
        resume: state.resume,
        template: state.template
    };
    localStorage.setItem('resumeBuilderData', JSON.stringify(data));
    updateScoreUI();
}

function loadData() {
    const saved = localStorage.getItem('resumeBuilderData');
    if (saved) {
        const parsed = JSON.parse(saved);

        // Handle migration
        if (parsed.resume) {
            state.resume = parsed.resume;
            state.template = parsed.template || 'classic';

            // Migrate Skills string -> object
            if (typeof state.resume.skills === 'string') {
                const oldSkills = state.resume.skills.split(',').map(s => s.trim()).filter(Boolean);
                state.resume.skills = {
                    technical: oldSkills,
                    soft: [],
                    tools: []
                };
            }

            // Migrate Projects simple object -> detailed object
            if (state.resume.projects.length > 0 && !state.resume.projects[0].techStack) {
                state.resume.projects = state.resume.projects.map(p => ({
                    ...p,
                    id: Date.now() + Math.random(),
                    title: p.name || '', // Name was old field
                    techStack: [],
                    liveUrl: p.link || '', // Link was old field
                    githubUrl: ''
                }));
            }
        } else {
            // Fallback
            state.resume = parsed;
        }

        // Ensure arrays/objects exist
        if (!state.resume.education) state.resume.education = [];
        if (!state.resume.experience) state.resume.experience = [];
        if (!state.resume.projects) state.resume.projects = [];
        if (!state.resume.skills) state.resume.skills = { technical: [], soft: [], tools: [] };
    }
}

// GUIDANCE LOGIC (Unchanged)
const ACTION_VERBS = [
    'Built', 'Developed', 'Designed', 'Implemented', 'Led', 'Improved', 'Created', 'Optimized', 'Automated', 'Managed',
    'Orchestrated', 'Spearheaded', 'Launched', 'Reduced', 'Increased', 'Saved', 'Generated', 'Delivered'
];

function getGuidance(text) {
    if (!text || text.trim().length === 0) return null;

    // Check Action Verb (First word)
    const firstWord = text.trim().split(' ')[0];
    const isActionVerb = ACTION_VERBS.some(v => v.toLowerCase() === firstWord.toLowerCase().replace(/[^a-z]/g, ''));

    if (!isActionVerb) {
        return { type: 'warning', message: 'Start with a strong action verb (e.g., Built, Led, Optimized).' };
    }

    // Check Numbers
    const hasNumbers = /\d+|%/.test(text);
    if (!hasNumbers) {
        return { type: 'suggestion', message: 'Add measurable impact (numbers, %, $).' };
    }

    return null;
}

// ROUTER & RENDERING
const app = document.getElementById('app-content');

function render() {
    const route = window.location.hash || '#/';

    // Update Nav
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if (route.includes('builder')) document.getElementById('nav-builder')?.classList.add('active');
    else if (route.includes('preview')) document.getElementById('nav-preview')?.classList.add('active');
    else if (route.includes('proof')) document.getElementById('nav-proof')?.classList.add('active');

    if (route === '#/') renderHome();
    else if (route === '#/builder') renderBuilder();
    else if (route === '#/preview') renderPreviewRoute();
    else if (route === '#/proof') renderProof();
    else renderHome();
}

function renderHome() {
    app.innerHTML = `
        <div class="empty-state" style="margin-top: 100px;">
            <h1 style="font-size: 48px; margin-bottom: 24px; font-family: var(--font-serif);">Build a Resume That Gets Read.</h1>
            <p class="text-large text-muted mb-lg">Professional, clean, and ATS-optimized. No distractions. <span style="font-size: 12px; color: #999; border: 1px solid #eee; padding: 2px 6px; border-radius: 4px;">v2.1</span></p>
            <a href="#/builder" class="btn btn-primary" style="padding: 16px 32px; font-size: 18px;">Start Building</a>
        </div>
    `;
}

function renderBuilder() {
    const s = state.resume.skills;

    app.innerHTML = `
        <div class="builder-layout">
            <!-- LEFT: FORM -->
            <div class="builder-form">
                
                <!-- SCORE CARD -->
                <div id="score-card-container"></div>

                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h2 class="card__title" style="margin: 0;">Resume Details</h2>
                        <button class="btn btn-secondary btn-small" onclick="loadSampleData()">Load Sample Data</button>
                    </div>

                    <!-- Personal Info -->
                    <h3 class="mb-sm">Personal Info</h3>
                    <div class="input-group">
                        <label class="input-label">Full Name</label>
                        <input type="text" class="input" value="${state.resume.personal.name}" oninput="updatePersonal('name', this.value)">
                    </div>
                    <!-- (Other personal fields omitted for brevity, keeping existing flow) -->
                    <div class="input-group"><label class="input-label">Email</label><input type="text" class="input" value="${state.resume.personal.email}" oninput="updatePersonal('email', this.value)"></div>
                    <div class="input-group"><label class="input-label">Phone</label><input type="text" class="input" value="${state.resume.personal.phone}" oninput="updatePersonal('phone', this.value)"></div>
                    <div class="input-group"><label class="input-label">Location</label><input type="text" class="input" value="${state.resume.personal.location}" oninput="updatePersonal('location', this.value)"></div>
                    <div class="input-group"><label class="input-label">GitHub</label><input type="text" class="input" value="${state.resume.personal.github}" oninput="updatePersonal('github', this.value)"></div>
                    <div class="input-group"><label class="input-label">LinkedIn</label><input type="text" class="input" value="${state.resume.personal.linkedin}" oninput="updatePersonal('linkedin', this.value)"></div>

                    <!-- Summary -->
                    <h3 class="mt-md mb-sm">Professional Summary</h3>
                    <div class="input-group">
                        <textarea class="input" rows="4" oninput="updateSummary(this.value)">${state.resume.summary}</textarea>
                    </div>

                    <!-- SKILLS (New) -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Skills</h3>
                        <button class="btn btn-secondary btn-small" id="btn-suggest-skills" onclick="suggestSkills()">✨ Suggest Skills</button>
                    </div>
                    
                    ${renderSkillCategory('Technical Skills', 'technical', s.technical)}
                    ${renderSkillCategory('Soft Skills', 'soft', s.soft)}
                    ${renderSkillCategory('Tools & Technologies', 'tools', s.tools)}


                    <!-- PROJECTS (New Accordion) -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Projects</h3>
                        <button class="btn btn-secondary btn-small" onclick="addProject()">+ Add Project</button>
                    </div>
                    <div id="projects-list">
                         ${state.resume.projects.map((proj, index) => {
        const guidance = getGuidance(proj.description);
        return `
                            <details ${proj.title ? '' : 'open'}>
                                <summary>
                                    <span>${proj.title || '(Untitled Project)'}</span>
                                    <button class="btn btn-secondary btn-small" style="padding: 2px 8px;" onclick="event.preventDefault(); removeArrayItem('projects', ${index})">×</button>
                                </summary>
                                <div class="accordion-content">
                                    <div class="input-group">
                                        <label class="input-label">Project Title</label>
                                        <input type="text" class="input" value="${proj.title}" oninput="updateArrayItem('projects', ${index}, 'title', this.value)">
                                    </div>
                                    <div class="input-group">
                                        <label class="input-label">Description <span class="char-counter" style="float: right; font-size: 11px; color: #999;">${proj.description.length}/200</span></label>
                                        <textarea class="input" rows="3" maxlength="200" oninput="updateArrayItem('projects', ${index}, 'description', this.value)">${proj.description}</textarea>
                                        ${guidance ? `<div class="input-guidance ${guidance.type === 'warning' ? 'warning' : ''}">${guidance.message}</div>` : ''}
                                    </div>
                                    <div class="input-group">
                                        <label class="input-label">Tech Stack (hit Enter)</label>
                                        <div class="tag-input-container" onclick="document.getElementById('proj-tech-${index}').focus()">
                                            ${proj.techStack.map((tech, tIndex) => `
                                                <div class="tag-chip">${tech} <span onclick="removeProjectTech(${index}, ${tIndex})">×</span></div>
                                            `).join('')}
                                            <input type="text" id="proj-tech-${index}" class="tag-input" placeholder="Add..." onkeydown="handleProjectTechKey(event, ${index})">
                                        </div>
                                    </div>
                                     <div class="input-group">
                                        <label class="input-label">Live URL</label>
                                        <input type="text" class="input" value="${proj.liveUrl || ''}" oninput="updateArrayItem('projects', ${index}, 'liveUrl', this.value)">
                                    </div>
                                     <div class="input-group">
                                        <label class="input-label">GitHub URL</label>
                                        <input type="text" class="input" value="${proj.githubUrl || ''}" oninput="updateArrayItem('projects', ${index}, 'githubUrl', this.value)">
                                    </div>
                                </div>
                            </details>
                        `}).join('')}
                    </div>

                    <!-- Experience (Legacy Simple) -->
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
                                <div class="input-group">
                                    <label class="input-label">Description</label>
                                    <textarea class="input" rows="3" oninput="updateArrayItem('experience', ${index}, 'description', this.value)">${exp.description}</textarea>
                                    ${guidance ? `<div class="input-guidance ${guidance.type === 'warning' ? 'warning' : ''}">${guidance.message}</div>` : ''}
                                </div>
                                <button class="btn btn-secondary btn-small" onclick="removeArrayItem('experience', ${index})">Remove</button>
                            </div>
                        `}).join('')}
                    </div>
                    
                    <!-- Education -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Education</h3>
                        <button class="btn btn-secondary btn-small" onclick="addEducation()">+ Add</button>
                    </div>
                    <div id="education-list">
                        ${state.resume.education.map((edu, index) => `
                            <div class="card" style="background: #f9f9f9; padding: 16px;">
                                <div class="input-group"><label class="input-label">Institution</label><input type="text" class="input" value="${edu.institution}" oninput="updateArrayItem('education', ${index}, 'institution', this.value)"></div>
                                <div class="input-group"><label class="input-label">Degree</label><input type="text" class="input" value="${edu.degree}" oninput="updateArrayItem('education', ${index}, 'degree', this.value)"></div>
                                <div class="input-group"><label class="input-label">Year</label><input type="text" class="input" value="${edu.year}" oninput="updateArrayItem('education', ${index}, 'year', this.value)"></div>
                                <button class="btn btn-secondary btn-small" onclick="removeArrayItem('education', ${index})">Remove</button>
                            </div>
                        `).join('')}
                    </div>

                </div>
            </div>

            <!-- RIGHT: PREVIEW -->
            <div class="builder-preview">
                <div class="template-switcher">
                    <button class="template-btn ${state.template === 'classic' ? 'active' : ''}" onclick="setTemplate('classic')">Classic</button>
                    <button class="template-btn ${state.template === 'modern' ? 'active' : ''}" onclick="setTemplate('modern')">Modern</button>
                    <button class="template-btn ${state.template === 'minimal' ? 'active' : ''}" onclick="setTemplate('minimal')">Minimal</button>
                </div>
                
                <div class="preview-container">
                    ${getResumeHTML()}
                </div>
            </div>
        </div>
    `;
    updateScoreUI();
}

function renderSkillCategory(label, key, items) {
    return `
        <div class="mb-md">
            <label class="input-label">${label} (${items.length})</label>
            <div class="tag-input-container" onclick="document.getElementById('skill-${key}').focus()">
                ${items.map((skill, index) => `
                    <div class="tag-chip">${skill} <span onclick="removeSkill('${key}', ${index})">×</span></div>
                `).join('')}
                <input type="text" id="skill-${key}" class="tag-input" placeholder="Add..." onkeydown="handleSkillKey(event, '${key}')">
            </div>
        </div>
    `;
}

function renderPreviewRoute() {
    app.innerHTML = `
        <div style="max-width: 800px; margin: 40px auto;">
            <div class="template-switcher" style="margin-bottom: 24px;">
                <button class="template-btn ${state.template === 'classic' ? 'active' : ''}" onclick="setTemplate('classic')">Classic</button>
                <button class="template-btn ${state.template === 'modern' ? 'active' : ''}" onclick="setTemplate('modern')">Modern</button>
                <button class="template-btn ${state.template === 'minimal' ? 'active' : ''}" onclick="setTemplate('minimal')">Minimal</button>
            </div>

            <!-- Export Options -->
            <div class="card" style="margin-bottom: 32px; padding: 20px; display: flex; gap: 16px; align-items: center; justify-content: space-between; background: #fff;">
                <div>
                    <h3 style="margin: 0 0 4px 0;">Export Your Resume</h3>
                    <p style="margin: 0; font-size: 14px; color: #666;">Save as PDF or copy text.</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-secondary" onclick="copyResumeToClipboard()">Copy Text</button>
                    <button class="btn btn-primary" onclick="validateAndPrint()">Print / Save PDF</button>
                </div>
            </div>

            ${getResumeHTML()}
        </div>
    `;
}

function renderProof() {
    app.innerHTML = `
        <div class="card" style="max-width: 600px; margin: 40px auto;">
            <h2 class="card__title">Proof of Work</h2>
            <p>This is where the final artifact submission would go.</p>
            <div class="empty-state">
                <div class="empty-state__title">Waiting for Completion</div>
            </div>
        </div>
    `;
}

// HELPERS
function getResumeHTML() {
    const { personal, summary, education, experience, projects, skills } = state.resume;

    // Skills HTML
    const renderSkillGroup = (title, items) => {
        if (!items || items.length === 0) return '';
        return `
            <div style="margin-bottom: 12px;">
                <span style="font-weight: 600; font-size: 14px; margin-right: 8px;">${title}:</span>
                <span style="font-size: 14px;">${items.join(', ')}</span>
            </div>
        `;
    };

    const hasSkills = skills.technical.length > 0 || skills.soft.length > 0 || skills.tools.length > 0;

    return `
        <div class="resume-preview resume-template-${state.template}">
            <h1>${personal.name || 'Your Name'}</h1>
            <div class="resume-contact-info">
                ${[personal.location, personal.phone, personal.email, personal.github, personal.linkedin].filter(Boolean).join(' | ')}
            </div>

            ${summary ? `
                <div class="section-content">
                    <h2>Professional Summary</h2>
                    <p>${summary}</p>
                </div>
            ` : ''}

            ${hasSkills ? `
                <div class="section-content">
                    <h2>Skills</h2>
                    ${renderSkillGroup('Technical', skills.technical)}
                    ${renderSkillGroup('Tools', skills.tools)}
                    ${renderSkillGroup('Soft Skills', skills.soft)}
                </div>
            ` : ''}

            ${experience.length > 0 ? `
                <div class="section-content">
                    <h2>Experience</h2>
                    ${experience.map(exp => `
                        <div style="margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; font-weight: 600; font-family: inherit;">
                                <span>${exp.company} - ${exp.role}</span>
                                <span>${exp.duration}</span>
                            </div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${projects.length > 0 ? `
                <div class="section-content">
                    <h2>Projects</h2>
                    ${projects.map(proj => `
                        <div class="preview-project-card">
                            <div class="preview-project-header">
                                <span class="preview-project-title">${proj.title || 'Untitled'}</span>
                                <div class="preview-project-links">
                                    ${proj.liveUrl ? `<a href="${proj.liveUrl}" target="_blank">Live Demo ↗</a>` : ''}
                                    ${proj.githubUrl ? `<a href="${proj.githubUrl}" target="_blank">GitHub ↗</a>` : ''}
                                </div>
                            </div>
                            <p style="margin-bottom: 4px;">${proj.description}</p>
                            ${proj.techStack && proj.techStack.length > 0 ? `
                                <div class="preview-tech-stack">
                                    ${proj.techStack.map(ts => `<span class="tech-badge">${ts}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${education.length > 0 ? `
                <div class="section-content">
                    <h2>Education</h2>
                    ${education.map(edu => `
                        <div style="display: flex; justify-content: space-between;">
                            <span><strong>${edu.institution}</strong>, ${edu.degree}</span>
                            <span>${edu.year}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// SCORING LOGIC (Updated for new structures)
function calculateScore() {
    let score = 0;
    const suggestions = [];
    const r = state.resume;

    // 1. Summary Length
    const summaryWords = r.summary.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (summaryWords >= 40 && summaryWords <= 120) score += 15;
    else suggestions.push("Expand summary (40–120 words).");

    // 2. Projects >= 2
    if (r.projects.length >= 2) score += 10;
    else suggestions.push("Add at least 2 projects.");

    // 3. Experience >= 1
    if (r.experience.length >= 1) score += 10;
    else suggestions.push("Add at least 1 work experience.");

    // 4. Skills >= 8 (Sum all categories)
    const totalSkills = r.skills.technical.length + r.skills.soft.length + r.skills.tools.length;
    if (totalSkills >= 8) score += 10;
    else suggestions.push("Add more skills (target 8+).");

    // 5. GitHub or LinkedIn
    if (r.personal.github || r.personal.linkedin) score += 10;
    else suggestions.push("Add GitHub or LinkedIn link.");

    // 6. Quantifiable Results
    const allText = [...r.experience.map(e => e.description), ...r.projects.map(p => p.description)].join(' ');
    const hasNumbers = /\d+%|\d+x|\d+k/i.test(allText);
    if (hasNumbers) score += 15;
    else suggestions.push("Add measurable impact (%, x, k) in bullets.");

    // 7. Education Completeness
    const eduComplete = r.education.length > 0 && r.education.every(e => e.institution && e.degree && e.year);
    if (eduComplete) score += 10;
    else if (r.education.length === 0) suggestions.push("Add your education details.");

    // 8. Layout
    score += 20;

    return { score: Math.min(score, 100), suggestions: suggestions.slice(0, 3) };
}

function updateScoreUI() {
    const container = document.getElementById('score-card-container');
    if (!container) return;
    const { score, suggestions } = calculateScore();
    let scoreClass = (score >= 80) ? 'good' : (score >= 50) ? 'mid' : 'low';
    container.innerHTML = `
        <div class="score-card">
            <div class="score-header"><span class="score-title">ATS Readiness Score</span><span class="score-value">${score}/100</span></div>
            <div class="score-meter"><div class="score-fill ${scoreClass}" style="width: ${score}%"></div></div>
            ${suggestions.length > 0 ? `<div style="margin-bottom: 8px; font-weight: 600; font-size: 13px; color: #444;">Top Improvements</div><ul class="suggestion-list">${suggestions.map(s => `<li class="suggestion-item">${s}</li>`).join('')}</ul>` : ''}
        </div>
    `;
}

// EVENT HANDLERS
window.handleSkillKey = function (event, category) {
    if (event.key === 'Enter') {
        const val = event.target.value.trim();
        if (val) {
            state.resume.skills[category].push(val);
            event.target.value = ''; // clear input
            saveData();
            render();
        }
    }
};

window.removeSkill = function (category, index) {
    state.resume.skills[category].splice(index, 1);
    saveData();
    render();
};

window.suggestSkills = function () {
    const btn = document.getElementById('btn-suggest-skills');
    const originalText = btn.innerText;
    btn.innerText = 'Loading...';
    btn.disabled = true;

    setTimeout(() => {
        // AI Simulation - Append unique
        const suggestions = {
            technical: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'],
            soft: ['Team Leadership', 'Problem Solving'],
            tools: ['Git', 'Docker', 'AWS']
        };

        // Merge without duplicates
        state.resume.skills.technical = [...new Set([...state.resume.skills.technical, ...suggestions.technical])];
        state.resume.skills.soft = [...new Set([...state.resume.skills.soft, ...suggestions.soft])];
        state.resume.skills.tools = [...new Set([...state.resume.skills.tools, ...suggestions.tools])];

        saveData();
        render(); // Re-render to show new skills
    }, 1000);
};

// PROJECT TECH STACK Handlers
window.handleProjectTechKey = function (event, projIndex) {
    if (event.key === 'Enter') {
        const val = event.target.value.trim();
        if (val) {
            if (!state.resume.projects[projIndex].techStack) state.resume.projects[projIndex].techStack = [];
            state.resume.projects[projIndex].techStack.push(val);
            event.target.value = '';
            saveData();
            render(); // update chips
        }
    }
};

window.removeProjectTech = function (projIndex, techIndex) {
    state.resume.projects[projIndex].techStack.splice(techIndex, 1);
    saveData();
    render();
};


// STANDARD ACTIONS
window.setTemplate = function (templateName) { state.template = templateName; saveData(); render(); };
window.loadSampleData = function () { state.resume = JSON.parse(JSON.stringify(sampleData)); saveData(); render(); };

// Simple Field Updates causing refresh
window.updatePersonal = function (field, value) { state.resume.personal[field] = value; saveData(); refreshPreview(); };
window.updateSummary = function (value) { state.resume.summary = value; saveData(); refreshPreview(); };
window.updateSkills = function (value) { /* Deprecated string handler */ };

// Array Actions
window.addEducation = function () { state.resume.education.push({ institution: '', degree: '', year: '' }); saveData(); render(); };
window.addExperience = function () { state.resume.experience.push({ company: '', role: '', duration: '', description: '' }); saveData(); render(); };
window.addProject = function () { state.resume.projects.push({ id: Date.now(), title: '', description: '', techStack: [], liveUrl: '', githubUrl: '' }); saveData(); render(); };

window.removeArrayItem = function (key, index) { state.resume[key].splice(index, 1); saveData(); render(); };

window.updateArrayItem = function (key, index, field, value) {
    state.resume[key][index][field] = value;
    saveData();
    if (field === 'description' || field === 'title') {
        // Re-render whole builder if title changes (header) or desc changes (counter)
        render();
    } else {
        refreshPreview();
    }
};

// EXPORT
window.validateAndPrint = function () {
    const errors = [];
    if (!state.resume.personal.name) errors.push("Missing Name");
    if (state.resume.experience.length === 0 && state.resume.projects.length === 0) errors.push("No Experience or Projects");
    if (errors.length > 0) { if (!confirm(`Your resume looks incomplete (${errors.join(', ')}). \n\nDo you still want to export?`)) return; }
    window.print();
};

window.copyResumeToClipboard = function () {
    const r = state.resume;
    // Flatten skills object for text copy
    const flatSkills = [
        ...r.skills.technical,
        ...r.skills.tools,
        ...r.skills.soft
    ].join(', ');

    // Flatten projects
    const flatProjects = r.projects.map(p =>
        `${p.title} (${p.liveUrl || p.githubUrl || ''})\n${p.description}\nTech: ${p.techStack.join(', ')}`
    ).join('\n\n');

    const text = [
        r.personal.name.toUpperCase(),
        [r.personal.email, r.personal.phone, r.personal.location].filter(Boolean).join(' | '),
        '',
        'SUMMARY', r.summary, '',
        'SKILLS', flatSkills, '',
        'EXPERIENCE', ...r.experience.map(e => `${e.company} - ${e.role} (${e.duration})\n${e.description}`), '',
        'PROJECTS', flatProjects, '',
        'EDUCATION', ...r.education.map(e => `${e.institution} - ${e.degree} (${e.year})`)
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('button[onclick="copyResumeToClipboard()"]');
        if (btn) { const t = btn.innerText; btn.innerText = "Copied!"; setTimeout(() => btn.innerText = t, 2000); }
    });
};

function refreshPreview() {
    const container = document.querySelector('.preview-container');
    if (container) container.innerHTML = getResumeHTML();
    updateScoreUI();
}

// INIT
window.addEventListener('hashchange', render);
loadData();
render();
