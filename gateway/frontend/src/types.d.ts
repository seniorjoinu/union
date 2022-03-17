import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      dark: {
        900: string;
        800: string;
      };
      grey: {
        10: string;
        90: string;
        100: string;
      };
    };
    borderRadius: number;
  }
}
