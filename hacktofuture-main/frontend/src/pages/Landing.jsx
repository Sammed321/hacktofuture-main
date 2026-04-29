import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Sun, Moon, ArrowRight, Layers, Zap, Users, Lock, Check } from "lucide-react";
import { useTheme } from "../ThemeContext";

/* ── Scroll-reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── Animated counter ── */
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = null;
    const dur = 1300;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  { icon: Layers, title: "Infinite Canvas",  desc: "Pan, zoom, sketch — your ideas never run out of room." },
  { icon: Zap,    title: "Real-time Sync",   desc: "Sub-10 ms latency across every collaborator on the planet." },
  { icon: Users,  title: "Live Cursors",     desc: "See teammates thinking in real time. No lag, no confusion." },
  { icon: Lock,   title: "Enterprise-grade", desc: "SOC 2 Type II, end-to-end encryption. Your IP stays yours." },
];

const PLANS = [
  { name: "Starter",    price: "Free",   perks: ["Up to 3 boards", "5 team members", "Community support"] },
  { name: "Pro",        price: "$12",    perks: ["Unlimited boards", "25 team members", "Priority support", "Version history"], featured: true },
  { name: "Enterprise", price: "Custom", perks: ["Unlimited everything", "SSO & SAML", "Dedicated CSM", "SLA guarantee"] },
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [heroIn,   setHeroIn]   = useState(false);
  const [statsRef, statsIn]     = useReveal();
  const [featRef,  featIn]      = useReveal();
  const [planRef,  planIn]      = useReveal();
  const [ctaRef,   ctaIn]       = useReveal();

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 60);
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = theme.isDark;
  const bg      = isDark ? "#0a0a0a"                    : "#f8f8f7";
  const surface = isDark ? "#131313"                    : "#ffffff";
  const border  = isDark ? "rgba(255,255,255,0.08)"     : "rgba(0,0,0,0.08)";
  const text    = isDark ? "#f0f0ee"                    : "#111110";
  const textSub = isDark ? "rgba(240,240,238,0.42)"     : "rgba(17,17,16,0.42)";
  const textMid = isDark ? "rgba(240,240,238,0.68)"     : "rgba(17,17,16,0.65)";
  const orange       = "#f97316";
  const orangeDim    = isDark ? "rgba(249,115,22,0.13)" : "rgba(249,115,22,0.09)";
  const orangeBorder = "rgba(249,115,22,0.32)";
  const navBg        = isDark ? "rgba(10,10,10,0.88)"   : "rgba(248,248,247,0.88)";

  const slide = (v, d = 0) => ({
    opacity:   v ? 1 : 0,
    transform: v ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.6s ${d}ms ease, transform 0.6s ${d}ms ease`,
  });

  return (
    <div style={{ background: bg, color: text, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${border}; border-radius: 4px; }
        @keyframes scrollDot {
          0%,100% { transform: translateY(0); opacity: 0.9; }
          55%      { transform: translateY(9px); opacity: 0.15; }
        }
        .fcard { transition: border-color 0.2s ease, transform 0.22s ease; }
        .fcard:hover { transform: translateY(-3px); }
        .navlink { color: ${textSub}; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.18s; }
        .navlink:hover { color: ${text}; }
        .footlink { font-size: 12px; color: ${textSub}; text-decoration: none; transition: color 0.18s; }
        .footlink:hover { color: ${text}; }
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        background: scrolled ? navBg : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? border : "transparent"}`,
        transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px", color: text }}>
          <BrainCircuit size={20} color={orange} strokeWidth={2.2} />
          Sketchly
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: 32 }}>
          {["Features", "Pricing", "Blog"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="navlink">{l}</a>
          ))}
        </nav>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={toggleTheme}
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              border: `1px solid ${border}`,
              color: textMid, cursor: "pointer",
              width: 34, height: 34, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.18s, color 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.11)" : "rgba(0,0,0,0.09)"; e.currentTarget.style.color = text; }}
            onMouseLeave={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"; e.currentTarget.style.color = textMid; }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: orange, color: "#fff", border: "none",
              padding: "0 18px", height: 34, borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "background 0.18s, transform 0.15s",
              letterSpacing: "-0.1px",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#ea6d0a"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = orange; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Launch App <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 24px 80px",
        position: "relative",
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)",
          width: 560, height: 360, borderRadius: "50%",
          background: isDark
            ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 68%)"
            : "radial-gradient(ellipse, rgba(249,115,22,0.10) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: orangeDim, border: `1px solid ${orangeBorder}`,
          borderRadius: 100, padding: "5px 14px", marginBottom: 32,
          fontSize: 11, fontWeight: 700, color: orange, letterSpacing: "0.07em",
          textTransform: "uppercase",
          ...slide(heroIn, 0),
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: orange, display: "inline-block" }} />
          Now in Public Beta
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(38px, 5.2vw, 68px)", fontWeight: 800,
          lineHeight: 1.08, letterSpacing: "-0.04em",
          maxWidth: 760, marginBottom: 22,
          ...slide(heroIn, 120),
        }}>
          Collaborate at{" "}
          <span style={{ color: orange }}>Lightspeed.</span>
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: "clamp(15px, 1.5vw, 17px)", fontWeight: 400, lineHeight: 1.72,
          color: textSub, maxWidth: 480, marginBottom: 44,
          ...slide(heroIn, 240),
        }}>
          The infinite canvas for high-performance design teams. Real-time sync, zero friction, ship faster than ever.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", ...slide(heroIn, 360) }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: orange, color: "#fff", border: "none",
              padding: "0 28px", height: 48, borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 24px rgba(249,115,22,0.28)",
              transition: "all 0.22s ease",
              letterSpacing: "-0.2px",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(249,115,22,0.40)"; e.currentTarget.style.background = "#ea6d0a"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(249,115,22,0.28)"; e.currentTarget.style.background = orange; }}
          >
            Start for free <ArrowRight size={16} strokeWidth={2.5} />
          </button>
          <button style={{
            background: "transparent", color: textMid,
            border: `1px solid ${border}`,
            padding: "0 24px", height: 48, borderRadius: 10,
            fontSize: 15, fontWeight: 500, cursor: "pointer",
            transition: "border-color 0.18s, color 0.18s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)"; e.currentTarget.style.color = text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMid; }}
          >
            See how it works
          </button>
        </div>

        {/* Social proof */}
        <p style={{
          marginTop: 52, fontSize: 12, color: textSub,
          letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase",
          ...slide(heroIn, 480),
        }}>
          Trusted by 40,000+ teams worldwide
        </p>

        {/* Scroll hint */}
        <div style={{
          position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center",
          opacity: heroIn ? 0.28 : 0, transition: "opacity 1.2s 1.4s",
        }}>
          <div style={{ width: 18, height: 30, border: `1.5px solid ${textMid}`, borderRadius: 12, display: "flex", justifyContent: "center", paddingTop: 5 }}>
            <div style={{ width: 2.5, height: 7, background: textMid, borderRadius: 3, animation: "scrollDot 1.8s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{
        borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`,
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        maxWidth: 840, margin: "0 auto",
      }}>
        {[
          { val: 40000, suffix: "+",  label: "Teams worldwide" },
          { val: 99,    suffix: ".9%",label: "Uptime SLA" },
          { val: 8,     suffix: "ms", label: "Sync latency" },
          { val: 4,     suffix: "M+", label: "Boards created" },
        ].map(({ val, suffix, label }, i) => (
          <div key={i} style={{
            textAlign: "center", padding: "36px 16px",
            borderRight: i < 3 ? `1px solid ${border}` : "none",
            ...slide(statsIn, i * 80),
          }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em", color: text }}>
              <Counter to={val} suffix={suffix} />
            </div>
            <div style={{ fontSize: 12, color: textSub, marginTop: 6, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section id="features" ref={featRef} style={{ maxWidth: 1040, margin: "0 auto", padding: "96px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 56, ...slide(featIn, 0) }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: orange, marginBottom: 14, textTransform: "uppercase" }}>Why teams choose Sketchly</p>
          <h2 style={{ fontSize: "clamp(26px, 3.2vw, 42px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, color: text }}>
            Everything your team needs.{" "}
            <span style={{ color: textSub }}>Nothing it doesn't.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="fcard" style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 14, padding: "26px 22px",
              ...slide(featIn, 80 + i * 70),
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = orangeBorder; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                background: orangeDim, border: `1px solid ${orangeBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <Icon size={17} color={orange} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 7, letterSpacing: "-0.2px" }}>{title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: textSub }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CANVAS MOCKUP ── */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "0 40px 96px" }}>
        <div style={{
          border: `1px solid ${border}`, borderRadius: 16,
          overflow: "hidden", background: surface,
          aspectRatio: "16/8", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <defs>
              <pattern id="g" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)" />
          </svg>

          {[
            { left: "11%", top: "17%", color: orange,    label: "User flow v3" },
            { left: "32%", top: "46%", color: "#22c55e", label: "Auth screen" },
            { left: "55%", top: "20%", color: "#3b82f6", label: "Onboarding" },
            { left: "70%", top: "52%", color: "#f43f5e", label: "Design system" },
          ].map(({ left, top, color, label }) => (
            <div key={label} style={{
              position: "absolute", left, top,
              background: color + (isDark ? "22" : "18"),
              border: `1px solid ${color}44`,
              borderRadius: 8, padding: "7px 13px",
              fontSize: 11, color, fontWeight: 600,
            }}>{label}</div>
          ))}

          <div style={{ position: "absolute", left: "44%", top: "63%", display: "flex", alignItems: "flex-start", gap: 5, pointerEvents: "none" }}>
            <svg width="13" height="16" viewBox="0 0 13 16" fill="none"><path d="M1 1l9 9H5.5l2.5 5.5-1.5.5L4 11v4.5H1V1z" fill={orange} /></svg>
            <div style={{ background: orange, borderRadius: "4px 4px 4px 0", padding: "2px 8px", fontSize: 10, color: "#fff", marginTop: -2, fontWeight: 600 }}>Alex</div>
          </div>

          <span style={{ position: "relative", fontSize: 12, color: textSub, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
            Live canvas preview
          </span>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" ref={planRef} style={{ maxWidth: 1040, margin: "0 auto", padding: "0 40px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 52, ...slide(planIn, 0) }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: orange, marginBottom: 14, textTransform: "uppercase" }}>Pricing</p>
          <h2 style={{ fontSize: "clamp(26px, 3.2vw, 42px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, color: text }}>
            Simple, transparent pricing.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {PLANS.map(({ name, price, perks, featured }, i) => (
            <div key={name} style={{
              background: featured ? orange : surface,
              border: `1px solid ${featured ? orange : border}`,
              borderRadius: 14, padding: "30px 26px",
              position: "relative",
              ...slide(planIn, 80 + i * 80),
            }}>
              {featured && (
                <div style={{
                  position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                  background: "#fff", color: orange, fontSize: 10, fontWeight: 800,
                  padding: "3px 12px", borderRadius: 100, letterSpacing: "0.06em",
                  textTransform: "uppercase", whiteSpace: "nowrap",
                }}>Most popular</div>
              )}
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: featured ? "rgba(255,255,255,0.7)" : textSub, marginBottom: 8 }}>{name}</p>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", color: featured ? "#fff" : text, marginBottom: 4 }}>
                {price}
                {price !== "Free" && price !== "Custom" && (
                  <span style={{ fontSize: 13, fontWeight: 500, color: featured ? "rgba(255,255,255,0.65)" : textSub }}>/mo</span>
                )}
              </div>
              <div style={{ height: 1, background: featured ? "rgba(255,255,255,0.2)" : border, margin: "18px 0" }} />
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {perks.map(p => (
                  <li key={p} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13, color: featured ? "rgba(255,255,255,0.88)" : textMid }}>
                    <Check size={13} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2, color: featured ? "#fff" : orange }} />
                    {p}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  width: "100%", marginTop: 26, height: 40, borderRadius: 9,
                  border: featured ? "1.5px solid rgba(255,255,255,0.45)" : `1px solid ${border}`,
                  background: featured ? "rgba(255,255,255,0.12)" : "transparent",
                  color: featured ? "#fff" : text,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  transition: "background 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = featured ? "rgba(255,255,255,0.22)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"); }}
                onMouseLeave={e => { e.currentTarget.style.background = featured ? "rgba(255,255,255,0.12)" : "transparent"; }}
              >
                Get started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section ref={ctaRef} style={{
        borderTop: `1px solid ${border}`,
        padding: "96px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 500, height: 300, borderRadius: "50%",
          background: isDark
            ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(249,115,22,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <h2 style={{ fontSize: "clamp(28px, 3.8vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16, color: text, ...slide(ctaIn, 0) }}>
          Your team is waiting.
        </h2>
        <p style={{ color: textSub, fontSize: 16, fontWeight: 400, marginBottom: 40, ...slide(ctaIn, 120) }}>
          Free forever for small teams. No credit card required.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: orange, color: "#fff", border: "none",
            padding: "0 34px", height: 52, borderRadius: 10,
            fontSize: 16, fontWeight: 700, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 28px rgba(249,115,22,0.32)",
            transition: "all 0.22s ease",
            ...slide(ctaIn, 240),
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(249,115,22,0.45)"; e.currentTarget.style.background = "#ea6d0a"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 28px rgba(249,115,22,0.32)"; e.currentTarget.style.background = orange; }}
        >
          Get started — it's free <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `1px solid ${border}`,
        padding: "22px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 15, color: text }}>
          <BrainCircuit size={15} color={orange} strokeWidth={2.2} /> Sketchly
        </div>
        <p style={{ fontSize: 12, color: textSub }}>© 2025 Sketchly Inc. All rights reserved.</p>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Status"].map(l => (
            <a key={l} href="#" className="footlink">{l}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}