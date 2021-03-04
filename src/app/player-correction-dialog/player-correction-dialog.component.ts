import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ChangedTable } from "../classes/changedTable";
import { Player } from "../classes/player";
import { PlayerCorrectDialogData } from "../classes/playerCorrectDialogData";
import { TableService } from "../table.service";

@Component({
  selector: "app-player-correction-dialog",
  templateUrl: "./player-correction-dialog.component.html",
  styleUrls: ["./player-correction-dialog.component.less"],
})
export class PlayerCorrectionDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PlayerCorrectDialogData,
    private tableService: TableService
  ) {
    this.tableService.changed = new ChangedTable(data.table, data.players);
  }

  ngOnInit(): void {}

  public minPlayerChanged(diff: number): void {
    this.tableService.changed.table.minplayers += diff;
  }

  public maxPlayerChanged(diff: number): void {
    this.tableService.changed.table.maxplayers += diff;
  }

  public diceChanged(pl: Player, diff: number): void {
    for (const player of this.tableService.changed.players) {
      if (player.id === pl.id) {
        player.dices += diff;
      }
    }
  }
}
