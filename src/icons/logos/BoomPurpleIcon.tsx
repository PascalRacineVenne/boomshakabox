import type { ImgHTMLAttributes } from "react";
import boomShakaPurpleSrc from "../../assets/icons/logos/Boomshakabox-purple2.svg";

export const BoomPurpleIcon = (props: ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={boomShakaPurpleSrc} alt="Boomshakabox" {...props} />
);
