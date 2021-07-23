import { IUserInfo } from '../..';

export interface Action {
  type: string;
  payload: any;
}

export interface AppState {
  userInfo: IUserInfo;
  serverInfo: any;
}

export type AppAction =
  | { type: 'UPDATE_USER_INFO'; payload: IUserInfo }
  | { type: 'UPDATE_SERVER_INFO'; payload: '' }
  | { type: ''; payload: '' };

const initState = {} as AppState;

export function reducer(state: AppState = initState, action: AppAction) {
  switch (action.type) {
    case 'UPDATE_USER_INFO':
      return { ...state, userInfo: action.payload };
    case 'UPDATE_SERVER_INFO':
      return { ...state, serviceInfo: action.payload };
    default:
      return { ...state };
  }
}
