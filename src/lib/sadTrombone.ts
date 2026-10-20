// "Wah wah wah waaah" — a deflating trombone, synthesized so no audio file is needed.

const NOTES: { freq: number; dur: number }[] = [
  { freq: 293.66, dur: 0.38 }, // D4
  { freq: 277.18, dur: 0.38 }, // C#4
  { freq: 261.63, dur: 0.38 }, // C4
  { freq: 246.94, dur: 1.5 }, // B3, long and wobbly
];

function playNote(ctx: AudioContext, out: AudioNode, freq: number, start: number, dur: number, last: boolean) {
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 6;
  // "wah": the mute opens then closes on every note
  filter.frequency.setValueAtTime(350, start);
  filter.frequency.linearRampToValueAtTime(1500, start + 0.12);
  filter.frequency.exponentialRampToValueAtTime(500, start + dur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(1, start + 0.05);
  gain.gain.setValueAtTime(1, start + dur * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  filter.connect(gain).connect(out);

  for (const detune of [-7, 7]) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.detune.value = detune;
    // each note scoops in slightly sharp and sags into pitch
    osc.frequency.setValueAtTime(freq * 1.03, start);
    osc.frequency.exponentialRampToValueAtTime(freq, start + 0.09);

    if (last) {
      // slowly deflating pitch with a sad vibrato
      osc.frequency.setValueAtTime(freq, start + 0.25);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, start + dur);
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = 5.5;
      depth.gain.setValueAtTime(0, start);
      depth.gain.linearRampToValueAtTime(freq * 0.025, start + 0.4);
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(start);
      lfo.stop(start + dur);
    }

    osc.connect(filter);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }
}

// Returns a function that silences it early.
export function playSadTrombone(ctx: AudioContext, delaySeconds = 0, volume = 0.22): () => void {
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);

  let t = ctx.currentTime + delaySeconds;
  NOTES.forEach((note, i) => {
    playNote(ctx, master, note.freq, t, note.dur, i === NOTES.length - 1);
    t += note.dur + 0.06;
  });

  return () => master.disconnect();
}
