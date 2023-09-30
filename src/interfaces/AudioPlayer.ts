import { TaskConsumer } from "./TaskConsumer";

export interface AudioPlayer {
  play: () => Promise<void | void[]>;
  stop: () => Promise<void | void[]>;
}
