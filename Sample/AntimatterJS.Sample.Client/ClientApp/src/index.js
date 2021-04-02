import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Antimatter, SignalRServer, ReactClient, WebassemblyServer } from '@antimatterjs/react';

(async function ()
{
    await Antimatter.StartAsync(new SignalRServer(), new ReactClient());
    var appModel = await Antimatter.Server.GetRootObject("app");

    const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
    const rootElement = document.getElementById('root');

    ReactDOM.render(
        <BrowserRouter basename={baseUrl}>
            <App DataContext={appModel} />
        </BrowserRouter>,
        rootElement);

    registerServiceWorker();
})();


