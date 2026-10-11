import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure necessary directories exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const dataFilePath = path.join(dataDir, 'portfolio.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${cleanName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'application/pdf'
    ];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPG, PNG, WEBP, SVG, and PDF files are allowed.'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static directories
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// Helper: Read portfolio data safely
function getPortfolioData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return {
        profile: {},
        commitments: [],
        certifications: [],
        projects: [],
        achievements: []
      };
    }
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading portfolio data:', err);
    return {
      profile: {},
      commitments: [],
      certifications: [],
      projects: [],
      achievements: []
    };
  }
}

// Helper: Save portfolio data safely
function savePortfolioData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving portfolio data:', err);
    return false;
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Get entire portfolio data
app.get('/api/portfolio', (req, res) => {
  const data = getPortfolioData();
  res.json({ success: true, data });
});

// Update Profile & Current Position
app.put('/api/profile', (req, res) => {
  const data = getPortfolioData();
  const { name, title, tagline, bio, currentPosition, socials, stats, skills } = req.body;

  if (name) data.profile.name = name;
  if (title) data.profile.title = title;
  if (tagline) data.profile.tagline = tagline;
  if (bio) data.profile.bio = bio;
  if (currentPosition) {
    data.profile.currentPosition = {
      ...data.profile.currentPosition,
      ...currentPosition
    };
  }
  if (socials) {
    data.profile.socials = {
      ...data.profile.socials,
      ...socials
    };
  }
  if (stats) {
    data.profile.stats = {
      ...data.profile.stats,
      ...stats
    };
  }
  if (skills) {
    data.profile.skills = {
      ...data.profile.skills,
      ...skills
    };
  }

  savePortfolioData(data);
  res.json({ success: true, message: 'Profile updated successfully', profile: data.profile });
});

// ------------------------------------------
// CERTIFICATIONS API
// ------------------------------------------

// Add a new certification (with optional document/image file upload)
app.post('/api/certifications', upload.single('certificateFile'), (req, res) => {
  try {
    const data = getPortfolioData();
    const {
      title,
      issuer,
      category,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      skills,
      badgeIcon
    } = req.body;

    if (!title || !issuer) {
      return res.status(400).json({ success: false, message: 'Title and Issuer are required.' });
    }

    let skillsList = [];
    if (typeof skills === 'string') {
      skillsList = skills.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(skills)) {
      skillsList = skills;
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.fileUrl || '');

    const newCert = {
      id: 'cert-' + Date.now(),
      title: title.trim(),
      issuer: issuer.trim(),
      category: category ? category.trim() : 'Full Stack',
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || 'No Expiration',
      credentialId: credentialId ? credentialId.trim() : 'ID-' + Math.floor(100000 + Math.random() * 900000),
      credentialUrl: credentialUrl ? credentialUrl.trim() : '#',
      fileUrl,
      badgeIcon: badgeIcon || 'default',
      skills: skillsList
    };

    if (!data.certifications) data.certifications = [];
    data.certifications.unshift(newCert); // Add at top

    // Update stats count
    if (data.profile && data.profile.stats) {
      data.profile.stats.certifications = data.certifications.length.toString();
    }

    savePortfolioData(data);
    res.status(201).json({ success: true, message: 'Certification added successfully', certificate: newCert });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error adding certification' });
  }
});

// Update certification
app.put('/api/certifications/:id', upload.single('certificateFile'), (req, res) => {
  try {
    const data = getPortfolioData();
    const certIndex = data.certifications.findIndex(c => c.id === req.params.id);

    if (certIndex === -1) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    const currentCert = data.certifications[certIndex];
    const {
      title,
      issuer,
      category,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      skills,
      badgeIcon
    } = req.body;

    let skillsList = currentCert.skills;
    if (typeof skills === 'string') {
      skillsList = skills.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(skills)) {
      skillsList = skills;
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.fileUrl || currentCert.fileUrl);

    data.certifications[certIndex] = {
      ...currentCert,
      title: title ? title.trim() : currentCert.title,
      issuer: issuer ? issuer.trim() : currentCert.issuer,
      category: category ? category.trim() : currentCert.category,
      issueDate: issueDate || currentCert.issueDate,
      expiryDate: expiryDate || currentCert.expiryDate,
      credentialId: credentialId !== undefined ? credentialId.trim() : currentCert.credentialId,
      credentialUrl: credentialUrl !== undefined ? credentialUrl.trim() : currentCert.credentialUrl,
      fileUrl,
      badgeIcon: badgeIcon || currentCert.badgeIcon,
      skills: skillsList
    };

    savePortfolioData(data);
    res.json({ success: true, message: 'Certification updated', certificate: data.certifications[certIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete certification
app.delete('/api/certifications/:id', (req, res) => {
  const data = getPortfolioData();
  const certToDelete = data.certifications.find(c => c.id === req.params.id);

  if (!certToDelete) {
    return res.status(404).json({ success: false, message: 'Certification not found' });
  }

  // If local uploaded file, delete it cleanly
  if (certToDelete.fileUrl && certToDelete.fileUrl.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, certToDelete.fileUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not remove file:', filePath, err.message);
      }
    }
  }

  data.certifications = data.certifications.filter(c => c.id !== req.params.id);

  if (data.profile && data.profile.stats) {
    data.profile.stats.certifications = data.certifications.length.toString();
  }

  savePortfolioData(data);
  res.json({ success: true, message: 'Certification deleted successfully' });
});

// ------------------------------------------
// COMMITMENTS & CURRENT WORK API
// ------------------------------------------

// Add Commitment
app.post('/api/commitments', (req, res) => {
  try {
    const data = getPortfolioData();
    const { title, type, status, progress, target, description, techStack, deliverables } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Commitment title is required.' });
    }

    let stackList = [];
    if (typeof techStack === 'string') {
      stackList = techStack.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(techStack)) {
      stackList = techStack;
    }

    let delivList = [];
    if (typeof deliverables === 'string') {
      delivList = deliverables.split('\n').map(d => d.trim()).filter(Boolean);
    } else if (Array.isArray(deliverables)) {
      delivList = deliverables;
    }

    const newCommitment = {
      id: 'commit-' + Date.now(),
      title: title.trim(),
      type: type ? type.trim() : 'Active Build',
      status: status ? status.trim() : 'In Active Development',
      progress: Number(progress) || 50,
      target: target ? target.trim() : 'Ongoing',
      description: description ? description.trim() : '',
      techStack: stackList,
      deliverables: delivList
    };

    if (!data.commitments) data.commitments = [];
    data.commitments.unshift(newCommitment);

    savePortfolioData(data);
    res.status(201).json({ success: true, message: 'Commitment added successfully', commitment: newCommitment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Commitment
app.put('/api/commitments/:id', (req, res) => {
  const data = getPortfolioData();
  const index = data.commitments.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Commitment not found' });
  }

  const current = data.commitments[index];
  const { title, type, status, progress, target, description, techStack, deliverables } = req.body;

  let stackList = current.techStack;
  if (typeof techStack === 'string') {
    stackList = techStack.split(',').map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(techStack)) {
    stackList = techStack;
  }

  let delivList = current.deliverables;
  if (typeof deliverables === 'string') {
    delivList = deliverables.split('\n').map(d => d.trim()).filter(Boolean);
  } else if (Array.isArray(deliverables)) {
    delivList = deliverables;
  }

  data.commitments[index] = {
    ...current,
    title: title ? title.trim() : current.title,
    type: type ? type.trim() : current.type,
    status: status ? status.trim() : current.status,
    progress: progress !== undefined ? Number(progress) : current.progress,
    target: target ? target.trim() : current.target,
    description: description !== undefined ? description.trim() : current.description,
    techStack: stackList,
    deliverables: delivList
  };

  savePortfolioData(data);
  res.json({ success: true, message: 'Commitment updated', commitment: data.commitments[index] });
});

// Delete Commitment
app.delete('/api/commitments/:id', (req, res) => {
  const data = getPortfolioData();
  data.commitments = data.commitments.filter(c => c.id !== req.params.id);
  savePortfolioData(data);
  res.json({ success: true, message: 'Commitment removed' });
});

// ------------------------------------------
// PROJECTS API
// ------------------------------------------

// Add project (with optional image upload)
app.post('/api/projects', upload.single('projectImage'), (req, res) => {
  try {
    const data = getPortfolioData();
    const { title, subtitle, description, category, techStack, metrics, liveUrl, githubUrl, featured } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    let stackList = [];
    if (typeof techStack === 'string') {
      stackList = techStack.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(techStack)) {
      stackList = techStack;
    }

    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || '');

    const newProject = {
      id: 'proj-' + Date.now(),
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      description: description ? description.trim() : '',
      category: category ? category.trim() : 'Full Stack',
      techStack: stackList,
      metrics: metrics ? metrics.trim() : '',
      liveUrl: liveUrl ? liveUrl.trim() : '#',
      githubUrl: githubUrl ? githubUrl.trim() : '#',
      featured: featured === 'true' || featured === true,
      image
    };

    if (!data.projects) data.projects = [];
    data.projects.unshift(newProject);

    if (data.profile && data.profile.stats) {
      data.profile.stats.projectsDelivered = data.projects.length.toString();
    }

    savePortfolioData(data);
    res.status(201).json({ success: true, message: 'Project added successfully', project: newProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  const data = getPortfolioData();
  data.projects = data.projects.filter(p => p.id !== req.params.id);
  if (data.profile && data.profile.stats) {
    data.profile.stats.projectsDelivered = data.projects.length.toString();
  }
  savePortfolioData(data);
  res.json({ success: true, message: 'Project deleted' });
});

// ------------------------------------------
// ACHIEVEMENTS API
// ------------------------------------------

// Add achievement
app.post('/api/achievements', (req, res) => {
  try {
    const data = getPortfolioData();
    const { title, category, organization, year, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const newAch = {
      id: 'ach-' + Date.now(),
      title: title.trim(),
      category: category ? category.trim() : 'Honors & Recognition',
      organization: organization ? organization.trim() : '',
      year: year ? year.trim() : new Date().getFullYear().toString(),
      description: description ? description.trim() : ''
    };

    if (!data.achievements) data.achievements = [];
    data.achievements.unshift(newAch);

    savePortfolioData(data);
    res.status(201).json({ success: true, message: 'Achievement added', achievement: newAch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete achievement
app.delete('/api/achievements/:id', (req, res) => {
  const data = getPortfolioData();
  data.achievements = data.achievements.filter(a => a.id !== req.params.id);
  savePortfolioData(data);
  res.json({ success: true, message: 'Achievement deleted' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Aditya Gupta's Portfolio Server running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📁 Uploads available at http://localhost:${PORT}/uploads/`);
  console.log(`===============================================`);
});
