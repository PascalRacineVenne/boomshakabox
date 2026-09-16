import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";
import type { ComponentProps, ComponentType, SVGProps } from "react";

type IconProps = Omit<ComponentProps<typeof Icon>, "component">;

/**
 * Wraps an SVGR-imported SVG (`import Svg from "./foo.svg?react"`) as an
 * AntD `<Icon component={Svg} />` so custom SVGs get the same size/spin/
 * rotate prop handling as AntD's own icon set.
 */
export const svgIcon = (
  Svg: ComponentType<CustomIconComponentProps | SVGProps<SVGSVGElement>>,
) => {
  const WrappedIcon = (props: IconProps) => <Icon component={Svg} {...props} />;
  return WrappedIcon;
};
