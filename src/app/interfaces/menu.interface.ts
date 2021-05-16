export enum BlogEvent {
  ConnectWallet = 'connectWallet',
  RegisterUser = 'registerUser',
  DisconnectWallet = 'DisconnectWallet',
}
export enum MenuType {
  PATH = 'path',
  EVENT = 'event',
}
export interface IMenu {
  name: string;
  type: MenuType;
  path?: string;
  event?: BlogEvent;
}
