#[cfg(test)]
mod tests {
    use core::traits::Into;
    use array::ArrayTrait;
    use debug::PrintTrait;

    use dojo::world::{IWorldDispatcherTrait, IWorldDispatcher};

    use underdark::systems::verify_level_proof::{verify_map, pack_proof_moves, unpack_proof_moves};
    use underdark::models::chamber::{Chamber, Map, MapData, Score};
    use underdark::types::location::{Location, LocationTrait};
    use underdark::types::dir::{Dir, DirTrait, DIR};
    use underdark::types::tile_type::{TileType, TILE};
    use underdark::types::constants::{REALM_ID, MANOR_COORD};
    use underdark::utils::bitwise::{U256Bitwise};
    use underdark::utils::bitmap::{Bitmap, MASK};
    use underdark::utils::string::{String};
    use underdark::tests::utils::utils::{
        setup_world,
        make_map,
        generate_level_get_chamber,
        execute_finish_level,
        get_world_Chamber,
        get_world_Map,
        get_world_Score,
        get_world_Tile_type,
    };


    //
    // Verify light
    //

    const VERIFY_BITMAP: u256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff; // MASK::ALL
    const VERIFY_ENTRY: u8 = 8;     // (8, 0)  / 0x8
    const VERIFY_EXIT :u8 = 248;    // (8, 15) / 0xf8
    const VERIFY_CHEST: u8 = 32;     // (0, 2)  / 0x20

    fn _proof_best() -> Array<u8> {
        array![
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
        ]
        // runs out of light ar tile (8, 10) / 168 / 0xa8
    }

    #[test]
    #[available_gas(1_000_000_000)]
    fn test_no_light_no_problem() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0, 0, 0);
        let proof = _proof_best();
        let win = verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
        assert(win == true, 'Win!')
    }

    //
    // Chest
    //

    #[test]
    #[available_gas(1_000_000_000)]
    fn test_chest_found() {
        let (world, system) = setup_world();
        let divided_map = ~Bitmap::shift_down(MASK::TOP_ROW, 8);
        let chest_map = Bitmap::set_tile(0, VERIFY_CHEST.into());
        let (bitmap, entry, exit): (u256, u8, u8) = (divided_map, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0, 0, chest_map);
        let proof = array![
            DIR::WEST, DIR::WEST, DIR::WEST, DIR::WEST, DIR::WEST, DIR::WEST, DIR::WEST, DIR::WEST,
            DIR::SOUTH,
        ];
        let win = verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
        assert(win == true, 'Win!')
    }

    #[test]
    #[should_panic(expected:('Didnt find the exit!',))]
    #[available_gas(1_000_000_000)]
    fn test_chest_not_found() {
        let (world, system) = setup_world();
        let divided_map = ~Bitmap::shift_down(MASK::TOP_ROW, 8);
        let chest_map = Bitmap::set_tile(0, VERIFY_CHEST.into());
        let (bitmap, entry, exit): (u256, u8, u8) = (divided_map, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0, 0, chest_map);
        let proof = array![
            DIR::WEST, DIR::WEST, DIR::WEST, DIR::WEST, DIR::WEST, DIR::WEST, DIR::WEST, DIR::WEST,
            // DIR::SOUTH,
        ];
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }

    //
    // Monsters
    //

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Lost sanity!',))]
    fn test_monsters_all_over() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (MASK::ALL, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, MASK::ALL, 0, MASK::ALL, 0); // all monsters, all dark tar
        let proof = _proof_best();
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    // #[should_panic(expected:('Lost sanity!',))]
    fn test_monsters_on_the_side_ok() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (MASK::ALL, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0x140014001400140014001400140014001400140014001400140014001400140, 0, MASK::ALL, 0); // monsters column, all dark tar
        let proof = _proof_best();
        let win = verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
        assert(win == true, 'Win!')
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Lost sanity!',))]
    fn test_monsters_on_the_side_too_many() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (MASK::ALL, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0x140014001400140014001400140014001400140014001400140014001400140, 0, MASK::ALL, 0); // monsters column, all dark tar
        let proof = array![
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, // 5
            DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, // 11 + dark tar
            DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, // 11 + dark tar
            DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, // 11 + dark tar
            DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, // 11 + dark tar
            DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::NORTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, // 11 + dark tar
        ];
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }

    //
    // Slenderduck
    //

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_slendered_all() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, MASK::ALL, 0, 0);
        let proof = _proof_best();
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_slendered_target_longer() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0x8000000000000000000000, 0, 0); // 0xa8 where light ends
        let proof = _proof_best();
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_slendered_target() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0x8000000000000000000000, 0, 0); // 0xa8 where light ends
        let proof = _proof_best();
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), 10);
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_slendered_top() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0x80000000000000000000000000, 0, 0);
        let proof = _proof_best();
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()),  10);
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_slendered_left() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0x10000000000000000000000, 0, 0);
        let proof = _proof_best();
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()),  10);
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_slendered_right() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0x4000000000000000000000, 0, 0);
        let proof = _proof_best();
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()),  10);
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_slendered_down() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0x800000000000000000, 0, 0);
        let proof = _proof_best();
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()),  10);
    }

    #[test]
    #[available_gas(1_000_000_000)]
    // #[should_panic(expected:('Slendered!',))]
    fn test_slendered_missed() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0x800000000000000000000000000000, 0, 0);
        let proof = _proof_best();
        let win = verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
        assert(win == true, 'Win!')
    }

    #[test]
    #[available_gas(1_000_000_000)]
    // #[should_panic(expected:('Slendered!',))]
    fn test_not_slendered_at_doorstep() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0x140, 0, 0);
        let proof = _proof_best();
        let win = verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
        assert(win == true, 'Win!')
    }

    #[test]
    #[available_gas(1_000_000_000)]
    // #[should_panic(expected:('Slendered!',))]
    fn test_dark_tar_at_target() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, MASK::ALL, 0x8000000000000000000000, 0); // 0xa8 where light ends
        let proof = _proof_best();
        let win = verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
        assert(win == true, 'Win!')
    }

    #[test]
    #[available_gas(1_000_000_000)]
    // #[should_panic(expected:('Slendered!',))]
    fn test_dark_tar_refill_ends_at_door() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, MASK::ALL, 0x800000000000000000000000000000000000000000, 0);
        let proof = _proof_best();
        let win = verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
        assert(win == true, 'Win!')
    }

    #[test]
    #[available_gas(1_000_000_000)]
    // #[should_panic(expected:('Slendered!',))]
    fn test_turn_lights_off_no_slender() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, 0, 0, 0);
        let proof = array![
            DIR::LIGHT_SWITCH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
        ]; //based on _proof_best()
        let win = verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
        assert(win == true, 'Win!')
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_turn_lights_off_slendered() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, MASK::ALL, MASK::ALL, 0);
        let proof = array![
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::LIGHT_SWITCH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
        ]; //based on _proof_best()
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_dark_tar_down_almost() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, MASK::ALL, 0x800000000000000000, 0);
        let proof = _proof_best();
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_dark_tar_at_target_only_once() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let (map, map_data) = make_map(bitmap, 0, MASK::ALL, 0x8000000000000000000000, 0); // 0xa8 where light ends
        let proof = array![
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
            DIR::WEST, DIR::WEST, DIR::WEST, // run around
            DIR::EAST, DIR::EAST, DIR::EAST, // go back, will not get dark tar again
            DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH, DIR::SOUTH,
        ];
        verify_map(map, map_data, entry, exit, pack_proof_moves(proof.clone()), proof.len());
    }


}