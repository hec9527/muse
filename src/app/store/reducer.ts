import * as Types from '../../index.d';

declare function acquireVsCodeApi(): {
  postMessage(info: Types.IWebviewMessage): void;
};

const vscode = acquireVsCodeApi();

export type ServerInfo = (Types.IExtensionMessage & { cmd: 'UPDATE_ENV_INFO' })['data'];

export interface AppState {
  serverInfo?: ServerInfo;
  pageList: string[];
  checkList: string[];
  projectInfo: Types.IProjectInfo;
  hideDisabledFilter: boolean;
}

export type AppAction =
  | { type: 'POST_MESSAGE_TO_EXTENSION'; payload: Types.IWebviewMessage }
  | { type: 'UPDATE_PROJECT_INFO'; payload: Types.IProjectInfo }
  | { type: 'UPDATE_SERVER_INFO'; payload: ServerInfo }
  | { type: 'UPDATE_PAGE_INFO'; payload: { pages: string[]; hideDisabledFilter: boolean } }
  | { type: 'UPDATE_QUERY_CODE_VERSION'; payload: any }
  | { type: 'UPDATE_SELECTED_PAGE'; payload: string[] }
  | { type: 'UPDATE_SELECTED_ENV'; payload: any };

export type AppDispatch = (action: AppAction) => void;

const initState: AppState = {
  pageList: [],
  checkList: [],
  projectInfo: {},
  serverInfo: {} as ServerInfo,
  hideDisabledFilter: false,
};

// TODO 删除
// for (let i = 0; i < 50; i++) {
//   initState.pageList.push(`src/p/${String.fromCharCode(Math.floor(Math.random() * 26) + 97)}age${i}/4.5.6/index`);
// }

export function reducer(state: AppState = initState, action: AppAction): AppState {
  switch (action.type) {
    case 'POST_MESSAGE_TO_EXTENSION':
      vscode.postMessage(action.payload);
      return state;
    case 'UPDATE_PROJECT_INFO':
      return { ...state, projectInfo: action.payload };
    case 'UPDATE_SERVER_INFO':
      return { ...state, serverInfo: action.payload };
    case 'UPDATE_PAGE_INFO':
      return {
        ...state,
        pageList: action.payload.pages,
        hideDisabledFilter: action.payload.hideDisabledFilter,
      };
    case 'UPDATE_SELECTED_PAGE':
      return { ...state, checkList: action.payload };
    default:
      return { ...state };
  }
}
