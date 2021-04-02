import * as React from 'react';
import { Component } from 'react';
import { Antimatter } from '../Antimatter';
import { Binding, BindingBase } from '../Binding';
import { ModelObjectReference } from '../ModelObjectReference';
import { ReactClient } from './ReactClient';

type DumbTextBlockProps = {
    Text?: string | BindingBase,
    DataContext?: ModelObjectReference | BindingBase
}

export class DumbTextBlock extends Component<DumbTextBlockProps, DumbTextBlockProps>
{
    constructor(props: DumbTextBlockProps)
    {
        super(props);
        Antimatter.InitializeComponent(this);
    }

    render(): JSX.Element
    {
        return (
            <span>{this.state.Text}</span>
            );
    }
}