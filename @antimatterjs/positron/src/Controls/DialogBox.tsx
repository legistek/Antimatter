import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';

import { DefaultEffects, Dialog, getTheme, Icon, Modal, MotionAnimations, Separator } from '@fluentui/react';

import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
import { Grid } from './Grid';
import { ItemsControl } from './ItemsControl';
import { CommandButton } from './CommandButton';
import { HorizontalAlignment, VerticalAlignment } from '@antimatterjs/positron/src/Enums';
import { template } from '@babel/core';
import { CommandBar } from './CommandBar';

interface IDialogBoxCommon
{    
}
export interface IDialogBoxProps extends IControlProps, IDialogBoxCommon
{
    DialogTemplate?: string | Binding,
    ViewModel?: ModelObjectReference | Binding   
}
export interface IDialogBoxState extends IControlState, IDialogBoxCommon
{
    DialogTemplate?: string,
    ViewModel?: ModelObjectReference
}

export class DialogBox extends Control<IDialogBoxProps, IDialogBoxState>
{
    private static _templates: Map<string, (viewModel: ModelObjectReference | undefined) => JSX.Element> =
        new Map<string, (viewModel: ModelObjectReference | undefined) => JSX.Element>();

    public static RegisterTemplate(
        templateName: string,
        template: ((viewModel: ModelObjectReference | undefined) => JSX.Element))
    {
        DialogBox._templates.set(templateName, template);
    }

    static DefaultStyle: Style<IDialogBoxProps> = new Style(
        {
            Template: (templatedParent: DialogBox) =>
            (
                <Modal
                    isOpen={true}
                    styles={{
                        main: {
                            minHeight: "50px",
                            minWidth: "50vw",
                            borderRadius: "5px",
                            animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
                        }}}>
                    <DataContext Value={templatedParent.state.ViewModel}>
                        <Grid RowDefinitions={[
                            Grid.RowDefinition(),
                            Grid.RowDefinition(),
                            Grid.RowDefinition(1, true),
                            Grid.RowDefinition(),
                            Grid.RowDefinition(),
                        ]}>

                            {/*Header*/}
                            <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}
                                Margin="10px 10px 5px 10px">
                                {/*Icon*/}
                                <Icon
                                    style={{
                                        alignSelf: "center",
                                        height: "fit-content",
                                        margin: "0px 5px 0px 0px"
                                    }}
                                    iconName={templatedParent.BindState({ Path: "Icon", Converter: CommandButton.ModelIconConverter, Source: templatedParent.state.ViewModel })} />

                                {/*Title Header*/}
                                <TextBlock Text={new Binding("Title")}
                                    Margin="0px"
                                    Style={TextBlock.DialogHeaderStyle}/>

                                {/*Close Butotn*/}
                                <CommandButton Command={new Binding("CancelCommand")}
                                    VerticalAlignment={VerticalAlignment.Center}
                                    Padding="0px"
                                    Margin="0px"
                                    Style={CommandButton.IconButtonStyle}/>
                            </Grid>

                            {/*Separator*/}
                            <Separator styles={{
                                root: {
                                    lineHeight: "0",
                                    padding: "0px"
                                },
                            }}/>

                            {/*Body*/}
                            {
                                DialogBox
                                    ._templates
                                    .get(templatedParent.BindState({ Path: "Template", Source: templatedParent.state.ViewModel }))
                                    ?.call(templatedParent, templatedParent.state.ViewModel)
                            }

                            {/*Separator*/}
                            <Separator styles={{
                                root: {
                                    lineHeight: "0",
                                    padding: "0px"
                                },
                            }} />

                            {/*Buttons*/}
                            <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition()]}
                                Margin="0px 10px 0px 10px">
                                <CommandBar ItemsSource={new Binding("SecondaryCommands")}
                                    HorizontalAlignment={HorizontalAlignment.Left}
                                    ItemContainerStyle={CommandButton.DialogButtonStyle}/>                                

                                {/* Primary Buttons */}
                                <CommandBar ItemsSource={new Binding("PrimaryCommands")}
                                    HorizontalAlignment={HorizontalAlignment.Right}
                                    ItemContainerStyle={CommandButton.DialogButtonStyle}/>
                            </Grid>
                        
                        </Grid>
                    </DataContext>
                </Modal>
            )
        }
    );


}