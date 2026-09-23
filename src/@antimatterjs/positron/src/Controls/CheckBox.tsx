import * as React from 'react';

import { Antimatter, Binding, BindingMode } from '@antimatterjs/react';
import { Icon } from '@fluentui/react'

import { IToggleButtonProps, IToggleButtonState, ToggleButton, ToggleButtonBase } from './Primitives/ToggleButton';
import { ControlTemplate } from '../FrameworkTemplate';
import { TemplateProp, WebStyle } from '../Style';
import { FontStyle, SemanticColor, Theme, ThemeColor, ThemeEffect, ThemeLayout } from '../Theme';
import { Grid } from './Grid';
import { CSSClasses } from '../CSSClasses';
import { Control } from './Control';
import { Glyph } from './Glyph';

export interface ICheckBoxProps extends IToggleButtonProps
{
}

export class CheckBoxBase<P extends IToggleButtonProps = {}> extends ToggleButtonBase<P, IToggleButtonState>
{
    public static readonly PART_Box: string = Antimatter.Identifier("ckb-box");
    public static readonly PART_Icon: string = "ckb-icon";
    public static readonly PART_Label: string = Antimatter.Identifier("ckb-label");
    public static readonly PART_InfoTip: string = Antimatter.Identifier("cb-infotip");

    public static DefaultBindings = {
        IsEnabled: {
            FallbackValue: true
        },
        IsChecked: {
            Mode: BindingMode.TwoWay,
            FallbackValue: false
        },
        Label: {
            FallbackValue: '...'
        }
    };

    static DefaultStyle = new WebStyle<ICheckBoxProps>(
        {
            ThirdStateReadOnly: true,
            Background: SemanticColor.BodyBackground,
            BorderBrush: SemanticColor.ButtonBorder,
            BorderThickness: ThemeLayout.StandardBorder,
            Foreground: SemanticColor.BodyText,
            FontFamily: FontStyle.FontFamily,
            FontSize: FontStyle.Medium,
            FontWeight: "bold",
            Padding: "1px",
            Template: new ControlTemplate((templatedParent: CheckBoxBase) => (
                <Grid
                    ColumnDefinitions={[Grid.ColumnDefinition(), Grid.FittedColumn(), Grid.ColumnDefinition(), Grid.ColumnDefinition()]}
                    OnClick={(e) => templatedParent.OnClick(e)}>
                    <div className={`${this.PART_Box} ${CSSClasses.Base} ${CSSClasses.HACenter} ${CSSClasses.VACenter}`}
                        onKeyPress={(e) =>
                        {
                            if (!templatedParent.IsEnabled)
                                return;
                            if (e.key === ' ')
                                templatedParent.OnClick();
                        }}
                        tabIndex={templatedParent.IsEnabled ? 0 : -1}>
                        <Icon className={this.PART_Icon} iconName={templatedParent.GetIconName()} />
                    </div>

                    {
                        templatedParent.Label &&
                        (<span className={this.PART_Label}>
                            {templatedParent.Label}
                        </span>)
                    }

                    {templatedParent.InfoTip && (
                        <Glyph
                            Style={Glyph.ControlInfoTipStyle}
                            Grid={{ Column: 2 }}
                            ClassName={this.PART_InfoTip}
                            ToolTip={templatedParent.InfoTip} />)}

                    {templatedParent.IsInvalid && (
                        <Glyph
                            Grid={{ Column: 3 }}
                            ToolTip={templatedParent.ValidationError}
                            Style={Glyph.ControlValidationErrorStyle}/>)}

                </Grid>)
            )
        },
        {
            "@": {
                cursor: "pointer",
            },
            [`@ .${this.PART_Box}`]: {
                gridColumn: 1,
                borderRadius: "3px",
                boxShadow: Theme.Value(ThemeEffect.ControlInnerShadow),
                userSelect: "none",
                display: "flex",
                padding: TemplateProp(nameof<ICheckBoxProps>(p => p.Padding)),
                borderColor: TemplateProp(nameof<ICheckBoxProps>(p => p.BorderBrush)),
                borderWidth: TemplateProp(nameof<ICheckBoxProps>(p => p.BorderThickness)),
                background: TemplateProp(nameof<ICheckBoxProps>(p => p.Background)),
                fontSize: TemplateProp(nameof<ICheckBoxProps>(p => p.FontSize)),
            },
            [`@.${ToggleButton.STATE_Checked} .${this.PART_Box}`]: {
                background: Theme.Value(SemanticColor.InputBackgroundChecked),
                borderColor: Theme.Value(SemanticColor.InputBackgroundChecked),
                boxShadow: "none",
            },
            [`@.${ToggleButton.STATE_Checked} .${this.PART_Icon}`]: {
                visibility: "visible",
            },
            [`@.${ToggleButton.STATE_Indeterminate} .${this.PART_Icon}`]: {
                visibility: "visible",
            },
            [`@.${ToggleButton.STATE_Indeterminate} .${this.PART_Box}`]: {
                boxShadow: "unset",
            },
            [`@:not(.${ToggleButton.STATE_Checked}):not(.${ToggleButton.STATE_ValidationError}):hover .${this.PART_Box}`]: {
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered),
            },
            [`@:not(.${ToggleButton.STATE_Checked}):not(.${ToggleButton.STATE_ValidationError}):not(${ToggleButton.STATE_Indeterminate}):hover .${this.PART_Icon}`]: {
                visibility: "visible",
                color: Theme.Value(SemanticColor.DisabledBodyText)
            },
            [`@ .${this.PART_Icon}`]: {
                height: "auto",
                marginLeft: "auto",
                marginRight: "auto",
                visibility: "collapse",
                alignSelf: "center",
                userSelect: "none",
                fontWeight: "bold",
                fontSize: Theme.Value(FontStyle.Glyph1x),
                color: Theme.Value(SemanticColor.BodyText),
            },
            [`@.${ToggleButton.STATE_ValidationError} .${this.PART_Icon}`]: {
                background: Theme.Value(SemanticColor.ErrorBackground),
                borderColor: Theme.Value(SemanticColor.Error),
            },
            [`@.${ToggleButton.STATE_ValidationError} .${this.PART_Icon}`]: {
                color: Theme.Value(SemanticColor.Error),
            },
            [`@.${ToggleButton.STATE_Indeterminate}:not(.${ToggleButton.STATE_ValidationError}) .${this.PART_Icon}`]: {
                color: Theme.Value(ThemeColor.NeutralSecondary)
            },
            [`@.${ToggleButton.STATE_Checked} .${this.PART_Icon}`]: {
                color: Theme.Value(SemanticColor.PrimaryButtonText),
                visibility: "visible"
            },
            [`@ .${this.PART_Label}`]: {
                gridColumn: 2,
                alignSelf: "center",
                marginLeft: "5px",
                userSelect: "none",
                fontFamily: TemplateProp(nameof<ICheckBoxProps>(p => p.FontFamily)),
                fontSize: TemplateProp(nameof<ICheckBoxProps>(p => p.FontSize)),
                fontWeight: TemplateProp(nameof<ICheckBoxProps>(p => p.FontWeight)),
                color: TemplateProp(nameof<ICheckBoxProps>(p => p.Foreground)),
            },
            [Control.DisabledElement(this.PART_Box)]: {
                boxShadow: "none",
                background: Theme.Value(SemanticColor.ButtonBackgroundDisabled),
                borderColor: TemplateProp(nameof<ICheckBoxProps>(p => p.BorderBrush)),
            },
            [Control.DisabledElement(this.PART_Label)]: {
                color: Theme.Value(SemanticColor.DisabledText),
            },
            [Control.DisabledElement(this.PART_Icon)]: {
                color: Theme.Value(SemanticColor.ButtonTextDisabled),
            },
        });

    public GetIconName(): string
    {
        if (this.IsChecked === undefined)
            return "CheckboxIndeterminate";
        else
            return "CheckMark";
    }
}

export class CheckBox extends CheckBoxBase<ICheckBoxProps>
{
}