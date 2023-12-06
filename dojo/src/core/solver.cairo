use debug::PrintTrait;
use array::ArrayTrait;
use dict::{ Felt252DictTrait};
use traits::Into;
use underdark::utils::bitwise::{U256Bitwise};
use underdark::utils::bitmap::{Bitmap};
use underdark::utils::arrays::{create_array};


//
// A* maze solver
//
// inspired by:
// https://medium.com/@nicholas.w.swift/easy-a-star-pathfinding-7e6689c7f7b2
//

fn solve_map(bitmap: u256, entry: u8, exit: u8) -> Array<u8> {
    let (in_x, in_y): (usize, usize) = Bitmap::tile_to_xy(entry.into());
    let (out_x, out_y): (usize, usize) = Bitmap::tile_to_xy(exit.into());

    let mut F: Felt252Dict<u8> = Default::default();
    let mut G: Felt252Dict<u8> = Default::default();
    let mut H: Felt252Dict<u8> = Default::default();
    let mut parent: Felt252Dict<u8> = Default::default();
    let mut burned: Felt252Dict<u8> = Default::default();
    
    // first node is entry
    let mut stack: Array<u8> = ArrayTrait::new();
    stack.append(entry);

    // result
    let mut path: Array<u8> = ArrayTrait::new();

    // loop until exit found or empty stack
    loop {
        let mut current_node: u8 = 0;

        let stack_span = stack.span();

        // pick best score node from stack
        let mut current_f: u8 = 0xff; // impossible value
        let mut i: usize = 0;
        loop {
            if (i == stack_span.len()) { break; }
            let n: u8 = *stack_span.at(i);
            let f: u8 = F.get(n.into());
            if (burned.get(n.into()) == 0 && (f < current_f || current_f == 0xff)) {
                current_node = n;
                current_f = f;
            }
            i += 1;
        };

        // stack is empty, not found!
        if (current_f == 0xff) { break; }

        // burn found node
        burned.insert(current_node.into(), 1);

        // found the exit!
        if (current_node == exit) {
            path.append(current_node);
            let mut n: u8 = current_node;
            loop {
                let p: u8 = parent.get(n.into());
                if (p == 0) { break; }
                path.append(p);
                n = p;
            };
            // TODO: invert path
            break;
        }


    };
    path.len().print();

    (path)
}

fn is_map_solvable(bitmap: u256, entry: u8, exit: u8) -> bool {
    (solve_map(bitmap, entry, exit).len() > 0)
}


//----------------------------------------
// Unit  tests
//

#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use underdark::utils::bitmap::{Bitmap, MASK};
    use underdark::core::solver::{
        is_map_solvable,
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
        assert(is_map_solvable(MASK::ALL, 55, 55) == true, 'entry == exit');
        // todo...
        assert(is_map_solvable(MASK::ALL, 0, 255) == false, '0 > 255');
    }
}
