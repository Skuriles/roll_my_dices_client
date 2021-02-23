import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { DiceImage } from "../classes/image";
import { Player } from "../classes/player";
import { PlayerTable } from "../classes/playerTable";
import { Table } from "../classes/table";
import { WsMessage } from "../classes/wsMessage";
import { HttpService } from "../http.service";
import { TableService } from "../table.service";
import { ToolService } from "../tool.service";
import { WebsocketService } from "../websocket.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { RoundResult } from "../classes/roundResult";
import { RoundEndDialogComponent } from "../roundend-dialog/roundend-dialog.component";
import { DialogData } from "../classes/dialogData";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.less"],
})
export class GameComponent implements OnInit, OnDestroy {
  public images: DiceImage[] = [];
  public form: FormGroup;
  public diceImages = [
    "../../assets/images/1.png",
    "../../assets/images/2.png",
    "../../assets/images/3.png",
    "../../assets/images/4.png",
    "../../assets/images/5.png",
    "../../assets/images/6.png",
  ];
  public table: Table;
  public players: Player[];
  public myPlayer: Player;
  public myId: string | null;
  public playerResult: Subscription;
  public newPlayer: Subscription;
  public playerOffline: Subscription;
  public newGame: Subscription;
  public roundFinished: Subscription;
  public roundResult: Subscription;

  constructor(
    private tableService: TableService,
    private router: Router,
    private httpService: HttpService,
    private wsService: WebsocketService,
    private toolService: ToolService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      dice: [0, [Validators.required]],
      count: [0, [Validators.required]],
      players: [null, [Validators.required]],
    });
    this.myId = sessionStorage.getItem("id");
    this.myPlayer = new Player();
    this.table = new Table("", 0, 0, 0);
    this.players = [];
    const dices = this.tableService.dices;
    for (let i = 0; i < dices; i++) {
      const img = new DiceImage();
      img.id = i;
      img.src = this.diceImages[this.getRandomInt()];
      this.images.push(img);
    }
    if (!this.tableService.currentTable) {
      this.router.navigate(["/select"]);
      return;
    }
    this.initSubs();
    this.getCurrentTable();
  }

  ngOnDestroy(): void {
    if (this.playerResult) {
      this.playerResult.unsubscribe();
    }
    if (this.newPlayer) {
      this.newPlayer.unsubscribe();
    }
    if (this.playerOffline) {
      this.playerOffline.unsubscribe();
    }
    if (this.newGame) {
      this.newGame.unsubscribe();
    }
    if (this.roundFinished) {
      this.roundFinished.unsubscribe();
    }
    if (this.roundResult) {
      this.roundResult.unsubscribe();
    }
  }

  private initSubs(): void {
    this.roundResult = this.wsService.roundResult$.subscribe({
      next: (roundRes: RoundResult) => {
        this.handleRoundResult(roundRes);
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log("playerResult");
      },
    });

    this.roundFinished = this.wsService.allPlayersDicedRes$.subscribe({
      next: (tableId: string) => {
        this.handleRoundFinished(tableId);
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log("playerResult");
      },
    });

    this.playerResult = this.wsService.playerResult$.subscribe({
      next: (playerId: string) => {
        this.handlePlayerResult(playerId);
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log("playerResult");
      },
    });

    this.newPlayer = this.wsService.newPlayer$.subscribe({
      next: (params: string[]) => {
        this.handleNewPlayer(params);
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log("newPlayer");
      },
    });

    this.playerOffline = this.wsService.playerOffline$.subscribe({
      next: (playerId: string) => {
        this.handlePlayerOffline(playerId);
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log("playerOffline");
      },
    });

    this.newGame = this.wsService.newGame$.subscribe({
      next: (tableId: string) => {
        this.handleGameStart(tableId);
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log("gameStarted");
      },
    });
  }

  private handleRoundResult(roundRes: RoundResult): void {
    this.table.roundFinished = true;
    const dialogRef = this.dialog.open(RoundEndDialogComponent, {
      data: {
        dice: roundRes.dice,
        success: roundRes.success,
        diceCount: roundRes.diceCount,
        playerName: roundRes.playerName,
        count: roundRes.count,
        fromPlayer: roundRes.fromPlayer,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  private getCurrentTable(): void {
    this.httpService
      .getCurrentTable(this.tableService.currentTable.id)
      .subscribe((table: Table) => {
        if (!table) {
          this.router.navigate(["/select"]);
        } else {
          this.table = table;
          sessionStorage.setItem("tableid", this.table.id);
          this.tableService.currentTable = this.table;
          this.httpService
            .getPlayersFromTable(table.id)
            .subscribe((players: Player[]) => {
              this.players = players;
              this.form.get("players")?.setValue(this.players[0].id);
              for (const pl of players) {
                if (pl.id === this.myId) {
                  this.myPlayer = pl;
                }
              }
            });
        }
      });
  }

  public leaveTable(): void {
    const id = this.tableService.currentTable?.id;
    const playerId = sessionStorage.getItem("id");
    sessionStorage.removeItem("tableid");
    if (id && playerId) {
      this.httpService.leaveTable(playerId).subscribe(() => {
        this.router.navigate(["/select"]);
      });
    }
  }

  public dice(): void {
    if (!this.table.started) {
      this.openDialog();
      return;
    }
    const interval = setInterval(() => {
      for (const img of this.images) {
        img.src = this.diceImages[this.getRandomInt()];
      }
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      const tableId = this.table.id;
      const playerId = sessionStorage.getItem("id");
      if (tableId && playerId) {
        this.wsService.sendMessage(
          new WsMessage("result", this.getDiceResult(tableId, playerId))
        );
      } else {
        this.toolService.openSnackBar("Du bist offline", "Browser neu laden");
      }
    }, 1500);
  }

  private openDialog(): void {
    const dialogData = new DialogData();
    dialogData.header = "Neues Spiel starten";
    dialogData.text1 = "Mit Starten wird das nächste Spiel gestartet";
    dialogData.text2 = "Sicher?";
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.table.roundFinished = false;
        this.table.started = true;
        this.httpService.startGame(this.table.id).subscribe(() => {});
      }
    });
  }

  public show(): void {
    const dice = this.form.get("dice")?.value;
    const count = this.form.get("count")?.value;
    const playerId = this.form.get("players")?.value;
    if (
      dice &&
      dice < 7 &&
      dice > 0 &&
      count &&
      playerId &&
      playerId !== this.myId
    ) {
      this.wsService.sendMessage(
        new WsMessage("openCups", [dice, count, playerId, this.table.id])
      );
    }
  }

  public newRound(): void {
    const dialogData = new DialogData();
    dialogData.header = "Neue Runde starten";
    dialogData.text1 = "Mit Starten wird die nächste Runde gestartet";
    dialogData.text2 = "Sicher?";
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.table.roundFinished = false;
        this.httpService.nextRound(this.table.id).subscribe((table: Table) => {
          this.table = table;
          this.httpService
            .getPlayersFromTable(this.myId as string)
            .subscribe((players: Player[]) => {
              this.players = players;
            });
        });
      }
    });
  }

  private getRandomInt(): number {
    return Math.floor(Math.random() * Math.floor(6));
  }

  private getDiceResult(tableId: string, playerId: string): any[] {
    const result: any[] = [tableId, playerId];
    for (const img of this.images) {
      const subStr = img.src.replace(".png", "");
      const dice = parseInt(subStr[subStr.length - 1], 10);
      result.push(dice);
    }
    return result;
  }

  private handlePlayerResult(playerId: string): void {
    for (const player of this.players) {
      if (player.id === playerId) {
        player.diced = true;
      }
    }
  }

  private handleRoundFinished(tableId: string): void {
    if (tableId === this.table.id) {
      this.table.waiting = false;
    }
  }

  private handleNewPlayer(params: string[]): void {
    if (this.table.id !== params[2]) {
      return;
    }
    for (const player of this.players) {
      if (player.id === params[0]) {
        return;
      }
    }
    this.toolService.openSnackBar("Neuer Spieler: " + params[1], "Okay");
    this.getCurrentTable();
  }

  private handleGameStart(tableId: string): void {
    if (this.table.id !== tableId) {
      return;
    }
    this.toolService.openSnackBar("Spiel gestartet: ", "Okay");
    this.table.started = true;
    this.table.waiting = true;
    this.table.round = 1;
  }

  private handlePlayerOffline(playerId: string): void {
    for (let i = 0; i < this.table.playerIds.length; i++) {
      const ele = this.table.playerIds[i];
      if (ele === playerId) {
        this.table.playerIds.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < this.players.length; i++) {
      const ele = this.players[i];
      if (ele.id === playerId) {
        this.toolService.openSnackBar(
          "Spieler hat den Tisch verlassen " + ele.name,
          "Okay"
        );
        this.players.splice(i, 1);
        return;
      }
    }
  }
}
