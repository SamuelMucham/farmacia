"use client";

import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => <div className="scene-loading">Carregando experiência 3D…</div>,
});

export default function HeroScene() {
  return (
    <div className="hero-canvas" aria-hidden="true">
      <Scene3D />
    </div>
  );
}
