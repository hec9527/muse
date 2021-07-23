import React from 'react';
import { render } from 'react-dom';

import Header from './components/header';
import Modal from './components/modal';

import './index.less';

const App: React.FC = () => {
  return (
    <div id='muse-container'>
      <Header />
      <Modal visible />
    </div>
  );
};

render(<App />, document.getElementById('app'));
