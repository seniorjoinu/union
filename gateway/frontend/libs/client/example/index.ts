import { Principal } from '@dfinity/principal';
import { UnionWalletClient } from '../src';

let client: UnionWalletClient | null = null;

document.addEventListener('DOMContentLoaded', () => {
  const provider = document.querySelector('#provider') as HTMLInputElement;
  const authBtn = document.querySelector('#auth') as HTMLInputElement;
  const executeBtn = document.querySelector('#execute') as HTMLInputElement;
  const executeCloseBtn = document.querySelector('#execute-close') as HTMLInputElement;

  provider.value = localStorage.getItem('_provider') || '';

  provider.addEventListener('change', (event: any) => {
    localStorage.setItem('_provider', event.target.value);
  });

  executeBtn.addEventListener('click', execute);
  executeCloseBtn.addEventListener('click', executeClose);
  authBtn.addEventListener('click', auth);

  getAuth();
});

const executeClose = () => {
  client = new UnionWalletClient({
    ...getData(),
  });

  client.execute(
    {
      title: 'Sample empty program',
      description: 'Make sample empty program from example page',
      authorization_delay_nano: BigInt(100),
      program: { Empty: null },
    },
    { after: 'close' },
  );
};

const execute = () => {
  client = new UnionWalletClient({
    ...getData(),
  });

  client.execute({
    title: 'Sample empty program',
    description: 'Make sample empty program from example page',
    authorization_delay_nano: BigInt(100),
    program: { Empty: null },
  });
};

const auth = async () => {
  client = new UnionWalletClient({
    ...getData(),
  });

  const result = await client.login({ principal: Principal.from('aaaaa-aa') }, { after: 'close' });
  console.log('result', result);

  getAuth();
};

const getAuth = async () => {
  try {
    client = new UnionWalletClient({
      ...getData(),
    });

    const authorized = await client.isAuthorized();
    document.querySelector('#status')!.innerHTML = authorized ? 'Authorized!' : 'Not authorized';
  } catch (_) {}
};

const getData = () => ({
  providerUrl: (localStorage.getItem('_provider') || 'http://localhost:8000').trim(),
});
