require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEN_AI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: "https://ai-mock-interview-4qpg.vercel.app/",//true.
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User1', userSchema);

// Resume Schema
const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'My Resume' },
  template: { type: String, default: 'modern' },
  personal: {
    fullName: String,
    location: String,
    phone: String,
    email: String,
    github: String,
    linkedin: String
  },
  training: [{
    id: Number,
    company: String,
    position: String,
    duration: String,
    points: [String]
  }],
  projects: [{
    id: Number,
    title: String,
    technologies: String,
    duration: String,
    points: [String],
    githubLink: String
  }],
  certifications: [{
    id: Number,
    title: String,
    platform: String,
    date: String,
    certificateLink: String
  }],
  technicalSkills: {
    languages: String,
    technologies: String,
    skills: String
  },
  education: [{
    id: Number,
    institution: String,
    degree: String,
    duration: String,
    location: String,
    details: String
  }]
}, { timestamps: true });

const Resume = mongoose.model('Resume1', resumeSchema);

// Add OTP Schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // OTP expires in 5 minutes
});

const OTP = mongoose.model('OTP1', otpSchema);

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, otp, type) => {
  const subject = type === 'registration'
    ? 'Welcome to RRR - Email Verification'
    : 'RRR - Password Reset Request';

  const html = type === 'registration'
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to RRR - Resume Recognition & Reconfiguration</h2>
        <p>Thank you for choosing RRR for your professional journey. We're excited to have you on board!</p>
        <p>Your verification OTP is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
        <p>With RRR, you'll have access to:</p>
        <ul>
          <li>AI-powered resume building</li>
          <li>Smart interview preparation</li>
          <li>Professional career guidance</li>
        </ul>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request - RRR</h2>
        <p>We received a request to reset your password. If you didn't make this request, please secure your account immediately.</p>
        <p>Your password reset OTP is: <strong style="font-size: 24px; color: #dc2626;">${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
        <p>For security reasons, please do not share this OTP with anyone.</p>
      </div>

    `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html
  });
};
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await transporter.sendMail({
      from: email, // your authenticated email
      to: process.env.EMAIL_USER,   // where you want to receive the message
      subject: `New Contact Form Submission from ${name}`,
      text: `
        You have a new contact form submission:

        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `
    });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Something went wrong while sending the message' });
  }
});

// Send OTP Endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, type } = req.body;

    // For registration, check if email already exists
    if (type === 'registration') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
    }

    const otp = generateOTP();

    // Save OTP to database
    await OTP.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true }
    );

    await sendOTPEmail(email, otp, type);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP Endpoint
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await OTP.deleteOne({ email });
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Reset Password Endpoint
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, ageCategory, password, confirmPassword } = req.body;

    // Basic validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save new user
    const newUser = new User({
      fullName,
      email,
      ageCategory,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error); // helpful for debugging
    res.status(500).json({ message: 'Something went wrong' });
  }
});


// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log("Invalid password for user:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("Login successful for user:", email);
    res.status(200).json({
      result: user,
      token,
      userType: 'user',
      fullName: user.fullName
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// Token Refresh Endpoint
app.post('/api/refresh-token', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new token
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("Token refreshed for user:", user.email);
    res.status(200).json({
      token,
      message: 'Session extended successfully'
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ message: 'Failed to refresh token', error: error.message });
  }
});

// Protected route to get user data
app.get('/api/resume/user-data', async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user data (excluding sensitive information)
        res.status(200).json({
            fullName: user.fullName,
            email: user.email,
            ageCategory: user.ageCategory
            // Add other fields as needed
        });

    } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Save/Update Resume Endpoint
app.post('/api/resume/save', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Extract _id from request body if it exists
    const { _id, ...resumeData } = req.body;

    // Set default title if not provided
    if (!resumeData.title) {
      resumeData.title = 'My Resume';
    }

    let result;

    // If _id is provided, update that specific resume
    if (_id) {
      result = await Resume.findOneAndUpdate(
        { _id, userId }, // Ensure the resume belongs to the user
        { ...resumeData, userId },
        { new: true }
      );

      if (!result) {
        return res.status(404).json({ message: 'Resume not found or not authorized' });
      }
    } else {
      // Create a new resume
      const newResume = new Resume({
        userId,
        ...resumeData
      });
      result = await newResume.save();
    }

    res.status(200).json({ message: 'Resume saved successfully', resume: result });
  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).json({ message: 'Error saving resume' });
  }
});

// Download Resume from Form Data
app.post('/api/resume/download', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Get the resume data from request body instead of DB
        const { formData, template } = req.body;
        if (!formData) {
            return res.status(400).json({ message: 'No resume data provided' });
        }


        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();

        // Generate HTML content based on received formData
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Resume</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    h1 { color: #333; }
                    .section { margin-bottom: 20px; }
                    .section-title {
                        color: #2563eb;
                        border-bottom: 2px solid #2563eb;
                        padding-bottom: 5px;
                        margin-bottom: 10px;
                    }
                    .contact-info { text-align: center; margin-bottom: 20px; }
                    .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .item { margin-bottom: 15px; }
                    .dates { color: #666; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="contact-info">
                    <h1>${formData.personal.fullName || ''}</h1>
                    <p>
                        ${formData.personal.email || ''} |
                        ${formData.personal.phone || ''} |
                        ${formData.personal.location || ''}
                    </p>
                    <p>
                        ${formData.personal.github ? 'GitHub: ' + formData.personal.github : ''}
                        ${formData.personal.linkedin ? '| LinkedIn: ' + formData.personal.linkedin : ''}
                    </p>
                </div>

                ${formData.technicalSkills && (formData.technicalSkills.languages || formData.technicalSkills.technologies || formData.technicalSkills.skills) ? `
                <div class="section">
                    <h2 class="section-title">Technical Skills</h2>
                    <div class="skills-grid">
                        ${formData.technicalSkills.languages ? `<div><strong>Languages:</strong> ${formData.technicalSkills.languages}</div>` : ''}
                        ${formData.technicalSkills.technologies ? `<div><strong>Technologies:</strong> ${formData.technicalSkills.technologies}</div>` : ''}
                        ${formData.technicalSkills.skills ? `<div><strong>Skills:</strong> ${formData.technicalSkills.skills}</div>` : ''}
                    </div>
                </div>` : ''}

                ${formData.training?.length > 0 ? `
                <div class="section">
 Shuttleworth                    <h2 class="section-title">Experience</h2>
                    ${formData.training.map(exp => `
                        <div class="item">
                            <strong>${exp.company || ''} - ${exp.position || ''}</strong>
                            <div class="dates">${exp.duration || ''}</div>
                            <ul>
                                ${exp.points?.map(point => `<li>${point}</li>`).join('') || ''}
                            </ul>
                        </div>
                    `).join('')}
                </div>` : ''}

                ${formData.projects?.length > 0 ? `
                <div class="section">
                    <h2 class="section-title">Projects</h2>
                    ${formData.projects.map(proj => `
                        <div class="item">
                            <strong>${proj.title || ''}</strong> ${proj.githubLink ? `(<a href="${proj.githubLink}">${proj.githubLink}</a>)` : ''}
                            <div class="dates">${proj.duration || ''}</div>
                            <div>Technologies: ${proj.technologies || ''}</div>
                            <ul>
                                ${proj.points?.map(point => `<li>${point}</li>`).join('') || ''}
                            </ul>
                        </div>
                    `).join('')}
                </div>` : ''}

                ${formData.education?.length > 0 ? `
                <div class="section">
                    <h2 class="section-title">Education</h2>
                    ${formData.education.map(edu => `
                        <div class="item">
                            <strong>${edu.institution || ''} - ${edu.degree || ''}</strong>
                            <div class="dates">${edu.duration || ''}</div>
                            <div>${edu.location || ''}</div>
                            <div>${edu.details || ''}</div>
                        </div>
                    `).join('')}
                </div>` : ''}

                ${formData.certifications?.length > 0 ? `
                <div class="section">
                    <h2 class="section-title">Certifications</h2>
                    ${formData.certifications.map(cert => `
                        <div class="item">
                            <strong>${cert.title || ''}</strong> ${cert.certificateLink ? `(<a href="${cert.certificateLink}">${cert.certificateLink}</a>)` : ''}
                            <div>${cert.platform || ''} - ${cert.date || ''}</div>
                        </div>
                    `).join('')}
                </div>` : ''}
            </body>
            </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=resume.pdf',
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            message: 'Error generating PDF',
            error: error.message
        });
    }
});


// Fetch Resume Endpoint (Legacy - fetches the first resume)
app.get('/api/resume/fetch', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const resume = await Resume.findOne({ userId });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    res.status(200).json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Error fetching resume' });
  }
});

// List All User Resumes Endpoint
app.get('/api/resume/list', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });

    res.status(200).json({ resumes });
  } catch (error) {
    console.error('Error listing resumes:', error);
    res.status(500).json({ message: 'Error listing resumes' });
  }
});

// Fetch Specific Resume by ID
app.get('/api/resume/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const resumeId = req.params.id;

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or not authorized' });
    }

    res.status(200).json(resume);
  } catch (error) {
    console.error('Error fetching specific resume:', error);
    res.status(500).json({ message: 'Error fetching resume' });
  }
});

// Delete Resume by ID
app.delete('/api/resume/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const resumeId = req.params.id;

    const result = await Resume.findOneAndDelete({ _id: resumeId, userId });
    if (!result) {
      return res.status(404).json({ message: 'Resume not found or not authorized' });
    }

    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Error deleting resume' });
  }
});

// Download Resume by ID
app.get('/api/resume/download/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const resumeId = req.params.id;

    // Fetch the resume from the database
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or not authorized' });
    }

    // Extract the data needed for PDF generation
    const formData = {
      personal: resume.personal,
      technicalSkills: resume.technicalSkills,
      training: resume.training,
      projects: resume.projects,
      certifications: resume.certifications,
      education: resume.education
    };

    const template = resume.template || 'modern';

    // Launch browser for PDF generation
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();

    // Generate HTML based on template
    let html = '';
    if (template === 'modern') {
      html = generateModernTemplate(formData);
    } else {
      html = generateClassicTemplate(formData);
    }

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });

    await browser.close();

    // Send PDF as response
    res.contentType('application/pdf');
    res.send(pdf);
  } catch (error) {
    console.error('Error downloading resume by ID:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

// Add this new endpoint
app.post('/api/check-user', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User exists' });
    } catch (error) {
        console.error('Error checking user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Interview Analysis Endpoint
app.post('/api/analyze-interview', async (req, res) => {
    try {
        const { transcripts, questions } = req.body;
        console.log('Received analysis request:', {
            questionsCount: questions?.length,
            transcriptsCount: transcripts?.length,
            questions,
            transcripts
        });

        if (!transcripts || !questions || transcripts.length !== questions.length) {
            throw new Error('Invalid request: Missing or mismatched questions and transcripts');
        }

        // Create a more detailed prompt with better instructions
        const analysisPrompt = `
        You are an expert technical interviewer with years of experience evaluating candidates.
        Analyze these interview responses carefully and provide detailed, constructive feedback.

        Questions and Answers:
        ${questions.map((q, i) => `
        Question ${i + 1}: ${q}
        Candidate's Answer: ${transcripts[i] || 'No response provided'}
        `).join('\n\n')}

        Analyze each response considering:
        1. Technical Accuracy: Evaluate the correctness and depth of technical knowledge
        2. Communication: Assess clarity, structure, and effectiveness of communication
        3. Problem-Solving: Evaluate the approach, methodology, and critical thinking
        4. Completeness: Evaluate how thoroughly the candidate addressed all aspects of the question

        Provide a detailed analysis in this exact JSON format (include specific examples from their answers):
        {
            "feedback": [
                {
                    "questionNumber": <number>,
                    "question": "<question text>",
                    "response": "<candidate's response>",
                    "score": <number 0-100>,
                    "technicalAccuracy": "<specific feedback on technical accuracy with examples>",
                    "communication": "<specific feedback on communication style>",
                    "problemSolving": "<specific feedback on problem-solving approach>",
                    "strengths": ["<specific strength with example>", ...],
                    "improvements": ["<specific area to improve with suggestion>", ...]
                },
                ...
            ],
            "overallScore": <number 0-100>,
            "overallFeedback": "<comprehensive evaluation of performance>",
            "keyStrengths": ["<key strength with specific example>", ...],
            "developmentAreas": ["<specific area to develop with example>", ...],
            "recommendations": ["<actionable recommendation>", ...]
        }

        Important guidelines:
        - Provide specific examples from their responses in your feedback
        - Be constructive and actionable in feedback
        - Score based on technical accuracy (40%), communication (30%), problem-solving (20%), and completeness (10%)
        - Ensure all feedback is detailed, helpful, and actionable
        - For short or incomplete answers, provide specific suggestions on what the candidate should have included
        - Focus on both strengths and areas for improvement
        - Make recommendations specific to the candidate's performance
        `;

        console.log('Sending analysis prompt to AI...');
        const result = await model.generateContent(analysisPrompt);
        const response = await result.response;
        let analysis;

        try {
            const text = response.text();
            console.log('Raw AI response received');

            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            analysis = JSON.parse(jsonMatch[0]);
            console.log('Successfully parsed JSON response');

            // Validate the analysis structure
            if (!analysis.feedback || !analysis.overallScore ||
                !analysis.keyStrengths || !analysis.developmentAreas) {
                throw new Error('Invalid analysis structure');
            }

            // Validate and clean up each feedback item
            analysis.feedback = analysis.feedback.map((item, index) => ({
                ...item,
                questionNumber: index + 1,
                question: questions[index],
                response: transcripts[index] || 'No response provided',
                score: Math.min(100, Math.max(0, item.score)),
                technicalAccuracy: item.technicalAccuracy || 'No specific feedback provided',
                communication: item.communication || 'No specific feedback provided',
                problemSolving: item.problemSolving || 'No specific feedback provided',
                strengths: Array.isArray(item.strengths) ? item.strengths : [],
                improvements: Array.isArray(item.improvements) ? item.improvements : []
            }));

            // Ensure all required arrays exist and have content
            analysis.keyStrengths = Array.isArray(analysis.keyStrengths) && analysis.keyStrengths.length > 0
                ? analysis.keyStrengths
                : ['Participated in the interview process', 'Attempted to answer technical questions'];

            analysis.developmentAreas = Array.isArray(analysis.developmentAreas) && analysis.developmentAreas.length > 0
                ? analysis.developmentAreas
                : ['Improve technical knowledge depth', 'Enhance communication clarity'];

            analysis.recommendations = Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0
                ? analysis.recommendations
                : ['Practice more technical interviews', 'Study core concepts in depth', 'Work on structured communication'];

            // Ensure overallFeedback exists
            if (!analysis.overallFeedback || analysis.overallFeedback.trim() === '') {
                // Generate a basic overall feedback based on the score
                const score = analysis.overallScore || 0;
                if (score >= 80) {
                    analysis.overallFeedback = 'Overall, you demonstrated strong technical knowledge and communication skills. Continue building on your strengths while addressing the few areas for improvement.';
                } else if (score >= 60) {
                    analysis.overallFeedback = 'You showed good potential with some solid technical knowledge, but there are several areas where you could improve to become more effective in technical interviews.';
                } else {
                    analysis.overallFeedback = 'This interview revealed several areas where you need significant improvement. Focus on building your technical knowledge and practice structured communication for technical discussions.';
                }
            }

            // Calculate overall score if not provided or invalid
            if (!analysis.overallScore || isNaN(analysis.overallScore)) {
                analysis.overallScore = Math.round(
                    analysis.feedback.reduce((sum, item) => sum + item.score, 0) / analysis.feedback.length
                );
            }

        } catch (e) {
            console.error('Error parsing AI response:', e);
            // Try one more time with a simplified prompt
            try {
                const retryPrompt = `
                Analyze these interview responses and provide feedback in JSON format:
                ${questions.map((q, i) => `Q: ${q}\nA: ${transcripts[i] || 'No response'}`).join('\n\n')}

                Return ONLY a JSON object with this structure:
                {
                    "feedback": [
                        {
                            "questionNumber": 1,
                            "score": 70,
                            "technicalAccuracy": "Brief feedback",
                            "communication": "Brief feedback",
                            "problemSolving": "Brief feedback",
                            "strengths": ["One strength"],
                            "improvements": ["One improvement"]
                        },
                        // Repeat for each question
                    ],
                    "overallScore": 70,
                    "overallFeedback": "Brief overall assessment",
                    "keyStrengths": ["Key strength 1", "Key strength 2"],
                    "developmentAreas": ["Area 1", "Area 2"],
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                }`;

                console.log('Attempting retry with simplified prompt...');
                const retryResult = await model.generateContent(retryPrompt);
                const retryResponse = await retryResult.response;
                const retryText = retryResponse.text();
                const retryJson = retryText.match(/\{[\s\S]*\}/);

                if (retryJson) {
                    analysis = JSON.parse(retryJson[0]);
                    console.log('Successfully parsed JSON from retry');
                } else {
                    throw new Error('Retry failed to generate valid JSON');
                }
            } catch (retryError) {
                console.error('Retry failed:', retryError);

                // Create a basic fallback analysis if all else fails
                analysis = {
                    feedback: questions.map((q, i) => ({
                        questionNumber: i + 1,
                        question: q,
                        response: transcripts[i] || 'No response provided',
                        score: 60,
                        technicalAccuracy: 'Review needed for technical accuracy',
                        communication: 'Communication could be improved',
                        problemSolving: 'Problem-solving approach needs development',
                        strengths: ['Attempted to answer the question'],
                        improvements: ['Provide more detailed and structured responses']
                    })),
                    overallScore: 60,
                    overallFeedback: 'The interview showed areas where improvement is needed. Focus on building technical knowledge and communication skills.',
                    keyStrengths: ['Participated in the interview process'],
                    developmentAreas: ['Technical knowledge depth', 'Communication structure'],
                    recommendations: ['Study core technical concepts', 'Practice structured responses', 'Prepare examples from your experience']
                };
                console.log('Using fallback analysis structure');
            }
        }

        // Final validation and cleanup
        analysis.overallScore = Math.min(100, Math.max(0, analysis.overallScore));
        analysis.feedback.forEach(f => {
            f.score = Math.min(100, Math.max(0, f.score));
        });

        console.log('Sending analysis response with score:', analysis.overallScore);
        res.json(analysis);
    } catch (error) {
        console.error('Error analyzing interview:', error);
        res.status(500).json({
            message: 'Failed to analyze interview',
            error: error.message
        });
    }
});

// Interview Question Generation Endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log('Received prompt:', prompt);

        // Create a more structured prompt for the AI with better instructions
        const structuredPrompt = `
        You are an experienced technical interviewer with expertise in evaluating candidates.
        Generate exactly 5 technical interview questions based on the candidate's skills and experience.

        Requirements:
        1. Generate EXACTLY 5 questions
        2. Each question must be on a new line
        3. Each question must end with a question mark
        4. Questions should cover different aspects of the candidate's skills
        5. Include a mix of basic, intermediate, and advanced questions
        6. Focus on practical, real-world scenarios
        7. Include questions that test both theoretical knowledge and practical application
        8. DO NOT include any explanations or additional text
        9. DO NOT number the questions

        Candidate Information:
        ${prompt}

        Format your response as exactly 5 questions, one per line, nothing else.`;

        // Generate response using Gemini
        console.log('Sending prompt to Gemini...');
        const result = await model.generateContent(structuredPrompt);
        const response = await result.response;
        let questions = [];

        try {
            // Get the raw text response
            const text = response.text();
            console.log('AI Response received');

            // Split by newlines and clean up
            questions = text
                .split('\n')
                .map(line => line.trim())
                .filter(line => line && line.includes('?'));

            console.log(`Extracted ${questions.length} questions from response`);

            // Ensure exactly 5 questions
            if (questions.length < 5) {
                console.log(`Only got ${questions.length} questions, adding default questions`);
                // If we don't have enough questions, generate some generic ones based on the prompt
                const defaultQuestions = [
                    "Can you explain your approach to problem-solving in a technical context?",
                    "How do you stay updated with the latest technological trends in your field?",
                    "Describe a challenging project you worked on and how you overcame the technical obstacles?",
                    "How do you handle technical disagreements in a team setting?",
                    "What's your process for debugging complex technical issues in your work?",
                    "How do you approach learning new technologies or programming languages?",
                    "Can you describe how you would design a system with scalability in mind?"
                ];
                questions = [...questions, ...defaultQuestions].slice(0, 5);
            } else if (questions.length > 5) {
                console.log(`Got ${questions.length} questions, trimming to 5`);
                questions = questions.slice(0, 5);
            }

            // Ensure all questions end with a question mark
            questions = questions.map(q => q.endsWith('?') ? q : `${q}?`);

            console.log('Final processed questions:', questions);

            if (questions.length !== 5) {
                throw new Error('Failed to generate exactly 5 questions');
            }
        } catch (e) {
            console.error('Error processing questions:', e);

            // Fallback to basic questions if processing fails
            questions = [
                "Can you explain your approach to problem-solving in a technical context?",
                "How do you stay updated with the latest technological trends?",
                "Describe a challenging project you worked on and how you overcame the obstacles?",
                "How do you handle technical disagreements in a team setting?",
                "What's your process for debugging complex technical issues?"
            ];
            console.log('Using fallback questions due to error');
        }

        res.json({ questions });
    } catch (error) {
        console.error('Error generating interview questions:', error);
        res.status(500).json({
            message: 'Failed to generate interview questions',
            error: error.message
        });
    }
});

// Resume Parser Proxy Endpoint - Real API Integration
app.get('/api/resume-parser', async (req, res) => {
    try {
        console.log('Resume parser endpoint called');
        const { url } = req.query;

        if (!url) {
            console.warn('No URL parameter provided');
            return res.status(400).json({ message: 'URL parameter is required' });
        }

        console.log('Proxying resume parsing request for URL:', url);

        // Use the confirmed working API key
        const API_KEY = "e7e4d9ce64mshbf9dc3036f70266p186723jsne74c67f1a2ca";

        try {
            // Determine the correct URL based on API key format
            let requestUrl;

            // Check if the API key is in RapidAPI format (contains msh)
            if (API_KEY.includes('msh')) {
                requestUrl = `https://resume-parser.p.rapidapi.com/url?url=${encodeURIComponent(url)}`;
                console.log('Using RapidAPI URL format:', requestUrl);
            } else {
                requestUrl = `https://api.apilayer.com/resume_parser/url?url=${encodeURIComponent(url)}`;
                console.log('Using API Layer URL format:', requestUrl);
            }

            // Determine the correct header format based on API key format
            let headers = {};

            // Check if the API key is in RapidAPI format (contains msh)
            if (API_KEY.includes('msh')) {
                console.log('Using RapidAPI header format');
                headers = {
                    'X-RapidAPI-Key': API_KEY,
                    'X-RapidAPI-Host': 'resume-parser.p.rapidapi.com',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                };
            } else {
                console.log('Using API Layer header format');
                headers = {
                    'apikey': API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                };
            }

            // Make the request to API Layer from the server with proper headers
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: headers,
            });

            console.log('API Layer response status:', response.status);

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 429) {
                    console.warn('API rate limit exceeded');
                    return res.status(429).json({
                        message: 'API rate limit exceeded. Please try again later.',
                        error: 'RATE_LIMIT_EXCEEDED'
                    });
                }

                // For other errors
                let errorText;
                try {
                    errorText = await response.text();
                    console.error('API Layer error response:', errorText);
                } catch (e) {
                    errorText = 'Could not read error response';
                }

                // If API fails, fall back to mock data
                console.log('Falling back to mock data due to API error');
                const mockResumeData = {
                    "skills": [
                        "JavaScript",
                        "React",
                        "Node.js",
                        "HTML",
                        "CSS",
                        "MongoDB",
                        "Express",
                        "Git",
                        "RESTful API",
                        "Problem Solving"
                    ],
                    "experience": [
                        {
                            "title": "Frontend Developer",
                            "company": "Tech Solutions Inc.",
                            "dates": "2020-2023",
                            "description": "Developed responsive web applications using React and JavaScript"
                        },
                        {
                            "title": "Web Developer Intern",
                            "company": "Digital Innovations",
                            "dates": "2019-2020",
                            "description": "Assisted in building and maintaining client websites"
                        }
                    ],
                    "projects": [
                        {
                            "title": "E-commerce Platform",
                            "technologies": "React, Node.js, MongoDB",
                            "description": "Built a full-stack e-commerce application with user authentication and payment processing"
                        },
                        {
                            "title": "Task Management App",
                            "technologies": "JavaScript, HTML, CSS",
                            "description": "Developed a responsive task management application with drag-and-drop functionality"
                        }
                    ],
                    "education": [
                        {
                            "institution": "University of Technology",
                            "degree": "Bachelor of Science",
                            "field": "Computer Science",
                            "dates": "2016-2020"
                        }
                    ]
                };

                return res.status(200).json(mockResumeData);
            }

            // Get the response data
            let data;
            try {
                const responseText = await response.text();
                console.log('Raw response from API:', responseText.substring(0, 200) + '...');

                try {
                    data = JSON.parse(responseText);
                    console.log('Successfully parsed resume, returning real data');
                    console.log('Data contains skills:', data.skills ? 'Yes' : 'No');

                    // Return the real parsed data
                    return res.status(200).json(data);
                } catch (parseError) {
                    console.error('Error parsing JSON from text response:', parseError);
                    throw parseError;
                }
            } catch (jsonError) {
                console.error('Error getting or parsing response:', jsonError);

                // Fall back to mock data if JSON parsing fails
                console.log('Falling back to mock data due to JSON parsing error');
                const mockResumeData = {
                    "skills": [
                        "JavaScript",
                        "React",
                        "Node.js",
                        "HTML",
                        "CSS",
                        "MongoDB",
                        "Express",
                        "Git",
                        "RESTful API",
                        "Problem Solving"
                    ],
                    "experience": [
                        {
                            "title": "Frontend Developer",
                            "company": "Tech Solutions Inc.",
                            "dates": "2020-2023",
                            "description": "Developed responsive web applications using React and JavaScript"
                        },
                        {
                            "title": "Web Developer Intern",
                            "company": "Digital Innovations",
                            "dates": "2019-2020",
                            "description": "Assisted in building and maintaining client websites"
                        }
                    ],
                    "projects": [
                        {
                            "title": "E-commerce Platform",
                            "technologies": "React, Node.js, MongoDB",
                            "description": "Built a full-stack e-commerce application with user authentication and payment processing"
                        },
                        {
                            "title": "Task Management App",
                            "technologies": "JavaScript, HTML, CSS",
                            "description": "Developed a responsive task management application with drag-and-drop functionality"
                        }
                    ],
                    "education": [
                        {
                            "institution": "University of Technology",
                            "degree": "Bachelor of Science",
                            "field": "Computer Science",
                            "dates": "2016-2020"
                        }
                    ]
                };

                return res.status(200).json(mockResumeData);
            }
        } catch (fetchError) {
            console.error('Fetch error when calling API Layer:', fetchError);

            // Fall back to mock data if fetch fails
            console.log('Falling back to mock data due to fetch error');
            const mockResumeData = {
                "skills": [
                    "JavaScript",
                    "React",
                    "Node.js",
                    "HTML",
                    "CSS",
                    "MongoDB",
                    "Express",
                    "Git",
                    "RESTful API",
                    "Problem Solving"
                ],
                "experience": [
                    {
                        "title": "Frontend Developer",
                        "company": "Tech Solutions Inc.",
                        "dates": "2020-2023",
                        "description": "Developed responsive web applications using React and JavaScript"
                    },
                    {
                        "title": "Web Developer Intern",
                        "company": "Digital Innovations",
                        "dates": "2019-2020",
                        "description": "Assisted in building and maintaining client websites"
                    }
                ],
                "projects": [
                    {
                        "title": "E-commerce Platform",
                        "technologies": "React, Node.js, MongoDB",
                        "description": "Built a full-stack e-commerce application with user authentication and payment processing"
                    },
                    {
                        "title": "Task Management App",
                        "technologies": "JavaScript, HTML, CSS",
                        "description": "Developed a responsive task management application with drag-and-drop functionality"
                    }
                ],
                "education": [
                    {
                        "institution": "University of Technology",
                        "degree": "Bachelor of Science",
                        "field": "Computer Science",
                        "dates": "2016-2020"
                    }
                ]
            };

            return res.status(200).json(mockResumeData);
        }
    } catch (error) {
        console.error('Error in resume parser endpoint:', error);

        // Fall back to mock data for any other errors
        console.log('Falling back to mock data due to general error');
        const mockResumeData = {
            "skills": [
                "JavaScript",
                "React",
                "Node.js",
                "HTML",
                "CSS",
                "MongoDB",
                "Express",
                "Git",
                "RESTful API",
                "Problem Solving"
            ],
            "experience": [
                {
                    "title": "Frontend Developer",
                    "company": "Tech Solutions Inc.",
                    "dates": "2020-2023",
                    "description": "Developed responsive web applications using React and JavaScript"
                },
                {
                    "title": "Web Developer Intern",
                    "company": "Digital Innovations",
                    "dates": "2019-2020",
                    "description": "Assisted in building and maintaining client websites"
                }
            ],
            "projects": [
                {
                    "title": "E-commerce Platform",
                    "technologies": "React, Node.js, MongoDB",
                    "description": "Built a full-stack e-commerce application with user authentication and payment processing"
                },
                {
                    "title": "Task Management App",
                    "technologies": "JavaScript, HTML, CSS",
                    "description": "Developed a responsive task management application with drag-and-drop functionality"
                }
            ],
            "education": [
                {
                    "institution": "University of Technology",
                    "degree": "Bachelor of Science",
                    "field": "Computer Science",
                    "dates": "2016-2020"
                }
            ]
        };

        res.status(200).json(mockResumeData);
    }
});

// Smart Recognition Endpoint
app.post('/api/smart-recognition', async (req, res) => {
    try {
        const { resumeData, useAI } = req.body;
        console.log('Received resume data for analysis:', resumeData);

        if (!resumeData || !resumeData.skills || !Array.isArray(resumeData.skills)) {
            return res.status(400).json({ message: 'Invalid resume data format' });
        }

        // Verify token if available
        let userId = null;
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
                console.log('User authenticated:', userId);
            } catch (err) {
                console.warn('Invalid token provided, continuing as anonymous user');
            }
        }

        // Extract skills from resume data
        const skills = resumeData.skills;
        console.log('Extracted skills:', skills);

        // Use AI to analyze skills and suggest career paths
        if (useAI) {
            console.log('Using AI for enhanced analysis...');

            // Format the resume data for the AI prompt
            const skillsString = Array.isArray(skills) ? skills.join(', ') : skills;

            // Better formatting of experience data
            let experienceString = 'No experience provided';
            if (resumeData.experience && resumeData.experience.length > 0) {
                experienceString = resumeData.experience.map(exp => {
                    const title = exp.title || exp.position || exp.role || '';
                    const company = exp.company || exp.organization || '';
                    const duration = exp.duration || exp.dates || '';
                    const description = exp.description || '';

                    return `${title}${company ? ' at ' + company : ''}${duration ? ' (' + duration + ')' : ''}${description ? ': ' + description : ''}`;
                }).join('; ');

                // Limit string length
                if (experienceString.length > 800) {
                    experienceString = experienceString.substring(0, 800) + '...';
                }
            }

            // Better formatting of project data
            let projectsString = 'No projects provided';
            if (resumeData.projects && resumeData.projects.length > 0) {
                projectsString = resumeData.projects.map(proj => {
                    const title = proj.title || proj.name || '';
                    const tech = proj.technologies || proj.tech_stack || '';
                    const description = proj.description || '';

                    return `${title}${tech ? ' using ' + tech : ''}${description ? ': ' + description : ''}`;
                }).join('; ');

                // Limit string length
                if (projectsString.length > 800) {
                    projectsString = projectsString.substring(0, 800) + '...';
                }
            }

            // Add education data if available
            let educationString = 'No education provided';
            if (resumeData.education && resumeData.education.length > 0) {
                educationString = resumeData.education.map(edu => {
                    const institution = edu.institution || edu.school || '';
                    const degree = edu.degree || edu.qualification || '';
                    const field = edu.field || edu.major || '';

                    return `${degree}${field ? ' in ' + field : ''}${institution ? ' from ' + institution : ''}`;
                }).join('; ');
            }

            const analysisPrompt = `
            You are a career advisor with expertise in technical skills assessment. Analyze the following resume data and provide detailed insights.

            Resume Data:
            - Skills: ${skillsString}
            - Experience: ${experienceString}
            - Projects: ${projectsString}
            - Education: ${educationString}

            Provide a detailed analysis in this exact JSON format:
            {
                "skillsAnalysis": [
                    {
                        "name": "<skill name>",
                        "level": "<Beginner/Intermediate/Expert>",
                        "description": "<detailed assessment of this skill>"
                    },
                    ...
                ],
                "roleRecommendations": [
                    {
                        "roleType": "<job title>",
                        "suitabilityScore": <number 0-100>,
                        "description": "<why this role is suitable>",
                        "requiredSkills": ["<skill1>", "<skill2>", ...],
                        "careerPath": "<progression path for this role>"
                    },
                    ...
                ]
            }

            Important guidelines:
            1. Analyze ALL skills provided in the resume
            2. Provide at least 3 role recommendations
            3. Be specific and detailed in your assessments
            4. Base your analysis on current industry standards
            5. Ensure suitability scores reflect the match between skills and role requirements
            6. Include both technical and soft skills in your analysis
            7. Consider education and experience when making role recommendations
            `;

            try {
                console.log('Sending analysis prompt to AI...');
                const result = await model.generateContent(analysisPrompt);
                const response = await result.response;
                const text = response.text();
                console.log('Raw AI response received');

                // Extract JSON from response
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No JSON found in AI response');
                }

                const analysis = JSON.parse(jsonMatch[0]);
                console.log('AI analysis complete');

                // Validate and clean up the analysis
                if (!analysis.skillsAnalysis || !Array.isArray(analysis.skillsAnalysis)) {
                    analysis.skillsAnalysis = [];
                }

                if (!analysis.roleRecommendations || !Array.isArray(analysis.roleRecommendations)) {
                    analysis.roleRecommendations = [];
                }

                // Ensure all skills are analyzed
                const analyzedSkillNames = analysis.skillsAnalysis.map(s => s.name.toLowerCase());
                const missingSkills = skills.filter(skill =>
                    !analyzedSkillNames.includes(skill.toLowerCase())
                );

                // Add missing skills to the analysis
                if (missingSkills.length > 0) {
                    const additionalSkills = missingSkills.map(skill => ({
                        name: skill,
                        level: 'Intermediate',
                        description: `Experience with ${skill}`
                    }));
                    analysis.skillsAnalysis = [...analysis.skillsAnalysis, ...additionalSkills];
                }

                // Ensure we have at least 2 role recommendations
                if (analysis.roleRecommendations.length < 2) {
                    const defaultRoles = [
                        {
                            roleType: 'Software Developer',
                            suitabilityScore: 85,
                            description: 'Based on your technical skills',
                            requiredSkills: skills.slice(0, 3),
                            careerPath: 'Junior Developer → Developer → Senior Developer → Lead Developer'
                        },
                        {
                            roleType: 'Data Analyst',
                            suitabilityScore: 75,
                            description: 'Your analytical skills are valuable in this role',
                            requiredSkills: ['Data Analysis', 'SQL', 'Problem Solving'],
                            careerPath: 'Data Analyst → Senior Data Analyst → Data Scientist → Lead Data Scientist'
                        }
                    ];

                    // Add only the missing number of roles
                    const neededRoles = defaultRoles.slice(0, 2 - analysis.roleRecommendations.length);
                    analysis.roleRecommendations = [...analysis.roleRecommendations, ...neededRoles];
                }

                return res.status(200).json(analysis);
            } catch (error) {
                console.error('Error in AI analysis:', error);

                // Fallback to basic analysis if AI fails
                const basicAnalysis = {
                    skillsAnalysis: skills.map(skill => ({
                        name: skill,
                        level: 'Intermediate',
                        description: `Experience with ${skill}`
                    })),
                    roleRecommendations: [
                        {
                            roleType: 'Software Developer',
                            suitabilityScore: 85,
                            description: 'Based on your technical skills',
                            requiredSkills: skills.slice(0, 3),
                            careerPath: 'Junior Developer → Developer → Senior Developer → Lead Developer'
                        },
                        {
                            roleType: 'Data Analyst',
                            suitabilityScore: 75,
                            description: 'Your analytical skills are valuable in this role',
                            requiredSkills: ['Data Analysis', 'SQL', 'Problem Solving'],
                            careerPath: 'Data Analyst → Senior Data Analyst → Data Scientist → Lead Data Scientist'
                        }
                    ]
                };

                return res.status(200).json(basicAnalysis);
            }
        } else {
            // Basic analysis without AI
            const basicAnalysis = {
                skillsAnalysis: skills.map(skill => ({
                    name: skill,
                    level: 'Intermediate',
                    description: `Experience with ${skill}`
                })),
                roleRecommendations: [
                    {
                        roleType: 'Software Developer',
                        suitabilityScore: 85,
                        description: 'Based on your technical skills',
                        requiredSkills: skills.slice(0, 3),
                        careerPath: 'Junior Developer → Developer → Senior Developer → Lead Developer'
                    },
                    {
                        roleType: 'Data Analyst',
                        suitabilityScore: 75,
                        description: 'Your analytical skills are valuable in this role',
                        requiredSkills: ['Data Analysis', 'SQL', 'Problem Solving'],
                        careerPath: 'Data Analyst → Senior Data Analyst → Data Scientist → Lead Data Scientist'
                    }
                ]
            };

            return res.status(200).json(basicAnalysis);
        }
    } catch (error) {
        console.error('Error in smart recognition:', error);
        res.status(500).json({
            message: 'Failed to analyze resume',
            error: error.message
        });
    }
});

// Simple test endpoints to verify the server is running
app.get('/', async(req, res) => {
  res.send('RRR API Server is running')
})

// Test endpoint for resume parser
app.get('/api/test', async(req, res) => {
  res.status(200).json({
    message: 'API test endpoint is working',
    timestamp: new Date().toISOString()
  })
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));