import * as React from 'react';
import { BindingMode } from '@antimatterjs/react';
import { IToggleButtonProps, IToggleButtonState, ToggleButton, ToggleButtonBase } from './Primitives/ToggleButton';
import { ControlTemplate } from '../FrameworkTemplate';
import { TemplateProp, WebStyle } from '../Style';
import { FontStyle, SemanticColor, Theme, ThemeColor, ThemeEffect, ThemeLayout } from '../Theme';
import { Grid } from './Grid';
import { CSSClasses } from '../CSSClasses';
import { Control } from './Control';
import { Glyph } from './Glyph';

export interface IRadioButtonProps extends IToggleButtonProps
{
    IsUnselectable?: boolean
}

interface IRadioButtonState extends IToggleButtonState
{
    IsUnselectable?: boolean
}

export class RadioButton extends ToggleButtonBase<IRadioButtonProps, IRadioButtonState>
{
    public static RootClassName: string = 'radio-btn';
    public static FillClassName: string = 'radio-fill';
    public static LabelClassName: string = 'radio-label';

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

    static DefaultStyle = new WebStyle<IRadioButtonProps>(
        {
            Background: SemanticColor.BodyBackground,
            BorderBrush: SemanticColor.ButtonBorder,
            BorderThickness: ThemeLayout.StandardBorder,
            Foreground: SemanticColor.BodyText,
            FontFamily: FontStyle.FontFamily,
            FontSize: FontStyle.Medium,
            FontWeight: "bold",
            Padding: "1px",
            Template: new ControlTemplate((templatedParent: RadioButton) => (
                <Grid
                    ColumnDefinitions={[Grid.ColumnDefinition(), Grid.FittedColumn(), Grid.ColumnDefinition(), Grid.ColumnDefinition()]}
                    OnClick={(e) => templatedParent.OnClick(e)}>
                    <div className={`${RadioButton.RootClassName} ${CSSClasses.Base} ${CSSClasses.HACenter} ${CSSClasses.VACenter}`}
                        onKeyPress={(e) =>
                        {
                            if (!templatedParent.IsEnabled)
                                return;
                            if (e.key === ' ')
                                templatedParent.OnClick();
                        }}
                        tabIndex={templatedParent.IsEnabled ? 0 : -1}>
                        <div className={RadioButton.FillClassName} ></div>
                    </div>

                    <span className={RadioButton.LabelClassName}>
                        {templatedParent.Label}
                    </span>

                    {templatedParent.InfoTip && (
                        <Glyph
                            Style={Glyph.ControlInfoTipStyle}
                            Grid={{ Column: 2 }}
                            ClassName="radio-infotip"
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
            [`@ .${RadioButton.RootClassName}`]: {
                gridColumn: 1,
                borderRadius: "50%",
                boxShadow: Theme.Value(ThemeEffect.ControlInnerShadow),
                userSelect: "none",
                display: "flex",
                padding: TemplateProp(nameof<IRadioButtonProps>(p => p.Padding)),
                borderColor: TemplateProp(nameof<IRadioButtonProps>(p => p.BorderBrush)),
                borderWidth: TemplateProp(nameof<IRadioButtonProps>(p => p.BorderThickness)),
                background: TemplateProp(nameof<IRadioButtonProps>(p => p.Background)),
                fontSize: TemplateProp(nameof<IRadioButtonProps>(p => p.FontSize)),
            },
            [`@.${ToggleButton.STATE_Checked} .${RadioButton.RootClassName}`]: {
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackground),
                boxShadow: "none",
            },
            [`@.${ToggleButton.STATE_Checked} .${RadioButton.FillClassName}`]: {
                visibility: "visible",
            },
            [`@:not(.${ToggleButton.STATE_Checked}):not(.${ToggleButton.STATE_ValidationError}):not(${ToggleButton.STATE_Indeterminate}):hover .${RadioButton.FillClassName}`]: {
                visibility: "visible",
                backgroundColor: Theme.Value(SemanticColor.DisabledBodyText)
            },
            [`@ .${RadioButton.FillClassName}`]: {
                backgroundColor: Theme.Value(SemanticColor.PrimaryButtonBackground),
                height: `calc(${Theme.Value(FontStyle.Glyph1x)} - 4px)`,
                width: `calc(${Theme.Value(FontStyle.Glyph1x)} - 4px)`,
                borderColor: TemplateProp(nameof<IRadioButtonProps>(p => p.Background)),
                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: "50%",
                visibility: "collapse",
                alignSelf: "center"
            },
            [`@.${ToggleButton.STATE_ValidationError} .${RadioButton.RootClassName}`]: {
                background: Theme.Value(SemanticColor.ErrorBackground),
                borderColor: Theme.Value(SemanticColor.Error),
            },
            [`@.${ToggleButton.STATE_ValidationError} .${RadioButton.FillClassName}`]: {
                color: Theme.Value(SemanticColor.Error),
            },
            [`@.${ToggleButton.STATE_Indeterminate}:not(.${ToggleButton.STATE_ValidationError}) .${RadioButton.FillClassName}`]: {
                color: Theme.Value(ThemeColor.NeutralSecondary)
            },
            [`@.${ToggleButton.STATE_Checked} .${RadioButton.FillClassName}`]: {
                visibility: "visible"
            },
            [`@ .${RadioButton.LabelClassName}`]: {
                gridColumn: 2,
                alignSelf: "center",
                marginLeft: "5px",
                userSelect: "none",
                fontFamily: TemplateProp(nameof<IRadioButtonProps>(p => p.FontFamily)),
                fontSize: TemplateProp(nameof<IRadioButtonProps>(p => p.FontSize)),
                fontWeight: TemplateProp(nameof<IRadioButtonProps>(p => p.FontWeight)),
                color: TemplateProp(nameof<IRadioButtonProps>(p => p.Foreground))
            },
            [Control.DisabledElement(RadioButton.RootClassName)]: {
                boxShadow: "none",
                background: Theme.Value(SemanticColor.ButtonBackgroundDisabled),
                borderColor: TemplateProp(nameof<IRadioButtonProps>(p => p.BorderBrush))
            },
            [Control.DisabledElement(RadioButton.LabelClassName)]: {
                color: Theme.Value(SemanticColor.DisabledText)
            },
            [Control.DisabledElement(RadioButton.FillClassName)]: {
                backgroundColor: Theme.Value(SemanticColor.ButtonTextDisabled)
            },
        });

    public /* override */ OnClick(e?: MouseEvent): void
    {
        if (this.IsChecked && !this.state.IsUnselectable)
            return;
        super.OnClick(e);
    }
}