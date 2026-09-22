import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

export const STEP_COUNT = 16;

/**
 * Every track the sequencer knows about. Adding an instrument (see
 * ARCHITECTURE-SPEC.MD's plan for Tom1, HH Closed, etc.) means adding its
 * id here and passing its voice into `useStepSequencer`'s `voices`
 * argument at the call site — nothing inside this file's scheduler loop
 * needs to change.
 */
export const TRACK_IDS = [
  "kick",
  "snare",
  "hiTom",
  "midTom",
  "lowTom",
  "hihat",
  "hihatOpen",
] as const;
export type TrackId = (typeof TRACK_IDS)[number];

/** Display name per track — shared by `StepSequencer`'s grid label and `MiniGrid`'s rows. */
export const TRACK_LABELS: Record<TrackId, string> = {
  kick: "BD",
  snare: "SN",
  hiTom: "HT",
  midTom: "MT",
  lowTom: "LT",
  hihat: "CH",
  hihatOpen: "OH",
};

type TriggerFn = (scheduledTime?: number) => void;

type Voices = Record<TrackId, { trigger: TriggerFn }>;

const emptyPattern = (): boolean[] => Array(STEP_COUNT).fill(false);

const initialPatterns = (): Record<TrackId, boolean[]> =>
  Object.fromEntries(TRACK_IDS.map((id) => [id, emptyPattern()])) as Record<
    TrackId,
    boolean[]
  >;

/**
 * The step sequencer's scheduling and pattern-state layer.
 *
 * There's one 16-step pattern *per instrument*, and all of them are
 * always live — once the Transport is playing, every track's pattern
 * triggers on its own steps simultaneously, regardless of which one the
 * grid is currently showing. Only one instrument's pattern is
 * visible/editable in the UI at a time, chosen by pressing that
 * instrument's own pad (see `StepSequencer.tsx`) — the same "select a
 * track, edit its steps, everything still plays together" workflow a
 * hardware drum machine's shared step-LED row uses.
 *
 * Follows ARCHITECTURE-SPEC.MD's three-layer split: `patternsRef` is
 * mutable and read by the single `Tone.Transport` scheduler below;
 * `patternsDisplay`/`currentStep` are `useState` mirrors whose only job is
 * driving the visual grid/playhead.
 *
 * Reuses the sound recipes already built for each instrument's own
 * `useXVoice` hook (passed in via `voices`) rather than a separate
 * sequencer-specific synth — the scheduler calls the exact same `trigger`
 * a manual pad press would call, just at a precise Transport time instead
 * of "now."
 *
 * @param voices - One entry per {@link TrackId}, each with the `trigger`
 * function this schedules (from that instrument's `useXVoice` hook).
 * @returns The display-only pattern/playhead state, the currently
 * selected track, and handlers for toggling steps and switching tracks.
 */
export const useStepSequencer = (voices: Voices) => {
  const patternsRef = useRef<Record<TrackId, boolean[]>>(initialPatterns());
  const [patternsDisplay, setPatternsDisplay] =
    useState<Record<TrackId, boolean[]>>(initialPatterns);
  const [selectedTrack, setSelectedTrack] = useState<TrackId>(TRACK_IDS[0]);
  const [currentStep, setCurrentStep] = useState(0);

  // Each voice's trigger gets a new identity whenever that pad's knobs
  // change (a fresh closure over the new tone/decay/volume values). The
  // scheduler below is created once in a mount-only effect, so it reads
  // through this ref — kept current every render — to always call the
  // CURRENT trigger rather than whatever was current at mount (the same
  // "live params ref" pattern ARCHITECTURE-SPEC.MD uses for scheduler
  // callbacks in general).
  const voicesRef = useRef(voices);
  useEffect(() => {
    voicesRef.current = voices;
  });

  // A ref (not a plain closure variable) specifically so the "stop"
  // listener below can reset it too — both this and the scheduler
  // callback need to share the same counter.
  const stepCountRef = useRef(0);

  useEffect(() => {
    const eventId = Tone.getTransport().scheduleRepeat((time) => {
      const step = stepCountRef.current % STEP_COUNT;
      stepCountRef.current += 1;

      TRACK_IDS.forEach((id) => {
        if (patternsRef.current[id][step]) {
          voicesRef.current[id].trigger(time);
        }
      });

      // UI playhead sync via Tone.Draw, never requestAnimationFrame or a
      // raw state timer (ARCHITECTURE-SPEC.MD rule 1).
      Tone.getDraw().schedule(() => setCurrentStep(step), time);
    }, "16n");

    // Transport.stop() resets the Transport's own position to 0, but
    // stepCountRef is a separate counter this scheduler keeps — without
    // this, pressing Stop then Play again would resume mid-pattern
    // instead of restarting at step 1, since stepCountRef would still
    // hold whatever value it was at when stopped. Listening on the
    // Transport's own "stop" event (rather than exposing a `stop`
    // function from this hook) keeps this decoupled from whatever UI
    // calls `Tone.getTransport().stop()` — see `TransportControls.tsx`.
    // `Transport.pause()` deliberately does NOT emit this, so pausing
    // and resuming still continues from where it paused.
    const handleTransportStop = () => {
      stepCountRef.current = 0;
      setCurrentStep(0);
    };
    Tone.getTransport().on("stop", handleTransportStop);

    return () => {
      Tone.getTransport().clear(eventId);
      Tone.getTransport().off("stop", handleTransportStop);
    };
  }, []);

  const setStep = (stepIndex: number, active: boolean) => {
    const track = selectedTrack;
    const updated = patternsRef.current[track].slice();
    updated[stepIndex] = active;
    patternsRef.current[track] = updated; // 1. ref write — read by the scheduler's next pass over this step

    setPatternsDisplay((prev) => ({ ...prev, [track]: updated })); // 2. visual only
  };

  return {
    patternsDisplay,
    activePattern: patternsDisplay[selectedTrack],
    selectedTrack,
    selectTrack: setSelectedTrack,
    currentStep,
    setStep,
  };
};
