import { Knob } from "@cutoff/audio-ui-react";
import { LABELED_SMALL_KNOB_HEIGHT_UNITS } from "./ControlPanel";

/**
 * An invisible, non-interactive stand-in for a `size="small"` Knob —
 * reserves the exact same footprint (knob + label row) as a real one, so a
 * pad with fewer live params still lines up to the same height/width as
 * one with more (KickPad's 5 knobs span 2 columns by 3 rows; every other
 * pad pads its own columns out to that same shape with these). Renders the
 * real component rather than a hand-measured box so it stays correct if
 * the library's own knob sizing ever changes.
 */
const KnobSlot = () => (
  <Knob
    variant="plainCap"
    size="small"
    min={0}
    max={1}
    value={0}
    onChange={() => {}}
    label=" "
    labelHeightUnits={LABELED_SMALL_KNOB_HEIGHT_UNITS}
    style={{ visibility: "hidden" }}
  />
);

export default KnobSlot;
