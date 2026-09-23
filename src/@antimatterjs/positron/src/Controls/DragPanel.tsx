import * as React from 'react';
import { Antimatter, Binding, BindingMode, IClientFile, ModelObjectReference, PropertyChangedEventArgs, Utilities } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementState } from '../FrameworkElement';
import { DataTemplate } from '../FrameworkTemplate';

import { IPanelProps, PanelBase } from './Panel';
import { ContentPresenter } from './ContentPresenter';
import { ContextMenu } from './ContextMenu';
import { Application } from '../Application';
import { WebStyle } from '../Style';
import { SemanticColor, Theme, ThemeColor } from '../Theme';

const ON_HOVER_DELAY: number = 500;

export enum DropAcceptance
{
    None = 0,
    InternalDropOver = 1,
    InternalDropBetween = 2,
    ExternalDropOver = 4,
}

export interface IDragDropPanel extends IPanelProps
{
    DragSourceContent?: any | (() => any) | Binding,
    DropContent?: any | Binding,
    CanDrag?: boolean | Binding,
    IsDragDisabled?: boolean | Binding,     // temproary thing, vs. CanDrag
    DragTemplate?: DataTemplate,
    Accepts?: DropAcceptance|Binding,
    DropCommands?: ModelObjectReference[] | Binding,
    DropTemplate?: DataTemplate,
    DragOverPosition?: number | Binding,
    IsTop?: boolean | Binding,
    ShowContextMenu?: boolean | Binding,
    OnDragHover?: ModelObjectReference | Binding
}

export class DragDropPanelBase<P extends IDragDropPanel = {}> extends PanelBase<P, IFrameworkElementState>
{
    public static DragBetweenPixelThreshold: number = 8;

    public static DefaultStyle = new WebStyle<IDragDropPanel>({

    },
        {
            "@.drag-bottom-edge": {
                borderWidth: "0px 0px 1px 0px",
                borderColor: Theme.Value(ThemeColor.ThemePrimary),
            },
            "@.drag-top-edge": {
                overflow: "visible",
            },
            "@.drag-top-edge::before": {
                position: "absolute",
                content: "\"_\"",
                color: 'transparent',
                width: "100%",
                height: "1px",
                background: Theme.Value(ThemeColor.ThemePrimary),
                top: 0,
                right: 0,
                left: 0,
                transform: "translate(0px,-1px)",
                cursor: "inherit"
            },
            "@.drag-top-edge.top::before": {
                transform: "translate(0px,0px)",
                cursor: "inherit"
            },
            "@.drop-menu-open": {
                background: Theme.Value(SemanticColor.ListItemBackgroundCheckedHovered)
            }
            //"@.drag-bottom-edge::after": {
            //    width: "100%",
            //    height: "2px",
            //    position: "absolute",
            //    content: "\"_\"",
            //    color: 'transparent',
            //    background: Theme.Value(ThemeColor.ThemePrimary),
            //    bottom: 0,
            //    right: 0,
            //    left: 0,
            //    transform: "translate(0px,-3px)",
            //}
        })

    public static DefaultBindings = {
        DropContent: {
            Mode: BindingMode.TwoWay
        },
        IsClickFocused: {
            Mode: BindingMode.TwoWay
        },
        DragOverPosition: {
            Mode: BindingMode.TwoWay
        }
    };

    constructor(props)
    {
        super(props);
        this.OnMouseEnter = this.OnMouseEnter.bind(this);
        this.OnMouseLeave = this.OnMouseLeave.bind(this);
        this.OnMouseUp = this.OnMouseUp.bind(this);
        this.OnMouseMove = this.OnMouseMove.bind(this);
    }

    public get IsTop(): boolean
    {
        return this.GetValue(nameof(this.props.IsTop), false);
    }

    public get IsDragDisabled(): boolean
    {
        return this.GetValue(nameof(this.props.IsDragDisabled), false);
    }

    public get DragOverPosition(): number
    {
        return this.GetValue(nameof(this.props.DragOverPosition), 0);
    }
    public set DragOverPosition(value: number)
    {
        this.SetValue(nameof(this.props.DragOverPosition), value, true);
    }

    public get ShowContextMenu(): boolean
    {
        return this.GetValue(nameof(this.props.ShowContextMenu), false);
    }
    public set ShowContextMenu(value: boolean)
    {
        this.SetValue(nameof(this.props.ShowContextMenu), value, true);
        this.PropertyChanged?.invoke(this, new PropertyChangedEventArgs(nameof(this.ShowContextMenu)));
    }

    public get CanDrag(): boolean
    {
        return this.GetValue(nameof(this.props.CanDrag), true);
    }

    public get DragTemplate(): DataTemplate
    {
        return this.GetValue(nameof(this.props.DragTemplate));
    }

    public get DropCommands(): ModelObjectReference[]
    {
        return this.GetValue(nameof(this.props.DropCommands), []);
    }

    public get Accepts(): DropAcceptance
    {
        return this.GetValue(nameof(this.props.Accepts), DropAcceptance.None);
    }

    public get DropTemplate(): DataTemplate
    {
        return this.GetValue(nameof(this.props.DropTemplate));
    }

    public get DropContent(): any
    {
        return this.GetValue(nameof(this.props.DropContent));
    }

    public get DragSourceContent(): any
    {
        var propVal = this.GetValue(nameof(this.props.DragSourceContent));
        if (typeof (propVal) === "function")
            return propVal();
        else
            return propVal;
    }

    public get OnDragHover(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.OnDragHover));
    }

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.props.DropCommands) &&
            Application.CurrentWindow?.DragGhost?.DropOwner === this)
        {
            Application.CurrentWindow.DragGhost.DropCommands = value;
        }
        super.OnBoundPropertyUpdate(property, value, oldValue);
    }

    public CancelDrag(): void
    {
        this._isDraggedOver = false;
        this.DragOverPosition = 0;
        this.InvalidateRender();
    }

    override renderElement()
    {
        return (
            <>
                {super.renderElement()}
                {
                    this._isDraggedOver &&
                    this.DropTemplate &&
                    this.DragOverPosition === 0 &&
                    this.DropCommands?.length &&
                    <ContentPresenter
                        IsHitTestVisible={false}
                        Overlaps={true}
                        ContentTemplate={this.DropTemplate} />
                }
                {
                    <ContextMenu
                        Overlaps={true}
                        GetCommandParameter={() => this.DropContent}
                        OnSelection={() =>
                        {
                            this.ShowContextMenu = false;
                            this.InvalidateRender();
                        }}
                        ItemsSource={this.DropCommands}
                        IsOpen={new Binding({
                            Source: this,
                            Path: nameof(this.ShowContextMenu),
                            Mode: BindingMode.TwoWay
                        })} />
                }
            </>);
    }

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        if (this.Accepts > 0)
        {
            styles.pointerEvents = "initial";
            if (this.DropCommands.length > 0)
                styles.cursor = 'default';
        }

        //if (this.DragOverPosition < 0)
        //    styles.boxShadow = `0 -1px 0px ${Theme.Value(ThemeColor.ThemePrimary)}, inset 0 1px 0px ${Theme.Value(ThemeColor.ThemePrimary)}`;
        //else if (this.DragOverPosition > 0)
        //    styles.boxShadow = `0 1px 0px ${Theme.Value(ThemeColor.ThemePrimary)}, inset 0 -1px 0px ${Theme.Value(ThemeColor.ThemePrimary)}`;

        return styles;
    }


    override constructClasses()
    {
        let classes: string = super.constructClasses();

        if (this.ShowContextMenu)
            classes += " drop-menu-open ";

        if (this.DragOverPosition === 0 || !this.DropCommands || this.DropCommands.length === 0)
            return classes;

        if (this.DragOverPosition < 0)
            classes += " drag-top-edge ";
        else if (this.DragOverPosition > 0)
            classes += " drag-bottom-edge ";

        if (this.IsTop)
            classes += " top ";

        return classes;
    }

    private _dragCounter: number = 0;

    override OverrideContainerAttributes(
        containerProps: React.HTMLAttributes<HTMLElement> & React.ClassAttributes<HTMLElement>): void
    {
        if (this.CanDrag && this.IsEnabled && !this.IsDragDisabled)
        {
            containerProps.draggable = true;
            containerProps.onDragStart = (e) => this.OnDragStart(e);
        }

        if (Utilities.HasFlag(this.Accepts, DropAcceptance.ExternalDropOver))
        {
            containerProps.onDragEnter = e =>
            {
                if (!e.dataTransfer?.items || e.dataTransfer.items.length === 0)
                    return;

                if (this._dragCounter++ > 0)
                {
                    e.dataTransfer.dropEffect = 'copy';
                    return;
                }

                let ifiles: string[] = [];
                for (let i = 0; i < e.dataTransfer.items.length; i++)
                {
                    var item = e.dataTransfer.items[i];
                    if (item.kind !== 'file')
                        continue;
                    var file = item.type;
                    if (file === null || file === undefined)
                        continue;
                    ifiles.push(file || " ");
                }

                this.SetValue(
                    nameof(this.props.DropContent),
                    ifiles,
                    false,
                    false);

                if (this.DropCommands?.length && this.DropCommands.length > 0)
                {
                    e.dataTransfer.dropEffect = 'copy';
                    this._isDraggedOver = true;
                    this.InvalidateRender();
                }
                else
                {
                    e.dataTransfer.dropEffect = 'none';
                }

                e.stopPropagation();
                e.preventDefault();
            };
            containerProps.onDragOver = e =>
            {
                if (this.DropCommands?.length && this.DropCommands.length > 0)
                    e.dataTransfer.dropEffect = 'copy';
                else
                    e.dataTransfer.dropEffect = 'none';

                e.stopPropagation();
                e.preventDefault();
            };
            containerProps.onDragLeave = e =>
            {
                if (--this._dragCounter === 0)
                {
                    e.dataTransfer.dropEffect = 'none';
                    this._isDraggedOver = false;
                    this.InvalidateRender();
                }
                else
                {
                    e.dataTransfer.dropEffect = 'copy';
                }
                e.stopPropagation();
                e.preventDefault();
            };
            containerProps.onDrop = e =>
            {
                this._dragCounter = 0;

                if (!e.dataTransfer?.items || e.dataTransfer.items.length === 0)
                    return;
                let ifiles: IClientFile[] = [];
                for (let i = 0; i < e.dataTransfer.items.length; i++)
                {
                    var item = e.dataTransfer.items[i];
                    if (item.kind !== 'file')
                        continue;
                    var file = item.getAsFile();
                    if (!file)
                        continue;
                    ifiles.push(file);
                }

                this.SetValue(
                    nameof(this.props.DropContent),
                    ifiles,
                    false,
                    false);

                if (e)
                    FrameworkElement.LastMouseEvent = { X: e?.clientX, Y: e?.clientY };
                this.ExecuteDrop();

                this._isDraggedOver = false;
                this.InvalidateRender();
                e.stopPropagation();
                e.preventDefault();
            };
        }
        if (Utilities.HasFlag(this.Accepts, DropAcceptance.InternalDropBetween) ||
            Utilities.HasFlag(this.Accepts, DropAcceptance.InternalDropOver))
        {
            containerProps.onMouseEnter = this.OnMouseEnter;
            containerProps.onMouseLeave = this.OnMouseLeave;
            containerProps.onMouseUp = this.OnMouseUp;
            containerProps.onMouseMove = this.OnMouseMove;
        }
    }

    private OnMouseEnter(e: React.MouseEvent)
    {
        if (!Application.CurrentWindow?.IsDragging)
            return;
        this._isDraggedOver = true;
        this.SetDragOverPosition(e);
        //this.InvalidateRender();
        e.stopPropagation();

        if (Application.CurrentWindow.DragGhost)
        {
            Application.CurrentWindow.DragGhost.DropOwner = this;
            Application.CurrentWindow.DragGhost.DropCommands = this.DropCommands;
        }

        this.SetValue(
            nameof(this.props.DropContent),
            Application.CurrentWindow?.DragContent,
            false,
            false);

        Application.CurrentDropPanel = this;

        this.OnHoverBegin();
    }

    private async OnMouseLeave(e: React.MouseEvent)
    {
        if (!Application.CurrentWindow?.IsDragging)
            return;
        this._isDraggedOver = false;
        e.stopPropagation();

        this.SetValue(
            nameof(this.props.DropContent),
            null,
            false,
            false);

        // Help eliminate the flash of the no-drop cursor
        await Utilities.SleepAsync(100);
        this.DragOverPosition = 0;
        this.InvalidateRender();
    }

    private OnMouseUp(e: React.MouseEvent)
    {
        if (!this._isDraggedOver)
            return;
        this._isDraggedOver = false;

        this.InvalidateRender();

        if (e)
            FrameworkElement.LastMouseEvent = { X: e?.clientX, Y: e?.clientY };

        this.ExecuteDrop();
        this.DragOverPosition = 0;
    }

    private OnMouseMove(e: React.MouseEvent)
    {
        if (!Application.CurrentWindow?.IsDragging)
            return;

        this.SetDragOverPosition(e);

        // In case the drag item and target are in the same location
        if (!this._isDraggedOver)
            this.OnMouseEnter(e);
    }

    private async OnHoverBegin(): Promise<void>
    {
        if (!this.OnDragHover)
            return;

        await Utilities.SleepAsync(ON_HOVER_DELAY);

        if (!this._isDraggedOver)
            return;
        this.ExecutePropCommandHandler(this.OnDragHover);
    }

    private SetDragOverPosition(e: React.MouseEvent)
    {
        if ((this.Accepts & DropAcceptance.InternalDropBetween) === 0)
        {
            this.DragOverPosition = 0;
            return;
        }

        var rc = this.Container?.getBoundingClientRect();
        if (!rc)
        {
            this.DragOverPosition = 0;
            return;
        }

        let threshold: number =
            ((this.Accepts & DropAcceptance.InternalDropOver) > 0 ||
                (this.Accepts & DropAcceptance.ExternalDropOver) > 0)
                ? DragDropPanel.DragBetweenPixelThreshold
                : rc.height / 2;

        if (e.clientY <= rc.top + threshold)
            this.DragOverPosition = -1;
        else if (e.clientY >= rc.bottom - threshold)
            this.DragOverPosition = 1;
        else
            this.DragOverPosition = 0;
    }

    private async OnDragStart(e: React.DragEvent)
    {
        if (this.DragTemplate)
            Application.CurrentWindow?.BeginDrag(
                this.DragSourceContent,
                this.DragTemplate,
                { X: e.clientX, Y: e.clientY });

        e.preventDefault();
        e.stopPropagation();
    }

    private ExecuteDrop(): void
    {
        if (this.DropCommands.length === 0)
            return;
        else if (this.DropCommands.length === 1)
            this.ExecuteCommand(this.DropCommands[0], this.DropContent);
        else
        {
            this.ShowContextMenu = true;
            this.InvalidateRender();
        }
    }

    private _isDraggedOver: boolean = false;
}

export class DragDropPanel extends DragDropPanelBase<IDragDropPanel>
{
}