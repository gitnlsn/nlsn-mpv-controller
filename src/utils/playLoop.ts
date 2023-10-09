import { spawn } from "child_process";
import { TaskConsumer } from "../interfaces/TaskConsumer";
import { randomInteger } from "./randomInteger";

export const playLoop = (
  getAudioFilePaths: () => Promise<string[]>,
  beforeAudioCallback?: () => Promise<void>
): TaskConsumer => {
  const abortController = new AbortController();
  let aborted = false;

  const consumerPromise = new Promise<void>(async (resolve) => {
    abortController.signal.onabort = () => {
      aborted = true;
      resolve();
    };

    while (true) {
      if (aborted) {
        return;
      }

      const audioFilePaths = await getAudioFilePaths();
      const randomIndex = randomInteger(0, audioFilePaths.length - 1);

      await beforeAudioCallback?.();
      await spawn(`mpv ${audioFilePaths[randomIndex]}`, {
        signal: abortController.signal,
      });
    }
  });

  return {
    abortController,
    consumerPromise,
  };
};
