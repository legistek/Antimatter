import { createTheme, getTheme, loadTheme, Link } from '@fluentui/react';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { registerIcons } from '@fluentui/react/lib/Styling';
import { Style } from '@antimatterjs/positron';

const theme = createTheme({
    // You can also modify certain other properties such as fontWeight if desired
    //defaultFontStyle: { fontFamily: 'Roboto' },
    palette: {
        themePrimary: '#2e70e0',
        themeLighterAlt: '#f6f9fe',
        themeLighter: '#dae6fa',
        themeLight: '#bcd1f6',
        themeTertiary: '#a1b6e3',
        themeSecondary: '#2e70e0',
        themeDarkAlt: '#0056b8',
        themeDark: '#0056b8',
        themeDarker: '#1e295b',
        neutralLighterAlt: '#f0f1f5',
        neutralLighter: '#f0f1f5',
        neutralLight: '#d7d9e1',
        neutralQuaternaryAlt: '#d7d9e1',
        neutralQuaternary: '#594747',
        neutralTertiaryAlt: '#494955',
        neutralTertiary: '#a0a0a0',
        neutralSecondary: '#606060',
        neutralPrimaryAlt: '#101010',
        neutralPrimary: '#101010',
        neutralDark: '#101010',
        black: '#000000',
        white: '#ffffff',
    }
});

registerIcons(
    {
        fontFace: {
            fontFamily: "IconFont",
        },
        icons: Style.CreateIconSet(0xE900, 0xF10D)
        //{
        //    'ThumbsUp': '\uE902',
        //    'ThumbsDown': '\uE901',
        //    'E90D': '\uE90D',
        //}
    })
initializeIcons();
loadTheme(theme);