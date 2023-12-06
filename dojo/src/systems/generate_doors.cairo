use traits::Into;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use underdark::core::randomizer::{randomize_door_tile};
use underdark::systems::create_tile::{create_tile};
use underdark::models::chamber::{Map};
use underdark::types::tile_type::{TileType};
use underdark::types::location::{Location, LocationTrait};
use underdark::types::dir::{Dir, DirTrait, DIR};
use underdark::types::doors::{Doors};
use underdark::utils::bitwise::{U8Bitwise};
use underdark::utils::bitmap::{Bitmap};

fn generate_doors(world: IWorldDispatcher,
    location: Location,
    location_id: u128,
    ref rnd: u256,
    permissions: u8,
    generator_name: felt252,
) -> (Doors, u256) {

    let mut doors = Doors {
        north: 0,//create_door(world, location_id, ref rnd, entry_dir, permissions, Dir::North.into()),
        east:  0,//create_door(world, location_id, ref rnd, Dir::West, permissions, Dir::East.into()),
        west:  0,//create_door(world, location_id, ref rnd, Dir::East, permissions, Dir::West.into()),
        south: 0,//create_door(world, location_id, ref rnd, entry_dir, permissions, Dir::South.into()),
        over:  create_door(world, location_id, location.offset(Dir::Over).to_id(), ref rnd, Dir::Under, permissions, Dir::Over.into()),
        under: create_door(world, location_id, location.offset(Dir::Under).to_id(), ref rnd, Dir::Over, permissions, Dir::Under.into()),
    };

    // for tests
    if (generator_name == 'empty') {
        create_tile(world, location_id, doors.over, TileType::Path);
        create_tile(world, location_id, doors.under, TileType::Path);
        doors = Doors {north: 0,east:0,west:0,south:0,over:8,under:248};
        create_tile(world, location_id, 8, TileType::Entry);
        create_tile(world, location_id, 248, TileType::Exit);
    };

    // make doors protection bitmap
    let mut protected: u256 = 0;
    // if(doors.north > 0) { protected = Bitmap::set_tile(protected, doors.north.into()); }
    // if(doors.east > 0)  { protected = Bitmap::set_tile(protected, doors.east.into()); }
    // if(doors.west > 0)  { protected = Bitmap::set_tile(protected, doors.west.into()); }
    // if(doors.south > 0) { protected = Bitmap::set_tile(protected, doors.south.into()); }
    if(doors.over > 0)  { protected = Bitmap::set_tile(protected, doors.over.into()); }
    if(doors.under > 0) { protected = Bitmap::set_tile(protected, doors.under.into()); }

    (doors, protected)
}

fn create_door(world: IWorldDispatcher,
    location_id: u128,
    to_location_id: u128,
    ref rnd: u256,
    entry_dir: Dir,
    permissions: u8,
    dir: Dir,
) -> u8 {

    // which chamber is this door leading to?
    let to_map: Map = get!(world, to_location_id, (Map));
    let to_map_exist: bool = (to_map.bitmap != 0);

    let is_entry: bool = (entry_dir == dir);

    let mut tile_type: TileType = TileType::Exit; // default is locked, generated here
    let mut pos: u8 = 0;

    match dir {
        Dir::North => {
        },
        Dir::East => {
        },
        Dir::West => {
        },
        Dir::South => {
        },
        Dir::Over => {
            tile_type = TileType::Entry;
            if(to_map.under > 0) {
                pos = Dir::Under.flip_door_tile(to_map.under);
            } else {
                pos = randomize_door_tile(ref rnd, dir);
            }
        },
        Dir::Under => {
            pos = randomize_door_tile(ref rnd, dir);
        },
    }

    if(pos == 0) {
        return 0;
    }

    create_tile(world, location_id, pos, tile_type);

    // return door position
    pos
}
