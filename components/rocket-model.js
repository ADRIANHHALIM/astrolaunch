'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, Cone, Sphere, Box, Torus, Ring } from '@react-three/drei'
import * as THREE from 'three'

export default function RocketModel({ scale = [1, 1, 1], ...props }) {
  const spacecraftRef = useRef()
  const rotatingRingRef = useRef()
  const exhaustRef = useRef()
  const particlesRef = useRef()
  const earthRef = useRef()
  const atmosphereRef = useRef()
  const cloudsRef = useRef()
  const cameraTargetRef = useRef()

  // Clean ion exhaust particles
  const exhaustGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = []
    const colors = []

    for (let i = 0; i < 200; i++) { // More particles for better effect
      const angle = (Math.PI * 2 * i) / 200
      const radius = Math.random() * 0.4
      const height = Math.random() * 8 + 0.5
      
      positions.push(
        Math.cos(angle) * radius,
        -height,
        Math.sin(angle) * radius
      )
      
      // Enhanced dynamic exhaust colors
      const intensity = 1 - (height / 8.5)
      colors.push(
        0.9 + intensity * 0.1, 
        0.6 + intensity * 0.4, 
        0.3 + intensity * 0.7
      )
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geometry
  }, [])

  const exhaustMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9
    })
  }, [])

  // Cloud particles for atmosphere
  const cloudGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = []
    const colors = []

    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 16 + Math.random() * 3
      const height = Math.random() * 4 - 2
      
      positions.push(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      )
      
      colors.push(0.9, 0.95, 1)
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geometry
  }, [])

  const cloudMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    })
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const camera = state.camera

    // Earth rotation
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001
    }
    
    // Atmospheric effects
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0015
      const pulse = 1 + Math.sin(time * 2) * 0.1
      atmosphereRef.current.scale.set(pulse, pulse, pulse)
    }
    
    // Animated clouds
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.002
    }

    if (spacecraftRef.current) {
      // Epic launch sequence: rocket flies from Earth into space
      const launchPhase = Math.min(time / 25, 1) // Extended to 25 seconds for better cinematic effect
      
      // Launch trajectory - starts at Earth surface and goes to space
      const earthRadius = 15
      const launchHeight = launchPhase * 120 // Goes even higher for more dramatic effect
      const initialY = -earthRadius + 3 // Start just above Earth surface
      
      // Complex launch trajectory with realistic physics
      const acceleration = Math.pow(launchPhase, 0.7) // Smoother acceleration
      const finalY = initialY + launchHeight * acceleration
      
      // Add orbital mechanics - more pronounced curve
      const orbitalCurve = launchPhase > 0.6 ? (launchPhase - 0.6) * 15 : 0
      
      spacecraftRef.current.position.y = finalY + Math.sin(time * 0.5) * 0.1
      spacecraftRef.current.position.x = orbitalCurve * Math.cos(time * 0.3)
      spacecraftRef.current.position.z = orbitalCurve * Math.sin(time * 0.3)
      
      // Dynamic camera tracking - follows the rocket
      if (launchPhase > 0.2) {
        // Camera starts following after initial launch
        const followIntensity = Math.min((launchPhase - 0.2) / 0.3, 1)
        
        // Smooth camera position transition
        const targetX = spacecraftRef.current.position.x + 20 * Math.cos(time * 0.1)
        const targetY = spacecraftRef.current.position.y + 8 + followIntensity * 5
        const targetZ = spacecraftRef.current.position.z + 25 + followIntensity * 10
        
        // Lerp camera position for smooth following
        camera.position.x += (targetX - camera.position.x) * 0.02
        camera.position.y += (targetY - camera.position.y) * 0.02
        camera.position.z += (targetZ - camera.position.z) * 0.02
        
        // Make camera look at the rocket
        camera.lookAt(
          spacecraftRef.current.position.x,
          spacecraftRef.current.position.y,
          spacecraftRef.current.position.z
        )
      }
      
      // Rocket orientation during launch
      if (launchPhase < 0.25) {
        // Initial vertical ascent
        spacecraftRef.current.rotation.x = 0
        spacecraftRef.current.rotation.z = 0
      } else if (launchPhase < 0.7) {
        // Gravity turn - more dramatic
        const turnAngle = (launchPhase - 0.25) * 0.6 * Math.PI / 3
        spacecraftRef.current.rotation.z = turnAngle * Math.cos(time * 0.5)
        spacecraftRef.current.rotation.x = Math.sin(time * 0.3) * 0.1
      } else {
        // Orbital insertion - complex 3D rotation
        spacecraftRef.current.rotation.y += 0.003
        spacecraftRef.current.rotation.z = Math.sin(time * 0.3) * 0.15
        spacecraftRef.current.rotation.x = Math.cos(time * 0.4) * 0.1
      }
    }
    
    // Enhanced rotating habitat ring
    if (rotatingRingRef.current) {
      const launchPhase = Math.min(time / 25, 1)
      const spinRate = 0.008 + launchPhase * 0.025 // More dramatic spinning
      rotatingRingRef.current.rotation.z += spinRate
      
      // Add some wobble during intense acceleration
      if (launchPhase < 0.4 && launchPhase > 0.1) {
        const wobble = Math.sin(time * 12) * 0.02 * (0.4 - launchPhase)
        rotatingRingRef.current.rotation.x = wobble
        rotatingRingRef.current.rotation.y = wobble * 0.5
      }
    }

    // Enhanced exhaust particles with dynamic behavior
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array
      const colors = particlesRef.current.geometry.attributes.color.array
      const launchPhase = Math.min(time / 25, 1)
      const thrustIntensity = launchPhase < 1 ? 2.5 + Math.sin(time * 8) * 0.5 : 1
      
      for (let i = 1; i < positions.length; i += 3) {
        // More dynamic particle movement
        positions[i] -= 0.06 * thrustIntensity
        
        // Add some turbulence
        const turbulence = Math.sin(time * 10 + i) * 0.01
        positions[i - 1] += turbulence
        positions[i + 1] += turbulence * 0.5
        
        if (positions[i] < -12) {
          positions[i] = 0.5 + Math.random() * 0.5
          // Reset with some randomness
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * 0.4
          positions[i - 1] = Math.cos(angle) * radius
          positions[i + 1] = Math.sin(angle) * radius
        }
        
        // Dynamic color changes based on thrust
        const colorIndex = Math.floor(i / 3) * 3
        const heat = thrustIntensity / 3
        colors[colorIndex] = 0.9 + heat * 0.1
        colors[colorIndex + 1] = 0.6 + heat * 0.4
        colors[colorIndex + 2] = 0.3 + heat * 0.7
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
      particlesRef.current.geometry.attributes.color.needsUpdate = true
    }

    // Dynamic exhaust glow with pulsing effect
    if (exhaustRef.current) {
      const launchPhase = Math.min(time / 25, 1)
      const baseIntensity = 1 + (launchPhase < 1 ? launchPhase * 3 : 1)
      const pulse = Math.sin(time * 15) * 0.3
      
      exhaustRef.current.scale.x = baseIntensity + pulse
      exhaustRef.current.scale.z = baseIntensity + pulse
      exhaustRef.current.scale.y = 1 + launchPhase * 0.8 + pulse * 0.2
      
      // Add some rotation to the exhaust
      exhaustRef.current.rotation.y += 0.05
    }
  })

  return (
    <group>
      {/* Earth - positioned below the launch trajectory */}
      <group position={[0, -15, 0]}>
        {/* Earth surface with enhanced details */}
        <Sphere ref={earthRef} args={[15, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#2563eb"
            emissive="#1d4ed8"
            emissiveIntensity={0.15}
          />
        </Sphere>
        
        {/* Enhanced Earth atmosphere with multiple layers */}
        <Sphere ref={atmosphereRef} args={[15.8, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#60a5fa"
            transparent={true}
            opacity={0.4}
            emissive="#3b82f6"
            emissiveIntensity={0.3}
          />
        </Sphere>
        
        {/* Outer atmospheric glow */}
        <Sphere args={[16.2, 24, 24]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#87ceeb"
            transparent={true}
            opacity={0.2}
            emissive="#0ea5e9"
            emissiveIntensity={0.4}
          />
        </Sphere>
        
        {/* Enhanced atmospheric clouds */}
        <points ref={cloudsRef} geometry={cloudGeometry} material={cloudMaterial} />
        
        {/* More detailed continental outlines */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * Math.PI) / 4
          const height = Math.sin(i * 0.7) * 4
          return (
            <Sphere 
              key={i}
              args={[1.5 + Math.random() * 1, 16, 16]} 
              position={[Math.cos(angle) * 13, height, Math.sin(angle) * 13]}
            >
              <meshStandardMaterial 
                color="#16a34a"
                emissive="#22c55e"
                emissiveIntensity={0.15}
              />
            </Sphere>
          )
        })}
        
        {/* Ice caps */}
        <Sphere args={[2.5, 16, 16]} position={[0, 14, 0]}>
          <meshStandardMaterial 
            color="#f8fafc"
            emissive="#e2e8f0"
            emissiveIntensity={0.2}
          />
        </Sphere>
        <Sphere args={[2.5, 16, 16]} position={[0, -14, 0]}>
          <meshStandardMaterial 
            color="#f8fafc"
            emissive="#e2e8f0"
            emissiveIntensity={0.2}
          />
        </Sphere>
      </group>

      {/* Enhanced space environment */}
      {[...Array(150)].map((_, i) => {
        const x = (Math.random() - 0.5) * 300
        const y = Math.random() * 150 + 20
        const z = (Math.random() - 0.5) * 300
        const size = Math.random() * 0.15 + 0.05
        return (
          <Sphere 
            key={i}
            args={[size, 8, 8]} 
            position={[x, y, z]}
          >
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#f8fafc"
              emissiveIntensity={0.6 + Math.random() * 0.4}
            />
          </Sphere>
        )
      })}
      
      {/* Distant nebula effect */}
      {[...Array(20)].map((_, i) => {
        const x = (Math.random() - 0.5) * 400
        const y = Math.random() * 200 + 50
        const z = (Math.random() - 0.5) * 400
        const color = Math.random() > 0.5 ? "#8b5cf6" : "#06b6d4"
        return (
          <Sphere 
            key={`nebula-${i}`}
            args={[Math.random() * 3 + 1, 16, 16]} 
            position={[x, y, z]}
          >
            <meshStandardMaterial 
              color={color}
              transparent={true}
              opacity={0.1 + Math.random() * 0.2}
              emissive={color}
              emissiveIntensity={0.3}
            />
          </Sphere>
        )
      })}

      {/* Camera target helper (invisible) */}
      <group ref={cameraTargetRef} />

      {/* The spacecraft with enhanced scale and launch trajectory */}
      <group ref={spacecraftRef} scale={[1.8, 1.8, 1.8]} {...props}>
      {/* Central command module - enlarged */}
      <Cylinder args={[1.2, 1.2, 3.5, 48]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#e2e8f0" 
          metalness={0.8} 
          roughness={0.2}
        />
      </Cylinder>
      
      {/* Command module details with more sections */}
      <Cylinder args={[1.25, 1.25, 0.3, 48]} position={[0, 1, 0]}>
        <meshStandardMaterial 
          color="#64748b" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Cylinder>
      
      <Cylinder args={[1.25, 1.25, 0.3, 48]} position={[0, -1, 0]}>
        <meshStandardMaterial 
          color="#64748b" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Cylinder>
      
      {/* Additional structural rings */}
      <Cylinder args={[1.28, 1.28, 0.15, 48]} position={[0, 0.5, 0]}>
        <meshStandardMaterial 
          color="#475569" 
          metalness={0.95} 
          roughness={0.05}
        />
      </Cylinder>
      
      <Cylinder args={[1.28, 1.28, 0.15, 48]} position={[0, -0.5, 0]}>
        <meshStandardMaterial 
          color="#475569" 
          metalness={0.95} 
          roughness={0.05}
        />
      </Cylinder>
      
      {/* Enhanced docking ports */}
      <Cylinder args={[0.5, 0.5, 0.8, 24]} position={[0, 2.5, 0]}>
        <meshStandardMaterial 
          color="#374151" 
          metalness={0.95} 
          roughness={0.05}
        />
      </Cylinder>
      
      <Cylinder args={[0.5, 0.5, 0.8, 24]} position={[0, -2.5, 0]}>
        <meshStandardMaterial 
          color="#374151" 
          metalness={0.95} 
          roughness={0.05}
        />
      </Cylinder>
      
      {/* Extended docking mechanisms */}
      <Cylinder args={[0.3, 0.3, 0.4, 16]} position={[0, 3.1, 0]}>
        <meshStandardMaterial 
          color="#1f2937" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Cylinder>
      
      <Cylinder args={[0.3, 0.3, 0.4, 16]} position={[0, -3.1, 0]}>
        <meshStandardMaterial 
          color="#1f2937" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Cylinder>

      {/* Massive rotating habitat ring - Interstellar style */}
      <group ref={rotatingRingRef} position={[0, 0, 0]}>
        <Torus args={[5, 0.8, 24, 96]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#f1f5f9" 
            metalness={0.7} 
            roughness={0.3}
          />
        </Torus>
        
        {/* Secondary structural ring */}
        <Torus args={[5.2, 0.2, 16, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#64748b" 
            metalness={0.9} 
            roughness={0.1}
          />
        </Torus>
        
        {/* Enhanced habitat modules around the ring */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
          const angle = (i * Math.PI) / 6
          const radius = 5
          return (
            <Box 
              key={i}
              args={[1.2, 0.6, 1.5]} 
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[0, -angle, 0]}
            >
              <meshStandardMaterial 
                color="#cbd5e1" 
                metalness={0.6} 
                roughness={0.4}
              />
            </Box>
          )
        })}
        
        {/* Larger windows in habitat modules */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
          const angle = (i * Math.PI) / 6
          const radius = 5.4
          return (
            <Box 
              key={i}
              args={[0.8, 0.4, 0.05]} 
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[0, -angle, 0]}
            >
              <meshStandardMaterial 
                color="#0ea5e9" 
                emissive="#0284c7"
                emissiveIntensity={0.5}
                transparent={true}
                opacity={0.9}
              />
            </Box>
          )
        })}
        
        {/* Additional viewport windows */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
          const angle = (i * Math.PI) / 6
          const radius = 5.4
          return (
            <Box 
              key={`small-${i}`}
              args={[0.3, 0.2, 0.03]} 
              position={[Math.cos(angle) * radius, 0.3, Math.sin(angle) * radius]}
              rotation={[0, -angle, 0]}
            >
              <meshStandardMaterial 
                color="#22d3ee" 
                emissive="#0891b2"
                emissiveIntensity={0.4}
                transparent={true}
                opacity={0.8}
              />
            </Box>
          )
        })}
      </group>

      {/* Enhanced connecting struts with cross-bracing */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2
        const radius = 2.5
        return (
          <group key={i}>
            <Cylinder 
              args={[0.15, 0.15, 2.5, 16]} 
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[0, 0, angle]}
            >
              <meshStandardMaterial 
                color="#475569" 
                metalness={0.9} 
                roughness={0.1}
              />
            </Cylinder>
            {/* Cross-bracing struts */}
            <Cylinder 
              args={[0.08, 0.08, 1.8, 12]} 
              position={[Math.cos(angle + 0.3) * (radius * 0.7), 0.5, Math.sin(angle + 0.3) * (radius * 0.7)]}
              rotation={[0, 0, angle + 0.3]}
            >
              <meshStandardMaterial 
                color="#64748b" 
                metalness={0.8} 
                roughness={0.2}
              />
            </Cylinder>
            <Cylinder 
              args={[0.08, 0.08, 1.8, 12]} 
              position={[Math.cos(angle - 0.3) * (radius * 0.7), -0.5, Math.sin(angle - 0.3) * (radius * 0.7)]}
              rotation={[0, 0, angle - 0.3]}
            >
              <meshStandardMaterial 
                color="#64748b" 
                metalness={0.8} 
                roughness={0.2}
              />
            </Cylinder>
          </group>
        )
      })}

      {/* Massive main propulsion section */}
      <Cylinder args={[1.0, 0.7, 5, 48]} position={[0, -6, 0]}>
        <meshStandardMaterial 
          color="#1e293b" 
          metalness={0.95} 
          roughness={0.05}
        />
      </Cylinder>
      
      {/* Enhanced engine nozzles */}
      <group position={[0, -9, 0]}>
        {/* Primary main engine */}
        <Cone args={[0.65, 1.5, 32]} position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial 
            color="#0f172a" 
            metalness={0.98} 
            roughness={0.02}
          />
        </Cone>
        
        {/* Secondary thrusters - more powerful */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2
          const radius = 0.5
          return (
            <Cone 
              key={i}
              args={[0.2, 0.6, 16]} 
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[Math.PI, 0, 0]}
            >
              <meshStandardMaterial 
                color="#0f172a" 
                metalness={0.98} 
                roughness={0.02}
              />
            </Cone>
          )
        })}
        
        {/* Additional maneuvering thrusters */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * Math.PI) / 4
          const radius = 0.8
          return (
            <Cone 
              key={`maneuver-${i}`}
              args={[0.08, 0.25, 12]} 
              position={[Math.cos(angle) * radius, 0.3, Math.sin(angle) * radius]}
              rotation={[Math.PI, 0, 0]}
            >
              <meshStandardMaterial 
                color="#374151" 
                metalness={0.9} 
                roughness={0.1}
              />
            </Cone>
          )
        })}
      </group>

      {/* Enhanced ion drive exhaust */}
      <group ref={exhaustRef} position={[0, -10, 0]}>
        <Cone args={[0.5, 3, 24]} position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial 
            color="#87ceeb" 
            emissive="#0ea5e9" 
            emissiveIntensity={1.2}
            transparent={true}
            opacity={0.8}
          />
        </Cone>
        
        {/* Secondary exhaust cones */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2
          const radius = 0.5
          return (
            <Cone 
              key={i}
              args={[0.15, 1.2, 16]} 
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[Math.PI, 0, 0]}
            >
              <meshStandardMaterial 
                color="#60a5fa" 
                emissive="#3b82f6" 
                emissiveIntensity={0.8}
                transparent={true}
                opacity={0.7}
              />
            </Cone>
          )
        })}
      </group>
      
      {/* Exhaust particles */}
      <points ref={particlesRef} geometry={exhaustGeometry} material={exhaustMaterial} position={[0, -9.5, 0]} />

      {/* Massive solar panel arrays */}
      {[0, 1].map((i) => {
        const side = i === 0 ? 1 : -1
        return (
          <group key={i} position={[side * 4.5, 2, 0]}>
            <Box args={[4, 0.05, 8]}>
              <meshStandardMaterial 
                color="#1e40af" 
                metalness={0.4} 
                roughness={0.6}
              />
            </Box>
            {/* Enhanced solar panel grid */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => 
              <Box key={j} args={[4, 0.02, 0.08]} position={[0, 0.02, -3.5 + j]}>
                <meshStandardMaterial 
                  color="#475569" 
                  metalness={0.8} 
                  roughness={0.2}
                />
              </Box>
            )}
            {/* Solar panel support structure */}
            <Cylinder args={[0.08, 0.08, 4, 12]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial 
                color="#374151" 
                metalness={0.9} 
                roughness={0.1}
              />
            </Cylinder>
          </group>
        )
      })}
      
      {/* Additional smaller solar arrays */}
      {[0, 1].map((i) => {
        const side = i === 0 ? 1 : -1
        return (
          <group key={`small-${i}`} position={[side * 4.5, -2, 0]}>
            <Box args={[2, 0.05, 4]}>
              <meshStandardMaterial 
                color="#2563eb" 
                metalness={0.4} 
                roughness={0.6}
              />
            </Box>
          </group>
        )
      })}

      {/* Enhanced communication array */}
      <Cylinder args={[0.08, 0.08, 3, 16]} position={[0, 5, 0]}>
        <meshStandardMaterial 
          color="#6b7280" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Cylinder>
      
      <Sphere args={[0.3, 24, 24]} position={[0, 6.8, 0]}>
        <meshStandardMaterial 
          color="#e5e7eb" 
          metalness={0.8} 
          roughness={0.2}
        />
      </Sphere>
      
      {/* Additional communication dishes */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2
        const radius = 0.4
        return (
          <Sphere 
            key={i}
            args={[0.12, 16, 16]} 
            position={[Math.cos(angle) * radius, 6.5, Math.sin(angle) * radius]}
          >
            <meshStandardMaterial 
              color="#f3f4f6" 
              metalness={0.7} 
              roughness={0.3}
            />
          </Sphere>
        )
      })}

      {/* Enhanced RCS thruster systems */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2
        const radius = 1.4
        return (
          <group key={i} position={[Math.cos(angle) * radius, 1, Math.sin(angle) * radius]}>
            {[0, 1, 2, 3].map((j) => {
              const thrusterAngle = (j * Math.PI) / 2
              return (
                <Cylinder 
                  key={j}
                  args={[0.04, 0.04, 0.2, 12]} 
                  position={[Math.cos(thrusterAngle) * 0.15, 0, Math.sin(thrusterAngle) * 0.15]}
                  rotation={[0, 0, thrusterAngle]}
                >
                  <meshStandardMaterial 
                    color="#374151" 
                    metalness={0.95} 
                    roughness={0.05}
                  />
                </Cylinder>
              )
            })}
            {/* RCS housing */}
            <Cylinder args={[0.2, 0.2, 0.3, 16]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#1f2937" 
                metalness={0.9} 
                roughness={0.1}
              />
            </Cylinder>
          </group>
        )
      })}

      {/* Larger fuel tanks with enhanced detail */}
      <Cylinder args={[0.7, 0.7, 3, 32]} position={[2.2, -4, 0]}>
        <meshStandardMaterial 
          color="#d1d5db" 
          metalness={0.7} 
          roughness={0.3}
        />
      </Cylinder>
      
      <Cylinder args={[0.7, 0.7, 3, 32]} position={[-2.2, -4, 0]}>
        <meshStandardMaterial 
          color="#d1d5db" 
          metalness={0.7} 
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Fuel tank end caps */}
      <Sphere args={[0.7, 24, 24]} position={[2.2, -2.5, 0]}>
        <meshStandardMaterial 
          color="#9ca3af" 
          metalness={0.8} 
          roughness={0.2}
        />
      </Sphere>
      
      <Sphere args={[0.7, 24, 24]} position={[-2.2, -2.5, 0]}>
        <meshStandardMaterial 
          color="#9ca3af" 
          metalness={0.8} 
          roughness={0.2}
        />
      </Sphere>
      
      <Sphere args={[0.7, 24, 24]} position={[2.2, -5.5, 0]}>
        <meshStandardMaterial 
          color="#9ca3af" 
          metalness={0.8} 
          roughness={0.2}
        />
      </Sphere>
      
      <Sphere args={[0.7, 24, 24]} position={[-2.2, -5.5, 0]}>
        <meshStandardMaterial 
          color="#9ca3af" 
          metalness={0.8} 
          roughness={0.2}
        />
      </Sphere>

      {/* Enhanced radiator systems */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2 + Math.PI / 4
        const radius = 3
        return (
          <group key={i}>
            <Box 
              args={[0.05, 3, 1.5]} 
              position={[Math.cos(angle) * radius, -3, Math.sin(angle) * radius]}
              rotation={[0, angle, 0]}
            >
              <meshStandardMaterial 
                color="#374151" 
                metalness={0.9} 
                roughness={0.1}
              />
            </Box>
            {/* Radiator fins */}
            {[0, 1, 2, 3, 4].map((fin) => (
              <Box 
                key={fin}
                args={[0.02, 0.4, 1.5]} 
                position={[Math.cos(angle) * (radius + 0.1), -3 + fin * 0.6 - 1.2, Math.sin(angle) * (radius + 0.1)]}
                rotation={[0, angle, 0]}
              >
                <meshStandardMaterial 
                  color="#6b7280" 
                  metalness={0.8} 
                  roughness={0.2}
                />
              </Box>
            ))}
          </group>
        )
      })}
      
      {/* Cargo bay section */}
      <Cylinder args={[1.1, 1.1, 2.5, 48]} position={[0, 4.5, 0]}>
        <meshStandardMaterial 
          color="#f8fafc" 
          metalness={0.6} 
          roughness={0.4}
        />
      </Cylinder>
      
      {/* Cargo bay doors */}
      {[0, 1].map((i) => {
        const side = i === 0 ? 1 : -1
        return (
          <Box 
            key={i}
            args={[0.05, 2.5, 2]} 
            position={[side * 1.15, 4.5, 0]}
          >
            <meshStandardMaterial 
              color="#e2e8f0" 
              metalness={0.7} 
              roughness={0.3}
            />
          </Box>
        )
      })}
      
      {/* Landing gear system */}
      {[0, 1, 2].map((i) => {
        const angle = (i * Math.PI * 2) / 3
        const radius = 1.8
        return (
          <group key={i} position={[Math.cos(angle) * radius, -7.5, Math.sin(angle) * radius]}>
            <Cylinder args={[0.06, 0.06, 1.5, 12]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#1f2937" 
                metalness={0.9} 
                roughness={0.1}
              />
            </Cylinder>
            <Sphere args={[0.15, 16, 16]} position={[0, -0.9, 0]}>
              <meshStandardMaterial 
                color="#374151" 
                metalness={0.8} 
                roughness={0.3}
              />
            </Sphere>
          </group>
        )
      })}
      </group>
    </group>
  )
}