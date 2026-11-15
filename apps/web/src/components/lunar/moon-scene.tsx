"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  HOME_MOON_SITES,
  latLonToPosition,
  type MoonSiteMarker,
} from "@/components/lunar/moon-sites";

export type StoryStep = 0 | 1 | 2;

export type MoonSceneProps = {
  active: boolean;
  reducedMotion: boolean;
  mobile: boolean;
  storyStep?: StoryStep | null;
  showMarkers?: boolean;
  onMarkerScreenPositions?: (positions: Record<string, { x: number; y: number }>) => void;
  className?: string;
};

const MOON_RADIUS = 1.6;
/** Orientation fixe : pôle Sud incliné vers le spectateur. */
const GLOBE_EULER = new THREE.Euler(Math.PI * 0.62, 0.35, -0.15);

function textureUrls(mobile: boolean) {
  const size = mobile ? "1k" : "2k";
  return {
    color: `/textures/moon-color-${size}.webp`,
    relief: `/textures/moon-relief-${size}.webp`,
  };
}

function useOptionalMoonTextures(mobile: boolean) {
  const urls = textureUrls(mobile);
  const [maps, setMaps] = useState<{
    color: THREE.Texture | null;
    relief: THREE.Texture | null;
  }>({ color: null, relief: null });

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();

    const load = (url: string) =>
      new Promise<THREE.Texture | null>((resolve) => {
        loader.load(
          url,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 4;
            resolve(tex);
          },
          undefined,
          () => {
            console.info(
              `[ARTEMIS PULSE] Texture lunaire absente (${url}) — matériau procédural.`,
            );
            resolve(null);
          },
        );
      });

    void Promise.all([load(urls.color), load(urls.relief)]).then(([color, relief]) => {
      if (!cancelled) setMaps({ color, relief });
    });

    return () => {
      cancelled = true;
    };
  }, [urls.color, urls.relief]);

  return maps;
}

function siteWorldPosition(site: MoonSiteMarker, spinY: number): THREE.Vector3 {
  const local = new THREE.Vector3(
    ...latLonToPosition(site.latitudeDeg, site.longitudeDeg, MOON_RADIUS + 0.025),
  );
  local.applyEuler(GLOBE_EULER);
  local.applyAxisAngle(new THREE.Vector3(0, 1, 0), spinY);
  return local;
}

function MoonGlobe({
  mobile,
  spinYRef,
  autoRotate,
}: {
  mobile: boolean;
  spinYRef: MutableRefObject<number>;
  autoRotate: boolean;
}) {
  const spinGroup = useRef<THREE.Group>(null);
  const maps = useOptionalMoonTextures(mobile);

  const material = useMemo(() => {
    if (maps.color) {
      return new THREE.MeshStandardMaterial({
        map: maps.color,
        bumpMap: maps.relief ?? undefined,
        bumpScale: maps.relief ? 0.035 : 0,
        roughness: 0.92,
        metalness: 0.02,
        color: "#ffffff",
      });
    }
    return new THREE.MeshStandardMaterial({
      color: "#7a8290",
      roughness: 0.95,
      metalness: 0,
    });
  }, [maps.color, maps.relief]);

  useFrame((_, delta) => {
    if (!spinGroup.current) return;
    if (autoRotate) {
      spinGroup.current.rotation.y += delta * 0.04;
    }
    spinYRef.current = spinGroup.current.rotation.y;
  });

  return (
    <group ref={spinGroup}>
      <group rotation={[GLOBE_EULER.x, GLOBE_EULER.y, GLOBE_EULER.z]}>
        <mesh castShadow receiveShadow material={material}>
          <sphereGeometry args={[MOON_RADIUS, mobile ? 64 : 96, mobile ? 64 : 96]} />
        </mesh>
        {HOME_MOON_SITES.map((site) => {
          const position = latLonToPosition(
            site.latitudeDeg,
            site.longitudeDeg,
            MOON_RADIUS + 0.025,
          );
          return (
            <mesh key={site.id} position={position}>
              <sphereGeometry args={[0.028, 12, 12]} />
              <meshBasicMaterial color="#4cd7f6" />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function EarthBeacon({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <mesh position={[-3.2, 1.8, -1.2]}>
      <sphereGeometry args={[0.035, 12, 12]} />
      <meshBasicMaterial color="#adc6ff" />
    </mesh>
  );
}

function StoryCamera({ storyStep }: { storyStep: StoryStep | null | undefined }) {
  const { camera } = useThree();
  const targets = useMemo(
    () => [
      {
        position: new THREE.Vector3(0.35, 0.15, 4.2),
        lookAt: new THREE.Vector3(0.9, -0.2, 0),
      },
      {
        position: new THREE.Vector3(1.1, 0.4, 3.6),
        lookAt: new THREE.Vector3(0.6, -0.35, 0),
      },
      {
        position: new THREE.Vector3(-0.4, 0.55, 3.9),
        lookAt: new THREE.Vector3(0.7, -0.15, 0),
      },
      {
        position: new THREE.Vector3(0.2, -0.1, 4.6),
        lookAt: new THREE.Vector3(0.85, -0.25, 0),
      },
    ],
    [],
  );

  useFrame((_, delta) => {
    const index = storyStep == null ? 0 : storyStep + 1;
    const target = targets[index] ?? targets[0];
    const t = 1 - Math.exp(-delta * 2.2);
    camera.position.lerp(target.position, t);
    const m = new THREE.Matrix4().lookAt(
      camera.position,
      target.lookAt,
      new THREE.Vector3(0, 1, 0),
    );
    camera.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(m), t);
  });

  return null;
}

function GrazingSun({ storyStep }: { storyStep: StoryStep | null | undefined }) {
  const light = useRef<THREE.DirectionalLight>(null);
  useFrame((_, delta) => {
    if (!light.current) return;
    const base = new THREE.Vector3(4.5, 0.35, 1.2);
    if (storyStep === 0) base.set(5.2, 0.15, 0.6);
    if (storyStep === 1) base.set(2.8, 1.4, 2.5);
    if (storyStep === 2) base.set(3.6, 0.8, 2.0);
    light.current.position.lerp(base, 1 - Math.exp(-delta * 2));
  });

  return (
    <directionalLight
      ref={light}
      color="#ffffff"
      intensity={2.35}
      position={[4.5, 0.35, 1.2]}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0002}
    />
  );
}

function MarkerProjector({
  enabled,
  spinYRef,
  onUpdate,
}: {
  enabled: boolean;
  spinYRef: MutableRefObject<number>;
  onUpdate?: (positions: Record<string, { x: number; y: number }>) => void;
}) {
  const { camera, size } = useThree();
  useFrame(() => {
    if (!enabled || !onUpdate) return;
    const next: Record<string, { x: number; y: number }> = {};
    for (const site of HOME_MOON_SITES) {
      const world = siteWorldPosition(site, spinYRef.current);
      world.project(camera);
      next[site.id] = {
        x: (world.x * 0.5 + 0.5) * size.width,
        y: (-world.y * 0.5 + 0.5) * size.height,
      };
    }
    onUpdate(next);
  });
  return null;
}

function SceneContent({
  mobile,
  reducedMotion,
  storyStep,
  showMarkers,
  onMarkerScreenPositions,
}: {
  mobile: boolean;
  reducedMotion: boolean;
  storyStep?: StoryStep | null;
  showMarkers?: boolean;
  onMarkerScreenPositions?: MoonSceneProps["onMarkerScreenPositions"];
}) {
  const spinYRef = useRef(0);
  const autoRotate = !reducedMotion && storyStep == null;

  return (
    <>
      <color attach="background" args={["#090e17"]} />
      <ambientLight intensity={0.03} color="#ffffff" />
      <GrazingSun storyStep={storyStep} />
      <StoryCamera storyStep={storyStep} />
      <MoonGlobe mobile={mobile} spinYRef={spinYRef} autoRotate={autoRotate} />
      <EarthBeacon visible={storyStep === 1 || storyStep === 2} />
      {showMarkers ? (
        <MarkerProjector
          enabled
          spinYRef={spinYRef}
          onUpdate={onMarkerScreenPositions}
        />
      ) : null}
      {storyStep == null ? (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.45}
          minPolarAngle={0.55}
          maxPolarAngle={Math.PI - 0.55}
        />
      ) : null}
    </>
  );
}

export function MoonScene({
  active,
  reducedMotion,
  mobile,
  storyStep = null,
  showMarkers = false,
  onMarkerScreenPositions,
  className,
}: MoonSceneProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        aria-hidden
        dpr={[1, 1.5]}
        shadows
        frameloop={active ? "always" : "never"}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ position: [0.35, 0.15, 4.2], fov: 38, near: 0.1, far: 40 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#090e17");
          gl.shadowMap.enabled = true;
          // Ombre nette (sans atmosphère) — BasicShadowMap, pas de flou PCF.
          gl.shadowMap.type = THREE.BasicShadowMap;
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            mobile={mobile}
            reducedMotion={reducedMotion}
            storyStep={storyStep}
            showMarkers={showMarkers}
            onMarkerScreenPositions={onMarkerScreenPositions}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
