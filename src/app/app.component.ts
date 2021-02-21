import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Table } from "./classes/table";
import { HttpService } from "./http.service";
import { TableService } from "./table.service";
import { WebsocketService } from "./websocket.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
})
export class AppComponent implements OnDestroy, OnInit {
  constructor(
    private httpService: HttpService,
    private router: Router,
    private tableService: TableService,
    private wsService: WebsocketService
  ) {
    this.wsService.connect();
  }
  ngOnInit(): void {
    const id = sessionStorage.getItem("id");
    if (id) {
      this.httpService.checkUserId(id).subscribe((okay: boolean) => {
        if (!okay) {
          sessionStorage.clear();
          this.router.navigate(["/"]);
        } else {
          const tableid = sessionStorage.getItem("tableid");
          if (tableid) {
            this.httpService
              .getCurrentTable(tableid)
              .subscribe((table: Table) => {
                if (!table) {
                  this.router.navigate(["/select"]);
                } else {
                  this.tableService.currentTable = table;
                  this.router.navigate(["/game"]);
                }
              });
          }
        }
      });
    }
  }
  ngOnDestroy(): void {
    const id = sessionStorage.getItem("id");
    if (id) {
      this.httpService.logOut(id).subscribe();
    }
    sessionStorage.clear();
  }
}
