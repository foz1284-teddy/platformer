class MidiSynth {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.notes = {};
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.3; // Master volume
  }

  // Convert MIDI note number to frequency
  midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // Create a simple square wave oscillator
  createOscillator(frequency) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    
    gainNode.gain.value = 0.1;
    
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    return { oscillator, gainNode };
  }

  // Play a note
  noteOn(note, velocity = 127) {
    if (this.notes[note]) return;
    
    const frequency = this.midiToFreq(note);
    const { oscillator, gainNode } = this.createOscillator(frequency);
    
    oscillator.start();
    this.notes[note] = { oscillator, gainNode };
  }

  // Stop a note
  noteOff(note) {
    if (!this.notes[note]) return;
    
    const { oscillator, gainNode } = this.notes[note];
    gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
    
    setTimeout(() => {
      oscillator.stop();
      delete this.notes[note];
    }, 100);
  }

  // Play a sequence of notes
  playSequence(notes, tempo = 120) {
    const beatDuration = 60 / tempo;
    let currentTime = this.audioContext.currentTime;

    notes.forEach(({ note, duration, velocity = 127 }) => {
      this.noteOn(note, velocity);
      setTimeout(() => this.noteOff(note), currentTime * 1000);
      currentTime += duration * beatDuration;
    });
  }

  // Stop all notes
  stopAll() {
    Object.keys(this.notes).forEach(note => this.noteOff(parseInt(note)));
  }

  // Set master volume
  setVolume(volume) {
    this.gainNode.gain.value = volume;
  }
}

// Game melodies
const gameMelodies = {
  background: [
    // Main theme (C major)
    { note: 60, duration: 0.25 }, // C4
    { note: 64, duration: 0.25 }, // E4
    { note: 67, duration: 0.25 }, // G4
    { note: 72, duration: 0.25 }, // C5
    { note: 67, duration: 0.25 }, // G4
    { note: 64, duration: 0.25 }, // E4
    { note: 67, duration: 0.25 }, // G4
    { note: 72, duration: 0.25 }, // C5
    
    // Counter melody (A minor)
    { note: 69, duration: 0.25 }, // A4
    { note: 72, duration: 0.25 }, // C5
    { note: 76, duration: 0.25 }, // E5
    { note: 74, duration: 0.25 }, // D5
    { note: 72, duration: 0.25 }, // C5
    { note: 69, duration: 0.25 }, // A4
    { note: 67, duration: 0.25 }, // G4
    { note: 64, duration: 0.25 }, // E4
    
    // Bass line
    { note: 48, duration: 0.5 },  // C3
    { note: 55, duration: 0.5 },  // G3
    { note: 52, duration: 0.5 },  // E3
    { note: 48, duration: 0.5 },  // C3
  ],
  
  jump: [
    { note: 72, duration: 0.1 }, // C5
    { note: 76, duration: 0.1 }, // E5
    { note: 79, duration: 0.1 }, // G5
  ],
  
  win: [
    { note: 72, duration: 0.2 }, // C5
    { note: 76, duration: 0.2 }, // E5
    { note: 79, duration: 0.2 }, // G5
    { note: 84, duration: 0.4 }, // C6
  ],
  
  lose: [
    { note: 67, duration: 0.2 }, // G4
    { note: 64, duration: 0.2 }, // E4
    { note: 60, duration: 0.2 }, // C4
    { note: 55, duration: 0.4 }, // G3
  ]
}; 