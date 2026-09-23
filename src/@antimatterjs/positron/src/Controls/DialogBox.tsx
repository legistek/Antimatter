import * as React from 'react';
import { Antimatter, Binding, DataContext, ModelObjectReference, Point, Utilities } from '@antimatterjs/react';
import { DefaultEffects, Dialog, Icon, Modal, MotionAnimations, ResponsiveMode } from '@fluentui/react';

import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Control, IControlProps, IControlState } from './Control';
import { WebStyle } from '../Style';
import { Grid } from './Grid';
import { ItemsControl } from './ItemsControl';
import { CommandButton, ICommandButtonProps } from './CommandButton';
import { CommandBar } from './CommandBar';
import { Separator } from './Separator';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { HorizontalAlignment, Orientation, ScrollBarVisibility, VerticalAlignment } from '../Enums';
import { Panel } from './Panel';
import { ContentPresenter } from './ContentPresenter';
import { ProgressRing } from './ProgressRing';
import { MultitouchTransform } from '../Media/MultitouchTransform';
import { BusyPanel } from './BusyPanel';

interface IDialogBoxCommon
{
}
export interface IDialogBoxProps extends IControlProps, IDialogBoxCommon
{
    DialogTemplate?: string | Binding,
    IsBusy?: boolean | Binding,
    DefaultCommand?: Binding | ModelObjectReference,
    CancelCommand?: Binding | ModelObjectReference,
    AdditionalToolbar?: JSX.Element,
    Title?: string | Binding,
    PrimaryCommands?: ModelObjectReference[] | Binding,
    SecondaryCommands?: ModelObjectReference[] | Binding,
    Icon?: number | string | Binding,
    ViewModel?: ModelObjectReference | Binding,
    ErrorTemplate?: DataTemplate,
    HasError?: boolean | Binding,
}
export interface IDialogBoxState extends IControlState, IDialogBoxCommon
{
    DialogTemplate?: string,
    IsBusy?: boolean,
    DefaultCommand?: ModelObjectReference,
    CancelCommand?: ModelObjectReference,
    AdditionalToolbar?: JSX.Element,
    FeedbackCommand?: Binding | ModelObjectReference,
    Title?: string,
    PrimaryCommands?: ModelObjectReference[],
    SecondaryCommands?: ModelObjectReference[],
    Icon?: number | string,
    ViewModel?: ModelObjectReference,
    ErrorTemplate?: DataTemplate,
}

export class DialogBox extends Control<IDialogBoxProps, IDialogBoxState>
{
    static _templates: Map<string, (viewModel?: ModelObjectReference) => JSX.Element> =
        new Map<string, (viewModel?: ModelObjectReference) => JSX.Element>();

    public static readonly STATE_Loading = Antimatter.Identifier("amx-ptn-dlg-loading");

    public static RegisterTemplate(
        templateName: string,
        template: ((viewModel: any) => JSX.Element))
    {
        DialogBox._templates.set(templateName, template);
    }

    public get HasError(): boolean
    {
        return this.GetValue(nameof(this.props.HasError), false);
    }

    private static DialogButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Margin: "0px 5px"
        },
        {
        },
        CommandButton.DialogButtonStyle
    )

    _body?: Grid | null | undefined;
    _error?: ContentPresenter | null | undefined;

    static DefaultStyle: WebStyle<IDialogBoxProps> = new WebStyle(
        {
            Template: new ControlTemplate((templatedParent: DialogBox) =>
            (
                <Modal
                    isOpen={true}
                    allowTouchBodyScroll={true}
                    elementToFocusOnDismiss={document.body}
                    forceFocusInsideTrap={true}
                    styles={{
                        scrollableContent: {
                            overflow: 'hidden',
                            height: "auto",
                            display: "flex",
                        },
                        main: {
                            display: "flex",
                            borderRadius: "5px",
                            overflow: "hidden",
                            animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
                        }
                    }}>

                    <Grid
                        ClassName="main-grid"
                        TabIndex={-1}
                        OnKeyDown={(e) =>
                        {
                            if (e.key == "Enter" && templatedParent.state.DefaultCommand)
                                templatedParent.ExecuteCommand(templatedParent.state.DefaultCommand);
                            else if (e.key == 'Escape' && templatedParent.state.CancelCommand)
                                templatedParent.ExecuteCommand(templatedParent.state.CancelCommand);
                        }}
                        RowDefinitions={[
                            Grid.RowDefinition(),
                            Grid.RowDefinition(),
                            Grid.RowDefinition(1, true),
                            Grid.RowDefinition(),
                            Grid.RowDefinition(),
                            Grid.RowDefinition(),
                        ]}>

                        {/*Body*/}                                                    
                        <Grid
                            ref={r =>
                            {
                                templatedParent._body = r;
                                templatedParent.LimitErrorWidth();
                            }}
                            Width="max-content"
                            Grid={{ Row: 2 }}>
                            {
                                templatedParent.state.DialogTemplate
                                    ? DialogBox._templates
                                        .get(templatedParent.state.DialogTemplate)
                                        ?.call(templatedParent, templatedParent.state.ViewModel as ModelObjectReference)
                                    : null
                            }
                        </Grid>                       

                        {/*Busy Signal*/}
                        <BusyPanel Grid={{ Row: 2 }}
                            IsVisible={templatedParent.state.IsBusy}
                        />

                        {/*Error*/}
                        <ContentPresenter
                            ref={r =>
                            {
                                templatedParent._error = r;
                                templatedParent.LimitErrorWidth();
                            }}
                            Grid={{ Row: 3 }}
                            Margin="10px"
                            IsVisible={templatedParent.HasError}
                            ContentTemplate={templatedParent.state.ErrorTemplate} />

                        {/*Separator*/}
                        <Separator Grid={{ Row: 4 }} Margin="0px" Orientation={Orientation.Horizontal} />

                        {/*Buttons*/}
                        <Grid
                            Grid={{ Row: 5 }}
                            ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}
                            Margin="10px">
                            <CommandBar
                                Grid={{ Column: 0 }}
                                ItemsSource={templatedParent.state.SecondaryCommands}
                                HorizontalAlignment={HorizontalAlignment.Left}
                                ItemContainerStyle={DialogBox.DialogButtonStyle} />

                            {/* Primary Buttons */}
                            <CommandBar
                                Grid={{ Column: 1 }}
                                IsReversed={true}
                                ItemsSource={templatedParent.state.PrimaryCommands}
                                HorizontalAlignment={HorizontalAlignment.Stretch}
                                ItemContainerStyle={DialogBox.DialogButtonStyle} />
                        </Grid>

                        {/* Last so that focus starts where it should */}
                        {
                            templatedParent.state.Title &&
                            (<>
                                {/*Header Row */}
                                <Grid
                                    ref={r =>
                                    {
                                        templatedParent._header = r?.Container as HTMLElement;
                                        let parent: HTMLElement | undefined | null = r?.Container as HTMLElement;
                                        while (parent)
                                        {
                                            if (parent.classList.contains('ms-Dialog-main'))
                                            {
                                                templatedParent._elem = parent;
                                                return;
                                            }
                                            parent = parent.parentElement;
                                        }
                                    }}
                                    OnPointerDown={e => templatedParent.OnHeaderPointerDown(e)}
                                    OnPointerMove={e => templatedParent.OnHeaderPointerMove(e)}
                                    OnLostPointerCapture={e => templatedParent.OnHeaderPointerUp(e)}
                                    OnPointerUp={e => templatedParent.OnHeaderPointerUp(e)}
                                    Grid={{ Row: 0 }}
                                    ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true), Grid.ColumnDefinition(), Grid.ColumnDefinition()]}
                                    Margin="10px 10px 5px 10px">
                                    {/*Icon*/}
                                    <Icon
                                        style={{
                                            alignSelf: "center",
                                            height: "fit-content",
                                            margin: "0px 5px 0px 0px"
                                        }}
                                        iconName={CommandButton.ModelIconConverter(templatedParent.state.Icon)} />

                                    {/*Title Header*/}
                                    <TextBlock
                                        Grid={{ Column: 1 }}
                                        Text={templatedParent.state.Title}
                                        Margin="5px 0px"
                                        Style={TextBlock.DialogHeaderStyle} />

                                    {/*Optional Additional Content*/}
                                    {
                                        templatedParent.state.AdditionalToolbar &&
                                        <Panel
                                            VerticalAlignment={VerticalAlignment.Center}
                                            Grid={{ Column: 2 }}>
                                            {templatedParent.state.AdditionalToolbar}
                                        </Panel>
                                    }                                    

                                    {/*Close Button*/}
                                    <CommandButton
                                        Grid={{ Column: 3 }}
                                        Command={templatedParent.state.CancelCommand}
                                        VerticalAlignment={VerticalAlignment.Center}
                                        Padding="0px"
                                        Margin="0px"
                                        TabIndex={-1}
                                        Style={CommandButton.IconButtonStyle} />
                                </Grid>

                                {/*Separator*/}
                                <Separator Grid={{ Row: 1 }} Margin="0px" Orientation={Orientation.Horizontal} />

                            </>)
                        }

                    </Grid>
                </Modal>
            ))
        },
        {
            "@ .main-grid:focus": {
                outline: "none"
            }
        }
    );

    private LimitErrorWidth()
    {
        if (!this._error?.Container || !this._body?.Container)
            return;
        this._error.Container.style.maxWidth = this._body.Container.clientWidth.toString() + "px";
    }

    private OnHeaderPointerDown(e: PointerEvent)
    {
        this._isManipulating = true;
        this._header?.setPointerCapture(e.pointerId);
        this._manipulationStart = {
            X: e.clientX,
            Y: e.clientY
        }
        this._pointerID = e.pointerId;
    }

    private OnHeaderPointerMove(e: PointerEvent)
    {
        if (!this._elem || !this._isManipulating)
            return;
        let transX: number = e.clientX - this._manipulationStart.X;
        let transY: number = e.clientY - this._manipulationStart.Y;
        this._transform.TranslateX = transX;
        this._transform.TranslateY = transY;
        this._elem.style.transform = this._transform.ToCSS();
    }

    private OnHeaderPointerUp(e: PointerEvent)
    {
        try
        {
            this._header?.releasePointerCapture(this._pointerID);
        }
        catch
        {
            // who cares if the pointer wasn't already captured? Sheesh.
        }
        this._isManipulating = false;
        this._transform.CommitPendingTransformations();
    }

    override constructClasses(): string
    {
        return super.constructClasses() +
            (this.IsLoading ? ` ${DialogBox.STATE_Loading} ` : "");
    }
    
    _manipulationStart: Point = {X: 0, Y: 0};
    _elem?: HTMLElement | null = null;
    _header?: HTMLElement | null = null;
    _isManipulating: boolean = false;
    _pointerID: number = 0;
    _transform: MultitouchTransform = new MultitouchTransform();
}