import * as React from 'react';
import { Binding, BindingMode, BindingParameters, ModelObjectReference, Utilities } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState, TemplatedParentContext } from '../FrameworkElement';
import { WindowLayout } from '../Enums';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { FontStyle, ThemeColor, SemanticColor, ThemeLayout } from '../Theme';
import { WebStyle } from '../Style';
import { Window, WindowLayoutContext } from './Window';
import { CSSClasses } from '../CSSClasses';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { TextBlock } from './TextBlock';
import { ContentPresenter } from './ContentPresenter';

export interface IDropPanelProps extends IPanelProps
{
    AcceptDrop?: boolean | Binding,
    DragContent?: any | Binding,    
    DropCommands?: ModelObjectReference[] | Binding,
    DropTemplate?: DataTemplate,
}

export class DropPanelBase<P, S> extends PanelBase<IDropPanelProps, IPanelState>
{
    public static DefaultBindings = {
        DragContent: {
            Mode: BindingMode.TwoWay
        }
    };

    public get DropCommands(): ModelObjectReference[]
    {
        return this.GetValue(nameof(this.props.DropCommands), []);
    }

    public get AcceptDrop(): boolean
    {
        return this.GetValue(nameof(this.props.AcceptDrop), true);
    }

    public get DropTemplate(): DataTemplate
    {
        return this.GetValue(nameof(this.props.DropTemplate));
    }

    override getCSSStyles()
    {        
        var styles = super.getCSSStyles();
        if (this.AcceptDrop)
        {
            styles.pointerEvents = "initial";
            if (this.DropCommands.length > 0)
                styles.cursor = 'default';
        }
        return styles;
    }

    override renderElement()
    {
        if (this._isDraggedOver)
        {
            return (
                <ContentPresenter
                    IsHitTestVisible={false}
                    ContentTemplate={this.DropTemplate} />
            );
        }
        else
        {
            return super.renderElement();
        }        
    }

    public override OnPropertyChanged(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.props.DropCommands) &&
            Window.CurrentWindow?.DragGhost?.DropOwner === this)
        {
            Window.CurrentWindow.DragGhost.DropCommands = value;
        }
        super.OnPropertyChanged(property, value, oldValue);
    }

    OverrideContainerAttributes(
        containerProps: React.HTMLAttributes<HTMLElement> & React.ClassAttributes<HTMLElement>)
    {
        containerProps.onMouseEnter = ((e: React.MouseEvent) =>
        {
            if (!Window.CurrentWindow?.IsDragging)
                return;
            this._isDraggedOver = true;
            this.InvalidateRender();
            e.stopPropagation();

            if (Window.CurrentWindow.DragGhost)
            {
                Window.CurrentWindow.DragGhost.DropOwner = this;
                Window.CurrentWindow.DragGhost.DropCommands = this.DropCommands;
            }
            
            this.SetValue(
                nameof(this.props.DragContent),
                Window.CurrentWindow?.DragContent,
                false,
                false);
        }).bind(this);

        containerProps.onMouseLeave = ((e: React.MouseEvent) =>
        {
            if (!Window.CurrentWindow?.IsDragging)
                return;
            this._isDraggedOver = false;
            this.InvalidateRender();
            e.stopPropagation();

            this.SetValue(
                nameof(this.props.DragContent),
                null,
                false,
                false);
        }).bind(this);

        containerProps.onMouseUp = ((e: React.MouseEvent) =>
        {
            if (!Window.CurrentWindow?.IsDragging)
                return;
            this._isDraggedOver = false;
            this.InvalidateRender();

            if (this.DropCommands.length === 0)
                return;
            else if (this.DropCommands.length === 1)
                this.ExecuteCommand(this.DropCommands[0], Window.CurrentWindow?.DragContent);

            // DON'T stop propagation as Window needs notice 
        }).bind(this);
    }

    private _isDraggedOver: boolean = false;
}

export class DropPanel extends DropPanelBase<IDropPanelProps, IPanelState>
{
}