import Meteor from '@meteorrn/core'


export const connectMeteor = () => {
  console.debug('connect meteor')
  const status = Meteor.status()

  if (status.connected) { return status }

  // TODO use environment variables
  Meteor.connect('ws://localhost:8080/websocket')
  Meteor.getData().ddp.socket.rawSocket.onerror = e => console.error(e);
  Meteor.getData().ddp.socket.addListener("open", () => console.log("open"));
  Meteor.getData().ddp.socket.addListener("close", () => console.log("close"));

  return Meteor.status()
}
