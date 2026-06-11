// zabrat-flows.jsx — Modal LOG (+ succès), Wrapped, Onboarding, Auth

// ─────────────────────────────────────────────
// ÉCRAN 3 — LOG (modal plein écran)
// ─────────────────────────────────────────────
function Confetti() {
  const colors = ['var(--amber)', 'var(--orange)', 'var(--cyan)', '#fff'];
  const pieces = React.useMemo(() => Array.from({ length: 34 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.7, dur: 2 + Math.random() * 1.6,
    size: 5 + Math.random() * 6, color: colors[i % colors.length], rot: Math.random() * 360,
    round: Math.random() > 0.6,
  })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pieces.map((p, i) => (
        <span key={i} className="zb-confetti" style={{
          left: `${p.left}%`, width: p.size, height: p.size * (p.round ? 1 : 0.45),
          background: p.color, borderRadius: p.round ? '50%' : 1,
          animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          transform: `rotate(${p.rot}deg)`,
        }} />
      ))}
    </div>
  );
}

function LogSuccess({ onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
      <Confetti />
      <div className="zb-pop" style={{ filter: 'drop-shadow(0 0 30px rgb(var(--amber-rgb) / calc(.6 * var(--gi))))' }}>
        <ZabratLogo size={150} glow={false} />
      </div>
      <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 56, color: 'var(--amber)', lineHeight: 1, marginTop: 18, whiteSpace: 'nowrap', textShadow: '0 0 28px rgb(var(--amber-rgb) / calc(.65 * var(--gi)))' }}>
        +1 !
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginTop: 12 }}>T'en es à 4 ce soir 🔥</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <span style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 800, color: 'var(--amber)', background: 'rgb(var(--amber-rgb) / .12)', border: '1px solid rgb(var(--amber-rgb) / .45)' }}>+25 pts</span>
        <span style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 800, color: 'var(--cyan)', background: 'rgb(0 229 255 / .1)', border: '1px solid rgb(0 229 255 / .4)', boxShadow: '0 0 14px rgb(0 229 255 / calc(.25 * var(--gi)))' }}>
          🏅 Badge « L'Assidu » débloqué
        </span>
      </div>
      <div style={{ position: 'absolute', bottom: 56, left: 32, right: 32 }}>
        <NeonButton onClick={onClose}>Retour à la soirée</NeonButton>
      </div>
    </div>
  );
}

function LogModal({ onClose }) {
  const [beer, setBeer] = React.useState(null);
  const [bar, setBar] = React.useState('theatro');
  const [visib, setVisib] = React.useState('amis');
  const [success, setSuccess] = React.useState(false);

  return (
    <div data-screen-label="Modal LOG" style={{
      position: 'absolute', inset: 0, zIndex: 40,
      background: 'rgba(6,6,10,.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      {success ? <LogSuccess onClose={onClose} /> : (
        <div className="zb-scroll" style={{ height: '100%', overflowY: 'auto', padding: '74px 22px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 27, lineHeight: 1.15, color: 'var(--text)', letterSpacing: 0.4, flex: 1 }}>C'est quoi ce soir ?</div>
            <button className="zb-press" onClick={onClose} style={{ background: 'rgba(255,255,255,.07)', border: 'none', borderRadius: 99, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="close" size={16} color="var(--muted)" />
            </button>
          </div>

          {/* grille des 6 types */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 22 }}>
            {BEER_TYPES.map(b => {
              const active = beer === b.id;
              return (
                <button key={b.id} className="zb-press" onClick={() => setBeer(b.id)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 4px 13px', borderRadius: 18, cursor: 'pointer', fontFamily: 'var(--font-ui)',
                  background: active ? 'linear-gradient(160deg, rgb(var(--amber-rgb) / .2), rgb(var(--amber-rgb) / .06))' : 'rgba(255,255,255,.045)',
                  backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                  border: active ? '1.5px solid var(--amber)' : '1px solid rgba(255,255,255,.1)',
                  boxShadow: active ? '0 0 26px rgb(var(--amber-rgb) / calc(.4 * var(--gi))), inset 0 1px 0 rgb(var(--amber-rgb) / .3)' : 'inset 0 1px 0 rgba(255,255,255,.06)',
                  transition: 'all .18s',
                }}>
                  <BeerGlass glass={b.glass} tint={b.tint} size={48} active={active} />
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: active ? 'var(--amber)' : 'var(--text)' }}>{b.name}</span>
                </button>
              );
            })}
          </div>

          {/* bar */}
          <SectionLabel style={{ margin: '24px 0 10px' }}>Où ça ?</SectionLabel>
          <div className="zb-hscroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -22px', padding: '2px 22px' }}>
            {BARS.map(b => {
              const active = bar === b.id;
              return (
                <button key={b.id} className="zb-press" onClick={() => setBar(b.id)} style={{
                  padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap', cursor: 'pointer',
                  fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 700, flexShrink: 0,
                  background: active ? 'rgb(var(--amber-rgb) / .16)' : 'rgba(255,255,255,.05)',
                  border: active ? '1.5px solid var(--amber)' : '1px solid rgba(255,255,255,.1)',
                  color: active ? 'var(--amber)' : 'var(--muted)',
                  boxShadow: active ? '0 0 14px rgb(var(--amber-rgb) / calc(.3 * var(--gi)))' : 'none',
                  transition: 'all .15s',
                }}>{b.name}</button>
              );
            })}
          </div>

          {/* visibilité */}
          <SectionLabel style={{ margin: '22px 0 10px' }}>Visibilité</SectionLabel>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: 4 }}>
            {[['amis', 'users', 'Mes amis'], ['prive', 'lock', 'Privé']].map(([k, ic, label]) => (
              <button key={k} className="zb-press" onClick={() => setVisib(k)} style={{
                flex: 1, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 800,
                background: visib === k ? 'rgba(255,255,255,.1)' : 'transparent',
                color: visib === k ? 'var(--text)' : 'var(--muted)', transition: 'all .15s',
              }}>
                <Icon name={ic} size={16} color="currentColor" />{label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 30 }}>
            <NeonButton onClick={() => beer && setSuccess(true)} style={{ height: 62, fontSize: 19, borderRadius: 20, opacity: beer ? 1 : 0.4 }}>
              VALIDER 🍺
            </NeonButton>
            {!beer && <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginTop: 10 }}>Choisis ta bière d'abord</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ÉCRAN 7 — WRAPPED MENSUEL
// ─────────────────────────────────────────────
function WrappedScreen({ onClose }) {
  const rows = [
    { label: 'Bar préféré', value: 'Théatro', sub: '14 soirées' },
    { label: 'Bière préférée', value: 'Blonde', sub: '31 sur 54' },
    { label: 'Meilleur soir', value: 'Sam. 17 mai', sub: '7 🍺 — record' },
  ];
  return (
    <div data-screen-label="Wrapped" style={{
      position: 'absolute', inset: 0, zIndex: 45, overflow: 'hidden',
      background: 'radial-gradient(120% 80% at 80% -10%, #1B1430 0%, #0A0A0F 55%), var(--bg)',
    }}>
      {/* halos néon */}
      <div style={{ position: 'absolute', top: -80, left: -90, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgb(var(--amber-rgb) / calc(.22 * var(--gi))), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 60, right: -110, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgb(255 107 53 / calc(.16 * var(--gi))), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '38%', right: -60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgb(0 229 255 / calc(.1 * var(--gi))), transparent 70%)', pointerEvents: 'none' }} />

      <button className="zb-press" onClick={onClose} style={{ position: 'absolute', top: 66, right: 20, zIndex: 5, background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 99, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon name="close" size={16} color="var(--text)" />
      </button>

      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: '92px 28px 46px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ZabratLogo size={30} glow={false} />
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2.5, color: 'var(--muted)', textTransform: 'uppercase' }}>Zabrat Wrapped</span>
        </div>

        <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 32, color: 'var(--text)', marginTop: 18, letterSpacing: 0.4 }}>Ton mois de mai 🍺</div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: 8 }}>
          <span style={{
            fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 118, lineHeight: 0.95, color: 'var(--amber)',
            textShadow: '0 0 36px rgb(var(--amber-rgb) / calc(.65 * var(--gi))), 0 0 80px rgb(var(--amber-rgb) / calc(.3 * var(--gi)))',
          }}>54</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', lineHeight: 1.25, paddingBottom: 12 }}>bières<br /><span style={{ color: 'var(--muted)', fontWeight: 700 }}>ce mois-ci</span></span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 24 }}>
          {rows.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '12px 16px',
              borderRadius: 14, background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,.09)',
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{r.label}</span>
              <span style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 20, color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.value}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, display: 'block' }}>{r.sub}</span>
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 9 }}>
            <div style={{ flex: 1, padding: '12px 16px', borderRadius: 14, background: 'rgb(var(--amber-rgb) / .1)', border: '1px solid rgb(var(--amber-rgb) / .4)', boxShadow: '0 0 18px rgb(var(--amber-rgb) / calc(.18 * var(--gi)))' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Chez les amis</div>
              <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 26, color: 'var(--amber)', textShadow: '0 0 14px rgb(var(--amber-rgb) / calc(.5 * var(--gi)))' }}>#3</div>
            </div>
            <div style={{ flex: 1.4, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Badge du mois</div>
              <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 20, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Icon name="flame" size={19} color="var(--orange)" fill="solid" style={{ filter: 'drop-shadow(0 0 6px rgb(255 107 53 / .7))' }} />L'Assidu
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <NeonButton>Partager 📤</NeonButton>
        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, marginTop: 10 }}>WhatsApp · Instagram</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ÉCRAN 8 — ONBOARDING
// ─────────────────────────────────────────────
function MiniPodium() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 150, width: 210 }}>
      {[{ h: 72, n: 'Khalil' }, { h: 116, n: 'Toi', win: true }, { h: 52, n: 'Mariem' }].map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Avatar name={s.n === 'Toi' ? 'Faouez' : s.n} size={s.win ? 46 : 38} ring={s.win ? 'amber' : null} />
          <div style={{
            width: '100%', height: s.h, borderRadius: '8px 8px 0 0',
            background: s.win ? 'linear-gradient(rgb(var(--amber-rgb) / .4), rgb(var(--amber-rgb) / .06))' : 'linear-gradient(rgba(255,255,255,.12), rgba(255,255,255,.02))',
            border: s.win ? '1px solid rgb(var(--amber-rgb) / .6)' : '1px solid var(--border)', borderBottom: 'none',
            boxShadow: s.win ? '0 -2px 28px rgb(var(--amber-rgb) / calc(.35 * var(--gi)))' : 'none',
          }} />
        </div>
      ))}
    </div>
  );
}

function MiniMap() {
  return (
    <div style={{ position: 'relative', width: 230, height: 160, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 0 40px rgb(0 229 255 / calc(.12 * var(--gi)))' }}>
      <div style={{ position: 'absolute', inset: 0, transform: 'scale(1.6)', transformOrigin: '30% 38%' }}>
        <NightMap />
      </div>
      <span style={{ position: 'absolute', left: '34%', top: '42%', width: 14, height: 14, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 18px rgb(var(--amber-rgb) / calc(.9 * var(--gi)))', border: '2px solid rgba(255,255,255,.4)' }} />
      <span style={{ position: 'absolute', left: '60%', top: '64%', width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)', opacity: 0.8, boxShadow: '0 0 12px rgb(var(--amber-rgb) / calc(.6 * var(--gi)))' }} />
      <Avatar name="Khalil" size={24} ring="cyan" ringWidth={1} style={{ position: 'absolute', left: '24%', top: '24%' }} />
      <Avatar name="Mariem" size={24} ring="cyan" ringWidth={1} style={{ position: 'absolute', left: '70%', top: '46%' }} />
    </div>
  );
}

function OnboardingFlow({ onDone }) {
  const [slide, setSlide] = React.useState(0);
  const slides = [
    { visual: <ZabratLogo size={150} />, title: 'Zabrat', sub: 'Tes soirées comptent.' },
    { visual: <MiniMap />, title: 'Vois qui sort,', sub: 'et où ça bouge.' },
    { visual: <MiniPodium />, title: 'Sois le roi', sub: 'de la semaine.' },
  ];
  const s = slides[slide];
  const last = slide === slides.length - 1;
  return (
    <div data-screen-label="Onboarding" style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '74px 32px 50px' }}>
      <button onClick={onDone} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)', padding: 6 }}>Passer</button>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, textAlign: 'center' }}>
        <div key={slide} className="zb-fade-up">{s.visual}</div>
        <div key={slide + 's'} className="zb-fade-up" style={{ animationDelay: '.08s' }}>
          <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 38, lineHeight: 1.1, color: 'var(--text)', letterSpacing: 0.4 }}>{s.title}</div>
          <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 38, lineHeight: 1.1, color: 'var(--amber)', textShadow: '0 0 22px rgb(var(--amber-rgb) / calc(.5 * var(--gi)))' }}>{s.sub}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)} style={{
            width: i === slide ? 24 : 8, height: 8, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
            background: i === slide ? 'var(--amber)' : 'rgba(255,255,255,.15)',
            boxShadow: i === slide ? '0 0 10px rgb(var(--amber-rgb) / calc(.6 * var(--gi)))' : 'none',
            transition: 'all .25s',
          }} />
        ))}
      </div>
      <NeonButton onClick={() => last ? onDone() : setSlide(slide + 1)}>
        {last ? "C'est parti 🍺" : 'Continuer'}
      </NeonButton>
    </div>
  );
}

// ─────────────────────────────────────────────
// ÉCRAN 9 — AUTH TÉLÉPHONE
// ─────────────────────────────────────────────
function NumPad({ onKey }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%' }}>
      {keys.map((k, i) => k === '' ? <span key={i} /> : (
        <button key={i} className="zb-press" onClick={() => onKey(k)} style={{
          height: 52, borderRadius: 14, border: '1px solid var(--border)', cursor: 'pointer',
          background: 'var(--surface)', color: 'var(--text)', fontSize: 21, fontWeight: 700, fontFamily: 'var(--font-ui)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{k === 'del' ? <Icon name="back" size={19} color="var(--muted)" /> : k}</button>
      ))}
    </div>
  );
}

function AuthFlow({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [pseudo, setPseudo] = React.useState('Faouez');

  const phoneKey = k => setPhone(p => k === 'del' ? p.slice(0, -1) : p.length < 8 ? p + k : p);
  const otpKey = k => setOtp(o => {
    const next = k === 'del' ? o.slice(0, -1) : o.length < 6 ? o + k : o;
    if (next.length === 6) setTimeout(() => setStep(2), 450);
    return next;
  });
  const fmtPhone = phone.replace(/(\d{2})(?=\d)/g, '$1 ');

  const titles = [
    ['Ton numéro', 'On t\'envoie un code, c\'est tout.'],
    ['Le code reçu', `Envoyé au +216 ${fmtPhone || '…'}`],
    ['Ton pseudo', 'C\'est lui qui apparaîtra dans la ligue.'],
  ];

  return (
    <div data-screen-label="Auth téléphone" style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', padding: '74px 28px 44px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {step > 0 && (
          <button className="zb-press" onClick={() => setStep(step - 1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="back" size={16} color="var(--text)" />
          </button>
        )}
        <div style={{ display: 'flex', gap: 5, marginLeft: 'auto' }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 99, background: i <= step ? 'var(--amber)' : 'rgba(255,255,255,.12)', boxShadow: i === step ? '0 0 8px rgb(var(--amber-rgb) / .6)' : 'none', transition: 'all .25s' }} />)}
        </div>
      </div>

      <div key={step} className="zb-fade-up" style={{ marginTop: 34, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-stat)', fontWeight: 700, fontSize: 32, color: 'var(--text)', letterSpacing: 0.4 }}>{titles[step][0]}</div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>{titles[step][1]}</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        {step === 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', height: 60, borderRadius: 18, width: '100%',
            background: 'var(--surface)', border: '1.5px solid rgb(var(--amber-rgb) / .6)',
            boxShadow: '0 0 24px rgb(var(--amber-rgb) / calc(.22 * var(--gi)))',
          }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--muted)', borderRight: '1px solid var(--border)', paddingRight: 12 }}>🇹🇳 +216</span>
            <span style={{ fontFamily: 'var(--font-stat)', fontSize: 22, fontWeight: 700, color: phone ? 'var(--text)' : '#3A3A48', letterSpacing: 1.5, whiteSpace: 'nowrap' }}>
              {fmtPhone || '20 000 000'}<span className="zb-caret" />
            </span>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', gap: 9 }}>
            {Array.from({ length: 6 }, (_, i) => {
              const filled = i < otp.length, current = i === otp.length;
              return (
                <div key={i} style={{
                  width: 46, height: 58, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-stat)', fontSize: 27, fontWeight: 700, color: 'var(--amber)',
                  background: filled ? 'rgb(var(--amber-rgb) / .12)' : 'var(--surface)',
                  border: filled ? '1.5px solid var(--amber)' : current ? '1.5px solid rgb(var(--amber-rgb) / .6)' : '1px solid var(--border)',
                  boxShadow: filled ? '0 0 18px rgb(var(--amber-rgb) / calc(.35 * var(--gi)))' : current ? '0 0 14px rgb(var(--amber-rgb) / calc(.18 * var(--gi)))' : 'none',
                  transition: 'all .15s',
                }}>{otp[i] || (current ? <span className="zb-caret" /> : '')}</div>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <React.Fragment>
            <div style={{ position: 'relative' }}>
              <Avatar name={pseudo || '?'} size={104} ring="amber" />
              <button className="zb-press" style={{
                position: 'absolute', bottom: -2, right: -2, width: 34, height: 34, borderRadius: 99, cursor: 'pointer',
                background: 'linear-gradient(100deg, var(--amber), var(--orange))', border: '2.5px solid var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgb(var(--amber-rgb) / calc(.5 * var(--gi)))',
              }}><Icon name="plus" size={17} color="#1A0E00" stroke={2.6} /></button>
            </div>
            <input value={pseudo} onChange={e => setPseudo(e.target.value)} placeholder="Ton pseudo" maxLength={16}
              style={{
                width: '100%', height: 58, borderRadius: 18, textAlign: 'center', outline: 'none',
                background: 'var(--surface)', border: '1.5px solid rgb(var(--amber-rgb) / .6)',
                boxShadow: '0 0 24px rgb(var(--amber-rgb) / calc(.22 * var(--gi)))',
                color: 'var(--text)', fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-ui)',
              }} />
          </React.Fragment>
        )}
      </div>

      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <NumPad onKey={phoneKey} />
          <NeonButton onClick={() => phone.length >= 8 && setStep(1)} style={{ opacity: phone.length >= 8 ? 1 : 0.4 }}>Recevoir mon code</NeonButton>
        </div>
      )}
      {step === 1 && <NumPad onKey={otpKey} />}
      {step === 2 && <NeonButton onClick={onDone} style={{ opacity: pseudo ? 1 : 0.4 }}>C'est parti 🍺</NeonButton>}
    </div>
  );
}

Object.assign(window, { LogModal, WrappedScreen, OnboardingFlow, AuthFlow, Confetti });
