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
