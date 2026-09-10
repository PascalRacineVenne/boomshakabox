# Web Audio API ↔ Drum Machine Panel Map

A reference for mapping Web Audio API nodes/params to the physical knobs, switches, and
signal paths you'd find on an analog drum machine (TR-808/909 style) or a classic
subtractive synth voice. Use this when you're staring at a panel in your head and need
to know which Web Audio node plays that role.

## Signal path overview

A drum voice is basically: **source(s) → filter → amp → effects send → master bus.**
Every section below slots into one of those stages.

```
[VCO/Noise] → [VCF + Filter EG] → [VCA + Amp EG] → [Drive/Saturation] → [Delay/Reverb send] → [Master]
     ^               ^                    ^                 ^                    ^
  Oscillator/    BiquadFilterNode    GainNode + auto-   WaveShaperNode      DelayNode /
  AudioBuffer    + AudioParam        mation on .gain    (distortion curve)  ConvolverNode
  Source         automation
```

---

## Sound sources ("VCO" / "Noise" knobs)

| Panel control | Web Audio API | Notes |
|---|---|---|
| **Waveform select** (sine/tri/saw/square) | `OscillatorNode.type` | `"sine"`, `"triangle"`, `"sawtooth"`, `"square"`. No knob for in-between shapes — use `createPeriodicWave()` for a custom wavetable. |
| **Pitch / Tune knob** | `OscillatorNode.frequency` | Set with `.setValueAtTime(hz, time)`. Coarse/fine tune = just two oscillators offset in Hz or cents. |
| **Pitch envelope** (the "pitch drop" on kicks) | `.frequency.exponentialRampToValueAtTime(hz, time)` | The classic 808 kick "pitch sweep" knob — automate frequency downward right after trigger. |
| **Noise source** (white/pink noise generator) | `AudioBuffer` filled with `Math.random() * 2 - 1`, played via `AudioBufferSourceNode` | Web Audio has no built-in noise node — you generate the buffer yourself once and reuse it. |
| **Noise color** (white vs. pink vs. red) | Post-filter the same white noise buffer, or shape the buffer generation math | "Pink" noise = white noise through a specific filter/EQ curve; there's no native pink noise node. |
| **Sub oscillator** | A second `OscillatorNode` tuned an octave (or more) below the main one, mixed in via its own `GainNode` | Common on kick/bass voices for weight. |
| **FM / ring mod** (metallic hats/cymbals character) | Connect one `OscillatorNode`'s output directly into another oscillator's `.frequency` `AudioParam` (FM), or through a `GainNode` into a multiplier stage (ring mod) | The 808/909's hi-hat and cymbal voices use 6 square-wave oscillators mixed and heavily filtered — same idea, just more voices. |

---

## Filter section ("VCF" knobs)

| Panel control | Web Audio API | Notes |
|---|---|---|
| **Filter type switch** (LP/HP/BP/Notch) | `BiquadFilterNode.type` | `"lowpass"`, `"highpass"`, `"bandpass"`, `"notch"`, plus `"lowshelf"`, `"highshelf"`, `"peaking"`, `"allpass"` — more types than most hardware filters expose. |
| **Cutoff frequency knob** | `BiquadFilterNode.frequency` | In Hz. This is what we set to `1000` for the snare's highpass "snap" filter. |
| **Resonance / Emphasis knob** | `BiquadFilterNode.Q` | Boosts/peaks right at the cutoff. Higher Q = more resonant "squelch," same as cranking resonance on a Moog-style ladder filter. Doesn't change the rolloff slope. |
| **Filter slope switch** (12dB vs 24dB/oct) | Chain multiple `BiquadFilterNode`s in series | Each biquad is a fixed 2-pole (12dB/oct) filter — cascade two for 24dB/oct, matching a 4-pole ladder filter. |
| **Filter envelope amount knob** | Automate `.frequency` with `.setValueAtTime()` + `.exponentialRampToValueAtTime()` (or `.linearRampToValueAtTime()`), scaled by however much "amount" you want | There's no separate "envelope generator" object — you compute the envelope shape yourself and write it directly onto the `AudioParam` timeline. |
| **Filter envelope ADSR** | Same as above, chained: `setValueAtTime` (start) → ramp up over attack time → ramp down to sustain level → on release, ramp to 0 | See the ADSR section below — filter envelopes and amp envelopes use the exact same automation mechanics, just applied to `.frequency` instead of `.gain`. |
| **Keyboard tracking** (filter follows pitch) | Manually compute cutoff as a function of the oscillator's frequency before calling `.setValueAtTime()` | No built-in tracking — it's on you to do the math per trigger. |

---

## Amp section ("VCA" / envelope knobs)

| Panel control | Web Audio API | Notes |
|---|---|---|
| **Volume / Level knob** | `GainNode.gain` (static value) | `.setValueAtTime(level, time)` with no further automation. |
| **Amp envelope (ADSR)** | `GainNode.gain` automated over time | This is the VCA — nearly every "voice" in Web Audio ends in a `GainNode` that gets shaped like this. |
| ⤷ **Attack knob** | `.gain.linearRampToValueAtTime(peakLevel, now + attackTime)` starting from `.setValueAtTime(0, now)` | How fast it ramps up to full volume after trigger. Drum machines often have this fixed near-zero (instant hit) — that's why our snare code sets gain directly to `0.7` with no ramp-up. |
| ⤷ **Decay knob** | `.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime)` | Exponential ramp = the capacitor-discharge curve of an analog EG, not a linear fade — this is what our snare/tone decay uses. |
| ⤷ **Sustain knob** | The *level* (not a duration) that decay ramps down to and holds at, while the note/gate stays held | Drum voices are almost always "one-shot" — sustain is effectively 0, decay goes straight to silence. This is why percussion synthesis skips ADS and is really just a "D" (decay) envelope. |
| ⤷ **Release knob** | On note-off: `.gain.cancelScheduledValues(now)` then `.setValueAtTime(currentGain, now)` then ramp to `0` over the release time | Only matters for sustained/held voices; irrelevant for a one-shot drum hit that already decays to silence on its own. |
| **Velocity sensitivity** | Scale the initial `.gain` value (and optionally decay time / filter cutoff) by a 0–1 velocity number before scheduling | No built-in velocity concept — MIDI velocity (if you're reading it) is just a number you multiply into your envelope math. |

---

## Modulation ("LFO" knobs)

| Panel control | Web Audio API | Notes |
|---|---|---|
| **LFO** (periodic modulation source) | A second `OscillatorNode` (usually very low frequency, e.g. 0.5–10Hz) connected into the `AudioParam` you want to wobble — `.frequency`, `.detune`, a `GainNode.gain`, or a filter's `.frequency` | Web Audio has no dedicated "LFO node" — an LFO is just a regular oscillator whose output feeds a control-rate parameter instead of the speaker. Its own output never touches `destination`. |
| **LFO rate knob** | The modulator `OscillatorNode.frequency` | How fast the wobble cycles. |
| **LFO depth/amount knob** | A `GainNode` inserted between the LFO oscillator and the destination `AudioParam`, scaling how big the wobble swings | LFO → GainNode(depth) → target `AudioParam`. |
| **LFO waveform** (sine/square/S&H) | The modulator oscillator's `.type` | Sample & hold (random stepped values) has no built-in type — you'd need an `AudioWorklet` or a scheduled series of `setValueAtTime` steps with random values. |
| **Pitch/Filter/Amp mod destination switch** | Which `AudioParam` you `.connect()` the LFO's `GainNode` output into | Same LFO oscillator can drive multiple destinations simultaneously by connecting its depth-`GainNode` output to more than one `AudioParam`. |

---

## Drive / distortion ("Saturation" knob)

| Panel control | Web Audio API | Notes |
|---|---|---|
| **Drive / Saturation / Overdrive knob** | `WaveShaperNode.curve` — a `Float32Array` mapping input samples to output samples through a nonlinear (typically `tanh`-like) curve | The "amount" knob controls how aggressive the curve is (steepness), which you bake into the curve array yourself, e.g. `Math.tanh(amount * x)`. |
| **Oversampling** (cleans up aliasing from clipping) | `WaveShaperNode.oversample = "2x"` or `"4x"` | Closest thing to the anti-aliasing filtering some analog-modeled hardware does internally before/after clipping. |
| **Bit crush / lo-fi knob** | Not built in — implement via `AudioWorkletNode` (quantize sample values, reduce effective sample rate) | No native bitcrusher node exists in Web Audio. |

---

## Time-based effects ("Delay" / "Reverb" sends)

| Panel control | Web Audio API | Notes |
|---|---|---|
| **Delay time knob** | `DelayNode.delayTime` | Max delay length is fixed at creation (`createDelay(maxDelayTime)`), default 1 second. |
| **Feedback knob** | A `GainNode` wired from the `DelayNode`'s output back into its own input (`delay → feedbackGain → delay`) | There's no dedicated "feedback" parameter — you build the feedback loop yourself out of a gain node and a connection back on itself. |
| **Delay send/mix knob** | Split the dry signal: connect the source to both `destination` (dry) directly and to `DelayNode → destination` (wet), each through its own `GainNode` for level | Classic parallel send/return bus, same as a mixer's aux send knob. |
| **Reverb type / room size** | `ConvolverNode.buffer` — loaded with an impulse response (IR) recording of a real or synthesized space | Changing "room size" means swapping in a different IR file — there's no parametric room-size knob, since convolution reverb is fundamentally sample-playback-based. |
| **Reverb decay/algorithmic reverb** | Not native — either use a longer/shorter IR in `ConvolverNode`, or build a Schroeder/FDN-style reverb yourself from a network of `DelayNode`s + feedback `GainNode`s + filters | Web Audio only ships convolution reverb natively; algorithmic (knob-controllable) reverb is DIY. |
| **Reverb send/mix knob** | Same dry/wet split pattern as delay send, using two `GainNode`s | |

---

## Mixer / master section

| Panel control | Web Audio API | Notes |
|---|---|---|
| **Channel volume fader** | Per-voice `GainNode` right before it joins the mix bus | |
| **Pan knob** | `StereoPannerNode.pan` (-1 = left, 0 = center, 1 = right) | |
| **Master volume** | One final `GainNode` that everything routes through before `audioCtx.destination` | |
| **Master limiter/compressor** | `DynamicsCompressorNode` (`threshold`, `ratio`, `attack`, `release`, `knee`) | Stock hardware drum machines don't usually have this on the master out, but modern DAWs/mixers always do — the params map almost 1:1 to a hardware compressor's knobs. |
| **Metering** | `AnalyserNode` (read `getByteFrequencyData` / `getByteTimeDomainData`) | For VU meters / spectrum displays, not for shaping the sound itself. |

---

## Trigger / sequencing concepts

| Panel control | Web Audio API | Notes |
|---|---|---|
| **Pad hit / step trigger** | Creating and `.start()`-ing new source nodes (oscillators, buffer sources) at a scheduled `AudioContext.currentTime` | Nodes are **one-shot**: once `.stop()`'d, they're discarded — you build a fresh oscillator/buffer source per hit rather than "retriggering" a persistent one, unlike a real VCO that just gets re-gated. |
| **Sequencer clock / tempo** | Your own scheduling loop, computing `audioCtx.currentTime + stepDuration` for each step and calling `.start(scheduledTime)` ahead of time | No built-in sequencer or tempo/clock object — this is the classic "Web Audio scheduling" pattern (look-ahead scheduler + `setTimeout`), since `AudioContext.currentTime` is your only clock reference. |
| **Accent** | Scale that trigger's initial `GainNode` value up for one hit | Just a per-trigger velocity/gain multiplier. |

---

## Where this project's snare code lands on this map

In [src/App.tsx](src/App.tsx), the 808 snare emulation uses:
- **Tone voice**: two `OscillatorNode`s (`triangle`, no filter) → `GainNode` with an instant-attack, exponential-decay envelope (Amp EG, no filter EG on this voice).
- **Snap voice**: `AudioBufferSourceNode` (white noise) → `BiquadFilterNode` (`highpass`, fixed cutoff — this is the VCF, no filter envelope) → its own `GainNode` decay envelope.
- No LFO, saturation, delay, or reverb yet — those are the natural next knobs to add if you want to keep building this out.
