'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { registerIcons } from '@fluentui/react/lib/Styling';

import './theme';       // Do this before ANY positron stuff

import { Antimatter, ReactClient, WebassemblyServer } from '@antimatterjs/react';
import { Glyph, Window } from '@antimatterjs/positron'

import { Style } from '@antimatterjs/positron';
import App from './App';

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

Glyph.RegisterURL("folder", "/folder.svg");

(async function ()
{
    await Antimatter.StartAsync(
        new WebassemblyServer(),
        new ReactClient());

    var appModel = await Antimatter.Server.GetRootObject("app");

    const baseUrl = document.getElementsByTagName('base')[0]?.getAttribute('href') || '';
    const rootElement = document.getElementById('root');

    if (rootElement)
    {
        const root = createRoot(rootElement);
        root.render(
            <BrowserRouter basename={baseUrl}>
                <App Model={appModel} />
            </BrowserRouter>
        );
    }
})();


/*
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { Antimatter, ReactClient, WebassemblyServer } from '@antimatterjs/react';

(async function ()
{
    await Antimatter.StartAsync(
        new WebassemblyServer(),
        new ReactClient());

    var appModel = await Antimatter.Server.GetRootObject("app");

    // const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
    
    console.log(ph.Hobo());
    
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
})();


*/