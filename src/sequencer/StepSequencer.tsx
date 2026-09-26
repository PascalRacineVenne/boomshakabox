import { css } from "@linaria/core";
import { Button, Flex, Typography, Collapse } from "antd";
import TempoTransportPanel from "./transport/TempoTransportPanel";
import MasterPanel from "../components/master/MasterPanel";

import VoicePadRow from "../components/voices/VoicePadRow";
import StepGrid from "./grid/StepGrid";
import VelocityRow from "./grid/VelocityRow";
import VoiceScope from "./oscilloscope/VoiceScope";
import MiniGrid from "./grid/MiniGrid";
import LengthControl from "./grid/LengthControl";
import RangeTabs from "./grid/RangeTabs";
import VoiceParamsTable from "./voiceParams/VoiceParamsTable";

import { useVoices } from "../components/voices/useVoices";
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
  topRow: css`
    width: 100%;
  `,
  scopeRow: css`
    width: 100%;
    align-items: stretch !important;
  `,
  scopeCollapse: css`
    border: 1px solid var(--accent-border) !important;
    border-radius: 8px !important;
    overflow: hidden;
    background: black;

    .ant-collapse-item {
      border: none !important;
    }

    .ant-collapse-header {
      align-items: center !important;
    }

    .ant-collapse-title {
      font-size: 12px !important;
      color: var(--text) !important;
    }

    .ant-collapse-expand-icon {
      color: var(--contrast-1) !important;
    }

    .ant-collapse-body {
      background: black !important;
      border-top: 1px solid var(--accent-border) !important;
      color: var(--text);
    }
  `,
  gridRow: css`
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    padding: calc(var(--audioui-unit) / 4) calc(var(--audioui-unit) / 2);
    margin-top: calc(var(--audioui-unit) / 8);
  `,
  gridLabel: css`
    font-size: 14px;
    color: var(--text);
    width: 72px;
  `,
  clearButtonWrap: css`
    width: 72px;
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
    align-items: stretch !important;
    width: 100%;
  `,
  sequencer: css`
    padding: calc(var(--audioui-unit) / 4);
  `,

  waveformTitle: css`
    writing-mode: vertical-rl;
    text-orientation: upright;
    color: var(--accent);
    font-size: 12px;
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    padding: calc(var(--audioui-unit) / 8);
    align-self: stretch !important;
    height: auto !important;
  `,
};

const GAP = "calc(var(--audioui-unit) / 8)";

const StepSequencer = () => {
  const voices = useVoices();

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
    viewedRange,
    goToRange,
    miniRange,
    goToMiniRange,
    sequencerHits,
  } = useStepSequencer(voices);

  const transportPlayback = useTransportPlayback();
  const orderedVoices = TRACK_IDS.map((id) => voices[id]);
  useDrumMachineHotkeys(
    TRACK_IDS,
    orderedVoices,
    transportPlayback,
    selectTrack,
  );

  const rangeRelativeStep =
    Math.floor(currentStep / STEP_COUNT) === viewedRange
      ? currentStep % STEP_COUNT
      : -1;

  return (
    <Flex vertical align="center" gap={GAP} className={styles.sequencer}>
      <Flex
        align="flex-start"
        justify="space-between"
        gap={GAP}
        className={styles.topRow}
      >
        <TempoTransportPanel
          isPlaying={transportPlayback.isPlaying}
          togglePlayPause={transportPlayback.togglePlayPause}
          stop={transportPlayback.stop}
        />
        <LengthControl length={length} onChange={setLength} />
        <EffectsPanel />
        <MasterPanel />
      </Flex>
      <Flex justify="center" gap={GAP} className={styles.scopeRow}>
        <Flex className={styles.oscillators} gap={GAP}>
          <Typography
            className={styles.waveformTitle}
          >{`${TRACK_LABELS[selectedTrack]}—wave`}</Typography>
          <VoiceScope key={selectedTrack} voice={voices[selectedTrack]} />
        </Flex>
        <MiniGrid
          patterns={patternsDisplay}
          currentStep={currentStep}
          length={length}
          miniRange={miniRange}
          selectedTrack={selectedTrack}
          onSelectTrack={selectTrack}
          onSelectRange={goToMiniRange}
        />
      </Flex>
      <Flex vertical>
        <VoicePadRow
          voices={voices}
          selectedTrack={selectedTrack}
          onSelectTrack={selectTrack}
          sequencerHits={sequencerHits}
        />
        {/* ---- STEPS SECTION ---- */}
        <Flex vertical gap={4} className={styles.gridRow}>
          <Flex gap={4}>
            <RangeTabs
              length={length}
              viewedRange={viewedRange}
              onSelectRange={goToRange}
            />
          </Flex>

          <Flex align="center" gap={GAP}>
            <span className={styles.gridLabel}>
              {TRACK_LABELS[selectedTrack]}
            </span>
            <StepGrid
              active={activePattern}
              currentStep={rangeRelativeStep}
              onStepChange={setStep}
              startNumber={viewedRange * STEP_COUNT + 1}
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
      </Flex>
      <Collapse
        className={styles.scopeCollapse}
        items={[
          {
            key: "1",
            label: "Voices Params table",
            children: (
              <VoiceParamsTable selectedTrack={selectedTrack} voices={voices} />
            ),
          },
        ]}
      />
    </Flex>
  );
};

export default StepSequencer;
