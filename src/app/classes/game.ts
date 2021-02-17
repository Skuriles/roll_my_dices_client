import { Player } from "./player";
import { Table } from "./table";

export class Game {
  public id: string;
  public diceCount: number;
  public round = 1;
  public players: Player[];
  public table: Table;
  public waiting: boolean;
  public started: boolean;

  constructor(diceCount: number, players: Player[], table: Table) {
    this.round = 1;
    this.diceCount = diceCount;
    this.players = players;
    this.table = table;
    this.started = true;
  }

  public playRound(): void {
    this.round++;
    for (const player of this.players) {
      player.diced = false;
      player.result = [];
      player.openCup = false;
    }
    this.waiting = true;
  }

  public getDiceResult(playerId: string, result: number[]): void {
    let finished = true;
    for (const player of this.players) {
      if (player.id === playerId) {
        player.diced = true;
        player.result = result;
      }
      if (!player.diced) {
        finished = false;
      }
    }
    if (finished) {
      this.setRoundDiced();
    }
  }

  public setRoundDiced(): void {
    this.waiting = false;
  }

  public openCups(): void {
    for (const player of this.players) {
      player.openCup = true;
    }
  }
}
