import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-roundend-dialog",
  templateUrl: "./roundend-dialog.component.html",
  styleUrls: ["./roundend-dialog.component.less"],
})
export class RoundEndDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  ngOnInit(): void {}
}
