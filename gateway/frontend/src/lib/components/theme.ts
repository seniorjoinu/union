export const theme: ComponentsTheme = {
  colors: {
    dark: '#0F0F0F',
    light: '#FAFAFA',
    // dark: '#FAFAFA',
    // light: '#0F0F0F',

    grey: '#A1A1A1',
    lightGrey: '#dadada',
    yellow: '#FCD621',
    red: '#ED4040',
    orange: '#F28221',
    pink: '#FCADB8',
    violet: '#7A52CC',
    blue: '#4F7DCF',
    lightBlue: '#4F7DCF',
    green: '#73CC57',
  },
};

export interface ComponentsTheme {
  colors: {
    dark: string;
    light: string;
    grey: string;
    lightGrey: string;
    yellow: string;
    red: string;
    orange: string;
    pink: string;
    violet: string;
    blue: string;
    lightBlue: string;
    green: string;
  };
}
