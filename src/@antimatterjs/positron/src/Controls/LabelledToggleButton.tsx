import * as React from "react";
import { Binding, BindingMode } from "@antimatterjs/react";
import { TemplateProp, WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { SemanticColor, Theme, ThemeColor, ThemeLayout } from '../Theme';
import { IToggleButtonProps, IToggleButtonState, ToggleButtonBase } from "./Primitives/ToggleButton";
import { Panel } from "./Panel";
import { StackPanel } from "./StackPanel";
import { HorizontalAlignment, Orientation } from "../Enums";
import { TextBlock } from "./TextBlock";
import { Control } from "./Control";

export interface ILabelledToggleButtonProps extends IToggleButtonProps
{
    LeftLabel?: string | Binding,
    RightLabel?: string | Binding,
}

export class LabelledToggleButton extends ToggleButtonBase<ILabelledToggleButtonProps, IToggleButtonState>
{
    public static readonly PART_Root: string = "root";

    public static DefaultStyle = new WebStyle<ILabelledToggleButtonProps>(
        {
            Template: (templatedParent: LabelledToggleButton) => (
                <StackPanel
                    ClassName={LabelledToggleButton.PART_Root}
                    Cursor="pointer"
                    Orientation={Orientation.Horizontal}
                    BorderRadius={templatedParent.BorderRadius}
                    Padding={templatedParent.Padding}
                    Background={templatedParent.Background}>
                    <StackPanel
                        ClassName="left-panel"
                        OnClick={(e) => templatedParent.OnLeftSideClicked(e)}
                        BorderRadius={templatedParent.BorderRadius}
                        Padding={ThemeLayout.MarginStandardLTRB}
                        Background={templatedParent.IsChecked ? undefined : templatedParent.Foreground}
                    >
                        {/*Spacer*/}
                        <TextBlock
                            MaxHeight={0}
                            MinHeight={0}  // Bug 1973 - Apparently Chrome made a change here
                            Margin={0}
                            Text={templatedParent.RightLabel}
                            Opacity={0}
                            IsHitTestVisible={false} />
                        <TextBlock
                            Margin={0}
                            FontSize={templatedParent.FontSize}
                            FontWeight={templatedParent.FontWeight}
                            HorizontalAlignment={HorizontalAlignment.Center}
                            Foreground={templatedParent.IsChecked ? templatedParent.Foreground : templatedParent.Background}
                            Text={templatedParent.LeftLabel} />
                    </StackPanel>
                    <StackPanel Orientation={Orientation.Vertical}
                        ClassName="right-panel"
                        Padding={ThemeLayout.MarginStandardLTRB}
                        OnClick={(e) => templatedParent.OnRightSideClicked(e)}
                        BorderRadius={templatedParent.BorderRadius}
                        Background={templatedParent.IsChecked ? templatedParent.Foreground : undefined}
                    >
                        {/*Spacer*/}
                        <TextBlock
                            MaxHeight={0}
                            MinHeight={0}   // Bug 1973 - Apparently Chrome made a change here
                            Margin={0}
                            Text={templatedParent.LeftLabel}
                            Opacity={0}
                            IsHitTestVisible={false} />
                        <TextBlock
                            FontSize={templatedParent.FontSize}
                            Margin={0}
                            FontWeight={templatedParent.FontWeight}
                            HorizontalAlignment={HorizontalAlignment.Center}
                            Foreground={templatedParent.IsChecked ? templatedParent.Background : templatedParent.Foreground}
                            Text={templatedParent.RightLabel} />
                    </StackPanel>
                </StackPanel>
            ),
            BorderRadius: "20px",
            Background: ThemeColor.ThemeDarkAlt,
            Foreground: ThemeColor.White,
            HorizontalAlignment: HorizontalAlignment.Left,
            FontWeight: "bold",
            Padding: "2px"
        },
        {
            [Control.DisabledElement(LabelledToggleButton.PART_Root)]: {
                opacity: 0.5
            }
        });

    public get LeftLabel(): string|undefined
    {
        return this.GetValue(nameof(this.props.LeftLabel));
    }

    public get RightLabel(): string | undefined
    {
        return this.GetValue(nameof(this.props.RightLabel));
    }

    override OnClick(e: React.MouseEvent)
    {
        e.preventDefault();
        e.stopPropagation();
    }

    private OnLeftSideClicked(e: React.MouseEvent)
    {
        e.preventDefault();
        e.stopPropagation();
        this.SetValue(nameof(this.IsChecked), false, true);
    }

    private OnRightSideClicked(e: React.MouseEvent)
    {
        e.preventDefault();
        e.stopPropagation();
        this.SetValue(nameof(this.IsChecked), true, true);
    }
}