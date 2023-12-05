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
    # sozo auth writer --world $WORLD_ADDRESS $model 0x3da4bf86342c340fd1dd590cd5505248af77006db7d74912ac50d7e7374496b --rpc-url https://api.cartridge.gg/x/underdark/katana --account-address 0x62dbeffaf8e06b6d92d7f81771db0885e369b3e4f1e8bec2c2d224447f6350d
done


echo "Default authorizations have been successfully set."