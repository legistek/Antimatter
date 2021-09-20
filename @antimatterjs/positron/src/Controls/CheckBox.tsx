import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox, Icon } from '@fluentui/react'
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

interface ICheckBoxState extends IToggleButtonState
{
}

export class CheckBox extends ToggleButtonBase<ICheckBoxProps, ICheckBoxState>
{
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
            Background: SemanticColor.BodyBackground,
            BorderBrush: SemanticColor.ButtonBorder,
            BorderThickness: ThemeLayout.StandardBorder,
            Foreground: SemanticColor.BodyText,
            FontFamily: FontStyle.FontFamily,
            FontSize: FontStyle.Medium,
            FontWeight: "bold",
            Padding: "1px",
            Template: new ControlTemplate((templatedParent: CheckBox) => (
                <Grid
                    ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true), Grid.ColumnDefinition(), Grid.ColumnDefinition()]}
                    OnClick={(e) => templatedParent.OnClick(e)}>
                    <div className={`ckb-box ${CSSClasses.Base} ${CSSClasses.HACenter} ${CSSClasses.VACenter}`}
                        onKeyPress={(e) =>
                        {
                            if (!templatedParent.IsEnabled)
                                return;
                            if (e.key === ' ')
                                templatedParent.OnClick();
                        }}
                        tabIndex={templatedParent.IsEnabled ? 0 : -1}>
                        <Icon className="ckb-icon" iconName={templatedParent.GetIconName()} />
                    </div>

                    <span className="ckb-label">
                        {templatedParent.Label}
                    </span>

                    {templatedParent.InfoTip && (
                        <Glyph
                            Style={Glyph.ControlInfoTipStyle}
                            Grid={{ Column: 2 }}
                            ClassName="cb-infotip"
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
            "@ .ckb-box": {                
                gridColumn: 1,
                borderRadius: "2px",
                boxShadow: Theme.Value(ThemeEffect.ControlInnerShadow), 
                userSelect: "none",
                display: "flex",
                padding: TemplateProp(nameof<ICheckBoxProps>(p => p.Padding)),
                borderColor: TemplateProp(nameof<ICheckBoxProps>(p => p.BorderBrush)),
                borderWidth: TemplateProp(nameof<ICheckBoxProps>(p => p.BorderThickness)),
                background: TemplateProp(nameof<ICheckBoxProps>(p => p.Background)),
                fontSize: TemplateProp(nameof<ICheckBoxProps>(p => p.FontSize)),
            },
            [`@.${ToggleButton.STATE_Checked} .ckb-box`]: {
                background: Theme.Value(SemanticColor.PrimaryButtonBackground),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackground),
                boxShadow: "none",                
            },
            [`@.${ToggleButton.STATE_Checked} .ckb-icon`]: {
                visibility: "visible",
            },
            [`@.${ToggleButton.STATE_Indeterminate} .ckb-icon`]: {
                visibility: "visible",
            },
            [`@.${ToggleButton.STATE_Indeterminate} .ckb-box`]: {
                //background: Theme.Value(SemanticColor.PrimaryButtonBackground),
                //borderColor: Theme.Value(SemanticColor.PrimaryButtonBackground),
                boxShadow: "unset",                
            },
            [`@:not(.${ToggleButton.STATE_Checked}):not(.${ToggleButton.STATE_ValidationError}):hover .ckb-box`]: {
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered),                
            },
            [`@:not(.${ToggleButton.STATE_Checked}):not(.${ToggleButton.STATE_ValidationError}):not(${ToggleButton.STATE_Indeterminate}):hover .ckb-icon`]: {
                visibility: "visible",
                color: Theme.Value(SemanticColor.DisabledBodyText)
            },
            "@ .ckb-icon": {
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
            [`@.${ToggleButton.STATE_ValidationError} .ckb-box`]: {
                background: Theme.Value(SemanticColor.ErrorBackground),
                borderColor: Theme.Value(SemanticColor.Error),
            },
            [`@.${ToggleButton.STATE_ValidationError} .ckb-icon`]: {
                color: Theme.Value(SemanticColor.Error),
            },
            [`@.${ToggleButton.STATE_Indeterminate}:not(.${ToggleButton.STATE_ValidationError}) .ckb-icon`]: {
                color: Theme.Value(ThemeColor.NeutralSecondary)
            },
            [`@.${ToggleButton.STATE_Checked} .ckb-icon`]: {
                color: Theme.Value(SemanticColor.PrimaryButtonText),
                visibility: "visible"
            },
            "@ .ckb-label": {
                gridColumn: 2,
                alignSelf: "center",
                marginLeft: "5px",
                userSelect: "none",
                fontFamily: TemplateProp(nameof<ICheckBoxProps>(p => p.FontFamily)),
                fontSize: TemplateProp(nameof<ICheckBoxProps>(p => p.FontSize)),
                fontWeight: TemplateProp(nameof<ICheckBoxProps>(p => p.FontWeight)),
                color: TemplateProp(nameof<ICheckBoxProps>(p => p.Foreground)),
            },
            [Control.DisabledElement("ckb-box")]: {
                boxShadow: "none",
                background: Theme.Value(SemanticColor.ButtonBackgroundDisabled),
                borderColor: TemplateProp(nameof<ICheckBoxProps>(p => p.BorderBrush)),
            },
            [Control.DisabledElement("ckb-label")]: {
                color: Theme.Value(SemanticColor.DisabledText),
            },
            [Control.DisabledElement("ckb-icon")]: {
                color: Theme.Value(SemanticColor.ButtonTextDisabled),
            },
        });


    private GetIconName(): string
    {
        if (this.IsChecked === undefined)
            return "CheckboxIndeterminate";
        else
            return "CheckMark";
    }

    static DefaultStyleA: WebStyle<ICheckBoxProps> = new WebStyle(
        {
            Template: new ControlTemplate((templatedParent: CheckBox) =>
            (
                <FluentCheckBox
                    styles={{
                        root: {
                            width: "fit-content"
                        },
                        text: {
                            fontFamily: Theme.Value(FontStyle.FontFamily),
                            marginTop: "auto",
                            marginBottom: "auto",
                            marginLeft: "0px",
                            lineHeight: "unset"
                        }
                    }}
                    disabled={templatedParent.state.IsEnabled === undefined ? false : !templatedParent.state.IsEnabled}
                    label={templatedParent.Label}
                    checked={templatedParent.state.IsChecked}
                    indeterminate={templatedParent.state.IsThreeState}
                    onChange={(checked, newValue) =>
                    {
                        templatedParent.OnClick(checked?.nativeEvent as MouseEvent);
                    }}
                />
            ))
        }
    );
}