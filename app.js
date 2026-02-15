// APP.JS - FINAL VERSION WITH AUTOSAVE, SCORING, TEMPLATES, AND GUIDANCE

// STATE
const state = {
    template: 'classic', // classic, modern, minimal
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
        projects: [],
        skills: ''
    }
};

// SAMPLE DATA
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
        { name: 'AI Resume Builder', description: 'A web application to generate ATS-friendly resumes using AI.', link: 'github.com/alexj/resume-builder' }
    ],
    skills: 'JavaScript, TypeScript, React, Node.js, Python, AWS, Docker'
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
        // Handle migration from old format where root was generic
        if (parsed.resume) {
            state.resume = parsed.resume;
            state.template = parsed.template || 'classic';
        } else {
            // Fallback for previous version compat
            state.resume = parsed;
        }

        // Ensure arrays exist if loading from old data
        if (!state.resume.education) state.resume.education = [];
        if (!state.resume.experience) state.resume.experience = [];
        if (!state.resume.projects) state.resume.projects = [];
    }
}

// GUIDANCE LOGIC
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

    if (route === '#/') {
        renderHome();
    } else if (route === '#/builder') {
        renderBuilder();
    } else if (route === '#/preview') {
        renderPreviewRoute();
    } else if (route === '#/proof') {
        renderProof();
    } else {
        renderHome();
    }
}

function renderHome() {
    app.innerHTML = `
        <div class="empty-state" style="margin-top: 100px;">
            <h1 style="font-size: 48px; margin-bottom: 24px; font-family: var(--font-serif);">Build a Resume That Gets Read.</h1>
            <p class="text-large text-muted mb-lg">Professional, clean, and ATS-optimized. No distractions.</p>
            <a href="#/builder" class="btn btn-primary" style="padding: 16px 32px; font-size: 18px;">Start Building</a>
        </div>
    `;
}

function renderBuilder() {
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
                    <div class="input-group">
                        <label class="input-label">Email</label>
                        <input type="text" class="input" value="${state.resume.personal.email}" oninput="updatePersonal('email', this.value)">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Phone</label>
                        <input type="text" class="input" value="${state.resume.personal.phone}" oninput="updatePersonal('phone', this.value)">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Location</label>
                        <input type="text" class="input" value="${state.resume.personal.location}" oninput="updatePersonal('location', this.value)">
                    </div>
                     <div class="input-group">
                        <label class="input-label">GitHub</label>
                        <input type="text" class="input" value="${state.resume.personal.github}" oninput="updatePersonal('github', this.value)">
                    </div>
                     <div class="input-group">
                        <label class="input-label">LinkedIn</label>
                        <input type="text" class="input" value="${state.resume.personal.linkedin}" oninput="updatePersonal('linkedin', this.value)">
                    </div>

                    <!-- Summary -->
                    <h3 class="mt-md mb-sm">Professional Summary</h3>
                    <div class="input-group">
                        <textarea class="input" rows="4" oninput="updateSummary(this.value)">${state.resume.summary}</textarea>
                    </div>

                    <!-- Education -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Education</h3>
                        <button class="btn btn-secondary btn-small" onclick="addEducation()">+ Add</button>
                    </div>
                    <div id="education-list">
                        ${state.resume.education.map((edu, index) => `
                            <div class="card" style="background: #f9f9f9; padding: 16px;">
                                <div class="input-group">
                                    <label class="input-label">Institution</label>
                                    <input type="text" class="input" value="${edu.institution}" oninput="updateArrayItem('education', ${index}, 'institution', this.value)">
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Degree</label>
                                    <input type="text" class="input" value="${edu.degree}" oninput="updateArrayItem('education', ${index}, 'degree', this.value)">
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Year</label>
                                    <input type="text" class="input" value="${edu.year}" oninput="updateArrayItem('education', ${index}, 'year', this.value)">
                                </div>
                                <button class="btn btn-secondary btn-small" onclick="removeArrayItem('education', ${index})">Remove</button>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Experience -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Experience</h3>
                        <button class="btn btn-secondary btn-small" onclick="addExperience()">+ Add</button>
                    </div>
                    <div id="experience-list">
                        ${state.resume.experience.map((exp, index) => {
        const guidance = getGuidance(exp.description);
        return `
                            <div class="card" style="background: #f9f9f9; padding: 16px;">
                                <div class="input-group">
                                    <label class="input-label">Company</label>
                                    <input type="text" class="input" value="${exp.company}" oninput="updateArrayItem('experience', ${index}, 'company', this.value)">
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Role</label>
                                    <input type="text" class="input" value="${exp.role}" oninput="updateArrayItem('experience', ${index}, 'role', this.value)">
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Duration</label>
                                    <input type="text" class="input" value="${exp.duration}" oninput="updateArrayItem('experience', ${index}, 'duration', this.value)">
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Description</label>
                                    <textarea class="input" rows="3" oninput="updateArrayItem('experience', ${index}, 'description', this.value)">${exp.description}</textarea>
                                    ${guidance ? `<div class="input-guidance ${guidance.type === 'warning' ? 'warning' : ''}">${guidance.message}</div>` : ''}
                                </div>
                                <button class="btn btn-secondary btn-small" onclick="removeArrayItem('experience', ${index})">Remove</button>
                            </div>
                        `}).join('')}
                    </div>

                    <!-- Projects -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Projects</h3>
                        <button class="btn btn-secondary btn-small" onclick="addProject()">+ Add</button>
                    </div>
                    <div id="projects-list">
                         ${state.resume.projects.map((proj, index) => {
            const guidance = getGuidance(proj.description);
            return `
                            <div class="card" style="background: #f9f9f9; padding: 16px;">
                                <div class="input-group">
                                    <label class="input-label">Name</label>
                                    <input type="text" class="input" value="${proj.name}" oninput="updateArrayItem('projects', ${index}, 'name', this.value)">
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Link</label>
                                    <input type="text" class="input" value="${proj.link}" oninput="updateArrayItem('projects', ${index}, 'link', this.value)">
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Description</label>
                                    <textarea class="input" rows="3" oninput="updateArrayItem('projects', ${index}, 'description', this.value)">${proj.description}</textarea>
                                    ${guidance ? `<div class="input-guidance ${guidance.type === 'warning' ? 'warning' : ''}">${guidance.message}</div>` : ''}
                                </div>
                                <button class="btn btn-secondary btn-small" onclick="removeArrayItem('projects', ${index})">Remove</button>
                            </div>
                        `}).join('')}
                    </div>

                    <!-- Skills -->
                    <h3 class="mt-md mb-sm">Skills</h3>
                    <div class="input-group">
                        <input type="text" class="input" value="${state.resume.skills}" oninput="updateSkills(this.value)" placeholder="Comma separated...">
                    </div>
                </div>
            </div>

            <!-- RIGHT: PREVIEW -->
            <div class="builder-preview">
                <!-- Template Switcher -->
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

function renderPreviewRoute() {
    app.innerHTML = `
        <div style="max-width: 800px; margin: 40px auto;">
            <div class="template-switcher" style="margin-bottom: 40px;">
                <button class="template-btn ${state.template === 'classic' ? 'active' : ''}" onclick="setTemplate('classic')">Classic</button>
                <button class="template-btn ${state.template === 'modern' ? 'active' : ''}" onclick="setTemplate('modern')">Modern</button>
                <button class="template-btn ${state.template === 'minimal' ? 'active' : ''}" onclick="setTemplate('minimal')">Minimal</button>
            </div>
            ${getResumeHTML()}
            <div class="text-center mt-lg">
                <button class="btn btn-primary" onclick="window.print()">Print / Save PDF</button>
            </div>
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

// SCORING LOGIC
function calculateScore() {
    let score = 0;
    const suggestions = [];
    const r = state.resume;

    // 1. Summary Length (40-120 words)
    const summaryWords = r.summary.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (summaryWords >= 40 && summaryWords <= 120) {
        score += 15;
    } else {
        suggestions.push("Expand summary (40–120 words).");
    }

    // 2. Projects >= 2
    if (r.projects.length >= 2) {
        score += 10;
    } else {
        suggestions.push("Add at least 2 projects.");
    }

    // 3. Experience >= 1
    if (r.experience.length >= 1) {
        score += 10;
    } else {
        suggestions.push("Add at least 1 work experience.");
    }

    // 4. Skills >= 8
    const skillList = r.skills.split(',').filter(s => s.trim().length > 0);
    if (skillList.length >= 8) {
        score += 10;
    } else {
        suggestions.push("Add more skills (target 8+).");
    }

    // 5. GitHub or LinkedIn
    if (r.personal.github || r.personal.linkedin) {
        score += 10;
    } else {
        suggestions.push("Add GitHub or LinkedIn link.");
    }

    // 6. Quantifiable Results
    const allText = [...r.experience.map(e => e.description), ...r.projects.map(p => p.description)].join(' ');
    const hasNumbers = /\d+%|\d+x|\d+k/i.test(allText);
    if (hasNumbers) {
        score += 15;
    } else {
        suggestions.push("Add measurable impact (%, x, k) in bullets.");
    }

    // 7. Education Completeness
    const eduComplete = r.education.length > 0 && r.education.every(e => e.institution && e.degree && e.year);
    if (eduComplete) {
        score += 10;
    } else if (r.education.length === 0) {
        suggestions.push("Add your education details.");
    }

    // 8. Layout/Base
    score += 20;

    return { score: Math.min(score, 100), suggestions: suggestions.slice(0, 3) };
}

function updateScoreUI() {
    const container = document.getElementById('score-card-container');
    if (!container) return;

    const { score, suggestions } = calculateScore();
    let scoreClass = 'low';
    if (score >= 80) scoreClass = 'good';
    else if (score >= 50) scoreClass = 'mid';

    container.innerHTML = `
        <div class="score-card">
            <div class="score-header">
                <span class="score-title">ATS Readiness Score</span>
                <span class="score-value">${score}/100</span>
            </div>
            <div class="score-meter">
                <div class="score-fill ${scoreClass}" style="width: ${score}%"></div>
            </div>
            ${suggestions.length > 0 ? `
                <div style="margin-bottom: 8px; font-weight: 600; font-size: 13px; color: #444;">Top Improvements</div>
                <ul class="suggestion-list">
                    ${suggestions.map(s => `<li class="suggestion-item">${s}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    `;
}


// HELPERS
function getResumeHTML() {
    const { personal, summary, education, experience, projects, skills } = state.resume;

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

            ${skills ? `
                <div class="section-content">
                    <h2>Skills</h2>
                    <p>${skills}</p>
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
                        <div style="margin-bottom: 12px;">
                             <div style="display: flex; justify-content: space-between; font-weight: 600; font-family: inherit;">
                                <span>${proj.name}</span>
                            </div>
                            <p>${proj.description} ${proj.link ? `(${proj.link})` : ''}</p>
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

// ACTIONS
window.setTemplate = function (templateName) {
    state.template = templateName;
    saveData();
    render(); // Re-render to update UI state
};

window.loadSampleData = function () {
    state.resume = JSON.parse(JSON.stringify(sampleData));
    saveData();
    render();
};

window.updatePersonal = function (field, value) {
    state.resume.personal[field] = value;
    saveData();
    refreshPreview();
};

window.updateSummary = function (value) {
    state.resume.summary = value;
    saveData();
    refreshPreview();
};

window.updateSkills = function (value) {
    state.resume.skills = value;
    saveData();
    refreshPreview();
};

// ARRAY ACTIONS
window.addEducation = function () {
    state.resume.education.push({ institution: '', degree: '', year: '' });
    saveData();
    render();
};

window.addExperience = function () {
    state.resume.experience.push({ company: '', role: '', duration: '', description: '' });
    saveData();
    render();
};

window.addProject = function () {
    state.resume.projects.push({ name: '', link: '', description: '' });
    saveData();
    render();
};

window.removeArrayItem = function (key, index) {
    state.resume[key].splice(index, 1);
    saveData();
    render();
};

window.updateArrayItem = function (key, index, field, value) {
    state.resume[key][index][field] = value;
    saveData();
    // Render whole list if we need to update guidance UI (textareas)
    if (field === 'description') {
        render();
    } else {
        refreshPreview();
    }
};

function refreshPreview() {
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
        previewContainer.innerHTML = getResumeHTML();
    }
    updateScoreUI();
}

// INIT
window.addEventListener('hashchange', render);
loadData();
render();
