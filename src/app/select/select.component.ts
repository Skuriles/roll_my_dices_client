import { Component, OnInit } from "@angular/core";
import { MatSelectionListChange } from "@angular/material/list";
import { Router } from "@angular/router";
import { PlayerTable } from "../classes/playerTable";
import { Table } from "../classes/table";
import { HttpService } from "../http.service";
import { TableService } from "../table.service";
import { ToolService } from "../tool.service";

@Component({
  selector: "app-select",
  templateUrl: "./select.component.html",
  styleUrls: ["./select.component.less"],
})
export class SelectComponent implements OnInit {
  public plTables: PlayerTable[];
  constructor(
    private router: Router,
    private tableService: TableService,
    private httpService: HttpService,
    private toolService: ToolService
  ) {}

  ngOnInit(): void {
    this.plTables = [];
    this.httpService.getTables().subscribe((tablePls: PlayerTable[]) => {
      this.plTables = tablePls;
    });
  }

  public createTable(): void {
    this.router.navigate(["createTable"]);
  }

  public onTableSelected(event: MatSelectionListChange): void {
    if (event) {
      const table = event.options[0].value as Table;
      if (table.locked || table.started) {
        this.toolService.openSnackBar(
          "Tisch gesperrt, voll oder bereits gestartet",
          "Bitte warten"
        );
      }
      this.tableService.selectTable(table);
      const id = sessionStorage.getItem("id");
      if (!id) {
        this.router.navigate(["/start"]);
        return;
      }
      this.httpService
        .checkTable(this.tableService.currentTable.id, id)
        .subscribe(
          (access: boolean) => {
            if (access) {
              this.router.navigate(["/game"]);
            } else {
              this.toolService.openSnackBar("Tisch ist schon voll", "Okay");
            }
          },
          (err) => {
            this.toolService.openSnackBar(err, "Whoops");
            this.ngOnInit();
          }
        );
    }
  }
}
