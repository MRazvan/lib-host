export class Runnable {
  public start(): Promise<void> {
    return Promise.resolve();
  }
  public allStarted(): Promise<void> {
    return Promise.resolve();
  }
  public stop(): Promise<void> {
    return Promise.resolve();
  }
  public allStopped(): Promise<void> {
    return Promise.resolve();
  }
}
