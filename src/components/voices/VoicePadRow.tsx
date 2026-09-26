import { Flex } from "antd";
import KickPad from "./kick/KickPad";
import SnarePad from "./snare/SnarePad";
import ClapPad from "./clap/ClapPad";
import HiHatPad from "./hiHat/HiHatPad";
import HiHatOpenPad from "./hiHatOpen/HiHatOpenPad";
import HiTomPad from "./hiTom/HiTomPad";
import MidTomPad from "./midTom/MidTomPad";
import LowTomPad from "./lowTom/LowTomPad";
import { TRACK_IDS, type TrackId } from "../../sequencer/sequencerConstants";
import type { AllVoices } from "../../sequencer/voiceParams/voiceParams";

interface VoicePadRowProps {
  voices: AllVoices;
  selectedTrack: TrackId;
  onSelectTrack: (id: TrackId) => void;
  sequencerHits: Record<TrackId, boolean>;
}

// Each Pad component has its own distinct prop shape (Kick's
// pitch/punch/click/fatness vs Snare's tone/snappy, etc.), so a single
// Record<TrackId, ComponentType<...>> registry can't be typed without
// widening every Pad's props to a common shape. A switch inside one
// TRACK_IDS.map() keeps this a single mapped render while letting each
// case spread its own voice's precise props into its own Pad untouched.
const VoicePadRow = ({
  voices,
  selectedTrack,
  onSelectTrack,
  sequencerHits,
}: VoicePadRowProps) => (
  <Flex>
    {TRACK_IDS.map((id, index) => {
      const trackNumber = index + 1;
      const selected = selectedTrack === id;
      const onSelect = () => onSelectTrack(id);
      const sequencerHit = sequencerHits[id];

      switch (id) {
        case "kick":
          return (
            <KickPad
              key={id}
              {...voices.kick}
              trackNumber={trackNumber}
              selected={selected}
              onSelect={onSelect}
              sequencerHit={sequencerHit}
            />
          );
        case "snare":
          return (
            <SnarePad
              key={id}
              {...voices.snare}
              trackNumber={trackNumber}
              selected={selected}
              onSelect={onSelect}
              sequencerHit={sequencerHit}
            />
          );
        case "clap":
          return (
            <ClapPad
              key={id}
              {...voices.clap}
              trackNumber={trackNumber}
              selected={selected}
              onSelect={onSelect}
              sequencerHit={sequencerHit}
            />
          );
        case "hiTom":
          return (
            <HiTomPad
              key={id}
              {...voices.hiTom}
              trackNumber={trackNumber}
              selected={selected}
              onSelect={onSelect}
              sequencerHit={sequencerHit}
            />
          );
        case "midTom":
          return (
            <MidTomPad
              key={id}
              {...voices.midTom}
              trackNumber={trackNumber}
              selected={selected}
              onSelect={onSelect}
              sequencerHit={sequencerHit}
            />
          );
        case "lowTom":
          return (
            <LowTomPad
              key={id}
              {...voices.lowTom}
              trackNumber={trackNumber}
              selected={selected}
              onSelect={onSelect}
              sequencerHit={sequencerHit}
            />
          );
        case "hihat":
          return (
            <HiHatPad
              key={id}
              {...voices.hihat}
              trackNumber={trackNumber}
              selected={selected}
              onSelect={onSelect}
              sequencerHit={sequencerHit}
            />
          );
        case "hihatOpen":
          return (
            <HiHatOpenPad
              key={id}
              {...voices.hihatOpen}
              trackNumber={trackNumber}
              selected={selected}
              onSelect={onSelect}
              sequencerHit={sequencerHit}
            />
          );
        default:
          return null;
      }
    })}
  </Flex>
);

export default VoicePadRow;
