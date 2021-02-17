import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { WsMessage } from "../classes/wsMessage";
import { HttpService } from "../http.service";
import { ToolService } from "../tool.service";
import { WebsocketService } from "../websocket.service";

@Component({
  selector: "app-start",
  templateUrl: "./start.component.html",
  styleUrls: ["./start.component.less"],
})
export class StartComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService,
    private toolService: ToolService,
    private wsService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      userName: [null, [Validators.required]],
      pw: [null, [Validators.required]],
    });
    const id = sessionStorage.getItem("id");
    if (id) {
      this.login(id);
    }
  }

  public loginBtnPressed(): void {
    const name = this.form.get("userName")?.value;
    const pw = this.form.get("pw")?.value;
    if (name && pw) {
      this.loginToServer(name, pw);
    }
  }

  private loginToServer(name: string, pw: string): void {
    this.httpService.login(name, pw).subscribe(
      (id: { id: string }) => {
        if (id.id) {
          this.login(id.id);
        } else {
          this.toolService.openSnackBar("Passwort oder Name falsch", "Okay");
        }
      },
      (err) => {
        this.toolService.openSnackBar(err.message, "Whoops");
        this.ngOnInit();
      }
    );
  }

  public register(): void {
    const name = this.form.get("userName")?.value;
    const pw = this.form.get("pw")?.value;
    if (name && pw) {
      this.createPlayer(name, pw);
    }
  }

  private createPlayer(name: string, pw: string): void {
    this.httpService.createPlayer(name, pw).subscribe(
      (id: { id: string }) => {
        if (id.id) {
          this.login(id.id);
        } else {
          this.toolService.openSnackBar("Etwas ist schief gelaufen", "Okay");
        }
      },
      (err) => {
        this.toolService.openSnackBar(err.message, "Whoops");
      }
    );
  }

  public login(id: string): void {
    if (id) {
      sessionStorage.setItem("id", id);
      this.wsService.sendMessage(new WsMessage("register"));
      this.router.navigate(["/select"]);
    }
  }
}
