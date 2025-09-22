# File Vault - Frontend

A modern, secure file storage UI built with React, TypeScript and Tailwind CSS. This frontend connects to the Go backend API to provide a complete file management experience with smart deduplication.

## ✨ Features

### 🔐 **Authentication System**
- User registration with validation
- Secure JWT-based login
- Protected routes with automatic redirects
- Clean logout functionality

### 📁 **File Management**
- **Drag & Drop Upload**: Modern file upload with progress tracking
- **Batch Processing**: Upload multiple files at once (up to 10 files)
- **Smart Deduplication**: Automatic detection of duplicate files
- **File Preview**: View files directly in browser
- **Download Management**: One-click downloads with toast notifications

### 🔍 **Advanced Search & Filtering**
- **Filename Search**: Find files by name with partial matching
- **File Type Filters**: Filter by images, documents, videos, etc.
- **Size Range Filters**: Find files by size with quick presets
- **Date Range Search**: Filter by upload date ranges
- **Combined Filters**: Mix and match multiple criteria

### 📊 **Storage Analytics Dashboard**
- **Real-time Statistics**: Storage usage, quotas, and savings
- **Deduplication Insights**: Visual representation of space saved
- **Storage Optimization**: Track efficiency and usage patterns
- **Quota Management**: Monitor storage limits and availability

### 🎨 **Professional Design System**
- **Modern UI**: Clean, professional interface inspired by Google Drive
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode Ready**: Built-in theme support
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Beautiful Animations**: Smooth transitions and micro-interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Go backend server running on port 8080
- PostgreSQL database (via Docker)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:8080 (Vite dev server)
   - Backend API: http://localhost:8080 (Go server)

### Backend Setup
Make sure your Go backend is running with:
```bash
# In your Go backend directory
export JWT_SECRET="your_very_long_and_super_secret_key_for_production"
docker-compose up -d  # Start PostgreSQL
go run *.go           # Start the API server
```

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard-specific components
│   ├── files/          # File management components
│   ├── layout/         # Layout and navigation
│   └── ui/             # Reusable UI components (shadcn/ui)
├── lib/
│   ├── api.ts          # API client and types
│   └── utils.ts        # Utility functions
├── pages/              # Route components
└── hooks/              # Custom React hooks
```

### Key Technologies
- **React 18** with TypeScript for type safety
- **React Router** for client-side routing
- **Tailwind CSS** with custom design system
- **Radix UI** components via shadcn/ui
- **React Query** for server state management
- **React Dropzone** for file uploads

## 🎨 Design System

The app uses a custom design system optimized for file storage applications:

- **Professional Color Palette**: Blue-focused theme similar to enterprise storage solutions
- **Semantic Tokens**: All colors, gradients, and animations defined in CSS variables
- **File Type Colors**: Unique colors for different file types (images, documents, etc.)
- **Responsive Grid System**: Adaptive layouts for all screen sizes

## 🔌 API Integration

The frontend communicates with the Go backend via REST API:

### Authentication Endpoints
- `POST /register` - Create new user account
- `POST /login` - Authenticate and get JWT token

### File Management Endpoints
- `POST /upload` - Upload files with deduplication
- `GET /files` - List user files with pagination
- `GET /files/:id/download` - Download specific file
- `GET /files/:id/preview` - Preview file in browser
- `DELETE /files/:id/delete` - Remove file reference
- `GET /search` - Advanced file search
- `GET /stats` - Storage statistics and analytics

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **CORS Configuration**: Proper cross-origin request handling
- **Input validation**: Client-side validation with server-side verification
- **Secure File Handling**: Safe file upload and download processes

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach**: Optimized for mobile devices
- **Adaptive navigation**: Collapsible sidebar on mobile
- **Touch-friendly UI**: Proper touch targets and gestures
- **Flexible layouts**: Grid and flex layouts that adapt to screen size

## 🎯 Key Features Demo

### File Upload
- Drag files onto the upload zone or click to browse
- Real-time progress tracking for each file
- Automatic deduplication detection
- Batch upload success/error handling

### File Management
- Grid view of all files with metadata
- Quick actions menu (download, preview, delete)
- Pagination for large file collections
- File type indicators and size formatting

### Search & Filter
- Advanced search form with multiple criteria
- Real-time filter application
- Search result highlighting
- Filter combination logic

### Dashboard Analytics
- Storage usage visualization with progress bars
- Deduplication savings calculation
- Quota monitoring with warnings
- Recent files quick access

This frontend provides a complete, production-ready interface for your File Vault backend with enterprise-grade features and beautiful design.