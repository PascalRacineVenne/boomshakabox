import { Flex, Space, Typography } from "antd";
import { css } from "@linaria/core";
import StepSequencer from "./sequencer/StepSequencer";
import ADSRPanel from "./components/adsr/ADSRPanel";
import KickSauceMembrane from "./KickSauceMembrane";

const styles = {
  center: css`
    margin-top: 48px;
    gap: 24px;
    flex-grow: 1;
  `,

  // AntD's own Title rule outranks a single custom class (same
  // :where()-wrapped-hash situation as TempoKnob's input override), so
  // !important is needed regardless of stylesheet insertion order.
  title: css`
    font-family: var(--heading) !important;
    font-weight: 500 !important;
    color: var(--text-h) !important;
    letter-spacing: -1.68px !important;
    margin: 32px 0 !important;
  `,
};

const App = () => {
  return (
    <Flex
      component="section"
      id="center"
      vertical
      align="center"
      justify="center"
      className={styles.center}
    >
      <Space size={"large"}>
        <StepSequencer />
      </Space>
      <KickSauceMembrane />
      <Space size={"large"}>
        <ADSRPanel />
      </Space>
      <Typography.Paragraph style={{ color: "var(--text)" }}>
        potentially useful ADSR envelope for synth or filter modulation (not yet
        wired to any drum voice)
      </Typography.Paragraph>
      <Typography.Title level={4} className={styles.title}>
        Gimme a beat
      </Typography.Title>
    </Flex>
  );
};

export default App;
