#[cfg(test)]
mod tests {
    use core::traits::Into;
    use array::ArrayTrait;
    use debug::PrintTrait;

    use dojo::world::{IWorldDispatcherTrait, IWorldDispatcher};

    use underdark::core::seeder::{make_seed, make_underseed};
    use underdark::systems::verify_level_proof::{verify_map, pack_proof_moves, unpack_proof_moves};
    use underdark::core::randomizer::{randomize_monsters};
    use underdark::core::binary_tree::{binary_tree_pro};
    use underdark::models::chamber::{Chamber, Map, Score};
    use underdark::types::location::{Location, LocationTrait};
    use underdark::types::dir::{Dir, DirTrait, DIR};
    use underdark::types::doors::{Doors};
    use underdark::types::tile_type::{TileType, TILE};
    use underdark::types::constants::{REALM_ID, MANOR_COORD};
    use underdark::utils::bitwise::{U256Bitwise};
    use underdark::utils::bitmap::{Bitmap};
    use underdark::utils::string::{String};
    use underdark::tests::utils::utils::{
        setup_world,
        generate_level_get_chamber,
        execute_finish_level,
        get_world_Chamber,
        get_world_Map,
        get_world_Score,
        get_world_Doors_as_Tiles,
        get_world_Tile_type,
    };

    fn assert_doors(prefix: felt252, world: IWorldDispatcher, location_id: u128) {
        let tiles: Doors = get_world_Doors_as_Tiles(world, location_id);
        assert(tiles.north == 0, String::join(prefix, 'north'));
        assert(tiles.east == 0, String::join(prefix, 'east'));
        assert(tiles.west == 0, String::join(prefix, 'west'));
        assert(tiles.south == 0, String::join(prefix, 'south'));
        assert(tiles.over == TILE::ENTRY, String::join(prefix, 'over'));
        assert(tiles.under == TILE::EXIT, String::join(prefix, 'under'));

        let map: Map = get_world_Map(world, location_id);
        let (x1, y1) = Bitmap::tile_to_xy(map.over.into());
        let (x2, y2) = Bitmap::tile_to_xy(map.under.into());
        assert(y1 == 0, String::join(prefix, 'entry_y'));
        assert(y2 == 15, String::join(prefix, 'exit_y'));
        assert(x1 > 0 && x1 < 15, String::join(prefix, 'entry_x'));
        assert(x2 > 0 && x2 < 15, String::join(prefix, 'exit_x'));
    }

    #[test]
    #[available_gas(1_000_000_000_000)]
    fn test_doors_connections() {
        let (world, system) = setup_world();
        let room_id: u16 = 1;

        // 1st chamber: entry from above, all other locked
        let chamber1: Chamber = generate_level_get_chamber(world, system, REALM_ID, MANOR_COORD, room_id, 1, 'seed', 0);
        // assert_doors('entry', world, chamber1.location_id, TILE::LOCKED_EXIT, TILE::LOCKED_EXIT, TILE::LOCKED_EXIT, TILE::LOCKED_EXIT, TILE::ENTRY, 0);
        assert_doors('entry', world, chamber1.location_id);

        // move WEST
        let chamber2 = generate_level_get_chamber(world, system, REALM_ID, MANOR_COORD, room_id, 2, 'binary_tree_classic', 0);
        assert_doors('level_2', world, chamber2.location_id);

        // move NORTH
        let chamber3 = generate_level_get_chamber(world, system, REALM_ID, MANOR_COORD, room_id, 3, 'seed', 0);
        assert_doors('level_3', world, chamber3.location_id);

        // move EAST
        let chamber4 = generate_level_get_chamber(world, system, REALM_ID, MANOR_COORD, room_id, 4, 'seed', 0);
        assert_doors('level_4', world, chamber4.location_id);
    }

    //
    // Proof packing
    //

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

    //
    // verify_map
    //
    const VERIFY_BITMAP: u256 = 0xffffffffffffffffffffffff000000030002f80278027ffe7ffe7ffe7ffe7ffe;
    const VERIFY_ENTRY: u8 = 144;
    const VERIFY_EXIT :u8 = 127;

    #[test]
    #[available_gas(1_000_000_000_000)]
    fn test_verify_map_wins() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);

        // good proof
        {
            let proof = array![
                DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
                DIR::SOUTH, DIR::SOUTH,
                DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
                DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH,
                DIR::EAST
            ];
            verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
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
            verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
        }

        // run in circles
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
            verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
        }
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Didnt find the exit!',))]
    fn test_verify_map_no_proof() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let proof = array![];
        verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Didnt find the exit!',))]
    fn test_verify_map_short_proof() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let proof = array![DIR::EAST, DIR::EAST];
        verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Hit a wall!',))]
    fn test_verify_map_wall() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let proof = array![DIR::NORTH];
        verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }
    
    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Hit a wall!',))]
    fn test_verify_map_hit_a_wall() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let proof = array![
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
            DIR::SOUTH, DIR::SOUTH,
            DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST, DIR::EAST,
            DIR::EAST, // wall
            DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH,
            DIR::EAST
        ];
        verify_map(bitmap, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }


    //
    // Score
    //
    #[test]
    #[available_gas(1_000_000_000_000)]
    fn test_score() {
        let (world, system) = setup_world();
        let player = starknet::get_caller_address();
        let room_id: u16 = 1;

        let chamber1: Chamber = generate_level_get_chamber(world, system, REALM_ID, MANOR_COORD, room_id, 1, 'empty', 0);
        let chamber2 = generate_level_get_chamber(world, system, REALM_ID, MANOR_COORD, room_id, 2, 'empty', 0);
        
        // check test if chamber is correct
        let map: Map = get_world_Map(world, chamber2.location_id);
        assert(map.over == 8, 'bad_over');
        assert(map.under == 248, 'bad_under');
        assert(get_world_Tile_type(world, chamber2.location_id, map.over) == TILE::ENTRY, 'bad_entry');
        assert(get_world_Tile_type(world, chamber2.location_id, map.under) == TILE::EXIT, 'bad_exit');
        
        let mut score: Score = get_world_Score(world, chamber2.location_id, player);
        assert(score.moves == 0, 'moves=0');

        let proof_best = array![
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
        ];
        let proof_mid = array![
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::WEST, DIR::EAST,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
        ];
        let proof_low = array![
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::WEST, DIR::WEST, DIR::EAST, DIR::EAST,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
        ];
        let proof_low_packed: u256 = pack_proof_moves(proof_low.clone());
        let mut win: bool = verify_map(map.bitmap, map.over, map.under, proof_low_packed, proof_low.len());
        assert(win == true, 'proof_low');
        // execute
        execute_finish_level(world, system, chamber2.location_id, proof_low_packed, proof_low.len());
        score = get_world_Score(world, chamber2.location_id, player);
        assert(score.location_id == chamber2.location_id, 'moves=player');
        assert(score.player == player, 'moves=player');
        assert(score.moves == proof_low.len(), 'moves=proof_low');

        let proof_best_packed: u256 = pack_proof_moves(proof_best.clone());
        win = verify_map(map.bitmap, map.over, map.under, proof_best_packed, proof_best.len());
        assert(win == true, 'proof_best');
        // execute
        execute_finish_level(world, system, chamber2.location_id, proof_best_packed, proof_best.len());
        score = get_world_Score(world, chamber2.location_id, player);
        assert(score.moves == proof_best.len(), 'moves=proof_best');

        let proof_mid_packed: u256 = pack_proof_moves(proof_mid.clone());
        win = verify_map(map.bitmap, map.over, map.under, proof_mid_packed, proof_mid.len());
        assert(win == true, 'proof_mid');
        // execute
        execute_finish_level(world, system, chamber2.location_id, proof_mid_packed, proof_mid.len());
        score = get_world_Score(world, chamber2.location_id, player);
        assert(score.moves == proof_best.len(), 'moves=proof_best'); // dir not overrite!
    }


    //
    // Monsters
    //
    
    #[test]
    #[available_gas(1_000_000_000_000)]
    fn test_monsters_seed() {
        let mut rnd = make_seed(1234);
        let bitmap: u256 = binary_tree_pro(rnd);

        // randomize_monsters,randomize_slender_duck,randomize_dark_tar
        let mut i: u16 = 0;
        loop {
            if (i >= 10) { break; }
            let level_number: u16 = i + 1;
            let (monsters, slender_duck, dark_tar): (u256, u256, u256) = randomize_monsters(ref rnd, bitmap, 0x0, level_number);
            let monster_count: usize = U256Bitwise::count_bits(monsters);
            assert(monster_count != 0, 'monster_count');
            // monster_count.print();
            i += 1;
        };
   }

    #[test]
    #[available_gas(1_000_000_000_000)]
    fn test_monsters_in_walls() {
        let (world, system) = setup_world();
        let room_id: u16 = 1;

        let mut i: u16 = 0;
        loop {
            if (i >= 10) { break; }
            // 1st chamber: entry from above, all other locked
            let level_number: u16 = i + 1;
            let chamber1: Chamber = generate_level_get_chamber(world, system, REALM_ID, MANOR_COORD, room_id, level_number, 'binary_tree_classic', 0);
            let map1: Map = get_world_Map(world, chamber1.location_id);
            // no monsters wall overlaps
            assert((map1.bitmap & map1.monsters) == map1.monsters, 'monsters_in_wall');
            assert((map1.bitmap & map1.slender_duck) == map1.slender_duck, 'slender_duck_in_wall');
            assert((map1.bitmap & map1.dark_tar) == map1.dark_tar, 'dark_tar_in_wall');
            // no monsters overlap
            assert((map1.monsters & map1.slender_duck) == 0, 'monsters & slender_duck');
            assert((map1.monsters & map1.dark_tar) == 0, 'monsters & dark_tar');
            assert((map1.dark_tar & map1.slender_duck) == 0, 'dark_tar & slender_duck');
            i += 1;
        };
    }

}