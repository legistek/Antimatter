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
    };
    
    public static Value(resourceId: number) : any
    {
        if (resourceId >= 4294967296 && resourceId < 4296015872)
            return `var(--Palette_${PaletteColor[resourceId]})`;
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

export enum PaletteColor
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
}

export enum SemanticColor
{
    BodyBackground = PaletteColor.White,
    BodyFrameBackground = PaletteColor.White,
    ButtonBackground = PaletteColor.White,
    PrimaryButtonText = PaletteColor.White,
    PrimaryButtonTextHovered = PaletteColor.White,
    PrimaryButtonTextPressed = PaletteColor.White,
    InputBackground = PaletteColor.White,
    InputForegroundChecked = PaletteColor.White,
    ListBackground = PaletteColor.White,
    MenuBackground = PaletteColor.White,
    BodyTextChecked = PaletteColor.Black,
    ButtonTextCheckedHovered = PaletteColor.Black,
    Link = PaletteColor.ThemePrimary,
    PrimaryButtonBackground = PaletteColor.ThemePrimary,
    InputBackgroundChecked = PaletteColor.ThemePrimary,
    InputIcon = PaletteColor.ThemePrimary,
    InputFocusBorderAlt = PaletteColor.ThemePrimary,

    MenuIcon = PaletteColor.ThemePrimary,
    MenuHeader = PaletteColor.ThemePrimary,
    PrimaryButtonBackgroundPressed = PaletteColor.ThemeDark,
    InputBackgroundCheckedHovered = PaletteColor.ThemeDark,

    InputIconHovered = PaletteColor.ThemeDark,
    LinkHovered = PaletteColor.ThemeDarker,
    PrimaryButtonBackgroundHovered = PaletteColor.ThemeDarkAlt,
    InputPlaceholderBackgroundChecked = PaletteColor.ThemeLighter,
    BodyBackgroundChecked = PaletteColor.NeutralLight,
    BodyFrameDivider = PaletteColor.NeutralLight,
    BodyDivider = PaletteColor.NeutralLight,
    VariantBorder = PaletteColor.NeutralLight,
    ButtonBackgroundCheckedHovered = PaletteColor.NeutralLight,
    ButtonBackgroundPressed = PaletteColor.NeutralLight,
    ListItemBackgroundChecked = PaletteColor.NeutralLight,
    ListHeaderBackgroundPressed = PaletteColor.NeutralLight,
    MenuItemBackgroundPressed = PaletteColor.NeutralLight,
    MenuItemBackgroundChecked = PaletteColor.NeutralLight,
    BodyBackgroundHovered = PaletteColor.NeutralLighter,
    ButtonBackgroundHovered = PaletteColor.NeutralLighter,
    ButtonBackgroundDisabled = PaletteColor.NeutralLighter,
    ButtonBorderDisabled = PaletteColor.NeutralLighter,
    PrimaryButtonBackgroundDisabled = PaletteColor.NeutralLighter,
    DisabledBackground = PaletteColor.NeutralLighter,
    ListItemBackgroundHovered = PaletteColor.NeutralLighter,
    ListHeaderBackgroundHovered = PaletteColor.NeutralLighter,
    MenuItemBackgroundHovered = PaletteColor.NeutralLighter,

    PrimaryButtonTextDisabled = PaletteColor.NeutralQuaternary,
    DisabledSubtext = PaletteColor.NeutralQuaternary,
    ListItemBackgroundCheckedHovered = PaletteColor.NeutralQuaternaryAlt,
    DisabledBodyText = PaletteColor.NeutralTertiary,
    VariantBorderHovered = PaletteColor.NeutralTertiary,
    ButtonTextDisabled = PaletteColor.NeutralTertiary,
    InputIconDisabled = PaletteColor.NeutralTertiary,
    DisabledText = PaletteColor.NeutralTertiary,
    BodyText = PaletteColor.NeutralPrimary,
    ActionLink = PaletteColor.NeutralPrimary,
    ButtonText = PaletteColor.NeutralPrimary,
    InputBorderHovered = PaletteColor.NeutralPrimary,
    InputText = PaletteColor.NeutralPrimary,
    ListText = PaletteColor.NeutralPrimary,
    MenuItemText = PaletteColor.NeutralPrimary,
    BodyStandoutBackground = PaletteColor.NeutralLighterAlt,
    DefaultStateBackground = PaletteColor.NeutralLighterAlt,
    ActionLinkHovered = PaletteColor.NeutralDark,

    ButtonTextHovered = PaletteColor.NeutralDark,
    ButtonTextChecked = PaletteColor.NeutralDark,
    ButtonTextPressed = PaletteColor.NeutralDark,
    InputTextHovered = PaletteColor.NeutralDark,
    MenuItemTextHovered = PaletteColor.NeutralDark,
    BodySubtext = PaletteColor.NeutralSecondary,
    FocusBorder = PaletteColor.NeutralSecondary,

    InputBorder = PaletteColor.NeutralSecondary,
    SmallInputBorder = PaletteColor.NeutralSecondary,
    InputPlaceholderText = PaletteColor.NeutralSecondary,
    ButtonBorder = PaletteColor.NeutralTertiary,
    DisabledBodySubtext = PaletteColor.NeutralTertiaryAlt,
    DisabledBorder = PaletteColor.NeutralTertiaryAlt,
    ButtonBackgroundChecked = PaletteColor.NeutralTertiaryAlt,
    MenuDivider = PaletteColor.NeutralTertiaryAlt
}