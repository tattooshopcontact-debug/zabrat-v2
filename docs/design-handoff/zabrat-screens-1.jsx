// zabrat-screens-1.jsx — Écran « Ce soir » (feed) + Écran « Carte »

const SCREEN_PAD_TOP = 74;
const SCREEN_PAD_BOTTOM = 130;

// ─────────────────────────────────────────────
// ÉCRAN 1 — CE SOIR (feed social)
// ─────────────────────────────────────────────
function FeedCard({ item }) {
  const [mine, setMine] = React.useState({});
  const toggle = (e) => setMine(m => ({ ...m, [e]: !m[e] }));
  const emojis = ['🍻', '❤️', '🔥'];
  return (
    <div className="zb-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={item.who} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, lineHeight: 1.35, color: 'var(--text)' }}>{item.text}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{item.time}</div>
        </div>
      </div>
      {item.photo && (
        <image-slot id={`feed-photo-${item.id}`} shape="rounded" radius="14"
          placeholder="Photo de la tournée 🍻"
          style={{ width: '100%', height: 150, display: 'block', color: 'var(--muted)' }}></image-slot>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {emojis.map(e => (
          <Reaction key={e} emoji={e}
            count={(item.reactions[e] || 0) + (mine[e] ? 1 : 0)}
            active={!!mine[e]} onClick={() => toggle(e)} />
        ))}
      </div>
    </div>
  );
}

function StreakCard() {
  return (
    <div style={{
      borderRadius: 18, padding: '16px 18px', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(110deg, rgb(var(--amber-rgb) / .16), rgb(255 107 53 / .10) 60%, rgb(var(--amber-rgb) / .05))',
      border: '1px solid rgb(var(--amber-rgb) / .4)',
      boxShadow: '0 0 28px rgb(var(--amber-rgb) / calc(.22 * var(--gi))), inset 0 1px 0 rgb(var(--amber-rgb) / .15)',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 44, lineHeight: 1,
        color: 'var(--amber)', textShadow: '0 0 18px rgb(var(--amber-rgb) / calc(.7 * var(--gi)))',
        display: 'flex', alignItems: 'baseline', gap: 4,
      }}>
        🔥<span>{USER.streak}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15.5, color: 'var(--text)' }}>{USER.streak} soirs d'affilée</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>Encore ce soir pour continuer la série !</div>
      </div>
      <Icon name="chevR" size={18} color="rgb(var(--amber-rgb) / .8)" />
    </div>
  );
}

function WhoIsOut() {
  const out = FRIENDS.filter(f => f.bar).concat(FRIENDS.filter(f => !f.bar).slice(0, 3));
  const barName = id => (BARS.find(b => b.id === id) || {}).name;
  return (
    <div>
      <SectionLabel style={{ padding: '0 20px', marginBottom: 12 }}>Qui sort ce soir</SectionLabel>
      <div className="zb-hscroll" style={{ display: 'flex', gap: 18, overflowX: 'auto', padding: '4px 20px 6px' }}>
        {out.map(f => (
          <div key={f.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, width: 58, flexShrink: 0 }}>
            <Avatar name={f.name} size={52} ring={f.bar ? 'cyan' : null} style={!f.bar ? { opacity: 0.55 } : {}} />
            <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: f.bar ? 'var(--text)' : 'var(--muted)' }}>{f.name}</div>
              {f.bar
                ? <div style={{ fontSize: 10.5, color: 'var(--cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}><LiveDot size={5} />{barName(f.bar)}</div>
                : <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>chez lui</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CeSoirScreen({ feedEmpty, onOpenLog, onOpenProfil }) {
  return (
    <div className="zb-scroll" style={{ height: '100%', overflowY: 'auto', paddingTop: SCREEN_PAD_TOP, paddingBottom: SCREEN_PAD_BOTTOM }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 18px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 34, lineHeight: 1, color: 'var(--text)', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
            Ce soir <span style={{ fontSize: 25, verticalAlign: '2px' }}>🌙</span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 5, fontWeight: 600 }}>Mardi 10 juin · La Marsa</div>
        </div>
        <button className="zb-press" onClick={onOpenProfil} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', position: 'relative' }}>
          <Avatar name={USER.name} size={46} ring="amber" />
          <span style={{
            position: 'absolute', bottom: -4, right: -6, fontSize: 11, fontWeight: 800,
            background: 'linear-gradient(100deg, var(--amber), var(--orange))', color: '#1A0E00',
            borderRadius: 999, padding: '2px 7px', boxShadow: '0 0 10px rgb(var(--amber-rgb) / calc(.5 * var(--gi)))',
          }}>🔥{USER.streak}</span>
        </button>
      </div>

      <WhoIsOut />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '18px 20px 0' }}>
        <StreakCard />
        {feedEmpty ? (
          <div className="zb-card" style={{ padding: '44px 24px', textAlign: 'center' }}>
            <div style={{ opacity: 0.5, display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <BeerGlass glass="pinte" tint="#9494A6" size={56} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>Personne n'a encore bu ce soir…</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', margin: '6px 0 20px' }}>sois le premier 🍺</div>
            <NeonButton size="sm" onClick={onOpenLog} style={{ width: 'auto', margin: '0 auto', padding: '0 26px' }}>Logger ma première</NeonButton>
          </div>
        ) : FEED.map(item => <FeedCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ÉCRAN 2 — CARTE (La Marsa / Sidi Bou Saïd)
// ─────────────────────────────────────────────
function NightMap() {
  // Carte stylisée — côte du golfe de Tunis, eau en haut à droite
  const street = '#1B1B25';
  const main = '#242432';
  return (
    <svg viewBox="0 0 402 820" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="water" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B1622" />
          <stop offset="1" stopColor="#081019" />
        </linearGradient>
        <radialGradient id="cityGlow" cx="0.32" cy="0.42" r="0.5">
          <stop offset="0" stopColor="#171720" />
          <stop offset="1" stopColor="#0A0A0F" />
        </radialGradient>
      </defs>
      {/* terre */}
      <rect width="402" height="820" fill="url(#cityGlow)" />
      {/* mer — golfe de Tunis (côte diagonale) */}
      <path d="M150 -10 C 215 110, 248 210, 255 330 C 262 460, 310 560, 402 610 L 402 -10 Z" fill="url(#water)" />
      {/* liseré de côte */}
      <path d="M150 -10 C 215 110, 248 210, 255 330 C 262 460, 310 560, 402 610" fill="none" stroke="#11364a" strokeWidth="3" />
      <path d="M150 -10 C 215 110, 248 210, 255 330 C 262 460, 310 560, 402 610" fill="none" stroke="rgb(0 229 255 / calc(.25 * var(--gi)))" strokeWidth="7" style={{ filter: 'blur(4px)' }} />
      {/* vaguelettes */}
      <g stroke="#0F2433" strokeWidth="1.5" fill="none" opacity="0.8">
        <path d="M280 120 q 14 -6 28 0 q 14 6 28 0" />
        <path d="M310 250 q 14 -6 28 0 q 14 6 28 0" />
        <path d="M330 420 q 14 -6 28 0 q 14 6 28 0" />
      </g>
      {/* route côtière */}
      <path d="M130 -10 C 192 110, 222 215, 228 335 C 234 462, 285 585, 402 638" fill="none" stroke={main} strokeWidth="6" />
      {/* TGM (ligne en pointillés) */}
      <path d="M60 820 C 80 640, 120 520, 180 460 C 245 395, 215 250, 185 140" fill="none" stroke="#2A2A3C" strokeWidth="3" strokeDasharray="9 7" />
      {/* avenues principales */}
      <g stroke={main} strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M-10 330 C 70 318, 150 310, 228 330" />
        <path d="M40 -10 C 60 140, 70 300, 60 480 C 52 610, 60 720, 80 820" />
        <path d="M-10 540 C 90 520, 180 500, 250 470" />
      </g>
      {/* rues secondaires */}
      <g stroke={street} strokeWidth="2.5" fill="none">
        <path d="M-10 180 C 60 172, 120 168, 175 178" />
        <path d="M-10 250 C 70 240, 140 238, 205 252" />
        <path d="M-10 420 C 80 408, 160 400, 235 408" />
        <path d="M-10 620 C 90 600, 190 570, 270 525" />
        <path d="M-10 700 C 100 680, 210 640, 300 580" />
        <path d="M110 -10 C 125 90, 138 200, 140 330 M140 330 C 142 430, 130 520, 105 620" />
        <path d="M185 140 C 200 230, 208 280, 210 335 M210 335 C 214 420, 200 480, 175 530" />
        <path d="M255 480 C 270 530, 300 580, 350 620 M290 545 C 300 590, 295 650, 270 700" />
        <path d="M30 90 C 90 80, 140 80, 178 92" />
        <path d="M70 760 C 150 740, 240 700, 320 650" />
      </g>
      {/* placettes / pâtés sombres */}
      <g fill="#121219">
        <rect x="62" y="270" width="58" height="42" rx="6" />
        <rect x="84" y="350" width="48" height="38" rx="6" />
        <rect x="150" y="215" width="42" height="34" rx="6" />
        <rect x="190" y="370" width="40" height="46" rx="6" />
        <rect x="240" y="500" width="44" height="36" rx="6" transform="rotate(-18 262 518)" />
        <rect x="40" y="120" width="52" height="36" rx="6" />
      </g>
      {/* labels quartiers */}
      <g fontFamily="var(--font-ui)" fontWeight="700" letterSpacing="2.4" fill="#3D3D4F" fontSize="11">
        <text x="36" y="78">GAMMARTH</text>
        <text x="76" y="416">LA MARSA</text>
        <text x="218" y="700">SIDI BOU SAÏD</text>
      </g>
      <text x="300" y="200" fontFamily="var(--font-ui)" fontWeight="600" letterSpacing="2.6" fill="#1E3A4D" fontSize="10" transform="rotate(38 300 200)">GOLFE DE TUNIS</text>
      <text x="118" y="490" fontFamily="var(--font-ui)" fontWeight="600" letterSpacing="1.5" fill="#33334A" fontSize="9" transform="rotate(-32 118 490)">TGM</text>
    </svg>
  );
}

function BarMarker({ bar, onTap, selected }) {
  const friendsHere = FRIENDS.filter(f => f.bar === bar.id);
  const heatStyles = [
    { dot: 10, glow: 0, color: '#4A4A5C' },
    { dot: 13, glow: 0.35, color: 'var(--amber)' },
    { dot: 16, glow: 0.55, color: 'var(--amber)' },
    { dot: 20, glow: 0.9, color: 'var(--amber)' },
  ][bar.heat];
  return (
    <div onClick={() => onTap(bar)} style={{
      position: 'absolute', left: `${bar.x}%`, top: `${bar.y}%`, transform: 'translate(-50%,-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', zIndex: selected ? 6 : 4,
    }}>
      {bar.heat === 3 && (
        <div style={{
          fontSize: 11.5, fontWeight: 800, color: '#1A0E00', whiteSpace: 'nowrap',
          background: 'linear-gradient(100deg, var(--amber), var(--orange))',
          padding: '4px 10px', borderRadius: 999,
          boxShadow: '0 0 16px rgb(var(--amber-rgb) / calc(.55 * var(--gi)))',
        }}>{bar.count} 🍺 ce soir</div>
      )}
      <div style={{ position: 'relative', width: heatStyles.dot + 14, height: heatStyles.dot + 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {bar.heat > 0 && <span className="zb-marker-pulse" style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `radial-gradient(circle, rgb(var(--amber-rgb) / calc(${heatStyles.glow * 0.5} * var(--gi))), transparent 70%)`,
          animationDuration: `${2.6 - bar.heat * 0.5}s`,
        }} />}
        <span style={{
          width: heatStyles.dot, height: heatStyles.dot, borderRadius: '50%',
          background: heatStyles.color,
          border: selected ? '2px solid #fff' : '2px solid rgba(255,255,255,.25)',
          boxShadow: bar.heat > 0 ? `0 0 ${8 + bar.heat * 8}px rgb(var(--amber-rgb) / calc(${heatStyles.glow} * var(--gi)))` : 'none',
        }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {friendsHere.length > 0 && (
          <div style={{ display: 'flex' }}>
            {friendsHere.map((f, i) => (
              <Avatar key={f.id} name={f.name} size={22} ring="cyan" ringWidth={1} style={{ marginLeft: i > 0 ? -7 : 0, fontSize: 9 }} />
            ))}
          </div>
        )}
        <span style={{
          fontSize: 11.5, fontWeight: 700, color: bar.heat > 0 ? 'var(--text)' : 'var(--muted)',
          textShadow: '0 1px 6px rgba(0,0,0,.9), 0 0 2px rgba(0,0,0,.9)', whiteSpace: 'nowrap',
        }}>{bar.name}{bar.heat > 0 && bar.heat < 3 ? ` · ${bar.count}` : ''}</span>
      </div>
    </div>
  );
}

function BarSheet({ bar, onClose, onCheckin }) {
  const friendsHere = FRIENDS.filter(f => f.bar === bar.id);
  return (
    <div className="zb-sheet" data-comment-anchor="bar-sheet" style={{
      position: 'absolute', left: 10, right: 10, bottom: 104, zIndex: 20,
      borderRadius: 24, overflow: 'hidden',
      background: 'rgba(21,21,28,.72)', backdropFilter: 'blur(22px) saturate(160%)', WebkitBackdropFilter: 'blur(22px) saturate(160%)',
      border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 18px 50px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08)',
    }}>
      <div style={{ padding: '12px 20px 20px' }}>
        <div style={{ width: 38, height: 4.5, borderRadius: 99, background: 'rgba(255,255,255,.18)', margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 26, color: 'var(--text)', letterSpacing: 0.3 }}>{bar.name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="pin" size={13} color="var(--muted)" />{bar.area} · {bar.dist}
            </div>
          </div>
          <button onClick={onClose} className="zb-press" style={{ background: 'rgba(255,255,255,.07)', border: 'none', borderRadius: 99, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="close" size={15} color="var(--muted)" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '16px 0' }}>
          <div style={{ flex: 1, borderRadius: 14, padding: '10px 14px', background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 26, color: 'var(--amber)', textShadow: '0 0 14px rgb(var(--amber-rgb) / calc(.55 * var(--gi)))' }}>{bar.count}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>bières ce soir</div>
          </div>
          <div style={{ flex: 1.6, borderRadius: 14, padding: '10px 14px', background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)' }}>
            {friendsHere.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%' }}>
                <div style={{ display: 'flex' }}>
                  {friendsHere.map((f, i) => <Avatar key={f.id} name={f.name} size={30} ring="cyan" ringWidth={1} style={{ marginLeft: i > 0 ? -9 : 0, fontSize: 11 }} />)}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', lineHeight: 1.25 }}>
                  {friendsHere.map(f => f.name).join(', ')}<br />
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{friendsHere.length > 1 ? 'y sont' : 'y est'} en ce moment</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', height: '100%' }}>Aucun ami sur place</div>
            )}
          </div>
        </div>

        {bar.king && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
            <span style={{ fontSize: 15 }}>👑</span> Roi du bar : <span style={{ color: 'var(--amber)' }}>{bar.king}</span>
          </div>
        )}

        <NeonButton onClick={() => onCheckin(bar)}>Check-in 📍</NeonButton>
      </div>
    </div>
  );
}

function CarteScreen() {
  const [selected, setSelected] = React.useState(null);
  const [whoOpen, setWhoOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const live = FRIENDS.filter(f => f.bar);
  const barName = id => (BARS.find(b => b.id === id) || {}).name;

  const checkin = (bar) => {
    setSelected(null);
    setToast(`Check-in au ${bar.name} ✓`);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--bg)' }}>
      <NightMap />
      {/* assombrissement haut pour status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110, background: 'linear-gradient(rgba(10,10,15,.85), transparent)', pointerEvents: 'none', zIndex: 3 }} />

      {BARS.map(b => <BarMarker key={b.id} bar={b} selected={selected && selected.id === b.id} onTap={setSelected} />)}

      {/* position de l'utilisateur */}
      <div style={{ position: 'absolute', left: '36%', top: '44%', transform: 'translate(-50%,-50%)', zIndex: 3 }}>
        <span className="zb-user-dot" />
      </div>

      {/* bouton flottant */}
      <button className="zb-press" onClick={() => setWhoOpen(!whoOpen)} style={{
        position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 999, cursor: 'pointer',
        background: 'rgba(21,21,28,.7)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 6px 24px rgba(0,0,0,.5)',
        color: 'var(--text)', fontWeight: 700, fontSize: 13.5, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap',
      }}>
        <LiveDot />Qui sort ce soir ?
        <span style={{ color: 'var(--cyan)', fontWeight: 800 }}>{live.length}</span>
      </button>

      {/* panneau qui sort */}
      {whoOpen && (
        <div style={{
          position: 'absolute', top: 122, left: 24, right: 24, zIndex: 11, borderRadius: 18, padding: '6px 16px',
          background: 'rgba(21,21,28,.78)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 14px 40px rgba(0,0,0,.55)',
        }}>
          {live.map((f, i) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < live.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
              <Avatar name={f.name} size={36} ring="cyan" ringWidth={1} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{f.name}</div>
                <div style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600 }}>📍 au {barName(f.bar)}</div>
              </div>
              <button className="zb-press" onClick={() => { setWhoOpen(false); setSelected(BARS.find(b => b.id === f.bar)); }}
                style={{ background: 'rgb(var(--amber-rgb) / .12)', border: '1px solid rgb(var(--amber-rgb) / .4)', color: 'var(--amber)', borderRadius: 99, padding: '6px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                Voir
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && <BarSheet bar={selected} onClose={() => setSelected(null)} onCheckin={checkin} />}

      {toast && (
        <div style={{
          position: 'absolute', bottom: 116, left: '50%', transform: 'translateX(-50%)', zIndex: 30,
          background: 'rgba(21,21,28,.85)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgb(76 175 80 / .5)', color: 'var(--text)', fontWeight: 700, fontSize: 13.5,
          padding: '11px 20px', borderRadius: 999, whiteSpace: 'nowrap',
          boxShadow: '0 0 24px rgb(76 175 80 / .25), 0 10px 30px rgba(0,0,0,.5)', fontFamily: 'var(--font-ui)',
        }}>{toast}</div>
      )}
    </div>
  );
}

Object.assign(window, { CeSoirScreen, CarteScreen, SCREEN_PAD_TOP, SCREEN_PAD_BOTTOM });
