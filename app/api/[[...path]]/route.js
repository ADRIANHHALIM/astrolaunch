import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// In-memory storage (for development)
let inMemoryDB = {
  users: [],
  rockets: [],
  missions: [],
  teams: [],
  schedules: []
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Auth middleware
function verifyToken(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return null
  
  const token = authHeader.split(' ')[1]
  if (!token) return null
  
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Initialize sample data
async function initializeSampleData() {
  // Create admin user if it doesn't exist
  const adminEmail = 'admin@astrolaunch.com'
  const existingAdmin = inMemoryDB.users.find(user => user.email === adminEmail)
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const adminUser = {
      id: uuidv4(),
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    }
    inMemoryDB.users.push(adminUser)
    console.log('Admin user created: admin@astrolaunch.com / admin123')
  }
  
  // Initialize sample data only if empty
  if (inMemoryDB.rockets.length === 0) {
    // Sample rockets
    const rockets = [
      {
        id: uuidv4(),
        name: 'Falcon Heavy',
        type: 'Heavy-lift launch vehicle',
        specifications: {
          height: '70 m',
          diameter: '12.2 m',
          mass: '1,420,788 kg',
          payloadToLEO: '63,800 kg'
        },
        status: 'active',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Starship',
        type: 'Super heavy-lift launch vehicle',
        specifications: {
          height: '120 m',
          diameter: '9 m',
          mass: '5,000,000 kg',
          payloadToLEO: '150,000 kg'
        },
        status: 'development',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Dragon Capsule',
        type: 'Crew and cargo spacecraft',
        specifications: {
          height: '8.1 m',
          diameter: '4 m',
          mass: '12,200 kg',
          payloadToLEO: '6,000 kg'
        },
        status: 'active',
        createdAt: new Date()
      }
    ]

    // Sample missions
    const missions = [
      {
        id: uuidv4(),
        name: 'Artemis Moon Mission',
        description: 'Return humans to the Moon and establish a sustainable lunar presence',
        status: 'planned',
        launchDate: new Date('2025-12-15'),
        customer: 'NASA',
        payload: 'Orion Spacecraft',
        orbit: 'Lunar',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Mars Sample Return',
        description: 'Retrieve samples collected by the Perseverance rover from Mars',
        status: 'development',
        launchDate: new Date('2025-09-20'),
        customer: 'NASA/ESA',
        payload: 'Mars Sample Return Orbiter',
        orbit: 'Mars Transfer',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Starlink Constellation',
        description: 'Deploy next-generation internet satellites for global coverage',
        status: 'success',
        launchDate: new Date('2025-01-10'),
        customer: 'SpaceX',
        payload: 'Starlink Satellites',
        orbit: 'LEO',
        createdAt: new Date()
      }
    ]

    // Sample team members
    const teams = [
      {
        id: uuidv4(),
        name: 'Dr. Sarah Chen',
        position: 'Chief Technology Officer',
        department: 'Engineering',
        experience: '15 years',
        bio: 'Leading expert in propulsion systems and spacecraft design.',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Commander Alex Rodriguez',
        position: 'Flight Operations Director',
        department: 'Operations',
        experience: '20 years',
        bio: 'Former astronaut with multiple space missions under their belt.',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Dr. Michael Kumar',
        position: 'Lead Scientist',
        department: 'Science',
        experience: '12 years',
        bio: 'Specialized in planetary science and mission planning.',
        createdAt: new Date()
      }
    ]

    // Sample schedules
    const schedules = [
      {
        id: uuidv4(),
        missionName: 'Europa Clipper Mission',
        description: 'Orbital mission to study Jupiter\'s moon Europa',
        launchDate: new Date('2025-08-15'),
        launchTime: '14:30 UTC',
        rocket: 'Falcon Heavy',
        launchSite: 'Kennedy Space Center',
        customer: 'NASA',
        payload: 'Europa Clipper',
        status: 'scheduled',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        missionName: 'ISS Resupply Mission',
        description: 'Cargo resupply mission to International Space Station',
        launchDate: new Date('2025-03-10'),
        launchTime: '11:45 UTC',
        rocket: 'Dragon Capsule',
        launchSite: 'Kennedy Space Center',
        customer: 'NASA',
        payload: 'Cargo Dragon',
        status: 'scheduled',
        createdAt: new Date()
      }
    ]

    // Add sample data to in-memory storage
    inMemoryDB.rockets = rockets
    inMemoryDB.missions = missions
    inMemoryDB.teams = teams
    inMemoryDB.schedules = schedules
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Initialize sample data on first request
    await initializeSampleData()

    // Root endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "AstroLaunch API" }))
    }

    // AUTH ROUTES
    if (route === '/auth/register' && method === 'POST') {
      const { email, password, name } = await request.json()
      
      if (!email || !password || !name) {
        return handleCORS(NextResponse.json(
          { error: "Email, password, and name are required" }, 
          { status: 400 }
        ))
      }

      const existingUser = inMemoryDB.users.find(user => user.email === email)
      if (existingUser) {
        return handleCORS(NextResponse.json(
          { error: "User already exists" }, 
          { status: 400 }
        ))
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const user = {
        id: uuidv4(),
        email,
        name,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date()
      }

      inMemoryDB.users.push(user)
      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, JWT_SECRET, { expiresIn: '24h' })
      
      const { password: _, ...userWithoutPassword } = user
      return handleCORS(NextResponse.json({ user: userWithoutPassword, token }))
    }

    if (route === '/auth/login' && method === 'POST') {
      const { email, password } = await request.json()
      
      if (!email || !password) {
        return handleCORS(NextResponse.json(
          { error: "Email and password are required" }, 
          { status: 400 }
        ))
      }

      const user = inMemoryDB.users.find(user => user.email === email)
      if (!user || !await bcrypt.compare(password, user.password)) {
        return handleCORS(NextResponse.json(
          { error: "Invalid credentials" }, 
          { status: 401 }
        ))
      }

      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, JWT_SECRET, { expiresIn: '24h' })
      
      const { password: _, ...userWithoutPassword } = user
      return handleCORS(NextResponse.json({ user: userWithoutPassword, token }))
    }

    if (route === '/auth/verify' && method === 'GET') {
      const decoded = verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json({ valid: false }, { status: 401 }))
      }

      const user = inMemoryDB.users.find(user => user.id === decoded.userId)
      if (!user) {
        return handleCORS(NextResponse.json({ valid: false }, { status: 401 }))
      }

      const { password: _, ...userWithoutPassword } = user
      return handleCORS(NextResponse.json({ valid: true, user: userWithoutPassword }))
    }

    // ROCKETS ROUTES
    if (route === '/rockets' && method === 'GET') {
      const rockets = inMemoryDB.rockets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return handleCORS(NextResponse.json(rockets))
    }

    if (route === '/rockets' && method === 'POST') {
      const decoded = verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
      }

      // Check if user has admin role
      const user = inMemoryDB.users.find(user => user.id === decoded.userId)
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: "Admin privileges required" }, { status: 403 }))
      }

      const rocketData = await request.json()
      const rocket = {
        id: uuidv4(),
        ...rocketData,
        createdAt: new Date()
      }

      inMemoryDB.rockets.push(rocket)
      return handleCORS(NextResponse.json(rocket, { status: 201 }))
    }

    // MISSIONS ROUTES
    if (route === '/missions' && method === 'GET') {
      const missions = inMemoryDB.missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return handleCORS(NextResponse.json(missions))
    }

    if (route === '/missions' && method === 'POST') {
      const decoded = verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
      }

      // Check if user has admin role
      const user = inMemoryDB.users.find(user => user.id === decoded.userId)
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: "Admin privileges required" }, { status: 403 }))
      }

      const missionData = await request.json()
      const mission = {
        id: uuidv4(),
        ...missionData,
        createdAt: new Date()
      }

      inMemoryDB.missions.push(mission)
      return handleCORS(NextResponse.json(mission, { status: 201 }))
    }

    // TEAMS ROUTES
    if (route === '/teams' && method === 'GET') {
      const teams = inMemoryDB.teams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return handleCORS(NextResponse.json(teams))
    }

    if (route === '/teams' && method === 'POST') {
      const decoded = verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
      }

      // Check if user has admin role
      const user = inMemoryDB.users.find(user => user.id === decoded.userId)
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: "Admin privileges required" }, { status: 403 }))
      }

      const teamData = await request.json()
      const teamMember = {
        id: uuidv4(),
        ...teamData,
        createdAt: new Date()
      }

      inMemoryDB.teams.push(teamMember)
      return handleCORS(NextResponse.json(teamMember, { status: 201 }))
    }

    // SCHEDULES ROUTES
    if (route === '/schedules' && method === 'GET') {
      const schedules = inMemoryDB.schedules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return handleCORS(NextResponse.json(schedules))
    }

    if (route === '/schedules' && method === 'POST') {
      const decoded = verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
      }

      // Check if user has admin role
      const user = inMemoryDB.users.find(user => user.id === decoded.userId)
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: "Admin privileges required" }, { status: 403 }))
      }

      const scheduleData = await request.json()
      const schedule = {
        id: uuidv4(),
        ...scheduleData,
        createdAt: new Date()
      }

      inMemoryDB.schedules.push(schedule)
      return handleCORS(NextResponse.json(schedule, { status: 201 }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute