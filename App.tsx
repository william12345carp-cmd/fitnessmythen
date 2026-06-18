import React, { useState } from "react";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";
import { AIPresentation } from "./components/AIPresentation";
import { AdminPanel } from "./components/AdminPanel";
import confetti from "canvas-confetti";
import { 
  Dumbbell, 
  ChevronDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  BrainCircuit, 
  Flame,
  LayoutDashboard,
  Award,
  Shield,
  HelpCircle,
  Menu,
  X,
  Target,
  ArrowRight,
  BookOpen,
  Calendar,
  Lock
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"landing" | "admin">(() => {
    const p = window.location.pathname;
    const isUrlAdmin = p === "/admin" || p.endsWith("/admin") || window.location.hash === "#admin";
    return isUrlAdmin ? "admin" : "landing";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to transition back to public landing page and clear pathname from /admin
  const navigateToLanding = () => {
    setActiveTab("landing");
    if (window.location.pathname === "/admin" || window.location.pathname.endsWith("/admin")) {
      window.history.pushState({}, "", "/");
    }
  };

  // Route listener on mount
  React.useEffect(() => {
    const checkRoute = () => {
      const p = window.location.pathname;
      const isUrlAdmin = p === "/admin" || p.endsWith("/admin") || window.location.hash === "#admin";
      setActiveTab(isUrlAdmin ? "admin" : "landing");
    };

    window.addEventListener("popstate", checkRoute);
    window.addEventListener("hashchange", checkRoute);

    // Initial run in case of redirection delay
    checkRoute();

    return () => {
      window.removeEventListener("popstate", checkRoute);
      window.removeEventListener("hashchange", checkRoute);
    };
  }, []);

  // Force scroll-to-top and remove any hash in URL upon initial landing mount to ensure clean load
  React.useEffect(() => {
    const p = window.location.pathname;
    const isUrlAdmin = p === "/admin" || p.endsWith("/admin") || window.location.hash === "#admin";
    if (!isUrlAdmin) {
      if (typeof window !== "undefined") {
        if (window.history && "scrollRestoration" in window.history) {
          window.history.scrollRestoration = "manual";
        }
        
        // Remove hash from the address bar to keep it as "/"
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname || "/");
        }
        
        // Force scroll position to the top of the hero area
        window.scrollTo(0, 0);
        
        // Handle race conditions with browser layout painting
        const t1 = setTimeout(() => window.scrollTo(0, 0), 10);
        const t2 = setTimeout(() => window.scrollTo(0, 0), 100);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }
  }, []);

  // Redirect unauthorized users to landing page if they are not administrator
  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser && activeTab === "admin" && currentUser.email !== "william12345carp@gmail.com") {
        console.log("Nicht autorisierter Nutzer erkannt, logge aus und leite zur Landingpage um:", currentUser.email);
        try {
          await auth.signOut();
        } catch (err) {
          console.error("Fehler beim automatischen Abmelden:", err);
        }
        navigateToLanding();
      }
    });
    return () => unsub();
  }, [activeTab]);

  // Sign-Up registration states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  // Subpages / Footers modal states
  const [activeSubPage, setActiveSubPage] = useState<"impressum" | "datenschutz" | "kontakt" | null>(null);

  // Contact form States
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactCopied, setContactCopied] = useState(false);

  // Accordion active index for Sektion 5 (Wissensdatenbank)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Handles waitlist registration - fully optimized & lightning-fast
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitErr("Bitte gib deinen Vornamen an.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setSubmitErr("Bitte gib eine gültige E-Mail-Adresse an.");
      return;
    }

    // Immediately show "Fast geschafft..." in submit button
    setIsSubmitting(true);
    setSubmitErr("");

    try {
      console.log("STEP 1 Formular abgesendet");
      const nameVal = name.trim();
      const emailVal = email.trim().toLowerCase();

      console.log("STEP 2 Firestore Verbindung");

   // Save directly to the waitlist collection using a generated doc id
await setDoc(waitlistRef, {
  name: nameVal,
  email: emailVal,
  createdAt: serverTimestamp()
});

console.log("STEP 3 Firestore Speicherung erfolgreich");
      // Trigger premium confetti inside viewport
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.65 },
        colors: ["#ea580c", "#ffffff", "#121212"]
      });

      // Show final success message instantly on client
      console.log("STEP 4 Erfolgsmeldung angezeigt");
      setIsSuccess(true);
      setName("");
      setEmail("");
    } catch (err: any) {
      console.error("GENAUE FEHLERMELDUNG BEIM SPEICHERN:", err);
      // Extrahiere den genauen Firebase-Fehlercode (z.B. permission-denied, unavailable, etc.)
      const errorCode = err?.code || (err?.message && err.message.includes("permission-denied") ? "permission-denied" : null) || "unknown-error";
      const errMsg = err?.message || String(err);
      
      setSubmitErr(`Fehler (${errorCode}): ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FAQS = [
    {
      q: "Wie viel Protein brauche ich wirklich für den Muskelaufbau?",
      a: "Studien belegen einhellig: Eine Zufuhr von 1,6 bis 2,2 Gramm Protein pro Kilogramm Körpergewicht am Tag ist optimal für den Muskelaufbau. Mehr liefert selten messbare Zusatzvorteile; weniger bremst nachweislich die Synthese. Proteine sind die Bausteine deiner Muskeln — das Fortschritt System ermittelt deinen genauen Bedarf tagesaktuell basierend auf deinen Trainingsreizen."
    },
    {
      q: "Sind Kohlenhydrate am Abend schlecht oder machen sie dick?",
      a: "Ein reiner Fitness-Mythos! Kohlenhydrate machen weder morgens noch abends dick — entscheidend ist ausschließlich deine Energiebilanz (Kalorienüberschuss vs. Kaloriendefizit) über den gesamten Tag. Der Körper speichert Fett nicht, nur weil es dunkel ist. Für die Schlafqualität und Regeneration können Kohlenhydrate am Abend sogar förderlich sein!"
    },
    {
      q: "Ist Intervallfasten (16:8) effektiver für Fettverlust?",
      a: "Wissenschaftlich belegt: Nein. Intervallfasten führt nur dann zu Fettverlust, wenn du dadurch in ein Kaloriendefizit gelangst. In kontrollierten Vergleichsstudien gab es keinen Unterschied im Fettabbau zwischen Intervallfasten und einer normalen Mahlzeitenfrequenz bei gleicher Kalorienaufnahme. Fasten ist ein Werkzeug für das Zeitmanagement, kein physiologisches Fettverbrennungs-Wunder."
    },
    {
      q: "Welche Trainingsfrequenz ist optimal für Muskelwachstum?",
      a: "Die Meta-Analysen zeigen, dass eine Frequenz von 2-mal pro Woche pro Muskelgruppe bessere Hypertrophiereize setzt als ein reines 'Once-a-Week'-Pumpen (Split-Pläne, bei denen jeder Muskel nur einmal wöchentlich trainiert wird). Die Verteilung des Volumens erhöht die Effizienz des Muskelaufbaus. Genau diese Frequenzen integrieren wir in deine maßgeschneiderten Fortschrittspläne."
    }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-zinc-100 selection:bg-orange-500 selection:text-black font-sans">
      {/* Premium subtle light leaks */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/[0.04] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[35%] right-1/4 w-[600px] h-[600px] bg-orange-500/[0.02] rounded-full blur-[160px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#050505]/80 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <a 
                id="brand-logo-link"
                href="#hero" 
                onClick={() => { navigateToLanding(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 group"
              >
                <div className="bg-black text-orange-500 p-2 rounded-lg border border-zinc-800 relative overflow-hidden flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-base leading-tight tracking-wider text-white uppercase group-hover:text-orange-500 transition duration-300">
                    FORTSCHRITT SYSTEM
                  </h1>
                  <p className="text-[9px] uppercase tracking-widest font-mono text-zinc-500 -mt-0.5">
                    BY FITNESS MYTHEN
                  </p>
                </div>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider">
              <a 
                id="nav-link-problem"
                href="#problem" 
                onClick={() => navigateToLanding()}
                className="text-zinc-400 hover:text-white transition"
              >
                Das Problem
              </a>
              <a 
                id="nav-link-solution"
                href="#solution" 
                onClick={() => navigateToLanding()}
                className="text-zinc-400 hover:text-white transition"
              >
                Die Lösung
              </a>
              <a 
                id="nav-link-coach"
                href="#ki-coach" 
                onClick={() => navigateToLanding()}
                className="text-zinc-400 hover:text-white transition"
              >
                KI Coach
              </a>
              <a 
                id="nav-link-database"
                href="#datenbank" 
                onClick={() => navigateToLanding()}
                className="text-zinc-400 hover:text-white transition"
              >
                Wissenschaft
              </a>
              <a 
                id="nav-link-[#warteliste-unten]"
                href="#warteliste-unten" 
                onClick={() => navigateToLanding()}
                className="bg-orange-500 hover:bg-orange-600 text-black px-5 py-2.5 rounded text-[11px] font-bold tracking-widest transition duration-300 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20"
              >
                Frühzugang sichern
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-3">
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-zinc-400 hover:text-white transition p-1"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-900 bg-black/95 px-6 py-6 space-y-4 font-mono text-xs uppercase tracking-wider">
            <a 
              id="mob-nav-problem"
              href="#problem" 
              onClick={() => { navigateToLanding(); setMobileMenuOpen(false); }}
              className="block text-zinc-400 hover:text-white py-2"
            >
              Das Problem
            </a>
            <a 
              id="mob-nav-solution"
              href="#solution" 
              onClick={() => { navigateToLanding(); setMobileMenuOpen(false); }}
              className="block text-zinc-400 hover:text-white py-2"
            >
              Die Lösung
            </a>
            <a 
              id="mob-nav-coach"
              href="#ki-coach" 
              onClick={() => { navigateToLanding(); setMobileMenuOpen(false); }}
              className="block text-zinc-400 hover:text-white py-2"
            >
              KI Coach
            </a>
            <a 
              id="mob-nav-database"
              href="#datenbank" 
              onClick={() => { navigateToLanding(); setMobileMenuOpen(false); }}
              className="block text-zinc-400 hover:text-white py-2"
            >
              Wissenschaft
            </a>
            <a 
              id="mob-nav-signup"
              href="#warteliste-unten" 
              onClick={() => { navigateToLanding(); setMobileMenuOpen(false); }}
              className="block text-center bg-orange-500 hover:bg-orange-600 text-black py-3 rounded font-bold"
            >
              Frühzugang sichern
            </a>
          </div>
        )}
      </header>

      {/* Conditionally Render Content State */}
      {activeTab === "admin" ? (
        <AdminPanel />
      ) : (
        /* Landing Page Flow */
        <main>
          
          {/* Sektion Hero */}
          <section id="hero" className="relative pt-16 pb-24 md:pt-28 md:pb-40 overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              
              {/* Premium Subtitle */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-10">
                <Target className="w-3.5 h-3.5 text-orange-500" />
                DAS EVIDENZBASIERTE ERGEBNIS-SYSTEM
              </div>

              {/* Headlines - Porsche / Leica Level Bold Typography */}
              <h1 className="font-display font-bold text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-none select-none">
                <span className="block text-zinc-600">KEINE FITNESS-MYTHEN.</span>
                <span className="block mt-2 text-white">NUR ERGEBNISSE.</span>
              </h1>

              {/* Subheadline containing positioning copy */}
              <div className="max-w-2xl mx-auto mt-8 space-y-4">
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed tracking-wide">
                  Das erste evidenzbasierte Fitness-Coaching-System für Menschen, die endlich Klarheit wollen.
                </p>
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed tracking-normal">
                  Individuelle Trainingspläne, persönliche Ernährung, wissenschaftlich fundiertes Wissen und persönliche Betreuung – alles in einem System.
                </p>
              </div>

              {/* Waitlist Hero Converter Form */}
              <div className="mt-14 max-w-md mx-auto">
                {isSuccess ? (
                  <div className="bg-black border border-orange-500/30 p-8 rounded-xl text-center shadow-2xl animate-fade-in">
                    <CheckCircle2 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold uppercase tracking-wider text-white">Eingetragen!</h3>
                    <p className="text-zinc-300 text-sm mt-3 font-semibold leading-relaxed">
                      Du stehst jetzt auf der Warteliste.
                    </p>
                  </div>
                ) : (
                  <form 
                    id="hero-waitlist-form"
                    onSubmit={handleRegister} 
                    className="p-6 bg-black border border-zinc-900 rounded-lg shadow-2xl space-y-4 text-left"
                  >
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-zinc-500 tracking-widest mb-1.5">Trage deinen Vornamen ein</label>
                      <input
                        id="hero-input-name"
                        type="text"
                        placeholder="Z. B. Max"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-zinc-900 focus:border-orange-500 placeholder-zinc-700 text-xs text-zinc-100 px-4 py-3 rounded focus:outline-none transition font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-zinc-500 tracking-widest mb-1.5">Deine E-Mail-Adresse</label>
                      <input
                        id="hero-input-email"
                        type="email"
                        placeholder="Z. B. max@fitnessmythen.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-zinc-900 focus:border-orange-500 placeholder-zinc-700 text-xs text-zinc-100 px-4 py-3 rounded focus:outline-none transition font-sans"
                      />
                    </div>

                    {/* DSGVO Einverständnis Checkbox */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        id="hero-datenschutz-check"
                        type="checkbox"
                        required
                        className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-orange-500/20"
                      />
                      <label htmlFor="hero-datenschutz-check" className="text-[10px] text-zinc-500 leading-normal select-none">
                        Ich stimme der <button type="button" onClick={() => setActiveSubPage("datenschutz")} className="text-orange-500 underline hover:text-orange-400 font-semibold cursor-pointer inline">Datenschutzerklärung</button> zu und willige in die Verarbeitung meiner Daten ein. *
                      </label>
                    </div>

                    {submitErr && (
                      <p className="text-red-500 text-xs font-mono">{submitErr}</p>
                    )}
                    <button
                      id="hero-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs py-4 rounded uppercase tracking-widest font-mono flex items-center justify-center gap-2 shadow-lg shadow-orange-500/5 active:scale-95 transition duration-150 cursor-pointer"
                    >
                      {isSubmitting ? "Fast geschafft..." : "🚀 KOSTENLOSEN FRÜHZUGANG SICHERN"}
                    </button>
                    
                    <div className="text-center pt-3 border-t border-zinc-950 mt-2 block w-full">
                      <p className="text-[9px] text-zinc-500 leading-relaxed font-sans">
                        Sichere Übertragung nach DSGVO. Deine Daten werden vertraulich behandelt. Kein Spam. Jederzeit austragbar.
                      </p>
                    </div>
                  </form>
                )}
              </div>

              {/* Minimal Scroll Down Accent */}
              <div className="mt-20 flex justify-center animate-pulse">
                <a href="#problem" className="text-zinc-600 hover:text-orange-500 transition-colors uppercase font-mono text-[9px] tracking-[0.2em] flex flex-col items-center gap-2">
                  <span>Scrollen für Detailanalyse</span>
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          {/* Sektion 1: Das Problem */}
          <section id="problem" className="py-24 border-t border-zinc-900 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                    Sektion 01 // Die Realität
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase leading-tight">
                    WARUM DIE MEISTEN MENSCHEN SCHEITERN.
                  </h2>
                  <p className="text-zinc-500 text-sm sm:text-base leading-relaxed">
                    Sich im heutigen Dschungel von selbsternannten Experten zurechtzufinden, ist fast unmöglich geworden. Wer planlos trainiert und isst, erhält vor allem eins: Planlose Resultate.
                  </p>
                  <div className="border border-zinc-900 bg-zinc-950 p-6 rounded-lg">
                    <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                      Das Problem ist nicht mangelnde Motivation. Das Problem ist fehlende Klarheit.
                    </p>
                  </div>
                </div>

                {/* The "Dirty Points" or Reasons for Failure */}
                <div className="bg-[#080808] border border-zinc-900 p-8 rounded-lg space-y-6">
                  <div className="flex items-center gap-3 text-orange-500 pb-3 border-b border-zinc-900">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <h3 className="font-bold text-xs uppercase tracking-widest font-mono">6 fatale Barrieren im klassischen Fitness</h3>
                  </div>
                  <ul className="space-y-4 text-xs sm:text-sm text-zinc-400 font-mono">
                    <li className="w-full">
                      <div className="flex items-start gap-3 py-1.5">
                        <span className="text-orange-500 font-sans font-bold shrink-0">❌</span>
                        <span className="leading-relaxed">Zu viele widersprüchliche Fitness-Tipps</span>
                      </div>
                    </li>
                    <li className="w-full border-t border-zinc-900/40">
                      <div className="flex items-start gap-3 py-1.5">
                        <span className="text-orange-500 font-sans font-bold shrink-0">❌</span>
                        <span className="leading-relaxed">Keine klare Struktur</span>
                      </div>
                    </li>
                    <li className="w-full border-t border-zinc-900/40">
                      <div className="flex items-start gap-3 py-1.5">
                        <span className="text-orange-500 font-sans font-bold shrink-0">❌</span>
                        <span className="leading-relaxed">Unrealistische Ernährungspläne</span>
                      </div>
                    </li>
                    <li className="w-full border-t border-zinc-900/40">
                      <div className="flex items-start gap-3 py-1.5">
                        <span className="text-orange-500 font-sans font-bold shrink-0">❌</span>
                        <span className="leading-relaxed">Kein Feedback</span>
                      </div>
                    </li>
                    <li className="w-full border-t border-zinc-900/40">
                      <div className="flex items-start gap-3 py-1.5">
                        <span className="text-orange-500 font-sans font-bold shrink-0">❌</span>
                        <span className="leading-relaxed">Keine langfristige Strategie</span>
                      </div>
                    </li>
                    <li className="w-full border-t border-zinc-900/40">
                      <div className="flex items-start gap-3 py-1.5">
                        <span className="text-orange-500 font-sans font-bold shrink-0">❌</span>
                        <span className="leading-relaxed">Ständiger Neustart ohne Fortschritt</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Sektion 2: Die Lösung */}
          <section id="solution" className="py-24 border-t border-zinc-900 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-left space-y-4 mb-20 max-w-3xl">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                  Sektion 02 // Das Konzept
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase">
                  EIN SYSTEM STATT 100 MEINUNGEN.
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed pr-6">
                  Das Fortschritt System kombiniert Coaching, individuelle Planung, wissenschaftliches Wissen und moderne Technologie zu einem klaren Weg. Wir verkaufen keine vagen Versprechen — wir verändern fundamentale Abläufe.
                </p>
              </div>

              {/* Minimalistic Porsche-like Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* 1. Strukturiert */}
                <div className="border border-zinc-900 bg-[#080808] p-8 rounded-lg space-y-6">
                  <div className="text-orange-500 w-fit">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">1. Wissenschaftliche Reize</h3>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Strukturierte Evolution</p>
                  </div>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Jedes Trainingsvolumen und jede progressive Überlastung wird exakt kalkuliert, um plateaufreie Stimulation deiner Muskelsynthese sicherzustellen.
                  </p>
                </div>

                {/* 2. Messbar */}
                <div className="border border-zinc-900 bg-[#080808] p-8 rounded-lg space-y-6">
                  <div className="text-orange-500 w-fit">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">2. Absolute Metriken</h3>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Lückenlose Transparenz</p>
                  </div>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Verfolge wöchentliche Volumenentwicklungen und Gewichtsverläufe. Keine Schätzungen, nur greifbare Kraftsteigerungen und Datenpunkte.
                  </p>
                </div>

                {/* 3. Persönlich */}
                <div className="border border-zinc-900 bg-[#080808] p-8 rounded-lg space-y-6">
                  <div className="text-orange-500 w-fit">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">3. Individueller Algorithmus</h3>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Optimierte Abstimmung</p>
                  </div>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Es gibt keine Einheitspläne. Das System stimmt dein tagesaktuelles Kalorienbudget und deine Splits dynamisch auf deine individuellen Rückmeldungen ab.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* Sektion 3: Individuelle Trainingspläne */}
          <section id="training" className="py-24 border-t border-zinc-900 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                <div className="space-y-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                    Sektion 03 // Werkzeuge des Coachings
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase leading-tight">
                    INDIVIDUELLE TRAININGSPLÄNE.
                  </h2>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Kein Standardplan. Jeder Trainingsplan wird an dein Ziel, dein Leistungsniveau und deinen Alltag angepasst. Dein Plan atmet und wächst mit deinen realen Zuwächsen.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>Volumen, Frequenz und Intensität exakt auf dich abgestimmt</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>Volle Rücksicht auf Einschränkungen und verfügbares Equipment</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>Periodisierung auf wissenschaftlichem Niveau (Progressive Overload)</span>
                    </div>
                  </div>
                </div>

                {/* Training Plan Visualizer - Monochrome Premium Styling */}
                <div className="border border-zinc-900 bg-black rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-orange-500 text-black text-[9px] uppercase font-mono tracking-widest font-bold px-3 py-1">
                    SYSTEM ANALYSE
                  </div>
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest block mb-4">ENGINE PROTOKOLL — ACTIVE STATE</span>
                  
                  <div className="space-y-4">
                    <div className="bg-[#080808] border border-zinc-900 p-4 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">1. KREUZHEBEN (CONVENTIONAL)</h4>
                        <span className="text-[9px] bg-zinc-900 text-orange-500 border border-zinc-800 px-2 py-0.5 rounded font-mono uppercase tracking-wide">HYPERTROPHIE</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-zinc-400 font-mono mt-3">
                        <div className="p-2 border border-zinc-900 rounded bg-black">
                          <p className="text-[8px] text-zinc-600 uppercase">Sätze</p>
                          <p className="text-sm font-bold text-white mt-1">3</p>
                        </div>
                        <div className="p-2 border border-zinc-900 rounded bg-black">
                          <p className="text-[8px] text-zinc-600 uppercase">Reps</p>
                          <p className="text-sm font-bold text-white mt-1">6 — 8</p>
                        </div>
                        <div className="p-2 border border-zinc-900 rounded bg-black">
                          <p className="text-[8px] text-zinc-600 uppercase">Lade-Intensität (RPE)</p>
                          <p className="text-sm font-bold text-orange-500 mt-1">8.5</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#080808] border border-zinc-900 p-4 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">2. SCHRÄGBANKDRÜCKEN (KURZHANTEL)</h4>
                        <span className="text-[9px] bg-zinc-900 text-orange-500 border border-zinc-800 px-2 py-0.5 rounded font-mono uppercase tracking-wide">STÄRKE</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-zinc-400 font-mono mt-3">
                        <div className="p-2 border border-zinc-900 rounded bg-black">
                          <p className="text-[8px] text-zinc-600 uppercase">Sätze</p>
                          <p className="text-sm font-bold text-white mt-1">4</p>
                        </div>
                        <div className="p-2 border border-zinc-900 rounded bg-black">
                          <p className="text-[8px] text-zinc-600 uppercase">Reps</p>
                          <p className="text-sm font-bold text-white mt-1">8</p>
                        </div>
                        <div className="p-2 border border-zinc-900 rounded bg-black">
                          <p className="text-[8px] text-zinc-600 uppercase">Lade-Intensität (RPE)</p>
                          <p className="text-sm font-bold text-orange-500 mt-1">8.0</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Sektion 4: Individuelle Ernährungspläne */}
          <section id="nutrition" className="py-24 border-t border-zinc-900 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Visual Porsche-style instrument / Monochrome Dashboard */}
                <div className="border border-zinc-900 bg-[#080808] rounded-lg p-8 shadow-2xl order-last lg:order-first relative">
                  <div className="absolute top-0 left-0 bg-zinc-950 text-orange-500 text-[9px] uppercase font-mono tracking-widest font-bold px-3 py-1 border-r border-b border-zinc-900">
                    DIÄT METRIKEN
                  </div>

                  <div className="text-center py-6">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-40 h-40 transform -rotate-90">
                        {/* Circle Track */}
                        <circle cx="80" cy="80" r="70" stroke="#121212" strokeWidth="5" fill="transparent" />
                        {/* Circle Fill in Orange */}
                        <circle cx="80" cy="80" r="70" stroke="#ea580c" strokeWidth="5" fill="transparent" strokeDasharray="440" strokeDashoffset="120" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Energiebilanz</span>
                        <span className="text-2xl font-bold font-mono tracking-tight text-white">2.540 kcal</span>
                        <span className="text-[8px] text-orange-500 font-mono uppercase tracking-wide">Ziel: Muskelaufbau</span>
                      </div>
                    </div>

                    {/* Highly precise monochromatic layout without yellow, green, or blue */}
                    <div className="grid grid-cols-3 gap-3 mt-8 font-mono text-xs">
                      <div className="bg-black border border-zinc-900 p-3 rounded text-center">
                        <span className="text-white block font-bold text-sm tracking-tight">175g</span>
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest block mt-1">PROTEIN</span>
                      </div>
                      <div className="bg-black border border-zinc-900 p-3 rounded text-center">
                        <span className="text-orange-500 block font-bold text-sm tracking-tight">310g</span>
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest block mt-1">KOHLENH.</span>
                      </div>
                      <div className="bg-black border border-zinc-900 p-3 rounded text-center">
                        <span className="text-zinc-400 block font-bold text-sm tracking-tight">68g</span>
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest block mt-1">FETTE</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                    Sektion 04 // Werkzeuge des Coachings
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase leading-tight">
                    ERNÄHRUNG DIE IM ALLTAG FUNKTIONIERT.
                  </h2>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Keine Crash-Diäten. Keine Verbote. Eine klare Ernährungsstrategie die dauerhaft umsetzbar ist. Fitness Mythen beweist: Nachhaltiger Erfolg erfordert keine extreme Entbehrung, sondern biochemische Optimierung.
                  </p>
                  <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
                    Egal ob dein Fokus auf Fettabbau oder maximaler Kraftfreisetzung liegt — das Fortschritt System gibt dir klare Strukturen vor, die sich deinem sozialen Leben und Terminkalender beugen, nicht umgekehrt.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-mono bg-[#080808] border border-zinc-900 p-3 rounded">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      Kombiniertes Defizit
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-mono bg-[#080808] border border-zinc-900 p-3 rounded">
                      <Award className="w-3.5 h-3.5 text-orange-500" />
                      Mahlzeitenflexibilität
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Sektion 5: Wissensdatenbank (Wissenschafts-Plattform) */}
          <section id="datenbank" className="py-24 border-t border-zinc-900 bg-[#050505]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center space-y-4 mb-20">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                  Sektion 05 // Das Fundament
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase">
                  VERSTEHE ENDLICH WAS WIRKLICH FUNKTIONIERT.
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
                  Lerne Schritt für Schritt die wichtigsten Grundlagen zu Muskelaufbau, Fettverlust, Ernährung, Regeneration und Supplements. Keine Fitness-Mythen. Nur wissenschaftlich fundiertes Wissen.
                </p>
              </div>

              {/* Accordion Questions */}
              <div className="space-y-4">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div 
                      key={idx}
                      id={`faq-item-${idx}`}
                      className="border border-zinc-900 bg-[#080808] rounded transition"
                    >
                      <button
                        id={`faq-btn-${idx}`}
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex justify-between items-center px-6 py-5 text-left text-white focus:outline-none hover:bg-zinc-950/40"
                      >
                        <span className="font-semibold text-xs sm:text-sm uppercase tracking-wider font-mono flex items-center gap-3">
                          <HelpCircle className="w-4 h-4 text-orange-500 shrink-0" />
                          {faq.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180 text-orange-500" : ""}`} />
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-6 text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans border-t border-zinc-900/40 pt-4 bg-black/10">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 text-center text-[10px] py-4 bg-orange-500/[0.03] border border-orange-500/20 rounded text-orange-400 font-mono tracking-wider">
                📢 Keine Spekulationen. Nur evidenzbasierte physiologische Gesetzmäßigkeiten.
              </div>
            </div>
          </section>

          {/* Sektion 6: KI Coach */}
          <section id="ki-coach" className="py-24 border-t border-zinc-900 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center space-y-4 mb-20 max-w-3xl mx-auto">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                  Sektion 06 // Die Schnittstelle
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase">
                  DEIN PERSÖNLICHER KI COACH.
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Erhalte jederzeit Antworten auf deine Fragen zu Training, Ernährung und Regeneration. Schnell. Verständlich. Evidenzbasiert. Die Schnittstelle, die alle wissenschaftlichen Meta-Analysen bündelt.
                </p>
              </div>

              {/* Chat embed */}
              <AIPresentation />
            </div>
          </section>

          {/* Sektion 7: Fortschritt Tracken */}
          <section id="tracking" className="py-24 border-t border-zinc-900 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                <div className="space-y-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                    Sektion 07 // Transparente Metriken
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase leading-tight">
                    JEDER FORTSCHRITT WIRD SICHTBAR.
                  </h2>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Behalte Gewicht, Kraftwerte, Körperdaten und Trainingsfortschritte an einem Ort im Blick.
                  </p>
                  <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
                    So erkennst du, was funktioniert, wo du stehst und was als Nächstes angepasst werden muss.
                  </p>
                  <span className="border border-orange-500/20 bg-orange-500/[0.02] px-4 py-2.5 rounded text-orange-400 font-mono text-[10px] tracking-widest uppercase block w-fit">
                    📈 Klarheit statt Rätselraten
                  </span>
                </div>

                {/* Progress Visualizer Chart - Highly Premium Slate/Orange styling only */}
                <div className="border border-zinc-900 bg-[#080808] rounded-lg p-6 sm:p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">DEINE KRAFTENTWICKLUNG</h4>
                      <p className="text-[9px] font-mono text-zinc-600">VERLAUF BEIM BANKDRÜCKEN</p>
                    </div>
                    <span className="text-xs text-orange-500 font-mono font-bold">+12.5 kg Zuwachs</span>
                  </div>

                  {/* Chart lines - elegant monochrome scale without neon-green */}
                  <div className="h-44 flex items-end justify-between gap-2.5 border-b border-l border-zinc-900 pb-2 pl-2">
                    {/* Week 1 */}
                    <div className="flex-1 flex flex-col items-center group cursor-pointer">
                      <div className="w-full bg-zinc-900 group-hover:bg-orange-500/60 transition-all duration-300 h-[40%] relative">
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-zinc-900 text-white font-mono text-[9px] px-1.5 py-0.5">85kg</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600 mt-2">W1</span>
                    </div>
                    {/* Week 2 */}
                    <div className="flex-1 flex flex-col items-center group cursor-pointer">
                      <div className="w-full bg-zinc-900 group-hover:bg-orange-500/60 transition-all duration-300 h-[50%] relative">
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-zinc-900 text-white font-mono text-[9px] px-1.5 py-0.5">87.5kg</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600 mt-2">W2</span>
                    </div>
                    {/* Week 3 */}
                    <div className="flex-1 flex flex-col items-center group cursor-pointer">
                      <div className="w-full bg-zinc-900 group-hover:bg-orange-500/60 transition-all duration-300 h-[60%] relative">
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-zinc-900 text-white font-mono text-[9px] px-1.5 py-0.5">90kg</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600 mt-2">W3</span>
                    </div>
                    {/* Week 4 */}
                    <div className="flex-1 flex flex-col items-center group cursor-pointer">
                      <div className="w-full bg-zinc-900 group-hover:bg-orange-500/60 transition-all duration-300 h-[70%] relative">
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-zinc-900 text-white font-mono text-[9px] px-1.5 py-0.5">92.5kg</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600 mt-2">W4</span>
                    </div>
                    {/* Week 5 */}
                    <div className="flex-1 flex flex-col items-center group cursor-pointer">
                      <div className="w-full bg-zinc-900 group-hover:bg-orange-500/60 transition-all duration-300 h-[85%] relative">
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-zinc-900 text-white font-mono text-[9px] px-1.5 py-0.5">95kg</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600 mt-2">W5</span>
                    </div>
                    {/* Week 6 */}
                    <div className="flex-1 flex flex-col items-center group cursor-pointer">
                      <div className="w-full bg-orange-500 h-[100%] relative">
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-orange-500/20 text-orange-500 font-mono text-[9px] px-1.5 py-0.5 font-bold">97.5kg</span>
                      </div>
                      <span className="text-[9px] font-mono text-orange-500 mt-2 font-bold">W6</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Sektion: Mitgliederbereich Vorschau */}
          <section id="mitgliederbereich" className="py-24 border-t border-zinc-900 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                  Vorschau // Exklusive Werkzeuge
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase">
                  WAS DICH IM MITGLIEDERBEREICH ERWARTET
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                  Nach dem Start bekommst du Zugang zu einem geschützten Mitgliederbereich mit allen Werkzeugen, die du für deinen Fortschritt brauchst.
                </p>
              </div>

              {/* Grid with 6 tiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* 1. Dein Trainingsplan */}
                <div className="border border-zinc-900 bg-black/60 p-8 rounded-lg space-y-4 hover:border-zinc-800 transition duration-300 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
                  <div className="text-orange-500 w-12 h-12 rounded-lg bg-zinc-900/60 flex items-center justify-center border border-zinc-800">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Dein Trainingsplan</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Individuell auf dein Ziel und deinen Alltag angepasst.
                    </p>
                  </div>
                </div>

                {/* 2. Deine Ernährung */}
                <div className="border border-zinc-900 bg-black/60 p-8 rounded-lg space-y-4 hover:border-zinc-800 transition duration-300 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
                  <div className="text-orange-500 w-12 h-12 rounded-lg bg-zinc-900/60 flex items-center justify-center border border-zinc-800">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Deine Ernährung</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Klare Strategie statt komplizierter Diäten.
                    </p>
                  </div>
                </div>

                {/* 3. Wissensplattform */}
                <div className="border border-zinc-900 bg-black/60 p-8 rounded-lg space-y-4 hover:border-zinc-800 transition duration-300 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
                  <div className="text-orange-500 w-12 h-12 rounded-lg bg-zinc-900/60 flex items-center justify-center border border-zinc-800">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Wissensplattform</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Video-Kurse und Guides zu Training, Ernährung, Fettverlust und Muskelaufbau.
                    </p>
                  </div>
                </div>

                {/* 4. KI Coach */}
                <div className="border border-zinc-900 bg-black/60 p-8 rounded-lg space-y-4 hover:border-zinc-800 transition duration-300 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
                  <div className="text-orange-500 w-12 h-12 rounded-lg bg-zinc-900/60 flex items-center justify-center border border-zinc-800">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">KI Coach</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Sofortige Antworten auf deine Fragen.
                    </p>
                  </div>
                </div>

                {/* 5. Fortschritt */}
                <div className="border border-zinc-900 bg-black/60 p-8 rounded-lg space-y-4 hover:border-zinc-800 transition duration-300 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
                  <div className="text-orange-500 w-12 h-12 rounded-lg bg-zinc-900/60 flex items-center justify-center border border-zinc-800">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Fortschritt</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Gewicht, Kraftwerte und Entwicklung übersichtlich im Blick.
                    </p>
                  </div>
                </div>

                {/* 6. Persönliche Betreuung */}
                <div className="border border-zinc-900 bg-black/60 p-8 rounded-lg space-y-4 hover:border-zinc-800 transition duration-300 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
                  <div className="text-orange-500 w-12 h-12 rounded-lg bg-zinc-900/60 flex items-center justify-center border border-zinc-800">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Persönliche Betreuung</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Feedback und Anpassungen im Coaching.
                    </p>
                  </div>
                </div>

              </div>

              {/* CTA button centered below */}
              <div className="mt-16 text-center">
                <a 
                  id="mitgliederbereich-cta"
                  href="#warteliste-unten" 
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded text-xs uppercase font-extrabold tracking-widest transition duration-300 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 cursor-pointer"
                >
                  🚀 Kostenlosen Frühzugang sichern
                </a>
              </div>

            </div>
          </section>

          {/* Sektion 8: Das Coaching */}
          <section id="coaching" className="py-24 border-t border-zinc-900 bg-black">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                Sektion 08 // Das Gesamtsystem
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase mt-4">
                MEHR ALS EINE PLATTFORM.
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mt-6 max-w-2xl mx-auto">
                Fitness Mythen ist kein gewöhnlicher Online-Kurs. Du erhältst Zugang zu einem kompletten Coaching-System mit Wissen, Struktur, Unterstützung und klaren Prozessen.
              </p>
              <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mt-4 max-w-2xl mx-auto">
                Unser Ziel: Dir endlich zu zeigen, was für DICH funktioniert. Die Plattform, die Wissensdatenbank, der KI Coach und die automatischen Dynamiken sind Werkzeuge einer allumfassenden Transformation.
              </p>
            </div>
          </section>

          {/* Sektion 9: Warteliste (Sign-Up Form unten) */}
          <section id="warteliste-unten" className="py-24 border-t border-zinc-900 bg-[#050505] relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-500">
                Sektion 09 // Exklusiver Vorab-Zugang
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white uppercase mt-4">
                SICHERE DIR JETZT DEINEN KOSTENLOSEN FRÜHZUGANG.
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto mt-6 leading-relaxed">
                Trage dich jetzt kostenlos auf die Warteliste ein und erhalte als einer der Ersten Zugriff auf das Fortschritt System.
              </p>

              {/* Form container */}
              <div className="mt-14 max-w-md mx-auto">
                {isSuccess ? (
                  <div className="bg-black border border-orange-500/30 p-8 rounded-lg shadow-2xl">
                    <CheckCircle2 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold uppercase tracking-wider text-white">Eingetragen!</h3>
                    <p className="text-zinc-300 text-sm mt-3 font-semibold leading-relaxed">
                      Du stehst jetzt auf der Warteliste.
                    </p>
                  </div>
                ) : (
                  <form 
                    id="footer-waitlist-form"
                    onSubmit={handleRegister} 
                    className="p-6 bg-black border border-zinc-900 rounded-lg text-left space-y-4 shadow-2xl"
                  >
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-zinc-500 tracking-widest mb-1.5 font-semibold">Dein Vorname</label>
                      <input
                        id="footer-input-name"
                        type="text"
                        placeholder="Z. B. Max"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-zinc-900 focus:border-orange-500 placeholder-zinc-700 text-xs text-zinc-100 px-4 py-3 rounded focus:outline-none transition font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-mono text-zinc-500 tracking-widest mb-1.5 font-semibold">Deine E-Mail-Adresse</label>
                      <input
                        id="footer-input-email"
                        type="email"
                        placeholder="Z. B. max@fitnessmythen.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-zinc-900 focus:border-orange-500 placeholder-zinc-700 text-xs text-zinc-100 px-4 py-3 rounded focus:outline-none transition font-sans"
                      />
                    </div>

                    {/* DSGVO Einverständnis Checkbox */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        id="footer-datenschutz-check"
                        type="checkbox"
                        required
                        className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-orange-500/20"
                      />
                      <label htmlFor="footer-datenschutz-check" className="text-[10px] text-zinc-500 leading-normal select-none">
                        Ich stimme der <button type="button" onClick={() => setActiveSubPage("datenschutz")} className="text-orange-500 underline hover:text-orange-400 font-semibold cursor-pointer inline">Datenschutzerklärung</button> zu und willige in die Verarbeitung meiner Daten ein. *
                      </label>
                    </div>

                    {submitErr && (
                      <p className="text-red-500 text-xs font-mono">{submitErr}</p>
                    )}

                    <button
                      id="footer-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs py-4 rounded uppercase tracking-widest font-mono flex items-center justify-center gap-2 transition duration-150 active:scale-95 cursor-pointer"
                    >
                      {isSubmitting ? "Fast geschafft..." : "🚀 KOSTENLOSEN FRÜHZUGANG SICHERN"}
                    </button>
                    
                    <div className="text-center pt-3 border-t border-zinc-950 mt-2 block w-full">
                      <p className="text-[9px] text-zinc-500 leading-relaxed font-sans">
                        Sichere Übertragung nach DSGVO. Deine Daten werden vertraulich behandelt. Kein Spam. Jederzeit austragbar.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>

        </main>
      )}

      {/* Footer Area */}
      <footer className="bg-black border-t border-zinc-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-600 text-xs space-y-6">
          <div className="flex items-center justify-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-xs">
            <Flame className="w-4 h-4 text-orange-500" />
            FITNESS MYTHEN
          </div>
          <p className="max-w-md mx-auto text-zinc-600 text-[11px] leading-relaxed">
            Evidenzbasiertes Fitness-Coaching-System, Trainingssteuerung und Ernährungsplanung. Entwickelt von Fitness Mythen für echte, messbare Resultate.
          </p>
          
          {/* Footer Interactive Links */}
          <div className="flex flex-wrap justify-center gap-6 text-[11px] font-medium text-zinc-500">
            <button 
              onClick={() => setActiveSubPage("impressum")}
              className="hover:text-orange-500 transition cursor-pointer"
            >
              Impressum
            </button>
            <span className="text-zinc-800">|</span>
            <button 
              onClick={() => setActiveSubPage("datenschutz")}
              className="hover:text-orange-500 transition cursor-pointer"
            >
              Datenschutz
            </button>
            <span className="text-zinc-800">|</span>
            <button 
              onClick={() => setActiveSubPage("kontakt")}
              className="hover:text-orange-500 transition cursor-pointer"
            >
              Kontakt
            </button>
          </div>

          <div className="pt-2 font-mono text-[9px] text-zinc-700">
            © {new Date().getFullYear()} FITNESS MYTHEN — Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>

      {/* Dynamic Subpages (Impressum, Datenschutz, Kontakt) Overlays */}
      {activeSubPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-black border border-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-10 relative my-8 text-left max-h-[85vh] overflow-y-auto">
            {/* Close button */}
            <button 
              onClick={() => {
                setActiveSubPage(null);
                setContactSuccess(false);
                setContactError("");
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2 rounded-lg bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 transition cursor-pointer"
              aria-label="Schließen"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Impressum Content */}
            {activeSubPage === "impressum" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-4">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl md:text-2xl font-bold font-display text-white uppercase tracking-tight">Impressum</h2>
                </div>
                
                <div className="space-y-4 text-zinc-350 text-sm leading-relaxed max-h-[50vh] overflow-y-auto pr-2">
                  <div>
                    <p className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] font-mono mb-1">Angaben gemäß § 5 TMG</p>
                    <p className="text-white text-base font-semibold">William Neese</p>
                    <p>Isernbreede 9</p>
                    <p>32547 Bad Oeynhausen</p>
                    <p>Deutschland</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-4">
                    <p className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] font-mono mb-1">Unternehmensform</p>
                    <p className="text-zinc-300">Einzelunternehmen</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-4">
                    <p className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] font-mono mb-1">Tätigkeiten der Plattform</p>
                    <ul className="list-disc list-inside text-zinc-400 text-xs space-y-1">
                      <li>Digitale Fitnessplattform</li>
                      <li>Online Fitness Coaching</li>
                      <li>Digitale Bildungsangebote</li>
                      <li>Ernährungs- und Trainingssysteme</li>
                    </ul>
                  </div>

                  <div className="border-t border-zinc-900 pt-4">
                    <p className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] font-mono mb-1">Kontakt</p>
                    <p>E-Mail: <span className="text-white font-medium select-all font-mono">info@fitnessmythen.com</span></p>
                  </div>

                  <div className="border-t border-zinc-900 pt-4">
                    <p className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] font-mono mb-1">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV / § 55 RStV</p>
                    <p className="text-white font-semibold">William Neese</p>
                    <p>Isernbreede 9</p>
                    <p>32547 Bad Oeynhausen</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-4 text-zinc-400 text-xs space-y-3 leading-normal">
                    <p className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] font-mono mb-1">Haftungsausschluss</p>
                    <p><strong>Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
                    <p><strong>Urheberrecht:</strong> Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Datenschutz Content */}
            {activeSubPage === "datenschutz" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-4">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl md:text-2xl font-bold font-display text-white uppercase tracking-tight">Datenschutzerklärung</h2>
                </div>

                <div className="space-y-4 text-zinc-350 text-xs md:text-sm leading-relaxed max-h-[50vh] overflow-y-auto pr-2">
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1 text-zinc-200">1. Datenschutz auf einen Blick</h3>
                    <p className="text-zinc-400">Wir nehmen den Schutz deiner persönlichen Daten sehr ernst. Wir behandeln deine personenbezogenen Daten vertraulich, DSGVO-konform und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <h3 className="font-bold text-white text-sm mb-1 text-zinc-200">2. Verantwortlicher für die Datenverarbeitung</h3>
                    <p className="text-zinc-400">Verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
                    <div className="mt-2 text-zinc-300 font-sans space-y-0.5 border-l border-zinc-800 pl-3">
                      <p className="font-bold text-white">William Neese</p>
                      <p>Isernbreede 9</p>
                      <p>32547 Bad Oeynhausen</p>
                      <p>Deutschland</p>
                      <p>E-Mail: info@fitnessmythen.com</p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <h3 className="font-bold text-white text-sm mb-1 text-zinc-200">3. Erfassung deiner Daten (Warteliste / Formular)</h3>
                    <p className="text-zinc-400">Wenn du dich auf unserer Warteliste oder im Kontaktformular einträgst, erfassen wir folgende personenbezogenen Daten:</p>
                    <ul className="list-disc list-inside mt-2 text-zinc-300 space-y-1 pl-1">
                      <li>Deinen Vornamen</li>
                      <li>Deine E-Mail-Adresse</li>
                      <li>Deine Nachricht (nur im Kontaktformular)</li>
                      <li>Den Zeitpunkt der Registrierung (Zeitstempel)</li>
                    </ul>
                    <p className="mt-2 text-zinc-400">Diese Erfassung dient dem Zweck, dich auf die Warteliste für den bevorstehenden Frühzugang aufzunehmen, deine Anfragen zu bearbeiten oder dich über Updates der Plattform zu informieren.</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <h3 className="font-bold text-white text-sm mb-1 text-zinc-200">4. Hosting & CDN über die Google Infrastruktur</h3>
                    <p className="text-zinc-400">Unsere Webseite wird über Google Cloud-Infrastruktur / Cloud Run gehostet. Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland ("Google").</p>
                    <p className="mt-1 text-zinc-400">Google verarbeitet Daten unter anderem in den USA. Wir weisen darauf hin, dass Google die Standardvertragsklauseln (Standard Contractual Clauses) der EU-Kommission anwendet, um ein angemessenes Datenschutzniveau zu gewährleisten. Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO zur Gewährleistung eines sicheren, schnellen und effizienten Webauftritts.</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <h3 className="font-bold text-white text-sm mb-1 text-zinc-200">5. Firebase Dienste (Firestore & Authentication)</h3>
                    <p className="text-zinc-400">Wir nutzen zur Datenhaltung Google Cloud Firestore (NoSQL-Datenbank) von Firebase. Betreiber ist ebenfalls Google. Deine Anmeldedaten und Formulardaten werden auf geschützten Servern von Google innerhalb der Europäischen Union gespeichert (standardmäßig Region Belgien/Frankfurt), um sie vor unbefugtem Zugriff zu sichern.</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <h3 className="font-bold text-white text-sm mb-1 text-zinc-200">6. Google Workspace Integration (Sheets & Drive)</h3>
                    <p className="text-zinc-400">Bediener unseres Administrations-Dashboards können Wartelisten-Daten mit Google Sheets und Google Drive synchronisieren. Dies dient ausschließlich dem Zweck der organisatorischen Verwaltung der frühzeitigen System-Freischaltungen und zur administrativen Abwicklung. Die Daten bleiben in unserer geschützten Google Workspace-Umgebung.</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <h3 className="font-bold text-white text-sm mb-1 text-zinc-200">7. Google Fonts</h3>
                    <p className="text-zinc-400">Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten sogenannte Google Web Fonts. Um deine Privatsphäre zu schützen, binden wir diese Schriftarten DSGVO-konform und datensparend ein. Bei jedem Seitenaufruf werden die Schriften geladen, um das Design korrekt darzustellen.</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <h3 className="font-bold text-white text-sm mb-1 text-zinc-200">8. Google Analytics (Vorbereitung für zukünftige Nutzung)</h3>
                    <p className="text-zinc-400">Falls wir in Zukunft Google Analytics zur anonymisierten Reichweitenmessung einsetzen, geschieht dies nur nach Einwilligung via Cookie-Banner. Aktuell werden keine Tracker ohne Einwilligung ausgeführt.</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <h3 className="font-bold text-white text-sm mb-1 text-zinc-200">9. Rechtsgrundlage und Dauer der Speicherung</h3>
                    <p className="text-zinc-400">Die Datenverarbeitung erfolgt auf Grundlage deiner freiwilligen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) durch aktives Absenden der Formulare mit Bestätigung der Checkbox. Wir speichern deine Daten nur bis zum Abschluss der Wartelistenphase, es sei denn, du bittest uns vorab per E-Mail um deren Löschung oder es bestehen gesetzliche Aufbewahrungspflichten.</p>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <h3 className="font-bold text-white text-sm mb-1 text-zinc-200">10. Deine Rechte als betroffene Person</h3>
                    <p className="text-zinc-400">Du hast jederzeit das Recht auf:</p>
                    <ul className="list-disc list-inside mt-1 text-zinc-350 space-y-0.5 font-sans">
                      <li>Auskunft über deine bei uns gespeicherten Daten (Art. 15 DSGVO)</li>
                      <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
                      <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
                      <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                      <li>Widerruf deiner Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
                      <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                      <li>Beschwerde bei einer zuständigen Aufsichtsbehörde (Art. 77 DSGVO)</li>
                    </ul>
                    <p className="mt-2 text-zinc-400">Wende dich für Auskunfts- oder Löschungsanfragen einfach formlos per E-Mail an uns unter: <span className="text-white font-mono">info@fitnessmythen.com</span>.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Kontakt Content */}
            {activeSubPage === "kontakt" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-4">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl md:text-2xl font-bold font-display text-white uppercase tracking-tight">Kontakt</h2>
                </div>

                {contactSuccess ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center mx-auto mb-2 text-xl">✓</div>
                    <h3 className="text-lg font-bold text-white text-sans">Vielen Dank für deine Nachricht!</h3>
                    <p className="text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed">
                      Wir haben deine Nachricht erhalten und melden uns so schnell wie möglich bei dir.
                    </p>
                    <button
                      onClick={() => setContactSuccess(false)}
                      className="mt-4 border border-zinc-800 text-xs text-zinc-300 font-mono font-bold px-4 py-2 rounded-xl hover:border-orange-500 hover:text-white transition cursor-pointer"
                    >
                      Neue Nachricht schreiben
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-[#0f0f0f] border border-zinc-900 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="text-left">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Direkte E-Mail Adresse</p>
                        <p className="text-zinc-200 text-sm font-semibold mt-0.5 select-all font-mono">info@fitnessmythen.com</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("info@fitnessmythen.com");
                          setContactCopied(true);
                          setTimeout(() => setContactCopied(false), 2000);
                        }}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 font-mono font-bold px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                      >
                        {contactCopied ? "Kopiert!" : "Kopieren"}
                      </button>
                    </div>

                    <div className="relative text-center text-zinc-650 font-mono text-[9px] uppercase tracking-widest before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-[35%] before:h-[1px] before:bg-zinc-900 after:content-[''] after:absolute after:right-0 after:top-2.5 after:w-[35%] after:h-[1px] after:bg-zinc-900">
                      Oder Nachricht senden
                    </div>

                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim()) {
                          setContactError("Bitte fülle alle Pflichtfelder aus.");
                          return;
                        }
                        
                        setContactSubmitting(true);
                        setContactError("");
                        try {
                          const { addDoc, collection } = await import("firebase/firestore");
                          await addDoc(collection(db, "contacts"), {
                            name: contactName.trim(),
                            email: contactEmail.trim().toLowerCase(),
                            message: contactMsg.trim(),
                            createdAt: new Date()
                          });
                          setContactSuccess(true);
                          setContactName("");
                          setContactEmail("");
                          setContactMsg("");
                        } catch (err: any) {
                          console.error("Firestore contact form error:", err);
                          setContactError("Nachricht konnte nicht gesendet werden. Bitte schreibe uns direkt an info@fitnessmythen.com");
                        } finally {
                          setContactSubmitting(false);
                        }
                      }}
                      className="space-y-4 text-left"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] uppercase font-mono text-zinc-500 tracking-widest mb-1 font-bold">Vorname *</label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Dein Name"
                            className="w-full bg-zinc-950/60 border border-zinc-900 focus:border-orange-500 text-xs px-4 py-3 rounded-xl text-white outline-none font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-mono text-zinc-500 tracking-widest mb-1 font-bold">E-Mail *</label>
                          <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="deine@mail.de"
                            className="w-full bg-zinc-950/60 border border-zinc-900 focus:border-orange-500 text-xs px-4 py-3 rounded-xl text-white outline-none font-sans"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-mono text-zinc-500 tracking-widest mb-1 font-bold">Nachricht *</label>
                        <textarea
                          rows={4}
                          required
                          value={contactMsg}
                          onChange={(e) => setContactMsg(e.target.value)}
                          placeholder="Wie können wir dir helfen?"
                          className="w-full bg-zinc-950/60 border border-zinc-900 focus:border-orange-500 text-xs px-4 py-3 rounded-xl text-white outline-none font-sans resize-none"
                        ></textarea>
                      </div>

                      {contactError && (
                        <p className="text-red-500 text-xs font-mono">{contactError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={contactSubmitting}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-widest font-mono flex items-center justify-center gap-2 cursor-pointer transition border border-transparent shadow active:scale-95"
                      >
                        {contactSubmitting ? "Wird gesendet..." : "Nachricht Absenden"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
