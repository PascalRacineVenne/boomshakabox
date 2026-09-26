import { useKickVoice } from "./kick/useKickVoice";
import { useSnareVoice } from "./snare/useSnareVoice";
import { useHiHatVoice } from "./hiHat/useHiHatVoice";
import { useHiHatOpenVoice } from "./hiHatOpen/useHiHatOpenVoice";
import { useHiTomVoice } from "./hiTom/useHiTomVoice";
import { useMidTomVoice } from "./midTom/useMidTomVoice";
import { useLowTomVoice } from "./lowTom/useLowTomVoice";

// Composes all seven per-voice hooks into the single `voices` object
// keyed by TrackId that the rest of the sequencer (useStepSequencer,
// VoicePadRow, VoiceScope, VoiceParamsTable) expects. Returns each
// hook's full result rather than the narrower Voices interface the
// playback engine uses — callers that need voice-specific props
// (VoicePadRow spreading into each Pad) still get full type info; it
// remains structurally assignable to Voices wherever that's expected.
export const useVoices = () => {
  const kickVoice = useKickVoice();
  const snareVoice = useSnareVoice();
  const hiHatVoice = useHiHatVoice();
  const hiHatOpenVoice = useHiHatOpenVoice();
  const hiTomVoice = useHiTomVoice();
  const midTomVoice = useMidTomVoice();
  const lowTomVoice = useLowTomVoice();

  return {
    kick: kickVoice,
    snare: snareVoice,
    hihat: hiHatVoice,
    hihatOpen: hiHatOpenVoice,
    hiTom: hiTomVoice,
    midTom: midTomVoice,
    lowTom: lowTomVoice,
  };
};
