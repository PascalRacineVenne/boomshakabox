import { css } from "@linaria/core";
import { Button, Collapse, Flex } from "antd";
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
import VoiceScope from "./VoiceScope";
import MiniGrid from "./MiniGrid";
import VoiceParamsTable from "./VoiceParamsTable";
import { useStepSequencer, TRACK_IDS, TRACK_LABELS } from "./useStepSequencer";
import EffectsPanel from "../components/filter/EffectsPanel";
import { useTransportPlayback } from "./useTransportPlayback";
import { useDrumMachineHotkeys } from "./useDrumMachineHotkeys";

const styles = {
  scopeRow: css`
    width: 100%;
    padding: var(--audioui-unit);
  `,
  scopeCollapse: css`
    border: none;

    .ant-collapse-header {
      padding: 0 0 4px !important;
      align-items: center !important;
    }
    .ant-collapse-expand-icon {
      color: var(--contrast-1) !important;
    }
    .ant-collapse-title {
      font-size: 11px !important;
      color: var(--text) !important;
      text-align: left !important;
    }
    .ant-collapse-body {
      background: black;
      border: 1px solid var(--accent-border);
      border-radius: 0 0 8px 8px;
    }
  `,
  gridRow: css`
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    padding: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) / 2);
  `,
  gridLabel: css`
    font-size: 14px;
    color: var(--text);
    width: 48px;
  `,
  clearButtonWrap: css`
    width: 48px;
    font-size: 10px;
    color: var(--text);
  `,
  clearButton: css`
    width: 22px !important;
    height: 22px !important;
    min-width: 0 !important;
    padding: 0 !important;
    background: black !important;
    border: 1px solid var(--contrast-2) !important;
    box-shadow: 1px 1px 4px var(--contrast-2) !important;

    &:hover {
      border-color: var(--contrast-1) !important;
      box-shadow: 1px 1px 4px var(--contrast-1) !important;
    }
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

  const transportPlayback = useTransportPlayback();
  const orderedVoices = TRACK_IDS.map((id) => voices[id]);
  useDrumMachineHotkeys(
    TRACK_IDS,
    orderedVoices,
    transportPlayback,
    selectTrack,
  );

  return (
    <Flex vertical align="center" gap={GAP}>
      <Flex align="flex-start" gap={GAP}>
        <TempoTransportPanel
          isPlaying={transportPlayback.isPlaying}
          togglePlayPause={transportPlayback.togglePlayPause}
          stop={transportPlayback.stop}
        />
        <FilterPanel />
        <EffectsPanel />
        <MasterPanel />
      </Flex>
      <Flex
        align="flex-start"
        justify="center"
        gap={GAP}
        className={styles.scopeRow}
      >
        <Collapse
          size="small"
          className={styles.scopeCollapse}
          defaultActiveKey={["scope"]}
          destroyOnHidden
          items={[
            {
              key: "scope",
              label: `${TRACK_LABELS[selectedTrack]} — waveform`,
              children: (
                <VoiceScope key={selectedTrack} voice={voices[selectedTrack]} />
              ),
            },
          ]}
        />
        <MiniGrid
          patterns={patternsDisplay}
          currentStep={currentStep}
          selectedTrack={selectedTrack}
          onSelectTrack={selectTrack}
        />
      </Flex>
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

      <Flex vertical gap={4} className={styles.gridRow}>
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
        <Flex gap={GAP} align="flex-start">
          <Flex
            vertical
            align="center"
            gap={2}
            className={styles.clearButtonWrap}
          >
            <Button
              type="text"
              size="small"
              className={styles.clearButton}
              title={`Clear ${TRACK_LABELS[selectedTrack]}'s steps`}
              onClick={clearTrack}
            />
            CLEAR
          </Flex>
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
