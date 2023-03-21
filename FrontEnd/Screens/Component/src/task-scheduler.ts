export type IMicroTaskCallback = () => void;

export class MicroTaskScheduler {
  //private readonly channel = new MessageChannel();
  private onmessage: any = null;
  private executionQueue: Array<IMicroTaskCallback> = [];
  private stopped = true;

  start() {
    if (this.stopped) {
      this.stopped = false;
      this.onmessage = this.handleMessage;
    }
  }

  stop() {
    this.stopped = true;
    this.executionQueue.splice(0, this.executionQueue.length);
    this.onmessage = null;
  }

  postTask(fn: IMicroTaskCallback) {
    if (!this.stopped) {
      this.executionQueue.push(fn);
      try {
        setTimeout(() => {
          if (this.onmessage != null)
            this.onmessage();
        }, 0);
      } catch(e){
        console.log(e.message);
      }
    }
  }

  private handleMessage = () => {
    const executeJob = this.executionQueue.shift();
    if (executeJob !== undefined) {
      executeJob();
    }
  };
}
