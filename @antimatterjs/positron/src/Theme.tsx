export enum ThemeColor
{
    ThemePrimary = 4294967296,
    ThemeLighterAlt,
    ThemeLighter,
    ThemeLight,
    ThemeTertiary,
    ThemeSecondary,
    ThemeDarkAlt,
    ThemeDark,
    ThemeDarker,
    NeutralLighterAlt,
    NeutralLighter,
    NeutralLight,
    NeutralQuaternaryAlt,
    NeutralQuaternary,
    NeutralTertiaryAlt,
    NeutralTertiary,
    NeutralSecondary,
    NeutralPrimaryAlt,
    NeutralPrimary,
    NeutralDark,
    Black,
    White,
    Red,
    LightRed,
    Yellow,
    LightYellow,
    Green,
    LightGreen
}

export interface IThemePalette
{
    ThemePrimary: string,
    ThemeLighterAlt: string,
    ThemeLighter: string,
    ThemeLight: string,
    ThemeTertiary: string,
    ThemeSecondary: string,
    ThemeDarkAlt: string,
    ThemeDark: string,
    ThemeDarker: string,
    NeutralLighterAlt: string,
    NeutralLighter: string,
    NeutralLight: string,
    NeutralQuaternaryAlt: string,
    NeutralQuaternary: string,
    NeutralTertiaryAlt: string,
    NeutralTertiary: string,
    NeutralSecondary: string,
    NeutralPrimaryAlt: string,
    NeutralPrimary: string,
    NeutralDark: string,
    Black: string,
    White: string,
    Red: string,
    LightRed: string,
    Yellow: string,
    LightYellow: string,
    Green: string,
    LightGreen: string
}

export interface IThemeFontStyle
{
    FontFamily: string,
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
    Glyph1x: string,
}

export class Theme
{
    public static readonly FirstResourceId: number = 4294967296;

    public readonly FontStyle: IThemeFontStyle = {
        FontFamily: "",
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
        Glyph1x: ""
    };

    public readonly Palette: IThemePalette = {
        ThemePrimary: '#000000',
        ThemeLighterAlt: '#000000',
        ThemeLighter: '#000000',
        ThemeLight: '#000000',
        ThemeTertiary: '#000000',
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
        NeutralSecondary: '#000000',
        NeutralPrimaryAlt: '#000000',
        NeutralPrimary: '#000000',
        NeutralDark: '#000000',
        Black: '#000000',
        White: '#000000',
        Red: '#000000',
        LightRed: '#000000',
        Yellow: '#000000',
        LightYellow: '#000000',
        Green: '#000000',
        LightGreen: '#000000'
    };

    public static Value(resourceId: number): any
    {
        if (resourceId >= 4294967296 && resourceId < 4296015872)
            return `var(--Palette_${ThemeColor[resourceId]})`;
        else if (resourceId >= 4296015872 && resourceId < 4297064448)
            return `var(--Font_${FontStyle[resourceId]})`;
        return undefined;
    }

    public Apply(): void
    {
        var r = document.querySelector(':root') as HTMLElement;
        if (!r)
            return;

        for (let entry of Object.entries(this.Palette))
            r.style.setProperty(`--Palette_${entry[0]}`, entry[1]);
        for (let entry of Object.entries(this.FontStyle))
            r.style.setProperty(`--Font_${entry[0]}`, entry[1]);
    }
}

export enum FontStyle
{
    FontFamily = 4296015872,
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
    Glyph1x,
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
    PrimaryButtonBackground = ThemeColor.ThemePrimary,
    InputBackgroundChecked = ThemeColor.ThemePrimary,
    InputIcon = ThemeColor.ThemePrimary,
    InputFocusBorderAlt = ThemeColor.ThemePrimary,

    MenuIcon = ThemeColor.ThemePrimary,
    MenuHeader = ThemeColor.ThemePrimary,
    PrimaryButtonBackgroundPressed = ThemeColor.ThemeDark,
    InputBackgroundCheckedHovered = ThemeColor.ThemeDark,

    InputIconHovered = ThemeColor.ThemeDark,
    LinkHovered = ThemeColor.ThemeDarker,
    PrimaryButtonBackgroundHovered = ThemeColor.ThemeDarkAlt,
    InputPlaceholderBackgroundChecked = ThemeColor.ThemeLighter,
    BodyBackgroundChecked = ThemeColor.NeutralLight,
    BodyFrameDivider = ThemeColor.NeutralLight,
    BodyDivider = ThemeColor.NeutralLight,
    VariantBorder = ThemeColor.NeutralLight,
    ButtonBackgroundCheckedHovered = ThemeColor.NeutralLight,
    ButtonBackgroundPressed = ThemeColor.NeutralLight,
    ListItemBackgroundChecked = ThemeColor.NeutralLight,
    ListHeaderBackgroundPressed = ThemeColor.NeutralLight,
    MenuItemBackgroundPressed = ThemeColor.NeutralLight,
    MenuItemBackgroundChecked = ThemeColor.NeutralLight,
    BodyBackgroundHovered = ThemeColor.NeutralLighter,
    ButtonBackgroundHovered = ThemeColor.NeutralLighter,
    ButtonBackgroundDisabled = ThemeColor.NeutralLighter,
    ButtonBorderDisabled = ThemeColor.NeutralLighter,
    PrimaryButtonBackgroundDisabled = ThemeColor.NeutralLighter,
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

    ButtonTextHovered = ThemeColor.NeutralDark,
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