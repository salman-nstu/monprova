<div align="center">

<img src="monprova-client-main/src/assets/monlogo.png" alt="MonProva Logo" width="120" />

# 🧠 MonProva

### *Empowering Minds, Enhancing Lives*

**Your Trusted Partner in Mental Well-being**

[![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=flat-square&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Backend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

</div>

---

## 📌 Overview

**MonProva** is a secure and user-friendly digital platform designed to bridge the gap between mental health patients and professionals. It provides clinically-validated self-assessment tools (PHQ-9, GAD-7, PSS-10), progress tracking with visual graphs, seamless appointment booking, digital prescriptions, and curated mental wellness activities — all within one integrated, privacy-first ecosystem.

> The platform supports three distinct roles: **Patients**, **Doctors**, and **Administrators**, each with a tailored dashboard and feature set.

---

## 🎯 Problem Statement

Mental health is often neglected due to stigma, limited awareness, and restricted access to professionals. Patients struggle to monitor their condition and find reliable support, while doctors face inefficiencies in managing consultations and patient records.

**MonProva** addresses these challenges by creating an integrated, secure ecosystem for mental healthcare — making support accessible, structured, and stigma-free.

---

## 🚀 Key Features

### 👤 For Patients
| Feature | Description |
|---|---|
| 📝 Registration & Profile | Create and manage a personal health profile |
| 📊 Self-Assessments | PHQ-9 (Depression), GAD-7 (Anxiety), PSS-10 (Stress) |
| 📈 Progress Tracking | Visual graphs to monitor assessment history over time |
| 🔍 Doctor Discovery | Browse verified doctors with full profile details |
| 📅 Appointment Booking | Book online or offline consultations |
| 💳 Secure Payment | SSLCommerz-powered payment for appointments |
| 📚 Resources & Activities | Blogs, videos, and mental wellness mini-games |
| ❓ Help & Q&A | Ask health questions privately; get doctor answers |
| 🔔 Notifications | Real-time updates for appointments and activity |

### 👨‍⚕️ For Doctors
| Feature | Description |
|---|---|
| 🧾 Professional Profile | Manage qualifications, bio, and specializations |
| 📆 Schedule Management | Set and manage availability for appointments |
| 💊 Digital Prescriptions | Create and export prescriptions as PDF |
| 💬 Patient Q&A | Respond to patient questions from the help section |
| 📂 Document Upload | Upload and manage verification documents via Cloudinary |
| 💰 Income & Payouts | Track consultation earnings and request payouts |

### 🛠️ For Admins
| Feature | Description |
|---|---|
| ✅ Doctor Verification | Review and approve doctor registration requests |
| 👥 User Management | View and manage all patient and doctor accounts |
| 📋 Appointment Oversight | Monitor all appointment details and statuses |
| 📣 Complaint Handling | Review and act on complaints raised by users |
| 💸 Payout Management | Process and track doctor payout requests |
| 📚 Resource Management | Manage platform blogs, videos, and learning content |

### 🎮 Wellness Activities
- 🫁 **Breathing Exercise** — guided breathing technique for stress relief
- 🎨 **Colour the Block** — mindful creative activity
- 🎈 **Pop the Balloon** — interactive stress-release game

---

## 🔐 Security & Privacy

- 🔑 **Role-Based Access Control (RBAC)** — separate dashboards and route guards per role
- 🔒 **JWT Authentication** — stateless, secure API authorization
- 🔥 **Firebase Authentication** — email/password sign-in with verification
- 💳 **SSLCommerz Payment Gateway** — PCI-DSS compliant payment processing
- ☁️ **Cloudinary** — secure cloud storage for documents and images
- 🛡️ **Protected Routes** — client-side route guards via `PrivateRoute`

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI framework |
| [Vite](https://vitejs.dev/) | Build tool |
| [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) | Styling |
| [React Router DOM v7](https://reactrouter.com/) | Client-side routing |
| [React Hook Form](https://react-hook-form.com/) | Form management |
| [@tanstack/react-query](https://tanstack.com/query) | Server state management |
| [Recharts](https://recharts.org/) | Assessment progress graphs |
| [Firebase](https://firebase.google.com/) | Authentication + Hosting |
| [Axios](https://axios-http.com/) | HTTP client |
| [SweetAlert2](https://sweetalert2.github.io/) | Alert dialogs |
| [Lucide React](https://lucide.dev/) / [React Icons](https://react-icons.github.io/react-icons/) | Icon libraries |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) | REST API server |
| [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com/) | Database |
| [JWT](https://jwt.io/) | API authorization tokens |
| [Cloudinary](https://cloudinary.com/) | File & document storage |
| [PDFKit](https://pdfkit.org/) + [Puppeteer](https://pptr.dev/) | Prescription PDF generation |
| [SSLCommerz](https://sslcommerz.com/) | Payment gateway |
| [node-cron](https://www.npmjs.com/package/node-cron) | Scheduled background tasks |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Password hashing |

### Deployment
| Service | Purpose |
|---|---|
| [Firebase Hosting](https://firebase.google.com/docs/hosting) | Frontend SPA deployment |
| [Vercel](https://vercel.com/) | Backend API deployment |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud database |

---

## 📂 Project Structure

```
monprova/
├── monprova-client-main/          # React frontend
│   ├── public/                    # Static assets (JSON data, icons)
│   ├── src/
│   │   ├── assets/                # Images and static files
│   │   ├── components/            # Reusable UI components
│   │   │   ├── NavBar/            # Navigation bars
│   │   │   ├── assessment/        # Assessment cards & graphs
│   │   │   └── cards/             # Appointment, Blog, Doctor cards
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── layouts/               # Role-based layout wrappers
│   │   │   ├── MainLayout.jsx
│   │   │   ├── PatientDashboardLayout.jsx
│   │   │   ├── DoctorDashboardLayout.jsx
│   │   │   └── AdminDashboardLayout.jsx
│   │   ├── pages/                 # All page components
│   │   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── appointment/       # Appointment booking & management
│   │   │   ├── assessment/        # PHQ-9, GAD-7, PSS-10 flows
│   │   │   ├── doctor/            # Doctor dashboard pages
│   │   │   ├── games/             # Wellness activity pages
│   │   │   ├── help/              # Help & Q&A pages
│   │   │   ├── patient/           # Patient dashboard pages
│   │   │   ├── prescription/      # Prescription management & PDF
│   │   │   ├── profile/           # User profile pages
│   │   │   └── resources/         # Blogs, videos, resources
│   │   ├── providers/             # React context providers
│   │   ├── Routes/                # Route definitions & guards
│   │   ├── firebase/              # Firebase initialization
│   │   ├── assessmentConfig.js    # PHQ-9, GAD-7, PSS-10 configuration
│   │   └── main.jsx               # App entry point
│   ├── firebase.json              # Firebase hosting config
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── monprova-server-main/          # Node.js backend
│   ├── config/                    # Database & Cloudinary configuration
│   ├── controllers/               # Request handlers
│   ├── cron/                      # Scheduled tasks
│   ├── fonts/                     # Fonts for PDF generation
│   ├── middleware/                 # CORS, file upload middleware
│   ├── routes/                    # API route definitions
│   │   ├── user.routes.js
│   │   ├── patient.routes.js
│   │   ├── doctors.routes.js
│   │   ├── appointment.routes.js
│   │   ├── assessment.routes.js
│   │   ├── prescription.routes.js
│   │   ├── payment.routes.js
│   │   ├── payout.routes.js
│   │   ├── schedule.routes.js
│   │   ├── blog.routes.js
│   │   ├── video.routes.js
│   │   ├── question.routes.js
│   │   ├── complaint.routes.js
│   │   ├── notification.routes.js
│   │   ├── admin.routes.js
│   │   └── upload.route.js
│   ├── utils/                     # Helper utilities & PDF generator
│   ├── vercel.json                # Vercel deployment config
│   ├── index.js                   # Server entry point
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Firebase](https://console.firebase.google.com/) project (with Authentication enabled)
- A [Cloudinary](https://cloudinary.com/) account
- A [SSLCommerz](https://sslcommerz.com/) sandbox account

---

### 1. Clone the Repository

```bash
git clone https://github.com/salman-nstu/monprova.git
cd monprova
```

---

### 2. Backend Setup

```bash
cd monprova-server-main
npm install
```

Create a `.env` file in the `monprova-server-main/` directory:

```env
PORT=8000

# MongoDB Atlas
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password

# JWT
ACCESS_TOKEN_SECRET=your_jwt_secret_key

# Cloudinary
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# SSLCommerz Payment Gateway
STORE_ID=your_sslcommerz_store_id
STORE_PASSWD=your_sslcommerz_store_password
```

Start the backend server:

```bash
npm start
```

The API will be available at `http://localhost:8000`.

---

### 3. Frontend Setup

```bash
cd ../monprova-client-main
npm install
```

Create a `.env.local` file in the `monprova-client-main/` directory:

```env
# Firebase Configuration
VITE_apiKey=your_firebase_api_key
VITE_authDomain=your_project.firebaseapp.com
VITE_projectId=your_firebase_project_id
VITE_storageBucket=your_project.appspot.com
VITE_messagingSenderId=your_messaging_sender_id
VITE_appId=your_firebase_app_id

# Backend API
VITE_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

### 4. Build for Production

```bash
# Frontend
cd monprova-client-main
npm run build

# The compiled output will be in the `dist/` directory
```

---

## 🌐 Deployment

### Frontend — Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and deploy
firebase login
firebase deploy --only hosting
```

### Backend — Vercel

```bash
# Install Vercel CLI
npm install -g vercel

cd monprova-server-main
vercel deploy
```

> Set all backend environment variables in the Vercel project dashboard under **Settings → Environment Variables**.

---

## 📊 Performance Targets

| Metric | Target |
|---|---|
| ⚡ API Response Time | ≤ 3 seconds |
| 📉 Assessment Processing | ≤ 2 seconds |
| 👥 Concurrent Users | 1,000+ |
| 🌐 System Uptime | 99.5% |

---

## 🔄 Roadmap

- [ ] AI-based personalized mental health recommendations
- [ ] Real-time chat & video consultation
- [ ] Mobile app (Android & iOS)
- [ ] Advanced analytics dashboard for doctors
- [ ] TypeScript migration for stronger type safety
- [ ] Automated CI/CD pipeline (lint + build + test)
- [ ] Multilingual support expansion

---

## 🧑‍🤝‍🧑 Stakeholders

- 🧑‍💼 Patients seeking mental health support
- 👨‍⚕️ Verified mental health professionals
- 🛡️ Platform administrators
- 👨‍👩‍👧 Guardians and family members
- 💻 Development team

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

Please ensure your code follows the existing style and all linting checks pass:

```bash
# Frontend linting
cd monprova-client-main
npm run lint
```

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Team

| Name | Role |
|---|---|
| Shamim Mozumder | Team Member |
| Maimuna Tun Nisa | Team Member |
| Md. Tanjim Arafat | Team Member |
| Md. Salman Khan | Team Member |

---

<div align="center">

**MonProva** — *Empowering Minds, Enhancing Lives*

</div>
