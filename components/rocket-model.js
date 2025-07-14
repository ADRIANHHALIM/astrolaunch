'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, Cone, Sphere, Box, Torus } from '@react-three/drei'
import * as THREE from 'three'

export default function RocketModel({ scale = [1, 1, 1], ...props }) {
  const rocketRef = useRef()
  const particlesRef = useRef()
  const flameRef = useRef()

  // Create more realistic particle system for rocket exhaust
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = []
    const colors = []
    const sizes = []

    for (let i = 0; i < 200; i++) {
      // Create cone-shaped exhaust pattern
      const angle = (Math.PI * 2 * i) / 200
      const radius = Math.random() * 0.5 + 0.1
      positions.push(
        Math.cos(angle) * radius * (Math.random() * 0.5 + 0.5),
        -Math.random() * 6 - 3,
        Math.sin(angle) * radius * (Math.random() * 0.5 + 0.5)
      )
      
      // Color gradient from white to orange to red
      const intensity = Math.random()
      colors.push(
        1, 
        intensity * 0.7 + 0.3, 
        intensity * 0.2
      )
      sizes.push(Math.random() * 0.15 + 0.05)
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

    return geometry
  }, [])

  const particlesMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8
    })
  }, [])

  useFrame((state) => {
    if (rocketRef.current) {
      rocketRef.current.rotation.y += 0.005
      rocketRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01
      const positions = particlesRef.current.geometry.attributes.position.array
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.1
        if (positions[i] < -10) {
          positions[i] = 3
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }

    if (flameRef.current) {
      flameRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1
      flameRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1
      flameRef.current.material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 8) * 0.3
    }
  })

  return (
    <group ref={rocketRef} scale={scale} {...props}>
      {/* Main rocket body - more realistic proportions */}
      <Cylinder args={[0.4, 0.4, 6, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#f0f0f0" 
          metalness={0.8} 
          roughness={0.2}
          envMapIntensity={1}
        />
      </Cylinder>
      
      {/* Fuel tank sections with realistic details */}
      <Cylinder args={[0.42, 0.42, 0.3, 32]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#2563eb" metalness={0.7} roughness={0.3} />
      </Cylinder>
      
      <Cylinder args={[0.42, 0.42, 0.3, 32]} position={[0, -1.5, 0]}>
        <meshStandardMaterial color="#2563eb" metalness={0.7} roughness={0.3} />
      </Cylinder>

      {/* Nose cone - more sleek and aerodynamic */}
      <Cone args={[0.4, 1.5, 32]} position={[0, 3.75, 0]}>
        <meshStandardMaterial 
          color="#dc2626" 
          metalness={0.6} 
          roughness={0.1}
          envMapIntensity={1}
        />
      </Cone>
      
      {/* Command module window */}
      <Sphere args={[0.25, 16, 16]} position={[0, 2.5, 0.41]}>
        <meshStandardMaterial 
          color="#000000" 
          metalness={0.9} 
          roughness={0.1}
          transparent={true}
          opacity={0.8}
        />
      </Sphere>
      
      {/* Realistic rocket fins - more aerodynamic */}
      <group position={[0, -2.5, 0]}>
        {/* Main fins */}
        <Box args={[0.1, 1.5, 0.8]} position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </Box>
        <Box args={[0.1, 1.5, 0.8]} position={[-0.6, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </Box>
        <Box args={[0.8, 1.5, 0.1]} position={[0, 0, 0.6]} rotation={[Math.PI / 6, 0, 0]}>
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </Box>
        <Box args={[0.8, 1.5, 0.1]} position={[0, 0, -0.6]} rotation={[-Math.PI / 6, 0, 0]}>
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </Box>
      </group>
      
      {/* Engine section - more detailed */}
      <Cylinder args={[0.45, 0.3, 0.8, 32]} position={[0, -3.4, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </Cylinder>
      
      {/* Engine nozzles - multiple realistic nozzles */}
      <group position={[0, -3.8, 0]}>
        {/* Main central nozzle */}
        <Cone args={[0.35, 0.8, 32]} position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
        </Cone>
        
        {/* Smaller surrounding nozzles */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2
          const radius = 0.2
          return (
            <Cone 
              key={i}
              args={[0.1, 0.4, 16]} 
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[Math.PI, 0, 0]}
            >
              <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
            </Cone>
          )
        })}
      </group>
      
      {/* Rocket details and markings */}
      <group>
        {/* USA flag marking */}
        <Box args={[0.3, 0.2, 0.01]} position={[0, 1, 0.41]}>
          <meshStandardMaterial color="#dc2626" />
        </Box>
        
        {/* Company logo area */}
        <Box args={[0.4, 0.3, 0.01]} position={[0, 0, 0.41]}>
          <meshStandardMaterial color="#1e40af" />
        </Box>
        
        {/* Fuel lines and details */}
        <Cylinder args={[0.02, 0.02, 5, 8]} position={[0.35, 0, 0]}>
          <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
        </Cylinder>
        <Cylinder args={[0.02, 0.02, 5, 8]} position={[-0.35, 0, 0]}>
          <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
        </Cylinder>
      </group>
      
      {/* Realistic engine flame */}
      <group ref={flameRef} position={[0, -4.5, 0]}>
        <Cone args={[0.3, 1.5, 16]} position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial 
            color="#ff6600" 
            emissive="#ff3300" 
            emissiveIntensity={0.8}
            transparent={true}
            opacity={0.7}
          />
        </Cone>
        
        {/* Inner flame core */}
        <Cone args={[0.15, 1, 16]} position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial 
            color="#00aaff" 
            emissive="#0088ff" 
            emissiveIntensity={1}
            transparent={true}
            opacity={0.9}
          />
        </Cone>
      </group>
      
      {/* Exhaust particles */}
      <points ref={particlesRef} geometry={particlesGeometry} material={particlesMaterial} />
      
      {/* Additional glow effects */}
      <Sphere args={[0.4, 16, 16]} position={[0, -4.2, 0]}>
        <meshStandardMaterial 
          color="#ff6600" 
          emissive="#ff3300" 
          emissiveIntensity={0.3}
          transparent={true}
          opacity={0.4}
        />
      </Sphere>
      
      {/* Satellite/payload section */}
      <Cylinder args={[0.3, 0.3, 0.8, 16]} position={[0, 2.8, 0]}>
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.2} 
          roughness={0.8}
        />
      </Cylinder>
      
      {/* RCS thrusters */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2
        const radius = 0.45
        return (
          <Box 
            key={i}
            args={[0.08, 0.08, 0.15]} 
            position={[Math.cos(angle) * radius, 1, Math.sin(angle) * radius]}
          >
            <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
          </Box>
        )
      })}
      
      {/* Landing legs */}
      <group position={[0, -2.8, 0]}>
        {[0, 1, 2].map((i) => {
          const angle = (i * Math.PI * 2) / 3
          const radius = 0.5
          return (
            <Box 
              key={i}
              args={[0.05, 1.2, 0.05]} 
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[0, 0, Math.PI / 12]}
            >
              <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
            </Box>
          )
        })}
      </group>
    </group>
  )
}