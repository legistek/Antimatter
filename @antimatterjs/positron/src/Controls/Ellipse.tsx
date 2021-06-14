import * as React from 'react';
import { Binding, ModelObjectReference } from "@antimatterjs/react";
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { Style } from '../Style';
import { IPanelProps, IPanelState, Panel } from './Panel';
import { Glyph } from './Glyph';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';
import { Icon } from '@fluentui/react';

//export interface IEllipseProps extends IFrameworkElementProps {
export interface IEllipseProps extends IPanelProps {
    Size?: number | Binding,
    Color?: string | Binding,
    Icon?: number | Binding
}

//export interface IEllipseState extends IFrameworkElementState {
export interface IEllipseState extends IPanelState {
    Size?: number,
    Color?: string,
    Icon?: number
}

//export class Ellipse<P extends IEllipseProps = {}, S extends IEllipseState = {}> extends FrameworkElement<P, S>
export class Ellipse<P extends IEllipseProps = {}, S extends IEllipseState = {}> extends Panel<P, S>
{
    /* override */ renderElement(): JSX.Element | null {
        const numericSize: number = (this.state.Size as number);
        //const numericSize: number = (this.state.Size as number) ?? 30;

        const fontSize: number = numericSize * 0.5;
        const fontSizeCSS: string = `${fontSize}px`;

        const vAlign: VerticalAlignment = VerticalAlignment.Center;
        //const vAlign: VerticalAlignment = VerticalAlignment.Stretch;

        const hAlign: HorizontalAlignment = HorizontalAlignment.Center;
        //const hAlign: HorizontalAlignment = HorizontalAlignment.Stretch;

        const glyphElem: JSX.Element = (
            <Glyph
                Icon={this.state.Icon}
                FontSize={fontSizeCSS}
                FontWeight="bold"
                Foreground="#FFFFFF"
                VerticalAlignment={vAlign}
                HorizontalAlignment={hAlign}
            />
        );

        const iconNameString: string = (this.state.Icon?.toString(16) as string);

        const fluentIconStyle: React.CSSProperties = {
            fontSize: fontSizeCSS,
            fontWeight: "bold",
            color: "#FFFFFF",
            height: "100%",
            //width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        };
        const fluentElem: JSX.Element = (
            <Icon
                iconName={iconNameString}
                style={fluentIconStyle}
            />
        );

        //return glyphElem;
        return fluentElem;

        //return super.renderElement();
    }

    public /* override */ getCSSStyles(): React.CSSProperties {

        var styles: React.CSSProperties = {
            background: this.state.Color,
            cursor: "pointer",
            userSelect: "none"
        };
        if (this.state.Size) {
            const cssSize: string = `${this.state.Size}px`;
            styles.height = cssSize;
            styles.width = cssSize;
        }

        return Object.assign(super.getCSSStyles(), styles);
    }

    public static DefaultStyle: Style<IEllipseProps> = new Style<IEllipseProps>(
        {
            VerticalAlignment: VerticalAlignment.Stretch,
            HorizontalAlignment: HorizontalAlignment.Stretch,

            Size: 30,
            Margin: "5px",
            BorderRadius: "50%"
        }
    );
}