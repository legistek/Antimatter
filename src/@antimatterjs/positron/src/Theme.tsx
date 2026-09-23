import { type } from "os";
import { Key } from "react";
import { PositronTheme } from "./Themes/PositronTheme";

export enum ThemeColor
{
    ThemePrimary = 100000000000,
    ThemePrimaryTranslucent,
    ThemeLighter,
    ThemeLight,
    ThemeSecondary,
    ThemeDarkAlt,
    ThemeDark,
    ThemeDarker,

    ThemeAltLighter,
    ThemeAltLight,
    ThemeAltPrimary,
    ThemeAltSecondary,
    ThemeAltDarkAlt,
    ThemeAltDark,    
    ThemeAltDarker,

    NeutralLighterAlt,
    NeutralLighter,
    NeutralLight,
    NeutralQuaternaryAlt,
    NeutralQuaternary,
    NeutralTertiaryAlt,
    NeutralTertiary,
    NeutralTertiaryTranslucent,
    NeutralSecondary,
    NeutralSecondaryTranslucent,
    NeutralPrimaryAlt,
    NeutralPrimary,
    NeutralPrimaryTranslucent,
    NeutralDark,
    NeutralDarkTranslucent,
    Transparent,
    Black,
    White,
    WhiteTranslucent,
    Red,
    LightRed,
    Yellow,
    LightYellow,
    Green,
    MediumGreen,
    LightGreen
}


export enum FontStyle
{
    FontFamily = 101000000000,
    IconFont,
    MonospaceFont,
    Tiny,
    ExtraSmall,
    Small,
    SmallPlus,
    Medium,
    MediumPlus,
    Large,
    ExtraLarge,
    ExtraLargePlus,
    ExtraExtraLarge,
    ExtraExtraLargePlus,
    SuperLarge,
    GlyphPt375x,
    GlyphPt5x,
    GlyphPt75x,
    Glyph1x,
    Glyph1pt25x,
    Glyph1pt5x,
    Glyph2x,
}

export enum ThemeLayout
{
    StandardBorder = 102000000000,
    StandardBorderL,
    StandardBorderT,
    StandardBorderR,
    StandardBorderB,
    StandardBorderTB,
    StandardBorderLT,
    StandardBorderLR,
    StandardBorderLB,
    StandardBorderRB,
    StandardBorderLRB,
    ThickBorder,
    ControlSpacing,
    GridSpacing,
    StandardBorderRadius,
    MarginSmall,
    MarginSmallL,
    MarginSmallT,
    MarginSmallR,
    MarginSmallLR,
    MarginSmallB,
    MarginSmallLB,
    MarginSmallLTRB,
    MarginSmallTR,
    MarginSmallLT,
    MarginSmallTB,
    MarginSmallTRB,
    MarginSmallLRB,
    MarginSmallLTR,

    MarginStandard,
    MarginStandardLTRB,
    MarginStandardL,
    MarginStandardT,
    MarginStandardR,
    MarginStandardB,
    MarginStandardLR,
    MarginStandardLT,
    MarginStandardTB,
    MarginStandardTR,
    MarginStandardRB,
    MarginStandardTRB,
    MarginStandardLTR,
    MarginStandardLRB,
    MarginStandardLTB,
    MarginWide,
    MarginWideLT,
    MarginWideLTR,
    MarginWideLTRB,
    MarginWideTRB,
    MarginWideLRB,
    MarginWideL,
    MarginWideT,
    MarginWideR,
    MarginWideB,
    MarginWideLR,
    MarginWideTB,

    MarginStandardLRWideTB,
    MarginWideLRStandardTB,
    MarginWideLRSmallTB,

    MarginExtraWide,
    MarginExtraWideLR,
    MarginExtraWideT,
    MarginExtraWideLTRB,
    MarginExtraWideL,
    MarginExtraWideR,

    MarginExtraWideLStandardT,

    SmallDialogWidth,
    MediumDialogWidth,
    LargeDialogWidth,

    SpinnerStandardWidth,
    TextboxMaxHeight,
    InputShortWidth,
    InputMediumWidth
}

export enum ThemeEffect
{
    ControlInnerShadow = 103000000000,
    CardShadow,
    SmallShadow,
    LargeShadow,
    HoverTransitionTime,
    AnimateEntranceFromLeft,
    AnimateEntranceFromLeftQuick,
    AnimateExitLeft,
    AnimateEntranceFromRight,
    AnimateExitRight,
    AnimateGrowWidthFromNothing,
    AnimateGrowHeightFromNothing,
    AnimateShrinkHeightToNothing,
    AnimateQuickFadeIn,
    AnimateDelayedQuickFadeIn,
    AnimateQuickFadeOut,
    AnimateTextEdit,
    PlasticBackground,

}

export type ThemeEffects =
    {
        [key in ThemeEffect]: string;
    };

export type ThemeLayouts = {
    [key in ThemeLayout]: string;
};

export interface IThemePalette
{
    ThemePrimary: string,
    ThemePrimaryTranslucent: string,
    ThemeLighter: string,
    ThemeLight: string,
    ThemeSecondary: string,
    ThemeDarkAlt: string,
    ThemeDark: string,
    ThemeDarker: string,

    ThemeAltLighter: string,
    ThemeAltLight: string,
    ThemeAltPrimary: string,
    ThemeAltSecondary: string,
    ThemeAltDarkAlt: string,
    ThemeAltDark: string,
    ThemeAltDarker: string,

    NeutralLighterAlt: string,
    NeutralLighter: string,
    NeutralLight: string,
    NeutralQuaternaryAlt: string,
    NeutralQuaternary: string,
    NeutralTertiaryAlt: string,
    NeutralTertiary: string,
    NeutralTertiaryTranslucent: string,
    NeutralSecondary: string,
    NeutralSecondaryTranslucent: string,
    NeutralPrimaryAlt: string,
    NeutralPrimary: string,
    NeutralPrimaryTranslucent: string,
    NeutralDark: string,
    Transparent: string,
    Black: string,
    White: string,
    WhiteTranslucent: string,
    Red: string,
    LightRed: string,
    Yellow: string,
    LightYellow: string,
    Green: string,
    LightGreen: string
}

export interface IThemeFontStyle
{
    MonospaceFont: string,
    FontFamily: string,
    IconFont: string,
    Tiny: string,
    ExtraSmall: string,
    Small: string,
    SmallPlus: string,
    Medium: string,
    MediumPlus: string,
    Large: string,
    ExtraLarge: string,
    ExtraLargePlus: string,
    ExtraExtraLarge: string,
    ExtraExtraLargePlus: string,
    SuperLarge: string,
    GlyphPt375x: string,
    GlyphPt5x: string,
    GlyphPt75x: string,
    Glyph1x: string,
    Glyph1pt25x: string,
    Glyph1pt5x: string,
    Glyph2x: string,
}

export class Theme
{
    public static readonly FirstResourceId: number = 100000000000;

    public readonly FontStyle: IThemeFontStyle = {
        FontFamily: "",
        IconFont: "",
        MonospaceFont: "",
        Tiny: "",
        ExtraSmall: "",
        Small: "",
        SmallPlus: "",
        Medium: "",
        MediumPlus: "",
        Large: "",
        ExtraLarge: "",
        ExtraLargePlus: "",
        ExtraExtraLarge: "",
        ExtraExtraLargePlus: "",
        SuperLarge: "",
        GlyphPt375x: "",
        GlyphPt5x: "",
        GlyphPt75x: "",
        Glyph1x: "",
        Glyph2x: "",
        Glyph1pt5x: "",
        Glyph1pt25x: "",
    };

    public readonly Layout: ThemeLayouts = {
        [ThemeLayout.StandardBorder]: '1px',

        [ThemeLayout.StandardBorderL]: '0px 0px 0px 1px',
        [ThemeLayout.StandardBorderT]: '1px 0px 0px 0px',
        [ThemeLayout.StandardBorderR]: '0px 1px 0px 0px',
        [ThemeLayout.StandardBorderB]: '0px 0px 1px 0px',
        [ThemeLayout.StandardBorderTB]: '1px 0px 1px 0px',
        [ThemeLayout.StandardBorderLB]: '0px 0px 1px 1px',
        [ThemeLayout.StandardBorderLT]: '1px 0px 0px 1px',
        [ThemeLayout.StandardBorderLR]: '0px 1px 0px 1px',
        [ThemeLayout.StandardBorderLRB]: '0px 1px 1px 1px',
        [ThemeLayout.StandardBorderRB]: '0px 1px 1px 0px',

        [ThemeLayout.ThickBorder]: '3px',
        [ThemeLayout.ControlSpacing]: '10px',
        [ThemeLayout.GridSpacing]: "7px",
        [ThemeLayout.StandardBorderRadius]: "2px",

        [ThemeLayout.MarginSmall]: '4px',
        [ThemeLayout.MarginSmallLTRB]: '4px',
        [ThemeLayout.MarginSmallL]: '0px 0px 0px 4px',
        [ThemeLayout.MarginSmallLT]: '4px 0px 0px 4px',
        [ThemeLayout.MarginSmallLR]: '0px 4px',
        [ThemeLayout.MarginSmallT]: '4px 0px 0px 0px',
        [ThemeLayout.MarginSmallR]: '0px 4px 0px 0px',
        [ThemeLayout.MarginSmallB]: '0px 0px 4px 0px',
        [ThemeLayout.MarginSmallLB]: '0px 0px 4px 4px',
        [ThemeLayout.MarginSmallTB]: '4px 0px 4px 0px',
        [ThemeLayout.MarginSmallTRB]: '4px 4px 4px 0px',
        [ThemeLayout.MarginSmallLRB]: '0px 4px 4px 4px',
        [ThemeLayout.MarginSmallLTR]: '4px 4px 0px 4px',
        [ThemeLayout.MarginSmallTR]: '4px 4px 0px 0px',

        [ThemeLayout.MarginStandard]: '7px',
        [ThemeLayout.MarginStandardLTRB]: '7px',
        [ThemeLayout.MarginStandardL]: '0px 0px 0px 7px',
        [ThemeLayout.MarginStandardT]: '7px 0px 0px 0px',
        [ThemeLayout.MarginStandardR]: '0px 7px 0px 0px',
        [ThemeLayout.MarginStandardB]: '0px 0px 7px 0px',
        [ThemeLayout.MarginStandardLR]: '0px 7px',
        [ThemeLayout.MarginStandardLT]: '7px 0px 0px 7px',
        [ThemeLayout.MarginStandardTB]: '7px 0px',
        [ThemeLayout.MarginStandardTR]: '7px 7px 0px 0px',
        [ThemeLayout.MarginStandardRB]: '0 7px 7px 0',
        [ThemeLayout.MarginStandardTRB]: '7px 7px 7px 0px',
        [ThemeLayout.MarginStandardLTR]: '7px 7px 0 7px',
        [ThemeLayout.MarginStandardLRB]: '0 7px 7px 7px',
        [ThemeLayout.MarginStandardLTB]: '7px 0px 7px 7px',

        [ThemeLayout.MarginWide]: '15px',
        [ThemeLayout.MarginWideLTRB]: '15px',
        [ThemeLayout.MarginWideLT]: '15px 0px 0px 15px',
        [ThemeLayout.MarginWideLTR]: '15px 15px 0px 15px',
        [ThemeLayout.MarginWideTRB]: '15px 15px 15px 0px',
        [ThemeLayout.MarginWideLRB]: '0px 15px 15px 0px',
        [ThemeLayout.MarginWideL]: '0px 0px 0px 15px',
        [ThemeLayout.MarginWideT]: '15px 0px 0px 0px',
        [ThemeLayout.MarginWideR]: '0px 15px 0px 0px',
        [ThemeLayout.MarginWideB]: '0px 0px 15px 0px',

        [ThemeLayout.MarginWideLR]: '0px 15px 0px 15px',
        [ThemeLayout.MarginExtraWideLR]: '0px 25px 0px 25px',
        [ThemeLayout.MarginExtraWideLTRB]: '25px',
        [ThemeLayout.MarginExtraWide]: '25px',
        [ThemeLayout.MarginExtraWideT]: '25px 0px 0px 0px',
        [ThemeLayout.MarginExtraWideL]: '0 0 0 25px',
        [ThemeLayout.MarginExtraWideR]: '0px 25px 0px 0px',
        [ThemeLayout.MarginWideTB]: '15px 0px 15px 0px',

        [ThemeLayout.MarginWideLRSmallTB]: '4px 15px 4px 15px',
        [ThemeLayout.MarginWideLRStandardTB]: '7px 15px 7px 15px',
        [ThemeLayout.MarginStandardLRWideTB]: '15px 7px 15px 7px',
        [ThemeLayout.MarginExtraWideLStandardT]: '7px 0 0 25px',

        [ThemeLayout.SmallDialogWidth]: "512px",
        [ThemeLayout.MediumDialogWidth]: "768px",
        [ThemeLayout.LargeDialogWidth]: '1024px',

        [ThemeLayout.SpinnerStandardWidth]: '90px',
        [ThemeLayout.TextboxMaxHeight]: '186px',
        [ThemeLayout.InputShortWidth]: '120px',
        [ThemeLayout.InputMediumWidth]: '320px'
    }

    public readonly Effects: ThemeEffects = {
        [ThemeEffect.ControlInnerShadow]: "inset 0 2px 3px 0 var(--Palette_NeutralLight)",
        [ThemeEffect.SmallShadow]: "rgb(0 0 0 / 13%) 0px 1.2px 3.2px 0px, rgb(0 0 0 / 11%) 0px 0.6px 1.8px 0px",
        [ThemeEffect.CardShadow]: "rgb(0 0 0 / 13%) 0px 3.2px 7.2px 0px, rgb(0 0 0 / 11%) 0px 0.6px 1.8px 0px",
        [ThemeEffect.LargeShadow]: "rgb(0 0 0 / 50%) 0px 0px 50px 0px",
        [ThemeEffect.HoverTransitionTime]: "0.2s",
        [ThemeEffect.AnimateEntranceFromLeft]: '0.5s ease 0s 1 normal forwards running slideInFromLeft',
        [ThemeEffect.AnimateEntranceFromLeftQuick]: '0.5s ease 0s 1 normal forwards running slideInFromLeftQuick',
        [ThemeEffect.AnimateEntranceFromRight]: '0.5s ease 0s 1 normal forwards running slideInFromRight',
        [ThemeEffect.AnimateExitLeft]: "0.5s 0s 1 normal forwards running slideOutLeft",
        [ThemeEffect.AnimateExitRight]: "0.5s 0s 1  normal forwards running slideOutRight",
        [ThemeEffect.AnimateGrowWidthFromNothing]: "0.5s 0s 1 growWidthFromNothing",
        [ThemeEffect.AnimateGrowHeightFromNothing]: "1.0s ease 0s 1 normal forwards running growFrom0",
        [ThemeEffect.AnimateShrinkHeightToNothing]: "0.5s ease 0s 1 normal forwards running shrinkTo0",
        [ThemeEffect.AnimateQuickFadeIn]: "0.1s ease 0s 1 normal forwards running ptxfadein",
        [ThemeEffect.AnimateDelayedQuickFadeIn]: "0.1s ease 1s 1 normal forwards running ptxfadein",
        [ThemeEffect.AnimateQuickFadeOut]: "0.1s ease 0s 1 normal forwards running ptxfadeout",
        [ThemeEffect.AnimateTextEdit]: "textLiveEdit 2.0s ease-out",
        [ThemeEffect.PlasticBackground]: "linear-gradient(320deg, rgba(245,245,245,1) 0%, rgba(253,253,253,1) 100%)",
    }

    public Palette: IThemePalette = {
        ThemePrimary: '#000000',
        ThemePrimaryTranslucent: '#000000',
        ThemeLighter: '#000000',
        ThemeLight: '#000000',
        ThemeSecondary: '#000000',
        ThemeDarkAlt: '#000000',
        ThemeDark: '#000000',
        ThemeDarker: '#000000',
        NeutralLighterAlt: '#000000',
        NeutralLighter: '#000000',
        NeutralLight: '#000000',
        NeutralQuaternaryAlt: '#000000',
        NeutralQuaternary: '#000000',
        NeutralTertiaryAlt: '#000000',
        NeutralTertiary: '#000000',
        NeutralTertiaryTranslucent: '#00000080',
        NeutralSecondary: '#000000',
        NeutralSecondaryTranslucent: '#00000080',
        NeutralPrimaryAlt: '#000000',
        NeutralPrimary: '#000000',
        NeutralPrimaryTranslucent: "#000000C0",
        NeutralDark: '#000000',
        Transparent: '#00000000',
        Black: '#000000',
        White: '#000000',
        WhiteTranslucent: '#00000080',
        Red: '#000000',
        LightRed: '#000000',
        Yellow: '#000000',
        LightYellow: '#000000',
        Green: '#000000',
        LightGreen: '#000000'
    };

    public static Value(resourceId: number): any
    {
        if (resourceId >= 100000000000 && resourceId < 101000000000)
            return `var(--Palette_${ThemeColor[resourceId]})`;
        else if (resourceId >= 101000000000 && resourceId < 102000000000)
            return `var(--Font_${FontStyle[resourceId]})`;
        else if (resourceId >= 102000000000 && resourceId < 103000000000)
            return `var(--Layout_${resourceId})`;
        else if (resourceId >= 103000000000 && resourceId < 104000000000)
            return `var(--Effect_${resourceId})`;
        return undefined;
    }
}

export enum SemanticColor
{
    BodyBackground = ThemeColor.White,
    BodyFrameBackground = ThemeColor.White,
    ButtonBackground = ThemeColor.White,
    PrimaryButtonText = ThemeColor.White,
    PrimaryButtonTextHovered = ThemeColor.White,
    PrimaryButtonTextPressed = ThemeColor.White,
    InputBackground = ThemeColor.White,
    InputForegroundChecked = ThemeColor.White,
    ListBackground = ThemeColor.White,
    MenuBackground = ThemeColor.White,
    BodyTextChecked = ThemeColor.Black,
    ButtonTextCheckedHovered = ThemeColor.Black,
    Link = ThemeColor.ThemePrimary,

    InputBackgroundChecked = ThemeColor.ThemePrimary,
    InputIcon = ThemeColor.ThemePrimary,
    InputFocusBorderAlt = ThemeColor.ThemePrimary,

    MenuIcon = ThemeColor.ThemePrimary,
    MenuHeader = ThemeColor.ThemePrimary,

    PrimaryButtonBackground = ThemeColor.ThemeSecondary,
    PrimaryButtonBackgroundHovered = ThemeColor.ThemeDarkAlt,
    PrimaryButtonBackgroundPressed = ThemeColor.ThemeDark,

    InputBackgroundCheckedHovered = ThemeColor.ThemeDark,

    InputIconHovered = ThemeColor.ThemeDark,
    LinkHovered = ThemeColor.ThemeDarker,

    InputPlaceholderBackgroundChecked = ThemeColor.ThemeLighter,
    BodyBackgroundChecked = ThemeColor.NeutralLight,
    BodyFrameDivider = ThemeColor.NeutralLight,
    BodyDivider = ThemeColor.NeutralLight,
    VariantBorder = ThemeColor.NeutralLight,
    ButtonBackgroundCheckedHovered = ThemeColor.NeutralLight,
    ButtonBackgroundPressed = ThemeColor.NeutralLighterAlt,
    ListItemBackgroundChecked = ThemeColor.NeutralLight,
    ListHeaderBackgroundPressed = ThemeColor.NeutralLight,
    MenuItemBackgroundPressed = ThemeColor.NeutralLight,
    MenuItemBackgroundChecked = ThemeColor.NeutralLight,
    BodyBackgroundHovered = ThemeColor.NeutralLighter,
    ButtonBackgroundHovered = ThemeColor.NeutralLight,
    ButtonBackgroundDisabled = ThemeColor.NeutralLighter,
    ButtonBorderDisabled = ThemeColor.NeutralLighter,
    PrimaryButtonBackgroundDisabled = ThemeColor.NeutralLighterAlt,
    DisabledBackground = ThemeColor.NeutralLighter,
    ListItemBackgroundHovered = ThemeColor.NeutralLighter,
    ListHeaderBackgroundHovered = ThemeColor.NeutralLighter,
    MenuItemBackgroundHovered = ThemeColor.NeutralLighter,

    PrimaryButtonTextDisabled = ThemeColor.NeutralQuaternary,
    DisabledSubtext = ThemeColor.NeutralQuaternary,
    ListItemBackgroundCheckedHovered = ThemeColor.NeutralQuaternaryAlt,
    DisabledBodyText = ThemeColor.NeutralTertiary,
    VariantBorderHovered = ThemeColor.NeutralTertiary,
    ButtonTextDisabled = ThemeColor.NeutralTertiary,
    InputIconDisabled = ThemeColor.NeutralTertiary,
    DisabledText = ThemeColor.NeutralTertiary,
    BodyText = ThemeColor.NeutralPrimary,
    ActionLink = ThemeColor.NeutralPrimary,
    ButtonText = ThemeColor.NeutralSecondary,
    InputBorderHovered = ThemeColor.NeutralPrimary,
    InputText = ThemeColor.NeutralPrimary,
    ListText = ThemeColor.NeutralPrimary,
    MenuItemText = ThemeColor.NeutralPrimary,
    BodyStandoutBackground = ThemeColor.NeutralLighterAlt,
    DefaultStateBackground = ThemeColor.NeutralLighterAlt,
    ActionLinkHovered = ThemeColor.NeutralDark,

    ButtonTextHovered = ThemeColor.NeutralSecondary,
    ButtonTextChecked = ThemeColor.NeutralDark,
    ButtonTextPressed = ThemeColor.NeutralDark,
    InputTextHovered = ThemeColor.NeutralDark,
    MenuItemTextHovered = ThemeColor.NeutralDark,
    BodySubtext = ThemeColor.NeutralSecondary,
    FocusBorder = ThemeColor.ThemeSecondary,

    InputBorder = ThemeColor.NeutralTertiary,
    SmallInputBorder = ThemeColor.NeutralSecondary,
    InputPlaceholderText = ThemeColor.NeutralSecondary,
    ButtonBorder = ThemeColor.NeutralTertiary,
    DisabledBodySubtext = ThemeColor.NeutralTertiaryAlt,
    DisabledBorder = ThemeColor.NeutralTertiaryAlt,
    ButtonBackgroundChecked = ThemeColor.NeutralTertiaryAlt,
    MenuDivider = ThemeColor.NeutralTertiaryAlt,

    Error = ThemeColor.Red,
    ErrorBackground = ThemeColor.LightRed,
    Warning = ThemeColor.Yellow,
    WarningBackground = ThemeColor.LightYellow,
    Good = ThemeColor.Green,
    GoodBackground = ThemeColor.LightGreen
}

export class ColorGradient
{
    //Proportion of each stripe w/ fixed solid color, before transitioning to the next color for the remainder
    public static SolidStripeRatio: number = 0.5;

    constructor(colors?: string[], width?: number, angle?: number)
    {
        this.Colors = colors ?? [];
        this.Width = width ?? 0;
        this.Angle = angle ?? 45;
    }

    public Colors: string[];
    public Width: number;   //Pixel width of an individual color's stripe
    public Angle: number;   //Angle in degrees
}