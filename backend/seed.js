/**
 * ============================================
 * TCS Database Seed Script
 * ============================================
 * Seeds MongoDB with default data matching the frontend.
 * 
 * Usage:
 *   node seed.js          → Insert only if collections are empty
 *   node seed.js --fresh  → Drop all data and re-seed everything
 * ============================================
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("./models/User");
const Event = require("./models/Event");
const Announcement = require("./models/Announcement");
const Cabinet = require("./models/Cabinet");
const Faculty = require("./models/Faculty");
const Ticket = require("./models/Ticket");
const Gallery = require("./models/Gallery");
const Program = require("./models/Program");
const Degree = require("./models/Degree");
const HomeContent = require("./models/HomeContent");

const isFresh = process.argv.includes("--fresh");

// ========================
// Seed Data
// ========================

const ADMIN_USER = {
    name: "TCS Admin",
    email: "admin@tcs.uaf",
    password: "admin123",
    role: "admin",
};

const EVENTS = [
    {
        title: "Tech & Entrepreneurship Summit 4.0",
        date: "2025-10-28",
        time: "18:00",
        venue: "D-Ground (UAF)",
        status: "open",
        featured: true,
        capacity: 300,
        seatsRemaining: 120,
        tags: ["Keynote", "Panel", "Social Night"],
        description: "A featured TCS event with talks, networking and a social night.",
    },
    {
        title: "Programming in Big Data – Seminar",
        date: "2025-10-17",
        time: "11:00",
        venue: "Lecture Theatre, CS Dept.",
        status: "open",
        featured: false,
        capacity: 150,
        seatsRemaining: 70,
        tags: ["Seminar", "Big Data"],
        description: "Seminar on Big Data programming practices.",
    },
];

const ANNOUNCEMENTS = [
    { title: "Midterm Exam Schedule Released", body: "The midterm examination schedule for Fall 2024 has been released. Please check your student portal for detailed date and time slots. Make sure to prepare accordingly.", date: "2024-12-28", priority: "important", tags: ["Academic", "Exams"], link: "", linkText: "" },
    { title: "Tech & Entrepreneurship Summit 4.0", body: "Join us for the biggest tech event of the year! Register now to secure your spot. Limited seats available. The summit will feature industry leaders, workshops, and networking sessions.", date: "2024-12-25", priority: "urgent", tags: ["Event", "Summit"], link: "/events", linkText: "Register Now" },
    { title: "New Library Resources Available", body: "The department library has acquired new books and digital resources. Visit the library to explore the latest additions to our collection.", date: "2024-12-20", priority: "normal", tags: ["Library", "Resources"], link: "", linkText: "" },
];

const CABINET = [
    { name: "Muhammad Adan", role: "President", degree: "BS Computer Science", agNo: "2022-AG-9800", interests: ["Leadership", "Community", "Events"], phone: "+92 300 0000000", email: "adan@example.com", summary: "Leads TCS operations, manages society vision, and coordinates with faculty and industry.", avatar: "/src/assets/images/image10.png", socials: { linkedin: "", instagram: "", facebook: "" }, order: 0 },
    { name: "Mannoor B.", role: "Vice President", degree: "BS Software Engineering", agNo: "2023-AG-12001", interests: ["Management", "Design", "Operations"], phone: "+92 300 0000000", email: "mannoor@example.com", summary: "Supports president, supervises teams, and ensures smooth execution of events.", avatar: "/src/assets/images/image11.png", socials: { linkedin: "", instagram: "", facebook: "" }, order: 1 },
];

const FACULTY = [
    { name: "Dr. ABC Example", departmentRole: "Professor", education: "PhD Computer Science", experienceYears: 10, expertise: ["Machine Learning", "Data Mining", "Research"], courses: ["AI", "ML", "Data Science"], universities: ["UAF"], email: "abc@example.com", phone: "+92 300 0000000", summary: "Faculty mentor for TCS, provides guidance on research, competitions, and academic direction.", avatar: "/src/assets/images/image12.png", socials: { linkedin: "", website: "" }, order: 0 },
    { name: "Prof. XYZ Example", departmentRole: "Chairman", education: "PhD (CS)", experienceYears: 20, expertise: ["Leadership", "Policy", "Academics"], courses: ["—"], universities: ["UAF", "Other University"], email: "xyz@example.com", phone: "+92 300 0000000", summary: "Senior leadership role; supports departmental initiatives and student societies.", avatar: "/src/assets/images/image13.png", socials: { linkedin: "", website: "" }, order: 1 },
];

const GALLERY = [
    { title: "Orientation Day", images: ["/src/assets/images/image1.png", "/src/assets/images/image10.png", "/src/assets/images/image11.png", "/src/assets/images/image12.png", "/src/assets/images/image13.png", "/src/assets/images/image14.png", "/src/assets/images/image15.png", "/src/assets/images/image2.png"] },
    { title: "Tech Talk Series", images: ["/src/assets/images/image13.png", "/src/assets/images/image14.png", "/src/assets/images/image15.png", "/src/assets/images/image2.png", "/src/assets/images/image3.png", "/src/assets/images/image4.png", "/src/assets/images/image5.png", "/src/assets/images/image6.png"] },
    { title: "Hackathon Night", images: ["/src/assets/images/image3.png", "/src/assets/images/image4.png", "/src/assets/images/image5.png", "/src/assets/images/image6.png", "/src/assets/images/image7.png", "/src/assets/images/image8.png", "/src/assets/images/image9.png", "/src/assets/images/image1.png"] },
    { title: "Sports Gala", images: ["/src/assets/images/image7.png", "/src/assets/images/image8.png", "/src/assets/images/image9.png", "/src/assets/images/image1.png", "/src/assets/images/image10.png", "/src/assets/images/image11.png", "/src/assets/images/image12.png", "/src/assets/images/image13.png"] },
    { title: "Seminar & Workshop", images: ["/src/assets/images/image10.png", "/src/assets/images/image11.png", "/src/assets/images/image12.png", "/src/assets/images/image13.png", "/src/assets/images/image14.png", "/src/assets/images/image15.png", "/src/assets/images/image2.png", "/src/assets/images/image3.png"] },
    { title: "Freshers Party", images: ["/src/assets/images/image14.png", "/src/assets/images/image15.png", "/src/assets/images/image2.png", "/src/assets/images/image3.png", "/src/assets/images/image4.png", "/src/assets/images/image5.png", "/src/assets/images/image6.png", "/src/assets/images/image7.png"] },
];

const PROGRAMS = [
    { title: "Web Development Bootcamp", type: "bootcamp", description: "Intensive 6-week bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Build real-world projects and get job-ready skills.", icon: "💻", duration: "6 Weeks", participants: 50, status: "upcoming", startDate: "2025-01-15", instructor: "Dr. Ahmed Khan", tags: ["Web", "Frontend", "Backend"] },
    { title: "AI & Machine Learning Workshop", type: "workshop", description: "Learn the fundamentals of AI and ML with hands-on Python exercises. Covers supervised learning, neural networks, and real applications.", icon: "🤖", duration: "3 Days", participants: 40, status: "open", startDate: "2025-01-20", instructor: "Prof. Sarah Ali", tags: ["AI", "ML", "Python"] },
    { title: "Competitive Programming Contest", type: "competition", description: "Test your algorithmic skills in our annual coding competition. Win prizes and recognition!", icon: "🏆", duration: "8 Hours", participants: 100, status: "open", startDate: "2025-02-01", instructor: "ACM Chapter", tags: ["Algorithms", "DSA", "Contest"] },
    { title: "Industry Expert Talk Series", type: "talk", description: "Monthly sessions with industry professionals sharing insights on tech careers, trends, and best practices.", icon: "🎤", duration: "2 Hours", participants: 200, status: "ongoing", startDate: "2025-01-10", instructor: "Various Speakers", tags: ["Career", "Industry", "Networking"] },
];

const DEGREES = [
    { code: "BS CS", name: "Computer Science", fullName: "Bachelor of Science in Computer Science", duration: "4 Years", semesters: 8, description: "A comprehensive program covering programming, algorithms, databases, AI, software engineering, and computer systems.", icon: "💻", courses: ["Programming Fundamentals", "Data Structures", "Algorithms", "Database Systems", "Operating Systems", "Computer Networks", "AI & ML", "Software Engineering"], pdfUrl: "" },
    { code: "BS SE", name: "Software Engineering", fullName: "Bachelor of Science in Software Engineering", duration: "4 Years", semesters: 8, description: "Focused on software development lifecycle, project management, quality assurance, and modern development practices.", icon: "⚙️", courses: ["Software Design", "Requirements Engineering", "Project Management", "Testing & QA", "DevOps", "Agile Methods"], pdfUrl: "" },
    { code: "BS IT", name: "Information Technology", fullName: "Bachelor of Science in Information Technology", duration: "4 Years", semesters: 8, description: "Covers IT infrastructure, networking, system administration, cybersecurity, and enterprise solutions.", icon: "🌐", courses: ["Network Administration", "Cybersecurity", "Cloud Computing", "IT Management", "Web Technologies"], pdfUrl: "" },
    { code: "BS AI", name: "Artificial Intelligence", fullName: "Bachelor of Science in Artificial Intelligence", duration: "4 Years", semesters: 8, description: "Specialized in machine learning, deep learning, NLP, computer vision, and intelligent systems development.", icon: "🤖", courses: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Robotics", "Neural Networks"], pdfUrl: "" },
    { code: "BS DS", name: "Data Science", fullName: "Bachelor of Science in Data Science", duration: "4 Years", semesters: 8, description: "Combines statistics, programming, and domain expertise to extract insights from data using modern tools.", icon: "📊", courses: ["Statistics", "Data Mining", "Big Data", "Data Visualization", "Python for DS", "R Programming"], pdfUrl: "" },
    { code: "BS BI", name: "Business Informatics", fullName: "Bachelor of Science in Business Informatics", duration: "4 Years", semesters: 8, description: "Bridges technology and business, covering ERP systems, business analytics, and IT consulting.", icon: "📈", courses: ["Business Analytics", "ERP Systems", "IT Consulting", "E-Commerce", "Management Information Systems"], pdfUrl: "" },
];

const HOME_CONTENT = {
    heroTitle: { line1: "THE", line2: "COMPUTING", line3: "SOCIETY" },
    heroBadge: "Official Society • Dept. of Computer Science • UAF",
    heroDescription: "Connecting students, faculty, and industry through workshops, competitions, talks, hackathons, and social nights. Building the next generation of tech leaders at UAF.",
    stats: [
        { number: "25+", label: "Events / Year" },
        { number: "600+", label: "Active Members" },
        { number: "10+", label: "Faculty Mentors" },
    ],
    notices: [
        { title: "Latest Announcement", meta: "Midterm schedule uploaded • PDF", icon: "📢", gradient: "linear-gradient(135deg, #dc2743, #c234a5)" },
        { title: "Upcoming Event", meta: "Tech & Entrepreneurship Summit 4.0", icon: "🎤", gradient: "linear-gradient(135deg, #9b59b6, #00d9ff)" },
        { title: "Tickets Open", meta: "Generate QR ticket in seconds", icon: "🎟️", gradient: "linear-gradient(135deg, #00d9ff, #00ff88)" },
    ],
    features: [
        { icon: "🚀", title: "Workshops", desc: "Hands-on learning sessions" },
        { icon: "🏆", title: "Competitions", desc: "Showcase your skills" },
        { icon: "💡", title: "Hackathons", desc: "48-hour innovation sprints" },
        { icon: "🎯", title: "Bootcamps", desc: "Intensive skill training" },
    ],
    quickLinks: [
        { label: "Meet the Cabinet", path: "/cabinet", icon: "👥" },
        { label: "Our Faculty", path: "/faculty", icon: "👨‍🏫" },
        { label: "Gallery", path: "/gallery", icon: "📸" },
        { label: "Admin Portal", path: "/admin/login", icon: "🔐" },
    ],
};

// ========================
// Seed Function
// ========================

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        if (isFresh) {
            console.log("🗑️  Fresh mode: Dropping all collections...");
            const collections = await mongoose.connection.db.listCollections().toArray();
            for (const col of collections) {
                await mongoose.connection.db.dropCollection(col.name);
                console.log(`   Dropped: ${col.name}`);
            }
        }

        // Seed Admin
        const existingAdmin = await User.findOne({ email: ADMIN_USER.email });
        if (!existingAdmin) {
            // Use .create() so that the pre-save hook for password hashing runs
            await User.create(ADMIN_USER);
            console.log("👤 Admin user created (admin@tcs.uaf / admin123)");
        } else {
            console.log("👤 Admin user already exists");
        }

        // Seed Events
        if ((await Event.countDocuments()) === 0) {
            await Event.insertMany(EVENTS);
            console.log(`📅 ${EVENTS.length} events seeded`);
        } else {
            console.log("📅 Events already exist");
        }

        // Seed Announcements
        if ((await Announcement.countDocuments()) === 0) {
            await Announcement.insertMany(ANNOUNCEMENTS);
            console.log(`📢 ${ANNOUNCEMENTS.length} announcements seeded`);
        } else {
            console.log("📢 Announcements already exist");
        }

        // Seed Cabinet
        if ((await Cabinet.countDocuments()) === 0) {
            await Cabinet.insertMany(CABINET);
            console.log(`👥 ${CABINET.length} cabinet members seeded`);
        } else {
            console.log("👥 Cabinet already exists");
        }

        // Seed Faculty
        if ((await Faculty.countDocuments()) === 0) {
            await Faculty.insertMany(FACULTY);
            console.log(`🎓 ${FACULTY.length} faculty members seeded`);
        } else {
            console.log("🎓 Faculty already exists");
        }

        // Seed Gallery
        if ((await Gallery.countDocuments()) === 0) {
            await Gallery.insertMany(GALLERY);
            console.log(`📸 ${GALLERY.length} gallery albums seeded`);
        } else {
            console.log("📸 Gallery already exists");
        }

        // Seed Programs
        if ((await Program.countDocuments()) === 0) {
            await Program.insertMany(PROGRAMS);
            console.log(`🎯 ${PROGRAMS.length} programs seeded`);
        } else {
            console.log("🎯 Programs already exist");
        }

        // Seed Degrees
        if ((await Degree.countDocuments()) === 0) {
            await Degree.insertMany(DEGREES);
            console.log(`🏫 ${DEGREES.length} degree programs seeded`);
        } else {
            console.log("🏫 Degrees already exist");
        }

        // Seed Home Content
        if ((await HomeContent.countDocuments()) === 0) {
            await HomeContent.create(HOME_CONTENT);
            console.log("🏠 Home page content seeded");
        } else {
            console.log("🏠 Home content already exists");
        }

        console.log("");
        console.log("✅ Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error.message);
        process.exit(1);
    }
}

seed();
