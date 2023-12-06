use debug::PrintTrait;
use array::ArrayTrait;
use dict::{ Felt252DictTrait};
use traits::Into;
use underdark::utils::bitwise::{U256Bitwise};
use underdark::utils::bitmap::{Bitmap};
use underdark::utils::arrays::{create_array};
use underdark::utils::math::{Math32};


//
// A* maze solver
//
// inspired by:
// https://medium.com/@nicholas.w.swift/easy-a-star-pathfinding-7e6689c7f7b2
//

const STACKED: u8 = 1;
const BURNED: u8 = 2;

fn solve_map(bitmap: u256, entry: u8, exit: u8) -> Array<u8> {
    let (in_x, in_y): (usize, usize) = Bitmap::tile_to_xy(entry.into());
    let (out_x, out_y): (usize, usize) = Bitmap::tile_to_xy(exit.into());

    let mut F: Felt252Dict<usize> = Default::default();
    let mut G: Felt252Dict<usize> = Default::default();
    let mut H: Felt252Dict<usize> = Default::default();
    let mut parent: Felt252Dict<usize> = Default::default();
    let mut status: Felt252Dict<u8> = Default::default();
    
    let mut stack: Array<usize> = ArrayTrait::new();

    // first node is entry
    status.insert(entry.into(), STACKED);
    stack.append(entry.into());

    // result
    let mut path: Array<u8> = ArrayTrait::new();

    // loop until exit found or empty stack
    loop {
        let mut current_tile: usize = 0;

        // pick best score node from stack
        let stack_span = stack.span();
        let mut current_f: usize = 0xffff; // impossible value
        let mut i: usize = 0;
        loop {
            if (i == stack_span.len()) { break; }
            let tile: usize = *stack_span.at(i);
            let f: usize = F.get(tile.into());
            // skip burned, choose best F score
            if (status.get(tile.into()) != BURNED && (f < current_f || current_f == 0xffff)) {
                current_tile = tile;
                current_f = f;
            }
            i += 1;
        };

        // stack is empty, not found!
        if (current_f == 0xffff) { break; }

        // burn found node
        status.insert(current_tile.into(), BURNED);

        // found the exit!
        if (current_tile == exit.into()) {
            path.append(current_tile.try_into().unwrap());
            let mut tile: usize = current_tile;
            loop {
                let p: usize = parent.get(tile.into());
                if (p == 0) {
                    if (entry == 0 && entry != exit) { // exception, entry is zero
                        path.append(p.try_into().unwrap());
                    }
                    break;
                }
                path.append(p.try_into().unwrap());
                tile = p;
            };
            // TODO: invert path
            break;
        }

        // Find neighbours
        let mut cross: Array<(usize, usize)> = ArrayTrait::new();
        let (x, y) : (usize, usize) = Bitmap::tile_to_xy(current_tile);
        if (x > 0)  { cross.append((x - 1, y)); }
        if (x < 15) { cross.append((x + 1, y)); }
        if (y > 0)  { cross.append((x, y - 1)); }
        if (y < 15) { cross.append((x, y + 1)); }

        let mut current_g: usize = G.get(current_tile.into());

        let mut i: usize = 0;
        loop {
            if (i == cross.len()) { break; }
            let (cx, cy) : (usize, usize) = *cross.at(i);
            let tile: usize = Bitmap::xy_to_tile(cx, cy);
            if (Bitmap::is_set_tile(bitmap, tile) && status.get(tile.into()) != BURNED) {
                let g: usize = current_g + 1;
                if (status.get(tile.into()) == 0 || g < G.get(tile.into())) {
                    let h: usize = Math32::squaredDistance(cx, cy, out_x, out_y);
                    let f: usize = g + h;
                    F.insert(tile.into(), f);
                    G.insert(tile.into(), g);
                    H.insert(tile.into(), h);
                    parent.insert(tile.into(), current_tile);
                    status.insert(tile.into(), STACKED);
                    stack.append(tile.into());
                }
            }
            i += 1;
        };
    };
    // path.len().print();

    (path)
}

fn is_map_solvable(bitmap: u256, entry: u8, exit: u8) -> bool {
    (solve_map(bitmap, entry, exit).len() > 0)
}

fn solve_map_as_bitmap(bitmap: u256, entry: u8, exit: u8) -> u256 {
    let path: Array<u8> = solve_map(bitmap, entry, exit);
    let mut result = 0;
    let mut i: usize = 0;
    loop {
        if (i == path.len()) { break; }
        let tile: usize = (*path.at(i)).into();
        result = Bitmap::set_tile(result, tile);
        i += 1;
    };
    (result)
}



//----------------------------------------
// Unit  tests
//

#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use underdark::utils::bitmap::{Bitmap, MASK};
    use underdark::core::solver::{
        solve_map,
        is_map_solvable,
        solve_map_as_bitmap,
    };


    #[test]
    #[available_gas(1_000_000_000)]
    fn test_stack_size() {
        _stack_count(0);
    }
    fn _stack_count(counter: u8) {
        if(counter < 255) { _stack_count(counter + 1); }
    }

    #[test]
    #[available_gas(1_000_000_000)]
    fn test_is_map_solvable() {
        assert(is_map_solvable(MASK::ALL, 55, 55) == true, 'entry == exit (ALL)');
        assert(is_map_solvable(MASK::NONE, 55, 55) == true, 'entry == exit (NONE)');
        assert(is_map_solvable(MASK::ALL, 0, 255) == true, '0 > 255');
        // all void
        assert(is_map_solvable(MASK::NONE, 0, 0) == true, '0 > 0 (none)');
        assert(is_map_solvable(MASK::NONE, 0, 1) == false, '0 > 1 (none)');
        assert(is_map_solvable(MASK::NONE, 0, 255) == false, '0 > 255 (none)');
    }

    #[test]
    #[available_gas(1_000_000_000)]
    fn test_path_count() {
        assert(solve_map(MASK::ALL, 0, 0).len() == 1, '0_0');
        assert(solve_map(MASK::ALL, 0, 1).len() == 2, '0_1');
        assert(solve_map(MASK::ALL, 0, 8).len() == 9, '0_8');
        assert(solve_map(MASK::ALL, 0, 16).len() == 2, '0_16');
        assert(solve_map(MASK::ALL, 0, 15).len() == 16, '0_15');
        assert(solve_map(MASK::ALL, 1, 0).len() == 2, '1_0');
        assert(solve_map(MASK::ALL, 8, 0).len() == 9, '8_0');
        assert(solve_map(MASK::ALL, 16, 0).len() == 2, '16_0');
        assert(solve_map(MASK::ALL, 15, 0).len() == 16, '15_0');

        assert(solve_map(MASK::ALL, 16, 16).len() == 1, '16_16');
        assert(solve_map(MASK::ALL, 16, 16+1).len() == 2, '16_16+1');
        assert(solve_map(MASK::ALL, 16, 16+8).len() == 9, '16_16+8');
        assert(solve_map(MASK::ALL, 16, 16+15).len() == 16, '16_16+15');
        assert(solve_map(MASK::ALL, 16+1, 16).len() == 2, '16+1_16');
        assert(solve_map(MASK::ALL, 16+8, 16).len() == 9, '16+8_16');
        assert(solve_map(MASK::ALL, 16+15, 16).len() == 16, '16+15_16');
        
        let x15: u8 = Bitmap::xy_to_tile(15, 0).try_into().unwrap();
        let y15: u8 = Bitmap::xy_to_tile(0, 15).try_into().unwrap();
        let xy15: u8 = Bitmap::xy_to_tile(15, 15).try_into().unwrap();
        assert(solve_map(MASK::ALL, 0, x15).len() == 16, '0_x15');
        assert(solve_map(MASK::ALL, 0, y15).len() == 16, '0_y15');
        assert(solve_map(MASK::ALL, x15, 0).len() == 16, 'x15_0');
        assert(solve_map(MASK::ALL, y15, 0).len() == 16, 'y15_0');
        assert(solve_map(MASK::ALL, xy15, x15).len() == 16, 'xy15_y15');
        assert(solve_map(MASK::ALL, xy15, y15).len() == 16, 'xy15_y15');
        assert(solve_map(MASK::ALL, x15, xy15).len() == 16, 'y15_xy15');
        assert(solve_map(MASK::ALL, y15, xy15).len() == 16, 'y15_xy15');
    }

    #[test]
    #[available_gas(1_000_000_000)]
    fn test_path_bitmap() {
        assert(solve_map_as_bitmap(MASK::ALL, 0, 0) == Bitmap::set_xy(0, 0, 0), '0_0');
        assert(solve_map_as_bitmap(MASK::ALL, 15, 15) == Bitmap::set_xy(0, 15, 0), '15_15');
        assert(solve_map_as_bitmap(MASK::ALL, 255, 255) == 1, '255_255');
        let y15: u8 = Bitmap::xy_to_tile(0, 15).try_into().unwrap();
        let xy15: u8 = Bitmap::xy_to_tile(15, 15).try_into().unwrap();
        assert(solve_map_as_bitmap(MASK::ALL, 0, 15) == MASK::TOP_ROW, 'TOP_ROW');
        assert(solve_map_as_bitmap(MASK::ALL, 0, y15) == MASK::LEFT_COL, 'LEFT_COL');
        assert(solve_map_as_bitmap(MASK::ALL, 15, xy15) == MASK::RIGHT_COL, 'RIGHT_COL');
        assert(solve_map_as_bitmap(MASK::ALL, y15, xy15) == MASK::BOTTOM_ROW, 'BOTTOM_ROW');
        assert(solve_map_as_bitmap(MASK::ALL, 15, 0) == MASK::TOP_ROW, 'TOP_ROW_i');
        assert(solve_map_as_bitmap(MASK::ALL, y15, 0) == MASK::LEFT_COL, 'LEFT_COL_i');
        assert(solve_map_as_bitmap(MASK::ALL, xy15, 15) == MASK::RIGHT_COL, 'RIGHT_COL_i');
        assert(solve_map_as_bitmap(MASK::ALL, xy15, y15) == MASK::BOTTOM_ROW, 'BOTTOM_ROW_i');
    }
}
