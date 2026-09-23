import { IThemeFontStyle, IThemePalette, Theme } from '../Theme'

export class PositronTheme extends Theme
{
    public override Palette: IThemePalette = {
        ThemePrimary: '#3978e5',
        ThemePrimaryTranslucent: 'rgba(57, 120, 229, 0.33)',
        ThemeSecondary: '#3978e5',
        ThemeDark: '#1147a6',
        ThemeDarkAlt: '#265ebf',
        ThemeDarker: '#253551',
        ThemeLight: '#9eb6e3',
        ThemeLighter: '#dfe6f3',

        ThemeAltLighter: '#f4f2fc',
        ThemeAltLight: '#ded9f4',
        ThemeAltPrimary: '#8d82d8',
        ThemeAltSecondary: '#6a5fae',
        ThemeAltDarkAlt: '#6355c7',
        ThemeAltDark: '#4b3fa8',
        ThemeAltDarker: '#3f3a5c',
                               
        NeutralLighterAlt: '#f1f2f3',
        NeutralLighter: '#f1f2f3',
        NeutralLight: '#e4e5e6',
        NeutralQuaternaryAlt: '#C4CDC5',
        NeutralQuaternary: '#C0C0C0',
        NeutralTertiaryAlt: '#a0a1a2',
        NeutralTertiary: '#a0a0a0',
        NeutralTertiaryTranslucent: '#a0a0a080',
        NeutralSecondary: '#606060',
        NeutralSecondaryTranslucent: '#606060C0',
        NeutralPrimaryAlt: '#181818',
        NeutralPrimary: '#181818',
        NeutralPrimaryTranslucent: "#181818C0",
        NeutralDark: '#181818',

        Transparent: '#00000000',
        Black: '#000000',
        White: '#ffffff',
        WhiteTranslucent: "#ffffff80",
        Red: '#F45B69',
        LightRed: '#ffe5e8',
        Yellow: '#FFB30F',
        LightYellow: '#fff7e5',
        Green: '#00A000',
        LightGreen: '#DFF6DD'
    };

    public override readonly FontStyle: IThemeFontStyle = {
        FontFamily: "Roboto",
        MonospaceFont: "Roboto Mono",
        IconFont: "IconFont",
        Tiny: "8px",
        ExtraSmall: "10px",
        Small: "12px",
        SmallPlus: "13px",
        Medium: "14px",
        MediumPlus: "16px",
        Large: "18px",
        ExtraLarge: "20px",
        ExtraLargePlus: "21px",
        ExtraExtraLarge: "24px",
        ExtraExtraLargePlus: "25px",
        SuperLarge: "36px",
        GlyphPt375x: "6px",
        GlyphPt5x: "8px",
        GlyphPt75x: "12px",
        Glyph1x: "16px",
        Glyph1pt5x: "24px",
        Glyph1pt25x: "20px",
        Glyph2x: "32px",
    }

    public static FromJson(theme: any): PositronTheme
    {
        var useColoredIcons = theme?.use_colored_icons;
        var pxtheme = new PositronTheme();
        if (theme?.palette)
        {
            var entries = Object.entries(theme.palette);
            for (var entry of entries)
                pxtheme.Palette[entry[0]] = entry[1];
        }
        return pxtheme;
    }
}