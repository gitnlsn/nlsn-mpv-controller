import { execPromise } from "./execPromise";

export const listFiles = async (path: string) => {
  return execPromise(
    `find ${path} -type f | jq -R '' | jq -s --compact-output`
  ).then(({ stdout, stderr }) => {
    if (stderr.length > 0) {
      throw new Error(stderr);
    }

    return JSON.parse(stdout) as string[];
  });
};
