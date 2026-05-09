import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Environment, Stars, Float as FloatDrei } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShape = ({ position, color, speed, distort }: { position: [number, number, number], color: string, speed: number, distort: number }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.cos(t / 4) / 2;
    mesh.current.rotation.y = Math.sin(t / 4) / 2;
    mesh.current.rotation.z = Math.sin(t / 4) / 2;
    mesh.current.position.y = position[1] + Math.sin(t * speed) * 0.5;
  });

  return (
    <mesh position={position} ref={mesh}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        speed={distort}
        distort={0.4}
        radius={1}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
};

const ParticleField = () => {
  const count = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#2D7A3A" transparent opacity={0.6} />
    </points>
  );
};

const Hero3D = () => {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <FloatDrei speed={1.5} rotationIntensity={1} floatIntensity={2}>
          <FloatingShape position={[0, 0, 0]} color="#2D7A3A" speed={1} distort={2} />
          <FloatingShape position={[2.5, 1.5, -2]} color="#D4AF37" speed={1.2} distort={1.5} />
          <FloatingShape position={[-2.5, -1.5, -1]} color="#C0392B" speed={0.8} distort={1.8} />
        </FloatDrei>

        <ParticleField />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default Hero3D;
