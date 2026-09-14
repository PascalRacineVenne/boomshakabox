import { Space } from "antd";
import "./App.css";
import StepSequencer from "./sequencer/StepSequencer";

const App = () => {
  return (
    <>
      <section id="center">
        <div>
          <h1>Be creative!</h1>
          <Space size={"large"}>
            <StepSequencer />
          </Space>
        </div>
        <Space></Space>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
};

export default App;
