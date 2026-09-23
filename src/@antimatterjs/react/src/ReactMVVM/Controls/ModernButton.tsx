import * as React from 'react';
import { DependencyProperty, FrameworkPropertyMetadataOptions, PropertyMetadata } from '../DependencyProperty';
import { DependencyObject } from '../DependencyObject';
import { Binding } from '../../Binding';
import { ModelObjectReference } from '../../ModelObjectReference';
import { ICommand } from '../ICommand';
import { Antimatter } from '../../Antimatter';

type ModernButtonProps = {
    Label?: Binding | string,
    Command?: Binding | ModelObjectReference 
}

export class ModernButton extends DependencyObject<ModernButtonProps>
{
    static displayName = ModernButton.name;
    constructor(props)
    {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    public static CommandProperty: DependencyProperty = DependencyProperty.Register(
        "Command",
        new PropertyMetadata(null, FrameworkPropertyMetadataOptions.None));
    public get Command(): ModelObjectReference | ICommand
    {
        return this.GetValue(ModernButton.CommandProperty);        
    }
    public set Command(value: ModelObjectReference | ICommand)
    {
        this.SetValue(ModernButton.CommandProperty, value);
    }

    public static LabelProperty: DependencyProperty = DependencyProperty.Register(
        "Label",
        new PropertyMetadata("", FrameworkPropertyMetadataOptions.AffectsRender));
    public get Label(): string
    {
        return this.GetValue(ModernButton.LabelProperty);
    }
    public set Label(value: string)
    {
        this.SetValue(ModernButton.LabelProperty, value);
    }

    /* override */ renderElement() : JSX.Element
    {
        return (
            <button className="btn btn-primary"
                    onClick={this.onClick}>
                {this.Label}
            </button>
        )
    }

    async onClick()
    {
        if (!this.Command)
            return;

        var cmddnr = this.Command as ModelObjectReference;
        if (cmddnr.IsModelObjectReference)
        {
            // for (let i: number = 0; i < 10000; i++)
            {
                await Antimatter.Server.ExecuteICommand(cmddnr);
            }
        }        
    }
}