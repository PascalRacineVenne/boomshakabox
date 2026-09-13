import { Space } from "antd";
import "./App.css";
import ToneKickButton from "./components/ToneKickButton";
import ToneSnareButton from "./components/ToneSnareButton";
// import WebAudioKickButton from "./components/WebAudioKickButton";
// import WebAudioSnareButton from "./components/WebAudioSnareButton";

function App() {
  return (
    <>
      <section id="center">
        <div>
          <h1>Be creative!</h1>

          <Space>
            <ToneKickButton />
            <ToneSnareButton />
          </Space>
        </div>
        <Space>
          {/* <WebAudioKickButton /> */}
          {/* <WebAudioSnareButton /> */}
        </Space>
      </section>

      <div className="ticks"></div>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
