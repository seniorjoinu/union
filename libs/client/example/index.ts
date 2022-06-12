import { Principal } from '@dfinity/principal';
import { UnionClient } from '../src';

let client: UnionClient | null = null;

document.addEventListener('DOMContentLoaded', () => {
  const provider = document.querySelector('#provider') as HTMLInputElement;
  const authBtn = document.querySelector('#auth') as HTMLInputElement;
  const executeBtn = document.querySelector('#execute') as HTMLInputElement;
  const executeCloseBtn = document.querySelector('#execute-close') as HTMLInputElement;
  const createVotingBtn = document.querySelector('#createVoting') as HTMLInputElement;

  provider.value = localStorage.getItem('_provider') || '';

  provider.addEventListener('change', (event: any) => {
    localStorage.setItem('_provider', event.target.value);
  });

  executeBtn.addEventListener('click', execute);
  executeCloseBtn.addEventListener('click', executeClose);
  createVotingBtn.addEventListener('click', createVoting);
  authBtn.addEventListener('click', auth);

  getAuth();
});

const executeClose = () => {
  client = new UnionClient({
    ...getData(),
  });

  client.execute(
    {
      choices: [
        {
          name: 'Sample empty program',
          description: 'Make sample empty program from example page',
          program: {
            RemoteCallSequence: [
              {
                endpoint: {
                  canister_id: Principal.from('aaaaa-aa'),
                  method_name: 'create_canister',
                },
                cycles: BigInt(0),
                args: { Encoded: [] },
              },
            ],
          },
        },
      ],
    },
    { after: 'close' },
  );
};

const execute = () => {
  client = new UnionClient({
    ...getData(),
  });

  client.execute({
    choices: [
      {
        name: 'Sample empty program',
        description: 'Make sample empty program from example page',
        program: {
          RemoteCallSequence: [
            {
              endpoint: {
                canister_id: Principal.from('aaaaa-aa'),
                method_name: 'create_canister',
              },
              cycles: BigInt(0),
              args: { Encoded: [] },
            },
          ],
        },
      },
    ],
  });
};

const createVoting = () => {
  client = new UnionClient({
    ...getData(),
  });

  client.createVoting({
    voting: {
      name: 'Sample voting',
      description: 'Sample voting description',
      winners_need: 1,
    },
    choices: [
      {
        name: 'Sample voting choice',
        description: 'Make sample empty program from example page',
        program: {
          RemoteCallSequence: [
            {
              endpoint: {
                canister_id: Principal.from('aaaaa-aa'),
                method_name: 'create_canister',
              },
              cycles: BigInt(0),
              args: { Encoded: [] },
            },
          ],
        },
      },
    ],
  });
};

const auth = async () => {
  client = new UnionClient({
    ...getData(),
  });

  const result = await client.login({ principal: Principal.from('aaaaa-aa') }, { after: 'close' });
  console.log('result', result);

  getAuth();
};

const getAuth = async () => {
  try {
    client = new UnionClient({
      ...getData(),
    });

    const authorized = await client.isAuthorized();
    document.querySelector('#status')!.innerHTML = authorized ? 'Authorized!' : 'Not authorized';
  } catch (_) {}
};

const getData = () => ({
  providerUrl: (localStorage.getItem('_provider') || 'http://localhost:8000').trim(),
});
