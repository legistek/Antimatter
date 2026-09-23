import * as React from 'react';
import { Binding, IClientFile, ModelObjectReference } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { DataTemplate } from '../FrameworkTemplate';
import { ContentPresenter } from './ContentPresenter';

export interface IFileDropTargetProps extends IPanelProps
{
    DragOverTemplate?: (parent: any) => JSX.Element,
    FilesDroppedCommand?: ModelObjectReference | Binding,
}

export class FileDropTargetBase<P extends IFileDropTargetProps = {}> extends PanelBase<P, IFrameworkElementState>
{
    private _isDraggedOver: boolean = false;

    override OverrideContainerAttributes(
        containerProps: React.HTMLAttributes<HTMLElement> & React.ClassAttributes<HTMLElement>): void
    {
        containerProps.onDragEnter = (e) => this.OnDragEnter(e);
        containerProps.onDragLeave = (e) => this.OnDragLeave(e);
        containerProps.onDragOver = (e) => this.OnDragOver(e);
        containerProps.onDrop = (e) => this.OnDrop(e);
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

    private OnDragOver(e: React.DragEvent): void
    {
        if (!this._isDraggedOver)
            return;
        if (e.dataTransfer)
            e.dataTransfer.dropEffect = "copy";
        e.stopPropagation();
        e.preventDefault();        
    }

    private OnDragEnter(e: React.DragEvent): void
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

    private OnDragLeave(e: React.DragEvent): void
    {
        if (!this._isDraggedOver)
            return;

        this._isDraggedOver = false;
        this.InvalidateRender();

        e.stopPropagation();
        e.preventDefault();
    }

    private OnDrop(e: React.DragEvent): void
    {
        e.preventDefault();
        this._isDraggedOver = false;
        this.InvalidateRender();
        this.ExecuteCommand(
            this.FilesDroppedCommand,
            e.dataTransfer?.files);
    }
}

export class FileDropTarget extends FileDropTargetBase<IFileDropTargetProps>
{
}