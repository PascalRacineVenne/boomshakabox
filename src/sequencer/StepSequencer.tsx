import { css } from "@linaria/core";
import TempoTransportPanel from "./TempoTransportPanel";
import MasterPanel from "../components/master/MasterPanel";
import FilterPanel from "../components/filter/FilterPanel";

import KickPad from "../components/kick/KickPad";
import SnarePad from "../components/snare/SnarePad";
import HiHatPad from "../components/hihat/HiHatPad";
import HiHatOpenPad from "../components/hihatOpen/HiHatOpenPad";
import HiTomPad from "../components/hiTom/HiTomPad";
import MidTomPad from "../components/midTom/MidTomPad";
import LowTomPad from "../components/lowTom/LowTomPad";

import { useKickVoice } from "../components/kick/useKickVoice";
import { useSnareVoice } from "../components/snare/useSnareVoice";
import { useHiHatVoice } from "../components/hihat/useHiHatVoice";
import { useHiHatOpenVoice } from "../components/hihatOpen/useHiHatOpenVoice";
import { useHiTomVoice } from "../components/hiTom/useHiTomVoice";
import { useMidTomVoice } from "../components/midTom/useMidTomVoice";
import { useLowTomVoice } from "../components/lowTom/useLowTomVoice";
import StepGrid from "./StepGrid";
import { useStepSequencer, type TrackId } from "./useStepSequencer";

const TRACK_LABELS: Record<TrackId, string> = {
  kick: "Kick",
  snare: "Snare",
  hihat: "HH Closed",
  hihatOpen: "HH Open",
  hiTom: "Hi Tom",
  midTom: "Mid Tom",
  lowTom: "Low Tom",
};

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--audioui-unit) / 2);
  `,
  topRow: css`
    display: flex;
    align-items: center;
    gap: calc(var(--audioui-unit) / 2);
  `,
  pads: css`
    display: flex;
  `,
  gridRow: css`
    display: flex;
    align-items: center;
    gap: calc(var(--audioui-unit) / 2);
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    padding: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) / 2);
  `,
  gridLabel: css`
    font-size: 12px;
    color: var(--text);
    width: 48px;
  `,
};

/**
 * The full step drum sequencer.
 *
 * `useKickVoice`/`useSnareVoice`/`useHiHatVoice`/`useHiHatOpenVoice` are
 * called *here*, not inside the pad components — this is what lets the
 * sequencer's scheduler (`useStepSequencer`) reach each voice's live
 * `trigger` closure directly, using the exact same sound-generation code
 * driven by the exact same knobs shown on the pads below. Adding an
 * instrument later (Tom1, etc. — see ARCHITECTURE-SPEC.MD) means: add its
 * id to `useStepSequencer.ts`'s `TRACK_IDS`, give it a
 * `use<X>Voice`/`<X>Pad` pair under `components/`, a label in
 * `TRACK_LABELS` above, and render + pass it in here the same way
 * kick/snare/hihat/hihatOpen are below.
 *
 * There's a single 16-step grid, not one per track: pressing a pad both
 * fires that instrument's preview hit and selects it as the pattern the
 * grid is currently showing/editing. Every instrument's pattern stays
 * live and plays together regardless of which one is selected — see
 * `useStepSequencer.ts`.
 */
const StepSequencer = () => {
  const kickVoice = useKickVoice();
  const snareVoice = useSnareVoice();
  const hiHatVoice = useHiHatVoice();
  const hiHatOpenVoice = useHiHatOpenVoice();
  const hiTomVoice = useHiTomVoice();
  const midTomVoice = useMidTomVoice();
  const lowTomVoice = useLowTomVoice();

  const { activePattern, selectedTrack, selectTrack, currentStep, setStep } =
    useStepSequencer({
      kick: kickVoice,
      snare: snareVoice,
      hihat: hiHatVoice,
      hihatOpen: hiHatOpenVoice,
      hiTom: hiTomVoice,
      midTom: midTomVoice,
      lowTom: lowTomVoice,
    });

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <TempoTransportPanel />
        <FilterPanel />
        <MasterPanel />
      </div>
      <div className={styles.pads}>
        <KickPad
          {...kickVoice}
          selected={selectedTrack === "kick"}
          onSelect={() => selectTrack("kick")}
        />
        <SnarePad
          {...snareVoice}
          selected={selectedTrack === "snare"}
          onSelect={() => selectTrack("snare")}
        />
        <HiHatPad
          {...hiHatVoice}
          selected={selectedTrack === "hihat"}
          onSelect={() => selectTrack("hihat")}
        />
        <HiHatOpenPad
          {...hiHatOpenVoice}
          selected={selectedTrack === "hihatOpen"}
          onSelect={() => selectTrack("hihatOpen")}
        />
        <HiTomPad
          {...hiTomVoice}
          selected={selectedTrack === "hiTom"}
          onSelect={() => selectTrack("hiTom")}
        />
        <MidTomPad
          {...midTomVoice}
          selected={selectedTrack === "midTom"}
          onSelect={() => selectTrack("midTom")}
        />
        <LowTomPad
          {...lowTomVoice}
          selected={selectedTrack === "lowTom"}
          onSelect={() => selectTrack("lowTom")}
        />
      </div>
      <div className={styles.gridRow}>
        <span className={styles.gridLabel}>{TRACK_LABELS[selectedTrack]}</span>
        <StepGrid
          active={activePattern}
          currentStep={currentStep}
          onStepChange={setStep}
        />
      </div>
    </div>
  );
};

export default StepSequencer;
