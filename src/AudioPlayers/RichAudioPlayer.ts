import { AudioPlayer } from "../interfaces/AudioPlayer";
import { AudioPlayerConstructorProps } from "../interfaces/AudioPlayerCosntructor";
import { TaskConsumer } from "../interfaces/TaskConsumer";
import { playLoop } from "../utils/playLoop";
import { waitRandomDelayFactory } from "../utils/wainRandomDelay";

export class RichAudioPlayer implements AudioPlayer {
  private taskConsumerList: TaskConsumer[] = [];

  constructor(private props: AudioPlayerConstructorProps) {}

  play() {
    const taskConsummers = Array.from(
      Array(this.props.threadsNumber ?? 1).keys()
    ).map(() =>
      playLoop(
        this.props.getAudioFilePaths,
        waitRandomDelayFactory(this.props.minDelay, this.props.maxDelay)
      )
    );
    this.taskConsumerList.push(...taskConsummers);

    return this.getPromises();
  }

  stop() {
    this.taskConsumerList.forEach((task) => task.abortController.abort());
    const taskPromises = this.getPromises();
    this.taskConsumerList = [];
    return taskPromises;
  }

  getPromises() {
    return Promise.all(
      this.taskConsumerList.map((task) => task.consumerPromise)
    );
  }
}
