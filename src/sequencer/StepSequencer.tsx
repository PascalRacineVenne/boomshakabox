import { css } from "@linaria/core";
import { Button, Flex } from "antd";
import { ClearOutlined } from "@ant-design/icons";
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
import VelocityRow from "./VelocityRow";
import MiniGrid from "./MiniGrid";
import VoiceParamsTable from "./VoiceParamsTable";
import { useStepSequencer, TRACK_LABELS } from "./useStepSequencer";
import EffectsPanel from "../components/filter/EffectsPanel";

const styles = {
  gridRowChrome: css`
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    padding: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) / 2);
  `,
  gridLabel: css`
    font-size: 12px;
    color: var(--text);
    width: 48px;
  `,
  clearButton: css`
    width: 48px;
    display: flex;
    justify-content: center;
  `,
};

const GAP = "calc(var(--audioui-unit) / 2)";

const StepSequencer = () => {
  const kickVoice = useKickVoice();
  const snareVoice = useSnareVoice();
  const hiHatVoice = useHiHatVoice();
  const hiHatOpenVoice = useHiHatOpenVoice();
  const hiTomVoice = useHiTomVoice();
  const midTomVoice = useMidTomVoice();
  const lowTomVoice = useLowTomVoice();

  const voices = {
    kick: kickVoice,
    snare: snareVoice,
    hihat: hiHatVoice,
    hihatOpen: hiHatOpenVoice,
    hiTom: hiTomVoice,
    midTom: midTomVoice,
    lowTom: lowTomVoice,
  };

  const {
    patternsDisplay,
    activePattern,
    activeVelocities,
    selectedTrack,
    selectTrack,
    currentStep,
    setStep,
    setVelocity,
    clearTrack,
  } = useStepSequencer(voices);

  return (
    <Flex vertical align="center" gap={GAP}>
      <Flex align="flex-start" gap={GAP}>
        <TempoTransportPanel />
        <FilterPanel />
        <EffectsPanel />
        <MasterPanel />
      </Flex>
      <MiniGrid
        patterns={patternsDisplay}
        currentStep={currentStep}
        selectedTrack={selectedTrack}
        onSelectTrack={selectTrack}
      />
      <Flex>
        <KickPad
          {...kickVoice}
          trackNumber={1}
          selected={selectedTrack === "kick"}
          onSelect={() => selectTrack("kick")}
        />
        <SnarePad
          {...snareVoice}
          trackNumber={2}
          selected={selectedTrack === "snare"}
          onSelect={() => selectTrack("snare")}
        />
        <HiTomPad
          {...hiTomVoice}
          trackNumber={3}
          selected={selectedTrack === "hiTom"}
          onSelect={() => selectTrack("hiTom")}
        />
        <MidTomPad
          {...midTomVoice}
          trackNumber={4}
          selected={selectedTrack === "midTom"}
          onSelect={() => selectTrack("midTom")}
        />
        <LowTomPad
          {...lowTomVoice}
          trackNumber={5}
          selected={selectedTrack === "lowTom"}
          onSelect={() => selectTrack("lowTom")}
        />
        <HiHatPad
          {...hiHatVoice}
          trackNumber={6}
          selected={selectedTrack === "hihat"}
          onSelect={() => selectTrack("hihat")}
        />
        <HiHatOpenPad
          {...hiHatOpenVoice}
          trackNumber={7}
          selected={selectedTrack === "hihatOpen"}
          onSelect={() => selectTrack("hihatOpen")}
        />
      </Flex>

      <Flex vertical gap={4} className={styles.gridRowChrome}>
        <Flex align="center" gap={GAP}>
          <span className={styles.gridLabel}>
            {TRACK_LABELS[selectedTrack]}
          </span>
          <StepGrid
            active={activePattern}
            currentStep={currentStep}
            onStepChange={setStep}
          />
        </Flex>
        <Flex gap={GAP}>
          <span className={styles.clearButton}>
            <Button
              danger
              type="text"
              size="small"
              icon={<ClearOutlined />}
              title={`Clear ${TRACK_LABELS[selectedTrack]}'s steps`}
              onClick={clearTrack}
            />
          </span>
          <VelocityRow
            active={activePattern}
            velocities={activeVelocities}
            onVelocityChange={setVelocity}
          />
        </Flex>
      </Flex>

      <VoiceParamsTable selectedTrack={selectedTrack} voices={voices} />
    </Flex>
  );
};

export default StepSequencer;
