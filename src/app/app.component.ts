import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Table } from "./classes/table";
import { HttpService } from "./http.service";
import { TableService } from "./table.service";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";

export class Message {
  constructor(
    public sender: string,
    public content: string,
    public isBroadcast = false
  ) {}
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
})
export class AppComponent implements OnDestroy, OnInit {
  private socket$: WebSocketSubject<Message>;
  private serverMessages: Message[] = [];
  constructor(
    private httpService: HttpService,
    private router: Router,
    private tableService: TableService
  ) {
    this.socket$ = new WebSocketSubject("ws://localhost:65333");

    this.socket$.subscribe(
      (message: Message) => {
        this.serverMessages.push(message);
      },
      (err: any) => {
        console.error(err);
      },
      () => console.warn("Completed!")
    );
  }
  ngOnInit(): void {
    this.sendMessageToServer();
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

  sendMessageToServer(): void {
    this.socket$.next(new Message("Client", "Hello there"));
  }
}
