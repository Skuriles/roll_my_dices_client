import { Player } from "./player";

export class Table {
  constructor(name: string, maxPlayers: number, minPlayers: number) {
    this.name = name;
    this.maxplayers = maxPlayers;
    this.minplayers = minPlayers;
  }
  public id: string;
  public name: string;
  public players: Player[];
  public maxplayers: number;
  public minplayers: number;
  public locked = false;
}
