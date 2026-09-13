import { Space } from "antd";
import "./App.css";
import WebAudioSnareButton from "./components/WebAudioSnareButton";
import ToneSnareButton from "./components/ToneSnareButton";
import WebAudioKickButton from "./components/WebAudioKickButton";
import ToneKickButton from "./components/ToneKickButton";

function App() {
  return (
    <>
      <section id="center">
        <div>
          <h1>Be creative!</h1>

          <Space>
            <WebAudioSnareButton />
            <ToneSnareButton />
            <WebAudioKickButton />
            <ToneKickButton />
          </Space>
        </div>
      </section>

      <div className="ticks"></div>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
