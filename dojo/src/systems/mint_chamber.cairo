use starknet::{ContractAddress, ClassHash};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use underdark::types::dir::{Dir, DIR, DirTrait};

// define the interface
#[starknet::interface]
trait IMintChamber<TContractState> {
    fn mint_realms_chamber(self: @TContractState, 
        token_id: u128,
        from_coord: u128,
        from_dir_u128: u128, 
        generator_name: felt252,
        generator_value_u128: u128,
    );
}

#[dojo::contract]
mod mint_chamber {
    use super::IMintChamber;
    use traits::{Into, TryInto};
    use core::option::OptionTrait;

    use underdark::systems::actions::generate_chamber::{generate_chamber};
    use underdark::types::constants::{DOMAINS};
    use underdark::types::location::{Location, LocationTrait};
    use underdark::types::dir::{Dir, DIR, DirTrait};

    // impl: implement functions specified in trait
    #[external(v0)]
    impl MintChamberImpl of IMintChamber<ContractState> {
        fn mint_realms_chamber(self: @ContractState,
            token_id: u128,
            from_coord: u128,
            from_dir_u128: u128, 
            generator_name: felt252,
            generator_value_u128: u128,
        ) {
            assert(token_id > 0, 'Invalid token id');
            
            let world: IWorldDispatcher = self.world_dispatcher.read();

            // TODO: verify token ownership
            
            // verify its a valid direction
            // assert(from_dir < DIR::COUNT, 'Invalid from direction');
            let maybe_from_dir: Option<Dir> = from_dir_u128.try_into();
            let from_dir: Dir = maybe_from_dir.unwrap();
            assert(from_dir != Dir::Over, 'Invalid from direction (Over)');
            
            let caller = starknet::contract_address_const::<0x0>();
            let from_location: Location = LocationTrait::from_coord(DOMAINS::REALMS, token_id.try_into().unwrap(), from_coord);

            generate_chamber(world, caller, from_location, from_dir, generator_name, generator_value_u128.try_into().unwrap());

            return ();
        }
    }
}
