import { IProjectInfo } from '../..';

export interface AppState {
  serverInfo: any;
  pageList: string[];
  checkList: string[];
  projectInfo: IProjectInfo;
}

export type AppAction =
  | { type: 'UPDATE_PROJECT_INFO'; payload: IProjectInfo }
  | { type: 'UPDATE_SERVER_INFO'; payload: any }
  | { type: 'UPDATE_PAGE_INFO'; payload: string[] }
  | { type: 'UPDATE_QUERY_CODE_VERSION'; payload: any }
  | { type: 'UPDATE_SELECTED_PAGE'; payload: string[] }
  | { type: 'UPDATE_SELECTED_ENV'; payload: any };

export type AppDispatch = (action: AppAction) => void;

const initState = {
  pageList: [],
  checkList: [],
  projectInfo: {
    project: 'rongshu',
    branch: '6.3.0',
  },
} as any as AppState;

// TODO 删除
for (let i = 0; i < 50; i++) {
  initState.pageList.push(
    `src/p/${String.fromCharCode(Math.floor(Math.random() * 26) + 97)}age${i}/4.5.6/index`
  );
}

export function reducer(state: AppState = initState, action: AppAction) {
  switch (action.type) {
    case 'UPDATE_PROJECT_INFO': {
      return { ...state, projectInfo: action.payload };
    }
    case 'UPDATE_SERVER_INFO':
      return { ...state, serviceInfo: action.payload };
    case 'UPDATE_PAGE_INFO': {
      return { ...state, pageList: action.payload };
    }
    case 'UPDATE_SELECTED_PAGE': {
      return { ...state, checkList: action.payload };
    }
    default:
      return { ...state };
  }
}
