// STATE
const state = {
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
                        ${state.resume.experience.map((exp, index) => `
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
                                </div>
                                <button class="btn btn-secondary btn-small" onclick="removeArrayItem('experience', ${index})">Remove</button>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Projects -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Projects</h3>
                        <button class="btn btn-secondary btn-small" onclick="addProject()">+ Add</button>
                    </div>
                    <div id="projects-list">
                         ${state.resume.projects.map((proj, index) => `
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
                                </div>
                                <button class="btn btn-secondary btn-small" onclick="removeArrayItem('projects', ${index})">Remove</button>
                            </div>
                        `).join('')}
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
                <div class="preview-container">
                    ${getResumeHTML()}
                </div>
            </div>
        </div>
    `;
}

function renderPreviewRoute() {
    app.innerHTML = `
        <div style="max-width: 800px; margin: 40px auto;">
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

// HELPERS
function getResumeHTML() {
    const { personal, summary, education, experience, projects, skills } = state.resume;

    return `
        <div class="resume-preview">
            <h1>${personal.name || 'Your Name'}</h1>
            <div class="resume-contact-info">
                ${[personal.location, personal.phone, personal.email, personal.github, personal.linkedin].filter(Boolean).join(' | ')}
            </div>

            ${summary ? `
                <h2>Professional Summary</h2>
                <p>${summary}</p>
            ` : ''}

            ${skills ? `
                <h2>Skills</h2>
                <p>${skills}</p>
            ` : ''}

            ${experience.length > 0 ? `
                <h2>Experience</h2>
                ${experience.map(exp => `
                    <div style="margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; font-weight: 600;">
                            <span>${exp.company} - ${exp.role}</span>
                            <span>${exp.duration}</span>
                        </div>
                        <p>${exp.description}</p>
                    </div>
                `).join('')}
            ` : ''}

            ${projects.length > 0 ? `
                <h2>Projects</h2>
                ${projects.map(proj => `
                    <div style="margin-bottom: 12px;">
                         <div style="display: flex; justify-content: space-between; font-weight: 600;">
                            <span>${proj.name}</span>
                        </div>
                        <p>${proj.description} ${proj.link ? `(${proj.link})` : ''}</p>
                    </div>
                `).join('')}
            ` : ''}

            ${education.length > 0 ? `
                <h2>Education</h2>
                ${education.map(edu => `
                    <div style="display: flex; justify-content: space-between;">
                        <span><strong>${edu.institution}</strong>, ${edu.degree}</span>
                        <span>${edu.year}</span>
                    </div>
                `).join('')}
            ` : ''}
        </div>
    `;
}

// ACTIONS
window.loadSampleData = function () {
    state.resume = JSON.parse(JSON.stringify(sampleData));
    render();
};

window.updatePersonal = function (field, value) {
    state.resume.personal[field] = value;
    refreshPreview();
};

window.updateSummary = function (value) {
    state.resume.summary = value;
    refreshPreview();
};

window.updateSkills = function (value) {
    state.resume.skills = value;
    refreshPreview();
};

// ARRAY ACTIONS
window.addEducation = function () {
    state.resume.education.push({ institution: '', degree: '', year: '' });
    render(); // Re-render form to show new input
};

window.addExperience = function () {
    state.resume.experience.push({ company: '', role: '', duration: '', description: '' });
    render();
};

window.addProject = function () {
    state.resume.projects.push({ name: '', link: '', description: '' });
    render();
};

window.removeArrayItem = function (key, index) {
    state.resume[key].splice(index, 1);
    render();
};

window.updateArrayItem = function (key, index, field, value) {
    state.resume[key][index][field] = value;
    refreshPreview();
};

function refreshPreview() {
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
        previewContainer.innerHTML = getResumeHTML();
    }
}

// INIT
window.addEventListener('hashchange', render);
render();
