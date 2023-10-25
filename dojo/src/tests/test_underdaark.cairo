#[cfg(test)]
mod tests {
    use core::traits::Into;
    use array::ArrayTrait;
    use debug::PrintTrait;

    use dojo::world::{IWorldDispatcherTrait, IWorldDispatcher};

    use underdark::core::seeder::{make_seed, make_underseed};
    use underdark::systems::verify_level_proof::{verify_map, pack_proof_moves, unpack_proof_moves};
    use underdark::core::randomizer::{randomize_monsters,randomize_slender_duck,randomize_dark_tar};
    use underdark::core::binary_tree::{binary_tree_pro};
    use underdark::models::chamber::{Chamber, Map, Score};
    use underdark::types::location::{Location, LocationTrait};
    use underdark::types::dir::{Dir, DirTrait, DIR};
    use underdark::types::doors::{Doors};
    use underdark::types::tile_type::{TileType, TILE};
    use underdark::utils::string::{concat, join};
    use underdark::utils::bitwise::{U256Bitwise};
    use underdark::utils::bitmap::{Bitmap};
    use underdark::tests::utils::utils::{
        setup_world,
        start_level_get_chamber,
        execute_finish_level,
        get_world_Chamber,
        get_world_Map,
        get_world_Score,
        get_world_Doors_as_Tiles,
    };

    fn assert_doors(prefix: felt252, world: IWorldDispatcher, location_id: u128) {
        let tiles: Doors = get_world_Doors_as_Tiles(world, location_id);
        assert(tiles.north == 0, join(prefix, 'north'));
        assert(tiles.east == TILE::EXIT, join(prefix, 'east'));
        assert(tiles.west == TILE::ENTRY, join(prefix, 'west'));
        assert(tiles.south == 0, join(prefix, 'south'));
        assert(tiles.over == 0, join(prefix, 'over'));
        assert(tiles.under == 0, join(prefix, 'under'));
    }

    #[test]
    #[available_gas(1_000_000_000_000)]
    fn test_doors_connections() {
        let (world, system) = setup_world();
        let game_id: u32 = 1;

        // 1st chamber: entry from above, all other locked
        let chamber1: Chamber = start_level_get_chamber(world, system, game_id, 1, 'seed', 0);
        // assert_doors('entry', world, chamber1.location_id, TILE::LOCKED_EXIT, TILE::LOCKED_EXIT, TILE::LOCKED_EXIT, TILE::LOCKED_EXIT, TILE::ENTRY, 0);
        assert_doors('entry', world, chamber1.location_id);

        // move WEST
        let chamber2 = start_level_get_chamber(world, system, game_id, 2, 'binary_tree_classic', 0);
        assert_doors('level_2', world, chamber2.location_id);

        // move NORTH
        let chamber3 = start_level_get_chamber(world, system, game_id, 3, 'seed', 0);
        assert_doors('level_3', world, chamber3.location_id);

        // move EAST
        let chamber4 = start_level_get_chamber(world, system, game_id, 4, 'seed', 0);
        assert_doors('level_4', world, chamber4.location_id);
    }

    #[test]
    #[available_gas(100_000_000)]
    fn test_bitmap_move_tile() {
        assert(Bitmap::move_tile(0, Dir::North) == 0, '0_North');
        assert(Bitmap::move_tile(0, Dir::East) == 1, '0_East');
        assert(Bitmap::move_tile(0, Dir::West) == 0, '0_West');
        assert(Bitmap::move_tile(0, Dir::South) == 16, '0_South');
        assert(Bitmap::move_tile(0, Dir::Over) == 0, '0_Over');
        assert(Bitmap::move_tile(0, Dir::Under) == 0, '0_Under');

        assert(Bitmap::move_tile(15, Dir::North) == 15, '15_North');
        assert(Bitmap::move_tile(15, Dir::East) == 15, '15_East');
        assert(Bitmap::move_tile(15, Dir::West) == 14, '15_West');
        assert(Bitmap::move_tile(15, Dir::South) == 31, '15_South');
        assert(Bitmap::move_tile(15, Dir::Over) == 15, '15_Over');
        assert(Bitmap::move_tile(15, Dir::Under) == 15, '15_Under');

        assert(Bitmap::move_tile(240, Dir::North) == 224, '240_North');
        assert(Bitmap::move_tile(240, Dir::East) == 241, '240_East');
        assert(Bitmap::move_tile(240, Dir::West) == 240, '240_West');
        assert(Bitmap::move_tile(240, Dir::South) == 240, '240_South');
        assert(Bitmap::move_tile(240, Dir::Over) == 240, '240_Over');
        assert(Bitmap::move_tile(240, Dir::Under) == 240, '240_Under');

        assert(Bitmap::move_tile(255, Dir::North) == 239, '255_North');
        assert(Bitmap::move_tile(255, Dir::East) == 255, '255_East');
        assert(Bitmap::move_tile(255, Dir::West) == 254, '255_West');
        assert(Bitmap::move_tile(255, Dir::South) == 255, '255_South');
        assert(Bitmap::move_tile(255, Dir::Over) == 255, '255_Over');
        assert(Bitmap::move_tile(255, Dir::Under) == 255, '255_Under');

        assert(Bitmap::move_tile(100, Dir::North) == 84, '100_North');
        assert(Bitmap::move_tile(100, Dir::East) == 101, '100_East');
        assert(Bitmap::move_tile(100, Dir::West) == 99, '100_West');
        assert(Bitmap::move_tile(100, Dir::South) == 116, '100_South');
        assert(Bitmap::move_tile(100, Dir::Over) == 100, '100_Over');
        assert(Bitmap::move_tile(100, Dir::Under) == 100, '100_Under');
    }

    #[test]
    #[available_gas(1_000_000_000_000)]
    fn test_pack_unpack_proof() {
        let moves_1 = array![1, 2, 4, 8, 0];
        assert(*moves_1[0] == 1, '[0]');
        assert(*moves_1[1] == 2, '[1]');
        assert(*moves_1[2] == 4, '[2]');
        assert(*moves_1[3] == 8, '[3]');
        assert(*moves_1[4] == 0, '[4]');
        let proof_1 = pack_proof_moves(moves_1.clone());
        assert(proof_1 == 0b1000_0100_0010_0001, 'proof_1');
        assert(proof_1 == 0x8421, 'proof_1');
        let moves_2 = unpack_proof_moves(proof_1, moves_1.len());
        assert(moves_1.len() == moves_2.len(), 'len');
        assert(*moves_1[0] == *moves_2[0], '*[0]');
        assert(*moves_1[1] == *moves_2[1], '*[1]');
        assert(*moves_1[2] == *moves_2[2], '*[2]');
        assert(*moves_1[3] == *moves_2[3], '*[3]');
        assert(*moves_1[4] == *moves_2[4], '*[4]');
    }

    #[test]
    #[available_gas(1_000_000_000_000)]
    fn test_verify_map() {
        let (world, system) = setup_world();
        let bitmap: u256 = 0xffffffffffffffffffffffff000000030002f80278027ffe7ffe7ffe7ffe7ffe;
        let entry: u8 = 144;
        let exit: u8 = 127;

        {
            let proof = array![];
            let win: bool = verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
            assert(win == false, 'no_proof');
        }

        {
            let proof = array![DIR::EAST, DIR::EAST];
            let win: bool = verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
            assert(win == false, 'short_proof');
        }

        {
            let proof = array![DIR::NORTH];
            let win: bool = verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
            assert(win == false, 'north_wall');
        }

        // good proof
        {
            let proof = array![
                DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
                DIR::SOUTH, DIR::SOUTH,
                DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
                DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH,
                DIR::EAST
            ];
            let win: bool = verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
            assert(win == true, 'good_proof');
        }

        // ignore edges
        {
            let proof = array![
                DIR::WEST, // ignore
                DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
                DIR::SOUTH, DIR::SOUTH,
                DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
                DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH,
                DIR::EAST
            ];
            let win: bool = verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
            assert(win == true, 'ignore_edges');
        }

        // circles
        {
            let proof = array![
                DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
                DIR::SOUTH, DIR::SOUTH,
                DIR::SOUTH, DIR::WEST, DIR::NORTH, DIR::EAST, // circle
                DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
                DIR::SOUTH, DIR::NORTH, // circle
                DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH,
                DIR::EAST
            ];
            let win: bool = verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
            assert(win == true, 'circles');
        }

        {
            let proof = array![
                DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
                DIR::SOUTH, DIR::SOUTH,
                DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
                DIR::EAST, // wall
                DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH,
                DIR::EAST
            ];
            let win: bool = verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
            assert(win == false, 'wall_in_the_way');
        }
    }

    #[test]
    #[available_gas(1_000_000_000_000)]
    fn test_score() {
        let (world, system) = setup_world();
        let player = starknet::get_caller_address();
        let game_id: u32 = 1;

        let chamber1: Chamber = start_level_get_chamber(world, system, game_id, 1, 'empty', 0);
        let chamber2 = start_level_get_chamber(world, system, game_id, 2, 'empty', 0);
        
        // check test if chamber is correct
        let map: Map = get_world_Map(world, chamber2.location_id);
        assert(map.west == 80, 'bad_entry');
        assert(map.east == 95, 'bad_exit');

        let mut score: Score = get_world_Score(world, chamber2.location_id, player);
        assert(score.moves == 0, 'moves=0');

        let proof_best = array![
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
        ];
        let proof_mid = array![
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
            DIR::SOUTH, DIR::NORTH,
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
        ];
        let proof_low = array![
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
            DIR::SOUTH, DIR::SOUTH, DIR::NORTH, DIR::NORTH,
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
        ];
        let proof_low_packed: u256 = pack_proof_moves(proof_low.clone());
        let mut win: bool = verify_map(map.bitmap, map.west, map.east, proof_low_packed, proof_low.len());
        assert(win == true, 'proof_low');
        // execute
        execute_finish_level(world, system, chamber2.location_id, proof_low_packed, proof_low.len());
        score = get_world_Score(world, chamber2.location_id, player);
        assert(score.moves == proof_low.len(), 'moves=proof_low');

        let proof_best_packed: u256 = pack_proof_moves(proof_best.clone());
        win = verify_map(map.bitmap, map.west, map.east, proof_best_packed, proof_best.len());
        assert(win == true, 'proof_best');
        // execute
        execute_finish_level(world, system, chamber2.location_id, proof_best_packed, proof_best.len());
        score = get_world_Score(world, chamber2.location_id, player);
        assert(score.moves == proof_best.len(), 'moves=proof_best');

        let proof_mid_packed: u256 = pack_proof_moves(proof_mid.clone());
        win = verify_map(map.bitmap, map.west, map.east, proof_mid_packed, proof_mid.len());
        assert(win == true, 'proof_mid');
        // execute
        execute_finish_level(world, system, chamber2.location_id, proof_mid_packed, proof_mid.len());
        score = get_world_Score(world, chamber2.location_id, player);
        assert(score.moves == proof_best.len(), 'moves=proof_best'); // dir not overrite!
    }


    #[test]
    #[available_gas(1_000_000_000_000)]
    fn test_mosnters_seed() {
        let mut rnd = make_seed(1234, 1234);
        let level_number: u32 = 1;
        let bitmap: u256 = binary_tree_pro(rnd, Dir::West);

        // randomize_monsters,randomize_slender_duck,randomize_dark_tar
        let mut i: usize = 0;
        loop {
            if (i >= 10) { break; }
            let monsters: u256 = randomize_monsters(ref rnd, bitmap, level_number);
            let monster_count: usize = U256Bitwise::count_bits(monsters);
            assert(monster_count != 0, 'monster_count');
            // monster_count.print();
            i += 1;
        };
   }
}