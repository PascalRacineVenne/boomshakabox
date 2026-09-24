import { useEffect, useState } from "react";
import { Flex } from "antd";
import type { VoiceScopeSource } from "../lib/voiceScope";
import WaveformDisplay from "./WaveformDisplay";
import FullWaveformDisplay from "./FullWaveformDisplay";

const FULL_RENDER_DEBOUNCE_MS = 200; // avoid re-rendering offline on every knob-drag tick
const GAP = "calc(var(--audioui-unit) / 2)";

interface VoiceScopeProps {
  voice: VoiceScopeSource;
}

/**
 * Both waveform views for whichever voice is currently selected — a live
 * rolling window (WaveformDisplay, reading voice.waveformRef directly) and
 * a complete offline-rendered hit (FullWaveformDisplay, recomputed here on
 * a debounce via voice.renderFullWaveform). Meant to be mounted only while
 * its containing Collapse panel is open (see StepSequencer.tsx's
 * destroyOnHidden), so neither the rAF/canvas loop nor the offline-render
 * debounce below does any work for a voice nobody's looking at.
 *
 * StepSequencer.tsx renders this with `key={selectedTrack}` — remounting
 * on voice switch gives fullWaveform a fresh initial `null` for free,
 * rather than clearing it by hand in an effect.
 */
const VoiceScope = ({ voice }: VoiceScopeProps) => {
  const { waveformRef, renderFullWaveform } = voice;
  const [fullWaveform, setFullWaveform] = useState<Float32Array | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      renderFullWaveform().then((data) => {
        if (!cancelled) setFullWaveform(data);
      });
    }, FULL_RENDER_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [renderFullWaveform]);

  return (
    <Flex gap={GAP}>
      <WaveformDisplay waveformRef={waveformRef} />
      <FullWaveformDisplay data={fullWaveform} />
    </Flex>
  );
};

export default VoiceScope;
