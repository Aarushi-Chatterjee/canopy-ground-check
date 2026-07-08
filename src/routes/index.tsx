import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: Canopy,
});

type Answers = {
  role: string;
  domains: string[];
  powers: string[];
  firstLook: string;
  barriers: string[];
  buildCall: number;
  matching: number;
  blog: number;
  launch: string;
  pay: string;
  wish: string;
  email: string;
};

const initial: Answers = {
  role: "",
  domains: [],
  powers: [],
  firstLook: "",
  barriers: [],
  buildCall: 5,
  matching: 5,
  blog: 5,
  launch: "",
  pay: "",
  wish: "",
  email: "",
};

const roles = [
  "🧠 AI/ML Researcher",
  "🛠️ Engineer / Developer",
  "🔌 Hardware Engineer",
  "🌍 Domain Expert",
  "🚀 Founder",
  "🎨 Designer / Product",
  "📢 Advocate / Policy",
  "👀 Exploring",
];
const domainOpts = [
  "⚡ Energy", "💧 Water", "🌊 Ocean", "🐝 Biodiversity",
  "🌫️ Carbon / Climate", "♻️ Circular Economy", "🌾 Agriculture", "🏙️ Urban / Smart Cities",
];
const powerOpts = [
  "📷 Computer Vision / Satellite", "💬 NLP", "📈 Time-series",
  "🎮 Reinforcement Learning", "📡 Edge / IoT", "🗃️ Data Engineering", "✨ Other",
];
const firstLookOpts = [
  "💼 LinkedIn", "🎓 University network", "💻 Hackathons",
  "🌐 Existing communities", "🧘 I build alone", "😕 I don't know where to start",
];
const barrierOpts = [
  "🧩 Can't find the right people", "📚 Lack of domain expertise",
  "📋 No interesting project briefs", "⏳ Side-project inertia",
  "💰 No funding", "🌑 Imposter syndrome",
];
const launchOpts = [
  "🚀 Sign up & post a Build Call", "👀 Join and browse",
  "🆓 Join only if free", "⏳ Wait for others", "❌ Wouldn't join",
];
const payOpts = [
  "💳 Monthly sub (~$10-20)", "🎯 One-time success fee",
  "🤝 Sponsored access (companies pay, not me)", "🆓 Must be free",
];

// Domain → accent color map (matches CANOPY brand palette)
const domainColorMap: Record<string, { from: string; mid: string; to: string }> = {
  "⚡ Energy":          { from: "#f2b950", mid: "#c4654a", to: "#4a6741" },
  "🌊 Ocean":           { from: "#5ec4e3", mid: "#3b8fbf", to: "#0d3a52" },
  "🐝 Biodiversity":    { from: "#3bf0a4", mid: "#28a870", to: "#0d4a2e" },
  "🌫️ Carbon / Climate": { from: "#8da389", mid: "#5a7a56", to: "#2b3d2a" },
  "♻️ Circular Economy": { from: "#c084fc", mid: "#8b5cf6", to: "#3b1f6a" },
  "🏙️ Urban / Smart Cities": { from: "#e2a76f", mid: "#b07344", to: "#4a3020" },
  "🌾 Agriculture":     { from: "#a3c95a", mid: "#6a9a28", to: "#2e4210" },
  "💧 Water":           { from: "#3b82f6", mid: "#1d5fb8", to: "#0a2456" },
};

type ComingSoon = { title: string; emoji: string; body: string } | null;

function Canopy() {
  const [stage, setStage] = useState(0); // 0 landing, 1..5 questions, 6 result
  const [a, setA] = useState<Answers>(initial);
  const [soon, setSoon] = useState<ComingSoon>(null);
  const [earlyOpen, setEarlyOpen] = useState(false);
  const [earlyEmail, setEarlyEmail] = useState("");
  const [earlySubmitted, setEarlySubmitted] = useState(false);
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) =>
    setA((p) => ({ ...p, [k]: v }));
  const toggle = (k: "domains" | "powers" | "barriers", v: string, cap?: number) =>
    setA((p) => {
      const cur = p[k];
      if (cur.includes(v)) return { ...p, [k]: cur.filter((x) => x !== v) };
      if (cap && cur.length >= cap) return p; // silently block; UI shows cap indicator
      return { ...p, [k]: [...cur, v] };
    });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ComingSoon;
      if (detail) setSoon(detail);
    };
    window.addEventListener("canopy:soon", handler);
    return () => window.removeEventListener("canopy:soon", handler);
  }, []);

  const totalStages = 5;
  const progress = Math.min(stage, totalStages) / totalStages;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground grain-bg">
      <BackgroundArt />
      <Nav
        onGroundCheck={() => setStage(1)}
        onEarlyAccess={() => { setEarlyOpen(true); setEarlySubmitted(false); setEarlyEmail(""); }}
      />
      {soon && <ComingSoonModal data={soon} onClose={() => setSoon(null)} />}
      {earlyOpen && (
        <EarlyAccessModal
          email={earlyEmail}
          onEmailChange={setEarlyEmail}
          submitted={earlySubmitted}
          onSubmit={() => {
            try { localStorage.setItem("canopy_early_access_email", earlyEmail); } catch { /* noop */ }
            setEarlySubmitted(true);
          }}
          onClose={() => setEarlyOpen(false)}
        />
      )}

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 pb-24 pt-6 md:px-10">
        {stage === 0 && <Landing onStart={() => setStage(1)} />}
        {stage > 0 && stage < 6 && (
          <div className="mx-auto mt-8 max-w-3xl">
            <ProgressBar value={progress} stage={stage} />
            <div key={stage} className="animate-fade-up mt-8 rounded-3xl border-2 border-border/70 bg-card/80 p-6 shadow-[0_20px_60px_-20px_rgba(74,103,65,0.25)] backdrop-blur-sm md:p-10">
              {stage === 1 && (
                <Step
                  eyebrow="Step 01 · Roots"
                  title="🧰 What's in your toolbelt?"
                  subtitle="Tell us who's digging."
                  onNext={() => setStage(2)}
                  canNext={!!a.role}
                >
                  <Field label="Your role">
                    <Chips options={roles} value={[a.role]} onPick={(v) => set("role", v)} />
                  </Field>
                  <Field label="Domain you care about (pick all that apply)">
                    <Chips options={domainOpts} value={a.domains} multi onPick={(v) => toggle("domains", v)} />
                  </Field>
                  <Field label="Your AI superpowers">
                    <Chips options={powerOpts} value={a.powers} multi onPick={(v) => toggle("powers", v)} />
                  </Field>
                </Step>
              )}
              {stage === 2 && (
                <Step
                  eyebrow="Step 02 · Terrain"
                  title="🕳️ Where do you usually dig?"
                  subtitle="Your collaboration habits."
                  onBack={() => setStage(1)}
                  onNext={() => setStage(3)}
                  canNext={!!a.firstLook}
                >
                  <Field label="When you have an idea, where do you first look for a collaborator?">
                    <Chips options={firstLookOpts} value={[a.firstLook]} onPick={(v) => set("firstLook", v)} />
                  </Field>
                  <Field label="Biggest barrier? (pick top 2)">
                    <Chips options={barrierOpts} value={a.barriers} multi onPick={(v) => toggle("barriers", v, 2)} />
                    <p className={`mt-2 text-xs font-mono transition-colors ${
                      a.barriers.length >= 2 ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}>
                      {a.barriers.length}/2 selected{a.barriers.length >= 2 ? " — limit reached" : ""}
                    </p>
                  </Field>
                </Step>
              )}
              {stage === 3 && (
                <Step
                  eyebrow="Step 03 · Soil test"
                  title="🌱 Test the soil"
                  subtitle="How would you use a CANOPY sandbox?"
                  onBack={() => setStage(2)}
                  onNext={() => setStage(4)}
                  canNext
                >
                  <SliderRow
                    q={`Would you respond to a "Build Call" – a short request like "Need a PyTorch expert for 3 weeks to finish a deforestation tracker"?`}
                    left="😴 Not likely" right="🤩 Very likely"
                    value={a.buildCall} onChange={(v) => set("buildCall", v)}
                  />
                  <SliderRow
                    q="How interested are you in a smart matching system that pairs you with collaborators (co-founder style, not Tinder)?"
                    left="No need" right="I'd pay for this"
                    value={a.matching} onChange={(v) => set("matching", v)}
                  />
                  <SliderRow
                    q="Would you read & contribute to a blog of real AI × sustainability impact stories and open lab notebooks?"
                    left="Not my thing" right="I'd love to write"
                    value={a.blog} onChange={(v) => set("blog", v)}
                  />
                </Step>
              )}
              {stage === 4 && (
                <Step
                  eyebrow="Step 04 · Water"
                  title="💧 Water the seed"
                  subtitle="Your honest commitment level."
                  onBack={() => setStage(3)}
                  onNext={() => setStage(5)}
                  canNext={!!a.launch}
                >
                  <Field label="If CANOPY launched in beta next month, what would you do?">
                    <Chips options={launchOpts} value={[a.launch]} onPick={(v) => set("launch", v)} />
                  </Field>
                  <Field label="Would you pay for premium features (unlimited matching, project rooms) if it helped land a co-founder or climate-tech job?">
                    <Chips options={payOpts} value={[a.pay]} onPick={(v) => set("pay", v)} />
                  </Field>
                </Step>
              )}
              {stage === 5 && (
                <Step
                  eyebrow="Step 05 · Magic wand"
                  title="🧞 Magic wand"
                  subtitle="One wish for CANOPY."
                  onBack={() => setStage(4)}
                  onNext={() => setStage(6)}
                  canNext
                  nextLabel="🌳 Plant my answers"
                >
                  <Field label="If you had a magic wand, what would you change about building AI × sustainability projects today?">
                    <textarea
                      rows={4}
                      value={a.wish}
                      onChange={(e) => set("wish", e.target.value)}
                      placeholder="One sentence is enough…"
                      className="w-full rounded-2xl border-2 border-border bg-background/60 p-4 font-body text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                  </Field>
                  <Field label="Leave your email to get a personalised preview when CANOPY opens.">
                    <input
                      type="email"
                      value={a.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border-2 border-border bg-background/60 p-4 font-body text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                  </Field>
                </Step>
              )}
            </div>
          </div>
        )}
        {stage === 6 && <Result answers={a} onRestart={() => { setA(initial); setStage(0); }} />}
      </div>

      <Footer />
    </main>
  );
}

/* ---------- LANDING ---------- */

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pt-8 md:pt-12">

        {/* Tag row */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-secondary/40 bg-card/70 px-4 py-1.5 text-sm text-secondary backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Ground Check
          </span>
          <span className="rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            AI × Sustainability sandbox
          </span>
        </div>

        {/* ── DESKTOP: true two-column side-by-side ── */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8 md:items-start">

          {/* LEFT: headline + body + CTA */}
          <div className="md:col-span-5 flex flex-col">
            <h1 className="text-display text-[clamp(2rem,5.5vw,5.5rem)] leading-[0.93]">
              <span className="block text-foreground">PLANT</span>
              <span className="-mt-1 block text-primary sm:-mt-2 sm:translate-x-6 md:translate-x-10">A SEED</span>
              <span className="-mt-1 block text-foreground sm:-mt-2 sm:translate-x-1 md:translate-x-2">
                IN THE <em className="not-italic text-secondary">CANOPY.</em>
              </span>
            </h1>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground md:text-lg">
              Developers. ML engineers. AI researchers. Designers. Domain experts.
              If you're quietly trying to point AI at the planet's hardest problems
              — we have a 3-minute question that could shape something real.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={onStart}
                className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-[0_10px_30px_-10px] shadow-primary/60 transition hover:-translate-y-0.5 hover:shadow-primary/80"
              >
                <span className="text-display tracking-wide">START THE GROUND CHECK</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-foreground/15 transition group-hover:translate-x-1">→</span>
              </button>
              <span className="text-sm text-muted-foreground">~3 min · 5 stages</span>
            </div>
          </div>

          {/* RIGHT: card collage — starts at same top as headline */}
          <div className="md:col-span-7 relative h-full min-h-[420px]">
            {/* Hypothesis card — top left of the right column, slight tilt */}
            <div className="absolute top-0 left-0 w-[55%] -rotate-[2deg] z-20 transition-transform hover:-rotate-[0.5deg]">
              <HypothesisCard />
            </div>
            {/* Seed card — top right, counter-tilted */}
            <div className="absolute top-0 right-0 w-[38%] rotate-[4deg] z-10 transition-transform hover:rotate-[2deg]">
              <SeedCard />
            </div>
            {/* Canopy card — bottom center, slight positive tilt */}
            <div className="absolute bottom-0 left-[20%] w-[55%] rotate-[2deg] z-30 transition-transform hover:rotate-[0.5deg]">
              <div className="rounded-3xl border-2 border-secondary bg-secondary p-6 text-secondary-foreground shadow-[0_20px_60px_-20px_rgba(74,103,65,0.4)]">
                <div className="text-3xl">🌱</div>
                <div className="text-display mt-3 text-2xl leading-tight">A canopy, not a feed.</div>
                <div className="mt-2 text-sm opacity-85">
                  No dopamine loops. Just briefs, project rooms, and the small joy of
                  finding the one collaborator who gets it.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE: vertical stack ── */}
        <div className="flex flex-col gap-6 md:hidden">
          <h1 className="text-display text-[clamp(2.5rem,12vw,5rem)] leading-[0.93]">
            <span className="block text-foreground">PLANT</span>
            <span className="-mt-1 block text-primary sm:translate-x-6">A SEED</span>
            <span className="-mt-1 block text-foreground sm:translate-x-1">
              IN THE <em className="not-italic text-secondary">CANOPY.</em>
            </span>
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Developers. ML engineers. AI researchers. Designers. Domain experts.
            If you're quietly trying to point AI at the planet's hardest problems
            — we have a 3-minute question that could shape something real.
          </p>
          <div className="w-full">
            <HypothesisCard />
          </div>
          <div className="flex justify-center w-full">
            <SeedCard />
          </div>
          <div className="w-full">
            <div className="rounded-3xl border-2 border-secondary bg-secondary p-6 text-secondary-foreground shadow-[0_20px_60px_-20px_rgba(74,103,65,0.4)]">
              <div className="text-3xl">🌱</div>
              <div className="text-display mt-3 text-2xl leading-tight">A canopy, not a feed.</div>
              <div className="mt-2 text-sm opacity-85">
                No dopamine loops. Just briefs, project rooms, and the small joy of
                finding the one collaborator who gets it.
              </div>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-3">
            <button
              onClick={onStart}
              className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-[0_10px_30px_-10px] shadow-primary/60 transition hover:-translate-y-0.5 hover:shadow-primary/80"
            >
              <span className="text-display tracking-wide">START THE GROUND CHECK</span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-foreground/15 transition group-hover:translate-x-1">→</span>
            </button>
            <span className="text-center text-sm text-muted-foreground">~3 min · 5 stages</span>
          </div>
        </div>

        {/* Marquee ticker */}
        <div className="mt-8 overflow-hidden rounded-3xl border-2 border-border bg-card/60 py-3 backdrop-blur">
          <div className="animate-marquee flex w-max gap-8 whitespace-nowrap text-sm font-semibold md:text-base">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-8">
                {[
                  "🌊 Ocean ML", "🐝 Pollinator vision", "⚡ Grid RL",
                  "🌾 Soil NLP", "🛰️ Deforestation tracking", "♻️ Circular LLMs",
                  "💧 Water quality edge", "🏙️ Urban digital twin",
                  "🌫️ Carbon accounting", "🔥 Wildfire prediction",
                ].map((t) => (
                  <span key={t} className="text-muted-foreground">
                    {t} <span className="text-primary">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function SeedCard() {
  return (
    <div className="animate-float-slow w-full max-w-[16rem] overflow-hidden rounded-3xl border-2 border-primary/40 bg-card p-5 shadow-[0_20px_60px_-20px_rgba(196,101,74,0.6)]">
      <div className="flex items-center justify-between">
        <div className="text-display text-xl text-primary">SEED · 001</div>
        <span className="text-2xl">🌰</span>
      </div>
      <div className="mt-4 h-32 rounded-2xl bg-gradient-to-br from-accent via-clay to-primary/70" />
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Depth</span>
        <span className="font-mono text-foreground">03 cm</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 rounded-full bg-primary" />
      </div>
    </div>
  );
}

function HypothesisCard() {
  return (
    <div className="group relative overflow-hidden rounded-3xl border-2 border-purple-500 bg-card p-6 shadow-[0_20px_60px_-20px_rgba(168,85,247,0.25)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_-20px_rgba(168,85,247,0.45)] sm:p-8">
      {/* Ambient glow that sharpens on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 ring-1 ring-inset ring-purple-500/25 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="text-4xl">🧪</div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          3–5 min
        </span>
      </div>

      <div className="text-display mt-5 text-2xl leading-tight text-foreground sm:text-3xl">
        We’re testing a hypothesis.
      </div>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
        Before we build a community for AI builders tackling climate and
        sustainability — we want to know if people like{" "}
        <em className="not-italic font-semibold text-foreground">you</em> actually want it.
        Every response directly shapes what gets built.
      </p>
    </div>
  );
}


// TinyCard removed — was dead code (defined but never rendered)

/* ---------- BACKGROUND ART ---------- */

function BackgroundArt() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-[420px] h-[28rem] w-[28rem] rounded-full bg-secondary/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      {/* floating leaves */}
      <div aria-hidden className="animate-float-med pointer-events-none absolute left-[8%] top-24 text-4xl opacity-60">🌿</div>
      <div aria-hidden className="animate-float-slow pointer-events-none absolute right-[12%] top-[38%] text-3xl opacity-50">🍃</div>
      <div aria-hidden className="animate-float-med pointer-events-none absolute left-[45%] bottom-[8%] text-3xl opacity-40">🌾</div>
    </>
  );
}

/* ---------- COMING SOON ---------- */

const soonInfo: Record<string, { title: string; emoji: string; body: string }> = {
  manifesto: {
    emoji: "📜",
    title: "The Manifesto",
    body: "Why slow, on-purpose AI for a livable planet. A short essay laying out CANOPY's principles, who it's for, and what it refuses to be. Publishing with the beta.",
  },
  builds: {
    emoji: "📣",
    title: "Build Calls",
    body: "Short, real requests from teams: \"Need a PyTorch expert for 3 weeks to ship a deforestation tracker.\" Small commitments, big signals. Opens with the beta.",
  },
  notebooks: {
    emoji: "📓",
    title: "Open Notebooks",
    body: "Impact stories and lab notes from AI × sustainability projects that actually shipped — code, data, and what went wrong. First drop with launch.",
  },
  early: {
    emoji: "🌳",
    title: "Early Access",
    body: "The greenhouse isn't open yet. Finish the Ground Check and we'll water your seed the moment CANOPY opens.",
  },
  share: {
    emoji: "🌱",
    title: "Share Your Seed",
    body: "Shareable seed cards are being planted — you'll be able to post your result to LinkedIn once the canopy opens.",
  },
  social: {
    emoji: "💼",
    title: "LinkedIn",
    body: "Follow CANOPY on LinkedIn when the canopy opens — we'll post impact stories, Build Call results, and Sprint Zero findings there first.",
  },
};

function openSoon(key: keyof typeof soonInfo) {
  window.dispatchEvent(new CustomEvent("canopy:soon", { detail: soonInfo[key] }));
}

function ComingSoonModal({
  data, onClose,
}: { data: { title: string; emoji: string; body: string }; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-up">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]">
        <div className="flex items-start justify-between gap-4">
          <div className="text-5xl">{data.emoji}</div>
          <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Coming soon
          </span>
        </div>
        <h3 className="text-display mt-4 text-3xl">{data.title}</h3>
        <p className="mt-3 text-muted-foreground">{data.body}</p>
        <button
          autoFocus
          onClick={onClose}
          className="text-display mt-6 w-full rounded-full bg-foreground py-3 text-sm tracking-wide text-background transition hover:bg-primary"
        >
          Got it →
        </button>
      </div>
    </div>
  );
}

/* ---------- EARLY ACCESS MODAL ---------- */

function EarlyAccessModal({
  email, onEmailChange, submitted, onSubmit, onClose,
}: {
  email: string;
  onEmailChange: (v: string) => void;
  submitted: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-up">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]">
        {!submitted ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="text-5xl">🌳</div>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                Early access
              </span>
            </div>
            <h3 className="text-display mt-4 text-3xl">Get early access</h3>
            <p className="mt-3 text-muted-foreground">
              Leave your email — we'll water your seed the moment CANOPY opens.
            </p>
            {/* Formspree honeypot — invisible to users, traps bots */}
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <input
              autoFocus
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@example.com"
              className="mt-5 w-full rounded-2xl border-2 border-border bg-background/60 p-4 font-body text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            <button
              onClick={onSubmit}
              disabled={!email || !email.includes("@")}
              className="text-display mt-4 w-full rounded-full bg-primary py-3 text-sm tracking-wide text-primary-foreground shadow-[0_10px_30px_-10px] shadow-primary/50 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Plant me in →
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full rounded-full py-2 text-xs text-muted-foreground transition hover:text-foreground"
            >
              Maybe later
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl">🌱</div>
            <h3 className="text-display mt-4 text-3xl">You're in the canopy.</h3>
            <p className="mt-3 text-muted-foreground">
              We'll reach out at{" "}
              <span className="font-semibold text-foreground">{email}</span>{" "}
              when the greenhouse opens.
            </p>
            <button
              autoFocus
              onClick={onClose}
              className="text-display mt-6 w-full rounded-full bg-foreground py-3 text-sm tracking-wide text-background transition hover:bg-primary"
            >
              Got it →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- NAV & FOOTER ---------- */

function Nav({ onGroundCheck, onEarlyAccess }: { onGroundCheck: () => void; onEarlyAccess: () => void }) {
  const link = "transition hover:text-foreground cursor-pointer";
  return (
    <header className="relative z-20 mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 pt-6 md:px-10">
      <div className="flex items-center gap-2">
        <div
          aria-label="CANOPY home"
          className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background"
        >🌳</div>
        <span className="text-display text-2xl tracking-tight">CANOPY</span>
      </div>
      <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
        <button className={link} onClick={() => openSoon("manifesto")}>Manifesto</button>
        <button className={link} onClick={() => openSoon("builds")}>Build Calls</button>
        <button className={link} onClick={() => openSoon("notebooks")}>Notebooks</button>
        {/* Ground Check — discoverable nav entry point */}
        <button
          onClick={onGroundCheck}
          className="inline-flex items-center gap-2 rounded-full border-2 border-secondary/40 bg-card/70 px-4 py-1.5 text-secondary backdrop-blur transition hover:border-secondary hover:bg-secondary/10"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Ground Check
        </button>
      </nav>
      {/* Right-side CTA cluster */}
      <div className="flex items-center gap-2">
        {/* Mobile-only Start button — Ground Check hidden in md nav */}
        <button
          onClick={onGroundCheck}
          aria-label="Start Ground Check"
          className="inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-card/70 px-3 py-1.5 text-xs font-semibold text-secondary backdrop-blur transition hover:bg-secondary/10 md:hidden"
        >
          Start →
        </button>
        <button
          onClick={onEarlyAccess}
          className="rounded-full border-2 border-foreground bg-background px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-foreground transition hover:bg-foreground hover:text-background"
        >
          Early access
        </button>
      </div>
    </header>
  );
}

function Footer() {
  const link = "transition hover:text-foreground cursor-pointer";
  return (
    <footer className="relative z-10 mx-auto mt-16 max-w-[1400px] border-t border-border/60 px-4 sm:px-6 py-8 text-sm text-muted-foreground md:px-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>© CANOPY · Growing slowly, on purpose.</div>
        <div className="flex gap-5">
          <button className={link} onClick={() => openSoon("social")}>LinkedIn</button>
          <button className={link} onClick={() => openSoon("social")}>GitHub</button>
          <button className={link} onClick={() => openSoon("social")}>Contact</button>
        </div>
      </div>
    </footer>
  );
}

/* ---------- QUESTIONNAIRE PARTS ---------- */

function ProgressBar({ value, stage }: { value: number; stage: number }) {
  const growth = ["🌰", "🌱", "🌿", "🪴", "🌳", "🌳"];
  return (
    <div className="mx-auto flex w-fit items-center gap-4 rounded-full border-2 border-border bg-card/70 px-5 py-2.5 backdrop-blur">
      <span className="text-2xl transition-transform duration-500" style={{ transform: `scale(${1 + stage * 0.06}) rotate(${(stage - 1) * 4}deg)` }}>
        {growth[stage] ?? "🌰"}
      </span>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={
              "h-2 rounded-full transition-all duration-300 " +
              (n < stage
                ? "w-2 bg-secondary"
                : n === stage
                ? "w-8 bg-primary shadow-[0_0_10px] shadow-primary/60"
                : "w-2 bg-muted-foreground/30")
            }
          />
        ))}
      </div>
      <span className="text-display text-sm text-muted-foreground">
        0{Math.min(stage, 5)}<span className="opacity-40">/05</span>
      </span>
      <span className="sr-only">{Math.round(value * 100)}% complete</span>
    </div>
  );
}

function Step({
  eyebrow, title, subtitle, children, onBack, onNext, canNext, nextLabel,
}: {
  eyebrow: string; title: string; subtitle: string; children: React.ReactNode;
  onBack?: () => void; onNext?: () => void; canNext?: boolean; nextLabel?: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{eyebrow}</div>
      <h2 className="text-display mt-2 text-3xl sm:text-4xl md:text-5xl">{title}</h2>
      <p className="mt-2 text-sm sm:text-base text-muted-foreground">{subtitle}</p>
      <div className="mt-6 space-y-2">{children}</div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        {onBack ? (
          <button onClick={onBack} className="rounded-full border-2 border-border bg-background px-4 sm:px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground">
            ← Back
          </button>
        ) : <span />}
        <button
          onClick={onNext}
          disabled={!canNext}
          className="text-display inline-flex items-center gap-2 rounded-full bg-foreground px-5 sm:px-6 py-3 text-sm tracking-wide text-background transition hover:-translate-y-0.5 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel ?? "Continue →"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="mb-3 text-sm font-semibold text-foreground">{label}</div>
      {children}
    </div>
  );
}

function Chips({
  options, value, onPick, multi,
}: { options: string[]; value: string[]; onPick: (v: string) => void; multi?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onPick(opt)}
            aria-pressed={active}
            className={
              "rounded-full border-2 px-4 py-2 text-sm transition active:scale-95 " +
              (active
                ? "scale-[1.03] border-primary bg-primary text-primary-foreground shadow-[0_6px_20px_-6px] shadow-primary/60"
                : "border-border bg-background/60 text-foreground hover:border-primary hover:bg-primary/5")
            }
          >
            {opt}
          </button>
        );
      })}
      {multi && <span className="w-full text-xs text-muted-foreground">Pick more than one</span>}
    </div>
  );
}

function SliderRow({
  q, left, right, value, onChange,
}: { q: string; left: string; right: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-5 rounded-2xl border border-border bg-background/40 p-4 sm:p-5">
      <div className="text-sm font-medium leading-snug">{q}</div>
      <input
        type="range" min={0} max={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={q}
        aria-valuenow={value}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-muted via-accent to-primary accent-primary"
      />
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="max-w-[40%] leading-tight">{left}</span>
        <span className="text-display shrink-0 text-primary">{value}</span>
        <span className="max-w-[40%] text-right leading-tight">{right}</span>
      </div>
    </div>
  );
}

/* ---------- RESULT ---------- */

// --- personalised summary helper ---
function buildSummary(answers: Answers): { headline: string; lines: string[] } {
  const dom = answers.domains[0] ?? "sustainability";
  const power = answers.powers[0] ?? "AI";
  const domLabel = dom.replace(/^[^\w]+/, "").trim(); // strip emoji
  const powerLabel = power.replace(/^[^\w]+/, "").trim();

  const lines: string[] = [];

  // Match persona
  if (answers.launch === "🚀 Sign up & post a Build Call") {
    lines.push(`You're ready to lead. Your Build Call is waiting — we'll flag you as a founder the moment CANOPY opens.`);
  } else if (answers.launch === "👀 Join and browse") {
    lines.push(`You're a scout first, builder second. We'll surface the most relevant Build Calls in ${domLabel} for you.`);
  } else if (answers.launch === "🆓 Join only if free") {
    lines.push(`Fair. CANOPY's core is free — we'll make sure you're in from day one.`);
  } else if (answers.launch === "⏳ Wait for others") {
    lines.push(`We get it — you want proof before committing. We'll send you Sprint Zero results so you can judge for yourself.`);
  }

  // Slider signal
  if (answers.buildCall >= 8) {
    lines.push(`Your enthusiasm for Build Calls is high (${answers.buildCall}/10) — we'll prioritise you for early matches.`);
  }
  if (answers.matching >= 8) {
    lines.push(`Smart matching is clearly important to you (${answers.matching}/10). That's the core bet of CANOPY.`);
  }

  // Barrier empathy
  if (answers.barriers.includes("🧩 Can't find the right people")) {
    lines.push(`Finding the right people is your biggest blocker — that's exactly the problem CANOPY is built to solve.`);
  }

  // Fallback
  if (lines.length === 0) {
    lines.push(`Based on your ${powerLabel} skills, you'd connect with ${domLabel} builders and a Build Call that needs exactly what you bring.`);
  }

  const headline = answers.domains.length > 0
    ? `Your seed is planted in the ${domLabel} layer of the canopy.`
    : `Your seed is planted.`;

  return { headline, lines };
}

function Result({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { headline, lines } = useMemo(() => buildSummary(answers), [answers]);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const submittedRef = useRef(false);

  // Persist to localStorage + POST to Formspree once when result screen mounts
  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      localStorage.setItem("canopy_ground_check", JSON.stringify({ answers, ts: Date.now() }));
    } catch { /* storage unavailable */ }

    const endpoint = import.meta.env["VITE_FORMSPREE_GROUND_CHECK"] as string | undefined;
    if (endpoint) {
      setSubmitState("submitting");
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...answers, _ts: new Date().toISOString() }),
      })
        .then((r) => setSubmitState(r.ok ? "done" : "error"))
        .catch(() => setSubmitState("error"));
    }
  }, [answers]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const size = 260; c.width = size * 2; c.height = size * 2; ctx.scale(2, 2);
    ctx.clearRect(0, 0, size, size);

    // Domain-mapped gradient colours
    const palette = domainColorMap[answers.domains[0]] ?? { from: "#e8a87c", mid: "#c4654a", to: "#4a6741" };
    const cx = size / 2, cy = size / 2;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, size / 2);
    grad.addColorStop(0, palette.from);
    grad.addColorStop(0.6, palette.mid);
    grad.addColorStop(1, palette.to);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, size / 2 - 6, 0, Math.PI * 2); ctx.fill();

    // Petals driven by number of domains + powers selected
    const petals = answers.domains.length + answers.powers.length + 3;
    for (let i = 0; i < petals; i++) {
      const t = (i / petals) * Math.PI * 2;
      const r = 40 + ((i * 13) % 40);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(t) * r, cy + Math.sin(t) * r, 10 + (i % 5) * 2, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,252,246,0.85)" : "rgba(74,103,65,0.75)";
      ctx.fill();
    }
    // Seed core
    ctx.fillStyle = "#2b1e17";
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
  }, [answers]);

  return (
    <section className="mx-auto mt-8 max-w-3xl animate-fade-up text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">Result</div>
      <h2 className="text-display mt-3 break-words text-3xl sm:text-4xl md:text-6xl">
        {headline.split(" ").slice(0, -3).join(" ")}{" "}
        <span className="text-primary">{headline.split(" ").slice(-3).join(" ")}</span>
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr] md:items-center md:text-left">
        <canvas
          ref={canvasRef}
          className="mx-auto max-w-full rounded-full shadow-[0_20px_60px_-20px_rgba(196,101,74,0.6)]"
          style={{ width: 260, height: 260 }}
        />
        <div>
          {/* Personalised lines */}
          <div className="space-y-3">
            {lines.map((line, i) => (
              <p key={i} className="text-base leading-relaxed text-foreground">{line}</p>
            ))}
          </div>
          {/* Submission status indicator */}
          {submitState === "submitting" && (
            <p className="mt-3 animate-pulse text-xs text-muted-foreground">🌱 Planting your answers…</p>
          )}
          {submitState === "done" && (
            <p className="mt-3 text-xs text-secondary">✅ Answers saved — see you in the canopy.</p>
          )}
          {submitState === "error" && (
            <p className="mt-3 text-xs text-muted-foreground">Couldn't save remotely — answers are stored locally.</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            We'll reach out when the canopy opens
            {answers.email ? (
              <> — at <span className="font-semibold text-foreground">{answers.email}</span></>
            ) : " — finish the form with your email to get first access"}.
            Thanks for digging with us.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={onRestart}
              className="rounded-full border-2 border-foreground bg-background px-5 py-3 text-sm font-semibold transition hover:bg-foreground hover:text-background"
            >
              🔄 Take again
            </button>
            <button
              onClick={() => openSoon("share")}
              className="text-display rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground shadow-[0_10px_30px_-10px] shadow-primary/60 transition hover:-translate-y-0.5"
            >
              SHARE YOUR SEED →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
