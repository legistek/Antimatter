import { Component } from 'react';
import * as React from 'react';
import { Antimatter, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { Icon, PrimaryButton } from '@fluentui/react';
import { ModelValue } from '@antimatterjs/react';
import { Grid, Orientation, StackPanel, TextBlock } from '@antimatterjs/positron';

export interface IModernButtonProps
{
    Label?: string | Binding,
    Command?: ModelObjectReference | Binding,
    CommandParameter?: any,
    className?: string
    IsEnabled?: boolean | Binding;
}
interface IModernButtonState
{
    Label?: string
    Command?: ModelObjectReference,
    CommandParameter?: any
    IsEnabled?: boolean;
}
export class ModernButton extends AntimatterComponent<IModernButtonProps, IModernButtonState>
{
    constructor(props)
    {
        super(props);        
    }

    public static DefaultBindings = {
        IsEnabled: {
            FallbackValue: true
        }
    };

    render()
    {
        //this.BindState({ Path: "IsVisible", Source: this.state.Command }, "buttonIsVisible");
        //if (!this.state["buttonIsVisible"])
        //    return null;

        return (
            <PrimaryButton
                styles={{
                    label: {
                        display: "flex"
                    }
                }}
                className={"amx-standard-control " + this.props.className}
                iconProps={{ iconName: 'EA12' }}
                disabled={this.BindState({ Path: "IsEnabled", Source: this.state.Command, Converter: e => !e })}
                onClick={() => this.onClick()}>

                {this.BindState({ Path: "Name", Source: this.state.Command, Converter: s => s?.toUpperCase() })}
                {/*<TextBlock Text={new Binding({ Path: "Name", Source: this.state.Command })} />*/}

                {/*<StackPanel Orientation={Orientation.Horizontal}>*/}
                {/*    */}{/*<TextBlock*/}
                {/*    */}{/*    FontFamily="IconFont" Text={*/}
                {/*    */}{/*        new Binding({*/}
                {/*    */}{/*            Path: "Icon", Source: this.state.Command,*/}
                {/*    */}{/*            Converter: (iconNo: number) =>*/}
                {/*    */}{/*                String.fromCharCode(iconNo)*/}
                {/*    */}{/*        })} />*/}{/*                    */}
                {/*    */}
                {/*</StackPanel>*/}
            </PrimaryButton>
            );
    }

    onClick()
    {
        if (this.state.Command)
            Antimatter.Server.ExecuteICommand(
                this.state.Command,
                ModelValue.Get(this.state.CommandParameter));
    }
}