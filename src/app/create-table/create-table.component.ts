import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Table } from "../classes/table";
import { HttpService } from "../http.service";
import { TableService } from "../table.service";

@Component({
  selector: "app-create-table",
  templateUrl: "./create-table.component.html",
  styleUrls: ["./create-table.component.less"],
})
export class CreateTableComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tableService: TableService,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: [null, [Validators.required]],
      maxPlayers: [5, [Validators.required]],
      minPlayers: [2, [Validators.required]],
    });
  }

  public createTable(): void {
    const name = this.form.get("name")?.value;
    const max = this.form.get("maxPlayers")?.value;
    const min = this.form.get("minPlayers")?.value;
    const table = new Table(name, max, min);
    const id = sessionStorage.getItem("id");
    if (!id) {
      return;
    }
    this.httpService.addTable(table, id).subscribe((newtable: Table) => {
      this.tableService.tables.push(newtable);
      this.tableService.selectTable(newtable);
      this.router.navigate(["game"]);
    });
  }
}
