export interface MessageFormat {
  from: string;
  to: string;
  body?: any;
  type: string;
  id: string;
}

export default class MessageTunnel {
  private from: string;
  private to: string;
  private eventHandler?: (
    req: MessageFormat,
    response: (result: any) => void
  ) => void | null;

  constructor(opt: { from: string; to: string }) {
    this.from = opt.from;
    this.to = opt.to;

    window.addEventListener("message", event => {
      if (!this.isValidMessage(event)) {
        return;
      }

      const receivedData = event.data as MessageFormat;
      if (this.eventHandler) {
        this.eventHandler(receivedData, result => {
          window.postMessage(
            {
              from: this.from,
              to: this.to,
              type: receivedData.type,
              body: result,
              id: receivedData.id
            },
            "*"
          );
        });
      }
    });
  }

  public addEventHandler(
    eventHandler: (req: MessageFormat, response: (result: any) => void) => void
  ) {
    this.eventHandler = eventHandler;
  }

  public request<T>(message: { type: string; body?: any }): Promise<T | null> {
    const uuid = this.getUUID();
    const data = {
      from: this.from,
      to: this.to,
      type: message.type,
      body: message.body,
      id: uuid
    };

    return new Promise((resolve, reject) => {
      let timeout: NodeJS.Timer;
      let eventHandle: (event: MessageEvent) => void;

      eventHandle = (event: MessageEvent) => {
        if (!this.isValidMessage(event)) {
          return;
        }

        const receivedData = event.data as MessageFormat;
        if (!receivedData.id || receivedData.id !== uuid) {
          return;
        }
        clearTimeout(timeout);
        window.removeEventListener("message", eventHandle);
        resolve(receivedData.body);
      };

      timeout = setTimeout(() => {
        window.removeEventListener("message", eventHandle);
        reject("timeout");
      }, 15000);

      window.addEventListener("message", eventHandle);
      window.postMessage(data, "*");
    });
  }

  private isValidMessage(event: MessageEvent): boolean {
    if (
      window.location.href.indexOf(event.origin) !== 0 &&
      event.source !== window
    ) {
      return false;
    }
    const receivedData = event.data as MessageFormat;
    if (!receivedData) {
      return false;
    }
    if (!receivedData.from || receivedData.from !== this.to) {
      return false;
    }
    return true;
  }

  private getUUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  }
}
