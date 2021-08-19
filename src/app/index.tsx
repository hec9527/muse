import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import Header from './components/header';
import EnvContainer from './components/env-container';
import PageContainer from './components/page-container';
import MessageHandler from './components/message-handler';
import PublishCodeModal from './components/publish-modal';
import SearchCodeBranchModal from './components/code-branch-modal';

import logger from './utils/redux-logger';
import { reducer } from './store/reducer';
import './index.less';

let middlewares = [logger];
if (NODE_ENV !== 'development') {
  middlewares.pop();
}

const store = createStore(reducer, applyMiddleware(...middlewares));

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <MessageHandler />
      <Header />
      <div className='muse-body'>
        <EnvContainer />
        <PageContainer />
      </div>

      <PublishCodeModal />
      <SearchCodeBranchModal />
    </Provider>
  );
};

render(<App />, document.getElementById('app'));
