import { Button } from "@cutoff/audio-ui-react";
import classNames from "classnames";
import { Flex } from "antd";
import { controlPanelStyles } from "./ControlPanel";

interface TriggerButtonProps {
  label: string;
  pressed: boolean;
  setPressed: (value: boolean) => void;
  trigger: (scheduledTime?: number) => void;
  sequencerHit?: boolean;
}

const TriggerButton = ({
  label,
  pressed,
  setPressed,
  trigger,
  sequencerHit,
}: TriggerButtonProps) => (
  <Flex vertical align="center" gap={4}>
    <div
      className={classNames(
        controlPanelStyles.sequencerDot,
        sequencerHit && controlPanelStyles.sequencerDotActive,
      )}
    />
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
  </Flex>
);

export default TriggerButton;
