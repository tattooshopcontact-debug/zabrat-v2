import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, Dimensions } from 'react-native';
import type { Bar } from '../lib/mapService';
import { getBarTier } from '../lib/mapService';

interface MapboxWebProps {
  bars: Bar[];
  onBarSelect: (bar: Bar) => void;
  center: { lat: number; lng: number };
}

const TIER_COLORS: Record<string, string> = {
  hot: '#FF6B35', active: '#F5A623', partner: '#4CAF50', empty: '#555555',
};
const TIER_SIZES: Record<string, number> = {
  hot: 36, active: 30, partner: 28, empty: 22,
};

export function MapboxWeb({ bars, onBarSelect, center }: MapboxWebProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [height, setHeight] = useState(0);

  // Calculer la hauteur disponible
  useEffect(() => {
    const screen = Dimensions.get('window');
    // Hauteur écran - header (50) - tab bar (64) - safe area
    setHeight(screen.height - 120);
  }, []);

  const onBarSelectRef = useRef(onBarSelect);
  onBarSelectRef.current = onBarSelect;

  useEffect(() => {
    if (Platform.OS !== 'web' || !mapContainer.current || height === 0) return;

    const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    // Éviter la double initialisation
    if (mapRef.current) return;

    const initMap = async () => {
      const mapboxgl = (await import('mapbox-gl')).default;

      // Injecter le CSS
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

      // Injecter l'animation pulse
      if (!document.getElementById('mapbox-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'mapbox-pulse-style';
        style.textContent = `
          @keyframes zabrat-pulse {
            0% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.4); opacity: 0.2; }
            100% { transform: scale(1); opacity: 0.6; }
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
        addMarkers(map, mapboxgl);
      });

      // Forcer un resize après le rendu
      setTimeout(() => map.resize(), 500);
      setTimeout(() => map.resize(), 1500);
    };

    const addMarkers = (map: any, mapboxgl: any) => {
      // Nettoyer les anciens marqueurs
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      bars.forEach((bar) => {
        const tier = getBarTier(bar);
        const color = TIER_COLORS[tier];
        const size = TIER_SIZES[tier];

        const el = document.createElement('div');
        el.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;position:relative;';

        // Pulse pour hot spots
        if (tier === 'hot') {
          const pulse = document.createElement('div');
          pulse.style.cssText = `
            position:absolute;width:${size + 16}px;height:${size + 16}px;
            border-radius:50%;border:2px solid ${color};
            top:-8px;left:50%;margin-left:-${(size + 16) / 2}px;
            animation:zabrat-pulse 1.5s ease-in-out infinite;
          `;
          el.appendChild(pulse);
        }

        // Cercle principal
        const circle = document.createElement('div');
        circle.style.cssText = `
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};display:flex;align-items:center;
          justify-content:center;font-weight:800;font-size:12px;
          color:white;box-shadow:0 2px 8px rgba(0,0,0,0.6);
          position:relative;z-index:2;
        `;
        circle.textContent = bar.activeCount > 0 ? String(bar.activeCount) : '';
        el.appendChild(circle);

        // Étoile partenaire
        if (bar.is_partner) {
          const star = document.createElement('span');
          star.style.cssText = 'position:absolute;top:-10px;right:-10px;font-size:14px;z-index:3;';
          star.textContent = '⭐';
          el.appendChild(star);
        }

        // Avatars amis
        if (bar.activeFriends.length > 0) {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;margin-top:2px;';
          bar.activeFriends.slice(0, 3).forEach((f, i) => {
            const av = document.createElement('div');
            av.style.cssText = `
              width:20px;height:20px;border-radius:10px;
              background:#F5A623;display:flex;align-items:center;
              justify-content:center;font-size:8px;font-weight:700;
              color:white;border:2px solid #1C2128;
              margin-left:${i > 0 ? '-5px' : '0'};
            `;
            av.textContent = f.initials;
            row.appendChild(av);
          });
          el.appendChild(row);
        }

        // Nom du bar
        const label = document.createElement('div');
        label.style.cssText = `
          color:white;font-size:10px;font-weight:600;
          text-shadow:0 1px 4px rgba(0,0,0,0.9);max-width:80px;
          text-align:center;white-space:nowrap;overflow:hidden;
          text-overflow:ellipsis;margin-top:2px;
        `;
        label.textContent = bar.name;
        el.appendChild(label);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onBarSelectRef.current(bar);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([bar.longitude, bar.latitude])
          .addTo(map);

        markersRef.current.push(marker);
      });
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

    const updateMarkers = async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      // Nettoyer et recréer
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      bars.forEach((bar) => {
        const tier = getBarTier(bar);
        const color = TIER_COLORS[tier];
        const size = TIER_SIZES[tier];

        const el = document.createElement('div');
        el.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;position:relative;';

        const circle = document.createElement('div');
        circle.style.cssText = `
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};display:flex;align-items:center;
          justify-content:center;font-weight:800;font-size:12px;
          color:white;box-shadow:0 2px 8px rgba(0,0,0,0.6);z-index:2;
        `;
        circle.textContent = bar.activeCount > 0 ? String(bar.activeCount) : '';
        el.appendChild(circle);

        if (bar.is_partner) {
          const star = document.createElement('span');
          star.style.cssText = 'position:absolute;top:-10px;right:-10px;font-size:14px;z-index:3;';
          star.textContent = '⭐';
          el.appendChild(star);
        }

        if (bar.activeFriends.length > 0) {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;margin-top:2px;';
          bar.activeFriends.slice(0, 3).forEach((f, i) => {
            const av = document.createElement('div');
            av.style.cssText = `
              width:20px;height:20px;border-radius:10px;background:#F5A623;
              display:flex;align-items:center;justify-content:center;
              font-size:8px;font-weight:700;color:white;border:2px solid #1C2128;
              margin-left:${i > 0 ? '-5px' : '0'};
            `;
            av.textContent = f.initials;
            row.appendChild(av);
          });
          el.appendChild(row);
        }

        const label = document.createElement('div');
        label.style.cssText = 'color:white;font-size:10px;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.9);max-width:80px;text-align:center;';
        label.textContent = bar.name;
        el.appendChild(label);

        el.addEventListener('click', (e) => { e.stopPropagation(); onBarSelectRef.current(bar); });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([bar.longitude, bar.latitude])
          .addTo(map);
        markersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [bars]);

  if (Platform.OS !== 'web' || height === 0) return null;

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: `${height}px`,
        background: '#1C2128',
      }}
    />
  );
}
