# 🎓 THE COMPUTING SOCIETY (TCS) — THE MASTER MANUAL 🚀

```text
========================================================================================
 _____ _   _ _____   ____ ___  __  __ ____  _   _ _____ ___ _   _  ____   ____   ___ 
|_   _| | | | ____| / ___/ _ \|  \/  |  _ \| | | |_   _|_ _| \ | |/ ___| / ___| / _ \ 
  | | | |_| |  _|  | |  | | | | |\/| | |_) | | | | | |  | ||  \| | |  _  \___ \| | | |
  | | |  _  | |___ | |__| |_| | |  | |  __/| |_| | | |  | || |\  | |_| |  ___) | |_| |
  |_| |_| |_|_____| \____\___/|_|  |_|_|    \___/  |_| |___|_| \_|\____| |____/ \___/ 
                                                                                      
                  OFFICIAL MERN PLATFORM • DEPARTMENT OF COMPUTER SCIENCE
========================================================================================
```

Welcome to the ultimate repository and official developer documentation manual for **The Computing Society (TCS)**. This platform is a modern, high-performance, and visually captivating MERN-stack web ecosystem built specifically to digitize, streamline, and handle student engagements, event registrations, secure digital ticketing, professional academic certifications, and administrator-level content management.

---

## 🔑 Pre-Seeded Test Accounts

To bypass manual registrations and test the entire system instantly, use the following pre-seeded credentials:

### 🛡️ Administrator Panel
* **Access URL**: `http://localhost:5173/admin/login` (or select **Admin Portal** from the landing page)
* **Email**: `admin@tcs.uaf`
* **Password**: `admin123`

### 🎓 Student Portal
* **Access URL**: `http://localhost:5173/login`
* **Email**: `student@tcs.uaf`
* **Password**: `student123`

---

## 💻 System Prerequisites & Software Requirements

Before getting started with local setup, verify that your development environment satisfies the following system configurations:

| Requirement | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **☕ Node.js** | `v18.x.x` or `v20.x.x` (LTS) | JavaScript runtime for compiling frontend and running backend. |
| **📦 npm** | `v9.x.x` or higher | Package manager to resolve and install project dependencies. |
| **🍃 MongoDB** | `v6.x.x` or higher | Database instance (Local Community Server or Cloud Atlas URI). |
| **🌐 Modern Browser**| Chrome, Edge, Brave, Safari | Supported browsers to render Framer Motion & handle QR camera scanning. |
| **🔌 Camera/Webcam** | Integrated or external USB | Mandatory for testing in-dashboard QR ticket entry scanning. |

---

## 📥 Detailed Step-by-Step Installation Guide

Follow these exact steps to clone the repository, configure variables, resolve packages, seed database records, and spin up development servers:

### 1. Clone the Codebase
Open your terminal, navigate to your workspace directory, and clone the official repository:
```bash
git clone https://github.com/ahmadnadeem-12/TCS-U3F.git
cd TCS-U3F
```

### 2. Configure Backend Environment Variables
Create a file named `.env` inside the `backend/` directory:
```env
# System Configurations
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/tcs_database

# Cryptography & Security Sessions
JWT_SECRET=your_super_complex_secret_session_token_key_here
JWT_EXPIRE=30d

# Cross-Origin Policies
CORS_ORIGIN=*

# Rate Limiting Controls
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=150
```

### 3. Install Dependencies
Install all package dependencies for both the backend server and frontend client:
```bash
# Navigate to backend and install packages
cd backend
npm install

# Return to parent directory, open frontend, and install packages
cd ../frontend
npm install
```

### 4. Populate Real Mock Data (Seeding)
To quickly populate your local MongoDB with realistic mock data (including users, events, cabinet members, programs, degrees, and announcements):
```bash
cd ../backend
node seed.js
```
> [!NOTE]  
> To reset the database entirely and drop existing collections before injecting clean seeds, run:  
> `npm run seed:fresh` or `node seed.js --fresh`

### 5. Spin Up Local Servers Concurrently
To run both backend and frontend development environments together, open two distinct terminal windows:

* **Terminal 1: Run Backend Express Server**
  ```bash
  cd backend
  npm run dev
  ```
  *(Launches server on `http://localhost:5000` with nodemon auto-restart enabled)*

* **Terminal 2: Run Frontend Vite Client**
  ```bash
  cd frontend
  npm run dev
  ```
  *(Spins up client on `http://localhost:5173` with fast hot-module replacement)*

Once active, open your browser and head to `http://localhost:5173` to explore!

---

## 📂 Detailed Codebase Architecture

The project structure is split into two cleanly decoupled root folders:

```text
THE COMPUTING SOCIETY/
├── backend/                        # Node.js + Express Server API
│   ├── config/                     # Configuration scripts
│   │   └── db.js                   # Mongoose connection and indexing setups
│   ├── middleware/                 # System security and filter layers
│   │   ├── authMiddleware.js       # Protects paths via JWT validations and checks roles
│   │   ├── errorHandler.js         # Standardizes JSON error messages and captures crashes
│   │   └── validation.js           # Validates request data formats (such as emails)
│   ├── models/                     # Database Schemas (Mongoose ODM)
│   │   ├── Announcement.js         # Pushed bulletin and updates details
│   │   ├── AuditLog.js             # Records critical admin modifications
│   │   ├── Cabinet.js              # Student representative profiles
│   │   ├── Degree.js               # Degrees curriculum lists and paths
│   │   ├── Event.js                # Events dates, venues, capacities, and spotlight status
│   │   ├── Faculty.js              # Faculty information and courses taught
│   │   ├── Gallery.js              # Photos and media assets from prior activities
│   │   ├── HomeContent.js          # Editable landing page texts and taglines
│   │   ├── Program.js              # Seminars, workshops, and courses data
│   │   ├── Theme.js                # Active website design styles and colors
│   │   ├── Ticket.js               # Event digital passes, QR structures, and statuses
│   │   └── User.js                 # Authentication records (Admin vs Student)
│   ├── routes/                     # Maps API endpoints to schemas
│   │   ├── auth.js                 # Logins, signups, and recovery routes
│   │   ├── tickets.js              # Ticket issuances, updates, and scanner check-ins
│   │   └── events.js               # Managing scheduler records
│   ├── seed.js                     # Script to populate database with realistic mock data
│   └── server.js                   # Entrypoint that bootstraps middlewares and servers
│
├── frontend/                       # Vite + React Client
│   ├── public/                     # Static icons, logos, and images
│   ├── src/                        # Core React source code
│   │   ├── assets/                 # CSS styling structures and assets
│   │   │   ├── images/             # Standard logos, borders, and visual assets
│   │   │   └── styles/             # Premium Vanilla CSS modular sheets
│   │   │       ├── global.css      # Standard colors, global variables, and alignments
│   │   │       └── pages/          # CSS sheets dedicated to individual pages
│   │   ├── components/             # Reusable React components
│   │   │   ├── common/             # Navbar, Footer, Loader, ProtectedRoute, ErrorBoundary
│   │   │   └── ui/                 # EventSpotlight, LoadingSpinner, Custom Buttons
│   │   ├── context/                # Global contexts
│   │   │   ├── AuthContext.jsx     # Tracks session states and logged-in profiles
│   │   │   └── ThemeContext.jsx    # Sets active design CSS variables live
│   │   ├── pages/                  # Top-level website pages
│   │   │   ├── Home.jsx            # Landing page with spotlights and notices
│   │   │   ├── Profile.jsx         # User profile details and registered tickets list
│   │   │   ├── Tickets.jsx         # Student ticket page for checking dynamic passes
│   │   │   └── admin/              # Central control panel pages
│   │   │       ├── AdminTickets.jsx# In-person QR Scanning check-in desk
│   │   │       └── tabs/           # Modular Admin Tabs (Events, Users, Logs, Themes)
│   │   ├── routes/                 # Navigation router configuration
│   │   │   └── AppRoutes.jsx       # Lazy loading paths and role-based guards
│   │   ├── services/               # Handles network and utility requests
│   │   │   ├── api.js              # Axios instance configured with tokens
│   │   │   └── pdfService.js       # Renders tickets and certificates into high-quality PDFs
│   │   └── App.jsx                 # Entry layout with preloader booting system
│   └── vite.config.js              # Configures bundles, HMR, and build parameters
└── README.md                       # Explains working details
```

---

## 🔄 End-to-End User Workflows

### 1. Account Signup & Secure Login Workflow
* **Registration**: A student visits `http://localhost:5173/register` and inputs their name, university email, password, department, and AG Number (e.g. `2022-AG-9800`).
* **Cryptographic Hashing**: The backend receives the request, validates the email format, and runs the password through `bcryptjs` using a workload factor of `10` salt rounds, protecting against dictionary and brute-force attacks.
* **Issuing Session**: Upon log in, the backend issues a stateless **JSON Web Token (JWT)**, which contains the user's role and unique ID, signed with the server's secret key. The frontend stores this token to authenticate subsequent API requests.

### 2. Password Recovery Loop (Forgot & Reset Password)
If a student loses access to their account, the recovery system operates as follows:

```text
[ Forgot Password Form ] ──> Enter Email ──> [ Server validates record ]
                                                         │
[ New Credentials Set ] <── Reset Token Form <── [ Simulates reset link ]
                                 │
                  (http://localhost:5173/reset-password/:token)
```

1. **Triggering Recovery**: The student clicks **Forgot Password?** on the login page, types their email, and submits the form.
2. **Generating Reset Token**: The backend checks for the user, creates a unique password reset token, and saves its expiration time (usually 1 hour) in the database.
3. **Recovery Link Creation**: The server generates a unique recovery link containing the token parameter:  
   `http://localhost:5173/reset-password/a7b8c9d10ef...`
4. **Updating Credentials**: When the user opens this link, the frontend extracts the token from the URL and displays the **Reset Password Screen**. The user types their new password and submits. The backend verifies the token, hashes the new password, and updates the user's account securely.

### 3. Profile Management & Personal Digital Pass Hub
* **Profile Dashboard**: Once logged in, clicking on the navigation bar profile link redirects students to their profile dashboard.
* **Bio Updates**: Students can modify their department, update their contact number, and refine account credentials on-the-fly.
* **Digital Passes**: The page displays a list of all event registrations. Students can view active tickets, check their check-in status, and open their digital passes instantly.

### 4. Event Registration & Automated QR Pass System
* **Selecting Events**: Students browse open events on the platform (e.g., Tech Summits or DSA Workshops).
* **Booking**: Clicking **Register Now** prompts the backend to create a registration record and decrement the event's remaining seat count.
* **QR Ticket Generation**: The system generates a digital pass containing registration details, complete with a dynamic QR code containing the registration ID.
* **Premium PDF Printing**: Students can download their pass as a printable PDF. The design includes smooth color-interpolated linear gradient borders (Pink -> Purple -> Cyan), distinct section divisions, and clean typography.

---

## 🛡️ Administrator Functionalities & Tab Workings

The **Admin Dashboard** (`/admin/dashboard`) is a centralized, modular control panel designed with specialized tabs. Here is exactly how each tab operates and what administrators can do:

### 👥 Users Tab (Account Management)
* **User Overview**: View all registered user profiles on the platform.
* **Control Actions**: Search for users by name or email, remove inactive student profiles, and promote students to administrators or demote other accounts as needed.

### 📅 Events Tab (CRUD & Spotlight)
* **Event Scheduler**: Create, read, update, or delete society events.
* **Registration Controls**: Set maximum seat capacities, adjust ticket limits, assign categories, and toggle status.
* **Spotlight Feature**: Highlight major upcoming summits directly on the Homepage Spotlight section.

### 🎫 Tickets Tab (QR Attendance Tracker)
* **In-Person Scanning**: Built-in camera QR scanner allows administrators to scan a student's digital pass at the entrance of an event.
* **Real-time Attendance**: The system decodes the QR code, verifies ticket authenticity, and automatically updates the student's status to **Checked In** in the database.
* **Batch Exports**: Download all registered event passes as a combined multi-ticket PDF with optimized grid layouts for printing.

### 📣 Announcements Tab (Campus Communications)
* **Bulletin Postings**: Push important announcements, midterm schedules, or event notices directly to the homepage banner.
* **Urgency Levels**: Set priority tags (Normal, Important, Urgent) to color-code announcements and alert the campus.

### 💼 Cabinet Tab (Representatives Directory)
* **Cabinet Directory**: Manage the directory of student representatives on the public cabinet page.
* **Role Customization**: Update portfolios, add contact numbers, upload custom avatar images, and set interests.

### 👨‍🏫 Faculty Tab (Mentor Management)
* **Faculty Directory**: Manage professional teacher profiles on the public faculty page.
* **Bio Building**: Add professor fields of study, departments, courses taught, and contact details.

### 🎨 Theme Tab (Live CSS Editor)
* **Styling Control**: Change the visual feel of the entire platform live without modifying any CSS code.
* **Dynamic CSS Variables**: Administrators can use color pickers to dynamically edit core layout colors (primary, secondary, and accent colors), changing background gradients and visual properties across all devices instantly.

### 📜 Audit Logs Tab (Operations Ledger)
* **Accountability Logger**: Automatically records critical system changes, data modifications, or deletions made by administrators.
* **Security Auditing**: Tracks who made changes and when, maintaining clean operations and maximum platform security.

---

## 📦 Full Technology Stack & Library Catalog

The platform is built using a modern, performance-optimized technology stack:

### 🛡️ Backend Server Libraries & Dependencies

| Library Name | Version | Function & Role | Why It is Essential |
| :--- | :--- | :--- | :--- |
| **`express`** | `^4.22.1` | Web framework | Provides routing and HTTP utilities to build our REST API endpoints. |
| **`mongoose`** | `^9.2.1` | MongoDB ODM | Offers schema-based modeling, validation, and database connection utilities. |
| **`bcryptjs`** | `^3.0.3` | Cryptographic hashing | Hashes user passwords securely using salted rounds before database storage. |
| **`jsonwebtoken`**| `^9.0.3` | Session Tokens | Generates and decodes secure stateless JWT session tokens for authentication. |
| **`dotenv`** | `^17.3.1` | Environment loader | Loads system configuration variables from our private `.env` file into `process.env`. |
| **`cors`** | `^2.8.6` | Access Policies | Controls Cross-Origin Resource Sharing, restricting API requests to trusted domains. |
| **`helmet`** | `^8.1.0` | Header protection | Sets secure HTTP headers to mitigate cross-site scripting (XSS) and clickjacking attacks. |
| **`compression`**| `^1.8.1` | Payload optimizer | Compresses all HTTP responses using Gzip compression to minimize payload size. |
| **`morgan`** | `^1.10.1` | API Logger | Formats and prints real-time HTTP requests in the console for monitoring. |
| **`nodemailer`** | `^8.0.1` | Mail Client | Sends transaction alerts, email verifications, and recovery links to users. |
| **`nodemon`** | `^3.1.14` | Hot Reload Dev-tool | Monitors server file changes and automatically reboots the API process. |

### 🎨 Frontend Client Libraries & Dependencies

| Library Name | Version | Function & Role | Why It is Essential |
| :--- | :--- | :--- | :--- |
| **`react`** | `^18.3.1` | Core UI Library | Powers our component-based user interface using a fast Virtual DOM. |
| **`react-router-dom`** | `^6.26.2` | Single-Page Router | Manages client-side routing, protected navigation guards, and lazy-loaded code splitting. |
| **`axios`** | `^1.7.7` | HTTP Client | Performs asynchronous AJAX queries to backend endpoints using interceptor tokens. |
| **`framer-motion`** | `^11.5.6` | Visual Animations | Powers premium transitions, hover transformations, and micro-interactions. |
| **`jspdf`** | `^4.0.0` | Client-side PDF Generator | Compiles layout nodes, coordinates, and images to generate digital passes. |
| **`html2canvas`** | `^1.4.1` | Screen Canvas Capturer| Captures rendered DOM nodes to produce high-fidelity printable certificates. |
| **`html5-qrcode`** | `^2.3.8` | Video QR Decoder | Accesses device cameras to scan and decode digital ticket codes in real-time. |
| **`qrcode.react`** | `^3.1.0` | QR Code Encoder | Converts unique ticket codes into clean, responsive SVG/canvas QR codes inside passes. |
| **`@emailjs/browser`** | `^4.4.1` | Direct Mail Sender | Delivers transaction confirmations directly from the browser without dedicated email servers. |
| **`vite`** | `^5.4.8` | Next-gen Bundler | Packs client assets and operates an extremely fast Hot Module Replacement (HMR) server. |

---

## 🔒 Security & Performance Engineering

* **Auto-Syncing Indexes**: On server startup, the backend automatically drops outdated indexes and synchronizes current collections on schemas (such as `Ticket.js`) via Mongoose's `syncIndexes()`, preventing duplicate key collisions.
* **Input Validation & Sanitization**: Strict email patterns, character limits, and data validation are enforced on both client and server layers.
* **Rate-Limit Protections**: Global rate-limiting middleware blocks repetitive script attacks, brute-force login attempts, and endpoint abuse.
* **Gzip Compression**: Gzip payload compression reduces transit times for data packets, keeping responses fast on slower networks.

---

## 🛠️ Troubleshooting & FAQ

#### 1. "Error: Port 5173 is already in use"
* **Cause**: Another local project or shell session is already running Vite on this port.
* **Fix**: Terminate the active process, or Vite will automatically assign an alternative port (e.g., `5174`). Update your backend `.env` `CORS_ORIGIN` if necessary.

#### 2. "MongoDB Connection Timeout / Network Error"
* **Cause**: Your local MongoDB service is inactive, or your cloud MongoDB Atlas connection is blocked by your network's firewall.
* **Fix**: Ensure your local MongoDB server is running (`mongod` or via Services on Windows). If using Atlas, verify your IP address is whitelisted in the Atlas Network Access panel.

#### 3. "Warning: Could not sync Ticket indexes"
* **Cause**: Duplicate records already exist in your database collection, preventing Mongoose from applying a new unique index.
* **Fix**: Run `npm run seed:fresh` to clear old records and apply a clean, indexed dataset.

---
*Developed and maintained by **The Computing Society**. All rights reserved.*
