"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/* Cruz de farmácia girando, com leve parallax do mouse */
function PharmacyCross() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.45;
    const targetX = state.pointer.y * 0.35;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetX,
      0.05
    );
  });

  return (
    <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.9}>
      <group ref={group}>
        <RoundedBox args={[0.9, 2.8, 0.7]} radius={0.14} smoothness={6}>
          <meshStandardMaterial
            color="#22c55e"
            emissive="#16a34a"
            emissiveIntensity={0.35}
            metalness={0.25}
            roughness={0.25}
          />
        </RoundedBox>
        <RoundedBox args={[2.8, 0.9, 0.7]} radius={0.14} smoothness={6}>
          <meshStandardMaterial
            color="#22c55e"
            emissive="#16a34a"
            emissiveIntensity={0.35}
            metalness={0.25}
            roughness={0.25}
          />
        </RoundedBox>
        {/* detalhe branco central */}
        <RoundedBox args={[0.5, 0.5, 0.8]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#f0fdf4" roughness={0.2} />
        </RoundedBox>
      </group>
    </Float>
  );
}

/* Cápsula bicolor */
function Capsule({
  position,
  rotation,
  colorA,
  colorB,
  speed = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  colorA: string;
  colorB: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.4 * speed;
      ref.current.rotation.z += delta * 0.25 * speed;
    }
  });

  return (
    <Float speed={2 * speed} floatIntensity={1.4} rotationIntensity={0.6}>
      <group ref={ref} position={position} rotation={rotation}>
        <mesh position={[0, 0.28, 0]}>
          <capsuleGeometry args={[0.2, 0.36, 8, 24]} />
          <meshStandardMaterial color={colorA} roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.2, 0.36, 8, 24]} />
          <meshStandardMaterial color={colorB} roughness={0.2} metalness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

/* Frasco de remédio */
function PillBottle({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.6;
  });

  return (
    <Float speed={1.4} floatIntensity={1.2} rotationIntensity={0.3}>
      <group ref={ref} position={position} scale={scale}>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 1, 40]} />
          <meshStandardMaterial
            color="#f59e0b"
            transparent
            opacity={0.92}
            roughness={0.15}
          />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.43, 0.43, 0.26, 40]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <cylinderGeometry
            args={[0.405, 0.405, 0.5, 40, 1, true, -Math.PI / 2, Math.PI]}
          />
          <meshStandardMaterial
            color="#ffffff"
            side={THREE.DoubleSide}
            roughness={0.6}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* Comprimido redondo */
function Tablet({
  position,
  color = "#e0f2fe",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <Float speed={2.4} floatIntensity={1.8} rotationIntensity={1.2}>
      <mesh position={position} rotation={[Math.PI / 3, 0.4, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </Float>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 6, 5]} intensity={2.2} />
      <pointLight position={[-5, -2, 3]} intensity={30} color="#34d399" />
      <pointLight position={[4, -3, -2]} intensity={20} color="#38bdf8" />

      <PharmacyCross />

      <Capsule
        position={[-3.1, 1.3, 0.5]}
        rotation={[0.4, 0, 0.8]}
        colorA="#ef4444"
        colorB="#fef2f2"
      />
      <Capsule
        position={[3.2, 1.6, -0.5]}
        rotation={[0.2, 0.5, -0.6]}
        colorA="#3b82f6"
        colorB="#eff6ff"
        speed={1.3}
      />
      <Capsule
        position={[2.8, -1.7, 0.8]}
        rotation={[0.6, 0.2, 0.3]}
        colorA="#a855f7"
        colorB="#faf5ff"
        speed={0.8}
      />
      <Capsule
        position={[-2.6, -1.9, -0.4]}
        rotation={[0.1, 0.3, -0.9]}
        colorA="#eab308"
        colorB="#fefce8"
        speed={1.1}
      />

      <PillBottle position={[-3.6, -0.2, -1]} scale={0.9} />
      <PillBottle position={[3.8, -0.1, -1.4]} scale={0.7} />

      <Tablet position={[-1.5, 2.3, 0.8]} />
      <Tablet position={[1.7, -2.4, 1]} color="#fde68a" />
      <Tablet position={[0.2, 2.6, -1]} color="#bbf7d0" />

      <Sparkles
        count={60}
        scale={[10, 6, 6]}
        size={3}
        speed={0.4}
        color="#86efac"
      />

      <ContactShadows
        position={[0, -3, 0]}
        opacity={0.35}
        scale={12}
        blur={2.8}
        far={4}
        color="#022c22"
      />
    </Canvas>
  );
}
