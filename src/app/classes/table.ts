import { ɵPlayer } from "@angular/core";
import { Player } from "./player";

export class Table {
  constructor(
    name: string,
    maxPlayers: number,
    minPlayers: number,
    diceCount: number
  ) {
    this.name = name;
    this.maxplayers = maxPlayers;
    this.minplayers = minPlayers;
    this.diceCount = diceCount;
  }
  public id: string;
  public name: string;
  public maxplayers: number;
  public minplayers: number;
  public locked = false;
  public diceCount = 0;
  public players: string[] = [];
}
