import { TaskConsumer } from "../interfaces/TaskConsumer";
import { playAudio } from "./playfile";
import { randomInteger } from "./randomInteger";

export const playLoop = (
  getAudioFilePaths: () => Promise<string[]>,
  beforeAudioCallback?: () => Promise<void>
): TaskConsumer => {
  const abortController = new AbortController();

  const consumerPromise = new Promise<void>(async (resolve) => {
    abortController.signal.onabort = () => {
      resolve();
    };

    // ISSUE: abort controller wont kill while loop
    while (true) {
      const audioFilePaths = await getAudioFilePaths();
      const randomIndex = randomInteger(0, audioFilePaths.length - 1);
      await beforeAudioCallback?.();
      await playAudio(audioFilePaths[randomIndex]);
    }
  });

  return {
    abortController,
    consumerPromise,
  };
};
