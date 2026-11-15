"use client";

import "cesium/Build/Cesium/Widgets/widgets.css";
import { useEffect, useRef } from "react";
import type { SiteSummary } from "@/types";

type CesiumGlobeProps = {
  sites: SiteSummary[];
  onSelect: (siteId: string) => void;
  view: "global" | "south-pole";
  onError: () => void;
};

/**
 * Globe CesiumJS — chargé uniquement côté client, sans token Cesium ion.
 * La Lune est rendue comme un ellipsoïde (1737,4 km) sans imagerie distante.
 * Aucune donnée scientifique n'est calculée ici.
 */
export default function CesiumGlobe({
  sites,
  onSelect,
  view,
  onError,
}: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef(onSelect);
  const sitesRef = useRef(sites);

  useEffect(() => {
    selectRef.current = onSelect;
    sitesRef.current = sites;
  }, [onSelect, sites]);

  useEffect(() => {
    let destroyed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let viewer: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let handler: any = null;

    async function init() {
      const Cesium = await import("cesium");
      if (destroyed || !containerRef.current) return;

      (window as unknown as { CESIUM_BASE_URL: string }).CESIUM_BASE_URL = "/cesium";

      const moon = new Cesium.Ellipsoid(1_737_400, 1_737_400, 1_737_400);
      const globe = new Cesium.Globe(moon);
      globe.baseColor = Cesium.Color.fromCssColorString("#1b2029");
      globe.showGroundAtmosphere = false;
      globe.enableLighting = false;

      viewer = new Cesium.Viewer(containerRef.current, {
        globe,
        baseLayer: false,
        timeline: false,
        animation: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        infoBox: false,
        selectionIndicator: false,
        fullscreenButton: false,
        creditContainer: document.createElement("div"),
        requestRenderMode: true,
        maximumRenderTimeChange: Number.POSITIVE_INFINITY,
      });

      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#090e17");
      viewer.scene.globe.showGroundAtmosphere = false;

      for (const site of sitesRef.current) {
        if (
          site.coordinates.longitudeDeg === null ||
          site.coordinates.latitudeDeg === null
        ) {
          continue;
        }
        viewer.entities.add({
          id: site.id,
          position: Cesium.Cartesian3.fromDegrees(
            site.coordinates.longitudeDeg,
            site.coordinates.latitudeDeg,
            site.coordinates.altitudeM ?? 0,
            moon,
          ),
          point: {
            pixelSize: 9,
            color:
              site.dem.status === "NONE"
                ? Cesium.Color.fromCssColorString("#64748b")
                : Cesium.Color.fromCssColorString("#4edea3"),
            outlineColor: Cesium.Color.fromCssColorString("#090e17"),
            outlineWidth: 2,
          },
          label: {
            text: site.name,
            font: "12px JetBrains Mono, monospace",
            fillColor: Cesium.Color.fromCssColorString("#dee2f0"),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString("#171c25"),
            pixelOffset: new Cesium.Cartesian2(12, 0),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 7_000_000),
          },
        });
      }

      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((movement: { position: unknown }) => {
        const picked = viewer.scene.pick(movement.position);
        if (picked?.id) selectRef.current(String(picked.id));
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          0,
          view === "south-pole" ? -89.5 : -70,
          view === "south-pole" ? 1_200_000 : 5_200_000,
        ),
      });
    }

    init().catch((error) => {
      console.error("[cesium] initialisation impossible", error);
      onError();
    });

    return () => {
      destroyed = true;
      try {
        handler?.destroy();
      } catch {
        // handler déjà détruit
      }
      try {
        if (viewer && !viewer.isDestroyed()) {
          viewer.useDefaultRenderLoop = false;
          viewer.destroy();
        }
      } catch {
        // contexte WebGL déjà libéré
      }
      viewer = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[420px] w-full overflow-hidden rounded border border-outline-variant bg-container-lowest md:h-[560px]"
        aria-label="Globe lunaire 3D interactif"
        role="application"
      />
      <p className="mt-1 font-mono text-label-sm text-on-surface-variant">
        Globe CesiumJS — ellipsoïde lunaire 1 737,4 km, sans imagerie distante ni token Cesium ion.
        Sélectionnez un marqueur pour inspecter le site.
      </p>
    </div>
  );
}
