import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import Header from './components/header';
import Modal from './components/modal';
import ServerEnv from './components/server-env';
import SideBar from './components/sider-bar';

import { reducer } from './store/reducer';
import './index.less';

const store = createStore(reducer, applyMiddleware(thunk));

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div id='muse-container'>
        <Header />
        <SideBar />
        <div className='muse-body'>
          <ServerEnv />
        </div>
      </div>
    </Provider>
  );
};

render(<App />, document.getElementById('app'));
