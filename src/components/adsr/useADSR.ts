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
  const [adsr, setAdsrState] = useState<ADSR>(() => ({
    ...DEFAULT_ADSR,
    ...initialADSR,
  }));

  useEffect(() => {
    const envelope = new Tone.AmplitudeEnvelope(adsr);
    envelopeRef.current = envelope;
    return () => {
      envelope.dispose();
      envelopeRef.current = null;
    };
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
