import { useState } from "react";
import * as Tone from "tone";

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
    Tone.getTransport().stop();
    setIsPlaying(false);
  };

  return { isPlaying, togglePlayPause, stop };
};
