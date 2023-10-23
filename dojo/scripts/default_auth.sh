#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

echo "Authorizing models..."

export WORLD_ADDRESS="0x6150655e17345af3d45d23f9b1d04a4c5e485dfed5bf55cbd6f53063aaa42a";
export CONTRACT_ADDRESS="0x1ecc984f2f872bdadd43ab1762c87de3d445b8eb134e6b475f37f23e8a551a3";

# enable system -> model authorizations
MODELS=("Chamber" "Map" "State" "Tile" "Score" )
for model in ${MODELS[@]}; do
    sozo auth writer --world $WORLD_ADDRESS $model $CONTRACT_ADDRESS
    # SLOT
    # sozo auth writer --world $WORLD_ADDRESS $model $CONTRACT_ADDRESS --rpc-url https://api.cartridge.gg/x/underdark/katana --account-address 0x1ea3a2c42fa9e202e503d44323506745def44b87ad78742a8ce009b31c9ee84
done


echo "Default authorizations have been successfully set."