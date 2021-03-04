import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Table } from "./classes/table";
import { Observable } from "rxjs";
import { ChangedTable } from "./classes/changedTable";

@Injectable({
  providedIn: "root",
})
export class HttpService {
  constructor(private http: HttpClient) {}

  public getTables(): Observable<any> {
    const nodeUrl = "api/getTables";
    const body = null;
    return this.postRequest(nodeUrl, body);
  }

  public getCurrentTable(id: string): Observable<any> {
    const nodeUrl = "api/getTable";
    const body = { id };
    return this.postRequest(nodeUrl, body);
  }

  public getCurrentGame(id: string): Observable<any> {
    const nodeUrl = "api/getCurrentGame";
    const body = { id };
    return this.postRequest(nodeUrl, body);
  }

  public checkTable(id: string, playerId: string): Observable<any> {
    const nodeUrl = "api/checkTable";
    const body = { id, playerId };
    return this.postRequest(nodeUrl, body);
  }

  public addTable(table: Table, playerId: string): Observable<any> {
    const nodeUrl = "api/addTable";
    const body = { table, playerId };
    return this.postRequest(nodeUrl, body);
  }

  public createPlayer(name: string, pw: string): Observable<any> {
    const nodeUrl = "api/createPlayer";
    const body = { name, pw };
    return this.postRequest(nodeUrl, body);
  }

  public login(name: string, pw: string): Observable<any> {
    const nodeUrl = "api/login";
    const body = { name, pw };
    return this.postRequest(nodeUrl, body);
  }

  public checkUserId(id: string): Observable<any> {
    const nodeUrl = "api/checkUserId";
    const body = { id };
    return this.postRequest(nodeUrl, body);
  }

  public removeTable(tableId: string): Observable<any> {
    const nodeUrl = "api/removeTable";
    const body = { tableId };
    return this.postRequest(nodeUrl, body);
  }

  public removePlayer(id: number, player: string): Observable<any> {
    const nodeUrl = "api/removePlayer";
    const body = { id, player };
    return this.postRequest(nodeUrl, body);
  }

  public lockTable(tableId: string, lock: boolean): Observable<any> {
    const nodeUrl = "api/lockTable";
    const body = { tableId, lock };
    return this.postRequest(nodeUrl, body);
  }

  public logOut(id: string): Observable<any> {
    const nodeUrl = "api/logout";
    const body = { id };
    return this.postRequest(nodeUrl, body);
  }

  public leaveTable(playerId: string): Observable<any> {
    const nodeUrl = "api/leaveTable";
    const body = { playerId };
    return this.postRequest(nodeUrl, body);
  }

  public getPlayersFromTable(tableId: string): Observable<any> {
    const nodeUrl = "api/getPlayersFromTable";
    const body = { playerId: tableId };
    return this.postRequest(nodeUrl, body);
  }

  public startGame(tableId: string): Observable<any> {
    const nodeUrl = "api/startGame";
    const body = { tableId };
    return this.postRequest(nodeUrl, body);
  }

  public nextRound(tableId: string): Observable<any> {
    const nodeUrl = "api/nextRound";
    const body = { tableId };
    return this.postRequest(nodeUrl, body);
  }

  public changeTable(changed: ChangedTable): Observable<any> {
    const nodeUrl = "api/updateTable";
    const body = { changed };
    return this.postRequest(nodeUrl, body);
  }

  // default http requests
  private postRequest(nodeUrl: string, body: any): Observable<any> {
    return this.http.post(nodeUrl, body);
  }

  private getRequest(nodeUrl: string): Observable<any> {
    return this.http.get(nodeUrl);
  }
}
