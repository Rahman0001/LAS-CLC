import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import {
  getPublicContent,
  getAllAdminData,
  authenticateAdmin,
  verifySession,
  logoutSession,
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  updateSettings,
  createNotification,
  updateNotification,
  deleteNotification,
  createReport,
  updateReport,
  deleteReport,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  createActivity,
  updateActivity,
  deleteActivity,
  createGalleryItem,
  deleteGalleryItem,
  createTimelineItem,
  deleteTimelineItem,
  addContactSubmission,
  updateContactSubmission,
  deleteContactSubmission,
  updateAdminPassword,
  getBlogs,
  getBlogById,
  getBlogByIdOrSlug,
  incrementBlogViews,
  createBlog,
  updateBlog,
  deleteBlog,
  createClinicAppointment,
  getClinicAppointmentByToken,
  getAllClinicAppointments,
  updateClinicAppointment,
  deleteClinicAppointment,
  createAawazSubmission,
  getAawazSubmissionByToken,
  getAllAawazSubmissions,
  updateAawazSubmission,
  deleteAawazSubmission
} from './server/db';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup uploads directory
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for documents and images
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${uniqueSuffix}-${cleanName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload PDF, Word document, or image file.'));
    }
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  adminEmail?: string;
  adminRole?: string;
}

function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization token' });
  }

  const token = authHeader.substring(7);
  const session = verifySession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  req.adminEmail = session.adminEmail;
  req.adminRole = session.role;
  next();
}

// Public API: Content
app.get('/api/content', (_req: Request, res: Response) => {
  try {
    const content = getPublicContent();
    res.json(content);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve portal content' });
  }
});

// Public Search Endpoint
app.get('/api/search', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').trim().toLowerCase();
  if (!q) {
    return res.json({ results: [] });
  }

  const content = getPublicContent();
  const results: Array<{
    id: string;
    type: 'Notification' | 'Report' | 'Activity' | 'Resource' | 'Team' | 'AAWAZ Blog';
    title: string;
    category?: string;
    date?: string;
    snippet: string;
    link: string;
  }> = [];

  // Search Notifications
  content.notifications.forEach(n => {
    if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.shortDescription.toLowerCase().includes(q)) {
      results.push({
        id: n.id,
        type: 'Notification',
        title: n.title,
        category: n.category,
        date: n.date,
        snippet: n.shortDescription || n.content.substring(0, 150),
        link: `/notifications?id=${n.id}`
      });
    }
  });

  // Search Reports
  content.reports.forEach(r => {
    if (r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)) {
      results.push({
        id: r.id,
        type: 'Report',
        title: r.title,
        category: `${r.academicYear} | ${r.category}`,
        date: r.calendarYear,
        snippet: r.description.substring(0, 150),
        link: `/reports?id=${r.id}`
      });
    }
  });

  // Search Activities
  content.activities.forEach(a => {
    if (a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)) {
      results.push({
        id: a.id,
        type: 'Activity',
        title: a.title,
        category: a.category,
        date: a.date,
        snippet: a.description.substring(0, 150),
        link: `/activities`
      });
    }
  });

  // Search Resources
  content.resources.forEach(resItem => {
    if (resItem.title.toLowerCase().includes(q) || resItem.summary.toLowerCase().includes(q) || resItem.keyPoints.some(k => k.toLowerCase().includes(q))) {
      results.push({
        id: resItem.id,
        type: 'Resource',
        title: resItem.title,
        category: resItem.category,
        snippet: resItem.summary.substring(0, 150),
        link: `/resources`
      });
    }
  });

  // Search AAWAZ Blogs
  (content.blogs || []).forEach(blog => {
    if (
      blog.title.toLowerCase().includes(q) ||
      blog.excerpt.toLowerCase().includes(q) ||
      blog.content.toLowerCase().includes(q) ||
      blog.author.toLowerCase().includes(q) ||
      (blog.tags && blog.tags.some(t => t.toLowerCase().includes(q)))
    ) {
      results.push({
        id: blog.id,
        type: 'AAWAZ Blog',
        title: blog.title,
        category: blog.category,
        date: blog.date,
        snippet: blog.excerpt || blog.content.substring(0, 150),
        link: `/aawaz?id=${blog.id}`
      });
    }
  });

  res.json({ results: results.slice(0, 20) });
});

// Public Blogs Endpoints
app.get('/api/blogs', (_req: Request, res: Response) => {
  const blogs = getBlogs(false);
  res.json({ blogs });
});

app.get('/api/blogs/:id', (req: Request, res: Response) => {
  const blog = getBlogById(req.params.id);
  if (!blog) {
    return res.status(404).json({ error: 'Blog article not found' });
  }
  incrementBlogViews(blog.id);
  res.json(blog);
});

// Public Contact Form Submission (with rate limiting and spam check)
app.post('/api/contact', (req: Request, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`contact-${ip}`)) {
    return res.status(429).json({ error: 'Too many submissions from this connection. Please wait 15 minutes before submitting again.' });
  }

  const { name, email, phone, category, subject, message, honeypot } = req.body;

  // Spam honeypot detection
  if (honeypot) {
    return res.status(400).json({ error: 'Submission rejected.' });
  }

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Please provide all required fields: Name, Email, Subject, and Message.' });
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid institutional or personal email address.' });
  }

  if (message.length > 3000) {
    return res.status(400).json({ error: 'Message exceeds maximum permitted length (3000 characters).' });
  }

  const submission = addContactSubmission({
    name,
    email,
    phone,
    category: category || 'General Query',
    subject,
    message
  });

  recordFailedAttempt(`contact-${ip}`);
  res.status(201).json({
    success: true,
    message: 'Your inquiry has been securely recorded by the Legal Aid Society office. Our student coordinator will review your communication.',
    id: submission.id
  });
});

// Public: Clinic Consultation Appointment Request
app.post('/api/clinic/appointments', (req: Request, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`clinic-appt-${ip}`)) {
    return res.status(429).json({ error: 'Too many consultation requests from this connection. Please wait 15 minutes.' });
  }

  const {
    fullName,
    isRepresentative,
    representativeName,
    relationshipToLitigant,
    phone,
    email,
    address,
    district,
    consultationMode,
    preferredDate,
    preferredTimeSlot,
    legalDomain,
    caseDescription,
    hasExistingCourtCase,
    courtCaseDetails,
    qualifiesUnderSection12,
    section12Category,
    documentsSummary,
    honeypot
  } = req.body;

  if (honeypot) {
    return res.status(400).json({ error: 'Request rejected.' });
  }

  if (!fullName || !phone || !address || !legalDomain || !caseDescription) {
    return res.status(400).json({
      error: 'Please fill in required fields: Full Name, Phone Number, Residential Address, Legal Domain, and Dispute Description.'
    });
  }

  const appt = createClinicAppointment({
    fullName: fullName.trim(),
    isRepresentative: Boolean(isRepresentative),
    representativeName: representativeName?.trim(),
    relationshipToLitigant: relationshipToLitigant?.trim(),
    phone: phone.trim(),
    email: email?.trim().toLowerCase(),
    address: address.trim(),
    district: district || 'Central Delhi',
    consultationMode: consultationMode || 'In-Person (CLC Campus Clinic)',
    preferredDate: preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    preferredTimeSlot: preferredTimeSlot || 'Morning (10:00 AM - 1:00 PM)',
    legalDomain: legalDomain.trim(),
    caseDescription: caseDescription.trim(),
    hasExistingCourtCase: Boolean(hasExistingCourtCase),
    courtCaseDetails: courtCaseDetails?.trim(),
    qualifiesUnderSection12: Boolean(qualifiesUnderSection12),
    section12Category: section12Category?.trim(),
    documentsSummary: documentsSummary?.trim()
  });

  recordFailedAttempt(`clinic-appt-${ip}`);

  res.status(201).json({
    success: true,
    message: 'Consultation request successfully lodged with Campus Law Centre Legal Aid Clinic.',
    trackingToken: appt.trackingToken,
    appointment: appt
  });
});

// Public: Track Consultation Appointment
app.get('/api/clinic/appointments/track/:token', (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) {
    return res.status(400).json({ error: 'Please provide a valid tracking token or contact number.' });
  }

  const appt = getClinicAppointmentByToken(token);
  if (!appt) {
    return res.status(404).json({ error: 'No consultation record found matching this tracking token or phone number.' });
  }

  // Return public tracking representation
  res.json({
    trackingToken: appt.trackingToken,
    fullName: appt.fullName,
    legalDomain: appt.legalDomain,
    consultationMode: appt.consultationMode,
    preferredDate: appt.preferredDate,
    preferredTimeSlot: appt.preferredTimeSlot,
    status: appt.status,
    scheduledDate: appt.scheduledDate,
    assignedVolunteers: appt.assignedVolunteers,
    createdAt: appt.createdAt,
    updatedAt: appt.updatedAt
  });
});

// Public: AAWAZ Call for Papers & Manuscript Submission
app.post('/api/aawaz/submissions', upload.single('manuscript'), (req: Request, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`aawaz-sub-${ip}`)) {
    return res.status(429).json({ error: 'Too many submissions. Please wait 15 minutes before re-submitting.' });
  }

  const {
    authorName,
    authorEmail,
    authorPhone,
    authorInstitution,
    authorDesignation,
    authorBio,
    hasCoAuthor,
    coAuthorName,
    coAuthorEmail,
    coAuthorInstitution,
    coAuthorDesignation,
    title,
    category,
    themeOrCFP,
    abstract,
    wordCount,
    originalityDeclaration
  } = req.body;

  if (!authorName || !authorEmail || !authorInstitution || !title || !abstract) {
    return res.status(400).json({
      error: 'Please fill in required fields: Author Name, Email, Institutional Affiliation, Manuscript Title, and Abstract.'
    });
  }

  if (originalityDeclaration !== 'true' && originalityDeclaration !== true) {
    return res.status(400).json({
      error: 'You must confirm the declaration of academic integrity and originality.'
    });
  }

  let manuscriptUrl: string | undefined = undefined;
  let manuscriptFileName: string | undefined = undefined;

  if (req.file) {
    manuscriptUrl = `/uploads/${req.file.filename}`;
    manuscriptFileName = req.file.originalname;
  }

  const submission = createAawazSubmission({
    authorName: authorName.trim(),
    authorEmail: authorEmail.trim().toLowerCase(),
    authorPhone: (authorPhone || '').trim(),
    authorInstitution: authorInstitution.trim(),
    authorDesignation: authorDesignation?.trim() || 'Law Student / Researcher',
    authorBio: authorBio?.trim(),
    hasCoAuthor: hasCoAuthor === 'true' || hasCoAuthor === true,
    coAuthorName: coAuthorName?.trim(),
    coAuthorEmail: coAuthorEmail?.trim().toLowerCase(),
    coAuthorInstitution: coAuthorInstitution?.trim(),
    coAuthorDesignation: coAuthorDesignation?.trim(),
    title: title.trim(),
    category: category || 'Access to Justice',
    themeOrCFP: themeOrCFP?.trim() || 'General Submissions Cycle',
    abstract: abstract.trim(),
    wordCount: Number(wordCount) || 2500,
    manuscriptUrl,
    manuscriptFileName,
    originalityDeclaration: true
  });

  recordFailedAttempt(`aawaz-sub-${ip}`);

  res.status(201).json({
    success: true,
    message: 'Manuscript successfully submitted to the AAWAZ Editorial Board.',
    trackingToken: submission.trackingToken,
    submission
  });
});

// Public: Track AAWAZ Manuscript Submission Status
app.get('/api/aawaz/submissions/track/:token', (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) {
    return res.status(400).json({ error: 'Please provide a valid manuscript tracking token.' });
  }

  const sub = getAawazSubmissionByToken(token);
  if (!sub) {
    return res.status(404).json({ error: 'No manuscript found matching this tracking token or author email.' });
  }

  res.json({
    trackingToken: sub.trackingToken,
    title: sub.title,
    authorName: sub.authorName,
    category: sub.category,
    themeOrCFP: sub.themeOrCFP,
    status: sub.status,
    submittedAt: sub.submittedAt,
    updatedAt: sub.updatedAt
  });
});

// Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (!checkRateLimit(`login-${clientIp}`)) {
    return res.status(429).json({ error: 'Too many failed login attempts. Account access is temporarily throttled for 15 minutes for security.' });
  }

  const authResult = authenticateAdmin(email, password);
  if (!authResult) {
    recordFailedAttempt(`login-${clientIp}`);
    return res.status(401).json({ error: 'Invalid administrative credentials. Please verify your institutional email and password.' });
  }

  clearRateLimit(`login-${clientIp}`);
  res.json({
    token: authResult.token,
    admin: authResult.admin
  });
});

app.get('/api/auth/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    email: req.adminEmail,
    role: req.adminRole
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    logoutSession(authHeader.substring(7));
  }
  res.json({ success: true, message: 'Administrative session ended.' });
});

// Admin Data Endpoint
app.get('/api/admin/data', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const data = getAllAdminData();
  res.json(data);
});

// Admin Settings
app.post('/api/admin/settings', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = updateSettings(req.body, req.adminEmail!);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update site settings' });
  }
});

app.put('/api/admin/settings', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = updateSettings(req.body, req.adminEmail!);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update site settings' });
  }
});

// Admin Inquiries
app.get('/api/admin/inquiries', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const data = getAllAdminData();
  res.json({ inquiries: data.contactSubmissions });
});

app.patch('/api/admin/inquiries/:id/status', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const submission = updateContactSubmission(req.params.id, { status: req.body.status, isRead: true }, req.adminEmail!);
  if (!submission) return res.status(404).json({ error: 'Inquiry not found' });
  res.json(submission);
});

app.patch('/api/admin/inquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const submission = updateContactSubmission(req.params.id, req.body, req.adminEmail!);
  if (!submission) return res.status(404).json({ error: 'Inquiry not found' });
  res.json(submission);
});

app.delete('/api/admin/inquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteContactSubmission(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Inquiry not found' });
  res.json({ success: true });
});

// Admin Audit Logs
app.get('/api/admin/audit', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const data = getAllAdminData();
  res.json({ logs: data.auditLogs });
});

// Admin Password Update
app.post('/api/admin/change-password', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current password and new password are required' });
  }
  const result = updateAdminPassword(req.adminEmail!, currentPassword, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'Password updated successfully' });
});

// Admin Notifications
app.post('/api/admin/notifications', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const notif = createNotification(req.body, req.adminEmail!);
    res.status(201).json(notif);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

app.put('/api/admin/notifications/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const notif = updateNotification(req.params.id, req.body, req.adminEmail!);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json(notif);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

app.delete('/api/admin/notifications/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteNotification(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Notification not found' });
  res.json({ success: true });
});

// Admin Reports
app.post('/api/admin/reports', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = createReport(req.body, req.adminEmail!);
    res.status(201).json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to upload report record' });
  }
});

app.put('/api/admin/reports/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = updateReport(req.params.id, req.body, req.adminEmail!);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update report record' });
  }
});

app.delete('/api/admin/reports/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteReport(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Report not found' });
  res.json({ success: true });
});

// Admin Team
app.post('/api/admin/team', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const member = createTeamMember(req.body, req.adminEmail!);
    res.status(201).json(member);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

app.put('/api/admin/team/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const member = updateTeamMember(req.params.id, req.body, req.adminEmail!);
    if (!member) return res.status(404).json({ error: 'Team member not found' });
    res.json(member);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

app.delete('/api/admin/team/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteTeamMember(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Team member not found' });
  res.json({ success: true });
});

// Admin Activities
app.post('/api/admin/activities', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const activity = createActivity(req.body, req.adminEmail!);
    res.status(201).json(activity);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create activity record' });
  }
});

app.put('/api/admin/activities/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const activity = updateActivity(req.params.id, req.body, req.adminEmail!);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update activity record' });
  }
});

app.delete('/api/admin/activities/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteActivity(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Activity not found' });
  res.json({ success: true });
});

// Admin Gallery
app.post('/api/admin/gallery', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = createGalleryItem(req.body, req.adminEmail!);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add gallery image' });
  }
});

app.delete('/api/admin/gallery/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteGalleryItem(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Gallery item not found' });
  res.json({ success: true });
});

// Admin Timeline
app.post('/api/admin/timeline', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = createTimelineItem(req.body, req.adminEmail!);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add timeline milestone' });
  }
});

app.delete('/api/admin/timeline/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteTimelineItem(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Milestone not found' });
  res.json({ success: true });
});

// Admin Contact Submissions
app.patch('/api/admin/contact/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const submission = updateContactSubmission(req.params.id, req.body, req.adminEmail!);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  res.json(submission);
});

app.delete('/api/admin/contact/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteContactSubmission(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Submission not found' });
  res.json({ success: true });
});

// Admin Blogs (AAWAZ)
app.get('/api/admin/blogs', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const blogs = getBlogs(true);
  res.json({ blogs });
});

app.post('/api/admin/blogs', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const blog = createBlog(req.body, req.adminEmail!);
    res.status(201).json(blog);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to publish/create blog post' });
  }
});

app.put('/api/admin/blogs/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const blog = updateBlog(req.params.id, req.body, req.adminEmail!);
    if (!blog) return res.status(404).json({ error: 'Blog post not found' });
    res.json(blog);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

app.delete('/api/admin/blogs/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteBlog(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Blog post not found' });
  res.json({ success: true });
});

// Admin Clinic Appointments
app.get('/api/admin/clinic-appointments', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const appointments = getAllClinicAppointments();
  res.json({ appointments });
});

app.put('/api/admin/clinic-appointments/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const appt = updateClinicAppointment(req.params.id, req.body, req.adminEmail!);
  if (!appt) return res.status(404).json({ error: 'Consultation appointment not found' });
  res.json(appt);
});

app.delete('/api/admin/clinic-appointments/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteClinicAppointment(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Consultation appointment not found' });
  res.json({ success: true });
});

// Admin AAWAZ Submissions
app.get('/api/admin/aawaz-submissions', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const submissions = getAllAawazSubmissions();
  res.json({ submissions });
});

app.put('/api/admin/aawaz-submissions/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const sub = updateAawazSubmission(req.params.id, req.body, req.adminEmail!);
  if (!sub) return res.status(404).json({ error: 'Manuscript submission not found' });
  res.json(sub);
});

app.delete('/api/admin/aawaz-submissions/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = deleteAawazSubmission(req.params.id, req.adminEmail!);
  if (!success) return res.status(404).json({ error: 'Manuscript submission not found' });
  res.json({ success: true });
});

// Admin Media Upload (supports documents, PDFs, photos)
app.post('/api/admin/upload', requireAdminAuth, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was provided.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
  });
});

// Catch-all for undefined API routes to return 404 JSON instead of falling through to HTML index
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

function escapeHtmlAttr(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectBlogMetaTags(html: string, blog: any, origin: string): string {
  const displayTitle = `${escapeHtmlText(blog.title)} | AAWAZ — Legal Aid Society, Campus Law Centre`;
  const snippet = escapeHtmlAttr(blog.excerpt || blog.subtitle || 'Scholarly socio-legal inquiry published under AAWAZ by the Legal Aid Society, Campus Law Centre, Faculty of Law, University of Delhi.');
  const escapedTitle = escapeHtmlAttr(blog.title);
  const author = escapeHtmlAttr(`${blog.author} (${blog.authorRole || 'Contributor'})`);
  const articleUrl = `${origin}/aawaz/${blog.slug || blog.id}`;
  const coverImage = blog.coverImage || `${origin}/images/clc_seal.png`;
  const tagsList = escapeHtmlAttr(
    Array.isArray(blog.tags) && blog.tags.length > 0
      ? blog.tags.join(', ')
      : `${blog.category}, Legal Aid, Campus Law Centre, DU, Constitutional Law`
  );

  // Replace <title>
  let modified = html.replace(/<title>.*?<\/title>/i, `<title>${displayTitle}</title>`);

  // Remove existing static meta description, og tags, twitter tags to prevent duplicates
  modified = modified
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');

  const metaSnippet = `
    <!-- Dynamic AAWAZ Article SEO Metadata -->
    <meta name="description" content="${snippet}" />
    <meta name="author" content="${author}" />
    <meta name="keywords" content="${tagsList}" />
    <link rel="canonical" href="${articleUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="AAWAZ — Legal Aid Society, CLC, DU" />
    <meta property="og:title" content="${escapedTitle} — AAWAZ" />
    <meta property="og:description" content="${snippet}" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:image" content="${coverImage}" />
    <meta property="article:published_time" content="${blog.date}" />
    <meta property="article:author" content="${escapeHtmlAttr(blog.author)}" />
    <meta property="article:section" content="${escapeHtmlAttr(blog.category)}" />

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle} — AAWAZ" />
    <meta name="twitter:description" content="${snippet}" />
    <meta name="twitter:image" content="${coverImage}" />

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    ${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
      headline: blog.title,
      alternativeHeadline: blog.subtitle || undefined,
      description: blog.excerpt || blog.subtitle,
      image: coverImage,
      datePublished: blog.date,
      dateModified: blog.updatedAt || blog.date,
      author: {
        '@type': 'Person',
        name: blog.author,
        jobTitle: blog.authorRole
      },
      publisher: {
        '@type': 'Organization',
        name: 'Legal Aid Society — Campus Law Centre, Faculty of Law, University of Delhi',
        url: origin,
        logo: {
          '@type': 'ImageObject',
          url: `${origin}/images/clc_seal.png`
        }
      },
      articleSection: blog.category,
      keywords: blog.tags
    }, null, 2)}
    </script>
  `;

  return modified.replace('</head>', `${metaSnippet}\n  </head>`);
}

async function startServer() {
  // Vite integration in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    // Dynamic SEO handling for individual article URLs in dev
    app.get(['/aawaz/:id', '/blogs/:id'], async (req: Request, res: Response, next: NextFunction) => {
      const idOrSlug = req.params.id;
      const blog = getBlogByIdOrSlug(idOrSlug);
      if (!blog) return next();

      try {
        const indexPath = path.join(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const origin = `${req.protocol}://${req.get('host')}`;
        const htmlWithMeta = injectBlogMetaTags(template, blog, origin);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlWithMeta);
      } catch (e) {
        next(e);
      }
    });

    // Dynamic SEO for ?id=... query parameter on /aawaz or /blogs
    app.get(['/aawaz', '/blogs'], async (req: Request, res: Response, next: NextFunction) => {
      const queryId = req.query.id as string | undefined;
      if (!queryId) return next();
      const blog = getBlogByIdOrSlug(queryId);
      if (!blog) return next();

      try {
        const indexPath = path.join(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const origin = `${req.protocol}://${req.get('host')}`;
        const htmlWithMeta = injectBlogMetaTags(template, blog, origin);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlWithMeta);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Dynamic SEO handling for individual article URLs in production
    app.get(['/aawaz/:id', '/blogs/:id'], (req: Request, res: Response, next: NextFunction) => {
      const idOrSlug = req.params.id;
      const blog = getBlogByIdOrSlug(idOrSlug);
      if (!blog) return next();

      try {
        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) return next();
        const template = fs.readFileSync(indexPath, 'utf-8');
        const origin = `${req.protocol}://${req.get('host')}`;
        const htmlWithMeta = injectBlogMetaTags(template, blog, origin);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlWithMeta);
      } catch (e) {
        next(e);
      }
    });

    app.get(['/aawaz', '/blogs'], (req: Request, res: Response, next: NextFunction) => {
      const queryId = req.query.id as string | undefined;
      if (!queryId) return next();
      const blog = getBlogByIdOrSlug(queryId);
      if (!blog) return next();

      try {
        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) return next();
        const template = fs.readFileSync(indexPath, 'utf-8');
        const origin = `${req.protocol}://${req.get('host')}`;
        const htmlWithMeta = injectBlogMetaTags(template, blog, origin);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlWithMeta);
      } catch (e) {
        next(e);
      }
    });

    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🏛️ Legal Aid Society - Campus Law Centre (DU) Portal`);
    console.log(`======================================================`);
    console.log(`  > Local:   http://localhost:${PORT}`);
    console.log(`  > Network: http://0.0.0.0:${PORT}`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use by another application or process.`);
      console.error(`To free up port ${PORT}:`);
      console.error(`  - On Windows (PowerShell/CMD):`);
      console.error(`      netstat -ano | findstr :${PORT}`);
      console.error(`      taskkill /PID <PID_NUMBER> /F`);
      console.error(`  - On macOS / Linux:`);
      console.error(`      lsof -ti :${PORT} | xargs kill -9\n`);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
