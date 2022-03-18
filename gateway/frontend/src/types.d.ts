import 'styled-components';
import { ComponentsTheme } from 'components';

declare module 'styled-components' {
  export interface DefaultTheme extends ComponentsTheme {}
}
