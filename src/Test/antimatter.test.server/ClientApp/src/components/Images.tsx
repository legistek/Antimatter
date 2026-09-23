import { Bind, Binding, BindingMode } from "@antimatterjs/react";
import * as Model from '../model/Model';
import
{
    ColorGradient,
    TextBlock,
    Image,
    StackPanel, ThemeColor, View, FileDropTarget, VerticalAlignment, HorizontalAlignment, SemanticColor, Panel, ProgressRing,
    DragDropPanel, Grid, ScrollBarVisibility, Orientation, Glyph
} from "@antimatterjs/positron";
import React from "react";
import { DefaultEffects } from "@fluentui/react";

const GradientPanelHeight: number = 36;

export default class Images extends View
{
    override View()
    {
        const cyan: string = "#00ffff";
        const magenta: string = "#ff00ff";
        const yellow: string = "#ffff00";
        const colors1: string[] = [cyan, magenta, yellow];
        const colors2: string[] = [yellow, cyan, magenta];
        const colors3: string[] = [magenta, yellow, cyan];

        const stackedGradients: JSX.Element = (
            <StackPanel
                ItemSpacing="0"
            >
                {
                    this.GetGradientPanel(colors1)
                }
                {
                    this.GetGradientPanel(colors2)
                }
                {
                    this.GetGradientPanel(colors3)
                }
                {
                    this.GetGradientPanel(colors1)
                }
            </StackPanel>
        );

        return (
            <StackPanel VerticalScrollBarVisibility={ScrollBarVisibility.Auto} >
                <Glyph Icon="folder" PreferImage={true} FontSize={64} HorizontalAlignment={HorizontalAlignment.Center} />

                <TextBlock Text="Stretch" />
                <Image
                    Uri="/positron.png"
                    Background="yellow" />

                <TextBlock Text="Left" />
                <Image
                    HorizontalAlignment={HorizontalAlignment.Left}
                    Uri="/positron.png"
                    Background="yellow" />

                <TextBlock Text="Centered" />
                <Image
                    HorizontalAlignment={HorizontalAlignment.Center}
                    Uri="/positron.png"
                    Background="yellow" />

                <TextBlock Text="Right" />
                <Image
                    HorizontalAlignment={HorizontalAlignment.Right}
                    Uri="/positron.png"
                    Background="yellow" />

                <StackPanel Orientation={Orientation.Horizontal} Height="200px">
                    <TextBlock Text="Vertical Alignment:" />

                    <Image
                        VerticalAlignment={VerticalAlignment.Stretch}
                        Uri="/positron.png"
                        Background="yellow" />
                    <Image
                        VerticalAlignment={VerticalAlignment.Top}
                        Uri="/positron.png"
                        Background="yellow" />
                    <Image
                        VerticalAlignment={VerticalAlignment.Center}
                        Uri="/positron.png"
                        Background="yellow" />
                    <Image
                        VerticalAlignment={VerticalAlignment.Bottom}
                        Uri="/positron.png"
                        Background="yellow" />

                </StackPanel>

                <TextBlock Text="Scaled to 100px Wide" />
                <Image
                    HorizontalAlignment={HorizontalAlignment.Left}
                    Width="100px"
                    Uri="/positron.png"
                    Background="yellow" />

                <TextBlock Text="Scaled to 100px Tall" />
                <Image
                    HorizontalAlignment={HorizontalAlignment.Left}
                    Height="100px"
                    Uri="/positron.png"
                    Background="yellow" />

                <TextBlock Text="Forced to 100px x 100px" />
                <Image
                    HorizontalAlignment={HorizontalAlignment.Left}
                    Width="100px"
                    Height="100px"
                    Uri="/positron.png"
                    Background="yellow" />

                <TextBlock Text="Gradient Panels" />
                {
                    stackedGradients
                }

            </StackPanel> )
    }

    private GetGradientPanel(colors: string[]): JSX.Element
    {
        const gradient: ColorGradient = new ColorGradient();
        gradient.Colors = colors;
        gradient.Width = GradientPanelHeight / Math.SQRT2;
        gradient.Angle = 45;

        return (
            <Panel
                Background={gradient}
                Height={`${GradientPanelHeight}px`}
                Width="400px"
                BorderBrush={ThemeColor.Black}
                BorderThickness="1px"
            >
            </Panel>
        );
    }
}