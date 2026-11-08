import os
import wave
import struct
import numpy as np

SAMPLE_RATE = 44100
OUT_DIR = r"C:\Users\Hp\BioMart\video\public"

def save_wav(filename, samples, sample_rate=SAMPLE_RATE):
    # Ensure float32 in [-1, 1]
    samples = np.clip(samples, -1.0, 1.0)
    # Convert to 16-bit PCM
    int_samples = (samples * 32767).astype(np.int16)
    filepath = os.path.join(OUT_DIR, filename)
    with wave.open(filepath, "w") as f:
        f.setnchannels(1 if samples.ndim == 1 else samples.shape[1])
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(int_samples.tobytes())
    print(f"Saved {filename} ({os.path.getsize(filepath)} bytes)")

# 1. Bubble Pop (SFX)
def create_pop():
    dur = 0.12
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    # Frequency drops rapidly from 700 to 180 Hz
    freq = 700 * np.exp(-t * 25) + 150
    phase = np.cumsum(freq) / SAMPLE_RATE * 2 * np.pi
    env = np.exp(-t * 35)
    sig = np.sin(phase) * env * 0.7
    return sig

# 2. Whoosh (SFX)
def create_whoosh():
    dur = 0.35
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    noise = np.random.uniform(-1, 1, len(t))
    # Gaussian bell curve envelope
    env = np.exp(-((t - dur * 0.45) ** 2) / (2 * (0.08 ** 2)))
    # Simple low-pass smoothing
    kernel = np.ones(30) / 30
    smoothed_noise = np.convolve(noise, kernel, mode="same")
    sig = smoothed_noise * env * 0.8
    return sig

# 3. Telegram Chime (SFX)
def create_telegram_chime():
    dur = 0.4
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    sig = np.zeros_like(t)
    
    # Note 1: 1318 Hz (E6) at t = 0
    t1 = t
    env1 = np.exp(-t1 * 18)
    sig += np.sin(2 * np.pi * 1318 * t1) * env1 * 0.45
    sig += np.sin(2 * np.pi * 2636 * t1) * env1 * 0.15
    
    # Note 2: 1760 Hz (A6) at t = 0.08s
    delay = 0.08
    idx_delay = int(SAMPLE_RATE * delay)
    t2 = t[idx_delay:] - delay
    env2 = np.exp(-t2 * 12)
    sig[idx_delay:] += np.sin(2 * np.pi * 1760 * t2) * env2 * 0.55
    sig[idx_delay:] += np.sin(2 * np.pi * 3520 * t2) * env2 * 0.18
    return sig

# 4. Success Arpeggio (SFX)
def create_success_ding():
    dur = 0.6
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    sig = np.zeros_like(t)
    notes = [1046.5, 1318.5, 1567.98, 2093.0] # C6, E6, G6, C7
    for i, freq in enumerate(notes):
        delay = i * 0.07
        idx = int(SAMPLE_RATE * delay)
        t_note = t[idx:] - delay
        env = np.exp(-t_note * 10)
        sig[idx:] += np.sin(2 * np.pi * freq * t_note) * env * 0.35
    return sig

# 5. Background Lo-Fi Tech Beat (35 seconds)
def create_bg_music():
    total_dur = 35.0 # 35 seconds
    total_samples = int(SAMPLE_RATE * total_dur)
    t = np.linspace(0, total_dur, total_samples, False)
    music = np.zeros(total_samples)
    
    bpm = 115
    beat_dur = 60.0 / bpm
    total_beats = int(total_dur / beat_dur)
    
    # Kick & Snap
    for b in range(total_beats):
        b_time = b * beat_dur
        b_idx = int(b_time * SAMPLE_RATE)
        
        # Kick on beats 0, 2 (4/4 time)
        if b % 2 == 0:
            k_dur = 0.15
            k_samples = min(int(SAMPLE_RATE * k_dur), total_samples - b_idx)
            if k_samples > 0:
                k_t = np.linspace(0, k_dur, k_samples, False)
                k_freq = 130 * np.exp(-k_t * 30) + 40
                k_phase = np.cumsum(k_freq) / SAMPLE_RATE * 2 * np.pi
                k_env = np.exp(-k_t * 22)
                music[b_idx:b_idx+k_samples] += np.sin(k_phase) * k_env * 0.4
                
        # Rim/Snap on beats 1, 3
        if b % 2 == 1:
            s_dur = 0.08
            s_samples = min(int(SAMPLE_RATE * s_dur), total_samples - b_idx)
            if s_samples > 0:
                s_t = np.linspace(0, s_dur, s_samples, False)
                noise = np.random.uniform(-1, 1, s_samples) * np.exp(-s_t * 40)
                tone = np.sin(2 * np.pi * 880 * s_t) * np.exp(-s_t * 30)
                music[b_idx:b_idx+s_samples] += (noise * 0.3 + tone * 0.2)
                
    # Warm chords progression: Am9 -> Fmaj7 -> Cmaj7 -> G6
    # 4 beats per chord
    chords = [
        [220.0, 261.63, 329.63, 392.0, 493.88], # Am9 (A, C, E, G, B)
        [174.61, 220.0, 261.63, 329.63, 392.0], # Fmaj9 (F, A, C, E, G)
        [261.63, 329.63, 392.0, 493.88, 587.33], # Cmaj9 (C, E, G, B, D)
        [196.0, 246.94, 293.66, 392.0, 440.0],  # Gadd9 (G, B, D, G, A)
    ]
    
    measure_dur = beat_dur * 4
    total_measures = int(total_dur / measure_dur) + 1
    
    for m in range(total_measures):
        chord = chords[m % len(chords)]
        m_time = m * measure_dur
        m_idx = int(m_time * SAMPLE_RATE)
        m_samples = min(int(SAMPLE_RATE * measure_dur), total_samples - m_idx)
        if m_samples <= 0:
            break
            
        m_t = np.linspace(0, measure_dur, m_samples, False)
        # Gentle swell envelope
        env = np.sin(np.pi * m_t / measure_dur) ** 0.5 * 0.2
        
        chord_sig = np.zeros(m_samples)
        for freq in chord:
            # Soft sine with subtle overtone
            chord_sig += (np.sin(2 * np.pi * freq * m_t) * 0.6 + 
                          np.sin(2 * np.pi * freq * 2 * m_t) * 0.15)
            
        music[m_idx:m_idx+m_samples] += chord_sig * env * 0.25

    # Overall master volume (subtle background bed for voiceover)
    music = music * 0.35
    # Fade in and fade out
    fade_len = int(SAMPLE_RATE * 0.8)
    music[:fade_len] *= np.linspace(0, 1, fade_len)
    music[-fade_len:] *= np.linspace(1, 0, fade_len)
    
    return music

if __name__ == "__main__":
    save_wav("sfx_pop.wav", create_pop())
    save_wav("sfx_whoosh.wav", create_whoosh())
    save_wav("sfx_telegram.wav", create_telegram_chime())
    save_wav("sfx_success.wav", create_success_ding())
    save_wav("bg_music.wav", create_bg_music())
    print("All audio assets generated successfully!")
