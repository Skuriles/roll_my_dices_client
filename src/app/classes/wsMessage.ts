export class WsMessage {
  constructor(
    public sender: string,
    public content: string,
    public params: any[] = [],
    public isBroadcast = false
  ) {}
}
