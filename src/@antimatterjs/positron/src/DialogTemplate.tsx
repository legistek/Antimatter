import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { Component } from 'react';

export interface IDialogTemplateProps
{
    ViewModel: ModelObjectReference
}
export interface IDialogTemplateState
{
    ViewModel: ModelObjectReference
}

export abstract class DialogTemplate extends Component<IDialogTemplateProps, IDialogTemplateState>
{
    constructor(props)
    {
        super(props);
        Antimatter.InitializeComponent(this);
    }

    protected abstract renderTemplate(): JSX.Element;

    public /* override sealed */ renderElement(): JSX.Element
    {
        return this.renderTemplate();
    }
}
