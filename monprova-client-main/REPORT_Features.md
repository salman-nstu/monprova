# MonProva — Project Feature Report

Generated: 2026-01-11

---

## 1. Project Overview

- **Project name:** monprova-client
- **Type:** Frontend SPA (React) for a healthcare platform
- **Primary purpose:** Client application for users, doctors and administrators to manage appointments, assessments, prescriptions, payments, blogs, videos and resources.

## 2. Key Technologies

- React 18 + Vite (rolldown-vite override)
- Tailwind CSS + DaisyUI
- Firebase (Authentication + storage)
- Axios for HTTP; @tanstack/react-query for server state
- react-router-dom for routing
- react-hook-form for forms
- recharts for charts; lucide-react and react-icons for icons
- localforage for client storage
- sweetalert2 for modal alerts

## 3. Project Structure (high level)

- `index.html`, `vite.config.js`, `package.json` — project root and build config
- `src/main.jsx` — app entry
- `src/App.jsx` — placeholder app component
- `src/layouts/` — `MainLayout`, `AdminDashboardLayout`, `DoctorDashboardLayout`, `PatientDashboardLayout`
- `src/Routes/` — `Routes.jsx`, `PrivateRoute.jsx`
- `src/providers/AuthProvider.jsx` — auth context provider
- `src/components/` — UI building blocks (NavBars, Buttons, Cards, assessment components)
- `src/pages/` — pages grouped by domain (admin, appointment, assessment, blog, doctor, patient, profile, resources, schedule, payment flows, shared pages)
- `src/hooks/` — domain hooks (`useAuth`, `useAppointment`, `useAssessment`, `useDoctor`, `usePatient`, `useBlogs`, `useVideos`, etc.)
- `src/firebase/firebase.config.js` — Firebase initialization (uses `import.meta.env` variables)
- `public/` — static JSON (blogs.json, doctors.json, videos.json)

## 4. Authentication & Roles

- Firebase Authentication is used (`src/firebase/firebase.config.js`).
- Roles are implied by layouts and pages: Admin, Doctor, Patient.
- `AuthProvider.jsx` and `PrivateRoute.jsx` handle protected routes and role-based access.

## 5. Main Features

- Role-based dashboards with tailored navigation and controls for Admin, Doctor and Patient.
- Appointment booking, scheduling, and detailed views for doctor and patient.
- Assessment authoring and reporting: assessment cards and charts (`AssessmentCard`, `AssessmentGraph`, `CombinedAssessmentGraph`).
- Prescriptions management and PDF export helpers (`pdfService.js`).
- Payment flows with success page (`PaymentSuccess.jsx`) and payout management.
- Blogs and video listings, plus resource pages (served from `public/` JSON and components).
- Notifications, complaints, verification requests and admin user/doctor management pages.
- File uploads via `react-dropzone` and client-side storage with `localforage`.

## 6. Important Source Areas / Notable Files

- `src/providers/AuthProvider.jsx` — authentication context and user info.
- `src/Routes/Routes.jsx` — route definitions and route-level protections.
- `src/layouts/*DashboardLayout.jsx` — per-role layout and navigation bars.
- `src/components/assessment/QuestionComponent.jsx` — core assessment UI.
- `src/hooks/` — many hooks centralizing API calls and domain logic (`useAxiosSecure.jsx`, `useAxiosPublic.jsx`).
- `src/httpservice.js` — axios setup and HTTP helpers.
- `src/pdfService.js` — PDF creation utilities used for prescriptions/reports.

## 7. Environment Variables (expected)

From `src/firebase/firebase.config.js`:

- `VITE_apiKey`
- `VITE_authDomain`
- `VITE_projectId`
- `VITE_storageBucket`
- `VITE_messagingSenderId`
- `VITE_appId`

Note: Do NOT commit secret values. Keep them in `.env.local` (Gitignored).

## 8. How to Run Locally

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Lint:

```bash
npm run lint
```

## 9. Conversion to PDF

This report is saved as `REPORT_Features.md` in the project root. To convert to PDF locally, use one of the following options:

- Using Pandoc (recommended if installed):

```bash
pandoc REPORT_Features.md -o MonProva_Features.pdf --pdf-engine=xelatex
```

- Using Headless Chromium (Windows PowerShell example):

```powershell
# requires Chrome/Chromium installed
chrome --headless --disable-gpu --print-to-pdf="MonProva_Features.pdf" "file:///${PWD}/REPORT_Features.md"
```

- From VS Code: open `REPORT_Features.md`, use the Markdown preview, then Print → Save as PDF.

If you want, I can attempt to generate the PDF here — tell me to proceed and which conversion method you prefer.

## 10. Recommendations & Next Steps

- Create a project-specific `README.md` covering required env vars, Firebase setup and example credentials for dev roles.
- Add a `docs/` folder with an architecture diagram and a map of pages → components.
- Add automated tests for critical hooks and route protection logic.
- Consider migrating to TypeScript for stronger type-safety across hooks and API layers.
- Add CI workflows for lint and build.

---

_End of report._
