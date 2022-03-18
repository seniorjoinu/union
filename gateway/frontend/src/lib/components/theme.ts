export const theme: ComponentsTheme = {
  colors: {
    dark: {
      900: 'black',
      800: 'black',
    },
    grey: {
      10: 'grey',
      90: 'grey',
      100: 'grey',
    },
    primary: {
      master: {
        color: 'black',
        darker: 'black',
      },
    },
  },
  common: {
    borderRadius: '4px',
  },
};

export interface ComponentsTheme {
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
    primary: {
      master: {
        color: string;
        darker: string;
      };
    };
  };
  common: {
    borderRadius: string;
  };
}
