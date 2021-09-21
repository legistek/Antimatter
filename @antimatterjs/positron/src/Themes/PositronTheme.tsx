import { IThemeFontStyle, IThemeLayout, IThemePalette, Theme } from '../Theme'

export class PositronTheme extends Theme
{
    public readonly Palette2: IThemePalette = {
        ThemePrimary:  "#FF0000", //'#2e70e0',
        ThemeLighterAlt: "#FF2020", // '#f6f9fe',
        ThemeLighter: "#FF3030", // '#dae6fa',
        ThemeLight: "FF8080", // '#bcd1f6',
        ThemeSecondary: '#0070e0', // '#2e70e0',
        ThemeTertiary: "#E02000", // '#a1b6e3',        
        ThemeDarkAlt: "#902020", // '#0056b8',
        ThemeDark: "#600000", // '#0056b8',
        ThemeDarker: "#400000", // '#1e295b',
        NeutralLighterAlt: '#00f1f5', // '#f0f1f5',
        NeutralLighter: '#00f1f5', //  '#f0f1f5',
        NeutralLight: '#00d9e1', //'#d7d9e1',
        NeutralQuaternaryAlt: '#00d9e1', //'#d7d9e1',
        NeutralQuaternary: '#004747', //'#594747',
        NeutralTertiaryAlt: '#004955', //'#494955',
        NeutralTertiary: '#00a0a0', //'#a0a0a0',
        NeutralSecondary: '#5d0f92', // '#606060',
        NeutralPrimaryAlt: '#001010', // '#101010',
        NeutralPrimary: '#604080', // '#101010',
        NeutralDark: '#001010', // '#101010',
        Black: '#0005F5', // '#000000',
        White: '#F0ffff', // '#ffffff',
        Red: '#E00000',
        LightRed: '#FFE8E8',
        Yellow: '#A0A000',
        LightYellow: '#A0A060',
        Green: '#00A000',
        LightGreen: '#60A0A0'
    };

    public readonly Palette: IThemePalette = {
        ThemePrimary: '#2e70e0',
        ThemeLighterAlt: '#f6f9fe',
        ThemeLighter: '#dae6fa',
        ThemeLight: '#bcd1f6',
        ThemeSecondary: '#2e70e0',
        ThemeTertiary: '#a1b6e3',        
        ThemeDark: '#003698',
        ThemeDarkAlt: '#0056b8',
        ThemeDarker: '#1e295b',
        NeutralLighterAlt: '#f0f1f5',
        NeutralLighter: '#f0f1f5',
        NeutralLight: '#d7d9e1',
        NeutralQuaternaryAlt: '#d7d9e1',
        NeutralQuaternary: '#594747',
        NeutralTertiaryAlt: '#494955',
        NeutralTertiary: '#a0a0a0',
        NeutralSecondary: '#606060',
        NeutralPrimaryAlt: '#101010',
        NeutralPrimary: '#101010',
        NeutralDark: '#101010',
        Black: '#000000',
        White: '#ffffff',
        Red: '#E00000',
        LightRed: '#FFE8E8',
        Yellow: '#A0A000',
        LightYellow: '#A0A060',
        Green: '#00A000',
        LightGreen: '#60A0A0'
    };

    public override readonly FontStyle: IThemeFontStyle = {
        FontFamily: "Roboto",
        Tiny: "8px",
        ExtraSmall: "10px",
        Small: "12px",
        SmallPlus: "13px",
        Medium: "14px",
        MediumPlus: "15px",
        Large: "18px",
        ExtraLarge: "20px",
        ExtraLargePlus: "21px",
        ExtraExtraLarge: "24px",
        ExtraExtraLargePlus: "25px",
        SuperLarge: "36px",
        Glyph1x: "16px",
    }

    public override readonly Layout: IThemeLayout = {
        StandardBorder: "1px",
        StandardBorderRadius: "2px",
        ControlSpacing: "10px",
        GridSpacing: "7px",
    }
}