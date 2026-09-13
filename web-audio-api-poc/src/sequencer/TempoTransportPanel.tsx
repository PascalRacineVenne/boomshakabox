import { controlPanelStyles } from "../components/ControlPanel";
import TempoKnob from "./TempoKnob";
import TransportControls from "./TransportControls";
import BeatIndicator from "./BeatIndicator";
import MetronomeClick from "./MetronomeClick";

/**
 * Groups the sequencer's tempo dial, transport buttons, beat indicator,
 * and metronome click controls into one panel, styled consistently with
 * the drum voice panels (ControlPanel.ts) even though this isn't a drum
 * voice — reuses the same visual language rather than introducing a
 * separate one.
 *
 * This is a staging point for the future SequencerPage.tsx (step 8 of the
 * suggested file breakdown) once the step grid and per-track sequences
 * exist; for now it only composes what's been built so far (steps 1, 2, 3
 * and 4).
 */
const TempoTransportPanel = () => {
  return (
    <div className={controlPanelStyles.panel}>
      <TempoKnob />
      <BeatIndicator />
      <MetronomeClick />
      <TransportControls />
    </div>
  );
};

export default TempoTransportPanel;
