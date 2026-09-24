import { Knob } from "@cutoff/audio-ui-react";
import { LABELED_SMALL_KNOB_HEIGHT_UNITS } from "./ControlPanel";

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
