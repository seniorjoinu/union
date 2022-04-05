echo "Start deploy infrastructure"
echo "Deploy deployer"
cd deployer-backend
rm -rf ./.dfx/local
dfx deploy
echo "Deployer deployed"
cd ../../

echo "Build wallet"
cd wallet-backend
dfx build --all --check
cd ..
echo "Wallet built"

echo "Deploy frontend"
cd gateway/frontend
rm -rf ./.dfx/local
dfx deploy
# open http://localhost:8000?canisterId=$(dfx canister id union-wallet-frontend)
echo "Frontend deployed"
cd ../../