import { useCallback, useEffect, useRef } from "react";
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

  if (envelopeRef.current === null) {
    envelopeRef.current = new Tone.AmplitudeEnvelope({
      ...DEFAULT_ADSR,
      ...initialADSR,
    });
  }

  useEffect(() => {
    return () => {
      envelopeRef.current?.dispose();
      envelopeRef.current = null;
    };
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
  }, []);

  return {
    envelopeRef,
    trigger,
    setADSR,
  };
};
