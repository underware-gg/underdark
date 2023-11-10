#[cfg(test)]
mod tests {
    use core::traits::Into;
    use array::ArrayTrait;
    use debug::PrintTrait;

    use dojo::world::{IWorldDispatcherTrait, IWorldDispatcher};

    use underdark::systems::verify_level_proof::{verify_map, pack_proof_moves, unpack_proof_moves};
    use underdark::models::chamber::{Chamber, Map, Score};
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
        let map = make_map(bitmap, 0, 0, 0);
        let proof_best = _proof_best();
        verify_map(map, entry, exit, pack_proof_moves(proof_best.clone()), proof_best.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_no_light_slendered_all() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let map = make_map(bitmap, 0, MASK::ALL, 0);
        let proof_best = _proof_best();
        verify_map(map, entry, exit, pack_proof_moves(proof_best.clone()), proof_best.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_no_light_slendered_target() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let map = make_map(bitmap, 0, 0x8000000000000000000000, 0);
        let proof_best = _proof_best();
        verify_map(map, entry, exit, pack_proof_moves(proof_best.clone()), proof_best.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_no_light_slendered_top() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let map = make_map(bitmap, 0, 0x80000000000000000000000000, 0);
        let proof_best = _proof_best();
        verify_map(map, entry, exit, pack_proof_moves(proof_best.clone()), proof_best.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_no_light_slendered_left() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let map = make_map(bitmap, 0, 0x10000000000000000000000, 0);
        let proof_best = _proof_best();
        verify_map(map, entry, exit, pack_proof_moves(proof_best.clone()), proof_best.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_no_light_slendered_right() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let map = make_map(bitmap, 0, 0x4000000000000000000000, 0);
        let proof_best = _proof_best();
        verify_map(map, entry, exit, pack_proof_moves(proof_best.clone()), proof_best.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    #[should_panic(expected:('Slendered!',))]
    fn test_no_light_slendered_down() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let map = make_map(bitmap, 0, 0x800000000000000000, 0);
        let proof_best = _proof_best();
        verify_map(map, entry, exit, pack_proof_moves(proof_best.clone()), proof_best.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    // #[should_panic(expected:('Slendered!',))]
    fn test_no_light_slendered_missed() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let map = make_map(bitmap, 0, 0x800000000000000000000000000000, 0);
        let proof_best = _proof_best();
        verify_map(map, entry, exit, pack_proof_moves(proof_best.clone()), proof_best.len());
    }

    #[test]
    #[available_gas(1_000_000_000)]
    // #[should_panic(expected:('Slendered!',))]
    fn test_no_light_saved_with_slender_at_doorstep() {
        let (world, system) = setup_world();
        let (bitmap, entry, exit): (u256, u8, u8) = (VERIFY_BITMAP, VERIFY_ENTRY, VERIFY_EXIT);
        let map = make_map(bitmap, 0, 0x140, 0);
        let proof_best = _proof_best();
        verify_map(map, entry, exit, pack_proof_moves(proof_best.clone()), proof_best.len());
    }

}