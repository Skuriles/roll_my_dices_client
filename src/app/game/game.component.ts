import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
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
  public diceImages = [
    "../../assets/images/1.png",
    "../../assets/images/2.png",
    "../../assets/images/3.png",
    "../../assets/images/4.png",
    "../../assets/images/5.png",
    "../../assets/images/6.png",
  ];
  public table: Table;
  constructor(
    private tableService: TableService,
    private router: Router,
    private httpService: HttpService,
    private wsService: WebsocketService,
    private toolService: ToolService
  ) {}

  ngOnInit(): void {
    this.table = new Table("", 0, 0);
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
    this.httpService
      .getCurrentTable(this.tableService.currentTable.id)
      .subscribe((table: Table) => {
        if (!table) {
          this.router.navigate(["/select"]);
        } else {
          this.table = table;
          this.tableService.currentTable = this.table;
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
          new WsMessage(id, "result", this.getDiceResult())
        );
      } else {
        this.toolService.openSnackBar("Du bist offline", "Browser neu laden");
      }
    }, 1500);
  }

  private getRandomInt(): number {
    return Math.floor(Math.random() * Math.floor(5));
  }

  private getDiceResult(): any[] {
    const result = [];
    for (const img of this.images) {
      const subStr = img.src.replace(".png", "");
      const dice = parseInt(subStr[subStr.length - 1], 10);
      result.push(dice);
    }
    return result;
  }
}
