
class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer | null } = {};
  private isMuted = false;

  private constructor() {
    this.initializeAudioContext();
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Web Audio API not supported');
    }
  }

  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.audioContext || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private createSpinSound(): void {
    if (!this.audioContext || this.isMuted) return;

    // Create a spinning sound effect with multiple frequencies
    const frequencies = [200, 300, 400, 500];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq + Math.random() * 100, 0.1, 'sawtooth');
      }, index * 100);
    });
  }

  private createWinSound(): void {
    if (!this.audioContext || this.isMuted) return;

    // Create ascending victory sound
    const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.3, 'triangle');
      }, index * 150);
    });
  }

  private createLoseSound(): void {
    if (!this.audioContext || this.isMuted) return;

    // Create descending sad sound
    const frequencies = [400, 350, 300, 250];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.2, 'square');
      }, index * 100);
    });
  }

  private createClickSound(): void {
    if (!this.audioContext || this.isMuted) return;
    this.createBeep(800, 0.1, 'square');
  }

  private createCashSound(): void {
    if (!this.audioContext || this.isMuted) return;
    // Coin sound effect
    this.createBeep(1000, 0.1, 'sine');
    setTimeout(() => this.createBeep(1200, 0.1, 'sine'), 50);
  }

  play(soundType: 'spin' | 'win' | 'lose' | 'click' | 'cash'): void {
    if (this.isMuted) return;

    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (soundType) {
      case 'spin':
        this.createSpinSound();
        break;
      case 'win':
        this.createWinSound();
        break;
      case 'lose':
        this.createLoseSound();
        break;
      case 'click':
        this.createClickSound();
        break;
      case 'cash':
        this.createCashSound();
        break;
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }
}

export const soundManager = SoundManager.getInstance();
