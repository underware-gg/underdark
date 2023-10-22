use starknet::{ContractAddress, ClassHash};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use underdark::types::dir::{Dir, DIR, DirTrait};

// define the interface
#[starknet::interface]
trait IActions<TContractState> {
    fn start_level(self: @TContractState,
        game_id: u32,
        level_number: u32,
        from_coord: u128,
        from_dir_u128: u128, 
        generator_name: felt252,
        generator_value_u128: u128,
    );
}

#[dojo::contract]
mod actions {
    use super::IActions;
    use traits::{Into, TryInto};
    use core::option::OptionTrait;

    use underdark::systems::generate_chamber::{generate_chamber};
    use underdark::types::location::{Location, LocationTrait};
    use underdark::types::dir::{Dir, DIR, DirTrait};

    // impl: implement functions specified in trait
    #[external(v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn start_level(self: @ContractState,
            game_id: u32,
            level_number: u32,
            from_coord: u128,
            from_dir_u128: u128, 
            generator_name: felt252,
            generator_value_u128: u128,
        ) {
            let world: IWorldDispatcher = self.world_dispatcher.read();

            // verify its a valid direction
            // let maybe_from_dir: Option<Dir> = from_dir_u128.try_into();
            // let from_dir: Dir = maybe_from_dir.unwrap();
            // assert(from_dir != Dir::Over, 'Invalid from direction (Over)');
            // let from_location: Location = LocationTrait::from_coord(game_id, from_coord);

            let location: Location = Location{ game_id, over:0, under:1, north: 0, east: level_number.try_into().unwrap(), west:0, south:1 };

            generate_chamber(world, game_id, level_number, location, Dir::West, generator_name, generator_value_u128.try_into().unwrap());

            return ();
        }
    }
}
