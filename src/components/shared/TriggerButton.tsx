import { Button } from "@cutoff/audio-ui-react";
import classNames from "classnames";
import { controlPanelStyles } from "./ControlPanel";

interface TriggerButtonProps {
  label: string;
  pressed: boolean;
  setPressed: (value: boolean) => void;
  trigger: (scheduledTime?: number) => void;
}

const TriggerButton = ({
  label,
  pressed,
  setPressed,
  trigger,
}: TriggerButtonProps) => (
  <div className={controlPanelStyles.triggerWrap}>
    <Button
      label={label}
      value={pressed}
      size="large"
      labelMode="none"
      onChange={(press) => {
        setPressed(press.value);
        if (press.value) trigger();
      }}
    />
    <span
      className={classNames(
        controlPanelStyles.triggerLabel,
        pressed && controlPanelStyles.triggerLabelActive,
      )}
    >
      {label}
    </span>
  </div>
);

export default TriggerButton;
