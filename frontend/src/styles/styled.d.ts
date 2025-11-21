import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        colors: {
            primary: string;
            primaryDark: string;
            secondary: string;
            background: string;
            surface: string;
            surfaceLight: string;
            text: string;
            textSecondary: string;
            textMuted: string;
            border: string;
            success: string;
            warning: string;
            error: string;
        };
        breakpoints: {
            mobile: string;
            tablet: string;
            desktop: string;
        };
        spacing: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            xxl: string;
        };
        borderRadius: {
            sm: string;
            md: string;
            lg: string;
        };
    }
}