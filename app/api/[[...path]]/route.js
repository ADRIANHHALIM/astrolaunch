import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
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
  const db = await connectToMongo()
  
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
      launchDate: new Date('2024-12-15'),
      payload: 'Orion Spacecraft',
      orbit: 'Lunar orbit',
      customer: 'NASA',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'Mars Sample Return',
      description: 'Retrieve samples from Mars surface and return them to Earth',
      status: 'success',
      launchDate: new Date('2024-03-20'),
      payload: 'Sample Return Vehicle',
      orbit: 'Mars transfer orbit',
      customer: 'ESA',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'Starlink Constellation',
      description: 'Deploy next-generation internet satellites',
      status: 'success',
      launchDate: new Date('2024-06-10'),
      payload: '60 Starlink satellites',
      orbit: 'Low Earth orbit',
      customer: 'SpaceX',
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
      bio: 'Leading rocket propulsion expert with 15 years of experience in aerospace engineering.',
      experience: '15 years',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'Marcus Rodriguez',
      position: 'Mission Director',
      department: 'Operations',
      bio: 'Veteran mission commander with expertise in complex space operations.',
      experience: '12 years',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'Dr. Emily Watson',
      position: 'Lead Systems Engineer',
      department: 'Engineering',
      bio: 'Spacecraft systems specialist focusing on reliability and safety.',
      experience: '10 years',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'James Thompson',
      position: 'Flight Operations Manager',
      department: 'Operations',
      bio: 'Expert in launch operations and mission control systems.',
      experience: '8 years',
      createdAt: new Date()
    }
  ]

  // Sample schedules
  const schedules = [
    {
      id: uuidv4(),
      missionName: 'Jupiter Probe Launch',
      description: 'Scientific mission to study Jupiter and its moons',
      launchDate: new Date('2025-01-15'),
      launchTime: '14:30 UTC',
      rocket: 'Falcon Heavy',
      launchSite: 'Kennedy Space Center',
      customer: 'NASA',
      payload: 'Jupiter Probe',
      status: 'scheduled',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      missionName: 'Commercial Satellite Deploy',
      description: 'Deploy commercial communication satellites',
      launchDate: new Date('2025-02-28'),
      launchTime: '09:15 UTC',
      rocket: 'Starship',
      launchSite: 'Starbase',
      customer: 'Telecom Corp',
      payload: 'ComSat-5',
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

  // Insert sample data if collections are empty
  const rocketsCollection = db.collection('rockets')
  const rocketsCount = await rocketsCollection.countDocuments()
  if (rocketsCount === 0) {
    await rocketsCollection.insertMany(rockets)
  }

  const missionsCollection = db.collection('missions')
  const missionsCount = await missionsCollection.countDocuments()
  if (missionsCount === 0) {
    await missionsCollection.insertMany(missions)
  }

  const teamsCollection = db.collection('teams')
  const teamsCount = await teamsCollection.countDocuments()
  if (teamsCount === 0) {
    await teamsCollection.insertMany(teams)
  }

  const schedulesCollection = db.collection('schedules')
  const schedulesCount = await schedulesCollection.countDocuments()
  if (schedulesCount === 0) {
    await schedulesCollection.insertMany(schedules)
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
    const db = await connectToMongo()
    
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

      const existingUser = await db.collection('users').findOne({ email })
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

      await db.collection('users').insertOne(user)
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })
      
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

      const user = await db.collection('users').findOne({ email })
      if (!user || !await bcrypt.compare(password, user.password)) {
        return handleCORS(NextResponse.json(
          { error: "Invalid credentials" }, 
          { status: 401 }
        ))
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })
      
      const { password: _, ...userWithoutPassword } = user
      return handleCORS(NextResponse.json({ user: userWithoutPassword, token }))
    }

    if (route === '/auth/verify' && method === 'GET') {
      const decoded = verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json({ valid: false }, { status: 401 }))
      }

      const user = await db.collection('users').findOne({ id: decoded.userId })
      if (!user) {
        return handleCORS(NextResponse.json({ valid: false }, { status: 401 }))
      }

      const { password: _, ...userWithoutPassword } = user
      return handleCORS(NextResponse.json({ valid: true, user: userWithoutPassword }))
    }

    // ROCKETS ROUTES
    if (route === '/rockets' && method === 'GET') {
      const rockets = await db.collection('rockets')
        .find({})
        .sort({ createdAt: -1 })
        .toArray()
      
      const cleanedRockets = rockets.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedRockets))
    }

    if (route === '/rockets' && method === 'POST') {
      const decoded = verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
      }

      const rocketData = await request.json()
      const rocket = {
        id: uuidv4(),
        ...rocketData,
        createdAt: new Date()
      }

      await db.collection('rockets').insertOne(rocket)
      const { _id, ...cleanedRocket } = rocket
      return handleCORS(NextResponse.json(cleanedRocket, { status: 201 }))
    }

    // MISSIONS ROUTES
    if (route === '/missions' && method === 'GET') {
      const missions = await db.collection('missions')
        .find({})
        .sort({ createdAt: -1 })
        .toArray()
      
      const cleanedMissions = missions.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedMissions))
    }

    if (route === '/missions' && method === 'POST') {
      const decoded = verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
      }

      const missionData = await request.json()
      const mission = {
        id: uuidv4(),
        ...missionData,
        createdAt: new Date()
      }

      await db.collection('missions').insertOne(mission)
      const { _id, ...cleanedMission } = mission
      return handleCORS(NextResponse.json(cleanedMission, { status: 201 }))
    }

    // TEAMS ROUTES
    if (route === '/teams' && method === 'GET') {
      const teams = await db.collection('teams')
        .find({})
        .sort({ createdAt: -1 })
        .toArray()
      
      const cleanedTeams = teams.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedTeams))
    }

    if (route === '/teams' && method === 'POST') {
      const decoded = verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
      }

      const teamData = await request.json()
      const teamMember = {
        id: uuidv4(),
        ...teamData,
        createdAt: new Date()
      }

      await db.collection('teams').insertOne(teamMember)
      const { _id, ...cleanedTeamMember } = teamMember
      return handleCORS(NextResponse.json(cleanedTeamMember, { status: 201 }))
    }

    // SCHEDULES ROUTES
    if (route === '/schedules' && method === 'GET') {
      const schedules = await db.collection('schedules')
        .find({})
        .sort({ launchDate: 1 })
        .toArray()
      
      const cleanedSchedules = schedules.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedSchedules))
    }

    if (route === '/schedules' && method === 'POST') {
      const decoded = verifyToken(request)
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
      }

      const scheduleData = await request.json()
      const schedule = {
        id: uuidv4(),
        ...scheduleData,
        createdAt: new Date()
      }

      await db.collection('schedules').insertOne(schedule)
      const { _id, ...cleanedSchedule } = schedule
      return handleCORS(NextResponse.json(cleanedSchedule, { status: 201 }))
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