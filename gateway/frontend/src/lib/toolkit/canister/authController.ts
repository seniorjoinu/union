import { authClient } from '../authClient';
import { CanisterControllerProps, CanisterController } from './controller';

export interface AuthCanisterControllerProps extends Omit<CanisterControllerProps, 'agent'> {}

export class AuthCanisterController<T> extends CanisterController<T> {
  constructor(props: AuthCanisterControllerProps) {
    super({
      ...props,
      agent: authClient.agent,
    });
  }
}
