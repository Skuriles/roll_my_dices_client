import { Injectable } from "@angular/core";
import { WsMessage } from "./classes/wsMessage";
import { WebSocketSubject } from "rxjs/webSocket";
import { ToolService } from "./tool.service";
import { Subject } from "rxjs";

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
  public playerResult = new Subject<string>();
  public playerResult$ = this.playerResult.asObservable();
  public newPlayer = new Subject<string[]>();
  public newPlayer$ = this.newPlayer.asObservable();
  public playerOffline = new Subject<string>();
  public playerOffline$ = this.playerOffline.asObservable();

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
    if (message.content === "ping") {
      this.heartbeat();
    }
    const id = sessionStorage.getItem("id");
    if (!id) {
      return;
    }
    switch (message.content) {
      case "connected":
        this.sendMessage(new WsMessage("register"));
        this.heartbeat();
        break;
      case "playerResult":
        this.handlePlayerResult(message.params[0]);
        break;
      case "newPlayer":
        this.handleNewPlayer(message.params);
        break;
      case "playerOffline":
        this.handlePlayerOffline(message.params[0]);
        break;
      default:
        break;
    }
  }

  public handlePlayerOffline(playerId: string): void {
    this.playerOffline.next(playerId);
  }

  public sendMessage(msg: WsMessage): void {
    this.socket$.next(msg);
  }

  public close(): void {
    this.socket$.complete();
  }

  private heartbeat(): void {
    this.sendMessage(new WsMessage("pong"));
    clearTimeout(this.pingTimeout);

    this.pingTimeout = setTimeout(() => {
      this.close();
    }, 30000 + 1000);
  }

  private handlePlayerResult(playerId: string): void {
    this.playerResult.next(playerId);
  }

  private handleNewPlayer(playerAndTableId: string[]): void {
    this.newPlayer.next(playerAndTableId);
  }
}
