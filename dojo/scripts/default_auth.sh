#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

echo "Authorizing models..."

export WORLD_ADDRESS="0x6d8b7e2306efa1e02bdb4d92c2c76d2bf1c5ba08544f6f5221e1030092312b8";
export CONTRACT_ADDRESS="0x281c6928d199cbf7235c2d6840402336021003ecbdaa4e2e6396c96142bcd31";

# enable system -> model authorizations
MODELS=("Chamber" "Map" "State" "Tile" "Score" )
for model in ${MODELS[@]}; do
    sozo auth writer --world $WORLD_ADDRESS $model $CONTRACT_ADDRESS
    # SLOT
    # sozo auth writer --world $WORLD_ADDRESS $model $CONTRACT_ADDRESS --rpc-url https://api.cartridge.gg/x/underdark/katana --account-address 0x1ea3a2c42fa9e202e503d44323506745def44b87ad78742a8ce009b31c9ee84
done


echo "Default authorizations have been successfully set."