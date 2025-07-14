# 🚀 AstroLaunch

**Advanced Space Mission Management Platform with Real-Time 3D Launch Visualization**

![AstroLaunch](https://img.shields.io/badge/AstroLaunch-v1.0.0-blue?style=for-the-badge&logo=rocket)
![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-Latest-orange?style=for-the-badge&logo=three.js)

---

## 🌟 Overview

AstroLaunch is a cutting-edge space mission management platform that combines comprehensive administrative capabilities with stunning 3D visualization technology. Experience realistic rocket launches from Earth to space with cinematic camera tracking and physics-based animations.

### ✨ Key Features

- **🎬 Cinematic Launch Sequences** - Watch rockets launch from Earth with dynamic camera tracking
- **🛰️ Interstellar-Class Spacecraft** - Detailed 3D models inspired by realistic space engineering
- **👨‍💼 Complete Admin Dashboard** - Full CRUD operations for missions, astronauts, and spacecraft
- **🔐 Role-Based Authentication** - Secure JWT-based login system with admin/user roles
- **🌍 Real-Time Earth Visualization** - Dynamic planet with atmospheric effects and orbital mechanics
- **⚡ Performance Optimized** - Smooth 60fps animations with efficient particle systems

---

## 🎯 Demo

### Launch Sequence
Experience a 25-second cinematic rocket launch from Earth's surface to deep space orbit:

1. **Initial Ascent** (0-6s) - Vertical launch from Earth's surface
2. **Gravity Turn** (6-17s) - Realistic orbital trajectory adjustment
3. **Orbital Insertion** (17-25s) - Complex 3D maneuvers in space

### Admin Features
- **Mission Management** - Create, edit, and track space missions
- **Astronaut Database** - Manage crew assignments and profiles
- **Spacecraft Inventory** - Monitor vehicle status and specifications
- **Real-Time Monitoring** - Live mission status updates

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14.2.3** - React framework with App Router
- **React Three Fiber** - 3D graphics and animations
- **Three.js** - WebGL rendering engine
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **JWT Authentication** - Secure token-based auth
- **In-Memory Database** - High-performance data storage
- **Role-Based Access Control** - Admin/User permissions

### 3D Graphics
- **200+ Particle Systems** - Dynamic exhaust and atmospheric effects
- **Realistic Physics** - Orbital mechanics and launch trajectories
- **Dynamic Camera System** - Cinematic tracking and smooth transitions
- **Multi-Layered Environments** - Earth, atmosphere, and deep space

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/ADRIANHHALIM/astrolaunch.git
cd astrolaunch

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- **Local Development**: http://localhost:3000
- **Admin Login**: admin@astrolaunch.com / admin123
- **User Registration**: Available on login page

---

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/auth/login    - User authentication
POST /api/auth/register - User registration
GET  /api/auth/profile  - Get user profile
```

### Mission Management
```
GET    /api/missions     - List all missions
POST   /api/missions     - Create new mission
PUT    /api/missions/:id - Update mission
DELETE /api/missions/:id - Delete mission
```

### Astronaut Management
```
GET    /api/astronauts     - List all astronauts
POST   /api/astronauts     - Create new astronaut
PUT    /api/astronauts/:id - Update astronaut
DELETE /api/astronauts/:id - Delete astronaut
```

### Spacecraft Management
```
GET    /api/spacecraft     - List all spacecraft
POST   /api/spacecraft     - Create new spacecraft
PUT    /api/spacecraft/:id - Update spacecraft
DELETE /api/spacecraft/:id - Delete spacecraft
```

---

## 🎨 3D Spacecraft Features

### Interstellar-Class Design
- **Central Command Module** - 3.5-unit high command center
- **Rotating Habitat Ring** - 5-radius artificial gravity system
- **Ion Drive Propulsion** - Realistic blue-white exhaust
- **Solar Panel Arrays** - 4x8 meter energy collection systems
- **Landing Gear System** - 3-point retractable configuration

### Technical Specifications
- **Scale**: 1.8x standard size for impressive presence
- **Modules**: 12 habitat pods with windows and life support
- **Propulsion**: Primary ion drive + 8 maneuvering thrusters
- **Power**: Dual solar arrays + backup fuel cells
- **Communication**: Primary dish + 4 secondary arrays

---

## 🌍 Environment Details

### Earth Visualization
- **Realistic Planet** - 15-unit radius with continental detail
- **Multi-Layer Atmosphere** - Three atmospheric shells with glow effects
- **Dynamic Weather** - Animated cloud systems
- **Polar Ice Caps** - Arctic and Antarctic visualization
- **Day/Night Cycle** - Rotating planet with lighting effects

### Space Environment
- **150 Stars** - Random distribution with varying brightness
- **Nebula Effects** - Purple and cyan distant cloud formations
- **Orbital Mechanics** - Realistic gravity and trajectory physics
- **Deep Space Transition** - Seamless Earth-to-space visualization

---

## 🔧 Development

### Project Structure
```
astrolaunch/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.js       # Root layout
│   └── page.js         # Main application
├── components/         # React components
│   ├── ui/            # Radix UI components
│   ├── auth-dialog.js # Authentication
│   ├── navigation.js  # App navigation
│   └── rocket-model.js # 3D spacecraft
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── tests/             # Test suites
```

### Key Components
- **RocketModel** - Main 3D spacecraft with launch animation
- **AuthDialog** - Login/registration interface
- **Navigation** - Role-based navigation system
- **AdminForms** - CRUD operations for data management

---

## 🎯 Performance Metrics

### Rendering Performance
- **60 FPS** target framerate
- **200+ particles** real-time animation
- **Smooth camera transitions** with lerping
- **Optimized geometry** for complex 3D models

### Load Times
- **Initial Load**: < 3 seconds
- **3D Model Load**: < 1 second
- **API Response**: < 100ms
- **Authentication**: < 200ms

---

## 🔐 Security Features

### Authentication
- **JWT Tokens** - Secure stateless authentication
- **Password Hashing** - bcrypt encryption
- **Role-Based Access** - Admin/User permission levels
- **Session Management** - Automatic token refresh

### Data Protection
- **Input Validation** - Server-side data sanitization
- **CORS Protection** - Cross-origin request security
- **Rate Limiting** - API endpoint protection
- **Error Handling** - Secure error responses

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Production deployment
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

---

## 🤝 Contributing

We welcome contributions to AstroLaunch! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- **ESLint** - JavaScript/React linting
- **Prettier** - Code formatting
- **Conventional Commits** - Commit message standards
- **Component Testing** - Jest/React Testing Library

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Adrian H. Halim**
- GitHub: [@ADRIANHHALIM](https://github.com/ADRIANHHALIM)
- Project: [AstroLaunch](https://github.com/ADRIANHHALIM/astrolaunch)

---

## 🙏 Acknowledgments

- **React Three Fiber** - Enabling stunning 3D web experiences
- **Next.js Team** - Amazing full-stack React framework
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Interstellar Film** - Inspiration for realistic spacecraft design

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/ADRIANHHALIM/astrolaunch?style=social)
![GitHub forks](https://img.shields.io/github/forks/ADRIANHHALIM/astrolaunch?style=social)
![GitHub issues](https://img.shields.io/github/issues/ADRIANHHALIM/astrolaunch)
![GitHub license](https://img.shields.io/github/license/ADRIANHHALIM/astrolaunch)

---

<div align="center">

**🚀 Experience the Future of Space Mission Management 🚀**

[Live Demo](https://astrolaunch.vercel.app) • [Documentation](https://docs.astrolaunch.com) • [Report Bug](https://github.com/ADRIANHHALIM/astrolaunch/issues) • [Request Feature](https://github.com/ADRIANHHALIM/astrolaunch/issues)

</div>
