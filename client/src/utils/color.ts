import { pipe } from "lodash/fp";

export const getColorClass = (count: number): string =>
  pipe(
    (c: number) => {
      if (c === 0) return 100;
      if (c < 5) return 200;
      if (c < 10) return 300;
      if (c < 20) return 400;
      return 500;
    },
    (level: number) => `bg-${level === 100 ? "gray" : "green"}-${level}`
  )(count);
