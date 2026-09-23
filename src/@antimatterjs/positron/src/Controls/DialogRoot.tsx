import { CSSClasses } from "../CSSClasses";
import { ScrollBarVisibility } from "../Enums";
import { IFrameworkElementState } from "../FrameworkElement";
import { Style, WebStyle } from "../Style";
import { Theme, ThemeLayout } from "../Theme";
import { Grid, GridBase, IGridProps } from "./Grid";

import { Binding } from "@antimatterjs/react";

export enum DialogSize
{
    Unset = 0,
    Small = 1,
    Medium = 2,
    Large = 3
}

export interface IDialogRootProps extends IGridProps
{
    Size?: DialogSize|Binding,
    FitContentHeight?: boolean|Binding
}

export class DialogRoot extends GridBase<IDialogRootProps, IFrameworkElementState>
{
    public static DefaultStyle: Style<IDialogRootProps> = new WebStyle<IDialogRootProps>({
        Padding: ThemeLayout.MarginWideLTRB,
        VerticalScrollBarVisibility: ScrollBarVisibility.Auto
    });

    override getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        switch (this.Size)
        {
            case DialogSize.Large:
                styles.width = Theme.Value(ThemeLayout.LargeDialogWidth);
                if (!this.FitContentHeight)
                {
                    styles.height = "75vh";
                    styles.maxHeight = "512px";
                }
                break;
            case DialogSize.Medium:
                styles.width = Theme.Value(ThemeLayout.MediumDialogWidth);
                if (!this.FitContentHeight)
                    styles.height = "45vh";
                break;
            case DialogSize.Small:
                styles.width = Theme.Value(ThemeLayout.SmallDialogWidth);
                if (!this.FitContentHeight)
                    styles.maxHeight = "75vh";
                styles.overflowY = "auto";
                break;
        }
        styles.maxWidth = "75vw";
        return styles;
    }

    public get Size(): DialogSize
    {
        return this.GetValue(nameof(this.props.Size), DialogSize.Medium)
            || DialogSize.Medium;
    }

    public get FitContentHeight(): boolean
    {
        return this.GetValue(nameof(this.props.FitContentHeight), false);
    }

    override constructClasses(): string
    {
        return super.constructClasses() + " " + CSSClasses.DialogRoot;
    }


}