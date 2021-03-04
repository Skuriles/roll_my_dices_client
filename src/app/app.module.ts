import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { StartComponent } from "./start/start.component";
import { SelectComponent } from "./select/select.component";
import { GameComponent } from "./game/game.component";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CreateTableComponent } from "./create-table/create-table.component";
import { HttpClientModule } from "@angular/common/http";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatDialogModule } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { MatIconModule } from "@angular/material/icon";
import { RoundEndDialogComponent } from "./roundend-dialog/roundend-dialog.component";
import { MatMenuModule } from "@angular/material/menu";
import { PlayerCorrectionDialogComponent } from "./player-correction-dialog/player-correction-dialog.component";

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    SelectComponent,
    GameComponent,
    CreateTableComponent,
    ConfirmDialogComponent,
    RoundEndDialogComponent,
    PlayerCorrectionDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatSnackBarModule,
    MatGridListModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    MatMenuModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
