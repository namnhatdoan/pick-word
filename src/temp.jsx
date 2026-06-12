import { useState, useEffect, useCallback, useRef } from "react";

// ─── Seed data ────────────────────────────────────────────────────────────────
// learnedAt: ISO date string or null (not learned yet)
// topics: string[]
// score: 0–100, higher = needs more practice, used for session weighting
const today = new Date();
const daysAgo = (n) => new Date(today - n * 86400000).toISOString().slice(0, 10);

const SEED_WORDS = [
  { id: 1,  word: "elephant",     meaning: "a very large grey animal with a long nose called a trunk, found in Africa and Asia",             topics: ["Animals","Nature"],       color: "#7C9885", img: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400&q=80",  learnedAt: daysAgo(12), score: 50 },
  { id: 2,  word: "butterfly",    meaning: "a flying insect with large, often colorful wings that starts life as a caterpillar",              topics: ["Animals","Nature"],       color: "#B07FBF", img: "https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=400&q=80",  learnedAt: daysAgo(10), score: 50 },
  { id: 3,  word: "watermelon",   meaning: "a large round fruit with green skin, red flesh, and black seeds — sweet and full of water",       topics: ["Fruits","Food"],          color: "#D4716A", img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80",  learnedAt: daysAgo(8)  , score: 50 },
  { id: 4,  word: "rainbow",      meaning: "a curved band of colors in the sky that appears when sunlight shines through rain",               topics: ["Nature","Science"],       color: "#6A8FD4", img: "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=400&q=80",  learnedAt: daysAgo(7)  , score: 50 },
  { id: 5,  word: "strawberry",   meaning: "a small, soft red fruit with tiny seeds on its surface and a sweet, slightly sour taste",         topics: ["Fruits","Food"],          color: "#D46A7A", img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80",  learnedAt: daysAgo(6)  , score: 50 },
  { id: 6,  word: "telescope",    meaning: "a tube-shaped instrument with lenses that makes distant objects like stars and planets look closer",topics: ["Science"],               color: "#6A9ED4", img: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=400&q=80",  learnedAt: daysAgo(5)  , score: 50 },
  { id: 7,  word: "library",      meaning: "a building or room with a large collection of books that people can borrow or read",               topics: ["Places"],                color: "#C4943A", img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",  learnedAt: daysAgo(5)  , score: 50 },
  { id: 8,  word: "bicycle",      meaning: "a two-wheeled vehicle that you ride by pushing pedals with your feet",                            topics: ["Transport","Sport"],      color: "#5A9E8A", img: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",  learnedAt: daysAgo(4)  , score: 50 },
  { id: 9,  word: "pineapple",    meaning: "a large tropical fruit with spiky skin, yellow flesh inside, and a sweet, tangy flavor",          topics: ["Fruits","Food"],          color: "#C4A43A", img: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80",  learnedAt: daysAgo(3)  , score: 50 },
  { id: 10, word: "mountain",     meaning: "a very high area of land with steep sides, much taller than a hill",                              topics: ["Nature","Places"],        color: "#7A8A9A", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",  learnedAt: daysAgo(3)  , score: 50 },
  { id: 11, word: "dolphin",      meaning: "a highly intelligent sea mammal that breathes air and is known for its playful behavior",         topics: ["Animals","Science"],      color: "#5A9ED4", img: "https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=400&q=80",  learnedAt: daysAgo(2)  , score: 50 },
  { id: 12, word: "volcano",      meaning: "a mountain with an opening at the top that can erupt with hot lava, ash, and gases",              topics: ["Nature","Science"],       color: "#D4714A", img: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=400&q=80",  learnedAt: daysAgo(2)  , score: 50 },
  { id: 13, word: "compass",      meaning: "a round tool with a magnetic needle that always points north, used for finding directions",       topics: ["Science","Transport"],    color: "#8A7ABF", img: "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=400&q=80",  learnedAt: daysAgo(1)  , score: 50 },
  { id: 14, word: "giraffe",      meaning: "the world's tallest animal, with an extremely long neck and spotted yellow-brown coat",           topics: ["Animals"],                color: "#C4A43A", img: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=400&q=80",  learnedAt: daysAgo(1)  , score: 50 },
  { id: 15, word: "broccoli",     meaning: "a green vegetable shaped like a tiny tree, packed with vitamins and nutrients",                   topics: ["Vegetables","Food"],      color: "#5A9E6A", img: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80",  learnedAt: daysAgo(0)  , score: 50 },
  { id: 16, word: "lighthouse",   meaning: "a tall tower near the sea with a bright flashing light that guides ships safely at night",        topics: ["Places","Nature"],        color: "#D4AA4A", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",  learnedAt: daysAgo(0)  , score: 50 },
  { id: 17, word: "submarine",    meaning: "a vessel that can travel underwater, used by navies or for ocean research",                       topics: ["Transport","Science"],    color: "#4A8ABF", img: "https://images.unsplash.com/photo-1566066895902-2ebf4ec72a84?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 18, word: "microscope",   meaning: "a scientific instrument that uses lenses to make very tiny objects appear much larger",           topics: ["Science"],                color: "#9A6ABF", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 19, word: "cactus",       meaning: "a desert plant with thick water-storing stems and sharp spines instead of leaves",               topics: ["Nature","Plants"],        color: "#6AAF5A", img: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 20, word: "carrot",       meaning: "a long orange root vegetable that grows underground and is crunchy when eaten raw",               topics: ["Vegetables","Food"],      color: "#E07A3A", img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 21, word: "octopus",      meaning: "a sea creature with eight long arms covered in suckers, that can change color to hide",           topics: ["Animals","Science"],      color: "#BF6A9A", img: "https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 22, word: "avocado",      meaning: "a pear-shaped fruit with dark green skin, creamy pale-green flesh, and a large pit inside",      topics: ["Fruits","Food"],          color: "#7AAF5A", img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 23, word: "thunderstorm", meaning: "a storm with heavy rain, strong winds, bright lightning flashes, and loud rumbles of thunder",   topics: ["Nature","Science"],       color: "#5A6A9E", img: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 24, word: "flamingo",     meaning: "a tall pink wading bird known for standing on one leg in shallow water",                         topics: ["Animals","Nature"],       color: "#E07AA0", img: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 25, word: "ambulance",    meaning: "a vehicle equipped to rush sick or injured people to hospital in an emergency",                   topics: ["Transport"],              color: "#D45A5A", img: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 26, word: "eggplant",     meaning: "a shiny purple vegetable with soft white flesh inside, also known as aubergine",                 topics: ["Vegetables","Food"],      color: "#7A4ABF", img: "https://images.unsplash.com/photo-1597217116394-49fd28dfaf84?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 27, word: "cathedral",    meaning: "a very large and grand Christian church, usually the main church of a region or bishop",          topics: ["Places"],                 color: "#8A7A6A", img: "https://images.unsplash.com/photo-1520520731457-9283dd14aa66?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 28, word: "scorpion",     meaning: "a small creature with eight legs, two claws, and a curved tail with a venomous stinger",         topics: ["Animals","Science"],      color: "#C4843A", img: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 29, word: "blueberry",    meaning: "a small round berry with dark blue-purple skin, sweet flavor, and packed with antioxidants",     topics: ["Fruits","Food"],          color: "#5A5AAF", img: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&q=80",  learnedAt: null, score: 50        },
  { id: 30, word: "glacier",      meaning: "a huge slow-moving mass of ice formed from compressed snow over thousands of years",             topics: ["Nature","Science"],       color: "#7AAFD4", img: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400&q=80",  learnedAt: null, score: 50        },
];

const DEFAULT_WORDS_PER_SESSION = 10;
const DEFAULT_TEST_POOL_SIZE    = 15;

// ─── Image → base64 at 400px ──────────────────────────────────────────────────
// Fetches a URL, draws it onto a 400px-wide canvas, returns a JPEG data URI.
// Falls back gracefully: if fetch or canvas fails, returns the original URL.
async function fetchToBase64(url) {
  if (!url || url.startsWith("data:")) return url; // already base64 or empty
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const MAX = 400;
        const scale = Math.min(1, MAX / img.naturalWidth);
        const w = Math.round(img.naturalWidth  * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch {
        resolve(url); // tainted canvas (CORS) → keep URL
      }
    };
    img.onerror = () => resolve(url); // network error → keep URL
    // Add cache-bust only for non-data URLs to avoid CORS issues on re-fetch
    img.src = url.includes("?") ? url + "&_cb=1" : url + "?_cb=1";
  });
}

const TOPIC_PALETTE = [
  "#7C9885","#D4716A","#6A8FD4","#6A9ED4","#C4943A",
  "#5A9E8A","#6AAF5A","#B07FBF","#D4714A","#8A7ABF",
  "#C4A43A","#E07A3A","#BF6A9A","#E07AA0","#D45A5A",
  "#7A4ABF","#8A7A6A","#C4843A","#5A5AAF","#7AAFD4",
];

function getTopicColor(topic, allTopics) {
  const idx = allTopics.indexOf(topic);
  return TOPIC_PALETTE[((idx >= 0 ? idx : allTopics.length) % TOPIC_PALETTE.length)];
}

// Only words with learnedAt set are eligible for sessions
function pickWords(allWords, doneIds, count) {
  const eligible = allWords.filter(w => w.learnedAt !== null);
  const notDone = eligible.filter(w => !doneIds.includes(w.id));
  const pool = notDone.length >= count ? notDone : eligible;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function TopicPill({ topic, color, small, onRemove }) {
  const c = color || "#888";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c + "22", color: c, border: `1.5px solid ${c}44`,
      borderRadius: 20, fontSize: small ? 10 : 11, fontWeight: 700,
      padding: small ? "1px 8px" : "2px 10px", letterSpacing: 0.4,
      fontFamily: "'Nunito',sans-serif", whiteSpace: "nowrap",
    }}>
      {topic}
      {onRemove && (
        <span onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ cursor: "pointer", fontSize: 11, lineHeight: 1, opacity: 0.7, marginLeft: 1 }}>×</span>
      )}
    </span>
  );
}

// ─── Flashcard ────────────────────────────────────────────────────────────────
function Flashcard({ onClose, words, currentIndex, setCurrentIndex, allTopics }) {
  const [flipped, setFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [slideDir, setSlideDir] = useState(0);

  useEffect(() => { setFlipped(false); setImgError(false); }, [currentIndex]);

  const navigate = useCallback((dir) => {
    const next = currentIndex + dir;
    if (next < 0 || next >= words.length) return;
    setSlideDir(dir); setSliding(true);
    setTimeout(() => { setCurrentIndex(next); setSliding(false); }, 220);
  }, [currentIndex, words.length, setCurrentIndex]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === " ") { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [navigate]);

  useEffect(() => {
    let sx = null;
    const ts = e => { sx = e.touches[0].clientX; };
    const te = e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (dx > 60) navigate(-1); if (dx < -60) navigate(1);
      sx = null;
    };
    document.addEventListener("touchstart", ts);
    document.addEventListener("touchend", te);
    return () => { document.removeEventListener("touchstart", ts); document.removeEventListener("touchend", te); };
  }, [navigate]);

  const cur = words[currentIndex];
  const primaryColor = cur.color || getTopicColor(cur.topics?.[0] || "", allTopics);
  const pct = ((currentIndex + 1) / words.length) * 100;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(18,13,4,0.92)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px 20px 32px", animation: "fadeIn 0.25s ease" }}>
      <div style={{ width: "100%", maxWidth: 460, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "rgba(255,255,255,0.7)", fontSize: 18, cursor: "pointer", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 800 }}>{currentIndex + 1} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/</span> {words.length}</div>
          <div style={{ fontFamily: "'Nunito',sans-serif", color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{flipped ? "Meaning revealed" : "Tap to reveal meaning"}</div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ width: "100%", maxWidth: 460, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 4, marginBottom: 22, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${primaryColor},${primaryColor}cc)`, borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 460, perspective: 1400, transform: sliding ? `translateX(${slideDir * -40}px)` : "translateX(0)", opacity: sliding ? 0 : 1, transition: "transform 0.22s ease,opacity 0.22s ease" }}>
        <div onClick={() => setFlipped(f => !f)} style={{ position: "relative", transformStyle: "preserve-3d", transition: "transform 0.6s cubic-bezier(0.35,0,0.15,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", height: 360, cursor: "pointer" }}>

          {/* FRONT */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: 28, overflow: "hidden", background: "#FFFDF8", boxShadow: "0 24px 64px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column" }}>
            {cur.img && (
              <div style={{ flex: "0 0 62%", background: primaryColor + "18", position: "relative", overflow: "hidden" }}>
                {!imgError
                  ? <img src={cur.img} alt={cur.word} onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : null}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 56, background: "linear-gradient(transparent,#FFFDF8)" }} />
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "70%" }}>
                  {(cur.topics || [cur.topic]).map(t => (
                    <TopicPill key={t} topic={t} color={getTopicColor(t, allTopics)} small />
                  ))}
                </div>
              </div>
            )}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 20px", gap: 8 }}>
              {!cur.img && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center", marginBottom: 4 }}>
                  {(cur.topics || []).map(t => <TopicPill key={t} topic={t} color={getTopicColor(t, allTopics)} small />)}
                </div>
              )}
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: cur.img ? 38 : 44, fontWeight: 900, color: "#1A1008", letterSpacing: -1.5, lineHeight: 1 }}>{cur.word}</div>
              <div style={{ display: "flex", gap: 5, alignItems: "center", color: "#B0A080", fontFamily: "'Nunito',sans-serif", fontSize: 12 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid #D0C4A8", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#C0B090" }}>?</span>
                Tap card to see meaning
              </div>
            </div>
          </div>

          {/* BACK */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 28, background: primaryColor, boxShadow: "0 24px 64px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 28px" }}>
            <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)", top: -40, right: -40 }} />
            <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)", bottom: 20, left: -20 }} />
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{cur.word}</div>
              <div style={{ width: 40, height: 2, background: "rgba(255,255,255,0.3)", borderRadius: 2, margin: "0 auto 20px" }} />
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.6 }}>{cur.meaning}</div>
              <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
                {cur.word.split("").map((l, i) => (
                  <div key={i} style={{ width: 32, height: 38, background: "rgba(255,255,255,0.18)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 900, color: "#fff", animation: "popIn 0.3s ease both", animationDelay: `${i * 0.04}s`, border: "1.5px solid rgba(255,255,255,0.25)" }}>{l.toUpperCase()}</div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                {(cur.topics || [cur.topic]).map(t => (
                  <TopicPill key={t} topic={t} color="rgba(255,255,255,0.55)" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24, alignItems: "center" }}>
        <button onClick={() => navigate(-1)} disabled={currentIndex === 0} style={{ width: 50, height: 50, borderRadius: 16, background: currentIndex === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)", border: "1.5px solid", borderColor: currentIndex === 0 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.15)", color: currentIndex === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.8)", fontSize: 20, cursor: currentIndex === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        <button onClick={() => setFlipped(f => !f)} style={{ padding: "0 32px", height: 50, borderRadius: 16, background: primaryColor, border: "none", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 24px ${primaryColor}66`, minWidth: 140 }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >{flipped ? "← See word" : "Reveal meaning →"}</button>
        <button onClick={() => navigate(1)} disabled={currentIndex === words.length - 1} style={{ width: 50, height: 50, borderRadius: 16, background: currentIndex === words.length - 1 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)", border: "1.5px solid", borderColor: currentIndex === words.length - 1 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.15)", color: currentIndex === words.length - 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.8)", fontSize: 20, cursor: currentIndex === words.length - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
      </div>
      <div style={{ marginTop: 12, fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>← → arrow keys · space to flip</div>
    </div>
  );
}

// ─── Done overlay ─────────────────────────────────────────────────────────────
function DoneOverlay({ count, onNewList }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(18,13,4,0.88)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 32, animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 72, marginBottom: 16, animation: "popIn 0.5s ease both" }}>🎉</div>
      <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -0.8, marginBottom: 8, textAlign: "center" }}>All written!</div>
      <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: 32, lineHeight: 1.6 }}>Great job practicing {count} words today.</div>
      <button onClick={onNewList} style={{ padding: "0 36px", height: 56, borderRadius: 18, background: "#C4943A", border: "none", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 28px rgba(196,148,58,0.5)", display: "flex", alignItems: "center", gap: 10 }}>
        Get New List <span style={{ fontSize: 20 }}>🔀</span>
      </button>
    </div>
  );
}

// ─── Test screen ─────────────────────────────────────────────────────────────
// TEST_POOL_SIZE and WORDS_PER_SESSION come from app config (loaded from IDB)
const MAX_WRONG = 10;

function TestScreen({ testWords, allTopics, onClose, onComplete }) {
  const [idx, setIdx]               = useState(0);
  const [input, setInput]           = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [results, setResults]       = useState([]); // [{word, correct, attempt}]
  const [imgError, setImgError]     = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const inputRef = useRef(null);

  const wrongSoFar = results.filter(r => !r.correct).length;
  const cur        = testWords[idx];
  const primaryColor = cur?.color || getTopicColor((cur?.topics||[])[0]||"", allTopics);

  useEffect(() => {
    setInput(""); setSubmitted(false); setImgError(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [idx]);

  const handleSubmit = () => {
    if (!input.trim() || submitted) return;
    const correct    = input.trim().toLowerCase() === cur.word.toLowerCase();
    setSubmitted(true);
    setResults(r => [...r, { word: cur, correct, attempt: input.trim() }]);
  };

  const handleNext = () => {
    const newWrong = results.filter(r => !r.correct).length;
    const isLast   = idx >= testWords.length - 1;
    if (newWrong >= MAX_WRONG || isLast) setShowSummary(true);
    else setIdx(i => i + 1);
  };

  const wrongResults  = results.filter(r => !r.correct);
  const correctCount  = results.filter(r => r.correct).length;
  const practiceWords = wrongResults.map(r => r.word);
  const lastResult    = results[results.length - 1];

  // ── Summary ──────────────────────────────────────────────────────────────
  if (showSummary) {
    const allCorrect    = wrongResults.length === 0;
    const stoppedEarly  = wrongResults.length >= MAX_WRONG;
    return (
      <div style={{ position: "fixed", inset: 0, background: "#1A1208", display: "flex", flexDirection: "column", zIndex: 100, animation: "fadeIn 0.3s ease" }}>
        <div style={{ padding: "36px 28px 20px", textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>
            {allCorrect ? "🏆" : wrongResults.length <= 3 ? "⭐" : "💪"}
          </div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.8 }}>
            {correctCount} correct · {wrongResults.length} wrong
          </div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6, lineHeight: 1.6 }}>
            {allCorrect
              ? "Perfect! Nothing extra to write today 🎉"
              : stoppedEarly
                ? `Stopped at ${MAX_WRONG} wrong answers. Practice these ${MAX_WRONG} words today.`
                : `Practice ${wrongResults.length} word${wrongResults.length !== 1 ? "s" : ""} today.`}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 130px" }}>
          {wrongResults.length > 0 && (
            <>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 800, color: "#C4943A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>
                ✍️ Write these today ({wrongResults.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {wrongResults.map((r, i) => (
                  <div key={i} style={{ background: "rgba(212,90,90,0.14)", border: "1.5px solid #D45A5A44", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 18, flexShrink: 0 }}>❌</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff" }}>{r.word.word}</div>
                      <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.word.meaning}</div>
                      <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "#D45A5A99", marginTop: 2 }}>
                        {r.attempt === "—skipped—"
                          ? <span style={{ fontStyle: "italic" }}>Skipped</span>
                          : <>You wrote: <span style={{ fontWeight: 700 }}>{r.attempt}</span></>}
                      </div>
                    </div>
                    {r.word.img && (
                      <div style={{ width: 40, height: 40, borderRadius: 9, overflow: "hidden", flexShrink: 0 }}>
                        <img src={r.word.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.currentTarget.style.display = "none"} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {correctCount > 0 && (
            <>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 800, color: "#5A9E8A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>
                ✓ Already know ({correctCount})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {results.filter(r => r.correct).map((r, i) => (
                  <div key={i} style={{ background: "rgba(90,158,138,0.1)", border: "1.5px solid #5A9E8A33", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15 }}>✅</span>
                    <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{r.word.word}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 24px 32px", background: "linear-gradient(transparent, #1A1208 40%)" }}>
          <button onClick={() => onComplete(results, practiceWords)}
            style={{ width: "100%", height: 54, borderRadius: 18, background: "#C4943A", border: "none", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 28px rgba(196,148,58,0.4)" }}>
            {allCorrect ? "Great job! 🎉" : `Practice ${practiceWords.length} word${practiceWords.length !== 1 ? "s" : ""} ✍️`}
          </button>
        </div>
      </div>
    );
  }

  // ── Question card ─────────────────────────────────────────────────────────
  const progressPct = ((idx + (submitted ? 1 : 0)) / testWords.length) * 100;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#1A1208", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 100, padding: "20px 20px 24px", animation: "fadeIn 0.25s ease", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 460, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "rgba(255,255,255,0.7)", fontSize: 18, cursor: "pointer", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 800 }}>
            {idx + 1} / {testWords.length}
            <span style={{ marginLeft: 10, fontSize: 12 }}>
              <span style={{ color: "#5A9E8A" }}>✓ {correctCount}</span>
              <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>·</span>
              <span style={{ color: wrongSoFar > 0 ? "#D45A5A" : "rgba(255,255,255,0.3)" }}>✗ {wrongSoFar}/{MAX_WRONG}</span>
            </span>
          </div>
          <div style={{ fontFamily: "'Nunito',sans-serif", color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
            {submitted ? (lastResult?.correct ? "✓ Correct!" : "✗ Not quite") : "What's this word?"}
          </div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Wrong-answer bar */}
      {wrongSoFar > 0 && (
        <div style={{ width: "100%", maxWidth: 460, marginBottom: 10 }}>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${(wrongSoFar / MAX_WRONG) * 100}%`, height: "100%", background: wrongSoFar >= MAX_WRONG - 2 ? "#D45A5A" : "#C4943A", borderRadius: 4, transition: "width 0.4s ease, background 0.3s" }} />
          </div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 10, color: wrongSoFar >= MAX_WRONG - 2 ? "#D45A5A" : "rgba(255,255,255,0.25)", textAlign: "right", marginTop: 3 }}>
            {MAX_WRONG - wrongSoFar} mistake{MAX_WRONG - wrongSoFar !== 1 ? "s" : ""} left before stopping
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 460, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 4, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ width: `${progressPct}%`, height: "100%", background: `linear-gradient(90deg,${primaryColor},${primaryColor}cc)`, borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ borderRadius: 28, overflow: "hidden", background: submitted ? (lastResult?.correct ? "#5A9E8A" : "#D45A5A") : "#FFFDF8", boxShadow: "0 24px 64px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", transition: "background 0.4s ease" }}>
          {/* Image */}
          <div style={{ height: 190, background: submitted ? "rgba(0,0,0,0.15)" : primaryColor + "18", position: "relative", overflow: "hidden", flexShrink: 0 }}>
            {!imgError && cur.img
              ? <img src={cur.img} alt="?" onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>🖼️</div>}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(transparent,${submitted ? (lastResult?.correct ? "#5A9E8A" : "#D45A5A") : "#FFFDF8"})`, transition: "background 0.4s ease" }} />
            <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "70%" }}>
              {(cur.topics||[]).map(t => <TopicPill key={t} topic={t} color={submitted ? "rgba(255,255,255,0.55)" : getTopicColor(t, allTopics)} small />)}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "14px 22px 20px", flex: 1 }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 700, color: submitted ? "rgba(255,255,255,0.9)" : "#2A2015", lineHeight: 1.55, marginBottom: 14 }}>
              {cur.meaning}
            </div>

            {submitted && (
              <div style={{ textAlign: "center", marginBottom: 10, animation: "popIn 0.35s ease" }}>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 34, fontWeight: 900, color: "#fff", letterSpacing: -1, marginBottom: 8 }}>{cur.word}</div>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
                  {cur.word.split("").map((l, i) => (
                    <div key={i} style={{ width: 28, height: 34, background: "rgba(255,255,255,0.2)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 900, color: "#fff", border: "1.5px solid rgba(255,255,255,0.28)", animation: "popIn 0.3s ease both", animationDelay: `${i * 0.04}s` }}>{l.toUpperCase()}</div>
                  ))}
                </div>
                {!lastResult?.correct && lastResult?.attempt !== "—skipped—" && (
                  <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 10 }}>
                    You wrote: <span style={{ fontWeight: 800, textDecoration: "line-through", opacity: 0.75 }}>{lastResult?.attempt}</span>
                  </div>
                )}
              </div>
            )}

            {!submitted && (
              <input ref={inputRef} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                placeholder="Type the word…"
                style={{ width: "100%", height: 50, borderRadius: 14, border: "2px solid #E8DFC8", background: "#F8F4EC", padding: "0 16px", fontFamily: "'Nunito',sans-serif", fontSize: 18, fontWeight: 700, color: "#1A1008", outline: "none", letterSpacing: 0.5 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Action button */}
      <div style={{ width: "100%", maxWidth: 460, marginTop: 16 }}>
        {!submitted ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSubmit} disabled={!input.trim()}
              style={{ flex: 2, height: 54, borderRadius: 18, background: input.trim() ? primaryColor : "rgba(255,255,255,0.08)", border: "none", color: input.trim() ? "#fff" : "rgba(255,255,255,0.25)", fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 800, cursor: input.trim() ? "pointer" : "default", boxShadow: input.trim() ? `0 8px 24px ${primaryColor}55` : "none", transition: "all 0.2s" }}>
              Check Answer →
            </button>
            <button onClick={() => {
              setSubmitted(true);
              setResults(r => [...r, { word: cur, correct: false, attempt: "—skipped—" }]);
            }}
              style={{ flex: 1, height: 54, borderRadius: 18, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)", fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
            >Skip 🙈</button>
          </div>
        ) : (
          <button onClick={handleNext}
            style={{ width: "100%", height: 54, borderRadius: 18, background: lastResult?.correct ? "#5A9E8A" : "#C4943A", border: "none", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 800, cursor: "pointer", animation: "popIn 0.3s ease" }}>
            {wrongSoFar >= MAX_WRONG ? "See results →" : idx < testWords.length - 1 ? "Next →" : "See results 🎉"}
          </button>
        )}
      </div>
      {!submitted && <div style={{ marginTop: 10, fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.18)" }}>Press Enter to submit · Skip if you don't know</div>}
    </div>
  );
}

function WordCard({ word, index, onOpen, allTopics }) {
  const [imgErr, setImgErr] = useState(false);
  const primaryColor = word.color || getTopicColor((word.topics || [])[0] || "", allTopics);
  return (
    <div onClick={() => onOpen(word)} style={{ display: "flex", alignItems: "center", gap: 14, background: "#FFFDF8", border: "2px solid #F0EAD8", borderRadius: 18, padding: "12px 16px", cursor: "pointer", transition: "all 0.18s ease", animation: "fadeSlideIn 0.4s ease both", animationDelay: `${index * 0.055}s`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateX(6px)"; e.currentTarget.style.borderColor = primaryColor + "88"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = "#F0EAD8"; }}
    >
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: primaryColor + "22", color: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, fontFamily: "'Nunito',sans-serif", flexShrink: 0 }}>{index + 1}</div>
      <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: primaryColor + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!imgErr && word.img
          ? <img src={word.img} alt={word.word} onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 24 }}>📖</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 17, color: "#2A2015", letterSpacing: -0.3 }}>{word.word}</div>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "#8A7A5A", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{word.meaning}</div>
        <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
          {(word.topics || []).map(t => (
            <TopicPill key={t} topic={t} color={getTopicColor(t, allTopics)} small />
          ))}
        </div>
      </div>
      <span style={{ color: "#C8BAA0", fontSize: 14, flexShrink: 0 }}>›</span>
    </div>
  );
}

// ─── Child page ───────────────────────────────────────────────────────────────
function ChildPage({ allWords, allTopics, onGoParent, dbSession, onUpdateWord, config }) {
  const WORDS_PER_SESSION = config?.wordsPerSession ?? DEFAULT_WORDS_PER_SESSION;
  const TEST_POOL_SIZE    = config?.testPoolSize    ?? DEFAULT_TEST_POOL_SIZE;
  const [doneIds, setDoneIds]       = useState([]);
  const [session, setSession]       = useState([]);
  const [sessionCount, setSessionCount] = useState(1);
  const [sessionReady, setSessionReady] = useState(false);
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [testOpen, setTestOpen]     = useState(false);
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [filter, setFilter]         = useState("All");
  const [showDone, setShowDone]     = useState(false);
  const [view, setView]             = useState("home"); // "home" | "wordlist"

  // ── Restore session from IDB on mount ──
  useEffect(() => {
    (async () => {
      try {
        const saved = await dbSession.getSession("childSession");
        const todayStr = new Date().toISOString().slice(0, 10);
        if (saved && saved.date === todayStr && saved.sessionIds?.length > 0) {
          // Rehydrate: map saved IDs back to current word objects (handles edits)
          const wordMap = Object.fromEntries(allWords.map(w => [w.id, w]));
          const rehydrated = saved.sessionIds.map(id => wordMap[id]).filter(Boolean);
          if (rehydrated.length > 0) {
            setSession(rehydrated);
            setDoneIds(saved.doneIds || []);
            setSessionCount(saved.sessionCount || 1);
            setSessionReady(true);
            return;
          }
        }
        // No valid session for today → pick fresh
        const fresh = pickWords(allWords, [], WORDS_PER_SESSION);
        setSession(fresh);
        await dbSession.putSession("childSession", {
          date: todayStr,
          sessionIds: fresh.map(w => w.id),
          doneIds: [],
          sessionCount: 1,
        });
      } catch (err) {
        console.error("Session restore failed", err);
        setSession(pickWords(allWords, [], WORDS_PER_SESSION));
      } finally {
        setSessionReady(true);
      }
    })();
  }, []); // run once on mount only

  const saveSession = useCallback(async (sessionIds, doneIds, count) => {
    try {
      await dbSession.putSession("childSession", {
        date: new Date().toISOString().slice(0, 10),
        sessionIds,
        doneIds,
        sessionCount: count,
      });
    } catch (err) {
      console.error("Session save failed", err);
    }
  }, [dbSession]);

  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const eligibleCount = allWords.filter(w => w.learnedAt !== null).length;

  const sessionTopics = ["All", ...Array.from(new Set(session.flatMap(w => w.topics || [])))];
  const filteredWords = filter === "All" ? session : session.filter(w => (w.topics || []).includes(filter));

  const getNewList = async () => {
    // Log written session before cycling
    await dbSession.addWrittenSession({
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      words: session.map(w => ({ id: w.id, word: w.word })),
    });
    const newDone = [...doneIds, ...session.map(w => w.id)];
    const eligible = allWords.filter(w => w.learnedAt !== null);
    const nextDone = newDone.length >= eligible.length ? [] : newDone;
    const nextSession = pickWords(allWords, nextDone, WORDS_PER_SESSION);
    const nextCount = sessionCount + 1;
    setDoneIds(nextDone);
    setSession(nextSession);
    setSessionCount(nextCount);
    setFilter("All");
    setShowDone(false);
    await saveSession(nextSession.map(w => w.id), nextDone, nextCount);
  };

  // Build test pool: top TEST_POOL_SIZE eligible words by score descending
  const testPool = [...allWords.filter(w => w.learnedAt !== null)]
    .sort((a, b) => (b.score ?? 50) - (a.score ?? 50))
    .slice(0, TEST_POOL_SIZE);

  // Save test results: update score, log history, set session to wrong-answer words
  const handleTestComplete = useCallback(async (results, practiceWords) => {
    // Update scores
    for (const r of results) {
      const word = allWords.find(w => w.id === r.word.id);
      if (!word) continue;
      const newScore = r.correct
        ? Math.max(0,   (word.score ?? 50) - 10)
        : Math.min(100, (word.score ?? 50) + 20);
      await onUpdateWord({ ...word, score: newScore });
    }
    // Log test session to history
    await dbSession.addTestSession({
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      results: results.map(r => ({
        wordId:  r.word.id,
        word:    r.word.word,
        correct: r.correct,
        attempt: r.attempt,
        skipped: r.attempt === "—skipped—",
      })),
    });
    // Replace today's session with just the words the child got wrong
    if (practiceWords.length > 0) {
      setSession(practiceWords);
      await saveSession(practiceWords.map(w => w.id), doneIds, sessionCount);
      setView("wordlist");
    } else {
      setShowDone(true);
    }
    setTestOpen(false);
  }, [allWords, onUpdateWord, dbSession, doneIds, sessionCount, saveSession]);

  if (!sessionReady) return null;

  // ── Shared dark header ────────────────────────────────────────────────────
  const Header = ({ showBack, onBack: onBackBtn }) => (
    <div style={{ background: "#2A2015", padding: "28px 24px 24px", position: "relative", overflow: "hidden" }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ position: "absolute", width: [60,40,80,30,50,70][i], height: [60,40,80,30,50,70][i], borderRadius: "50%", background: ["#D4716A","#7C9885","#C4943A","#6A8FD4","#B07FBF","#5A9E8A"][i] + "16", top: ["-20px","30px","-10px","50px","10px","40px"][i], right: ["20px","80px","140px","40px","200px","160px"][i] }} />
      ))}
      {showBack
        ? <button onClick={onBackBtn} style={{ position: "absolute", top: 24, left: 24, zIndex: 10, background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.18)", borderRadius: 12, color: "rgba(255,255,255,0.6)", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>←</button>
        : null}
      <button onClick={onGoParent} title="Parent settings" style={{ position: "absolute", top: 24, right: 24, zIndex: 10, background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.18)", borderRadius: 12, color: "rgba(255,255,255,0.6)", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>⚙️</button>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.5, marginBottom: 4 }}>Pick Word ✏️</div>
        <div style={{ fontFamily: "'Nunito',sans-serif", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{dateStr}</div>
      </div>
    </div>
  );

  // ── view: "home" | "wordlist" ─────────────────────────────────────────────
  if (view === "home") {
    return (
      <div style={{ minHeight: "100vh", background: "#F5EFE0" }}>
        <Header showBack={false} />

        {session.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 800, color: "#6A5A40", marginBottom: 8 }}>No words to practice yet</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#B0A080", lineHeight: 1.6 }}>Ask a parent to add words and set a learned date.</div>
          </div>
        ) : (
          <div style={{ padding: "32px 24px 40px", display: "flex", flexDirection: "column", gap: 16, animation: "fadeSlideIn 0.4s ease" }}>
            {/* Greeting */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 900, color: "#2A2015" }}>What would you like to do?</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#B0A080", marginTop: 4 }}>
                {eligibleCount} word{eligibleCount !== 1 ? "s" : ""} available
              </div>
            </div>

            {/* Challenge card */}
            <button onClick={() => setTestOpen(true)} disabled={testPool.length === 0}
              style={{ width: "100%", borderRadius: 24, border: "none", background: testPool.length === 0 ? "#D8D0C0" : "linear-gradient(135deg,#6A8FD4,#4A6AB4)", padding: "28px 24px", cursor: testPool.length === 0 ? "default" : "pointer", textAlign: "left", boxShadow: testPool.length === 0 ? "none" : "0 12px 36px rgba(106,143,212,0.4)", transition: "transform 0.18s, box-shadow 0.18s" }}
              onMouseEnter={e => { if (testPool.length > 0) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 18px 42px rgba(106,143,212,0.5)"; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = testPool.length > 0 ? "0 12px 36px rgba(106,143,212,0.4)" : "none"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 6 }}>Challenge</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                Test yourself on up to {TEST_POOL_SIZE} words. Only the ones you get wrong become today's writing practice.
              </div>
              {testPool.length > 0 && (
                <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "4px 14px" }}>
                  <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, color: "#fff" }}>{testPool.length} word{testPool.length !== 1 ? "s" : ""} ready</span>
                </div>
              )}
            </button>

            {/* Study card */}
            <button onClick={() => setView("wordlist")}
              style={{ width: "100%", borderRadius: 24, border: "none", background: "linear-gradient(135deg,#2A2015,#4A3A25)", padding: "28px 24px", cursor: "pointer", textAlign: "left", boxShadow: "0 12px 36px rgba(42,32,21,0.35)", transition: "transform 0.18s, box-shadow 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 18px 42px rgba(42,32,21,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(42,32,21,0.35)"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>📖</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 6 }}>Study</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                Browse today's {session.length} word{session.length !== 1 ? "s" : ""}, flip flashcards, then mark as written.
              </div>
              <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "4px 14px" }}>
                <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, color: "#fff" }}>{session.length} word{session.length !== 1 ? "s" : ""} today</span>
              </div>
            </button>
          </div>
        )}

        {testOpen && <TestScreen testWords={testPool} allTopics={allTopics} onClose={() => setTestOpen(false)} onComplete={handleTestComplete} />}
        {showDone && <DoneOverlay count={session.length} onNewList={getNewList} />}
      </div>
    );
  }

  // ── view: "wordlist" ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#F5EFE0" }}>
      <Header showBack onBack={() => setView("home")} />

      {/* Topic filter */}
      <div style={{ padding: "16px 24px 0", display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {sessionTopics.map(t => {
          const c = t === "All" ? "#2A2015" : getTopicColor(t, allTopics);
          const cnt = t === "All" ? session.length : session.filter(w => (w.topics||[]).includes(t)).length;
          return (
            <button key={t} onClick={() => setFilter(t)} style={{ flexShrink: 0, padding: "6px 16px", borderRadius: 20, border: "2px solid", borderColor: filter === t ? c : "#E0D8C8", background: filter === t ? c + "18" : "transparent", color: filter === t ? c : "#8A7A5A", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
              {t === "All" ? `All (${session.length})` : `${t} (${cnt})`}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "16px 24px 140px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredWords.map((word, i) => (
          <WordCard key={`${sessionCount}-${word.id}`} word={word} index={i} allTopics={allTopics}
            onOpen={w => { setCurrentIndex(filteredWords.findIndex(x => x.id === w.id)); setFlashcardOpen(true); }} />
        ))}
      </div>

      {/* Bottom bar: Mark as Written + New Practice */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 24px 28px", background: "linear-gradient(transparent,#F5EFE0 35%)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowDone(true)} style={{ flex: 1, height: 54, background: "#FFFDF8", border: "2px solid #E8DFC8", borderRadius: 18, color: "#5A9E8A", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#5A9E8A88"; e.currentTarget.style.background = "#F0FAF6"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8DFC8"; e.currentTarget.style.background = "#FFFDF8"; }}
          >✅ Mark as Written</button>
          <button onClick={() => setView("home")} style={{ flex: 1, height: 54, background: "#2A2015", border: "none", borderRadius: 18, color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 8px 28px rgba(42,32,21,0.3)", transition: "transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >🔀 New Practice</button>
        </div>
      </div>

      {flashcardOpen && <Flashcard onClose={() => setFlashcardOpen(false)} words={filteredWords} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} allTopics={allTopics} />}
      {showDone && <DoneOverlay count={session.length} onNewList={getNewList} />}
    </div>
  );
}

// ─── Parent page ──────────────────────────────────────────────────────────────
function LearnedDateEditor({ word, onSave }) {
  const [val, setVal] = useState(word.learnedAt || "");
  const [dirty, setDirty] = useState(false);

  const handleChange = (v) => { setVal(v); setDirty(true); };
  const handleSave = () => { onSave(val || null); setDirty(false); };
  const handleClear = () => { setVal(""); onSave(null); setDirty(false); };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="date" value={val} onChange={e => handleChange(e.target.value)}
        style={{
          border: `1.5px solid ${dirty ? "#C4943A" : val ? "#5A9E8A66" : "#C4943A55"}`,
          borderRadius: 8, padding: "3px 8px",
          fontFamily: "'Nunito',sans-serif", fontSize: 12,
          color: val ? "#2A6A50" : "#C4943A",
          background: val ? "#F0FAF6" : "#FFF9F0",
          cursor: "pointer", outline: "none",
        }} />
      {dirty && (
        <button onClick={handleSave} style={{ background: "#C4943A", border: "none", borderRadius: 7, color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 800, padding: "3px 9px", cursor: "pointer" }}>Save</button>
      )}
      {val && !dirty && (
        <button onClick={handleClear} title="Clear date" style={{ background: "none", border: "none", color: "#A0C0B0", cursor: "pointer", fontSize: 14, padding: "2px 4px" }}>×</button>
      )}
    </div>
  );
}

function TopicSelector({ selected, allTopics, onChange }) {
  const [newTopicMode, setNewTopicMode] = useState(false);
  const [newTopicVal, setNewTopicVal] = useState("");

  const toggle = (t) => {
    if (selected.includes(t)) onChange(selected.filter(x => x !== t));
    else onChange([...selected, t]);
  };

  const addNew = () => {
    const t = newTopicVal.trim();
    if (t && !selected.includes(t)) onChange([...selected, t]);
    setNewTopicVal(""); setNewTopicMode(false);
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {allTopics.map(t => {
          const active = selected.includes(t);
          const c = getTopicColor(t, allTopics);
          return (
            <button key={t} onClick={() => toggle(t)} style={{ padding: "4px 12px", borderRadius: 20, border: `2px solid ${active ? c : "#E0D0B8"}`, background: active ? c + "22" : "transparent", color: active ? c : "#8A7A5A", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>{t}</button>
          );
        })}
        {selected.filter(t => !allTopics.includes(t)).map(t => {
          const c = getTopicColor(t, [...allTopics, t]);
          return (
            <button key={t} onClick={() => toggle(t)} style={{ padding: "4px 12px", borderRadius: 20, border: `2px solid ${c}`, background: c + "22", color: c, fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t} ×</button>
          );
        })}
        {newTopicMode ? (
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <input autoFocus value={newTopicVal} onChange={e => setNewTopicVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addNew(); if (e.key === "Escape") { setNewTopicMode(false); setNewTopicVal(""); }}}
              placeholder="Topic name…"
              style={{ height: 30, borderRadius: 10, border: "1.5px solid #C4943A", padding: "0 10px", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, width: 110, outline: "none" }} />
            <button onClick={addNew} style={{ background: "#C4943A", border: "none", borderRadius: 8, color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 800, padding: "4px 10px", cursor: "pointer" }}>Add</button>
          </div>
        ) : (
          <button onClick={() => setNewTopicMode(true)} style={{ padding: "4px 12px", borderRadius: 20, border: "2px dashed #D0C0A8", background: "transparent", color: "#B0A080", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>＋ New</button>
        )}
      </div>
      {selected.length === 0 && <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "#D45A5A" }}>Select at least one topic</div>}
    </div>
  );
}

// ─── Image input with auto base64 conversion ─────────────────────────────────
// Shows a URL text field. On blur (or paste), fetches the image and converts
// it to a 400px base64 JPEG stored in form state. Shows live status.
function ImageInput({ value, onChange }) {
  // urlDraft: what's typed in the box (may differ from stored value if already b64)
  const [urlDraft, setUrlDraft] = useState(() =>
    value && value.startsWith("data:") ? "" : (value || "")
  );
  const [status, setStatus] = useState(
    value && value.startsWith("data:") ? "done" : "idle"
  ); // "idle" | "loading" | "done" | "error"

  // If parent resets form (add-word flow), sync back
  useEffect(() => {
    if (!value) { setUrlDraft(""); setStatus("idle"); }
  }, [value]);

  const convert = async (url) => {
    const trimmed = url.trim();
    if (!trimmed) { onChange(""); setStatus("idle"); return; }
    if (trimmed.startsWith("data:")) { onChange(trimmed); setStatus("done"); return; }
    setStatus("loading");
    const result = await fetchToBase64(trimmed);
    if (result.startsWith("data:")) {
      onChange(result);
      setStatus("done");
    } else {
      // fetchToBase64 fell back to URL (CORS/network issue) — store URL as-is
      onChange(result);
      setStatus("error");
    }
  };

  const displaySrc = value && value.startsWith("data:") ? value : urlDraft.trim() || null;

  const statusColor = { idle: "#B0A080", loading: "#C4943A", done: "#5A9E8A", error: "#D45A5A" };
  const statusMsg   = { idle: "", loading: "Fetching & converting…", done: "✓ Saved as offline image (400px)", error: "⚠ Couldn't fetch — URL saved, may not work offline" };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={urlDraft}
          onChange={e => setUrlDraft(e.target.value)}
          onBlur={e => convert(e.target.value)}
          onPaste={e => {
            // auto-trigger on paste without needing to click away
            const pasted = e.clipboardData.getData("text");
            setTimeout(() => convert(pasted), 50);
          }}
          placeholder="https://…"
          style={{ flex: 1, height: 44, borderRadius: 14, border: `2px solid ${status === "error" ? "#D45A5A" : status === "done" ? "#5A9E8A55" : "#E8DFC8"}`, background: "#FFFDF8", padding: "0 16px", fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#1A1008", outline: "none" }}
        />
        {status === "loading" && (
          <div style={{ width: 28, height: 28, border: "3px solid #E8DFC8", borderTop: "3px solid #C4943A", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
        )}
        {status === "done" && displaySrc && (
          <button onClick={() => { onChange(""); setUrlDraft(""); setStatus("idle"); }}
            title="Remove image"
            style={{ width: 28, height: 28, borderRadius: 8, background: "#F0EAD8", border: "none", cursor: "pointer", fontSize: 14, color: "#8A7A5A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        )}
      </div>

      {statusMsg[status] && (
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: statusColor[status], marginTop: 5 }}>
          {statusMsg[status]}
        </div>
      )}

      {displaySrc && (
        <div style={{ marginTop: 8, width: 80, height: 80, borderRadius: 12, overflow: "hidden", border: `2px solid ${status === "done" ? "#5A9E8A55" : "#E8DFC8"}`, flexShrink: 0 }}>
          <img src={displaySrc} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.currentTarget.style.display = "none"; }} />
        </div>
      )}
    </div>
  );
}

// ─── Shared word form (Add + Edit) ───────────────────────────────────────────
function WordForm({ initial, allWords, allTopics, onSave, onCancel, isEdit }) {
  const emptyForm = { word: "", meaning: "", topics: [], img: "", learnedAt: "" };
  const [form, setForm]         = useState(initial || emptyForm);
  const [formError, setFormError] = useState({});
  const [saved, setSaved]       = useState(false);

  const validate = () => {
    const e = {};
    if (!form.word.trim()) e.word = "Word is required";
    if (!form.meaning.trim()) e.meaning = "Meaning is required";
    if (form.topics.length === 0) e.topics = "Select at least one topic";
    if (!isEdit && allWords.some(w => w.word.trim().toLowerCase() === form.word.trim().toLowerCase()))
      e.word = "This word already exists";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    setFormError(e);
    if (Object.keys(e).length > 0) return;
    const word = {
      ...(initial || {}),
      id: initial?.id || Date.now(),
      word: form.word.trim().toLowerCase(),
      meaning: form.meaning.trim(),
      topics: form.topics,
      color: getTopicColor(form.topics[0], allTopics),
      img: form.img.trim() || "",
      learnedAt: form.learnedAt || null,
      score: initial?.score ?? 50,
    };
    onSave(word);
    if (!isEdit) {
      setForm({ ...emptyForm, topics: form.topics.slice(0, 1) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    }
  };

  const f = (field) => ({
    value: form[field],
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
  });

  const lbl = (text, hint) => (
    <label style={{ display: "block", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 800, color: "#6A5A40", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>
      {text}{hint && <span style={{ fontSize: 10, fontWeight: 600, color: "#B0A080", textTransform: "none", letterSpacing: 0 }}> {hint}</span>}
    </label>
  );
  const err = (field) => formError[field] && (
    <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "#D45A5A", marginTop: 4 }}>{formError[field]}</div>
  );
  const inputStyle = (hasErr) => ({ width: "100%", height: 48, borderRadius: 14, border: `2px solid ${hasErr ? "#D45A5A" : "#E8DFC8"}`, background: "#FFFDF8", padding: "0 16px", fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 700, color: "#1A1008", outline: "none" });

  return (
    <div style={{ padding: "20px 24px 32px" }}>
      {/* Word — readonly in edit mode */}
      <div style={{ marginBottom: 16 }}>
        {lbl("Word", "*")}
        <input {...f("word")} placeholder="e.g. elephant" readOnly={isEdit}
          style={{ ...inputStyle(formError.word), background: isEdit ? "#F5EFE0" : "#FFFDF8", color: isEdit ? "#8A7A5A" : "#1A1008", cursor: isEdit ? "default" : "text" }} />
        {isEdit && <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "#B0A080", marginTop: 3 }}>Word cannot be changed — delete and re-add if needed.</div>}
        {err("word")}
      </div>

      {/* Meaning */}
      <div style={{ marginBottom: 16 }}>
        {lbl("Meaning / Description", "*")}
        <textarea {...f("meaning")} placeholder="e.g. a very large grey animal with a long nose…" rows={3}
          style={{ width: "100%", borderRadius: 14, border: `2px solid ${formError.meaning ? "#D45A5A" : "#E8DFC8"}`, background: "#FFFDF8", padding: "12px 16px", fontFamily: "'Nunito',sans-serif", fontSize: 14, color: "#1A1008", outline: "none", resize: "vertical", lineHeight: 1.5 }} />
        {err("meaning")}
      </div>

      {/* Topics */}
      <div style={{ marginBottom: 16 }}>
        {lbl("Topics", "* (select one or more)")}
        <TopicSelector selected={form.topics} allTopics={allTopics} onChange={t => setForm(p => ({ ...p, topics: t }))} />
        {err("topics")}
      </div>

      {/* Image */}
      <div style={{ marginBottom: 16 }}>
        {lbl("Image URL", "(optional)")}
        <ImageInput
          value={form.img}
          onChange={img => setForm(p => ({ ...p, img }))}
        />
      </div>

      {/* Learned date */}
      <div style={{ marginBottom: 20 }}>
        {lbl("First Learned Date", "(leave blank = not learned yet)")}
        <input type="date" value={form.learnedAt || ""} onChange={e => setForm(p => ({ ...p, learnedAt: e.target.value }))}
          style={{ height: 44, borderRadius: 14, border: "2px solid #E8DFC8", background: "#FFFDF8", padding: "0 16px", fontFamily: "'Nunito',sans-serif", fontSize: 14, color: form.learnedAt ? "#1A1008" : "#B0A080", outline: "none", cursor: "pointer" }} />
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "#B0A080", marginTop: 4 }}>
          {form.learnedAt ? "✓ Word will be active for practice sessions." : "⚠ Word won't appear in practice until a date is set."}
        </div>
      </div>

      {/* Preview */}
      {form.word.trim() && (
        <div style={{ marginBottom: 20, background: "#FFFDF8", border: "2px solid #E8DFC8", borderRadius: 16, padding: "12px 14px" }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 10, fontWeight: 800, color: "#B0A080", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>Preview</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {form.img.trim() && (
              <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#F0EAD8" }}>
                <img src={form.img.trim()} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.currentTarget.style.display = "none"} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 16, color: "#1A1008" }}>{form.word.trim()}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "#8A7A5A", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.meaning.trim() || "—"}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                {form.topics.map(t => <TopicPill key={t} topic={t} color={getTopicColor(t, [...allTopics, ...form.topics])} small />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        {isEdit && (
          <button onClick={onCancel} style={{ flex: 1, height: 50, borderRadius: 16, background: "#F0EAD8", border: "none", fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, color: "#6A5A40", cursor: "pointer" }}>
            Cancel
          </button>
        )}
        <button onClick={handleSave} style={{ flex: 2, height: 50, borderRadius: 16, background: saved ? "#5A9E8A" : "#C4943A", border: "none", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: saved ? "0 4px 16px rgba(90,158,138,0.4)" : "0 4px 16px rgba(196,148,58,0.4)", transition: "background 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {saved ? "✓ Saved!" : isEdit ? "💾 Save Changes" : "＋ Add to Library"}
        </button>
      </div>
    </div>
  );
}

// ─── Edit sheet (slide-up overlay) ───────────────────────────────────────────
function EditSheet({ word, allWords, allTopics, onSave, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {/* Scrim */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(18,13,4,0.6)", backdropFilter: "blur(6px)", animation: "fadeIn 0.2s ease" }} />
      {/* Sheet */}
      <div style={{ position: "relative", zIndex: 1, background: "#F5F0E8", borderRadius: "24px 24px 0 0", maxHeight: "90vh", overflowY: "auto", animation: "slideUp 0.28s cubic-bezier(0.32,0,0.15,1)" }}>
        {/* Handle + header */}
        <div style={{ position: "sticky", top: 0, background: "#F5F0E8", zIndex: 2, padding: "14px 24px 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#D8CEBC", margin: "0 auto 14px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid #EAE0CC" }}>
            <div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 18, fontWeight: 900, color: "#1A1008" }}>Edit word</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "#8A7A5A", marginTop: 2 }}>{word.word}</div>
            </div>
            <button onClick={onClose} style={{ background: "#EAE0CC", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#6A5A40" }}>✕</button>
          </div>
        </div>
        <WordForm
          initial={{ ...word, learnedAt: word.learnedAt || "" }}
          allWords={allWords}
          allTopics={allTopics}
          isEdit
          onSave={(updated) => { onSave(updated); onClose(); }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

// ─── Settings tab ────────────────────────────────────────────────────────────
function SettingsTab({ config, onSave }) {
  const N = { fontFamily: "'Nunito',sans-serif" };
  const [study,     setStudy]     = useState(config?.wordsPerSession ?? DEFAULT_WORDS_PER_SESSION);
  const [challenge, setChallenge] = useState(config?.testPoolSize    ?? DEFAULT_TEST_POOL_SIZE);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSave({ wordsPerSession: study, testPoolSize: challenge });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const dirty = study !== (config?.wordsPerSession ?? DEFAULT_WORDS_PER_SESSION)
             || challenge !== (config?.testPoolSize ?? DEFAULT_TEST_POOL_SIZE);

  const StepInput = ({ label, sub, value, onChange, min, max }) => (
    <div style={{ background: "#FFFDF8", border: "2px solid #EAE0CC", borderRadius: 16, padding: "16px 18px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...N, fontSize: 15, fontWeight: 800, color: "#1A1008" }}>{label}</div>
          <div style={{ ...N, fontSize: 12, color: "#B0A080", marginTop: 2 }}>{sub}</div>
        </div>
        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#F0EAD8", borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
          <button
            onClick={() => onChange(Math.max(min, value - 1))}
            style={{ width: 40, height: 40, border: "none", background: "none", cursor: value <= min ? "default" : "pointer", fontSize: 20, color: value <= min ? "#C8BAA0" : "#2A2015", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}
          >−</button>
          <div style={{ ...N, fontSize: 18, fontWeight: 900, color: "#2A2015", minWidth: 32, textAlign: "center", padding: "0 4px" }}>
            {value}
          </div>
          <button
            onClick={() => onChange(Math.min(max, value + 1))}
            style={{ width: 40, height: 40, border: "none", background: "none", cursor: value >= max ? "default" : "pointer", fontSize: 20, color: value >= max ? "#C8BAA0" : "#2A2015", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}
          >+</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "24px 24px 48px" }}>
      <div style={{ ...N, fontSize: 12, fontWeight: 800, color: "#6A5A40", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 16 }}>Practice settings</div>

      <StepInput
        label="Study words per day"
        sub="How many words appear in the daily Study list"
        value={study}
        onChange={setStudy}
        min={3}
        max={30}
      />
      <StepInput
        label="Challenge pool size"
        sub="How many words are tested in a Challenge session"
        value={challenge}
        onChange={setChallenge}
        min={5}
        max={30}
      />

      <div style={{ ...N, fontSize: 12, color: "#B0A080", marginBottom: 20, lineHeight: 1.6 }}>
        Changes take effect the next time a new session is started. The current session is not affected.
      </div>

      <button
        onClick={handleSave}
        disabled={!dirty && !saved}
        style={{ width: "100%", height: 50, borderRadius: 16, border: "none", background: saved ? "#5A9E8A" : dirty ? "#C4943A" : "#D8D0C0", color: "#fff", ...N, fontSize: 15, fontWeight: 800, cursor: dirty || saved ? "pointer" : "default", boxShadow: dirty ? "0 4px 16px rgba(196,148,58,0.35)" : saved ? "0 4px 16px rgba(90,158,138,0.35)" : "none", transition: "background 0.25s" }}
      >
        {saved ? "✓ Saved!" : "Save settings"}
      </button>
    </div>
  );
}

// ─── Import / Export tab ─────────────────────────────────────────────────────
function ImportExportTab({ allWords, testHistory, writtenHistory, onImportWords, onImportHistory }) {
  const N = { fontFamily: "'Nunito',sans-serif" };
  const fileRef = useRef(null);

  // ── Export options ────────────────────────────────────────────────────────
  const [exportOpts, setExportOpts] = useState({
    learnedDates: true,
    scores:       true,
    testHistory:  true,
    writtenHistory: true,
  });
  const [exportStatus, setExportStatus] = useState(null);

  const handleExport = () => {
    const words = allWords.map(w => {
      const out = { id: w.id, word: w.word, meaning: w.meaning, topics: w.topics, color: w.color, img: w.img };
      if (exportOpts.learnedDates)  out.learnedAt = w.learnedAt;
      if (exportOpts.scores)        out.score     = w.score ?? 50;
      return out;
    });
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      words,
      testHistory:    exportOpts.testHistory    ? testHistory    : [],
      writtenHistory: exportOpts.writtenHistory ? writtenHistory : [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `pick-word-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportStatus("done");
    setTimeout(() => setExportStatus(null), 2500);
  };

  // ── Import state ──────────────────────────────────────────────────────────
  const [importData, setImportData]   = useState(null);
  const [importOpts, setImportOpts]   = useState({ words: true, learnedDates: true, scores: true, testHistory: true, writtenHistory: true });
  const [importError, setImportError] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError(null); setImportData(null); setImportStatus(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.words || !Array.isArray(parsed.words)) throw new Error("bad format");
        setImportData(parsed);
      } catch {
        setImportError("Invalid file — please choose a Pick Word export JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData) return;
    const existingWords = new Set(allWords.map(w => w.word.toLowerCase()));

    if (importOpts.words) {
      const toAdd = importData.words
        .filter(w => !existingWords.has(w.word.toLowerCase()))
        .map(w => {
          const out = { ...w, id: Date.now() + Math.random() };
          if (!importOpts.learnedDates) out.learnedAt = null;
          if (!importOpts.scores)       out.score     = 50;
          return out;
        });
      onImportWords(toAdd);

      // For existing words: optionally merge learnedAt / score
      if (importOpts.learnedDates || importOpts.scores) {
        importData.words
          .filter(w => existingWords.has(w.word.toLowerCase()))
          .forEach(w => {
            const existing = allWords.find(x => x.word.toLowerCase() === w.word.toLowerCase());
            if (!existing) return;
            const updated = { ...existing };
            if (importOpts.learnedDates && w.learnedAt && !existing.learnedAt) updated.learnedAt = w.learnedAt;
            if (importOpts.scores && w.score !== undefined) updated.score = w.score;
            if (updated.learnedAt !== existing.learnedAt || updated.score !== existing.score)
              onImportWords([updated]); // triggers putWord via onAddWord — actually calls addWord which checks; fine for upsert
          });
      }
    }

    const histPayload = {};
    if (importOpts.testHistory    && importData.testHistory?.length)    histPayload.testHistory    = importData.testHistory;
    if (importOpts.writtenHistory && importData.writtenHistory?.length) histPayload.writtenHistory = importData.writtenHistory;
    if (Object.keys(histPayload).length) await onImportHistory(histPayload);

    setImportStatus("done");
    setImportData(null);
    if (fileRef.current) fileRef.current.value = "";
    setTimeout(() => setImportStatus(null), 3000);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const sectionTitle = (icon, text, sub) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ ...N, fontSize: 14, fontWeight: 900, color: "#2A2015" }}>{icon} {text}</div>
      {sub && <div style={{ ...N, fontSize: 12, color: "#B0A080", marginTop: 2 }}>{sub}</div>}
    </div>
  );

  const card = (children) => (
    <div style={{ background: "#FFFDF8", border: "2px solid #EAE0CC", borderRadius: 18, padding: "18px 18px", marginBottom: 24 }}>
      {children}
    </div>
  );

  const Toggle = ({ label, sub, checked, onChange }) => (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid #F0E8D8", cursor: "pointer" }}>
      <div style={{ position: "relative", width: 42, height: 24, flexShrink: 0, marginTop: 1 }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: checked ? "#C4943A" : "#D8D0C0", transition: "background 0.2s" }} />
        <div style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
      </div>
      <div>
        <div style={{ ...N, fontSize: 14, fontWeight: 800, color: "#1A1008" }}>{label}</div>
        {sub && <div style={{ ...N, fontSize: 11, color: "#B0A080", marginTop: 1 }}>{sub}</div>}
      </div>
    </label>
  );

  const stats = {
    words:   allWords.length,
    learned: allWords.filter(w => w.learnedAt).length,
    tests:   testHistory.length,
    written: writtenHistory.length,
  };

  return (
    <div style={{ padding: "24px 24px 60px" }}>

      {/* ── EXPORT ── */}
      {sectionTitle("📤", "Export", `${stats.words} words · ${stats.tests} test sessions · ${stats.written} written sessions`)}
      {card(<>
        <div style={{ ...N, fontSize: 13, fontWeight: 700, color: "#6A5A40", marginBottom: 10 }}>Choose what to include:</div>
        <Toggle label="Word list" sub="Word text, meaning, topics, images — always included" checked={true} onChange={() => {}} />
        <Toggle label="Learned dates" sub="When each word was first introduced" checked={exportOpts.learnedDates} onChange={v => setExportOpts(o => ({ ...o, learnedDates: v }))} />
        <Toggle label="Scores" sub="Test performance score per word (0–100)" checked={exportOpts.scores} onChange={v => setExportOpts(o => ({ ...o, scores: v }))} />
        <Toggle label="Test history" sub={`${stats.tests} challenge session${stats.tests !== 1 ? "s" : ""} with per-word results`} checked={exportOpts.testHistory} onChange={v => setExportOpts(o => ({ ...o, testHistory: v }))} />
        <div style={{ borderBottom: "none" }}>
          <Toggle label="Written history" sub={`${stats.written} practice session${stats.written !== 1 ? "s" : ""} with word lists`} checked={exportOpts.writtenHistory} onChange={v => setExportOpts(o => ({ ...o, writtenHistory: v }))} />
        </div>
        <button onClick={handleExport} style={{ width: "100%", height: 48, borderRadius: 14, background: exportStatus === "done" ? "#5A9E8A" : "#C4943A", border: "none", color: "#fff", ...N, fontSize: 14, fontWeight: 800, cursor: "pointer", marginTop: 16, boxShadow: "0 4px 16px rgba(196,148,58,0.3)", transition: "background 0.3s" }}>
          {exportStatus === "done" ? "✓ Downloaded!" : "Download backup JSON"}
        </button>
      </>)}

      {/* ── IMPORT ── */}
      {sectionTitle("📥", "Import", "Merge data from a Pick Word backup file")}
      {card(<>
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleFileChange} style={{ display: "none" }} id="import-file-input" />
        <label htmlFor="import-file-input" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 14, border: "2px dashed #C4943A88", background: "#FFF8EE", cursor: "pointer", ...N, fontSize: 14, fontWeight: 700, color: "#C4943A", marginBottom: 14 }}>
          📂 Choose backup JSON file
        </label>

        {importError && (
          <div style={{ ...N, fontSize: 13, color: "#D45A5A", background: "#D45A5A12", border: "1px solid #D45A5A44", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>{importError}</div>
        )}
        {importStatus === "done" && (
          <div style={{ ...N, fontSize: 13, color: "#5A9E8A", background: "#5A9E8A12", border: "1px solid #5A9E8A44", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>✓ Import complete!</div>
        )}

        {importData && (() => {
          const newWords    = importData.words?.filter(w => !allWords.some(x => x.word.toLowerCase() === w.word.toLowerCase())) || [];
          const existWords  = importData.words?.filter(w =>  allWords.some(x => x.word.toLowerCase() === w.word.toLowerCase())) || [];
          const th = importData.testHistory?.length    || 0;
          const wh = importData.writtenHistory?.length || 0;
          return (
            <>
              {/* File summary */}
              <div style={{ background: "#F5EFE0", borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
                <div style={{ ...N, fontSize: 12, fontWeight: 800, color: "#8A7A5A", marginBottom: 6 }}>FILE CONTENTS</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[
                    [`${newWords.length} new words`, "#5A9E8A"],
                    [`${existWords.length} already in library`, "#B0A080"],
                    [`${th} test sessions`, "#6A8FD4"],
                    [`${wh} written sessions`, "#C4943A"],
                  ].map(([label, color]) => (
                    <div key={label} style={{ ...N, fontSize: 12, fontWeight: 700, color }}>{label}</div>
                  ))}
                </div>
              </div>

              <div style={{ ...N, fontSize: 13, fontWeight: 700, color: "#6A5A40", marginBottom: 10 }}>Choose what to import:</div>
              <Toggle label="New words" sub={`${newWords.length} words not yet in your library`} checked={importOpts.words} onChange={v => setImportOpts(o => ({ ...o, words: v }))} />
              <Toggle label="Learned dates" sub="Set learned dates on imported words" checked={importOpts.learnedDates} onChange={v => setImportOpts(o => ({ ...o, learnedDates: v }))} />
              <Toggle label="Scores" sub="Import practice scores for words" checked={importOpts.scores} onChange={v => setImportOpts(o => ({ ...o, scores: v }))} />
              <Toggle label="Test history" sub={`${th} challenge session${th !== 1 ? "s" : ""}`} checked={importOpts.testHistory} onChange={v => setImportOpts(o => ({ ...o, testHistory: v }))} />
              <div style={{ borderBottom: "none" }}>
                <Toggle label="Written history" sub={`${wh} practice session${wh !== 1 ? "s" : ""}`} checked={importOpts.writtenHistory} onChange={v => setImportOpts(o => ({ ...o, writtenHistory: v }))} />
              </div>
              <button onClick={handleImport}
                style={{ width: "100%", height: 48, borderRadius: 14, background: "#5A9E8A", border: "none", color: "#fff", ...N, fontSize: 14, fontWeight: 800, cursor: "pointer", marginTop: 16, boxShadow: "0 4px 16px rgba(90,158,138,0.3)" }}>
                Import selected data →
              </button>
            </>
          );
        })()}
      </>)}
    </div>
  );
}

// ─── Library tab with pagination ─────────────────────────────────────────────
const PAGE_SIZE = 10;

function LibraryTab({ allWords, allTopics, learnedCount, newCount, onEdit, onDelete, onUpdateLearnedAt, statusFilter, setStatusFilter, topicFilter, setTopicFilter, search, setSearch }) {
  const [page, setPage] = useState(1);

  const filtered = allWords
    .filter(w => topicFilter === "All" || (w.topics||[]).includes(topicFilter))
    .filter(w => statusFilter === "All" || (statusFilter === "Learned" ? w.learnedAt !== null : w.learnedAt === null))
    .filter(w => !search || w.word.toLowerCase().includes(search.toLowerCase()) || (w.topics||[]).join(" ").toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { setPage(1); }, [search, statusFilter, topicFilter]);
  const safePage = Math.min(page, totalPages);
  const pageWords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const N = { fontFamily: "'Nunito',sans-serif" };

  return (
    <div style={{ padding: "20px 24px 40px" }}>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#B0A080" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search words…"
          style={{ width: "100%", height: 42, borderRadius: 14, border: "2px solid #E8DFC8", background: "#FFFDF8", paddingLeft: 40, paddingRight: 14, ...N, fontSize: 14, color: "#2A2015", outline: "none" }} />
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[["All",`All (${allWords.length})`],["Learned",`Active (${learnedCount})`],["New",`Not learned yet (${newCount})`]].map(([key, label]) => (
          <button key={key} onClick={() => setStatusFilter(key)} style={{ padding: "5px 14px", borderRadius: 20, border: "2px solid", borderColor: statusFilter === key ? (key === "Learned" ? "#5A9E8A" : key === "New" ? "#C4943A" : "#2A2015") : "#E0D8C8", background: statusFilter === key ? (key === "Learned" ? "#5A9E8A18" : key === "New" ? "#C4943A18" : "#2A201518") : "transparent", color: statusFilter === key ? (key === "Learned" ? "#5A9E8A" : key === "New" ? "#C4943A" : "#2A2015") : "#8A7A5A", ...N, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}>{label}</button>
        ))}
      </div>

      {/* Topic filter */}
      {(() => {
        const statusFiltered = allWords.filter(w =>
          statusFilter === "All" || (statusFilter === "Learned" ? w.learnedAt !== null : w.learnedAt === null)
        );
        return (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 2, marginBottom: 16 }}>
            {["All", ...allTopics].map(t => {
              const c = t === "All" ? "#2A2015" : getTopicColor(t, allTopics);
              const cnt = t === "All" ? statusFiltered.length : statusFiltered.filter(w => (w.topics||[]).includes(t)).length;
              return (
                <button key={t} onClick={() => setTopicFilter(t)} style={{ flexShrink: 0, padding: "4px 12px", borderRadius: 20, border: "2px solid", borderColor: topicFilter === t ? c : "#E0D8C8", background: topicFilter === t ? c + "18" : "transparent", color: topicFilter === t ? c : "#8A7A5A", ...N, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                  {`${t === "All" ? "All topics" : t} (${cnt})`}
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Result summary */}
      {filtered.length > 0 && (
        <div style={{ ...N, fontSize: 12, color: "#B0A080", marginBottom: 12 }}>
          {filtered.length} word{filtered.length !== 1 ? "s" : ""} · showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", color: "#B0A080", fontSize: 14, padding: "32px 0" }}>No words match the current filter.</div>
      )}

      {/* Word cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pageWords.map(w => {
          const pc = w.color || getTopicColor((w.topics||[])[0]||"", allTopics);
          return (
            <div key={w.id} style={{ background: "#FFFDF8", border: `2px solid ${w.learnedAt ? "#F0EAD8" : "#F5DDB8"}`, borderRadius: 16, padding: "12px 14px", animation: "fadeSlideIn 0.25s ease both" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                {w.img && (
                  <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: pc + "18" }}>
                    <img src={w.img} alt={w.word} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.currentTarget.style.display = "none"} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <div style={{ ...N, fontWeight: 800, fontSize: 15, color: "#1A1008" }}>{w.word}</div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => onEdit(w)} title="Edit"
                        style={{ background: "#EEE8DA", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#7A6A50", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#C4943A22"; e.currentTarget.style.color = "#C4943A"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#EEE8DA"; e.currentTarget.style.color = "#7A6A50"; }}
                      >✏️</button>
                      <button onClick={() => onDelete(w.id)} title="Delete"
                        style={{ background: "#EEE8DA", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#7A6A50", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#D45A5A22"; e.currentTarget.style.color = "#D45A5A"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#EEE8DA"; e.currentTarget.style.color = "#7A6A50"; }}
                      >🗑</button>
                    </div>
                  </div>
                  <div style={{ ...N, fontSize: 12, color: "#8A7A5A", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.meaning}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {(w.topics||[]).map(t => <TopicPill key={t} topic={t} color={getTopicColor(t, allTopics)} small />)}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0E8D8", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ ...N, fontSize: 11, fontWeight: 700, color: "#B0A080", letterSpacing: 0.5, textTransform: "uppercase", flexShrink: 0 }}>First learned</div>
                <LearnedDateEditor word={w} onSave={val => onUpdateLearnedAt(w.id, val)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
            style={{ width: 36, height: 36, borderRadius: 10, border: "2px solid", borderColor: safePage === 1 ? "#EAE0CC" : "#D8CCB4", background: safePage === 1 ? "#F5F0E8" : "#FFFDF8", color: safePage === 1 ? "#C8BAA0" : "#6A5A40", cursor: safePage === 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>‹</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
            const near = Math.abs(n - safePage) <= 1;
            const edge = n === 1 || n === totalPages;
            if (!near && !edge) {
              // show single ellipsis slot between edge and window
              if (n === 2 && safePage > 3) return <span key={n} style={{ ...N, fontSize: 13, color: "#B0A080", width: 20, textAlign: "center" }}>…</span>;
              if (n === totalPages - 1 && safePage < totalPages - 2) return <span key={n} style={{ ...N, fontSize: 13, color: "#B0A080", width: 20, textAlign: "center" }}>…</span>;
              return null;
            }
            const active = n === safePage;
            return (
              <button key={n} onClick={() => setPage(n)}
                style={{ width: 36, height: 36, borderRadius: 10, border: "2px solid", borderColor: active ? "#C4943A" : "#E0D4BC", background: active ? "#C4943A" : "#FFFDF8", color: active ? "#fff" : "#6A5A40", cursor: "pointer", ...N, fontSize: 13, fontWeight: 800, transition: "all 0.15s" }}>
                {n}
              </button>
            );
          })}

          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            style={{ width: 36, height: 36, borderRadius: 10, border: "2px solid", borderColor: safePage === totalPages ? "#EAE0CC" : "#D8CCB4", background: safePage === totalPages ? "#F5F0E8" : "#FFFDF8", color: safePage === totalPages ? "#C8BAA0" : "#6A5A40", cursor: safePage === totalPages ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>›</button>
        </div>
      )}
    </div>
  );
}

// ─── Parent page ──────────────────────────────────────────────────────────────
function ParentPage({ allWords, onAddWord, onUpdateWord, onRemoveWord, onBack, allTopics, testHistory, writtenHistory, onImportHistory, config, onSaveConfig }) {
  const [tab, setTab]               = useState("library");
  const [topicFilter, setTopicFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch]         = useState("");
  const [deleteId, setDeleteId]     = useState(null);
  const [editWord, setEditWord]     = useState(null); // word being edited

  const updateLearnedAt = (id, val) => {
    const word = allWords.find(w => w.id === id);
    if (word) onUpdateWord({ ...word, learnedAt: val });
  };

  const learnedCount = allWords.filter(w => w.learnedAt !== null).length;
  const newCount     = allWords.filter(w => w.learnedAt === null).length;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Nunito',sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1A1208", padding: "28px 24px 0", position: "relative", overflow: "hidden" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: [80,50,60,40][i], height: [80,50,60,40][i], borderRadius: "50%", background: ["#C4943A","#7C9885","#6A8FD4","#D4716A"][i] + "14", top: ["-20px","20px","-10px","40px"][i], right: ["20px","100px","160px","60px"][i] }} />
        ))}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button onClick={onBack} style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.14)", borderRadius: 12, color: "rgba(255,255,255,0.7)", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>←</button>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: -0.4 }}>Parent Dashboard</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                {allWords.length} words · <span style={{ color: "#C4943A" }}>{learnedCount} active</span> · <span style={{ color: "rgba(255,255,255,0.3)" }}>{newCount} not learned yet</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            {[["library","📚 Library"],["add","＋ Add"],["io","⇅ Transfer"],["settings","⚙ Settings"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: "10px 0", border: "none", background: "none", fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 800, color: tab === key ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer", borderBottom: `3px solid ${tab === key ? "#C4943A" : "transparent"}`, transition: "all 0.2s" }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── LIBRARY TAB ── */}
      {tab === "library" && (
        <LibraryTab
          allWords={allWords}
          allTopics={allTopics}
          learnedCount={learnedCount}
          newCount={newCount}
          onEdit={setEditWord}
          onDelete={setDeleteId}
          onUpdateLearnedAt={updateLearnedAt}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          topicFilter={topicFilter}
          setTopicFilter={setTopicFilter}
          search={search}
          setSearch={setSearch}
        />
      )}

      {/* ── ADD WORD TAB ── */}
      {tab === "add" && (
        <WordForm
          allWords={allWords}
          allTopics={allTopics}
          isEdit={false}
          onSave={onAddWord}
        />
      )}

      {/* ── IMPORT/EXPORT TAB ── */}
      {tab === "io" && (
        <ImportExportTab
          allWords={allWords}
          testHistory={testHistory}
          writtenHistory={writtenHistory}
          onImportWords={(words) => words.forEach(w => onAddWord(w))}
          onImportHistory={onImportHistory}
        />
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === "settings" && (
        <SettingsTab config={config} onSave={onSaveConfig} />
      )}

      {/* Edit sheet */}
      {editWord && (
        <EditSheet
          word={editWord}
          allWords={allWords}
          allTopics={allTopics}
          onSave={onUpdateWord}
          onClose={() => setEditWord(null)}
        />
      )}

      {/* Delete modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(18,13,4,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24 }}>
          <div style={{ background: "#FFFDF8", borderRadius: 24, padding: "28px 24px", maxWidth: 320, width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.3)", animation: "popIn 0.25s ease" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 18, fontWeight: 900, color: "#1A1008", marginBottom: 8 }}>Delete this word?</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#8A7A5A", marginBottom: 24 }}>
              "{allWords.find(w => w.id === deleteId)?.word}" will be removed from the library.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, height: 46, borderRadius: 14, background: "#F0EAD8", border: "none", fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, color: "#6A5A40", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { onRemoveWord(deleteId); setDeleteId(null); }} style={{ flex: 1, height: 46, borderRadius: 14, background: "#D45A5A", border: "none", fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, color: "#fff", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── IndexedDB layer ──────────────────────────────────────────────────────────
const DB_NAME = "pick-word-db";
const DB_VERSION = 2;          // v2: adds testHistory + writtenHistory stores
const STORE_WORDS           = "words";
const STORE_SESSION         = "session";
const STORE_TEST_HISTORY    = "testHistory";
const STORE_WRITTEN_HISTORY = "writtenHistory";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE_WORDS))
        d.createObjectStore(STORE_WORDS, { keyPath: "id" });
      if (!d.objectStoreNames.contains(STORE_SESSION))
        d.createObjectStore(STORE_SESSION, { keyPath: "key" });
      if (!d.objectStoreNames.contains(STORE_TEST_HISTORY))
        d.createObjectStore(STORE_TEST_HISTORY, { keyPath: "id" });
      if (!d.objectStoreNames.contains(STORE_WRITTEN_HISTORY))
        d.createObjectStore(STORE_WRITTEN_HISTORY, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function idbGetAll(store) {
  return openDB().then(conn => new Promise((res, rej) => {
    const req = conn.transaction(store, "readonly").objectStore(store).getAll();
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  }));
}
function idbPut(store, record) {
  return openDB().then(conn => new Promise((res, rej) => {
    const req = conn.transaction(store, "readwrite").objectStore(store).put(record);
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  }));
}
function idbDelete(store, id) {
  return openDB().then(conn => new Promise((res, rej) => {
    const req = conn.transaction(store, "readwrite").objectStore(store).delete(id);
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  }));
}
function idbBulkPut(store, records) {
  return openDB().then(conn => new Promise((res, rej) => {
    const tx = conn.transaction(store, "readwrite");
    const s  = tx.objectStore(store);
    records.forEach(r => s.put(r));
    tx.oncomplete = () => res();
    tx.onerror    = () => rej(tx.error);
  }));
}

const db = {
  getAllWords:         () => idbGetAll(STORE_WORDS),
  putWord:            (w) => idbPut(STORE_WORDS, w),
  deleteWord:         (id) => idbDelete(STORE_WORDS, id),
  getSession:         (key) => openDB().then(conn => new Promise((res, rej) => {
    const req = conn.transaction(STORE_SESSION, "readonly").objectStore(STORE_SESSION).get(key);
    req.onsuccess = () => res(req.result ? req.result.value : null);
    req.onerror   = () => rej(req.error);
  })),
  putSession:         (key, value) => idbPut(STORE_SESSION, { key, value }),
  getAllTestHistory:   () => idbGetAll(STORE_TEST_HISTORY),
  addTestSession:     (r) => idbPut(STORE_TEST_HISTORY, r),
  bulkPutTestHistory: (rs) => idbBulkPut(STORE_TEST_HISTORY, rs),
  getAllWrittenHistory:   () => idbGetAll(STORE_WRITTEN_HISTORY),
  addWrittenSession:     (r) => idbPut(STORE_WRITTEN_HISTORY, r),
  bulkPutWrittenHistory: (rs) => idbBulkPut(STORE_WRITTEN_HISTORY, rs),
  seedWords: (words) => idbBulkPut(STORE_WORDS, words),
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [ready, setReady]     = useState(false);
  const [page, setPage]       = useState("child");
  const [allWords, setAllWordsState]       = useState([]);
  const [testHistory, setTestHistory]      = useState([]);
  const [writtenHistory, setWrittenHistory] = useState([]);
  const [config, setConfig] = useState({
    wordsPerSession: DEFAULT_WORDS_PER_SESSION,
    testPoolSize:    DEFAULT_TEST_POOL_SIZE,
  });

  // ── Bootstrap: load from IndexedDB, seed if empty ──
  useEffect(() => {
    (async () => {
      try {
        let words = await db.getAllWords();
        if (words.length === 0) {
          await db.seedWords(SEED_WORDS);
          words = SEED_WORDS;
        }
        setAllWordsState(words);
        const [th, wh, savedConfig] = await Promise.all([
          db.getAllTestHistory(),
          db.getAllWrittenHistory(),
          db.getSession("config"),
        ]);
        setTestHistory(th);
        setWrittenHistory(wh);
        if (savedConfig) setConfig(savedConfig);
      } catch (err) {
        console.error("IndexedDB init failed, falling back to seed data", err);
        setAllWordsState(SEED_WORDS);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const saveConfig = useCallback(async (newConfig) => {
    setConfig(newConfig);
    await db.putSession("config", newConfig);
  }, []);

  // ── Mutations: update React state + persist to IDB ──
  const addWord = useCallback(async (word) => {
    await db.putWord(word);
    setAllWordsState(ws => [...ws, word]);
  }, []);

  const updateWord = useCallback(async (updated) => {
    await db.putWord(updated);
    setAllWordsState(ws => ws.map(w => w.id === updated.id ? updated : w));
  }, []);

  const removeWord = useCallback(async (id) => {
    await db.deleteWord(id);
    setAllWordsState(ws => ws.filter(w => w.id !== id));
  }, []);

  const allTopics = Array.from(new Set(allWords.flatMap(w => w.topics || [])));

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5EFE0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 40, animation: "spin 1s linear infinite" }}>✏️</div>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 700, color: "#8A7A5A" }}>Loading Pick Word…</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5EFE0; }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes popIn { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        @keyframes headerIn { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        ::-webkit-scrollbar { width:0; }
        input, textarea, select { font-family:'Nunito',sans-serif; }
        input[type=date] { color-scheme: light; }
        input:focus, textarea:focus, select:focus { outline:none; border-color:#C4943A !important; box-shadow:0 0 0 3px #C4943A22 !important; }
      `}</style>
      {page === "child"
        ? <ChildPage
            allWords={allWords}
            allTopics={allTopics}
            onGoParent={() => setPage("parent")}
            dbSession={db}
            onUpdateWord={updateWord}
            config={config}
          />
        : <ParentPage
            allWords={allWords}
            allTopics={allTopics}
            onBack={() => setPage("child")}
            onAddWord={addWord}
            onUpdateWord={updateWord}
            onRemoveWord={removeWord}
            testHistory={testHistory}
            writtenHistory={writtenHistory}
            onImportHistory={async ({ testHistory: th, writtenHistory: wh }) => {
              if (th?.length) { await db.bulkPutTestHistory(th); setTestHistory(h => [...h, ...th]); }
              if (wh?.length) { await db.bulkPutWrittenHistory(wh); setWrittenHistory(h => [...h, ...wh]); }
            }}
            config={config}
            onSaveConfig={saveConfig}
          />}
    </>
  );
}