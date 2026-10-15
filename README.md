# ⏳ TimeCapsule — Backend API

**A secure backend for preserving digital memories and unlocking them in the future.**

TimeCapsule is a full-stack Final Year Project (FYP) designed to let users store personal memories in digital capsules, protect private content, and schedule memories for future access.

This repository contains the backend API built with NestJS and MongoDB. It handles authentication, user management, memory capsule operations, file storage integration, and related application services.

## 🌐 Live Demo

[**Explore TimeCapsule**](https://timecapsule-frontend-56v2.vercel.app/)

## 🔗 Project Repositories

| Component | Repository |
|---|---|
| Frontend | [timecapsule-frontend](https://github.com/ayeshatehreem77/timecapsule-frontend) |
| Backend | [time-capsule](https://github.com/ayeshatehreem77/time-capsule) |

## ✨ Features

- 🔐 **Authentication:** Secure authentication using JWT.
- 👥 **User Management:** Manage user accounts and role-based permissions.
- 📦 **Memory Capsules:** Handle the creation and management of digital memory capsules.
- ⏰ **Scheduled Unlocking:** Support future access to stored memories.
- 🛡️ **Access Protection:** Support protected memories and additional verification mechanisms.
- ☁️ **Cloud File Storage:** Integrate with Cloudinary for media uploads.
- 📧 **Email Notifications:** Support email communication for relevant application events.
- 🖥️ **Admin Support:** Provide backend functionality for administrative operations.

## 🛠️ Technology Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT
- **File Storage:** Cloudinary
- **API:** RESTful APIs
- **Package Manager:** npm

## 🏗️ Architecture

The application uses a separate frontend and backend architecture.

- **Frontend:** React.js, TypeScript, and Vite
- **Backend:** NestJS and MongoDB
- **Communication:** HTTP API requests
- **Media Storage:** Cloudinary

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- MongoDB connection
- Cloudinary account and credentials, if using media uploads
- Required email service credentials, if using email functionality

### 1. Clone the Repository

```bash
git clone https://github.com/ayeshatehreem77/time-capsule.git
cd time-capsule
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend root directory and configure the environment variables required by the application.

Typical configuration may include:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add any additional variables required by your implementation, such as Cloudinary and email service credentials.

**Important:** Never commit real passwords, API keys, database credentials, or JWT secrets to GitHub.

### 4. Run the Development Server

```bash
npm run start:dev
```

The API will run on the configured port. If the application uses port `3000`, the local base URL will typically be:

```text
http://localhost:3000
```

Check the project's configuration for the actual port and available API routes.

## 📁 Project Structure

The backend follows NestJS's modular architecture. The exact structure may vary by implementation.

```text
time-capsule/
├── src/
│   ├── auth/
│   ├── users/
│   ├── app.module.ts
│   └── main.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security

- Use environment variables for sensitive configuration.
- Keep authentication secrets private.
- Validate and authorize protected requests.
- Configure access permissions according to user roles.
- Never publish private user data or production credentials.

## 🎓 Academic Project

**Project:** TimeCapsule — Digital Memory Locker  
**Type:** Final Year Project (FYP)  
**Team:** Three members

Developed as an academic project to explore full-stack application development, API design, authentication, database integration, and secure digital memory management.

## 🔮 Potential Improvements

- Expand automated API testing.
- Improve API documentation.
- Add more detailed monitoring and logging.
- Enhance validation and error handling.
- Extend memory scheduling and notification capabilities.

## 📄 License

This project was developed for academic purposes. Contact the repository owner for permission before reusing substantial portions of the code.

---

**Built with NestJS and TypeScript.**