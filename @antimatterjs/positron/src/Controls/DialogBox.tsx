import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';
import { DefaultEffects, Dialog, Icon, Modal, MotionAnimations } from '@fluentui/react';

import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Control, IControlProps, IControlState } from './Control';
import { WebStyle } from '../Style';
import { Grid } from './Grid';
import { ItemsControl } from './ItemsControl';
import { CommandButton, ICommandButtonProps } from './CommandButton';
import { CommandBar } from './CommandBar';
import { Separator } from './Separator';
import { ControlTemplate } from '../FrameworkTemplate';
import { HorizontalAlignment, ScrollBarVisibility, VerticalAlignment } from '../Enums';
import { Panel } from './Panel';

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
    static _templates: Map<string, (viewModel: ModelObjectReference) => JSX.Element> =
        new Map<string, (viewModel: ModelObjectReference) => JSX.Element>();

    public static RegisterTemplate(
        templateName: string,
        template: ((viewModel: ModelObjectReference) => JSX.Element))
    {
        DialogBox._templates.set(templateName, template);
    }

    private static DialogButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Margin: "0px 5px"
        },
        {
        },
        CommandButton.DialogButtonStyle
    )

    static DefaultStyle: WebStyle<IDialogBoxProps> = new WebStyle(
        {
            Template: new ControlTemplate((templatedParent: DialogBox) =>
            (
                <Modal
                    isOpen={true}
                    styles={{                        
                        scrollableContent: {
                            overflow: 'hidden',
                            height: "auto",
                            display: "flex",
                        },
                        main: {
                            display: "flex",
                            minHeight: "50px",
                            maxHeight: "75vh",
                            // minWidth: "25vw",
                            borderRadius: "5px",
                            overflow: "hidden",
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
                            <Grid
                                Grid={{Row: 0}}
                                ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}
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
                                <TextBlock
                                    Grid={{Column: 1}}
                                    Text={new Binding("Title")}
                                    Margin="5px 0px"
                                    Style={TextBlock.DialogHeaderStyle}/>

                                {/*Close Button*/}
                                <CommandButton
                                    Grid={{ Column: 2 }}
                                    Command={new Binding("CancelCommand")}
                                    VerticalAlignment={VerticalAlignment.Center}
                                    Padding="0px"
                                    Margin="0px"
                                    TabIndex={-1}
                                    Style={CommandButton.IconButtonStyle}/>
                            </Grid>

                            {/*Separator*/}
                            <Separator Grid={{ Row: 1 }} />

                            {/*Body*/}
                            <Grid Padding="10px" Grid={{ Row: 2 }}
                                VerticalScrollBarVisibility={ScrollBarVisibility.Auto}>
                                {
                                    DialogBox._templates
                                        .get(templatedParent.BindState({ Path: "DialogTemplate", Source: templatedParent.state.ViewModel }))
                                        ?.call(templatedParent, templatedParent.state.ViewModel as ModelObjectReference)
                                }
                            </Grid>

                            {/*Separator*/}
                            <Separator Grid={{ Row: 3 }}/>

                            {/*Buttons*/}
                            <Grid
                                Grid={{ Row: 4 }}
                                ColumnDefinitions={[Grid.ColumnDefinition(1,true), Grid.ColumnDefinition()]}
                                Margin="10px">
                                <CommandBar
                                    Grid={{ Column: 0 }}
                                    ItemsSource={new Binding("SecondaryCommands")}
                                    HorizontalAlignment={HorizontalAlignment.Left}
                                    ItemContainerStyle={DialogBox.DialogButtonStyle}/>                                

                                {/* Primary Buttons */}
                                <CommandBar
                                    Grid={{ Column: 1 }}
                                    ItemsSource={new Binding("PrimaryCommands")}
                                    HorizontalAlignment={HorizontalAlignment.Right}
                                    ItemContainerStyle={DialogBox.DialogButtonStyle}/>
                            </Grid>
                        
                        </Grid>
                    </DataContext>
                </Modal>
            ))
        }
    );


}