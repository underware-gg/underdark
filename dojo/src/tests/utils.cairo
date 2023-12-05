#[cfg(test)]
mod utils {
     use starknet::ContractAddress;
    use core::traits::Into;
    use array::ArrayTrait;
    use debug::PrintTrait;

    use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
    use dojo::test_utils::{spawn_test_world, deploy_contract};

    use underdark::systems::actions::{actions, IActionsDispatcher, IActionsDispatcherTrait};
    use underdark::models::chamber::{Chamber, chamber, Map, map, MapData, map_data, Score, score};
    use underdark::models::tile::{Tile, tile};
    use underdark::types::location::{Location, LocationTrait};
    use underdark::types::dir::{Dir, DirTrait};
    use underdark::types::doors::{Doors};
    use underdark::types::constants::{REALM_ID};

    fn setup_world() -> (IWorldDispatcher, IActionsDispatcher) {
        let mut models = array![chamber::TEST_CLASS_HASH, map::TEST_CLASS_HASH, map_data::TEST_CLASS_HASH, tile::TEST_CLASS_HASH, score::TEST_CLASS_HASH];
        let world: IWorldDispatcher = spawn_test_world(models);
        let contract_address = world.deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        (world, IActionsDispatcher { contract_address })
    }

    fn execute_generate_level(world: IWorldDispatcher, system: IActionsDispatcher, realm_id: u16, manor_coord: u128, room_id: u16, level_number: u16, generator_name: felt252, generator_value: u32) {
        system.generate_level(realm_id, manor_coord, room_id, level_number, generator_name, generator_value.into());
    }

    fn execute_finish_level(world: IWorldDispatcher, system: IActionsDispatcher, location_id: u128, proof: u256, moves_count: usize) {
        system.finish_level(location_id, proof.low, proof.high, moves_count);
    }

    fn generate_level_get_chamber(world: IWorldDispatcher, system: IActionsDispatcher, realm_id: u16, manor_coord: u128, room_id: u16, level_number: u16, generator_name: felt252, generator_value: u32) -> Chamber {
        execute_generate_level(world, system, realm_id, manor_coord, room_id, level_number, generator_name, generator_value);
        let location: Location = LocationTrait::from_coord(realm_id, room_id, level_number, manor_coord);
        get_world_Chamber(world, location.to_id())
    }

    fn get_world_Chamber(world: IWorldDispatcher, location_id: u128) -> Chamber {
        let result: Chamber = get!(world, location_id, Chamber);
        (result)
    }

    fn get_world_Map(world: IWorldDispatcher, entity_id: u128) -> Map {
        let result: Map = get!(world, entity_id, Map);
        (result)
    }

    fn get_world_MapData(world: IWorldDispatcher, system: IActionsDispatcher, location_id: u128) -> MapData {
        system.generate_map_data(location_id)
    }

    fn get_world_Score(world: IWorldDispatcher, key_location_id: u128, key_caller: ContractAddress) -> Score {
        let result: Score = get!(world, (key_location_id, key_caller), Score);
        (result)
    }

    fn get_world_Tile_type(world: IWorldDispatcher, location_id: u128, pos: u8) -> u8 {
        // let query = array![location_id.into(), pos.into()].span();
        // let component = world.entity('Tile', query, 0, dojo::SerdeLen::<Tile>::len());
        let tile: Tile = get!(world, (location_id, pos), Tile);
        (tile.tile_type)
    }

    fn get_world_Doors_as_Tiles(world: IWorldDispatcher, location_id: u128) -> Doors {
        let map: Map = get_world_Map(world, location_id);
        Doors {
            north: get_world_Tile_type(world, location_id, map.north),
            east: get_world_Tile_type(world, location_id, map.east),
            west: get_world_Tile_type(world, location_id, map.west),
            south: get_world_Tile_type(world, location_id, map.south),
            over: get_world_Tile_type(world, location_id, map.over),
            under: get_world_Tile_type(world, location_id, map.under),
        }
    }

    fn make_map(bitmap: u256, monsters: u256, slender_duck: u256, dark_tar: u256) -> (Map, MapData) {
        let location_id: u128 = 1;
        (Map {
            entity_id: location_id,
            bitmap,
            protected: 0,
            generator_name: 0,
            generator_value: 0,
            north: 0,
            east: 0,
            west: 0,
            south: 0,
            over: 0,
            under: 0,
        }, MapData {
            location_id,
            monsters,
            slender_duck,
            dark_tar,
            chest: 0,
        })
    }

    #[test]
    #[available_gas(10_000)]
    fn test_utils() {
        assert(true != false, 'utils');
    }
}