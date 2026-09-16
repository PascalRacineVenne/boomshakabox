import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

export interface ADSR {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

const DEFAULT_ADSR: ADSR = {
  attack: 0.005,
  decay: 0.1,
  sustain: 0.7,
  release: 0.2,
};

export const useADSR = (initialADSR: Partial<ADSR> = {}) => {
  const envelopeRef = useRef<Tone.AmplitudeEnvelope | null>(null);

  // Mirrors what's applied to `envelopeRef.current` so a panel can read the
  // current values back out (Tone's own envelope object isn't reactive).
  // The lazy initializer form runs once, on mount only — same guarantee
  // the mount effect below relies on for `initialADSR`.
  const [adsr, setAdsrState] = useState<ADSR>(() => ({
    ...DEFAULT_ADSR,
    ...initialADSR,
  }));

  // Both the creation and disposal of the envelope live in this one effect
  // (rather than creating it eagerly in the render body and only disposing
  // here) specifically so StrictMode's dev-only mount→cleanup→mount replay
  // recreates it correctly: cleanup nulls `envelopeRef.current`, and the
  // replayed effect setup is what repopulates it. Splitting creation into
  // the render body previously left `envelopeRef.current` permanently null
  // after that replay settled, since nothing but a full re-render would
  // have re-run the old `if (envelopeRef.current === null)` guard.
  useEffect(() => {
    const envelope = new Tone.AmplitudeEnvelope(adsr);
    envelopeRef.current = envelope;
    return () => {
      envelope.dispose();
      envelopeRef.current = null;
    };
    // Deliberately mount-only: `adsr` here is only ever read for this
    // hook's first-render value, the same "seed it once" intent
    // `useState`'s lazy initializer above already relies on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trigger = useCallback(
    (duration: Tone.Unit.Time, time?: Tone.Unit.Time, velocity = 1) => {
      envelopeRef.current?.triggerAttackRelease(duration, time, velocity);
    },
    [],
  );

  const setADSR = useCallback((newADSR: Partial<ADSR>) => {
    const envelope = envelopeRef.current;
    if (!envelope) return;

    envelope.attack = newADSR.attack ?? envelope.attack;
    envelope.decay = newADSR.decay ?? envelope.decay;
    envelope.sustain = newADSR.sustain ?? envelope.sustain;
    envelope.release = newADSR.release ?? envelope.release;

    setAdsrState((current) => ({ ...current, ...newADSR }));
  }, []);

  return {
    ...adsr,
    envelopeRef,
    trigger,
    setADSR,
  };
};
