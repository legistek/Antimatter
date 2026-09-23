import * as React from 'react';
import { Binding, BindingParameters, ModelObjectReference, Thickness } from '@antimatterjs/react';
import { CSSClasses } from '../CSSClasses';
import { Panel, PanelBase, IPanelProps, IPanelState } from './Panel';
import { FrameworkElement, IFrameworkElementState } from '../FrameworkElement';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';
import { WebStyle } from '../Style';
import { DrawingSurface } from './DrawingSurface';

export interface IImageProps extends IPanelProps
{
    Uri?: string | Binding
    Command?: ModelObjectReference | Binding | (() => void);
    CommandParameter?: any | Binding;
    OnLoad?: () => void;
    Stretch?: boolean;    
}

export class ImageBase<P extends IImageProps = {}> extends PanelBase<P, IFrameworkElementState>
{
    public get Uri(): string | undefined
    {
        return this.GetValue(nameof(this.props.Uri));
    }

    public get Stretch(): boolean
    {
        return this.GetValue(nameof(this.props.Stretch), false);
    }

    public get Image(): HTMLImageElement | null | undefined
    {
        return this._img;
    }

    public get Command(): ModelObjectReference | undefined | (()=>void)
    {
        return this.GetValue(nameof(this.props.Command));
    }

    public get OnLoadHandler(): (() => void) | undefined
    {
        return this.GetValue(nameof(this.props.OnLoad));
    }

    public get CommandParameter(): any
    {
        return this.GetValue(nameof(this.props.CommandParameter));
    }

    override renderElement()
    {
        return <img
            ref={r => { this._img = r; } }
            key={this.RenderVersion}
            onLoad={this.OnLoadHandler ? () => this.OnLoadHandler ? this.OnLoadHandler() : undefined : undefined}
            style={{
                borderRadius: this.BorderRadius,
                width: this.Stretch ? "100%" : this.Width,
                height: this.Height,
                boxShadow: this.BoxShadow,
                cursor: this.Cursor,
                objectFit: this.Stretch ? "cover" : undefined,
                maxWidth: this.Stretch ? "unset" : undefined,
                maxHeight: this.MaxHeight ?? (this.Stretch ? "unset" : undefined)
            }}
            onClick={() =>
            {
                if (typeof (this.Command) === "function")
                    this.Command();
                else if (this.Command)
                    this.ExecuteCommand(this.Command, this.CommandParameter)
            }}
            src={this.Uri}
            className={`${CSSClasses.Image}`} />
    }

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles.boxShadow = undefined;
        styles.cursor = undefined;
        if (this.ActualHorizontalAlignment === HorizontalAlignment.Left || this.ActualHorizontalAlignment === HorizontalAlignment.Right)
            styles.width = "100%";
        styles.overflow = "hidden";
        return styles;
    }

    private _img?: HTMLImageElement | null;
}

export class Image extends ImageBase<IImageProps>
{
}

export interface IPaddedImageProps extends IImageProps
{
    NormalizedPadding?: Thickness|Binding;
    AspectRatio?: number | Binding;
    RenderCommand?: BindingParameters;
}

export class PaddedImage extends ImageBase<IPaddedImageProps>
{
    public static DefaultStyle = new WebStyle<IPaddedImageProps>({
        HorizontalAlignment: HorizontalAlignment.Center,
        VerticalAlignment: VerticalAlignment.Stretch
    });

    override renderElement()
    {
        return (
            <>
                <img
                    onLoad={this.OnLoadHandler ? () => this.OnLoadHandler ? this.OnLoadHandler() : undefined : undefined}
                    style={{
                        position: "relative",
                        margin: "0px",
                        left: `${this.NormalizedPadding.Left * 100}%`,
                        top: `${this.NormalizedPadding.Top * 100}%`,
                        width: `${(1 - this.NormalizedPadding.TotalWidth) * 100}%`,
                        height: `${(1 - this.NormalizedPadding.TotalHeight) * 100}%`,
                        objectFit: "fill",
                        cursor: this.Cursor,
                    }}
                    src={this.Uri}
                    className={`${CSSClasses.Image}`} />
                <DrawingSurface
                    RenderCommand={this.RenderCommand ? new Binding(this.RenderCommand) : undefined}
                    RenderVersion={this.RenderVersion}
                    Overlaps={true} />
            </>
        );
    }

    public get NormalizedPadding(): Thickness
    {
        return this.GetValue(nameof(this.props.NormalizedPadding), Thickness.Empty);
    }

    public get AspectRatio(): number
    {
        return this.GetValue(nameof(this.props.AspectRatio), 1);
    }    

    public get RenderCommand(): BindingParameters|undefined
    {
        return this.GetValue(nameof(this.props.RenderCommand));
    }

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles.aspectRatio = `${this.AspectRatio.toString()} / 1`;
        if (this.Width === undefined)
            styles.width = "100%";
        styles.boxShadow = this.BoxShadow;
        return styles;
    }
}