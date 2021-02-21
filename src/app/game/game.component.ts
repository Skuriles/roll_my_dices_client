import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { DiceImage } from "../classes/image";
import { Player } from "../classes/player";
import { Table } from "../classes/table";
import { WsMessage } from "../classes/wsMessage";
import { HttpService } from "../http.service";
import { TableService } from "../table.service";
import { ToolService } from "../tool.service";
import { WebsocketService } from "../websocket.service";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.less"],
})
export class GameComponent implements OnInit {
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
  public myId: string | null;
  public playerResult: Subscription;
  public newPlayer: Subscription;
  public playerOffline: Subscription;

  constructor(
    private tableService: TableService,
    private router: Router,
    private httpService: HttpService,
    private wsService: WebsocketService,
    private toolService: ToolService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      dice: [0, [Validators.required]],
      count: [0, [Validators.required]],
    });
    this.myId = sessionStorage.getItem("id");
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

  private initSubs(): void {
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
      next: (playerTable: string[]) => {
        this.handleNewPlayer(playerTable);
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
    const interval = setInterval(() => {
      for (const img of this.images) {
        img.src = this.diceImages[this.getRandomInt()];
      }
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      const id = this.tableService.currentTable?.id;
      const playerId = sessionStorage.getItem("id");
      if (id && playerId) {
        this.wsService.sendMessage(
          new WsMessage("result", this.getDiceResult(id))
        );
      } else {
        this.toolService.openSnackBar("Du bist offline", "Browser neu laden");
      }
    }, 1500);
  }

  public show(): void {
    const dice = this.form.get("dice")?.value;
    const count = this.form.get("count")?.value;
    // this.wsService.sendMessage(
    // new WsMessage("openCups", [dice, count, this.game.id])
    // );
  }

  private getRandomInt(): number {
    return Math.floor(Math.random() * Math.floor(6));
  }

  private getDiceResult(id: string): any[] {
    const result: any[] = [id];
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

  private handleNewPlayer(playerTable: string[]): void {
    if (this.table.id !== playerTable[1]) {
      return;
    }
    let found = false;
    for (const player of this.table.players) {
      if (player === playerTable[0]) {
        found = true;
      }
    }
    if (!found) {
      this.getCurrentTable();
    }
  }

  private handlePlayerOffline(playerId: string): void {
    for (let i = 0; i < this.table.players.length; i++) {
      const ele = this.table.players[i];
      if (ele === playerId) {
        this.toolService.openSnackBar(
          "Spieler hat den Tisch verlassen " + ele,
          "Okay"
        );
        this.table.players.splice(i, 1);
        return;
      }
    }
  }
}
