import { IThemeFontStyle, IThemePalette, Theme } from '../Theme'

export class PositronTheme extends Theme
{
    public override readonly Palette: IThemePalette = {
        ThemePrimary:  "red", //'#2e70e0',
        ThemeLighterAlt: '#f6f9fe',
        ThemeLighter: '#dae6fa',
        ThemeLight: '#bcd1f6',
        ThemeTertiary: '#a1b6e3',
        ThemeSecondary: '#2e70e0',
        ThemeDarkAlt: '#0056b8',
        ThemeDark: '#0056b8',
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
    };

    public override readonly FontStyle: IThemeFontStyle = {
        FontFamily: "Courier New",
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
        SuperLarge: "36px"
    }
}