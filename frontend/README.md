# 🚀 The Computing Society (TCS) - Frontend

Welcome to the official frontend repository of **The Computing Society (TCS)**. This is a premium, high-performance web application designed for student management, event registration, and society administration.

> **Project Identity:** 🎓 Final Year Project (FYP)  
> **Status:** 🚧 Frontend Completed | Backend Integration In-Progress  
> **Author:** [Ahmad Nadeem](https://github.com/ahmadnadeem-12)

---

## 🎯 Purpose & Vision
The primary goal of this project is to digitize and streamline the operations of the **Department of Computer Science (DCS)** society. It provides a seamless experience for:
- 📢 **Students:** To stay updated with upcoming events and generate secure QR tickets.
- 🛠️ **Administrators:** To manage society dynamics, customize the website theme live, and handle event logistics effortlessly.

---

## ✨ Key Features

### 👤 Student Side
- **Smooth Dashboard:** A modern, single-page application (SPA) experience with animated transitions.
- **Authentication:** Secure Student Registration and Login system.
- **QR Ticket Generation:** Register for events and instantly receive a valid QR-code ticket.
- **PDF Downloads:** Download your ticket as a beautifully designed PDF directly from the dashboard.

### 🛡️ Admin Side
- **Powerful Dashboard:** Manage all society data in one centralized hub.
- **Event Management (CRUD):** Create, edit, and delete events. Highlight "Featured Events" for the homepage.
- **Real-time Theme Editor:** Customize the entire website's color palette (Primary, Secondary, Accent colors) and see changes live without touching the code.
- **Ticket Verification:** View all registered students and mark their attendance via a check-in system.

---

## 🛠️ Technology Stack
- **Library:** [React.js](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** Vanilla CSS (Custom Premium Design System)
- **Icons:** React Icons / Custom SVG
- **PDF Generation:** jsPDF & html2canvas
- **State Management:** React Context API

---

## ⚙️ Setup & Installation

Follow these steps to get the project running on your local machine:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your system.

### 2. Clone the Repository
```bash
git clone https://github.com/ahmadnadeem-12/TCS-U1.git
cd THE-COMPUTING-SOCIETY/frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally (Development)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### 5. Build for Production
```bash
npm run build
```

---

## 🏗️ How to Contribute / Change
1. **Adding Features:** All UI components are located in `src/components/`, and pages are in `src/pages/`.
2. **Styling:** The design system is controlled via CSS variables in `src/assets/styles/index.css`.
3. **Logic:** Business logic and data mocked via `localStorage` can be found in `src/services/`.

---

## 📌 Development Roadmap
- [x] Complete Premium UI/UX Design
- [x] Student Auth & Ticket Flow
- [x] Admin Theme Customization
- [x] Event Management Logic
- [ ] Backend (MERN) Integration (Active Development)
- [ ] Live Database (MongoDB) Connection
- [ ] Production Deployment

---

## 🤝 Contact & Credits
**Project developed by Ahmad Nadeem.**  
For inquiries, collaborations, or feedback, feel free to reach out.

**Regards,**  
**Ahmad Nadeem**
