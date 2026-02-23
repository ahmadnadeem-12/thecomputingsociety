# THE COMPUTING SOCIETY (TCS) 🚀

A comprehensive MERN stack web application for managing community activities, events, and memberships for "The Computing Society".

## 🌟 Features

- **Admin Dashboard**: Full control over events, announcements, programs, and gallery.
- **QR Ticket Generation**: Automated QR-coded ticket generation for event registrations.
- **Event Management**: Create, update, and track event attendance with QR scanning.
- **Student Portal**: Register for events, download PDF tickets, and view society updates.
- **Secure Authentication**: JWT-based auth with Bcrypt password hashing.
- **Dynamic Content**: Manage Faculty, Cabinet members, and society degrees.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Framer Motion, Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB.
- **Security**: JWT, Bcrypt, Helmet, Rate Limiting.

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- MongoDB running locally or on Atlas

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ahmadnadeem-12/TCS-U3F.git
   cd TCS-U3F
   ```

2. **Install Dependencies**:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/tcs_database
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRE=30d
   ```

4. **Seed Database**:
   ```bash
   cd backend
   node seed.js
   ```

5. **Run the Application**:
   ```bash
   # In backend folder
   npm run dev
   
   # In frontend folder
   npm run dev
   ```

## 🔒 Security & Recent Enhancements

- **Strict Validation**: Email format validation enforced on both frontend and backend.
- **Ticket Restrictions**: Only logged-in students can generate tickets to prevent spam.
- **Performance**: Optimized data fetching to prevent loops and excess API calls.
- **Rate Limiting**: Enhanced protection against brute-force attacks.

## 📄 License

Owned by **The Computing Society**.
