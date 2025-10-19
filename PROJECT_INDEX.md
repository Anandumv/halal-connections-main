# Halal Connections - Project Index

## 📋 Project Overview
**Project Name**: The Bee Hive (Halal Connections)
**Type**: Matrimonial/Dating Platform
**Tech Stack**: React + TypeScript + Vite + Supabase + Tailwind CSS + shadcn/ui

## 🏗️ Project Structure

### Root Directory
```
halal-connections-main/
├── 📁 src/                    # Main source code
├── 📁 supabase/              # Database & backend functions
├── 📁 public/                # Static assets
├── 📁 dist/                  # Build output
├── 📁 scripts/               # Utility scripts
├── 📄 package.json           # Dependencies & scripts
├── 📄 tailwind.config.ts     # Tailwind configuration
├── 📄 vite.config.ts         # Vite configuration
└── 📄 vercel.json            # Vercel deployment config
```

## 🎯 Core Features

### Authentication & User Management
- **File**: `src/pages/Auth.tsx` (27KB, 601 lines)
- **Features**: Login, registration, password reset
- **Integration**: Supabase Auth

### User Dashboard
- **File**: `src/pages/Dashboard.tsx` (29KB, 648 lines)
- **Features**: User profile management, matches, settings

### Admin System
- **Admin Dashboard**: `src/pages/AdminDashboard.tsx` (78KB, 1726 lines)
- **Admin Management**: `src/pages/AdminManagement.tsx` (33KB, 811 lines)
- **Admin Profiles**: `src/pages/AdminProfiles.tsx` (3.7KB, 101 lines)
- **Admin Matchmaker**: `src/pages/AdminMatchmaker.tsx` (4.2KB, 124 lines)

### Messaging System
- **File**: `src/pages/Messages.tsx` (20KB, 527 lines)
- **Features**: Real-time messaging between users

### Settings & Profile
- **Settings**: `src/pages/Settings.tsx` (40KB, 881 lines)
- **Profile Form**: `src/components/ProfileForm.tsx` (25KB, 638 lines)
- **Profile Card**: `src/components/ProfileCard.tsx` (4KB, 79 lines)

## 🧩 Components Architecture

### UI Components (`src/components/ui/`)
**Complete shadcn/ui component library with 40+ components:**
- **Layout**: `card.tsx`, `sidebar.tsx`, `sheet.tsx`, `drawer.tsx`
- **Forms**: `form.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`
- **Navigation**: `navigation-menu.tsx`, `breadcrumb.tsx`, `pagination.tsx`
- **Feedback**: `toast.tsx`, `alert.tsx`, `progress.tsx`, `skeleton.tsx`
- **Data Display**: `table.tsx`, `badge.tsx`, `avatar.tsx`, `calendar.tsx`
- **Interactive**: `button.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `tabs.tsx`
- **Charts**: `chart.tsx` (Recharts integration)
- **Carousel**: `carousel.tsx` (Embla integration)

### Custom Components
- **ProfileCard.tsx**: User profile display component
- **AdminCheck.tsx**: Admin authorization wrapper
- **Features.tsx**: Landing page features section
- **Header.tsx**: Navigation header
- **Hero.tsx**: Landing page hero section
- **HowItWorks.tsx**: Process explanation component

## 🔧 Hooks & Utilities

### Custom Hooks (`src/hooks/`)
- **useAuth.tsx** (3.9KB): Authentication state management
- **useAdminStatus.tsx** (1.5KB): Admin role checking
- **use-mobile.tsx** (565B): Mobile device detection
- **use-toast.ts** (3.8KB): Toast notification system

### Utilities (`src/lib/`)
- **utils.ts**: Common utility functions (clsx, cn)

## 🗄️ Database & Backend

### Supabase Integration (`src/integrations/supabase/`)
- **client.ts**: Supabase client configuration
- **types.ts** (13KB): TypeScript type definitions

### Database Migrations (`supabase/migrations/`)
1. **20250722195015_initial_schema.sql** - Initial database schema
2. **20250722195044_fix_search_path.sql** - Search path fixes
3. **20250723041744_add_profiles_rls_policies.sql** - Row Level Security
4. **20250723042435_fix_rls_recursion.sql** - RLS recursion fixes
5. **20250723120000_add_admin_update_policy.sql** - Admin policies
6. **20250724000000_create_invite_codes.sql** - Invite code system
7. **20250724000001_add_more_invite_codes.sql** - Additional invite codes
8. **20250724000002_add_admin_user.sql** - Admin user setup
9. **20250724120000_fix_storage_bucket.sql** - File storage fixes

### Edge Functions (`supabase/functions/`)
- **matchmaker/**: Automated matching algorithm
- **send-match-email/**: Email notifications for matches
- **set-password/**: Password management

## 🎨 Design System

### Tailwind Configuration (`tailwind.config.ts`)
**Custom Color Palette:**
- Rose Gold, Emerald Deep, Sage, Pearl, Bronze
- Sidebar-specific colors
- Custom gradients and shadows

**Animations:**
- Float, glow, slide-up, fade-in effects
- Accordion animations

### CSS Variables (`src/index.css`)
- CSS custom properties for theming
- Dark/light mode support
- Custom gradients and shadows

## 📱 Pages & Routing

### Main Pages
1. **Index.tsx** (4.9KB) - Landing page
2. **Auth.tsx** (27KB) - Authentication
3. **Dashboard.tsx** (29KB) - User dashboard
4. **Messages.tsx** (20KB) - Messaging system
5. **Settings.tsx** (40KB) - User settings
6. **NotFound.tsx** (1.9KB) - 404 page

### Admin Pages
1. **AdminDashboard.tsx** (78KB) - Main admin interface
2. **AdminManagement.tsx** (33KB) - User management
3. **AdminProfiles.tsx** (3.7KB) - Profile management
4. **AdminMatchmaker.tsx** (4.2KB) - Matchmaking tools

### Utility Pages
1. **ResetPassword.tsx** (7.6KB) - Password reset

## 🚀 Development & Deployment

### Scripts (`package.json`)
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - ESLint checking
- `npm run preview` - Preview build

### Dependencies
**Core:**
- React 18.3.1, TypeScript 5.5.3
- Vite 5.4.1, Tailwind CSS 3.4.11

**UI & Components:**
- shadcn/ui components (40+ Radix UI components)
- Lucide React icons
- Recharts for data visualization
- Embla Carousel for sliders

**Forms & Validation:**
- React Hook Form 7.60.0
- Zod 3.23.8 for validation
- Hookform resolvers

**Backend & State:**
- Supabase JS 2.52.0
- TanStack React Query 5.56.2
- React Router DOM 6.26.2

**Utilities:**
- date-fns, dayjs for date handling
- clsx, tailwind-merge for styling
- Sonner for notifications

## 📊 Key Features by Category

### 🔐 Authentication & Security
- Supabase Auth integration
- Row Level Security (RLS) policies
- Admin role management
- Password reset functionality

### 👥 User Management
- Profile creation and editing
- Photo upload and management
- Preference settings
- Admin user management

### 💕 Matchmaking
- Automated matching algorithm
- Manual admin matchmaking
- Match notifications
- Compatibility scoring

### 💬 Communication
- Real-time messaging
- Email notifications
- Toast notifications
- Admin communications

### 📊 Analytics & Admin
- User statistics
- Match analytics
- Admin dashboard
- User management tools

### 🎨 UI/UX
- Responsive design
- Dark/light mode
- Modern component library
- Smooth animations
- Mobile-first approach

## 🔧 Configuration Files

### Build & Development
- **vite.config.ts** - Vite configuration
- **tsconfig.json** - TypeScript configuration
- **eslint.config.js** - ESLint rules
- **postcss.config.js** - PostCSS processing

### Styling
- **tailwind.config.ts** - Tailwind CSS configuration
- **components.json** - shadcn/ui configuration

### Deployment
- **vercel.json** - Vercel deployment settings

## 📝 Documentation Files
- **README.md** - Project overview
- **DESIGN_SYSTEM.md** - Design guidelines
- **ADMIN_DASHBOARD_REDESIGN.md** - Admin UI improvements
- **CUSTOMER_CENTRIC_IMPROVEMENTS.md** - User experience enhancements
- **DEPLOYMENT_SUMMARY.md** - Deployment information
- **OAUTH_SETUP.md** - OAuth configuration

## 🎯 Development Priorities

### Current Focus Areas
1. **Admin Dashboard Redesign** - Modern UI improvements
2. **Mobile Responsiveness** - Full mobile optimization
3. **User Experience** - Customer-centric improvements
4. **Performance** - Optimization and speed improvements

### Technical Debt
- Code organization and structure
- Component reusability
- Type safety improvements
- Testing implementation

---

*This index provides a comprehensive overview of the Halal Connections project structure, components, and functionality. Use this as a reference for development, debugging, and feature planning.* 