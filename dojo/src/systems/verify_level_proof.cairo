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
    moves_count: usize,
) -> u128 {

    // let location: Location = LocationTrait::from_id(location_id);

    let map: Map = get!(world, location_id, (Map));
    let bitmap: u256 = map.bitmap;
    let entry: u8 = map.west;
    let exit: u8 = map.east;

    let mut win: bool = verify_map(bitmap, entry, exit, proof, moves_count);

    //---------------------
    // Save map state
    //

    let wins: u8 = if (win) { 1 } else { 0 };

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

fn verify_map(
    bitmap: u256,
    entry: u8,
    exit: u8,
    proof: u256,
    moves_count: usize,
) -> bool {

    // get all the moves from the proof big number
    let mut moves: Array<u8> = unpack_proof_moves(proof, moves_count);

    let mut win: bool = false;

    // reproduce moves step by step
    let mut pos: u8 = entry;
    let mut i = 0;
    loop {
        if(i == moves.len()) { break; }
        let move: u8 = *moves[i];
        if (move < 4) { // Dir::North .. Dir::South
            let dir: Option<Dir> = move.try_into();
            let pos_tile: usize = Bitmap::move_tile(pos.into(), dir.unwrap());
            pos = pos_tile.try_into().unwrap();
            if (pos == exit) {
                win = true;
                pos.print();
                '---win!!!'.print();
                break;
            }
            if (Bitmap::is_set_tile(bitmap, pos_tile) == false) {
                // its a wall, invalid move!
                pos.print();
                '---wall'.print();
                break;
            }
        }
        i += 1;
    };

    (win)
}


fn pack_proof_moves(moves: Array<u8>) -> u256 {
    let mut result: u256 = 0;
    let mut i: usize = 0;
    loop {
        if(i >= 64 || i >= moves.len()) { break; }
        let move: u8 = *moves[i];
        result = result | U256Bitwise::shl(move.into(), i*4);
        i += 1;
    };
    (result)
}

// one u256 proof can hold 64 4-bit moves
fn unpack_proof_moves(proof: u256, moves_count: usize) -> Array<u8> {
    let mut result: Array<u8> = ArrayTrait::new();
    let mut i: usize = 0;
    loop {
        if (i >= moves_count || i >= 64) { break; }
        let move: u8 = (U256Bitwise::shr(proof, i * 4) & 0b1111).try_into().unwrap();
        result.append(move);
        i += 1;
    };
    (result)
}
