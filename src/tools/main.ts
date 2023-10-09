import getopts from "getopts";
import { listFiles } from "../utils/listFiles";
import { RichAudioPlayer } from "../AudioPlayers/RichAudioPlayer";

interface MainProps {
  path: string;
  threads: number;
  minDelay: number;
  maxDelay: number;
  ttl: number;
}

const main = async ({ path, threads, minDelay, maxDelay, ttl }: MainProps) => {
  console.log({
    path,
    threads,
    minDelay,
    maxDelay,
    ttl,
  });

  const player = new RichAudioPlayer({
    getAudioFilePaths: async () => listFiles(path),
    threadsNumber: threads,
    minDelay,
    maxDelay,
  });

  if (ttl > 0) {
    setTimeout(() => {
      process.exit();
    }, ttl * 1000);
  }

  await player.play();

  return {
    status: "ok",
  };
};

const opts = getopts(process.argv.slice(2), {
  string: ["path", "threads", "minDelay", "maxDelay", "ttl"],
});
const { path, threads, minDelay, maxDelay, ttl } = opts;

main({
  path,
  threads: Number.isFinite(Number(threads)) ? Number(threads) : 1,
  minDelay: Number.isFinite(Number(minDelay)) ? Number(minDelay) : 0,
  maxDelay: Number.isFinite(Number(maxDelay)) ? Number(maxDelay) : 0,
  ttl: Number.isFinite(Number(ttl)) ? Number(ttl) : 0,
})
  .then((output) => console.log(JSON.stringify(output)))
  .catch(console.error);
