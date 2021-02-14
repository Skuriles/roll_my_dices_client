import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateTableComponent } from "./create-table/create-table.component";
import { GameComponent } from "./game/game.component";
import { GuardService } from "./guard.service";
import { SelectComponent } from "./select/select.component";
import { StartComponent } from "./start/start.component";

const routes: Routes = [
  { path: "start", component: StartComponent },
  { path: "select", component: SelectComponent, canActivate: [GuardService] },
  {
    path: "createTable",
    component: CreateTableComponent,
    canActivate: [GuardService],
  },
  { path: "game", component: GameComponent, canActivate: [GuardService] },
  { path: "**", component: StartComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
