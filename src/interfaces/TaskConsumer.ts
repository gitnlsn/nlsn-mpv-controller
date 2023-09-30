export interface TaskConsumer {
  consumerPromise: Promise<void>;
  abortController: AbortController;
}
