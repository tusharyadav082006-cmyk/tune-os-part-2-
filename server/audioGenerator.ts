import fs from 'fs';
import path from 'path';

/**
 * Generates a valid 16-bit PCM stereo WAV buffer containing actual musical melodies,
 * chords, and rhythmic patterns so that the audio player plays real music.
 */
export function generateMusicalWav(
  type: 'acoustic_romantic' | 'synthwave' | 'folk_classical' | 'dance_pop' | 'lofi_chill',
  durationSeconds: number = 24
): Buffer {
  const sampleRate = 44100;
  const numChannels = 2;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * numChannels * 2; // 16-bit = 2 bytes per sample per channel
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * 2, 28); // byte rate
  buffer.writeUInt16LE(numChannels * 2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // 'data' subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Musical notes frequencies (Hz)
  const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
  const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;
  const C3 = 130.81, G3 = 196.00, A3 = 220.00, F3 = 174.61;

  // Chord progression definitions
  let chords: { root: number; notes: number[]; bass: number }[] = [];

  if (type === 'acoustic_romantic') {
    // Romantic Hindi ballad progression: Am - F - C - G
    chords = [
      { root: A3, notes: [A4, C5, E5, A5], bass: A3 / 2 },
      { root: F3, notes: [F4, A4, C5, F5], bass: F3 / 2 },
      { root: C4, notes: [G4, C5, E5, G5], bass: C3 },
      { root: G3, notes: [G4, B4, D5, G5], bass: G3 / 2 },
    ];
  } else if (type === 'synthwave') {
    // 80s Neon Synthwave progression: Dm - Bb - C - Am
    chords = [
      { root: 293.66, notes: [293.66, 349.23, 440.0, 587.33], bass: 73.42 },
      { root: 233.08, notes: [233.08, 293.66, 349.23, 466.16], bass: 58.27 },
      { root: 261.63, notes: [261.63, 329.63, 392.0, 523.25], bass: 65.41 },
      { root: 220.0, notes: [220.0, 261.63, 329.63, 440.0], bass: 55.0 },
    ];
  } else if (type === 'folk_classical') {
    // Sitar / Indian classical raga acoustic progression (Bhairavi / Yaman pentatonic)
    chords = [
      { root: C4, notes: [C4, E4, G4, B4, D5], bass: C3 },
      { root: F3, notes: [F4, A4, C5, E5], bass: F3 },
      { root: G3, notes: [G4, B4, D5, F5], bass: G3 },
      { root: C4, notes: [C4, E4, G4, C5], bass: C3 },
    ];
  } else if (type === 'dance_pop') {
    // High energy Pop / Punjabi Dance progression
    chords = [
      { root: 220.0, notes: [440.0, 523.25, 659.25], bass: 110.0 },
      { root: 174.61, notes: [349.23, 440.0, 523.25], bass: 87.31 },
      { root: 261.63, notes: [523.25, 659.25, 783.99], bass: 130.81 },
      { root: 196.0, notes: [392.0, 493.88, 587.33], bass: 98.0 },
    ];
  } else {
    // Lo-Fi chillhop progression: Fmaj7 - Em7 - Dm7 - Cmaj7
    chords = [
      { root: 174.61, notes: [349.23, 440.0, 523.25, 659.25], bass: 87.31 },
      { root: 164.81, notes: [329.63, 392.0, 493.88, 587.33], bass: 82.41 },
      { root: 146.83, notes: [293.66, 349.23, 440.0, 523.25], bass: 73.42 },
      { root: 130.81, notes: [261.63, 329.63, 392.0, 493.88], bass: 65.41 },
    ];
  }

  const chordDuration = 3.0; // 3 seconds per chord
  const bpm = 110;
  const beatDuration = 60 / bpm;
  const arpSpeed = beatDuration / 2; // 8th notes

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const currentChordIndex = Math.floor(t / chordDuration) % chords.length;
    const currentChord = chords[currentChordIndex];
    const timeInChord = t % chordDuration;

    // Arpeggio note selector
    const arpIndex = Math.floor(t / arpSpeed) % currentChord.notes.length;
    const currentNoteFreq = currentChord.notes[arpIndex];

    // Envelope for arpeggio note (plucked sound with natural exponential decay)
    const timeInNote = t % arpSpeed;
    const noteEnv = Math.exp(-timeInNote * 7.5);

    // Main melodic synthesizer voice
    let melodySample = 0;
    if (type === 'synthwave') {
      // Sawtooth + square wave synth
      const saw = (2 * ((t * currentNoteFreq) % 1)) - 1;
      const square = Math.sin(2 * Math.PI * currentNoteFreq * t) > 0 ? 0.7 : -0.7;
      melodySample = (saw * 0.5 + square * 0.5) * noteEnv * 0.35;
    } else if (type === 'acoustic_romantic' || type === 'folk_classical') {
      // Warm acoustic harmonics
      const fund = Math.sin(2 * Math.PI * currentNoteFreq * t);
      const h2 = Math.sin(2 * Math.PI * currentNoteFreq * 2 * t) * 0.4;
      const h3 = Math.sin(2 * Math.PI * currentNoteFreq * 3 * t) * 0.2;
      melodySample = (fund + h2 + h3) * noteEnv * 0.4;
    } else {
      // Warm chime / lo-fi electric piano
      const fund = Math.sin(2 * Math.PI * currentNoteFreq * t);
      const h2 = Math.sin(2 * Math.PI * currentNoteFreq * 2.01 * t) * 0.3;
      melodySample = (fund + h2) * noteEnv * 0.35;
    }

    // Bass note
    const bassFreq = currentChord.bass;
    const bassEnv = Math.exp(-(timeInChord % (beatDuration * 2)) * 2.0);
    const bassSample = Math.sin(2 * Math.PI * bassFreq * t) * bassEnv * 0.35;

    // Gentle chord pad background
    let padSample = 0;
    for (let n = 0; n < currentChord.notes.length; n++) {
      padSample += Math.sin(2 * Math.PI * (currentChord.notes[n] / 2) * t) * 0.05;
    }

    // Percussion / rhythm click (soft kick on beats 1 and 3, snare on 2 and 4)
    const beatTime = t % beatDuration;
    const beatNumber = Math.floor(t / beatDuration) % 4;
    let drumSample = 0;

    if (beatNumber === 0 || beatNumber === 2) {
      // Kick drum: low sine pitch drop
      if (beatTime < 0.12) {
        const kickPitch = 120 * Math.exp(-beatTime * 35);
        drumSample = Math.sin(2 * Math.PI * kickPitch * beatTime) * Math.exp(-beatTime * 20) * 0.4;
      }
    } else {
      // Snare / clap: noise burst
      if (beatTime < 0.15) {
        const noise = (Math.random() * 2 - 1);
        drumSample = noise * Math.exp(-beatTime * 25) * 0.2;
      }
    }

    // Master mix
    let left = (melodySample * 0.85 + bassSample * 0.9 + padSample * 0.7 + drumSample * 0.8);
    let right = (melodySample * 0.75 + bassSample * 0.9 + padSample * 0.85 + drumSample * 0.8);

    // Master fade in / fade out to avoid clicks
    if (t < 0.5) {
      left *= t / 0.5;
      right *= t / 0.5;
    } else if (t > durationSeconds - 1.0) {
      const remaining = durationSeconds - t;
      left *= remaining;
      right *= remaining;
    }

    // Clamp
    left = Math.max(-1, Math.min(1, left));
    right = Math.max(-1, Math.min(1, right));

    const intLeft = Math.floor(left * 32767);
    const intRight = Math.floor(right * 32767);

    buffer.writeInt16LE(intLeft, offset);
    buffer.writeInt16LE(intRight, offset + 2);
    offset += 4;
  }

  return buffer;
}

export function ensureSampleAudioFiles(publicDir: string) {
  const audioDir = path.join(publicDir, 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const tracks: { filename: string; type: Parameters<typeof generateMusicalWav>[0] }[] = [
    { filename: 'tum_hi_ho.wav', type: 'acoustic_romantic' },
    { filename: 'kesariya_dil.wav', type: 'acoustic_romantic' },
    { filename: 'desi_beat.wav', type: 'dance_pop' },
    { filename: 'chaiyya_chords.wav', type: 'folk_classical' },
    { filename: 'kabira_strings.wav', type: 'acoustic_romantic' },
    { filename: 'midnight_city.wav', type: 'synthwave' },
    { filename: 'golden_hour.wav', type: 'acoustic_romantic' },
    { filename: 'as_it_was.wav', type: 'dance_pop' },
    { filename: 'sunset_lofi.wav', type: 'lofi_chill' },
    { filename: 'neon_cyber.wav', type: 'synthwave' },
  ];

  for (const track of tracks) {
    const filePath = path.join(audioDir, track.filename);
    if (!fs.existsSync(filePath)) {
      const wavBuffer = generateMusicalWav(track.type, 24);
      fs.writeFileSync(filePath, wavBuffer);
    }
  }
}
