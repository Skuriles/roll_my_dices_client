import { Injectable } from "@angular/core";
import { Table } from "./classes/table";
import { HttpService } from "./http.service";

@Injectable({
  providedIn: "root",
})
export class TableService {
  public tables: Table[] = [];
  public currentTable: Table;

  constructor(private httpService: HttpService) {}

  public dices = 5;
  public selectTable(table: Table): void {
    this.currentTable = table;
  }
}
