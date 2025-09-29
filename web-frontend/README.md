# 🚌 School Bus Tracking System

A modern, real-time school bus tracking application built with Next.js, TypeScript, and Supabase. This system provides comprehensive fleet management, real-time GPS tracking, and seamless communication between administrators, drivers, and parents.

## 🌟 Features

### 🔐 **Multi-Role Authentication**
- **Admin Dashboard**: Complete fleet management and oversight
- **Driver Portal**: Real-time location sharing and route management
- **Parent Access**: Track children's bus location and receive notifications

### 🚍 **Real-Time Tracking**
- Live GPS location updates every 10 seconds
- Interactive maps with route visualization
- Automatic arrival/departure notifications
- Emergency alert system

### 📊 **Comprehensive Management**
- Fleet management with maintenance tracking
- Route planning and optimization
- Student assignment management
- Driver scheduling and communication

### 🎨 **Modern UI/UX**
- Built with shadcn/ui components
- Responsive design for all devices
- Dark/Light theme support
- Glass morphism effects and smooth animations

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15.5.0** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5** - Full type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Modern component library

### **Backend**
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Supabase Auth** - User authentication and authorization
- **Row Level Security** - Database-level security policies

### **Development Tools**
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Location Sharing For Bus/web-frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   ```bash
   # Run Supabase migrations
   cd supabase
   npx supabase db reset
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
web-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard routes
│   │   ├── driver/            # Driver portal routes
│   │   ├── parent/            # Parent dashboard routes
│   │   ├── login/             # Authentication page
│   │   └── layout.tsx         # Root layout component
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui and custom components
│   │   │   ├── bus-status-card.tsx
│   │   │   ├── route-timeline.tsx
│   │   │   ├── student-card.tsx
│   │   │   └── bus-management-table.tsx
│   │   ├── Navigation.tsx     # Main navigation component
│   │   └── ProtectedRoute.tsx # Route protection wrapper
│   └── lib/                  # Utility functions and configurations
│       ├── supabaseClient.ts # Supabase client configuration
│       └── utils.ts          # General utility functions
├── supabase/                 # Database schema and functions
│   ├── migrations/           # Database migrations
│   └── functions/           # Edge functions
├── public/                   # Static assets
├── components.json           # shadcn/ui configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Project dependencies
```

## 🎯 Core Components

### **BusStatusCard**
Real-time bus monitoring with status indicators and occupancy tracking.
```tsx
<BusStatusCard 
  busNumber="101"
  driverName="John Smith"
  currentLocation="Main Street & Oak Ave"
  status="active"
  studentCount={25}
  maxCapacity={40}
/>
```

### **RouteTimeline**
Interactive timeline showing route progress and stop status.
```tsx
<RouteTimeline 
  stops={routeStops}
  currentStop={2}
  estimatedArrival="8:45 AM"
/>
```

### **StudentCard**
Comprehensive student profiles with parent contact information.
```tsx
<StudentCard 
  student={studentData}
  showContactInfo={true}
  onEmergencyAlert={handleAlert}
/>
```

### **BusManagementTable**
Advanced data table for fleet management with search and filtering.
```tsx
<BusManagementTable 
  data={busFleetData}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access and management
- **Driver**: Location sharing and route management
- **Parent**: Child tracking and notifications

### Security Features
- Row Level Security (RLS) policies
- JWT-based authentication
- Role-based access control
- Protected API routes

## 🗄️ Database Schema

### Key Tables
- **users**: User profiles and authentication
- **buses**: Fleet vehicle information
- **bus_routes**: Route definitions and schedules
- **bus_locations**: Real-time GPS coordinates
- **student_assignments**: Student-to-bus assignments
- **notifications**: System alerts and messages

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Deployment Platforms
- ✅ Vercel (Recommended)
- ✅ Netlify
- ✅ Railway
- ✅ Self-hosted

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build verification
npm run build
```

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- 📱 Mobile phones (iOS/Android)
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large displays

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Danger**: Red (#EF4444)

### Typography
- **Headings**: Inter font family
- **Body**: System font stack for optimal performance

### Animation
- Smooth transitions (300ms)
- Glass morphism effects
- Micro-interactions for better UX

## 🔧 Configuration

### Tailwind CSS
Custom configuration with design tokens and animations.

### shadcn/ui
Components configured with custom styling and variants.

### TypeScript
Strict mode enabled with comprehensive type definitions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development**: Modern React/Next.js implementation
- **Backend Development**: Supabase integration and real-time features
- **UI/UX Design**: shadcn/ui components and custom styling
- **DevOps**: Deployment and CI/CD configuration

## 🆘 Support

For support and questions:
- 📧 Email: support@schoolbustracking.com
- 💬 GitHub Issues: [Create an issue](../../issues)
- 📖 Documentation: [View docs](./docs)

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode support
- [ ] Integration with school management systems

---

**Built with ❤️ for safer school transportation**
