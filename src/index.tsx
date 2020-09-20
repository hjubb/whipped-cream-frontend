import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {InjectedConnector} from "@web3-react/injected-connector";
import {Web3ReactProvider} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";

export const injectedConnector = new InjectedConnector({
    supportedChainIds: [ 1 /* main net only */]
});

function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
}

ReactDOM.render(
  <React.StrictMode>
      <Web3ReactProvider getLibrary={getLibrary}>
          <App />
      </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
