import { HttpAgent } from '@dfinity/agent';
import * as mobx from 'mobx';
import { Canister, CanisterProps } from './canister';

export interface CanisterControllerProps extends Omit<CanisterProps, 'agent'> {
  agent: HttpAgent | null;
}

export class CanisterController<T> extends Canister<T> {
  constructor(props: CanisterControllerProps) {
    super({ ...props, agent: props.agent || new HttpAgent() });

    mobx.makeObservable(this, {});

    const { agent } = props;

    if (agent) {
      this.initialize(agent);
    }

    mobx.reaction(
      () => agent,
      (agent) => {
        if (!agent) {
          return;
        }

        this.initialize(agent);
      },
    );
  }
}
