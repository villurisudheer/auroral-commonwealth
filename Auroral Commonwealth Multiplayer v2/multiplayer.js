export class MultiplayerClient{
  constructor(onMessage,onStatus){this.ws=null;this.onMessage=onMessage;this.onStatus=onStatus;this.room=null;this.playerId=null;}
  connect(){return new Promise((resolve,reject)=>{const proto=location.protocol==='https:'?'wss':'ws';const ws=new WebSocket(`${proto}://${location.host}/ws`);this.ws=ws;ws.onopen=()=>{this.onStatus?.('connected');resolve()};ws.onerror=()=>{this.onStatus?.('error');reject(new Error('WebSocket connection failed'))};ws.onclose=()=>this.onStatus?.('disconnected');ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}if(m.playerId)this.playerId=m.playerId;if(m.room)this.room=m.room;this.onMessage?.(m)}})}
  send(type,data={}){if(this.ws?.readyState===WebSocket.OPEN)this.ws.send(JSON.stringify({type,...data}))}
  close(){try{this.send('leave_room');this.ws?.close()}catch{}this.ws=null;this.room=null;this.playerId=null}
}
