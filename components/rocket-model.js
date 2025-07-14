'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, Cone, Sphere } from '@react-three/drei'
import * as THREE from 'three'

export default function RocketModel({ scale = [1, 1, 1], ...props }) {
  const rocketRef = useRef()
  const particlesRef = useRef()

  // Create particle system for rocket exhaust
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = []
    const colors = []
    const sizes = []

    for (let i = 0; i < 100; i++) {
      positions.push(
        (Math.random() - 0.5) * 2,
        -Math.random() * 4 - 2,
        (Math.random() - 0.5) * 2
      )
      colors.push(1, Math.random() * 0.5, 0)
      sizes.push(Math.random() * 0.1 + 0.05)
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
      opacity: 0.6
    })
  }, [])

  useFrame((state) => {
    if (rocketRef.current) {
      rocketRef.current.rotation.y += 0.01
      rocketRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.02
      const positions = particlesRef.current.geometry.attributes.position.array
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.05
        if (positions[i] < -6) {
          positions[i] = 2
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={rocketRef} scale={scale} {...props}>
      {/* Main rocket body */}
      <Cylinder args={[0.3, 0.3, 4, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.3} />
      </Cylinder>
      
      {/* Nose cone */}
      <Cone args={[0.3, 1, 16]} position={[0, 2.5, 0]}>
        <meshStandardMaterial color="#ff4444" metalness={0.5} roughness={0.2} />
      </Cone>
      
      {/* Rocket fins */}
      <group position={[0, -2, 0]}>
        <Cylinder args={[0.1, 0.2, 0.8, 8]} position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.1, 0.2, 0.8, 8]} position={[-0.5, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.1, 0.2, 0.8, 8]} position={[0, 0, 0.5]} rotation={[Math.PI / 4, 0, 0]}>
          <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.1, 0.2, 0.8, 8]} position={[0, 0, -0.5]} rotation={[-Math.PI / 4, 0, 0]}>
          <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
        </Cylinder>
      </group>
      
      {/* Engine nozzle */}
      <Cone args={[0.35, 0.6, 16]} position={[0, -2.8, 0]} rotation={[Math.PI, 0, 0]}>
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </Cone>
      
      {/* Fuel tank detail */}
      <Cylinder args={[0.28, 0.28, 0.2, 16]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#4444ff" metalness={0.6} roughness={0.4} />
      </Cylinder>
      
      {/* Logo/Window */}
      <Sphere args={[0.15, 16, 16]} position={[0, 1, 0.31]}>
        <meshStandardMaterial color="#000000" metalness={0.1} roughness={0.9} />
      </Sphere>
      
      {/* Exhaust particles */}
      <points ref={particlesRef} geometry={particlesGeometry} material={particlesMaterial} />
      
      {/* Glowing engine effect */}
      <Sphere args={[0.2, 16, 16]} position={[0, -3.2, 0]}>
        <meshStandardMaterial 
          color="#ff6600" 
          emissive="#ff3300" 
          emissiveIntensity={0.5}
          transparent={true}
          opacity={0.8}
        />
      </Sphere>
    </group>
  )
}