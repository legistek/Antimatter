'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, HashRouter, Route } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';

import './theme';
import './custom.css'

import { Antimatter, SignalRServer, ReactClient, WebassemblyServer, DataContext, Utilities } from '@antimatterjs/react';
import { MainWindow } from './limine/MainWindow';
import { createTheme, getTheme, loadTheme, Link } from '@fluentui/react';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { registerIcons } from '@fluentui/react/lib/Styling';

import { Style, View, Window } from '@antimatterjs/positron';



import App from './App';
import ViewerTestApp from './ViewerTestApp';

const theme = createTheme({
    // You can also modify certain other properties such as fontWeight if desired
    //defaultFontStyle: { fontFamily: 'Roboto' },
    palette: {
        themePrimary: '#2e70e0',
        themeLighterAlt: '#f6f9fe',
        themeLighter: '#dae6fa',
        themeLight: '#bcd1f6',
        themeTertiary: '#a1b6e3',
        themeSecondary: '#2e70e0',
        themeDarkAlt: '#0056b8',
        themeDark: '#0056b8',
        themeDarker: '#1e295b',
        neutralLighterAlt: '#f0f1f5',
        neutralLighter: '#f0f1f5',
        neutralLight: '#d7d9e1',
        neutralQuaternaryAlt: '#d7d9e1',
        neutralQuaternary: '#594747',
        neutralTertiaryAlt: '#494955',
        neutralTertiary: '#a0a0a0',
        neutralSecondary: '#606060',
        neutralPrimaryAlt: '#101010',
        neutralPrimary: '#101010',
        neutralDark: '#101010',
        black: '#000000',
        white: '#ffffff',
    }
});

registerIcons(
    {
        fontFace: {
            fontFamily: "IconFont",
        },
        icons: Style.CreateIconSet(0xE900, 0xEA15)
        //{
        //    'ThumbsUp': '\uE902',
        //    'ThumbsDown': '\uE901',
        //    'E90D': '\uE90D',
        //}
    })
//initializeIcons();
loadTheme(theme);

(async function ()
{
    await Antimatter.StartAsync(
        new WebassemblyServer(),
        new ReactClient());

    var appModel = await Antimatter.Server.GetRootObject("app");
    
    const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
    const rootElement = document.getElementById('root');

    ReactDOM.render(
        <div>
            <BrowserRouter basename={baseUrl}>                
                <App Model={appModel}/>
            </BrowserRouter>
        </div>,
        rootElement);

    registerServiceWorker();
})();


