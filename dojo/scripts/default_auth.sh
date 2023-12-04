#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

echo "Authorizing models..."

export WORLD_ADDRESS="0x2d6bcc12cbb460243b73a4c937faf00ad2d071d899f40dfc9182843712f9c77";
export CONTRACT_ADDRESS="0x32361a725c7fba5d9265db4569942ce845145da695f54c05bea24eda993b1b3";

# enable system -> model authorizations
MODELS=("Chamber" "Map" "State" "Tile" "Score" )
for model in ${MODELS[@]}; do
    sozo auth writer --world $WORLD_ADDRESS $model $CONTRACT_ADDRESS
    # SLOT
    # sozo auth writer --world $WORLD_ADDRESS $model $CONTRACT_ADDRESS --rpc-url https://api.cartridge.gg/x/underdark/katana --account-address 0x4e9c35bb113eaf274457edb2473437b02fe636f14c477aa110ba8d3626d3282
done


echo "Default authorizations have been successfully set."