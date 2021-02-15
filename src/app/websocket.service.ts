import { Injectable } from "@angular/core";
import { WsMessage } from "./classes/wsMessage";
import { WebSocketSubject } from "rxjs/webSocket";
import { ToolService } from "./tool.service";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  public serverMessages = new Array<WsMessage>();

  public clientMessage = "";
  public isBroadcast = false;
  public sender = "";

  private socket$: WebSocketSubject<WsMessage>;
  private pingTimeout: any;

  constructor() {}

  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = new WebSocketSubject("ws://localhost:63555/ws");

      this.socket$.subscribe(
        (message) => {
          this.handleMessage(message);
        },
        (err) => {
          console.error(err);
        },
        () => {
          console.warn("Completed!");
        }
      );
    }
  }

  private handleMessage(message: WsMessage): void {
    if (message.sender !== "NS") {
      return;
    }
    const id = sessionStorage.getItem("id");
    if (!id) {
      return;
    }
    switch (message.content) {
      case "ping":
        this.heartbeat();
        break;
      case "connected":
        this.sendMessage(new WsMessage(id, "register"));
        this.heartbeat();
        break;
      case "playerResult":
        console.log(message.params);
        break;
      default:
        break;
    }
  }

  public sendMessage(msg: WsMessage): void {
    this.socket$.next(msg);
  }

  public close(): void {
    this.socket$.complete();
  }

  private heartbeat(): void {
    clearTimeout(this.pingTimeout);

    this.pingTimeout = setTimeout(() => {
      this.close();
    }, 30000 + 1000);
  }
}
