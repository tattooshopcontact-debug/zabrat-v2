import React from 'react';
import Svg, { G, Path, Circle, Ellipse } from 'react-native-svg';
import { Colors } from '../../constants/theme';

// Verre de bière (stroke, formes différentes par type) — porté depuis docs/design-handoff/zabrat-core.jsx

export type BeerType = 'blonde' | 'blanche' | 'brune' | 'ipa' | 'craft' | 'autre';

type GlassShape = 'pinte' | 'weizen' | 'snifter' | 'tulipe' | 'teku' | 'autre';

const BEER_GLASSES: Record<BeerType, { glass: GlassShape; tint: string }> = {
  blonde: { glass: 'pinte', tint: '#FFC53D' },
  blanche: { glass: 'weizen', tint: '#FFE8B0' },
  brune: { glass: 'snifter', tint: '#8B4A12' },
  ipa: { glass: 'tulipe', tint: '#FF9F1C' },
  craft: { glass: 'teku', tint: '#E8590C' },
  autre: { glass: 'autre', tint: '#9494A6' },
};

export default function BeerGlass({ type, size = 44, selected = false }: {
  type: BeerType; size?: number; selected?: boolean;
}) {
  const { glass, tint } = BEER_GLASSES[type] ?? BEER_GLASSES.autre;
  const c = selected ? Colors.primary : 'rgba(255,255,255,0.75)';
  const fillO = selected ? 0.9 : 0.45;

  const shapes: Record<GlassShape, React.ReactElement> = {
    pinte: (
      <G>
        <Path d="M14 8h20l-2.5 30a3 3 0 0 1-3 2.8h-9A3 3 0 0 1 16.5 38L14 8Z" stroke={c} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
        <Path d="M15.2 16h17.6l-1.8 21.4a1.6 1.6 0 0 1-1.6 1.4h-10.8a1.6 1.6 0 0 1-1.6-1.4L15.2 16Z" fill={tint} opacity={fillO} />
      </G>
    ),
    weizen: (
      <G>
        <Path d="M16 8c0 6-3.5 8-3.5 14 0 9 4 12 4.5 16.2.2 1.6 1.3 2.8 3 2.8h8c1.7 0 2.8-1.2 3-2.8.5-4.2 4.5-7.2 4.5-16.2 0-6-3.5-8-3.5-14H16Z" stroke={c} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
        <Path d="M14.8 18c-1 2-2.3 4-2.3 8 0 9 4 9 4.5 13.2.1 1 .8 1.8 1.9 1.8h10.2c1.1 0 1.8-.8 1.9-1.8.5-4.2 4.5-4.2 4.5-13.2 0-4-1.3-6-2.3-8H14.8Z" fill={tint} opacity={fillO} />
      </G>
    ),
    snifter: (
      <G>
        <Path d="M13 14c0 8 3 12 8 13.5V36h-4v3h14v-3h-4v-8.5C32 26 35 22 35 14c0-2.5-1-4-3.5-4h-15C14 10 13 11.5 13 14Z" stroke={c} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
        <Ellipse cx={24} cy={19} rx={8.5} ry={7} fill={tint} opacity={fillO} />
      </G>
    ),
    tulipe: (
      <G>
        <Path d="M14 9c0 5-1 7 1.5 10.5S20 24 20 28v6h-3.5v3h15v-3H28v-6c0-4 2-5 4.5-8.5S34 14 34 9H14Z" stroke={c} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
        <Path d="M15.5 14c.3 2 1.3 3.6 3 5.8 1.5 2 2.8 3.6 3.4 5.7h4.2c.6-2.1 1.9-3.7 3.4-5.7 1.7-2.2 2.7-3.8 3-5.8h-17Z" fill={tint} opacity={fillO} />
      </G>
    ),
    teku: (
      <G>
        <Path d="M13 9l5 13c.8 2 2 3 3.5 3.4V34H17v3h14v-3h-4.5v-8.6C28 25 29.2 24 30 22l5-13H13Z" stroke={c} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
        <Path d="M16.5 15.5 19.8 23c.5 1.2 1.3 1.9 2.2 2.2h4c.9-.3 1.7-1 2.2-2.2l3.3-7.5h-15Z" fill={tint} opacity={fillO} />
      </G>
    ),
    autre: (
      <G>
        <Circle cx={24} cy={24} r={13} stroke={c} strokeWidth={2.2} fill="none" strokeDasharray="4 4" />
        <Path d="M24 18v12M18 24h12" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
      </G>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {shapes[glass]}
    </Svg>
  );
}
