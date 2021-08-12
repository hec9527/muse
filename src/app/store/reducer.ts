import * as Types from '../../index.d';

export interface AppState {
  serverInfo: any;
  pageList: string[];
  checkList: string[];
  projectInfo: Types.IProjectInfo;
  hideDisabledFilter: boolean;
}

export type AppAction =
  | { type: 'UPDATE_PROJECT_INFO'; payload: Types.IProjectInfo }
  | { type: 'UPDATE_SERVER_INFO'; payload: any }
  | { type: 'UPDATE_PAGE_INFO'; payload: { pages: string[]; hideDisabledFilter: boolean } }
  | { type: 'UPDATE_QUERY_CODE_VERSION'; payload: any }
  | { type: 'UPDATE_SELECTED_PAGE'; payload: string[] }
  | { type: 'UPDATE_SELECTED_ENV'; payload: any };

export type AppDispatch = (action: AppAction) => void;

const initState: AppState = {
  pageList: [],
  checkList: [],
  projectInfo: {
    appName: 'rongshu',
    version: '6.3.0',
  },
  serverInfo: {},
  hideDisabledFilter: false,
};

// TODO 删除
for (let i = 0; i < 50; i++) {
  initState.pageList.push(
    `src/p/${String.fromCharCode(Math.floor(Math.random() * 26) + 97)}age${i}/4.5.6/index`
  );
}

export function reducer(state: AppState = initState, action: AppAction) {
  switch (action.type) {
    case 'UPDATE_PROJECT_INFO':
      return { ...state, projectInfo: action.payload };
    case 'UPDATE_SERVER_INFO':
      return { ...state, serviceInfo: action.payload };
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
