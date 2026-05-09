import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';

const TraceLine = () => {
  const lineRef = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    lineRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });

  return (
    <group ref={lineRef}>
      {[...Array(20)].map((_, i) => (
        <mesh key={i} position={[Math.cos(i) * 3, Math.sin(i) * 2, Math.sin(i * 2) * 2]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#2D7A3A" />
        </mesh>
      ))}
    </group>
  );
};

const Traceability3D = () => {
  return (
    <div className="w-full h-[400px]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere args={[1.5, 64, 64]}>
            <MeshDistortMaterial
              color="#2D7A3A"
              speed={2}
              distort={0.3}
              radius={1}
              transparent
              opacity={0.1}
              wireframe
            />
          </Sphere>
          <Sphere args={[1.2, 64, 64]}>
            <meshStandardMaterial color="#2D7A3A" emissive="#1e5428" emissiveIntensity={0.5} transparent opacity={0.8} />
          </Sphere>
        </Float>

        <TraceLine />
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

export default Traceability3D;
