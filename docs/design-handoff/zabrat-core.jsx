// zabrat-core.jsx — tokens, icônes, avatars, data, composants partagés
// Exporte tout sur window à la fin.

// ─────────────────────────────────────────────
// Icônes système (stroke, style Ionicons outline)
// ─────────────────────────────────────────────
function Icon({ name, size = 22, color = 'currentColor', stroke = 1.8, fill = 'none', style = {} }) {
  const P = ZB_ICON_PATHS[name];
  if (!P) return <span style={{ width: size, height: size, display: 'inline-block' }} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0, ...style }}>
      {P({ c: color, sw: stroke, f: fill })}
    </svg>
  );
}

const ZB_ICON_PATHS = {
  moon: ({ c, sw, f }) => (
    <path d="M20.2 14.2A8.5 8.5 0 0 1 9.8 3.8 8.5 8.5 0 1 0 20.2 14.2Z" stroke={c} strokeWidth={sw} fill={f === 'none' ? 'none' : c} strokeLinejoin="round" />
  ),
  map: ({ c, sw, f }) => (
    <g stroke={c} strokeWidth={sw} strokeLinejoin="round" fill={f === 'none' ? 'none' : c}>
      <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" />
      <path d="M9 4v14M15 6v14" strokeLinecap="round" fill="none" />
    </g>
  ),
  trophy: ({ c, sw, f }) => (
    <g stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill={f === 'none' ? 'none' : c}>
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" fill="none" />
      <path d="M12 15v3M8.5 21h7M10 18h4" fill="none" />
    </g>
  ),
  person: ({ c, sw, f }) => (
    <g stroke={c} strokeWidth={sw} fill={f === 'none' ? 'none' : c}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c.8-3.7 3.9-6 7.5-6s6.7 2.3 7.5 6" strokeLinecap="round" />
    </g>
  ),
  beer: ({ c, sw, f }) => f === 'none' ? (
    <g stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M5.5 9.5h11V20a1.8 1.8 0 0 1-1.8 1.8H7.3A1.8 1.8 0 0 1 5.5 20V9.5Z" />
      <path d="M16.5 11h1.7a2.3 2.3 0 0 1 2.3 2.3v3a2.3 2.3 0 0 1-2.3 2.3h-1.7" />
      <path d="M5.8 9.3a2.6 2.6 0 0 1 1.5-4.8c.4 0 .8.1 1.1.2A3 3 0 0 1 11 2.6c1.2 0 2.3.7 2.8 1.7a2.5 2.5 0 0 1 3.4 2.3c0 1.2-.8 2.2-1.9 2.6" />
      <path d="M9 13v5.5M13 13v5.5" />
    </g>
  ) : (
    <g fill={c}>
      <circle cx="7.2" cy="6.6" r="2.5" />
      <circle cx="11" cy="5.4" r="2.9" />
      <circle cx="14.8" cy="6.6" r="2.5" />
      <path d="M5 10h12v9.6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10Z" />
      <path d="M17 11.5h1.4a2.6 2.6 0 0 1 2.6 2.6v2.6a2.6 2.6 0 0 1-2.6 2.6H17" fill="none" stroke={c} strokeWidth="2.2" />
    </g>
  ),
  settings: ({ c, sw }) => (
    <g stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13.5a7.8 7.8 0 0 0 0-3l2-1.5-2-3.4-2.3 1a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.6a7.7 7.7 0 0 0-2.6 1.5l-2.3-1-2 3.4 2 1.5a7.8 7.8 0 0 0 0 3l-2 1.5 2 3.4 2.3-1a7.7 7.7 0 0 0 2.6 1.5l.5 2.6h4l.5-2.6a7.7 7.7 0 0 0 2.6-1.5l2.3 1 2-3.4-2-1.5Z" />
    </g>
  ),
  search: ({ c, sw }) => (
    <g stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </g>
  ),
  back: ({ c, sw }) => <path d="M15 4.5 7.5 12l7.5 7.5" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  chevR: ({ c, sw }) => <path d="m9 4.5 7.5 7.5L9 19.5" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  close: ({ c, sw }) => <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" stroke={c} strokeWidth={sw} strokeLinecap="round" />,
  share: ({ c, sw }) => (
    <g stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14V3M8 6.5 12 3l4 3.5" />
      <path d="M5 11v8.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V11" />
    </g>
  ),
  check: ({ c, sw }) => <path d="m4.5 12.5 5 5L19.5 7" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  users: ({ c, sw }) => (
    <g stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round">
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 20c.7-3.2 3.4-5 6.5-5s5.8 1.8 6.5 5" />
      <path d="M15.5 5.4a3.5 3.5 0 0 1 0 6.2M18.5 15.6c1.6.8 2.7 2.3 3 4.4" />
    </g>
  ),
  crown: ({ c, sw, f }) => (
    <path d="M3.5 8.5 7.5 12l4.5-6 4.5 6 4-3.5-1.5 9.5h-14L3.5 8.5Z" stroke={c} strokeWidth={sw} fill={f === 'none' ? 'none' : c} strokeLinejoin="round" />
  ),
  pin: ({ c, sw, f }) => (
    <g stroke={c} strokeWidth={sw} fill={f === 'none' ? 'none' : c} strokeLinejoin="round">
      <path d="M12 21.5S5 14.8 5 9.7C5 5.9 8.1 3 12 3s7 2.9 7 6.7c0 5.1-7 11.8-7 11.8Z" />
      <circle cx="12" cy="9.5" r="2.5" fill={f === 'none' ? 'none' : '#0A0A0F'} stroke={f === 'none' ? c : 'none'} />
    </g>
  ),
  lock: ({ c, sw }) => (
    <g stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </g>
  ),
  gift: ({ c, sw }) => (
    <g stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="4" rx="1" />
      <path d="M5.5 12v8a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-8M12 8v13.5" />
      <path d="M12 8c-1.5-.5-4.5-.8-5.5-2.3-.8-1.2.1-2.7 1.6-2.7C10 3 11.5 5.5 12 8Zm0 0c1.5-.5 4.5-.8 5.5-2.3.8-1.2-.1-2.7-1.6-2.7C14 3 12.5 5.5 12 8Z" />
    </g>
  ),
  phone: ({ c, sw }) => (
    <path d="M7.5 3.5h2l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v2a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2Z" stroke={c} strokeWidth={sw} fill="none" strokeLinejoin="round" />
  ),
  whatsapp: ({ c }) => (
    <g fill={c}>
      <path d="M12 2.5a9.3 9.3 0 0 0-8 14l-1.3 4.8 4.9-1.3A9.3 9.3 0 1 0 12 2.5Zm0 1.8a7.5 7.5 0 1 1-3.8 14l-.4-.3-2.7.7.7-2.6-.3-.4A7.5 7.5 0 0 1 12 4.3Z" />
      <path d="M9.2 7.6c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.5 0 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.4l-2-.9c-.3-.1-.5-.2-.7.1l-1 1.2c-.1.2-.3.2-.5.1a6.1 6.1 0 0 1-3.1-2.7c-.2-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.3-.5v-.5L9.2 7.6Z" />
    </g>
  ),
  flame: ({ c, sw, f }) => (
    <path d="M12 21.5c-3.9 0-6.5-2.5-6.5-6.2 0-2.7 1.7-4.7 3-6.4.3-.4 1-.2 1 .3.1.8.3 1.6.8 2.1C10.8 8.5 11 4.6 13.6 2.6c.4-.3 1-.1 1 .4 0 1.6.5 2.8 1.6 4 1.2 1.3 2.3 3.2 2.3 5.5 0 4.5-2.6 9-6.5 9Z" stroke={c} strokeWidth={sw} fill={f === 'none' ? 'none' : c} strokeLinejoin="round" />
  ),
  eye: ({ c, sw }) => (
    <g stroke={c} strokeWidth={sw} fill="none">
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </g>
  ),
  plus: ({ c, sw }) => <path d="M12 5v14M5 12h14" stroke={c} strokeWidth={sw} strokeLinecap="round" />,
  bolt: ({ c, sw, f }) => <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H13l1-8Z" stroke={c} strokeWidth={sw} fill={f === 'none' ? 'none' : c} strokeLinejoin="round" />,
};

// ─────────────────────────────────────────────
// Logo Zabrat : chope + 3 étoiles, néon
// ─────────────────────────────────────────────
function ZabratLogo({ size = 96, glow = true }) {
  const star = (x, y, s, o = 1) => (
    <path d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`} fill="var(--amber)" opacity={o} />
  );
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none"
      style={glow ? { filter: 'drop-shadow(0 0 14px rgb(var(--amber-rgb) / calc(.55 * var(--gi)))) drop-shadow(0 0 36px rgb(var(--amber-rgb) / calc(.3 * var(--gi))))' } : undefined}>
      {star(30, 16, 7)}{star(50, 9, 5, 0.85)}{star(66, 17, 4, 0.7)}
      <g stroke="var(--amber)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 34h36v40a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V34Z" />
        <path d="M64 42h6a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6h-6" />
        <path d="M28 34c-2.4-1.6-3.8-3.7-3.8-6.2 0-4.3 3.6-7.6 8-7.6.9 0 1.9.1 2.7.4 1.2-3 4.3-5.1 7.9-5.1 3.4 0 6.3 1.8 7.7 4.5a8.6 8.6 0 0 1 3-.5c4.2 0 7.5 3.1 7.5 7 0 3-1.7 5.5-4 6.6" />
        <path d="M38 46v22M48 46v22M58 46v22" opacity="0.85" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Avatars — initiales + dégradés néon déterministes
// ─────────────────────────────────────────────
const ZB_AV_GRADS = [
  ['#FF6B35', '#B8336A'], ['#7048E8', '#3B2DB3'], ['#0E8F8F', '#125E92'],
  ['#C2255C', '#862E9C'], ['#2F9E44', '#1B6E53'], ['#E8590C', '#A61E4D'],
  ['#3B5BDB', '#5F3DC4'], ['#9A6400', '#7A4A00'],
];
function zbHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

// ring: null | 'amber' | 'cyan'
function Avatar({ name, size = 44, ring = null, ringWidth = 2, style = {} }) {
  const g = ZB_AV_GRADS[zbHash(name) % ZB_AV_GRADS.length];
  const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const ringColor = ring === 'cyan' ? 'var(--cyan)' : 'var(--amber)';
  const ringGlow = ring === 'cyan'
    ? `0 0 ${Math.round(size * 0.28)}px rgb(0 229 255 / calc(.5 * var(--gi)))`
    : `0 0 ${Math.round(size * 0.28)}px rgb(var(--amber-rgb) / calc(.5 * var(--gi)))`;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`,
      color: '#fff', fontWeight: 700, fontSize: size * 0.36, letterSpacing: 0.5,
      boxShadow: ring ? `0 0 0 2px var(--bg), 0 0 0 ${2 + ringWidth}px ${ringColor}, ${ringGlow}` : 'inset 0 0 0 1px rgba(255,255,255,.12)',
      fontFamily: 'var(--font-ui)',
      ...style,
    }}>{initials}</div>
  );
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const USER = {
  name: 'Faouez', streak: 6, total: 149, rank: 2, beersTonight: 3,
  level: "L'Habitué", levelNum: 7, xp: 0.72, xpToNext: 140,
};

const BARS = [
  { id: 'theatro', name: 'Théatro', area: 'La Marsa', count: 12, heat: 3, dist: '350 m', king: 'Wassim', x: 30, y: 36 },
  { id: 'caves', name: 'Les Caves', area: 'Sidi Bou Saïd', count: 7, heat: 2, dist: '2,1 km', king: 'Mariem', x: 67, y: 64 },
  { id: 'alamo', name: "L'Alamo", area: 'La Marsa', count: 4, heat: 1, dist: '600 m', king: 'Aymen', x: 22, y: 52 },
  { id: 'safsaf', name: 'Saf Saf', area: 'La Marsa', count: 2, heat: 1, dist: '900 m', king: 'Khalil', x: 40, y: 24 },
  { id: 'nouveau', name: 'Le Nouveau Bar', area: 'Gammarth', count: 0, heat: 0, dist: '3,4 km', king: null, x: 20, y: 18 },
];

const FRIENDS = [
  { id: 'khalil', name: 'Khalil', bar: 'theatro', monthCount: 31 },
  { id: 'wassim', name: 'Wassim', bar: 'theatro', monthCount: 28 },
  { id: 'mariem', name: 'Mariem', bar: 'caves', monthCount: 23 },
  { id: 'aymen', name: 'Aymen', bar: 'alamo', monthCount: 19 },
  { id: 'yassine', name: 'Yassine', bar: null, monthCount: 17 },
  { id: 'ines', name: 'Ines', bar: null, monthCount: 12 },
  { id: 'sami', name: 'Sami', bar: null, monthCount: 9 },
  { id: 'oussema', name: 'Oussema', bar: null, monthCount: 7 },
  { id: 'rim', name: 'Rim', bar: null, monthCount: 4 },
];

const FEED = [
  { id: 1, who: 'Khalil', text: <span><b>Khalil</b> a bu une <b>Blonde</b> 🍺 au <b>Théatro</b></span>, time: '23:12', reactions: { '🍻': 4, '❤️': 2, '🔥': 1 }, photo: true },
  { id: 2, who: 'Wassim', text: <span><b>Wassim</b> a bu une <b>IPA</b> 🍺 au <b>Théatro</b></span>, time: '22:47', reactions: { '🍻': 6, '🔥': 3 } },
  { id: 3, who: 'Mariem', text: <span><b>Mariem</b> s'est check-in aux <b>Caves</b> 📍</span>, time: '22:30', reactions: { '🍻': 2 } },
  { id: 4, who: 'Aymen', text: <span><b>Aymen</b> a bu une <b>Brune</b> 🍺 à <b>L'Alamo</b></span>, time: '21:58', reactions: { '❤️': 1, '🍻': 1 } },
  { id: 5, who: 'Khalil', text: <span><b>Khalil</b> a débloqué le badge <b>Le Centurion</b> 🏅</span>, time: '21:40', reactions: { '🔥': 5, '🍻': 2 } },
];

const LEAGUE = {
  week: [
    { id: 'wassim', name: 'Wassim', count: 23, delta: 1 },
    { id: 'me', name: 'Faouez', count: 19, delta: 2, me: true },
    { id: 'khalil', name: 'Khalil', count: 17, delta: -2 },
    { id: 'mariem', name: 'Mariem', count: 14, delta: 0 },
    { id: 'aymen', name: 'Aymen', count: 12, delta: 1 },
    { id: 'yassine', name: 'Yassine', count: 9, delta: -1 },
    { id: 'ines', name: 'Ines', count: 7, delta: 3 },
    { id: 'sami', name: 'Sami', count: 5, delta: -1 },
    { id: 'oussema', name: 'Oussema', count: 4, delta: 0 },
    { id: 'rim', name: 'Rim', count: 2, delta: -2 },
  ],
  month: [
    { id: 'khalil', name: 'Khalil', count: 61, delta: 0 },
    { id: 'wassim', name: 'Wassim', count: 58, delta: 1 },
    { id: 'me', name: 'Faouez', count: 54, delta: -1, me: true },
    { id: 'mariem', name: 'Mariem', count: 47, delta: 0 },
    { id: 'yassine', name: 'Yassine', count: 39, delta: 2 },
    { id: 'aymen', name: 'Aymen', count: 36, delta: -1 },
    { id: 'ines', name: 'Ines', count: 28, delta: 0 },
    { id: 'sami', name: 'Sami', count: 21, delta: 1 },
    { id: 'oussema', name: 'Oussema', count: 17, delta: -1 },
    { id: 'rim', name: 'Rim', count: 9, delta: 0 },
  ],
};

const BEER_TYPES = [
  { id: 'blonde', name: 'Blonde', glass: 'pinte', tint: '#FFC53D' },
  { id: 'blanche', name: 'Blanche', glass: 'weizen', tint: '#FFE8B0' },
  { id: 'brune', name: 'Brune', glass: 'snifter', tint: '#8B4A12' },
  { id: 'ipa', name: 'IPA', glass: 'tulipe', tint: '#FF9F1C' },
  { id: 'craft', name: 'Craft', glass: 'teku', tint: '#E8590C' },
  { id: 'autre', name: 'Autre', glass: 'autre', tint: '#9494A6' },
];

const BADGES = [
  { id: 'b1', name: 'Premier Verre', icon: 'beer', unlocked: true },
  { id: 'b2', name: "L'Initié", icon: 'bolt', unlocked: true },
  { id: 'b3', name: "L'Amateur", icon: 'moon', unlocked: true },
  { id: 'b4', name: "L'Assidu", icon: 'flame', unlocked: true },
  { id: 'b5', name: 'Le Centurion', icon: 'trophy', unlocked: true },
  { id: 'b6', name: 'Régulier', icon: 'check', unlocked: true },
  { id: 'b7', name: 'Noctambule', icon: 'lock', unlocked: false },
  { id: 'b8', name: 'Le Roi', icon: 'lock', unlocked: false },
  { id: 'b9', name: 'Globe-trotter', icon: 'lock', unlocked: false },
  { id: 'b10', name: 'Marathonien', icon: 'lock', unlocked: false },
];

const WEEK_CHART = [
  { d: 'L', v: 2 }, { d: 'M', v: 0 }, { d: 'M', v: 3 }, { d: 'J', v: 1 },
  { d: 'V', v: 5 }, { d: 'S', v: 4 }, { d: 'D', v: 3 },
];

// ─────────────────────────────────────────────
// Composants partagés
// ─────────────────────────────────────────────

// CTA dégradé ambre→orange avec glow
function NeonButton({ children, onClick, size = 'lg', style = {}, secondary = false }) {
  const [pressed, setPressed] = React.useState(false);
  const base = size === 'lg'
    ? { height: 56, fontSize: 17, borderRadius: 18, padding: '0 24px' }
    : { height: 44, fontSize: 15, borderRadius: 14, padding: '0 18px' };
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        ...base, border: 'none', cursor: 'pointer', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap',
        fontFamily: 'var(--font-ui)', fontWeight: 800, letterSpacing: 0.3,
        color: secondary ? 'var(--amber)' : '#1A0E00',
        background: secondary ? 'rgb(var(--amber-rgb) / .12)' : 'linear-gradient(100deg, var(--amber), var(--orange))',
        boxShadow: secondary
          ? 'inset 0 0 0 1.5px rgb(var(--amber-rgb) / .45)'
          : '0 4px 24px rgb(var(--amber-rgb) / calc(.45 * var(--gi))), 0 1px 4px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.35)',
        transform: pressed ? 'scale(.97)' : 'scale(1)',
        transition: 'transform .12s ease, box-shadow .2s ease, filter .15s',
        filter: pressed ? 'brightness(1.1)' : 'none',
        ...style,
      }}>{children}</button>
  );
}

// En-tête de section
function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase',
      color: 'var(--muted)', fontFamily: 'var(--font-ui)', ...style,
    }}>{children}</div>
  );
}

// Pastille live cyan qui pulse
function LiveDot({ size = 7 }) {
  return <span className="zb-live-dot" style={{ width: size, height: size }} />;
}

// Verre de bière (stroke, formes différentes par type)
function BeerGlass({ glass = 'pinte', tint = '#FFC53D', size = 44, active = false }) {
  const c = active ? 'var(--amber)' : 'rgba(255,255,255,.75)';
  const fillO = active ? 0.9 : 0.45;
  const shapes = {
    pinte: <g><path d="M14 8h20l-2.5 30a3 3 0 0 1-3 2.8h-9A3 3 0 0 1 16.5 38L14 8Z" stroke={c} strokeWidth="2.2" fill="none" strokeLinejoin="round" /><path d="M15.2 16h17.6l-1.8 21.4a1.6 1.6 0 0 1-1.6 1.4h-10.8a1.6 1.6 0 0 1-1.6-1.4L15.2 16Z" fill={tint} opacity={fillO} /></g>,
    weizen: <g><path d="M16 8c0 6-3.5 8-3.5 14 0 9 4 12 4.5 16.2.2 1.6 1.3 2.8 3 2.8h8c1.7 0 2.8-1.2 3-2.8.5-4.2 4.5-7.2 4.5-16.2 0-6-3.5-8-3.5-14H16Z" stroke={c} strokeWidth="2.2" fill="none" strokeLinejoin="round" /><path d="M14.8 18c-1 2-2.3 4-2.3 8 0 9 4 9 4.5 13.2.1 1 .8 1.8 1.9 1.8h10.2c1.1 0 1.8-.8 1.9-1.8.5-4.2 4.5-4.2 4.5-13.2 0-4-1.3-6-2.3-8H14.8Z" fill={tint} opacity={fillO} /></g>,
    snifter: <g><path d="M13 14c0 8 3 12 8 13.5V36h-4v3h14v-3h-4v-8.5C32 26 35 22 35 14c0-2.5-1-4-3.5-4h-15C14 10 13 11.5 13 14Z" stroke={c} strokeWidth="2.2" fill="none" strokeLinejoin="round" /><ellipse cx="24" cy="19" rx="8.5" ry="7" fill={tint} opacity={fillO} /></g>,
    tulipe: <g><path d="M14 9c0 5-1 7 1.5 10.5S20 24 20 28v6h-3.5v3h15v-3H28v-6c0-4 2-5 4.5-8.5S34 14 34 9H14Z" stroke={c} strokeWidth="2.2" fill="none" strokeLinejoin="round" /><path d="M15.5 14c.3 2 1.3 3.6 3 5.8 1.5 2 2.8 3.6 3.4 5.7h4.2c.6-2.1 1.9-3.7 3.4-5.7 1.7-2.2 2.7-3.8 3-5.8h-17Z" fill={tint} opacity={fillO} /></g>,
    teku: <g><path d="M13 9l5 13c.8 2 2 3 3.5 3.4V34H17v3h14v-3h-4.5v-8.6C28 25 29.2 24 30 22l5-13H13Z" stroke={c} strokeWidth="2.2" fill="none" strokeLinejoin="round" /><path d="M16.5 15.5 19.8 23c.5 1.2 1.3 1.9 2.2 2.2h4c.9-.3 1.7-1 2.2-2.2l3.3-7.5h-15Z" fill={tint} opacity={fillO} /></g>,
    autre: <g><circle cx="24" cy="24" r="13" stroke={c} strokeWidth="2.2" fill="none" strokeDasharray="4 4" /><path d="M24 18v12M18 24h12" stroke={c} strokeWidth="2.2" strokeLinecap="round" /></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block' }}>{shapes[glass] || shapes.autre}</svg>;
}

// Compteur de réaction
function Reaction({ emoji, count, active, onClick }) {
  return (
    <button onClick={onClick} className="zb-press" style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px',
      borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--font-ui)',
      background: active ? 'rgb(var(--amber-rgb) / .16)' : 'rgba(255,255,255,.05)',
      border: active ? '1px solid rgb(var(--amber-rgb) / .55)' : '1px solid var(--border)',
      color: active ? 'var(--amber)' : 'var(--muted)', fontSize: 13, fontWeight: 700,
      boxShadow: active ? '0 0 12px rgb(var(--amber-rgb) / calc(.3 * var(--gi)))' : 'none',
      transition: 'all .15s',
    }}>
      <span style={{ fontSize: 14 }}>{emoji}</span>{count > 0 && <span>{count}</span>}
    </button>
  );
}

Object.assign(window, {
  Icon, ZabratLogo, Avatar, NeonButton, SectionLabel, LiveDot, BeerGlass, Reaction,
  USER, BARS, FRIENDS, FEED, LEAGUE, BEER_TYPES, BADGES, WEEK_CHART,
});
