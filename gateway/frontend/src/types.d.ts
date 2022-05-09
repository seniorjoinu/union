import 'styled-components';
import { ComponentsTheme } from '@union/components';

declare module 'styled-components' {
  export interface DefaultTheme extends ComponentsTheme {}
}
