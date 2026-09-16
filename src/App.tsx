import { Flex, Space, Typography } from "antd";
import { css } from "@linaria/core";
import StepSequencer from "./sequencer/StepSequencer";
import ADSRPanel from "./components/adsr/ADSRPanel";

const styles = {
  center: css`
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
    font-size: 56px !important;
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
      <Typography.Title level={1} className={styles.title}>
        Be creative!
      </Typography.Title>
      <Space size={"large"}>
        <StepSequencer />
      </Space>
      <Space size={"large"}>
        <ADSRPanel />
      </Space>
      <Typography.Title level={2} className={styles.title}>
        Gimme a beat
      </Typography.Title>
    </Flex>
  );
};

export default App;
