# Hi Tom

`useHiTomVoice` (`useHiTomVoice.ts`) pairs with `HiTomPad` (`HiTomPad.tsx`).
A single sine oscillator with a short pitch-drop, tuned by a bandpass filter
and lightly saturated, driven by its own amplitude envelope.

This voice's code is byte-for-byte identical to Mid Tom and Low Tom aside
from its tone range/default — see [Notes](#notes).

## Signal flow

```mermaid
flowchart LR
    OSC["Oscillator (sine)\nstarts at Tone × 1.15 (fixed)\ndrops to Tone over 25ms (fixed)"]
    BP["Bandpass\nfreq = Tone, Q = 3 (fixed)"]
    DIST["Distortion\namount = 0.04 (fixed)"]
    MAKEUP["Gain\nmakeup, derived from amount (fixed)"]
    AMP["Gain\nexp. decay = Decay\npeak = Volume × mute × velocity"]
    PAN["Panner\nposition = Pan"]
    OUT["masterBusInput"]
    SCOPE["Voice Scope\n(Tone.Waveform tap)"]

    OSC --> BP --> DIST --> MAKEUP --> AMP --> PAN --> OUT
    PAN -.-> SCOPE
```

## Knobs

| Knob   | Range      | Controls                                                    |
| ------ | ---------- | -------------------------------------------------------------- |
| Tone   | 165–220 Hz | Oscillator's settle frequency and the bandpass's center freq (tied together) |
| Decay  | 0.08–3s    | Envelope decay                                                  |
| Volume | 0–100%     | Envelope peak level                                             |
| Pan    | -100–100   | Stereo position                                                 |

## Notes

- **Pitch drop is fixed**: the oscillator always starts 1.15× above the
  Tone knob's value and glides down to it over a fixed 25ms — this ratio
  and timing aren't exposed.
- **Distortion is fixed and self-compensating**: a small (0.04) saturation
  amount, with its makeup gain computed via the shared
  `distortionMakeupGain` helper (`lib/distortionMakeupGain.ts`) rather than
  a hand-tuned constant — the same helper Mid Tom and Low Tom use.
- **Same graph shape as Mid Tom/Low Tom**: `useMidTomVoice.ts` and
  `useLowTomVoice.ts` are identical to this file except for their
  `TONE_MIN`/`TONE_MAX`/default-tone constants (120–160/140 and 80–100/90
  respectively, vs. this voice's 165–220/190). If you're changing this
  voice's structure, the other two tom voices almost certainly need the
  same change.
- **Per-hit node construction**: like every voice in this app, the full
  chain above is built fresh on each hit and disposed afterward.
