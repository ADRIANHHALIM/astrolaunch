'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text3D, Environment } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Rocket, 
  Satellite, 
  Users, 
  Calendar, 
  Target, 
  Shield, 
  Zap,
  Globe,
  Clock,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  User,
  Lock,
  Settings,
  Plus,
  Edit,
  Trash2,
  LogOut
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import RocketModel from '@/components/rocket-model'
import Navigation from '@/components/navigation'
import AuthDialog from '@/components/auth-dialog'

export default function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [rockets, setRockets] = useState([])
  const [missions, setMissions] = useState([])
  const [teams, setTeams] = useState([])
  const [schedules, setSchedules] = useState([])
  const [nextLaunch, setNextLaunch] = useState(null)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isLoading, setIsLoading] = useState(true)
  
  // Form states
  const [showAddRocketDialog, setShowAddRocketDialog] = useState(false)
  const [showAddMissionDialog, setShowAddMissionDialog] = useState(false)
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false)
  const [showAddScheduleDialog, setShowAddScheduleDialog] = useState(false)
  
  const { toast } = useToast()

  // Authentication functions
  const login = async (email, password) => {
    console.log('Login function called with:', { email, password })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      console.log('Response received:', response.status, response.ok)
      const data = await response.json()
      console.log('Response data:', data)
      if (response.ok) {
        setUser(data.user)
        localStorage.setItem('token', data.token)
        toast({ title: 'Welcome back!', description: 'Successfully logged in.' })
        console.log('User set:', data.user)
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      console.error('Login fetch error:', error)
      toast({ title: 'Error', description: 'Login failed', variant: 'destructive' })
    }
  }

  const register = async (email, password, name) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const data = await response.json()
      if (response.ok) {
        setUser(data.user)
        localStorage.setItem('token', data.token)
        toast({ title: 'Welcome!', description: 'Account created successfully.' })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Registration failed', variant: 'destructive' })
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    setActiveSection('home')
    toast({ title: 'Logged out', description: 'See you next time!' })
  }

  // Data fetching functions
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [rocketsRes, missionsRes, teamsRes, schedulesRes] = await Promise.all([
        fetch('/api/rockets'),
        fetch('/api/missions'),
        fetch('/api/teams'),
        fetch('/api/schedules')
      ])
      
      // Check if requests were successful
      if (!rocketsRes.ok || !missionsRes.ok || !teamsRes.ok || !schedulesRes.ok) {
        throw new Error('Failed to fetch data from one or more endpoints')
      }
      
      const [rocketsData, missionsData, teamsData, schedulesData] = await Promise.all([
        rocketsRes.json(),
        missionsRes.json(),
        teamsRes.json(),
        schedulesRes.json()
      ])
      
      // Ensure data is arrays, fallback to empty arrays if not
      setRockets(Array.isArray(rocketsData) ? rocketsData : [])
      setMissions(Array.isArray(missionsData) ? missionsData : [])
      setTeams(Array.isArray(teamsData) ? teamsData : [])
      setSchedules(Array.isArray(schedulesData) ? schedulesData : [])
      
      // Find next launch
      const now = new Date()
      const validSchedules = Array.isArray(schedulesData) ? schedulesData : []
      const upcomingLaunches = validSchedules.filter(schedule => new Date(schedule.launchDate) > now)
      if (upcomingLaunches.length > 0) {
        const nextLaunchSchedule = upcomingLaunches.sort((a, b) => 
          new Date(a.launchDate) - new Date(b.launchDate)
        )[0]
        setNextLaunch(nextLaunchSchedule)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Functions to add new items
  const addRocket = async (rocketData) => {
    if (!user || user.role !== 'admin') {
      toast({ 
        title: 'Access Denied', 
        description: 'Admin privileges required to add rockets', 
        variant: 'destructive' 
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/rockets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rocketData)
      })

      if (response.ok) {
        const newRocket = await response.json()
        setRockets(prev => [newRocket, ...prev])
        setShowAddRocketDialog(false)
        toast({ title: 'Success', description: 'Rocket added successfully!' })
      } else {
        const error = await response.json()
        toast({ title: 'Error', description: error.error || 'Failed to add rocket', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add rocket', variant: 'destructive' })
    }
  }

  const addMission = async (missionData) => {
    if (!user || user.role !== 'admin') {
      toast({ 
        title: 'Access Denied', 
        description: 'Admin privileges required to add missions', 
        variant: 'destructive' 
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(missionData)
      })

      if (response.ok) {
        const newMission = await response.json()
        setMissions(prev => [newMission, ...prev])
        setShowAddMissionDialog(false)
        toast({ title: 'Success', description: 'Mission added successfully!' })
      } else {
        const error = await response.json()
        toast({ title: 'Error', description: error.error || 'Failed to add mission', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add mission', variant: 'destructive' })
    }
  }

  const addTeamMember = async (teamData) => {
    if (!user || user.role !== 'admin') {
      toast({ 
        title: 'Access Denied', 
        description: 'Admin privileges required to add team members', 
        variant: 'destructive' 
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teamData)
      })

      if (response.ok) {
        const newTeamMember = await response.json()
        setTeams(prev => [newTeamMember, ...prev])
        setShowAddTeamDialog(false)
        toast({ title: 'Success', description: 'Team member added successfully!' })
      } else {
        const error = await response.json()
        toast({ title: 'Error', description: error.error || 'Failed to add team member', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add team member', variant: 'destructive' })
    }
  }

  const addSchedule = async (scheduleData) => {
    if (!user || user.role !== 'admin') {
      toast({ 
        title: 'Access Denied', 
        description: 'Admin privileges required to add schedules', 
        variant: 'destructive' 
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      })

      if (response.ok) {
        const newSchedule = await response.json()
        setSchedules(prev => [newSchedule, ...prev])
        setShowAddScheduleDialog(false)
        toast({ title: 'Success', description: 'Schedule added successfully!' })
        
        // Update next launch if this is the earliest upcoming launch
        const now = new Date()
        if (new Date(scheduleData.launchDate) > now) {
          const allSchedules = [newSchedule, ...schedules]
          const upcomingLaunches = allSchedules.filter(schedule => new Date(schedule.launchDate) > now)
          if (upcomingLaunches.length > 0) {
            const nextLaunchSchedule = upcomingLaunches.sort((a, b) => 
              new Date(a.launchDate) - new Date(b.launchDate)
            )[0]
            setNextLaunch(nextLaunchSchedule)
          }
        }
      } else {
        const error = await response.json()
        toast({ title: 'Error', description: error.error || 'Failed to add schedule', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add schedule', variant: 'destructive' })
    }
  }

  // Countdown timer
  useEffect(() => {
    if (!nextLaunch) return
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const launchTime = new Date(nextLaunch.launchDate).getTime()
      const difference = launchTime - now
      
      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [nextLaunch])

  // Check for existing token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setUser(data.user)
        } else {
          localStorage.removeItem('token')
        }
      })
      .catch(() => localStorage.removeItem('token'))
    }
    fetchData()
  }, [])

  const renderHomePage = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <Suspense fallback={null}>
              <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} />
              <Environment preset="night" />
              <ambientLight intensity={0.2} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <RocketModel />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Suspense>
          </Canvas>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              ASTRO<span className="text-blue-400">LAUNCH</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Leading the future of space exploration with innovative rocket technology and mission capabilities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                <Rocket className="mr-2 h-5 w-5" />
                Explore Our Rockets
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Next Launch
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Next Launch Countdown */}
      {nextLaunch && (
        <section className="py-20 px-4 bg-gradient-to-r from-blue-900 to-purple-900">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-8">Next Launch: {nextLaunch.missionName}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {Object.entries(countdown).map(([unit, value]) => (
                <div key={unit} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold text-white">{value}</div>
                  <div className="text-sm text-gray-300 capitalize">{unit}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Why Choose AstroLaunch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">99.9% Success Rate</h3>
              <p className="text-gray-400">Proven track record of successful launches and mission completions</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cutting-Edge Technology</h3>
              <p className="text-gray-400">Advanced propulsion systems and spacecraft design</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Global Reach</h3>
              <p className="text-gray-400">Worldwide launch capabilities and satellite deployment</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Missions */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Recent Missions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(missions || []).slice(0, 3).map((mission, index) => (
              <Card key={mission.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white">{mission.name}</CardTitle>
                    <Badge variant={mission.status === 'success' ? 'default' : 'secondary'}>
                      {mission.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">{mission.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Launch Date:</span>
                      <span>{new Date(mission.launchDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payload:</span>
                      <span>{mission.payload}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )

  const renderRocketsPage = () => (
    <div className="min-h-screen pt-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Our Rockets</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(rockets || []).map((rocket) => (
            <Card key={rocket.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{rocket.name}</CardTitle>
                <CardDescription className="text-gray-400">{rocket.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-300">
                    <div className="flex justify-between mb-2">
                      <span>Height:</span>
                      <span>{rocket.specifications.height}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Diameter:</span>
                      <span>{rocket.specifications.diameter}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Mass:</span>
                      <span>{rocket.specifications.mass}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Payload to LEO:</span>
                      <span>{rocket.specifications.payloadToLEO}</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        View 3D Model
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[600px]">
                      <DialogHeader>
                        <DialogTitle>{rocket.name} - 3D Model</DialogTitle>
                      </DialogHeader>
                      <div className="h-full">
                        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                          <Suspense fallback={null}>
                            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
                            <Environment preset="night" />
                            <ambientLight intensity={0.3} />
                            <directionalLight position={[10, 10, 5]} intensity={1} />
                            <RocketModel scale={[0.5, 0.5, 0.5]} />
                            <OrbitControls />
                          </Suspense>
                        </Canvas>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMissionsPage = () => (
    <div className="min-h-screen pt-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Our Missions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(missions || []).map((mission) => (
            <Card key={mission.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{mission.name}</CardTitle>
                    <CardDescription className="text-gray-400">{mission.description}</CardDescription>
                  </div>
                  <Badge variant={mission.status === 'success' ? 'default' : 'secondary'}>
                    {mission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Launch Date:</span>
                    <span>{new Date(mission.launchDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payload:</span>
                    <span>{mission.payload}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orbit:</span>
                    <span>{mission.orbit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{mission.customer}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTeamPage = () => (
    <div className="min-h-screen pt-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Our Team</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(teams || []).map((member) => (
            <Card key={member.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{member.name}</CardTitle>
                <CardDescription className="text-gray-400">{member.position}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">{member.bio}</p>
                  <div className="text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Department:</span>
                      <span>{member.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span>{member.experience}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSchedulePage = () => (
    <div className="min-h-screen pt-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Launch Schedule</h1>
        <div className="space-y-6">
          {(schedules || []).map((schedule) => (
            <Card key={schedule.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{schedule.missionName}</CardTitle>
                    <CardDescription className="text-gray-400">{schedule.description}</CardDescription>
                  </div>
                  <Badge variant={schedule.status === 'scheduled' ? 'default' : 'secondary'}>
                    {schedule.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Launch Date:</span>
                      <span>{new Date(schedule.launchDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Launch Time:</span>
                      <span>{schedule.launchTime}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Rocket:</span>
                      <span>{schedule.rocket}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Launch Site:</span>
                      <span>{schedule.launchSite}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Customer:</span>
                      <span>{schedule.customer}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Payload:</span>
                      <span>{schedule.payload}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContactPage = () => (
    <div className="min-h-screen pt-20 px-4 bg-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Get in Touch</CardTitle>
              <CardDescription className="text-gray-400">
                Ready to launch your next mission? Contact our team today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="h-5 w-5" />
                  <span>contact@astrolaunch.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="h-5 w-5" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="h-5 w-5" />
                  <span>123 Space Center Drive, Houston, TX 77058</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Send Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Name</Label>
                  <Input id="name" placeholder="Your name" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input id="email" type="email" placeholder="Your email" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <Label htmlFor="message" className="text-white">Message</Label>
                  <Textarea id="message" placeholder="Your message" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Send Message</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // Add Rocket Form Component
  const AddRocketForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      type: '',
      specifications: {
        height: '',
        diameter: '',
        mass: '',
        payloadToLEO: ''
      },
      status: 'development'
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!formData.name || !formData.type || !formData.specifications.height) {
        toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' })
        return
      }
      addRocket(formData)
    }

    return (
      <Dialog open={showAddRocketDialog} onOpenChange={setShowAddRocketDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Rocket</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rocketName">Rocket Name *</Label>
                <Input
                  id="rocketName"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Falcon Heavy"
                  required
                />
              </div>
              <div>
                <Label htmlFor="rocketType">Type *</Label>
                <Input
                  id="rocketType"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  placeholder="e.g., Heavy-lift launch vehicle"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height *</Label>
                <Input
                  id="height"
                  value={formData.specifications.height}
                  onChange={(e) => setFormData({
                    ...formData, 
                    specifications: {...formData.specifications, height: e.target.value}
                  })}
                  placeholder="e.g., 70 m"
                  required
                />
              </div>
              <div>
                <Label htmlFor="diameter">Diameter</Label>
                <Input
                  id="diameter"
                  value={formData.specifications.diameter}
                  onChange={(e) => setFormData({
                    ...formData, 
                    specifications: {...formData.specifications, diameter: e.target.value}
                  })}
                  placeholder="e.g., 12.2 m"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mass">Mass</Label>
                <Input
                  id="mass"
                  value={formData.specifications.mass}
                  onChange={(e) => setFormData({
                    ...formData, 
                    specifications: {...formData.specifications, mass: e.target.value}
                  })}
                  placeholder="e.g., 1,420,788 kg"
                />
              </div>
              <div>
                <Label htmlFor="payloadToLEO">Payload to LEO</Label>
                <Input
                  id="payloadToLEO"
                  value={formData.specifications.payloadToLEO}
                  onChange={(e) => setFormData({
                    ...formData, 
                    specifications: {...formData.specifications, payloadToLEO: e.target.value}
                  })}
                  placeholder="e.g., 63,800 kg"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
              >
                <option value="development">Development</option>
                <option value="active">Active</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddRocketDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Rocket
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // Add Mission Form Component
  const AddMissionForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      status: 'planned',
      launchDate: '',
      payload: '',
      orbit: '',
      customer: ''
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!formData.name || !formData.description || !formData.launchDate) {
        toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' })
        return
      }
      
      const missionData = {
        ...formData,
        launchDate: new Date(formData.launchDate)
      }
      addMission(missionData)
    }

    return (
      <Dialog open={showAddMissionDialog} onOpenChange={setShowAddMissionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Mission</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="missionName">Mission Name *</Label>
              <Input
                id="missionName"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Artemis Moon Mission"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="e.g., Return humans to the Moon and establish a sustainable lunar presence"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="launchDate">Launch Date *</Label>
                <Input
                  id="launchDate"
                  type="date"
                  value={formData.launchDate}
                  onChange={(e) => setFormData({...formData, launchDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="missionStatus">Status</Label>
                <select
                  id="missionStatus"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="planned">Planned</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payload">Payload</Label>
                <Input
                  id="payload"
                  value={formData.payload}
                  onChange={(e) => setFormData({...formData, payload: e.target.value})}
                  placeholder="e.g., Orion Spacecraft"
                />
              </div>
              <div>
                <Label htmlFor="orbit">Orbit</Label>
                <Input
                  id="orbit"
                  value={formData.orbit}
                  onChange={(e) => setFormData({...formData, orbit: e.target.value})}
                  placeholder="e.g., Lunar orbit"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                value={formData.customer}
                onChange={(e) => setFormData({...formData, customer: e.target.value})}
                placeholder="e.g., NASA"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddMissionDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Mission
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // Add Team Member Form Component
  const AddTeamForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      position: '',
      department: '',
      bio: '',
      experience: ''
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!formData.name || !formData.position || !formData.department) {
        toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' })
        return
      }
      addTeamMember(formData)
    }

    return (
      <Dialog open={showAddTeamDialog} onOpenChange={setShowAddTeamDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="memberName">Name *</Label>
                <Input
                  id="memberName"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Dr. Sarah Chen"
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="e.g., Chief Technology Officer"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                  <option value="Research">Research</option>
                  <option value="Management">Management</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>
              <div>
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="e.g., 15 years"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Brief biography and expertise..."
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddTeamDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Team Member
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // Add Schedule Form Component
  const AddScheduleForm = () => {
    const [formData, setFormData] = useState({
      missionName: '',
      description: '',
      launchDate: '',
      launchTime: '',
      rocket: '',
      launchSite: '',
      customer: '',
      payload: '',
      status: 'scheduled'
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!formData.missionName || !formData.description || !formData.launchDate) {
        toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' })
        return
      }
      
      const scheduleData = {
        ...formData,
        launchDate: new Date(formData.launchDate)
      }
      addSchedule(scheduleData)
    }

    return (
      <Dialog open={showAddScheduleDialog} onOpenChange={setShowAddScheduleDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Launch Schedule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="scheduleMissionName">Mission Name *</Label>
              <Input
                id="scheduleMissionName"
                value={formData.missionName}
                onChange={(e) => setFormData({...formData, missionName: e.target.value})}
                placeholder="e.g., Jupiter Probe Launch"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="scheduleDescription">Description *</Label>
              <Textarea
                id="scheduleDescription"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="e.g., Scientific mission to study Jupiter and its moons"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduleLaunchDate">Launch Date *</Label>
                <Input
                  id="scheduleLaunchDate"
                  type="date"
                  value={formData.launchDate}
                  onChange={(e) => setFormData({...formData, launchDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="launchTime">Launch Time</Label>
                <Input
                  id="launchTime"
                  value={formData.launchTime}
                  onChange={(e) => setFormData({...formData, launchTime: e.target.value})}
                  placeholder="e.g., 14:30 UTC"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduleRocket">Rocket</Label>
                <Input
                  id="scheduleRocket"
                  value={formData.rocket}
                  onChange={(e) => setFormData({...formData, rocket: e.target.value})}
                  placeholder="e.g., Falcon Heavy"
                />
              </div>
              <div>
                <Label htmlFor="launchSite">Launch Site</Label>
                <Input
                  id="launchSite"
                  value={formData.launchSite}
                  onChange={(e) => setFormData({...formData, launchSite: e.target.value})}
                  placeholder="e.g., Kennedy Space Center"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduleCustomer">Customer</Label>
                <Input
                  id="scheduleCustomer"
                  value={formData.customer}
                  onChange={(e) => setFormData({...formData, customer: e.target.value})}
                  placeholder="e.g., NASA"
                />
              </div>
              <div>
                <Label htmlFor="schedulePayload">Payload</Label>
                <Input
                  id="schedulePayload"
                  value={formData.payload}
                  onChange={(e) => setFormData({...formData, payload: e.target.value})}
                  placeholder="e.g., Jupiter Probe"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="scheduleStatus">Status</Label>
              <select
                id="scheduleStatus"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddScheduleDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Schedule
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  const renderAdminPage = () => {
    // Check if user is logged in and is admin
    if (!user) {
      return (
        <div className="min-h-screen pt-20 px-4 bg-black">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>
            <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-white">Admin Access Required</CardTitle>
                <CardDescription className="text-gray-400">
                  Please log in with admin credentials to access the admin dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-gray-300 text-sm">
                  <p className="mb-2">Use these admin credentials:</p>
                  <div className="bg-gray-900 p-3 rounded font-mono text-xs">
                    <p>Email: <span className="text-blue-400">admin@astrolaunch.com</span></p>
                    <p>Password: <span className="text-blue-400">admin123</span></p>
                  </div>
                </div>
                <AuthDialog login={login} register={register} />
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    if (user.role !== 'admin') {
      return (
        <div className="min-h-screen pt-20 px-4 bg-black">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Access Denied</h1>
            <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-white">Admin Privileges Required</CardTitle>
                <CardDescription className="text-gray-400">
                  You need admin privileges to access this page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Current user: <span className="text-blue-400">{user.name}</span>
                </p>
                <p className="text-gray-300 mb-4">
                  Role: <span className="text-yellow-400">{user.role}</span>
                </p>
                <Button 
                  onClick={() => setActiveSection('home')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen pt-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <div className="text-white">
              Welcome, <span className="text-blue-400">{user.name}</span>
              <span className="ml-2 px-2 py-1 bg-green-600 text-xs rounded">
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
          
          <Tabs defaultValue="rockets" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rockets">Rockets</TabsTrigger>
              <TabsTrigger value="missions">Missions</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rockets" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Rockets</h2>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowAddRocketDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rocket
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(rockets || []).map((rocket) => (
                  <Card key={rocket.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">{rocket.name}</CardTitle>
                      <CardDescription className="text-gray-400">{rocket.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-300 mb-4">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant={rocket.status === 'active' ? 'default' : 'secondary'}>
                            {rocket.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Height:</span>
                          <span>{rocket.specifications?.height || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payload:</span>
                          <span>{rocket.specifications?.payloadToLEO || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="missions" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Missions</h2>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowAddMissionDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mission
                </Button>
              </div>
              <div className="space-y-4">
                {(missions || []).map((mission) => (
                  <Card key={mission.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">{mission.name}</CardTitle>
                          <CardDescription className="text-gray-400">{mission.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={mission.status === 'success' ? 'default' : 'secondary'}>
                            {mission.status}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Launch Date:</span>
                          <span>{new Date(mission.launchDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customer:</span>
                          <span>{mission.customer || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payload:</span>
                          <span>{mission.payload || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Orbit:</span>
                          <span>{mission.orbit || 'N/A'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="teams" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Team</h2>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowAddTeamDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(teams || []).map((member) => (
                  <Card key={member.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">{member.name}</CardTitle>
                      <CardDescription className="text-gray-400">{member.position}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-300 mb-4">
                        <div className="flex justify-between">
                          <span>Department:</span>
                          <span>{member.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Experience:</span>
                          <span>{member.experience || 'N/A'}</span>
                        </div>
                        {member.bio && (
                          <p className="text-xs text-gray-400 mt-2 line-clamp-3">
                            {member.bio}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="schedules" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Schedules</h2>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowAddScheduleDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
              <div className="space-y-4">
                {(schedules || []).map((schedule) => (
                  <Card key={schedule.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">{schedule.missionName}</CardTitle>
                          <CardDescription className="text-gray-400">{schedule.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={schedule.status === 'scheduled' ? 'default' : 'secondary'}>
                            {schedule.status}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Launch Date:</span>
                          <span>{new Date(schedule.launchDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Launch Time:</span>
                          <span>{schedule.launchTime || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rocket:</span>
                          <span>{schedule.rocket || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Launch Site:</span>
                          <span>{schedule.launchSite || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customer:</span>
                          <span>{schedule.customer || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payload:</span>
                          <span>{schedule.payload || 'TBD'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Add Form Dialogs */}
          <AddRocketForm />
          <AddMissionForm />
          <AddTeamForm />
          <AddScheduleForm />
        </div>
      </div>
    )
  }

  const renderCurrentPage = () => {
    switch (activeSection) {
      case 'rockets':
        return renderRocketsPage()
      case 'missions':
        return renderMissionsPage()
      case 'team':
        return renderTeamPage()
      case 'schedule':
        return renderSchedulePage()
      case 'contact':
        return renderContactPage()
      case 'admin':
        return renderAdminPage()
      default:
        return renderHomePage()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading AstroLaunch...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
        logout={logout}
      />
      <AuthDialog 
        login={login}
        register={register}
      />
      {renderCurrentPage()}
    </div>
  )
}