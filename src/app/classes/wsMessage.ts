export class WsMessage {
  constructor(
    public content: string,
    public params: any[] = [],
    public sender: string = "",
    public isBroadcast = false
  ) {
    if (!this.sender) {
      const id = sessionStorage.getItem("id");
      if (id) {
        this.sender = id;
      }
    }
  }
}
