import { useHotkeys } from "react-hotkeys-hook";
import type { TrackId } from "./sequencerConstants";

const VOICE_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const MUTE_KEYS = VOICE_KEYS.map((key) => `shift+${key}`);
const TRIGGER_KEYS = ["a", "s", "d", "f", "g", "h", "j", "k"];

const codeToChar = (code: string) =>
  code.replace(/^(Key|Digit|Numpad)/, "").toLowerCase();

interface HotkeyVoice {
  trigger: (scheduledTime?: number, velocity?: number) => void;
  muted: boolean;
  setMuted: (value: boolean) => void;
}

interface DrumMachineTransport {
  togglePlayPause: () => void;
  stop: () => void;
}

/**
 * The drum machine's global keyboard shortcuts, collected in one place so
 * the full keymap is easy to find and edit:
 *
 *   Space            Play/Pause (resumes from the current position)
 *   Escape           Stop (resets the playhead to bar 1)
 *   1-8              Select voice[0..7] (BD1..OH7 order) — same panel/
 *                    scope switch a channel-strip click does
 *   Shift+1-8        Toggle mute on voice[0..7], same order — doesn't
 *                    change which voice is selected
 *   A S D F G H J K  Trigger voice[0..7], same order as above — goes
 *                    through the same trigger() a pad click uses, so it
 *                    hits the normal envelope/scope/analyser pipeline
 *
 * react-hotkeys-hook's enableOnFormTags defaults to false, so none of this
 * fires while a text field (the BPM input, most importantly) is focused —
 * that default is left as-is, not overridden.
 *
 * If a fewer-than-8-voices lineup is ever passed in, the unused number/
 * letter keys are simply no-ops (orderedVoices[index]/orderedTrackIds[index]
 * is undefined).
 */
export const useDrumMachineHotkeys = (
  orderedTrackIds: readonly TrackId[],
  orderedVoices: HotkeyVoice[],
  transport: DrumMachineTransport,
  selectTrack: (id: TrackId) => void,
) => {
  useHotkeys(
    "space",
    (event) => {
      event.preventDefault();
      transport.togglePlayPause();
    },
    [transport],
  );

  useHotkeys(
    "escape",
    () => {
      transport.stop();
    },
    [transport],
  );

  useHotkeys(
    VOICE_KEYS.join(","),
    (event) => {
      const index = VOICE_KEYS.indexOf(codeToChar(event.code));
      const id = orderedTrackIds[index];
      if (id) selectTrack(id);
    },
    [orderedTrackIds, selectTrack],
  );

  useHotkeys(
    MUTE_KEYS.join(","),
    (event) => {
      if (event.repeat) return;
      const index = VOICE_KEYS.indexOf(codeToChar(event.code));
      const voice = orderedVoices[index];
      if (voice) voice.setMuted(!voice.muted);
    },
    [orderedVoices],
  );

  useHotkeys(
    TRIGGER_KEYS.join(","),
    (event) => {
      if (event.repeat) return;
      const index = TRIGGER_KEYS.indexOf(codeToChar(event.code));
      const voice = orderedVoices[index];
      if (voice) voice.trigger();
    },
    [orderedVoices],
  );
};
