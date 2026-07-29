"use client";

import { useMemo, useRef, useState } from "react";

type Chord = { name: string; roman: string; notes: string[] };
type ModeDef = {
  name: string;
  number: number;
  color: string;
  soft: string;
  feel: string;
  intervals: number[];
  steps: string;
  flavorDegree: number;
  flavorLabel: string;
};

const KEYS = [
  { name: "C", notes: ["C", "D", "E", "F", "G", "A", "B"] },
  { name: "G", notes: ["G", "A", "B", "C", "D", "E", "F♯"] },
  { name: "D", notes: ["D", "E", "F♯", "G", "A", "B", "C♯"] },
  { name: "A", notes: ["A", "B", "C♯", "D", "E", "F♯", "G♯"] },
  { name: "E", notes: ["E", "F♯", "G♯", "A", "B", "C♯", "D♯"] },
  { name: "B", notes: ["B", "C♯", "D♯", "E", "F♯", "G♯", "A♯"] },
  { name: "F♯", notes: ["F♯", "G♯", "A♯", "B", "C♯", "D♯", "E♯"] },
  { name: "D♭", notes: ["D♭", "E♭", "F", "G♭", "A♭", "B♭", "C"] },
  { name: "A♭", notes: ["A♭", "B♭", "C", "D♭", "E♭", "F", "G"] },
  { name: "E♭", notes: ["E♭", "F", "G", "A♭", "B♭", "C", "D"] },
  { name: "B♭", notes: ["B♭", "C", "D", "E♭", "F", "G", "A"] },
  { name: "F", notes: ["F", "G", "A", "B♭", "C", "D", "E"] },
];

const MODES: ModeDef[] = [
  { name: "Ionian", number: 1, color: "#f0b83f", soft: "#fff5d8", feel: "Bright, happy, resolved — the classic major sound. Triumphant and stable.", intervals: [0, 2, 4, 5, 7, 9, 11], steps: "W · W · H · W · W · W · H", flavorDegree: 6, flavorLabel: "Major 7th" },
  { name: "Dorian", number: 2, color: "#2a9d8f", soft: "#dff5f0", feel: "Cool, jazzy, minor but hopeful. Sophisticated with a raised 6th.", intervals: [0, 2, 3, 5, 7, 9, 10], steps: "W · H · W · W · W · H · W", flavorDegree: 5, flavorLabel: "Major 6th (♮6)" },
  { name: "Phrygian", number: 3, color: "#d65a4a", soft: "#fbe7e2", feel: "Dark, exotic, Spanish-flavored. Intense and mysterious.", intervals: [0, 1, 3, 5, 7, 8, 10], steps: "H · W · W · W · H · W · W", flavorDegree: 1, flavorLabel: "Flat 2nd (♭2)" },
  { name: "Lydian", number: 4, color: "#7e68c4", soft: "#eee9fb", feel: "Dreamy, floating, ethereal. Bright and magical with a raised 4th.", intervals: [0, 2, 4, 6, 7, 9, 11], steps: "W · W · W · H · W · W · H", flavorDegree: 3, flavorLabel: "Raised 4th (♯4)" },
  { name: "Mixolydian", number: 5, color: "#e47b35", soft: "#fff0e2", feel: "Rock, blues, folk. Like major but with a dominant, bluesy edge.", intervals: [0, 2, 4, 5, 7, 9, 10], steps: "W · W · H · W · W · H · W", flavorDegree: 6, flavorLabel: "Flat 7th (♭7)" },
  { name: "Aeolian", number: 6, color: "#4d77b6", soft: "#e7eef9", feel: "Sad, melancholic, natural minor. Emotional and introspective.", intervals: [0, 2, 3, 5, 7, 8, 10], steps: "W · H · W · W · H · W · W", flavorDegree: 5, flavorLabel: "Flat 6th (♭6)" },
  { name: "Locrian", number: 7, color: "#615967", soft: "#ece9ee", feel: "Unstable, tense, dissonant. The diminished tonic resists resolution.", intervals: [0, 1, 3, 5, 6, 8, 10], steps: "H · W · W · H · W · W · W", flavorDegree: 4, flavorLabel: "Flat 5th (♭5)" },
];

const PC: Record<string, number> = { C: 0, "C♯": 1, "D♭": 1, D: 2, "D♯": 3, "E♭": 3, E: 4, "E♯": 5, F: 5, "F♯": 6, "G♭": 6, G: 7, "G♯": 8, "A♭": 8, A: 9, "A♯": 10, "B♭": 10, B: 11 };
const SHARP = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const FLAT = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

const chordQuality = {
  major: { suffix: "", offsets: [0, 4, 7] },
  minor: { suffix: "m", offsets: [0, 3, 7] },
  dim: { suffix: "°", offsets: [0, 3, 6] },
  maj7: { suffix: "△7", offsets: [0, 4, 7, 11] },
  dom7: { suffix: "7", offsets: [0, 4, 7, 10] },
  min6: { suffix: "m6", offsets: [0, 3, 7, 9] },
} as const;

type Quality = keyof typeof chordQuality;
type ChordSpec = [number, Quality, string];

const chordSets: Record<string, { common: ChordSpec[]; character: ChordSpec[]; flavor: ChordSpec[]; insight: string }> = {
  Ionian: { common: [[0, "major", "I"], [1, "minor", "ii"], [3, "major", "IV"], [4, "major", "V"]], character: [[0, "maj7", "I△7"], [3, "major", "IV"], [4, "dom7", "V7"]], flavor: [[3, "major", "IV"], [0, "maj7", "I△7"]], insight: "Strong IV–V–I motion; major 7th on tonic" },
  Dorian: { common: [[0, "minor", "i"], [3, "major", "IV"], [4, "minor", "v"], [6, "major", "VII"]], character: [[0, "minor", "i"], [3, "major", "IV"]], flavor: [[3, "major", "IV"], [0, "min6", "im6"]], insight: "Minor tonic to major IV — the Dorian signature" },
  Phrygian: { common: [[0, "minor", "i"], [1, "major", "♭II"], [6, "major", "♭VII"], [5, "major", "♭VI"]], character: [[0, "minor", "i"], [1, "major", "♭II"]], flavor: [[1, "major", "♭II"], [5, "major", "♭VI"]], insight: "Half-step i–♭II move — instantly Phrygian" },
  Lydian: { common: [[0, "major", "I"], [1, "major", "II"], [6, "dim", "vii°"], [4, "major", "V"]], character: [[0, "major", "I"], [1, "major", "II"]], flavor: [[3, "major", "♯IV"], [0, "maj7", "I△7"]], insight: "Two major chords a whole step apart — the Lydian fingerprint" },
  Mixolydian: { common: [[0, "dom7", "I7"], [6, "major", "♭VII"], [3, "major", "IV"], [4, "minor", "v"]], character: [[0, "dom7", "I7"], [6, "major", "♭VII"]], flavor: [[6, "major", "♭VII"], [0, "dom7", "I7"]], insight: "I7–♭VII riff — quintessential rock/blues Mixolydian" },
  Aeolian: { common: [[0, "minor", "i"], [5, "major", "♭VI"], [6, "major", "♭VII"], [3, "minor", "iv"]], character: [[0, "minor", "i"], [5, "major", "♭VI"], [6, "major", "♭VII"], [0, "minor", "i"]], flavor: [[5, "major", "♭VI"], [2, "minor", "iiim"]], insight: "i–♭VI–♭VII–i loop — natural minor’s defining progression" },
  Locrian: { common: [[0, "dim", "i°"], [1, "major", "♭II"], [4, "major", "♭V"], [6, "major", "♭VII"]], character: [[0, "dim", "i°"], [1, "major", "♭II"]], flavor: [[4, "major", "♭V"], [0, "dim", "i°"]], insight: "Diminished tonic moving to ♭II — the Locrian hallmark" },
};

function noteName(pc: number, flats: boolean, preferred?: string) {
  if (preferred && PC[preferred] === (pc + 12) % 12) return preferred;
  return (flats ? FLAT : SHARP)[(pc + 12) % 12];
}

function useModeData(keyIndex: number, modeIndex: number) {
  return useMemo(() => {
    const parent = KEYS[keyIndex];
    const mode = MODES[modeIndex];
    const scale = [...parent.notes.slice(modeIndex), ...parent.notes.slice(0, modeIndex)];
    const rootPc = PC[scale[0]];
    const flats = parent.name.includes("♭") || parent.name === "F";
    const makeChord = ([degree, quality, roman]: ChordSpec): Chord => {
      const root = scale[degree];
      const q = chordQuality[quality];
      return {
        name: `${root}${q.suffix}`,
        roman,
        notes: q.offsets.map((offset, i) => noteName(rootPc + mode.intervals[degree] + offset, flats, i === 0 ? root : undefined)),
      };
    };
    const sets = chordSets[mode.name];
    const homeQuality: Quality = mode.name === "Ionian" || mode.name === "Lydian" ? "major" : mode.name === "Mixolydian" ? "dom7" : mode.name === "Locrian" ? "dim" : "minor";
    const homeRoman = mode.name === "Mixolydian" ? "I7" : mode.name === "Locrian" ? "i°" : homeQuality === "major" ? "I" : "i";
    return {
      parent, mode, scale, rootPc,
      home: makeChord([0, homeQuality, homeRoman]),
      common: sets.common.map(makeChord),
      character: sets.character.map(makeChord),
      flavor: sets.flavor.map(makeChord),
      insight: sets.insight,
      flavorNote: scale[mode.flavorDegree],
    };
  }, [keyIndex, modeIndex]);
}

function frequency(name: string, octave = 4) {
  const pc = PC[name];
  const midi = 12 * (octave + 1) + pc;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export default function Home() {
  const [keyIndex, setKeyIndex] = useState(0);
  const [modeIndex, setModeIndex] = useState(0);
  const [tempo, setTempo] = useState(112);
  const [wave, setWave] = useState<OscillatorType>("triangle");
  const [playing, setPlaying] = useState("");
  const audioRef = useRef<AudioContext | null>(null);
  const timers = useRef<number[]>([]);
  const data = useModeData(keyIndex, modeIndex);

  const audio = () => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    return audioRef.current;
  };

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying("");
  };

  const tone = (note: string, start = 0, length = 0.55, gain = 0.12, semitonesFromRoot?: number) => {
    const ctx = audio();
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = semitonesFromRoot === undefined
      ? frequency(note)
      : frequency(data.scale[0]) * Math.pow(2, semitonesFromRoot / 12);
    amp.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    amp.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.025);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + length);
    osc.connect(amp).connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + length + 0.03);
  };

  const playNote = (note: string) => {
    stop();
    setPlaying(note);
    tone(note, 0, 0.7, 0.16);
    timers.current = [window.setTimeout(() => setPlaying(""), 720)];
  };

  const playScale = () => {
    stop();
    const beat = 60 / tempo;
    const notes = [...data.scale, data.scale[0]];
    setPlaying("scale");
    notes.forEach((n, i) => tone(n, i * beat, beat * 0.82, 0.13, i === 7 ? 12 : data.mode.intervals[i]));
    timers.current = [window.setTimeout(() => setPlaying(""), notes.length * beat * 1000 + 150)];
  };

  const playChord = (chord: Chord) => {
    stop();
    setPlaying(chord.name);
    chord.notes.forEach((n) => tone(n, 0, 1.35, 0.07));
    timers.current = [window.setTimeout(() => setPlaying(""), 1400)];
  };

  const playProgression = (chords: Chord[], label: string) => {
    stop();
    const beat = 60 / tempo * 1.6;
    setPlaying(label);
    chords.forEach((chord, i) => chord.notes.forEach((n) => tone(n, i * beat, beat * 0.86, 0.055)));
    timers.current = [window.setTimeout(() => setPlaying(""), chords.length * beat * 1000 + 180)];
  };

  return (
    <main style={{ "--accent": data.mode.color, "--soft": data.mode.soft } as React.CSSProperties}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Mode Atlas home"><span>◒</span> MODE ATLAS</a>
        <div className="audio-controls">
          <label>Tempo <input aria-label="Tempo" type="range" min="70" max="170" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} /> <b>{tempo}</b></label>
          <label>Tone
            <select aria-label="Tone" value={wave} onChange={(e) => setWave(e.target.value as OscillatorType)}>
              <option value="triangle">Warm</option><option value="sine">Pure</option><option value="square">Reed</option><option value="sawtooth">Bright</option>
            </select>
          </label>
          <button className="stop" onClick={stop} disabled={!playing}>■ Stop</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">INTERACTIVE MODE EXPLORER</p>
          <h1>Hear the color<br />inside every key.</h1>
          <p className="lede">Explore all 84 mode–key combinations from the reference deck. Play every note, chord, and signature progression.</p>
        </div>
        <div className="orb" aria-hidden="true"><span>{data.scale[0]}</span><small>{data.mode.name}</small></div>
      </section>

      <nav className="key-strip" aria-label="Choose parent major key">
        <span>Parent key</span>
        <div>{KEYS.map((key, i) => <button key={key.name} className={i === keyIndex ? "active" : ""} onClick={() => { stop(); setKeyIndex(i); }}>{key.name}</button>)}</div>
      </nav>

      <nav className="mode-strip" aria-label="Choose musical mode">
        {MODES.map((mode, i) => (
          <button key={mode.name} className={i === modeIndex ? "active" : ""} onClick={() => { stop(); setModeIndex(i); }}>
            <span>{mode.number}</span><b>{mode.name}</b><small>{["MAJOR", "MINOR ♮6", "MINOR ♭2", "MAJOR ♯4", "MAJOR ♭7", "MINOR ♭6", "DIMINISHED"][i]}</small>
          </button>
        ))}
      </nav>

      <section className="mode-intro">
        <div className="mode-number">0{data.mode.number}</div>
        <div>
          <p className="eyebrow">MODE {data.mode.number} OF {data.parent.name} MAJOR</p>
          <h2>{data.scale[0]} <em>{data.mode.name}</em></h2>
          <p>{data.mode.feel}</p>
        </div>
        <div className="facts">
          <div><span>HOME</span><button onClick={() => playChord(data.home)}><b>{data.home.name}</b><small>{data.home.notes.join(" · ")}</small><i>▶</i></button></div>
          <div><span>FLAVOR NOTE</span><button onClick={() => playNote(data.flavorNote)}><b>{data.flavorNote}</b><small>{data.mode.flavorLabel}</small><i>♪</i></button></div>
        </div>
      </section>

      <section className="scale-section">
        <div className="section-heading">
          <div><p className="eyebrow">THE SCALE</p><h3>Tap a note. Hear the shape.</h3></div>
          <button className="primary" onClick={playScale}>{playing === "scale" ? "■ Playing…" : "▶ Play scale"}</button>
        </div>
        <div className="keyboard">
          {[...data.scale, data.scale[0]].map((note, i) => (
            <button key={`${note}-${i}`} className={`${i === 0 || i === 7 ? "tonic" : ""} ${i === data.mode.flavorDegree ? "flavor" : ""} ${playing === note ? "sounding" : ""}`} onClick={() => playNote(note)}>
              <span>{note}</span><small>{i === 0 || i === 7 ? "HOME" : i === data.mode.flavorDegree ? "FLAVOR" : i + 1}</small>
            </button>
          ))}
        </div>
        <div className="interval-line"><span>INTERVALS</span><b>{data.mode.steps}</b><small>{data.scale.join("  ·  ")}</small></div>
      </section>

      <section className="chords-section">
        <div className="section-heading">
          <div><p className="eyebrow">HARMONIC PALETTE</p><h3>Chords that reveal the mode.</h3></div>
          <p>Choose any chord to hear it. Play a row to hear the modal movement.</p>
        </div>
        <ChordRow title="Common chords" subtitle="The dependable harmonic vocabulary" chords={data.common} playing={playing} onChord={playChord} onAll={() => playProgression(data.common, "common")} />
        <ChordRow title="Character chords" subtitle={data.insight} chords={data.character} playing={playing} onChord={playChord} onAll={() => playProgression(data.character, "character")} featured />
        <ChordRow title="Flavor chords" subtitle={`Both spotlight ${data.flavorNote} — ${data.mode.flavorLabel.toLowerCase()}`} chords={data.flavor} playing={playing} onChord={playChord} onAll={() => playProgression(data.flavor, "flavor")} />
      </section>

      <section className="insight">
        <p className="eyebrow">KEY INSIGHT</p>
        <blockquote>“{data.insight}”</blockquote>
        <p>{data.scale[0]} {data.mode.name} · Mode {data.mode.number} of {data.parent.name} major · Home: {data.home.name} · Flavor: {data.flavorNote}</p>
      </section>

      <footer><span>MODE ATLAS</span><p>84 modal colors · 12 parent keys · 7 modes</p><small>Data adapted from “Musical Modes — Complete Reference”</small></footer>
    </main>
  );
}

function ChordRow({ title, subtitle, chords, playing, onChord, onAll, featured = false }: { title: string; subtitle: string; chords: Chord[]; playing: string; onChord: (c: Chord) => void; onAll: () => void; featured?: boolean }) {
  return (
    <div className={`chord-row ${featured ? "featured" : ""}`}>
      <div className="row-label"><h4>{title}</h4><p>{subtitle}</p><button onClick={onAll}>▶ Play row</button></div>
      <div className="chord-list">
        {chords.map((chord, i) => <button key={`${chord.name}-${i}`} className={playing === chord.name ? "sounding" : ""} onClick={() => onChord(chord)}><span>{chord.roman}</span><b>{chord.name}</b><small>{chord.notes.join(" · ")}</small><i>▶</i></button>)}
      </div>
    </div>
  );
}
