#[cfg(test)]
mod tests {
    use core::traits::Into;
    use array::ArrayTrait;
    use debug::PrintTrait;

    use dojo::world::{IWorldDispatcherTrait, IWorldDispatcher};

    use underdark::core::seeder::{make_seed, make_underseed};
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