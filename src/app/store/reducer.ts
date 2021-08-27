import * as Types from '../../index.d';

declare function acquireVsCodeApi(): {
  postMessage(info: Types.IWebviewMessage): void;
};

const vscode = acquireVsCodeApi();

export type ServerInfo = (Types.IExtensionMessage & { cmd: 'UPDATE_ENV_INFO' })['data'];

export interface AppState {
  serverInfo?: ServerInfo;
  pageList: string[];
  projectInfo: Types.IProjectInfo;
  hideDisabledFilter: boolean;
  selectedPages: string[];
  selectedEnv: Types.IEnvConfig;
  searchCodeBranchModalVisible: boolean;
  publishModalVisible: boolean;
  codeBranch: string[];
  queryCodeBranchLoading: boolean;
  extensionConfig: Types.IExtensionConfig;
}

export type AppAction =
  | { type: 'POST_MESSAGE_TO_EXTENSION'; payload: Types.IWebviewMessage }
  | { type: 'UPDATE_PROJECT_INFO'; payload: Types.IProjectInfo }
  | { type: 'UPDATE_SERVER_INFO'; payload: ServerInfo }
  | { type: 'UPDATE_PAGE_INFO'; payload: { pages: string[]; hideDisabledFilter: boolean } }
  | { type: 'UPDATE_EXTENSIONCONFIG'; payload: Types.IExtensionConfig }
  | { type: 'UPDATE_QUERY_CODE_VERSION'; payload: any }
  | { type: 'UPDATE_SELECTED_PAGE'; payload: string[] }
  | { type: 'UPDATE_SELECTED_ENV'; payload: Types.IEnvConfig }
  | { type: 'UPDATE_PUBLISH_MODAL_VISIBLE'; payload: boolean }
  | { type: 'UPDATE_SEARCH_CODE_BRANCH_MODAL_VISIBLE'; payload: boolean }
  | { type: 'UPDATE_SEARCH_CODE_BRAMCH_RESULT'; payload: string[] }
  | { type: 'UPDATE_SEARCH_CODE_BRANCH_LOADING'; payload: boolean };

export type AppDispatch = (action: AppAction) => void;

const initState: AppState = {
  pageList: [],
  selectedPages: [],
  projectInfo: {},
  serverInfo: {} as ServerInfo,
  hideDisabledFilter: false,
  selectedEnv: {} as Types.IEnvConfig,
  publishModalVisible: false,
  searchCodeBranchModalVisible: false,
  queryCodeBranchLoading: false,
  codeBranch: [],
  extensionConfig: {} as Types.IExtensionConfig,
};

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
    case 'UPDATE_SELECTED_ENV':
      return { ...state, selectedEnv: action.payload };
    case 'UPDATE_SELECTED_PAGE':
      return { ...state, selectedPages: action.payload };
    case 'UPDATE_EXTENSIONCONFIG':
      return { ...state, extensionConfig: action.payload };
    case 'UPDATE_PUBLISH_MODAL_VISIBLE':
      return { ...state, publishModalVisible: action.payload };
    case 'UPDATE_SEARCH_CODE_BRANCH_MODAL_VISIBLE':
      return { ...state, searchCodeBranchModalVisible: action.payload };
    case 'UPDATE_SEARCH_CODE_BRAMCH_RESULT':
      return { ...state, codeBranch: action.payload };
    case 'UPDATE_SEARCH_CODE_BRANCH_LOADING':
      return { ...state, queryCodeBranchLoading: action.payload };
    default:
      return { ...state };
  }
}
