import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { css } from "@linaria/core";
import {
  type AllVoices,
  type VoiceParamRow,
  buildVoiceParamRows,
} from "./voiceParams";
import { TRACK_LABELS, type TrackId } from "../grid/useStepSequencer";

const styles = {
  table: css`
    max-width: 800px;
    border: 1px solid var(--accent-border);
    border-radius: 8px;
    overflow: hidden;
    background: black;

    .ant-table {
      background: black;
    }

    .ant-table-title {
      background: black;
      color: var(--accent);
      font-size: 12px;
      border-bottom: 1px solid var(--accent-border);
    }

    .ant-table-thead .ant-table-cell {
      background: black !important;
      color: var(--text-h) !important;
      border-bottom: 1px solid var(--accent-border) !important;

      &::before {
        display: none !important;
      }
    }

    .ant-table-tbody .ant-table-cell {
      background: black !important;
      color: var(--text) !important;
      border-bottom: 1px solid var(--border) !important;
    }

    .ant-table-tbody .ant-table-row:hover .ant-table-cell {
      background: var(--accent-border) !important;
    }

    .ant-table-placeholder .ant-table-cell {
      background: black !important;
      color: var(--text) !important;
    }

    .ant-tag {
      background: transparent !important;
      border-color: var(--accent-border) !important;
      color: var(--text) !important;
    }

    .ant-tag-green {
      border-color: var(--contrast-1) !important;
      color: var(--contrast-1) !important;
    }
  `,
};

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
        </Tag>{" "}
        &nbsp;
        {row.control}
      </>
    ),
  },
];

const VoiceParamsTable = ({ selectedTrack, voices }: VoiceParamsTableProps) => {
  const rows = buildVoiceParamRows(selectedTrack, voices);

  return (
    <Table
      size="small"
      className={styles.table}
      pagination={false}
      rowKey="key"
      title={() => `${TRACK_LABELS[selectedTrack]} — signal chain`}
      columns={columns}
      dataSource={rows}
    />
  );
};

export default VoiceParamsTable;
