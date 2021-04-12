import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Antimatter, SignalRServer, ReactClient, WebassemblyServer, DataContext } from '@antimatterjs/react';
import { MainWindow } from './limine/MainWindow';

(async function ()
{
    await Antimatter.StartAsync(new SignalRServer(), new ReactClient());
    var appModel = await Antimatter.Server.GetRootObject("app");

    var limine = await Antimatter.Server.GetRootObject("limine");

    const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
    const rootElement = document.getElementById('root');

    ReactDOM.render(
        <div>
            <BrowserRouter basename={baseUrl}>
                <DataContext Value={limine}>
                    <MainWindow />
                </DataContext>
            </BrowserRouter>
        </div>,
        rootElement);

    registerServiceWorker();
})();


