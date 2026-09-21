import { css } from "@linaria/core";
import { Flex } from "antd";
import TempoTransportPanel from "./TempoTransportPanel";
import MasterPanel from "../components/master/MasterPanel";
import FilterPanel from "../components/filter/FilterPanel";

import KickPad from "../components/kick/KickPad";
import KickPad2 from "../components/kick2/KickPad2";
import KickSaucePad from "../components/kickSauce/KickSaucePad";
import SnarePad from "../components/snare/SnarePad";
import HiHatPad from "../components/hihat/HiHatPad";
import HiHatOpenPad from "../components/hihatOpen/HiHatOpenPad";
import HiTomPad from "../components/hiTom/HiTomPad";
import MidTomPad from "../components/midTom/MidTomPad";
import LowTomPad from "../components/lowTom/LowTomPad";

import { useKickVoice } from "../components/kick/useKickVoice";
import { useKick2Voice } from "../components/kick2/useKick2Voice";
import { useKickSauceVoice } from "../components/kickSauce/useKickSauceVoice";
import { useSnareVoice } from "../components/snare/useSnareVoice";
import { useHiHatVoice } from "../components/hihat/useHiHatVoice";
import { useHiHatOpenVoice } from "../components/hihatOpen/useHiHatOpenVoice";
import { useHiTomVoice } from "../components/hiTom/useHiTomVoice";
import { useMidTomVoice } from "../components/midTom/useMidTomVoice";
import { useLowTomVoice } from "../components/lowTom/useLowTomVoice";
import StepGrid from "./StepGrid";
import MiniGrid from "./MiniGrid";
import VoiceParamsTable from "./VoiceParamsTable";
import { useStepSequencer, TRACK_LABELS } from "./useStepSequencer";

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
};

const GAP = "calc(var(--audioui-unit) / 2)";

const StepSequencer = () => {
  const kickVoice = useKickVoice();
  const kick2Voice = useKick2Voice();
  const kickSauceVoice = useKickSauceVoice();
  const snareVoice = useSnareVoice();
  const hiHatVoice = useHiHatVoice();
  const hiHatOpenVoice = useHiHatOpenVoice();
  const hiTomVoice = useHiTomVoice();
  const midTomVoice = useMidTomVoice();
  const lowTomVoice = useLowTomVoice();

  const voices = {
    kick: kickVoice,
    kick2: kick2Voice,
    kickSauce: kickSauceVoice,
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
    selectedTrack,
    selectTrack,
    currentStep,
    setStep,
  } = useStepSequencer(voices);

  return (
    <Flex vertical align="center" gap={GAP}>
      <Flex align="flex-start" gap={GAP}>
        <TempoTransportPanel />
        <FilterPanel />
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
        <KickPad2
          {...kick2Voice}
          trackNumber={2}
          selected={selectedTrack === "kick2"}
          onSelect={() => selectTrack("kick2")}
        />
        <KickSaucePad
          {...kickSauceVoice}
          trackNumber={3}
          selected={selectedTrack === "kickSauce"}
          onSelect={() => selectTrack("kickSauce")}
        />
        <SnarePad
          {...snareVoice}
          trackNumber={4}
          selected={selectedTrack === "snare"}
          onSelect={() => selectTrack("snare")}
        />
        <HiTomPad
          {...hiTomVoice}
          trackNumber={5}
          selected={selectedTrack === "hiTom"}
          onSelect={() => selectTrack("hiTom")}
        />
        <MidTomPad
          {...midTomVoice}
          trackNumber={6}
          selected={selectedTrack === "midTom"}
          onSelect={() => selectTrack("midTom")}
        />
        <LowTomPad
          {...lowTomVoice}
          trackNumber={7}
          selected={selectedTrack === "lowTom"}
          onSelect={() => selectTrack("lowTom")}
        />
        <HiHatPad
          {...hiHatVoice}
          trackNumber={8}
          selected={selectedTrack === "hihat"}
          onSelect={() => selectTrack("hihat")}
        />
        <HiHatOpenPad
          {...hiHatOpenVoice}
          trackNumber={9}
          selected={selectedTrack === "hihatOpen"}
          onSelect={() => selectTrack("hihatOpen")}
        />
      </Flex>

      <Flex align="center" gap={GAP} className={styles.gridRowChrome}>
        <span className={styles.gridLabel}>{TRACK_LABELS[selectedTrack]}</span>
        <StepGrid
          active={activePattern}
          currentStep={currentStep}
          onStepChange={setStep}
        />
      </Flex>

      <VoiceParamsTable selectedTrack={selectedTrack} voices={voices} />
    </Flex>
  );
};

export default StepSequencer;
