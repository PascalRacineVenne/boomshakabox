import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";
import type { ComponentProps, ComponentType, SVGProps } from "react";

type IconProps = Omit<ComponentProps<typeof Icon>, "component">;

export const svgIcon = (
  Svg: ComponentType<CustomIconComponentProps | SVGProps<SVGSVGElement>>,
) => {
  const WrappedIcon = (props: IconProps) => <Icon component={Svg} {...props} />;
  return WrappedIcon;
};
