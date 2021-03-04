import { Injectable } from "@angular/core";
import { Table } from "./classes/table";
import { HttpService } from "./http.service";

@Injectable({
  providedIn: "root",
})
export class TableService {
  public tables: Table[] = [];
  public currentTable: Table;
  changed: import("d:/nodeProj/roll_my_dices_client/src/app/classes/changedTable").ChangedTable;

  constructor(private httpService: HttpService) {}

  public selectTable(table: Table): void {
    this.currentTable = table;
  }
}
