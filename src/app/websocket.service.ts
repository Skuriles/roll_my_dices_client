import { Injectable } from "@angular/core";
import { WsMessage } from "./classes/wsMessage";
import { WebSocketSubject } from "rxjs/webSocket";
import { ToolService } from "./tool.service";
import { from, Subject } from "rxjs";
import { PlayerTable } from "./classes/playerTable";
import { Message } from "@angular/compiler/src/i18n/i18n_ast";
import { RoundResult } from "./classes/roundResult";
import { Table } from "./classes/table";
import { Player } from "./classes/player";
import { LockResult } from "./classes/lockResult";

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
  public newGame = new Subject<string>();
  public newGame$ = this.newGame.asObservable();
  public allPlayersDicedRes = new Subject<string>();
  public allPlayersDicedRes$ = this.allPlayersDicedRes.asObservable();
  public roundResult = new Subject<RoundResult>();
  public roundResult$ = this.roundResult.asObservable();
  public newRoundStarted = new Subject<Table>();
  public newRoundStarted$ = this.newRoundStarted.asObservable();
  public playersFinished = new Subject<Player[]>();
  public playersFinished$ = this.playersFinished.asObservable();
  public gameFinished = new Subject<string>();
  public gameFinished$ = this.gameFinished.asObservable();
  public tableLocked = new Subject<LockResult>();
  public tableLocked$ = this.tableLocked.asObservable();
  public tableCorrection = new Subject<string>();
  public tableCorrection$ = this.tableCorrection.asObservable();

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
      case "gameStarted":
        this.handleGameStarted(message.params[0]);
        break;
      case "allPlayersDiced":
        this.allPlayersDiced(message.params[0]);
        break;
      case "sendRoundResult":
        this.handleRoundResult(message);
        break;
      case "newRound":
        this.handleNewRound(message);
        break;
      case "playerFinished":
        this.handlePlayerFinished(message);
        break;
      case "gameFinished":
        this.handleGameFinished(message);
        break;
      case "tableLocked":
        this.handleTableLocked(message);
        break;
      case "tableCorrection":
        this.handleTableCorrection(message);
        break;

      default:
        break;
    }
  }

  public sendMessage(msg: WsMessage): void {
    this.socket$.next(msg);
  }

  private handleRoundResult(message: WsMessage): void {
    const success = message.params[0] as boolean;
    const diceCount = message.params[1] as number;
    const dice = message.params[2] as number;
    const count = message.params[3] as number;
    const name = message.params[4] as string;
    const fromPlayer = message.params[5] as string;
    const gameFinished = message.params[6] as boolean;
    const roundResult = new RoundResult(
      success,
      diceCount,
      dice,
      count,
      name,
      gameFinished,
      fromPlayer
    );
    this.roundResult.next(roundResult);
  }

  private allPlayersDiced(tableId: string): void {
    this.allPlayersDicedRes.next(tableId);
  }

  private handlePlayerOffline(playerId: string): void {
    this.playerOffline.next(playerId);
  }

  private close(): void {
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

  private handleNewPlayer(params: string[]): void {
    this.newPlayer.next(params);
  }

  private handleGameStarted(tableId: string): void {
    this.newGame.next(tableId);
  }

  private handleNewRound(message: WsMessage): void {
    this.newRoundStarted.next(message.params[0] as Table);
  }

  private handlePlayerFinished(message: WsMessage): void {
    this.playersFinished.next(message.params[0] as Player[]);
  }

  private handleGameFinished(message: WsMessage): void {
    this.gameFinished.next(message.params[0] as string);
  }

  private handleTableLocked(message: WsMessage): void {
    this.tableLocked.next(
      new LockResult(message.params[0] as string, message.params[1] as boolean)
    );
  }

  private handleTableCorrection(message: WsMessage) {
    this.tableCorrection.next(message.params[0] as string);
  }
}
