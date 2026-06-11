// zabrat-screens-2.jsx — Ligue, Profil, Amis

// ─────────────────────────────────────────────
// ÉCRAN 4 — LIGUE
// ─────────────────────────────────────────────
function PodiumStep({ entry, place }) {
  const conf = {
    1: { h: 92, color: 'var(--amber)', rgb: 'var(--amber-rgb)', label: 'or', av: 64, glow: 0.55 },
    2: { h: 64, color: '#C8CAD8', rgb: '200 202 216', av: 52, glow: 0.3 },
    3: { h: 46, color: '#C77B4A', rgb: '199 123 74', av: 52, glow: 0.3 },
  }[place];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
      <div style={{ position: 'relative' }}>
        <Avatar name={entry.name} size={conf.av} ring={place === 1 ? 'amber' : null} />
        <span style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          display: place === 1 ? 'block' : 'none',
        }}><Icon name="crown" size={20} color="var(--amber)" fill="solid" style={{ filter: 'drop-shadow(0 0 8px rgb(var(--amber-rgb) / calc(.8 * var(--gi))))' }} /></span>
      </div>
      <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: entry.me ? 'var(--amber)' : 'var(--text)' }}>{entry.me ? 'Toi' : entry.name}</div>
        <div style={{ fontFamily: 'var(--font-stat)', fontSize: 19, fontWeight: 700, whiteSpace: 'nowrap', color: conf.color, textShadow: `0 0 12px rgb(${conf.rgb} / calc(${conf.glow} * var(--gi)))` }}>{entry.count} 🍺</div>
      </div>
      <div style={{
        width: '100%', height: conf.h, borderRadius: '10px 10px 0 0', position: 'relative',
        background: `linear-gradient(rgb(${conf.rgb} / .28), rgb(${conf.rgb} / .04))`,
        border: `1px solid rgb(${conf.rgb} / .45)`, borderBottom: 'none',
        boxShadow: `0 -2px 22px rgb(${conf.rgb} / calc(${conf.glow * 0.6} * var(--gi))), inset 0 1px 0 rgb(${conf.rgb} / .5)`,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8,
      }}>
        <span style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 26, color: `rgb(${conf.rgb} / .9)` }}>{place}</span>
      </div>
    </div>
  );
}

function Delta({ d }) {
  if (d === 0) return <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700, width: 34, textAlign: 'right' }}>—</span>;
  const up = d > 0;
  return (
    <span style={{ color: up ? 'var(--green)' : 'var(--red)', fontSize: 12, fontWeight: 800, width: 34, textAlign: 'right' }}>
      {up ? '▲' : '▼'}{Math.abs(d)}
    </span>
  );
}

function LigueRow({ entry, rank }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 13, padding: '11px 16px',
      borderRadius: 16,
      ...(entry.me ? {
        background: 'linear-gradient(100deg, rgb(var(--amber-rgb) / .15), rgb(var(--amber-rgb) / .05))',
        border: '1px solid rgb(var(--amber-rgb) / .5)',
        boxShadow: '0 0 22px rgb(var(--amber-rgb) / calc(.25 * var(--gi)))',
      } : {}),
    }}>
      <span style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 19, width: 26, color: entry.me ? 'var(--amber)' : 'var(--muted)', textAlign: 'center' }}>{rank}</span>
      <Avatar name={entry.name} size={40} ring={entry.me ? 'amber' : null} ringWidth={1.5} />
      <div style={{ flex: 1, fontSize: 15, fontWeight: entry.me ? 800 : 700, color: entry.me ? 'var(--amber)' : 'var(--text)' }}>
        {entry.me ? 'Toi' : entry.name}
      </div>
      <span style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 19, color: 'var(--text)', whiteSpace: 'nowrap' }}>{entry.count}<span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}> 🍺</span></span>
      <Delta d={entry.delta} />
    </div>
  );
}

function LigueScreen() {
  const [period, setPeriod] = React.useState('week');
  const data = LEAGUE[period];
  const meIdx = data.findIndex(e => e.me);
  const scrollRef = React.useRef(null);
  const meRef = React.useRef(null);
  const [meVisible, setMeVisible] = React.useState(true);

  React.useEffect(() => {
    const sc = scrollRef.current, me = meRef.current;
    if (!sc || !me) return;
    const check = () => {
      const sr = sc.getBoundingClientRect(), mr = me.getBoundingClientRect();
      setMeVisible(mr.top < sr.bottom - 90 && mr.bottom > sr.top);
    };
    check();
    sc.addEventListener('scroll', check);
    return () => sc.removeEventListener('scroll', check);
  }, [period]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={scrollRef} className="zb-scroll" style={{ height: '100%', overflowY: 'auto', paddingTop: SCREEN_PAD_TOP, paddingBottom: SCREEN_PAD_BOTTOM }}>
        <div style={{ padding: '6px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 34, color: 'var(--text)', letterSpacing: 0.4 }}>Ligue</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="zb-live-dot" style={{ width: 6, height: 6, background: 'var(--amber)', boxShadow: '0 0 8px rgb(var(--amber-rgb) / .8)' }} />
              Se termine dans <span style={{ color: 'var(--amber)' }}>2j 14h</span>
            </div>
          </div>

          {/* tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 4 }}>
            {[['week', 'Cette semaine'], ['month', 'Ce mois']].map(([k, label]) => (
              <button key={k} onClick={() => setPeriod(k)} className="zb-press" style={{
                flex: 1, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 800,
                background: period === k ? 'linear-gradient(100deg, var(--amber), var(--orange))' : 'transparent',
                color: period === k ? '#1A0E00' : 'var(--muted)',
                boxShadow: period === k ? '0 2px 14px rgb(var(--amber-rgb) / calc(.4 * var(--gi)))' : 'none',
                transition: 'all .2s',
              }}>{label}</button>
            ))}
          </div>

          {/* podium */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 26, padding: '0 6px' }}>
            <PodiumStep entry={data[1]} place={2} />
            <PodiumStep entry={data[0]} place={1} />
            <PodiumStep entry={data[2]} place={3} />
          </div>
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgb(var(--amber-rgb) / .35), transparent)', margin: '0 20px 14px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 14px' }}>
          {data.slice(3).map((e, i) => (
            <div key={e.id} ref={e.me ? meRef : null}>
              <LigueRow entry={e} rank={i + 4} />
            </div>
          ))}
          {/* ligne Toi dans la liste si top 3 → référence sur le podium impossible, on track la liste seulement */}
        </div>
      </div>

      {/* ligne sticky « Toi » */}
      <div style={{
        position: 'absolute', left: 14, right: 14, bottom: 112, zIndex: 25,
        borderRadius: 16, overflow: 'hidden',
        background: 'rgba(16,16,23,.94)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 10px 34px rgba(0,0,0,.55)',
      }}>
        <LigueRow entry={data[meIdx]} rank={meIdx + 1} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ÉCRAN 5 — PROFIL
// ─────────────────────────────────────────────
function XPRing({ size = 116, progress = 0.72, children }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--amber)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${c * progress} ${c}`}
          style={{ filter: 'drop-shadow(0 0 8px rgb(var(--amber-rgb) / calc(.7 * var(--gi))))' }} />
      </svg>
      {children}
    </div>
  );
}

function NeonBarChart() {
  const max = Math.max(...WEEK_CHART.map(d => d.v));
  return (
    <div className="zb-card" style={{ padding: '18px 18px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <SectionLabel>Cette semaine</SectionLabel>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}>{WEEK_CHART.reduce((a, d) => a + d.v, 0)} 🍺</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 92 }}>
        {WEEK_CHART.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, height: '100%', justifyContent: 'flex-end' }}>
            {d.v > 0 ? (
              <div style={{
                width: '100%', maxWidth: 26, height: `${(d.v / max) * 100}%`, borderRadius: 6,
                background: i >= 4 ? 'linear-gradient(rgb(var(--amber-rgb) / 1), rgb(255 107 53 / .75))' : 'rgb(var(--amber-rgb) / .35)',
                boxShadow: i >= 4 ? '0 0 14px rgb(var(--amber-rgb) / calc(.5 * var(--gi)))' : 'none',
              }} />
            ) : <div style={{ width: '100%', maxWidth: 26, height: 3, borderRadius: 3, background: 'rgba(255,255,255,.08)' }} />}
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{d.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgeTile({ badge }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
      padding: '14px 4px 11px', borderRadius: 16,
      background: badge.unlocked ? 'linear-gradient(160deg, rgb(var(--amber-rgb) / .13), rgb(var(--amber-rgb) / .03))' : 'rgba(255,255,255,.025)',
      border: badge.unlocked ? '1px solid rgb(var(--amber-rgb) / .4)' : '1px solid var(--border)',
      boxShadow: badge.unlocked ? '0 0 16px rgb(var(--amber-rgb) / calc(.16 * var(--gi)))' : 'none',
    }}>
      <Icon name={badge.unlocked ? badge.icon : 'lock'} size={24}
        color={badge.unlocked ? 'var(--amber)' : '#3A3A48'}
        style={badge.unlocked ? { filter: 'drop-shadow(0 0 6px rgb(var(--amber-rgb) / calc(.6 * var(--gi))))' } : {}} />
      <span style={{ fontSize: 10.5, fontWeight: 700, color: badge.unlocked ? 'var(--text)' : '#3A3A48', textAlign: 'center', lineHeight: 1.2 }}>{badge.name}</span>
    </div>
  );
}

function ProfilScreen({ onOpenWrapped, onOpenAmis }) {
  return (
    <div className="zb-scroll" style={{ height: '100%', overflowY: 'auto', paddingTop: SCREEN_PAD_TOP, paddingBottom: SCREEN_PAD_BOTTOM }}>
      {/* settings */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px' }}>
        <button className="zb-press" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="settings" size={19} color="var(--muted)" />
        </button>
      </div>

      {/* hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -6 }}>
        <XPRing size={118} progress={USER.xp}>
          <Avatar name={USER.name} size={94} />
        </XPRing>
        <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 28, color: 'var(--text)', marginTop: 12, letterSpacing: 0.4 }}>{USER.name}</div>
        <div style={{
          marginTop: 7, padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 800,
          color: 'var(--amber)', background: 'rgb(var(--amber-rgb) / .12)', border: '1px solid rgb(var(--amber-rgb) / .4)',
          boxShadow: '0 0 14px rgb(var(--amber-rgb) / calc(.2 * var(--gi)))',
        }}>Niv. {USER.levelNum} · {USER.level} ⭐</div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, marginTop: 7 }}>{USER.xpToNext} XP avant « Le Pilier »</div>
      </div>

      {/* 3 chiffres géants */}
      <div style={{ display: 'flex', padding: '22px 20px 0', textAlign: 'center' }}>
        {[
          { v: USER.total, label: 'bières au total', hot: true },
          { v: <span>{USER.streak} <span style={{ fontSize: 22 }}>🔥</span></span>, label: 'streak' },
          { v: `#${USER.rank}`, label: 'cette semaine' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <div style={{
              fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 40, lineHeight: 1, color: s.hot ? 'var(--amber)' : 'var(--text)',
              textShadow: s.hot ? '0 0 20px rgb(var(--amber-rgb) / calc(.6 * var(--gi)))' : 'none',
            }}>{s.v}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '22px 20px 0' }}>
        <NeonBarChart />

        {/* badges */}
        <div className="zb-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <SectionLabel>Badges</SectionLabel>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--amber)' }}>6<span style={{ color: 'var(--muted)' }}>/47</span></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {BADGES.map(b => <BadgeTile key={b.id} badge={b} />)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <NeonButton onClick={onOpenWrapped} style={{ flex: 1.2 }}>Mon Wrapped 🎁</NeonButton>
          <NeonButton secondary onClick={onOpenAmis} style={{ flex: 1 }}>
            <Icon name="users" size={18} color="var(--amber)" />Mes amis
          </NeonButton>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ÉCRAN 6 — AMIS
// ─────────────────────────────────────────────
function FriendCard({ f }) {
  const bar = BARS.find(b => b.id === f.bar);
  return (
    <div className="zb-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
      <Avatar name={f.name} size={44} ring={f.bar ? 'cyan' : null} ringWidth={1.5} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{f.name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>
          {f.monthCount} bières ce mois
          {bar && <span style={{ color: 'var(--cyan)', fontWeight: 700 }}> · 📍 au {bar.name}</span>}
        </div>
      </div>
      <Icon name="chevR" size={16} color="#3A3A48" />
    </div>
  );
}

function AmisScreen({ onBack }) {
  const [tab, setTab] = React.useState('amis');
  const [query, setQuery] = React.useState('');
  const [requests, setRequests] = React.useState([
    { id: 'r1', name: 'Hamza', mutual: 4 },
    { id: 'r2', name: 'Syrine', mutual: 2 },
  ]);
  const filtered = FRIENDS.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="zb-scroll" style={{ height: '100%', overflowY: 'auto', paddingTop: SCREEN_PAD_TOP, paddingBottom: SCREEN_PAD_BOTTOM, background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px' }}>
        <button className="zb-press" onClick={onBack} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="back" size={18} color="var(--text)" />
        </button>
        <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 28, color: 'var(--text)', letterSpacing: 0.4 }}>Amis</div>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 4, margin: '16px 20px 0', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 4 }}>
        {[['amis', 'Mes amis'], ['demandes', `Demandes${requests.length ? ` (${requests.length})` : ''}`], ['chercher', 'Chercher']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className="zb-press" style={{
            flex: 1, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 800,
            background: tab === k ? 'linear-gradient(100deg, var(--amber), var(--orange))' : 'transparent',
            color: tab === k ? '#1A0E00' : 'var(--muted)', transition: 'all .2s',
            boxShadow: tab === k ? '0 2px 12px rgb(var(--amber-rgb) / calc(.35 * var(--gi)))' : 'none',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 20px 0' }}>
        {tab === 'chercher' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', height: 48,
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
          }}>
            <Icon name="search" size={18} color="var(--muted)" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Pseudo ou numéro de téléphone"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14.5, fontFamily: 'var(--font-ui)', fontWeight: 600 }} />
          </div>
        )}

        {tab === 'demandes' && (
          requests.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, fontWeight: 600, padding: '40px 0' }}>Aucune demande en attente</div>
            : requests.map(r => (
              <div key={r.id} className="zb-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
                <Avatar name={r.name} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{r.mutual} amis en commun</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="zb-press" onClick={() => setRequests(rs => rs.filter(x => x.id !== r.id))}
                    style={{ background: 'rgba(255,255,255,.06)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 99, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>Refuser</button>
                  <button className="zb-press" onClick={() => setRequests(rs => rs.filter(x => x.id !== r.id))}
                    style={{ background: 'linear-gradient(100deg, var(--amber), var(--orange))', border: 'none', color: '#1A0E00', borderRadius: 99, padding: '8px 16px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-ui)', boxShadow: '0 2px 12px rgb(var(--amber-rgb) / calc(.4 * var(--gi)))' }}>Accepter</button>
                </div>
              </div>
            ))
        )}

        {(tab === 'amis' || tab === 'chercher') && filtered.map(f => <FriendCard key={f.id} f={f} />)}
        {tab === 'chercher' && filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, fontWeight: 600, padding: '30px 0' }}>Aucun résultat pour « {query} »</div>
        )}

        <button className="zb-press" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 50,
          borderRadius: 16, border: 'none', cursor: 'pointer', marginTop: 4,
          background: '#1FAF52', color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-ui)',
          boxShadow: '0 4px 20px rgb(31 175 82 / calc(.35 * var(--gi)))',
        }}>
          <Icon name="whatsapp" size={20} color="#fff" />Inviter sur WhatsApp
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { LigueScreen, ProfilScreen, AmisScreen });
