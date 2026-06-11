import React, { useEffect, useRef, useState } from 'react';
import { Platform, Dimensions } from 'react-native';
import type { Bar } from '../lib/mapService';

interface MapboxWebProps {
  bars: Bar[];
  onBarSelect: (bar: Bar) => void;
  center: { lat: number; lng: number };
}

// ─── Système « heat » 0-3 depuis le compte de check-ins du soir ───
const GREY = '#4A4A5C';
const AMBER = '#FF9500';
const ORANGE = '#FF6B35';
const CYAN = '#00E5FF';
const MUTED = '#9494A6';
const FONT = "'Outfit', system-ui, sans-serif";

function getHeat(count: number): 0 | 1 | 2 | 3 {
  if (count >= 8) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

// Id du bar le plus chaud (max de check-ins, > 0)
function getHottestBarId(bars: Bar[]): string | null {
  let best: Bar | null = null;
  for (const b of bars) {
    if (b.activeCount > 0 && (!best || b.activeCount > best.activeCount)) best = b;
  }
  return best ? best.id : null;
}

// Construit l'élément HTML d'un marqueur néon (DOM web — CSS direct autorisé ici)
function createMarkerElement(bar: Bar, isHottest: boolean, onSelect: (b: Bar) => void): HTMLDivElement {
  const heat = getHeat(bar.activeCount);
  const dotSize = 10 + heat * 3.4;

  const el = document.createElement('div');
  el.style.cssText = `cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;font-family:${FONT};`;

  // Chip « 12 🍺 ce soir » au-dessus du bar le plus chaud
  if (isHottest) {
    const chip = document.createElement('div');
    chip.style.cssText = `
      font-size:11px;font-weight:800;color:#1A0E00;white-space:nowrap;
      background:linear-gradient(100deg,${AMBER},${ORANGE});
      padding:4px 10px;border-radius:999px;
      box-shadow:0 0 16px rgba(255,149,0,0.47);
    `;
    chip.textContent = `${bar.activeCount} 🍺 ce soir`;
    el.appendChild(chip);
  }

  // Pastille + halo pulsant
  const wrapSize = dotSize + 14;
  const wrap = document.createElement('div');
  wrap.style.cssText = `position:relative;width:${wrapSize}px;height:${wrapSize}px;display:flex;align-items:center;justify-content:center;`;

  if (heat > 0) {
    const pulse = document.createElement('span');
    pulse.className = 'zabrat-marker-pulse';
    pulse.style.cssText = `
      position:absolute;inset:0;border-radius:50%;
      background:radial-gradient(circle, rgba(255,149,0,${(0.18 + heat * 0.08).toFixed(2)}), transparent 70%);
    `;
    pulse.style.animationDuration = `${(2.6 - heat * 0.4).toFixed(1)}s`;
    wrap.appendChild(pulse);
  }

  const dot = document.createElement('span');
  const glow = heat > 0
    ? `box-shadow:0 0 ${8 + heat * 8}px rgba(255,149,0,${(0.3 + heat * 0.12).toFixed(2)});`
    : '';
  dot.style.cssText = `
    width:${dotSize}px;height:${dotSize}px;border-radius:50%;
    background:${heat > 0 ? AMBER : GREY};
    border:2px solid rgba(255,255,255,0.25);${glow}
  `;
  wrap.appendChild(dot);
  el.appendChild(wrap);

  // Rangée : mini-avatars amis (anneau cyan) + label du bar
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:5px;';

  if (bar.activeFriends.length > 0) {
    const avatars = document.createElement('div');
    avatars.style.cssText = 'display:flex;';
    bar.activeFriends.slice(0, 3).forEach((f, i) => {
      const av = document.createElement('div');
      av.style.cssText = `
        width:22px;height:22px;border-radius:50%;
        background:#1C1C26;border:1px solid ${CYAN};
        box-shadow:0 0 14px rgba(0,229,255,0.43);
        display:flex;align-items:center;justify-content:center;
        font-size:9px;font-weight:700;color:#fff;
        margin-left:${i > 0 ? '-7px' : '0'};
      `;
      av.textContent = f.initials;
      avatars.appendChild(av);
    });
    row.appendChild(avatars);
  }

  const label = document.createElement('span');
  if (isHottest) {
    label.style.cssText = 'font-size:11.5px;font-weight:700;color:#FFFFFF;white-space:nowrap;text-shadow:0 1px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9);';
    label.textContent = bar.name;
  } else {
    label.style.cssText = `font-size:10.5px;font-weight:700;color:${MUTED};white-space:nowrap;text-shadow:0 1px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9);`;
    label.textContent = bar.activeCount > 0 ? `${bar.name} · ${bar.activeCount}` : bar.name;
  }
  row.appendChild(label);
  el.appendChild(row);

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onSelect(bar);
  });

  return el;
}

export function MapboxWeb({ bars, onBarSelect, center }: MapboxWebProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [height, setHeight] = useState(0);

  // La carte occupe tout l'écran (tab bar absolute par-dessus)
  useEffect(() => {
    setHeight(Dimensions.get('window').height);
  }, []);

  const onBarSelectRef = useRef(onBarSelect);
  onBarSelectRef.current = onBarSelect;
  const barsRef = useRef(bars);
  barsRef.current = bars;

  // Pose tous les marqueurs néon (nettoie les anciens d'abord)
  const drawMarkers = (map: any, mapboxgl: any) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const currentBars = barsRef.current;
    const hottestId = getHottestBarId(currentBars);

    currentBars.forEach((bar) => {
      const el = createMarkerElement(bar, bar.id === hottestId, (b) => onBarSelectRef.current(b));
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([bar.longitude, bar.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });
  };
  const drawMarkersRef = useRef(drawMarkers);
  drawMarkersRef.current = drawMarkers;

  useEffect(() => {
    if (Platform.OS !== 'web' || !mapContainer.current || height === 0) return;

    const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    // Éviter la double initialisation
    if (mapRef.current) return;

    const initMap = async () => {
      const mapboxgl = (await import('mapbox-gl')).default;

      // Injecter le CSS Mapbox
      if (!document.getElementById('mapbox-css')) {
        const link = document.createElement('link');
        link.id = 'mapbox-css';
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.css';
        document.head.appendChild(link);
        await new Promise<void>((resolve) => {
          link.onload = () => resolve();
          setTimeout(resolve, 3000);
        });
      }

      // Injecter les keyframes du halo pulsant (une seule fois),
      // protégées par prefers-reduced-motion
      if (!document.getElementById('zabrat-marker-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'zabrat-marker-pulse-style';
        style.textContent = `
          @media (prefers-reduced-motion: no-preference) {
            @keyframes zabrat-marker-pulse {
              0% { transform: scale(1); opacity: 0.7; }
              50% { transform: scale(1.45); opacity: 0.25; }
              100% { transform: scale(1); opacity: 0.7; }
            }
            .zabrat-marker-pulse {
              animation-name: zabrat-marker-pulse;
              animation-duration: 2.6s;
              animation-timing-function: ease-in-out;
              animation-iteration-count: infinite;
            }
          }
        `;
        document.head.appendChild(style);
      }

      (mapboxgl as any).accessToken = token;

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [center.lng, center.lat],
        zoom: 13,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on('load', () => {
        drawMarkersRef.current(map, mapboxgl);
      });

      // Forcer un resize après le rendu
      setTimeout(() => map.resize(), 500);
      setTimeout(() => map.resize(), 1500);
    };

    initMap();

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [height, center]);

  // Mettre à jour les marqueurs quand les bars changent (sans recréer la map)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    let cancelled = false;
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      if (cancelled || !mapRef.current) return;
      drawMarkersRef.current(map, mapboxgl);
    })();

    return () => { cancelled = true; };
  }, [bars]);

  if (Platform.OS !== 'web' || height === 0) return null;

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: `${height}px`,
        background: '#0E0E16',
      }}
    />
  );
}
