import { CanisterControllerProps, CanisterController } from './controller';
import { authClient } from '../authClient';

export interface AuthCanisterControllerProps extends Omit<CanisterControllerProps, 'agent'> {}

export class AuthCanisterController<T, Children = T> extends CanisterController<T, Children> {
  constructor(props: AuthCanisterControllerProps) {
		super({
			...props,
			agent: authClient.agent,
		});
  }
}

