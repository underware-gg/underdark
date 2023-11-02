use starknet::ContractAddress;
use dojo::database::schema::{
    Enum, Member, Ty, Struct, SchemaIntrospection, serialize_member, serialize_member_type
};

// A geographic placed Chamber
// (Immutable)
#[derive(Model, Copy, Drop, Serde)]
struct Chamber {
    #[key]
    location_id: u128,
    room_id: u16,
    level_number: u16,
    seed: u256,
    yonder: u16,
}

// A Chamber's map information
// (Immutable)
#[derive(Model, Copy, Drop, Serde)]
struct Map {
    #[key]
    entity_id: u128,
    bitmap: u256, // the actual map: 0=void/walls, 1=path
    generator_name: felt252,
    generator_value: u32,
    // doors positions
    north: u8,
    east: u8,
    west: u8,
    south: u8,
    over: u8,
    under: u8,
    // monsters
    monsters: u256,
    slender_duck: u256,
    dark_tar: u256,
}

// The current conditions of a Chamebr
// (Mutable)
#[derive(Model, Copy, Drop, Serde)]
struct State {
    #[key]
    location_id: u128,
    light: u8,
    threat: u8,
    wealth: u8,
    wins: u8,
}

// The current conditions of a Chamebr
// (Mutable)
#[derive(Model, Copy, Drop, Serde)]
struct Score {
    #[key]
    key_location_id: u128,
    #[key]
    key_player: ContractAddress,
    // fields
    location_id: u128,
    player: ContractAddress,
    moves: usize,
}
