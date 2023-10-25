use debug::PrintTrait;
use array::ArrayTrait;
use traits::{Into, TryInto};
use core::option::OptionTrait;

use starknet::{ContractAddress, get_caller_address};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

use underdark::models::chamber::{Map, State, Score};
use underdark::models::tile::{Tile};
// use underdark::types::location::{Location, LocationTrait};
use underdark::types::dir::{Dir, DirTrait};
use underdark::utils::bitwise::{U256Bitwise};
use underdark::utils::bitmap::{Bitmap};



fn verify_level_proof(world: IWorldDispatcher,
    location_id: u128,
    caller: ContractAddress,
    proof: u256,
    moves_count: usize,
) -> u128 {

    // let location: Location = LocationTrait::from_id(location_id);

    let map: Map = get!(world, location_id, (Map));
    let bitmap: u256 = map.bitmap;
    let entry: u8 = map.west;
    let exit: u8 = map.east;

    verify_map(bitmap, entry, exit, proof, moves_count);

    //---------------------
    // Save map state
    //

    let score : Score = get!(world, (location_id, caller), (Score));
score.moves.print();
moves_count.print();
    if(score.moves == 0 || moves_count < score.moves) {
        'NEW SCORE'.print();
        set!(world, (Score {
            key_location_id: location_id,
            key_player: caller,
            location_id: location_id,
            player: caller,
            moves: moves_count,
        }));
    }

    let mut state : State = get!(world, location_id, (State));
    state.wins += 1;
    set!(world, (state) );

    (location_id)
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

    // reproduce moves step by step
    let mut pos: u8 = entry;
    let mut i = 0;
    loop {
        assert(i < moves.len(), 'Didnt find the exit!');
        let move: u8 = *moves[i];
        // Moves in four directions, mapping Dir::North .. Dir::South
        if (move < 4) {
            let dir: Option<Dir> = move.try_into();
            let pos_tile: usize = Bitmap::move_tile(pos.into(), dir.unwrap());
            pos = pos_tile.try_into().unwrap();
            if (pos == exit) {
                break; // win!!
            }
            assert(Bitmap::is_set_tile(bitmap, pos_tile) == true, 'Hit a wall!');
        }
        i += 1;
    };

    (true)
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
