use debug::PrintTrait;
use array::ArrayTrait;
use traits::{Into, TryInto};
use core::option::OptionTrait;

use starknet::{ContractAddress, get_caller_address};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

use underdark::models::chamber::{Map, State};
use underdark::models::tile::{Tile};
// use underdark::types::location::{Location, LocationTrait};
use underdark::types::dir::{Dir, DirTrait};
use underdark::utils::bitwise::{U256Bitwise};
use underdark::utils::bitmap::{Bitmap};


fn verify_level_proof(world: IWorldDispatcher,
    location_id: u128,
    proof: u256,
) -> u128 {

    // let location: Location = LocationTrait::from_id(location_id);

    let map: Map = get!(world, location_id, (Map));
    let bitmap: u256 = map.bitmap;
    let entry: usize = map.west.into();
    let exit: usize = map.east.into();

    // get all the moves from the proof big number
    let mut moves: Array<u8> = ArrayTrait::new();
    let mut i: usize = 0;
    loop {
        if (i >= 256) { break; }
        let move: u8 = (U256Bitwise::shr(proof, i) & 0b1111).try_into().unwrap();
        if (move == 0x0) { break; }
        moves.append(move);
        i += 4;
    };

    let mut win: bool = false;

    // reproduce moves step by step
    let pos: usize = entry;
    i = 0;
    loop {
        if(i == moves.len()) { break; }
        let move: u8 = *moves[i];
        if (move <= 4) {
            let dir: Option<Dir> = (move - 1).try_into();
            let pos = Bitmap::move_tile(i, dir.unwrap());
            if (pos == exit) {
                win = true;
                break;
            }
            if (Bitmap::is_set_tile(bitmap, pos) == false) {
                // its a wall, invalid move!
                break;
            }
        }
        i += 1;
    };

    let wins: u8 = if (win) { 1 } else { 0 };


    //---------------------
    // Save map state
    //
    set!(world, (
        State {
            location_id,
            light: 0,
            threat: 0,
            wealth: 0,
            wins,
        },
    ) );

    location_id
}
