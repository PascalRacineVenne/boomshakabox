import { useState } from "react";
import { css } from "@linaria/core";
import { Button, Flex, Typography } from "antd";
import TempoTransportPanel from "./transport/TempoTransportPanel";
import MasterPanel from "../components/master/MasterPanel";

import { BoomPurpleIcon } from "../icons/logos/BoomPurpleIcon";

import KickPad from "../components/voices/kick/KickPad";
import SnarePad from "../components/voices/snare/SnarePad";
import HiHatPad from "../components/voices/hiHat/HiHatPad";
import HiHatOpenPad from "../components/voices/hiHatOpen/HiHatOpenPad";
import HiTomPad from "../components/voices/hiTom/HiTomPad";
import MidTomPad from "../components/voices/midTom/MidTomPad";
import LowTomPad from "../components/voices/lowTom/LowTomPad";

import { useKickVoice } from "../components/voices/kick/useKickVoice";
import { useSnareVoice } from "../components/voices/snare/useSnareVoice";
import { useHiHatVoice } from "../components/voices/hiHat/useHiHatVoice";
import { useHiHatOpenVoice } from "../components/voices/hiHatOpen/useHiHatOpenVoice";
import { useHiTomVoice } from "../components/voices/hiTom/useHiTomVoice";
import { useMidTomVoice } from "../components/voices/midTom/useMidTomVoice";
import { useLowTomVoice } from "../components/voices/lowTom/useLowTomVoice";
import StepGrid from "./grid/StepGrid";
import VelocityRow from "./grid/VelocityRow";
import VoiceScope from "./oscilloscope/VoiceScope";
import MiniGrid, { MINI_GRID_PAGE_COUNT } from "./grid/MiniGrid";
import LengthControl from "./grid/LengthControl";
import PageTabs from "./grid/PageTabs";
import PageDots from "./grid/PageDots";
import PatternOverview from "./grid/PatternOverview";
// import VoiceParamsTable from "./voiceParams/VoiceParamsTable";
import {
  useStepSequencer,
  TRACK_IDS,
  TRACK_LABELS,
  STEP_COUNT,
} from "./grid/useStepSequencer";
import EffectsPanel from "../components/effects/EffectsPanel";
import { useTransportPlayback } from "./transport/useTransportPlayback";
import { useDrumMachineHotkeys } from "./useDrumMachineHotkeys";

const styles = {
  scopeRow: css`
    width: 100%;
    padding: calc(var(--audioui-unit) / 8);
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
  oscillators: css`
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    padding: calc(var(--audioui-unit) / 4);
  `,
  sequencer: css`
    padding: calc(var(--audioui-unit) / 4);
  `,

  waveformTitle: css`
    color: var(--accent);
    font-size: 12px;
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    padding: calc(var(--audioui-unit) / 8);
    margin-bottom: calc(var(--audioui-unit) / 4) !important;
  `,
};

const GAP = "calc(var(--audioui-unit) / 4)";

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
    length,
    setLength,
    viewedPage,
    goToPage,
  } = useStepSequencer(voices);

  const transportPlayback = useTransportPlayback();
  const orderedVoices = TRACK_IDS.map((id) => voices[id]);
  useDrumMachineHotkeys(
    TRACK_IDS,
    orderedVoices,
    transportPlayback,
    selectTrack,
  );

  const pageRelativeStep =
    Math.floor(currentStep / STEP_COUNT) === viewedPage
      ? currentStep % STEP_COUNT
      : -1;
  const showPager = length > STEP_COUNT;

  const [miniPage, setMiniPage] = useState(0);

  return (
    <Flex vertical align="center" gap={GAP} className={styles.sequencer}>
      <Flex align="flex-start" justify="space-between" gap={GAP}>
        <BoomPurpleIcon style={{ fontSize: 100 }} />
        <TempoTransportPanel
          isPlaying={transportPlayback.isPlaying}
          togglePlayPause={transportPlayback.togglePlayPause}
          stop={transportPlayback.stop}
        />
        <LengthControl length={length} onChange={setLength} />
        <EffectsPanel />
        <MasterPanel />
      </Flex>
      <Flex
        align="flex-start"
        justify="center"
        gap={GAP}
        className={styles.scopeRow}
      >
        <Flex vertical align="flex-start" className={styles.oscillators}>
          <Typography
            className={styles.waveformTitle}
          >{`${TRACK_LABELS[selectedTrack]} — waveform`}</Typography>
          <VoiceScope key={selectedTrack} voice={voices[selectedTrack]} />
        </Flex>
        <Flex vertical gap={2} align="center">
          <PageDots
            pageCount={MINI_GRID_PAGE_COUNT}
            viewedPage={miniPage}
            onSelectPage={setMiniPage}
          />
          <MiniGrid
            patterns={patternsDisplay}
            currentStep={currentStep}
            length={length}
            miniPage={miniPage}
            selectedTrack={selectedTrack}
            onSelectTrack={selectTrack}
          />
        </Flex>
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
        {showPager && (
          <Flex vertical gap={4}>
            <PageTabs
              length={length}
              viewedPage={viewedPage}
              onSelectPage={goToPage}
            />
            <PatternOverview
              patterns={patternsDisplay}
              currentStep={currentStep}
              length={length}
              viewedPage={viewedPage}
              onSelectPage={goToPage}
            />
          </Flex>
        )}
        <Flex align="center" gap={GAP}>
          <span className={styles.gridLabel}>
            {TRACK_LABELS[selectedTrack]}
          </span>
          <StepGrid
            active={activePattern}
            currentStep={pageRelativeStep}
            onStepChange={setStep}
            startNumber={viewedPage * STEP_COUNT + 1}
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

      {/* <VoiceParamsTable selectedTrack={selectedTrack} voices={voices} /> */}
    </Flex>
  );
};

export default StepSequencer;
