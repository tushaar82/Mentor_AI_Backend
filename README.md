# Mentor AI - Frontend

A beautiful, modern Next.js frontend for the Mentor AI learning platform with Shadcn UI and Framer Motion animations.

## Features

- 🎨 Beautiful landing page with animated hero section
- 🔐 Complete authentication system (login/register)
- 📊 Interactive dashboard with stats and activity
- ✨ Smooth animations using Framer Motion
- 🎯 Responsive design for all devices
- 🔥 Built with Next.js 15, TypeScript, and Tailwind CSS
- 🎭 Shadcn UI components for consistent design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── auth/              # Auth components
│   │   ├── landing/           # Landing page components
│   │   └── ui/                # Shadcn UI components
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   └── lib/
│       ├── api.ts             # API client
│       └── utils.ts           # Utility functions
```

## Pages

- `/` - Landing page with hero and features
- `/auth` - Login and registration
- `/dashboard` - User dashboard (protected)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React

## API Integration

The frontend connects to the backend API at `http://localhost:8000`. Make sure the backend is running before starting the frontend.

## Next Steps

- Add more dashboard features
- Implement test-taking interface
- Add progress tracking visualizations
- Create parent dashboard
- Add gamification elements
- Implement real-time notifications
