'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, HashRouter, Route } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { registerIcons } from '@fluentui/react/lib/Styling';

import './theme';       // Do this before ANY positron stuff

import { Antimatter, SignalRServer, ReactClient, WebassemblyServer, DataContext, Binding } from '@antimatterjs/react';
import { Window } from '@antimatterjs/positron'
import { MainWindow } from './limine/MainWindow';

import { Style } from '@antimatterjs/positron';
import App from './App';
import ViewerTestApp from './ViewerTestApp';

import './custom.css'

registerIcons(
    {
        fontFace: {
            fontFamily: "IconFont",
        },
        icons: Style.CreateIconSet(0xE900, 0xF200)
        //{
        //    'ThumbsUp': '\uE902',
        //    'ThumbsDown': '\uE901',
        //    'E90D': '\uE90D',
        //}
    })
initializeIcons();

(async function ()
{
    await Antimatter.StartAsync(
        new WebassemblyServer(),
        new ReactClient());

    var appModel = await Antimatter.Server.GetRootObject("app");
    
    const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
    const rootElement = document.getElementById('root');

    ReactDOM.render(        
        <BrowserRouter basename={baseUrl}>                
            <App Model={appModel}/>
        </BrowserRouter>,
        rootElement);

    registerServiceWorker();
})();


