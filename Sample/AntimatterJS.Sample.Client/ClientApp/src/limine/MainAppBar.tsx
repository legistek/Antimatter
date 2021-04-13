import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { createTheme, getTheme, loadTheme } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { Window } from '../components/Window';
import { TextBlock } from '../components/TextBlock';

export class MainAppBar extends AntimatterComponent
{
    //static theme = getTheme();

    render()
    {
        const theme = getTheme();

        return (
            <div style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                background: theme.palette.themeDarker,
                color: theme.palette.themeLighter
            }}>
                <TextBlock Text="Limine" />

                <div>
                </div>

                <TextBlock Text={new Binding("Identity.DisplayName")}/>
            </div>
            );
    }
}