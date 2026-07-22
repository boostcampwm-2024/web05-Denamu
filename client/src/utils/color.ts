import { pipe } from "lodash/fp";

const toColorClass = (level: number) => `bg-${level === 100 ? "gray" : "green"}-${level}`;

export const getColorClass = (count: number): string =>
  pipe((c: number) => {
    if (c === 0) return 100;
    if (c < 5) return 200;
    if (c < 10) return 300;
    if (c < 20) return 400;
    return 500;
  }, toColorClass)(count);

export const getPostColorClass = (count: number): string =>
  pipe((c: number) => {
    if (c === 0) return 100;
    if (c === 1) return 200;
    if (c === 2) return 300;
    if (c < 5) return 400;
    return 500;
  }, toColorClass)(count);

export type ActivityScale = "views" | "posts";

export const getScaleColorClass = (count: number, scale: ActivityScale = "views"): string =>
  scale === "posts" ? getPostColorClass(count) : getColorClass(count);
