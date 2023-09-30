import { randomInteger } from "./randomInteger";

export const waitRandomDelayFactory =
  (min = 0, max = 1) =>
  async () =>
    new Promise<void>((resolve) => {
      const randomDelay = randomInteger(min, max);
      setTimeout(() => resolve(), randomDelay);
    });
