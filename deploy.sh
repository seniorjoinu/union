echo "Start deploy infrastructure"
echo "Deploy deployer"
cd deployer-backend
rm -rf ./.dfx/local
dfx deploy
echo "Deployer deployed"
cd ../

echo "Build wallet"
cd wallet-backend
dfx build --all --check
cd ..
echo "Wallet built"

echo "Deploy internet identity"
cd gateway/frontend
git clone git@github.com:dfinity/internet-identity.git || (echo "Internet identity exists. Pulling" && cd ./internet-identity && git pull && cd ../)
cd ./internet-identity
rm -rf ./.dfx
npm i
echo "Deploy Internet identity"
II_FETCH_ROOT_KEY=1 II_DUMMY_CAPTCHA=1 II_DUMMY_AUTH=1 dfx deploy --no-wallet --argument '(null)'
dfx canister call internet_identity init_salt
echo "Internet-identity here http://localhost:8000?canisterId=$(dfx canister id internet_identity)"
INTERNET_IDENTITY_CANISTER_ID=$(dfx canister id internet_identity)
cd ../../../

echo "Deploy frontend"
cd gateway/frontend/gateway
rm -rf ./.dfx/local
yarn
dfx deploy
echo "http://localhost:8000?canisterId=$(dfx canister id union-wallet-frontend)"
echo "Frontend deployed"
cd ../../