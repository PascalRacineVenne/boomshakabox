import { useState } from "react";
import * as Tone from "tone";

// Shared by TransportControls (the Play/Pause/Stop buttons) and
// useDrumMachineHotkeys (Space/Escape), so both drive the same isPlaying
// state instead of each tracking it independently and drifting out of
// sync with each other.
export const useTransportPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = async () => {
    await Tone.start();
    if (isPlaying) {
      Tone.getTransport().pause();
      setIsPlaying(false);
    } else {
      Tone.getTransport().start();
      setIsPlaying(true);
    }
  };

  const stop = () => {
    // Tone.Transport.stop() also resets position to 0, which is what
    // useStepSequencer.ts's own "stop" listener relies on to reset the
    // playhead/step count — no separate reset needed here.
    Tone.getTransport().stop();
    setIsPlaying(false);
  };

  return { isPlaying, togglePlayPause, stop };
};
