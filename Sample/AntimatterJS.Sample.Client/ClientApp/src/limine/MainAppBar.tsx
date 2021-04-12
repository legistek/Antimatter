import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { createTheme, getTheme, loadTheme } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { Window } from '../components/Window';
import { TextBlock } from '../components/TextBlock';

export class MainAppBar extends AntimatterComponent
{
    static theme = getTheme();

    render()
    {
        return (
            <div style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                background: MainAppBar.theme.palette.themeDarker,
                color: MainAppBar.theme.palette.themeLighter
            }}>
                <TextBlock Text="Limine" />

                <div>
                </div>

                <TextBlock Text={new Binding("Identity.DisplayName")}/>
            </div>
            );
    }
}