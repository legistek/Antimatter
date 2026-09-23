import * as React from "react";
import { Antimatter, Binding } from "@antimatterjs/react";
import { TemplateProp, WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { CSSClasses } from '../CSSClasses';
import { SemanticColor, ThemeColor, ThemeLayout } from '../Theme';
import { Grid } from './Grid';
import { IToggleButtonProps, IToggleButtonState, ToggleButton, ToggleButtonBase } from "./Primitives/ToggleButton";

export interface ISegmentedToggleProps extends IToggleButtonProps
{
    /**
     * Content of the left (unchecked) side.
     */
    OffContent?: React.ReactNode;

    /**
     * Content of the right (checked) side.
     */
    OnContent?: React.ReactNode;

    /**
     * Indicator color when unchecked.
     */
    OffBackground?: string | SemanticColor | ThemeColor | Binding;

    /**
     * Indicator color when checked.
     */
    OnBackground?: string | SemanticColor | ThemeColor | Binding;

    /**
     * Duration of the indicator's slide and color transition, as a CSS time.
     */
    TransitionDuration?: string;
}

export class SegmentedToggle extends ToggleButtonBase<ISegmentedToggleProps, IToggleButtonState>
{
    public static readonly PART_Indicator: string = Antimatter.Identifier("PART_Indicator");
    public static readonly PART_Off: string = Antimatter.Identifier("PART_Off");
    public static readonly PART_On: string = Antimatter.Identifier("PART_On");

    public static DefaultStyle = new WebStyle<ISegmentedToggleProps>(
        {
            IsThreeState: false,
            Background: SemanticColor.BodyBackground,
            BorderBrush: SemanticColor.ButtonBorder,
            BorderThickness: ThemeLayout.StandardBorder,
            BorderRadius: ThemeLayout.StandardBorderRadius,
            Padding: ThemeLayout.MarginSmallLTRB,
            OffBackground: SemanticColor.DisabledBackground,
            OnBackground: SemanticColor.InputBackgroundChecked,
            TransitionDuration: "250ms",
            Template: new ControlTemplate((templatedParent: SegmentedToggle) => (
                <Grid                
                    ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition(1, true)]}
                    OnClick={(e) => templatedParent.OnClick(e)}>
                    <div className={SegmentedToggle.PART_Indicator} />
                    <div className={`${SegmentedToggle.PART_Off} ${CSSClasses.Base}`}>
                        {templatedParent.OffContent}
                    </div>
                    <div className={`${SegmentedToggle.PART_On} ${CSSClasses.Base}`}>
                        {templatedParent.OnContent}
                    </div>
                </Grid>
            ))
        },
        {
            "@": {
                cursor: "pointer",
                userSelect: "none",
                overflow: "hidden",
                borderStyle: "solid",
                borderColor: TemplateProp(nameof<ISegmentedToggleProps>(p => p.BorderBrush)),
                borderWidth: TemplateProp(nameof<ISegmentedToggleProps>(p => p.BorderThickness)),
                borderRadius: TemplateProp(nameof<ISegmentedToggleProps>(p => p.BorderRadius)),
                background: TemplateProp(nameof<ISegmentedToggleProps>(p => p.Background)),
            },
            [`@ .${SegmentedToggle.PART_Indicator}`]: {
                gridColumn: 1,
                gridRow: 1,
                borderRadius: TemplateProp(nameof<ISegmentedToggleProps>(p => p.BorderRadius)),
                background: TemplateProp(nameof<ISegmentedToggleProps>(p => p.OffBackground)),
                transitionProperty: "transform, background-color",
                transitionDuration: TemplateProp(nameof<ISegmentedToggleProps>(p => p.TransitionDuration)),
                transitionTimingFunction: "ease-in-out",
            },
            [`@.${ToggleButton.STATE_Checked} .${SegmentedToggle.PART_Indicator}`]: {
                transform: "translateX(100%)",
                background: TemplateProp(nameof<ISegmentedToggleProps>(p => p.OnBackground)),
            },
            // position: relative keeps the content above the transformed indicator
            [`@ .${SegmentedToggle.PART_Off}`]: {
                gridColumn: 1,
                gridRow: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: TemplateProp(nameof<ISegmentedToggleProps>(p => p.Padding)),
            },
            [`@ .${SegmentedToggle.PART_On}`]: {
                gridColumn: 2,
                gridRow: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: TemplateProp(nameof<ISegmentedToggleProps>(p => p.Padding)),
            },
        });

    public get OffContent(): React.ReactNode
    {
        return this.GetValue(nameof(this.props.OffContent));
    }

    public get OnContent(): React.ReactNode
    {
        return this.GetValue(nameof(this.props.OnContent));
    }

    public get OffBackground(): string | undefined
    {
        return this.GetValue(nameof(this.props.OffBackground));
    }

    public get OnBackground(): string | undefined
    {
        return this.GetValue(nameof(this.props.OnBackground));
    }

    public get TransitionDuration(): string | undefined
    {
        return this.GetValue(nameof(this.props.TransitionDuration));
    }
}
