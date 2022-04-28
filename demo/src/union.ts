import { UnionWalletClient } from '@union-wallet/client';

console.log(UnionWalletClient);

// export const initUnionWalletClient = () => {
// 	const client = new UnionWalletClient({
// 		gateway,
// 		wallet,
// 		providerUrl,
// 	});
// };

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: flex-start;
// `;

// export const Playground = ({
//   gateway: gatewayStr,
//   wallet: walletStr,
//   providerUrl,
// }: {
//   gateway: string;
//   wallet: string;
//   providerUrl: string;
// }) => {
//   const [client, setClient] = React.useState<UnionWalletClient | null>(null);

//   const wallet = React.useMemo(() => checkPrincipal(walletStr), [walletStr]);
//   const gateway = React.useMemo(() => checkPrincipal(gatewayStr), [gatewayStr]);

//   React.useEffect(() => {
//     if (!wallet || !gateway) {
//       setClient(null);
//       return;
//     }

//     const client = new UnionWalletClient({
//       gateway,
//       wallet,
//       providerUrl,
//     });

//     setClient(client);
//   }, [wallet, gateway, providerUrl, setClient]);

//   return (
//     <Container>
//       <button
//         onClick={() =>
//           client &&
//           client.execute(
//             {
//               title: 'Sample empty program',
//               description: 'Make sample empty program from storybook',
//               authorization_delay_nano: BigInt(100),
//               program: { Empty: null },
//             },
//             { after: 'close' },
//           )
//         }
//       >
//         Make SelfEmptyProgram with after close
//       </button>
//       <button
//         onClick={() =>
//           client &&
//           client.execute({
//             title: 'Sample empty program',
//             description: 'Make sample empty program from storybook',
//             authorization_delay_nano: BigInt(100),
//             program: { Empty: null },
//           })
//         }
//       >
//         Make SelfEmptyProgram without after close
//       </button>
//     </Container>
//   );
// };
