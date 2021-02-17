import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Game } from "../classes/game";
import { DiceImage } from "../classes/image";
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
  public game: Game;
  public diceImages = [
    "../../assets/images/1.png",
    "../../assets/images/2.png",
    "../../assets/images/3.png",
    "../../assets/images/4.png",
    "../../assets/images/5.png",
    "../../assets/images/6.png",
  ];
  public table: Table;
  public myId: string | null;
  public playerResult: Subscription;
  public newPlayer: Subscription;

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
    this.table.players = [];
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

    this.playerResult = this.wsService.playerResult$.subscribe({
      next: (playerId: string) => {
        this.handlePlayerResult(playerId);
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log("complete");
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
        console.log("complete");
      },
    });

    this.getCurrentTable();
  }

  private getCurrentTable(): void {
    this.httpService
      .getCurrentTable(this.tableService.currentTable.id)
      .subscribe((table: Table) => {
        if (!table) {
          this.router.navigate(["/select"]);
        } else {
          this.table = table;
          this.tableService.currentTable = this.table;
          this.httpService
            .getCurrentGame(this.table.id)
            .subscribe((game: Game) => {
              this.game = game;
            });
        }
      });
  }

  public leaveTable(): void {
    const id = this.tableService.currentTable?.id;
    const playerId = sessionStorage.getItem("id");
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
    this.wsService.sendMessage(
      new WsMessage("openCups", [dice, count, this.game.id])
    );
  }

  private getRandomInt(): number {
    return Math.floor(Math.random() * Math.floor(5));
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
    for (const player of this.game.players) {
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
    for (const player of this.game.players) {
      if (player.id === playerTable[0]) {
        found = true;
      }
    }
    if (!found) {
      this.getCurrentTable();
    }
  }
}
