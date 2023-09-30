import { execPromise } from "./execPromise";

export const playAudio = async (filePath: string) => {
  return execPromise(`mpv ${filePath}`);
};
