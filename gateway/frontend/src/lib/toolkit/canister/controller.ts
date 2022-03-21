import { HttpAgent } from '@dfinity/agent';
import * as mobx from 'mobx';
import { Canister, CanisterProps } from './canister';

export interface CanisterControllerProps extends Omit<CanisterProps, 'agent'> {
  agent: HttpAgent | null;
}

export class CanisterController<T, Children = T> extends Canister<T> {
  public children: Record<string, CanisterController<Children>> = {};

  constructor(props: CanisterControllerProps) {
    super({ ...props, agent: props.agent || new HttpAgent() });

    mobx.makeObservable(this, {
      children: mobx.observable,
      childrenArr: mobx.computed,
      createChild: mobx.action,
    });

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

  get childrenArr() {
    return Object.values(this.children);
  }

  createChild = (props: CanisterControllerProps) => {
    const canister = new CanisterController<Children>(props);

    this.children = {
      ...this.children,
      [props.canisterId]: canister,
    };

    return canister;
  };

  removeChild = (canisterId: string) => {
    const { [canisterId]: omitted, ...children } = this.children;

    this.children = children;

    return omitted;
  };
}
