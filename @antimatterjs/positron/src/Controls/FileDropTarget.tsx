import * as React from 'react';
import { Binding, IClientFile, ModelObjectReference } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { IItemsControlProps, IItemsControlState, ItemsControl, ItemsControlBase } from './ItemsControl';
import { ScrollBarVisibility } from '../Enums';
import { CSSClasses } from '../CSSClasses';
import { ThemeColor, SemanticColor, ThemeLayout, ThemeEffect } from '../Theme';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { DataTemplate } from '../FrameworkTemplate';
import { ContentPresenter } from './ContentPresenter';

export interface IFileDropTargetProps extends IPanelProps
{
    DragOverTemplate?: (parent: any) => JSX.Element,
    FilesDroppedCommand?: ModelObjectReference | Binding,
}

export class FileDropTargetBase<P,S> extends PanelBase<IFileDropTargetProps, IPanelState>
{
    private _isDraggedOver: boolean = false;

    override OnComponentMount()
    {
        this.Container?.addEventListener("dragenter", (e) => this.OnDragEnter(e));
        this.Container?.addEventListener("dragleave", (e) => this.OnDragLeave(e));
        this.Container?.addEventListener("dragover", (e) => this.OnDragOver(e));
        this.Container?.addEventListener("drop", (e) => this.OnDrop(e));
    }

    public get FilesDroppedCommand(): ModelObjectReference
    {
        return this.GetValue(nameof(this.props.FilesDroppedCommand));
    }

    public get DragOverTemplate(): (parent: any) => JSX.Element
    {
        return this.GetValue(nameof(this.props.DragOverTemplate));
    }

    override renderElement()
    {
        if (this._isDraggedOver)
        {
            return (<ContentPresenter IsHitTestVisible={false} ContentTemplate={this.DragOverTemplate} />);
        }
        else
        {
            return super.renderElement();
        }
    }

    private OnDragOver(e: DragEvent): void
    {
        if (!this._isDraggedOver)
            return;
        if (e.dataTransfer)
            e.dataTransfer.dropEffect = "copy";
        e.stopPropagation();
        e.preventDefault();        
    }

    private OnDragEnter(e: DragEvent): void
    {
        if (e.dataTransfer?.types?.includes("Files"))
        {
            this._isDraggedOver = true;
            this.InvalidateRender();
            e.dataTransfer.dropEffect = "copy";
            e.stopPropagation();
            e.preventDefault();
        }
    }

    private OnDragLeave(e: DragEvent): void
    {
        if (!this._isDraggedOver)
            return;

        this._isDraggedOver = false;
        this.InvalidateRender();

        e.stopPropagation();
        e.preventDefault();
    }

    private OnDrop(e: DragEvent): void
    {
        e.preventDefault();
        this._isDraggedOver = false;
        this.InvalidateRender();
        this.ExecuteCommand(
            this.FilesDroppedCommand,
            e.dataTransfer?.files);
    }
}

export class FileDropTarget extends FileDropTargetBase<IFileDropTargetProps, IPanelState>
{
}