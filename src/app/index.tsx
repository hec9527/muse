import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import Header from './components/header';
import EnvContainer from './components/env-container';
import PageContainer from './components/page-container';
import MessageHandler from './components/message-handler';
import PublishCodeModal from './components/publish-modal';
import SearchCodeBranchModal from './components/code-branch-modal';

import logger from './utils/redux-logger';
import { reducer } from './store/reducer';
import './index.less';

const store = createStore(reducer, applyMiddleware(logger, thunk));

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
