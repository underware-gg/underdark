#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

echo "Authorizing models..."

export WORLD_ADDRESS="0x7006ea4fd2de52944def100605e48ba82b8c4d15a6bd5ef04fbc579d8b00076";
export CONTRACT_ADDRESS="0x32361a725c7fba5d9265db4569942ce845145da695f54c05bea24eda993b1b3";

# enable system -> model authorizations
MODELS=("Chamber" "Map" "State" "Tile" "Score" )
for model in ${MODELS[@]}; do
    sozo auth writer --world $WORLD_ADDRESS $model $CONTRACT_ADDRESS
    # SLOT
    # sozo auth writer --world $WORLD_ADDRESS $model $CONTRACT_ADDRESS --rpc-url https://api.cartridge.gg/x/underdark/katana --account-address 0x1ea3a2c42fa9e202e503d44323506745def44b87ad78742a8ce009b31c9ee84
done


echo "Default authorizations have been successfully set."