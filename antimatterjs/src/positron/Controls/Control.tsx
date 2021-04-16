import { Component } from 'react';
import * as React from 'react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { Binding } from '../../Binding';

export interface IControlProps extends IFrameworkElementProps
{
    IsEnabled?: boolean | Binding,
    Background?: string | Binding,
    BorderBrush?: string | Binding,
    BorderThickness?: string | Binding,
    Padding?: string
}

export interface IControLState extends IFrameworkElementState
{
    IsEnabled?: boolean,
    Background?: string,
    BorderBrush?: string,
    BorderThickness?: string
}

export class Control<P extends IControlProps = {}, S extends IControLState = {}>
    extends FrameworkElement<P,S>
{
}