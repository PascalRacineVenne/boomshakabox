import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { type AllVoices, type VoiceParamRow, buildVoiceParamRows } from "./voiceParams";
import { TRACK_LABELS, type TrackId } from "./useStepSequencer";

interface VoiceParamsTableProps {
  selectedTrack: TrackId;
  voices: AllVoices;
}

const columns: ColumnsType<VoiceParamRow> = [
  { title: "Stage", dataIndex: "stage", key: "stage" },
  { title: "Detail", dataIndex: "detail", key: "detail" },
  { title: "Parameter", dataIndex: "parameter", key: "parameter" },
  { title: "Value", dataIndex: "value", key: "value" },
  {
    title: "Control",
    key: "control",
    render: (_, row) => (
      <>
        <Tag color={row.live ? "green" : "default"}>
          {row.live ? "Live" : "Fixed"}
        </Tag>
        {row.control}
      </>
    ),
  },
];

/**
 * Dev-only inventory of every parameter in the currently selected voice's
 * signal chain — see `voiceParams.ts`. Not a user-facing feature; this
 * exists to make it obvious at a glance what's already a knob versus what's
 * still buried as a constant in the trigger recipe.
 */
const VoiceParamsTable = ({ selectedTrack, voices }: VoiceParamsTableProps) => {
  const rows = buildVoiceParamRows(selectedTrack, voices);

  return (
    <Table
      size="small"
      pagination={false}
      rowKey="key"
      title={() => `${TRACK_LABELS[selectedTrack]} — signal chain`}
      columns={columns}
      dataSource={rows}
    />
  );
};

export default VoiceParamsTable;
