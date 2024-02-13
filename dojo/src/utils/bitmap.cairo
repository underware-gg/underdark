use debug::PrintTrait;
use array::ArrayTrait;
use underdark::utils::bitwise::{U256Bitwise};
use underdark::types::dir::{Dir, DirTrait};

mod MASK {
    const NONE: u256 = 0x0;
    const ALL: u256  = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    // 10001
    // 10001
    // 10001
    const LEFT_COL: u256   = 0x8000800080008000800080008000800080008000800080008000800080008000;
    const RIGHT_COL: u256  = 0x0001000100010001000100010001000100010001000100010001000100010001;
    const OUTER_COLS: u256 = 0x8001800180018001800180018001800180018001800180018001800180018001;
    const INNER_COLS: u256 = 0x7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe;

    // 11111
    // 00000
    // 11111
    const TOP_ROW: u256    = 0xffff000000000000000000000000000000000000000000000000000000000000;
    const BOTTOM_ROW: u256 = 0x000000000000000000000000000000000000000000000000000000000000ffff;
    const OUTER_ROWS: u256 = 0xffff00000000000000000000000000000000000000000000000000000000ffff;
    const INNER_ROWS: u256 = 0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000;

    // 11111
    // 10001
    // 11111
    const OUTER: u256 = 0xffff80018001800180018001800180018001800180018001800180018001ffff;
    const INNER: u256 = 0x00007ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe7ffe0000;
}

trait BitmapTrait {

    // convert map position form tile (0-255) to xy (0-15,0-15)
    // always starting from the map's top left
    fn tile_to_xy(i: usize) -> (usize, usize);

    // convert map position form xy (0-15,0-15) to tile (0-255)
    // always starting from the map's top left
    fn xy_to_tile(x: usize, y: usize) -> usize;

    // returns the u256 bit number (0-255) of a tile position (e.g. doors)
    fn bit_to_tile(i: usize) -> usize;

    // returns the u256 bit number (0-255) of a [x, y] position
    fn bit_to_xy(x: usize, y: usize) -> usize;
    
    fn move_tile(i: usize, dir: Dir) -> usize;

    // check if a map position is set (is path, not wall)
    fn is_set_tile(bitmap: u256, i: usize) -> bool;
    fn is_set_xy(bitmap: u256, x: usize, y: usize) -> bool;
    
    fn set_tile(bitmap: u256, i: usize) -> u256;
    fn set_xy(bitmap: u256, x: usize, y: usize) -> u256;

    fn unset_tile(bitmap: u256, i: usize) -> u256;
    fn unset_xy(bitmap: u256, x: usize, y: usize) -> u256;

    fn row(bitmap: u256, n: usize) -> u256;
    fn column(bitmap: u256, n: usize) -> u256;

    fn shift_left(bitmap: u256, n: usize) -> u256;
    fn shift_right(bitmap: u256, n: usize) -> u256;
    fn shift_up(bitmap: u256, n: usize) -> u256;
    fn shift_down(bitmap: u256, n: usize) -> u256;

    fn get_range_x(bitmap: u256) -> (usize, usize);
    fn get_range_y(bitmap: u256) -> (usize, usize);
    fn get_min_x(bitmap: u256) -> usize;
    fn get_max_x(bitmap: u256) -> usize;
    fn get_min_y(bitmap: u256) -> usize;
    fn get_max_y(bitmap: u256) -> usize;

    fn rotate_north_to(bitmap: u256, dir: Dir) -> u256;
    fn Rotate_90_cw(bitmap: u256) -> u256;
    fn Rotate_90_ccw(bitmap: u256) -> u256;
    fn Rotate_180(bitmap: u256) -> u256;

    fn is_near_or_at_tile(bitmap: u256, i: usize) -> bool;
    fn is_near_or_at_xy(bitmap: u256, x: usize, y: usize) -> bool;

    fn from_tile_array(array: Span<u8>) -> u256;
    fn to_tile_array(bitmap: u256) -> Array<u8>;
}

impl Bitmap of BitmapTrait {

    #[inline(always)]
    fn tile_to_xy(i: usize) -> (usize, usize) {
        (i % 16, i / 16)
    }
    #[inline(always)]
    fn xy_to_tile(x: usize, y: usize) -> usize {
       (y * 16 + x)
    }

    #[inline(always)]
    fn bit_to_tile(i: usize) -> usize {
       (255 - i)
    }
    #[inline(always)]
    fn bit_to_xy(x: usize, y: usize) -> usize {
       (255 - (y * 16 + x))
    }

    fn move_tile(i: usize, dir: Dir) -> usize {
        let (x, y): (usize, usize) = Bitmap::tile_to_xy(i);
        match dir {
            Dir::North => if (y > 0)  { Bitmap::xy_to_tile(x, y - 1) } else { i },
            Dir::East  => if (x < 15) { Bitmap::xy_to_tile(x + 1, y) } else { i },
            Dir::West  => if (x > 0)  { Bitmap::xy_to_tile(x - 1, y) } else { i },
            Dir::South => if (y < 15) { Bitmap::xy_to_tile(x, y + 1) } else { i },
            Dir::Over  => i,
            Dir::Under => i,
        }
    }

    #[inline(always)]
    fn is_set_tile(bitmap: u256, i: usize) -> bool {
        U256Bitwise::is_set(bitmap, Bitmap::bit_to_tile(i))
    }
    #[inline(always)]
    fn is_set_xy(bitmap: u256, x: usize, y: usize) -> bool {
        U256Bitwise::is_set(bitmap, Bitmap::bit_to_xy(x, y))
    }

    #[inline(always)]
    fn set_tile(bitmap: u256, i: usize) -> u256 {
        U256Bitwise::set(bitmap, Bitmap::bit_to_tile(i))
    }
    #[inline(always)]
    fn set_xy(bitmap: u256, x: usize, y: usize) -> u256 {
        U256Bitwise::set(bitmap, Bitmap::bit_to_xy(x, y))
    }

    #[inline(always)]
    fn unset_tile(bitmap: u256, i: usize) -> u256 {
        U256Bitwise::unset(bitmap, Bitmap::bit_to_tile(i))
    }
    #[inline(always)]
    fn unset_xy(bitmap: u256, x: usize, y: usize) -> u256 {
        U256Bitwise::unset(bitmap, Bitmap::bit_to_xy(x, y))
    }

    #[inline(always)]
    fn row(bitmap: u256, n: usize) -> u256 {
        (bitmap & Bitmap::shift_down(MASK::TOP_ROW, n))
    }
    #[inline(always)]
    fn column(bitmap: u256, n: usize) -> u256 {
        (bitmap & Bitmap::shift_right(MASK::LEFT_COL, n))
    }

    #[inline(always)]
    fn shift_left(bitmap: u256, n: usize) -> u256 {
        if(n == 0) { return bitmap; }
        if(n > 15) { return 0; }
        U256Bitwise::shl(bitmap, n)
    }
    #[inline(always)]
    fn shift_right(bitmap: u256, n: usize) -> u256 {
        if(n == 0) { return bitmap; }
        if(n > 15) { return 0; }
        U256Bitwise::shr(bitmap, n)
    }
    #[inline(always)]
    fn shift_up(bitmap: u256, n: usize) -> u256 {
        if(n == 0) { return bitmap; }
        if(n > 15) { return 0; }
        U256Bitwise::shl(bitmap, n * 16)
    }
    #[inline(always)]
    fn shift_down(bitmap: u256, n: usize) -> u256 {
        if(n == 0) { return bitmap; }
        if(n > 15) { return 0; }
        U256Bitwise::shr(bitmap, n * 16)
    }

    #[inline(always)]
    fn get_range_x(bitmap: u256) -> (usize, usize) {
        (Bitmap::get_min_x(bitmap), Bitmap::get_max_x(bitmap))
    }

    #[inline(always)]
    fn get_range_y(bitmap: u256) -> (usize, usize) {
        (Bitmap::get_min_y(bitmap), Bitmap::get_max_y(bitmap))
    }

    fn get_min_x(bitmap: u256) -> usize {
        let mut n: usize = 0;
        loop {
            if (n == 15) { break; }
            if (Bitmap::column(bitmap, n) != 0 ) { break; }
            n += 1;
        };
        n
    }
    fn get_max_x(bitmap: u256) -> usize {
        let mut n: usize = 15;
        loop {
            if (n == 0) { break; }
            if (Bitmap::column(bitmap, n) != 0 ) { break; }
            n -= 1;
        };
        n
    }
    fn get_min_y(bitmap: u256) -> usize {
        let mut n: usize = 0;
        loop {
            if (n == 15) { break; }
            if (Bitmap::row(bitmap, n) != 0 ) { break; }
            n += 1;
        };
        n
    }
    fn get_max_y(bitmap: u256) -> usize {
        let mut n: usize = 15;
        loop {
            if (n == 0) { break; }
            if (Bitmap::row(bitmap, n) != 0 ) { break; }
            n -= 1;
        };
        n
    }

    fn rotate_north_to(bitmap: u256, dir: Dir) -> u256 {
        // rotate North to...
        match dir {
            Dir::North => bitmap,
            Dir::East => Bitmap::Rotate_90_cw(bitmap),
            Dir::West => Bitmap::Rotate_90_ccw(bitmap),
            Dir::South => Bitmap::Rotate_180(bitmap),
            Dir::Over => bitmap,
            Dir::Under => bitmap,
        }
    }

    fn Rotate_90_cw(bitmap: u256) -> u256 {
        let mut result: u256 = 0;
        let mut n: usize = 0;
        loop {
            if n == 256 { break; }
            if (U256Bitwise::is_set(bitmap, n)) {
                let x = n % 16;
                let y = n / 16;
                let xx = 15 - y;
                let yy = x;
                result = U256Bitwise::set(result, yy * 16 + xx);
            }
            n += 1;
        };
        result
    }

    fn Rotate_90_ccw(bitmap: u256) -> u256 {
        let mut result: u256 = 0;
        let mut n: usize = 0;
        loop {
            if n == 256 { break; }
            if (U256Bitwise::is_set(bitmap, n)) {
                let x = n % 16;
                let y = n / 16;
                let xx = y;
                let yy = 15 - x;
                result = U256Bitwise::set(result, yy * 16 + xx);
            }
            n += 1;
        };
        result
    }

    fn Rotate_180(bitmap: u256) -> u256 {
        let mut result: u256 = 0;
        let mut n: usize = 0;
        loop {
            if n == 256 { break; }
            if (U256Bitwise::is_set(bitmap, n)) {
                let x = n % 16;
                let y = n / 16;
                let xx = 15 - x;
                let yy = 15 - y;
                result = U256Bitwise::set(result, yy * 16 + xx);
            }
            n += 1;
        };
        result
    }

    // check if bitmap is set at a tile or its surroundings
    #[inline(always)]
    fn is_near_or_at_tile(bitmap: u256, i: usize) -> bool {
        Bitmap::is_near_or_at_xy(bitmap, i % 16, i / 16)
    }
    fn is_near_or_at_xy(bitmap: u256, x: usize, y: usize) -> bool {
        let mask: u256 =
            if (x > 0 && y > 0 && x < 15 && y < 15) { Bitmap::shift_right(Bitmap::shift_down(0x4000e00040000000000000000000000000000000000000000000000000000000, y-1), x-1) } // middle
            else if (x == 0 && y == 0) { 0xc000800000000000000000000000000000000000000000000000000000000000 }   // top-left
            else if (x == 15 && y == 0) { 0x3000100000000000000000000000000000000000000000000000000000000 }     // top-right
            else if (x == 0 && y == 15) { 0x8000c000 }  // bottom-left
            else if (x == 15 && y == 15) { 0x10003 }    // bottom-right
            else if (x == 0) { Bitmap::shift_down(0x8000c00080000000000000000000000000000000000000000000000000000000, y-1) }    // left column
            else if (x == 15) { Bitmap::shift_down(0x1000300010000000000000000000000000000000000000000000000000000, y-1) }      // right column
            else if (y == 0) { Bitmap::shift_right(0xe000400000000000000000000000000000000000000000000000000000000000, x-1) }   // top row
            else if (y == 15) { Bitmap::shift_right(0x4000e000, x-1) }  // bottom row
            else { 0 }  // invalid (x > 15 || y > 15)
            ;
        (bitmap & mask > 0)
    }

    fn from_tile_array(array: Span<u8>) -> u256 {
        let mut result: u256 = 0;
        let mut i: usize = 0;
        loop {
            if (i == array.len()) { break; }
            let tile: usize = (*array.at(i)).into();
            result = Bitmap::set_tile(result, tile);
            i += 1;
        };
        (result)
    }
    fn to_tile_array(mut bitmap: u256) -> Array<u8> {
        let mut result: Array<u8> = ArrayTrait::new();
        let mut bit: usize = 0;
        loop {
            if (bitmap == 0 || bit == 256) {
                break;
            }
            if (bitmap & 1 != 0) {
                let tile: usize = Bitmap::bit_to_tile(bit);
                result.append(tile.try_into().unwrap());
            }
            bit += 1;
            bitmap /= 0b10;
        };
        // the result tiles are in reversed order
        // reverse with: array_utils::reverse(array.span())
        (result)
    }
}


//----------------------------------------
// Unit  tests
//
#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use underdark::utils::arrays::{array_utils};
    use underdark::utils::bitmap::{Bitmap, MASK};
    use underdark::types::dir::{Dir, DirTrait};
    use underdark::utils::string::{String};

    #[test]
    #[available_gas(100_000_000)]
    fn test_bitmap_inline() {
        let bit1: usize = Bitmap::bit_to_xy(8, 8);
        let bit2: usize = Bitmap::bit_to_xy(4 + 4, 4 + 4);
        assert(bit1 != 0, 'test_bitmap_inline_bit_zero');
        assert(bit1 == bit2, 'test_bitmap_inline_bit_equals');
        let bmp1: u256 = Bitmap::set_xy(0, 8, 8);
        let bmp2: u256 = Bitmap::set_xy(0, 4 + 4, 4 + 4);
        assert(bmp1 != 0, 'test_bitmap_inline_set_zero');
        assert(bmp1 == bmp2, 'test_bitmap_inline_set_equals');
    }

    fn assert_tile_to_xy(i: usize, x: usize, y: usize) {
        assert(Bitmap::tile_to_xy(i) == (x, y), 'tile_to_xy');
        assert(Bitmap::xy_to_tile(x, y) == i, 'xy_to_tile');
    }

    #[test]
    #[available_gas(100_000_000)]
    fn test_bitmap_tile_xy() {
        assert_tile_to_xy(0, 0, 0);
        assert_tile_to_xy(1, 1, 0);
        assert_tile_to_xy(15, 15, 0);
        assert_tile_to_xy(16, 0, 1);
        assert_tile_to_xy(17, 1, 1);
        assert_tile_to_xy(32, 0, 2);
        assert_tile_to_xy(255, 15, 15);
    }

    #[test]
    #[available_gas(1_000_000_000)]
    fn test_get_min_max_x_y() {
        assert(Bitmap::get_min_x(0) == 15, 'test_get_min_x_zero_0');
        assert(Bitmap::get_max_x(0) == 0, 'test_get_max_x_zero_15');
        assert(Bitmap::get_min_y(0) == 15, 'test_get_min_y_zero_0');
        assert(Bitmap::get_max_y(0) == 0, 'test_get_max_y_zero_15');

        assert(Bitmap::get_min_x(Bitmap::set_xy(0, 0, 0)) == 0, 'test_get_min_x_0_0');
        assert(Bitmap::get_max_x(Bitmap::set_xy(0, 0, 0)) == 0, 'test_get_max_x_0_0');
        assert(Bitmap::get_min_y(Bitmap::set_xy(0, 0, 0)) == 0, 'test_get_min_y_0_0');
        assert(Bitmap::get_max_y(Bitmap::set_xy(0, 0, 0)) == 0, 'test_get_max_y_0_0');

        assert(Bitmap::get_min_x(Bitmap::set_xy(0, 2, 2)) == 2, 'test_get_min_x_2_2');
        assert(Bitmap::get_max_x(Bitmap::set_xy(0, 2, 2)) == 2, 'test_get_max_x_2_2');
        assert(Bitmap::get_min_y(Bitmap::set_xy(0, 2, 2)) == 2, 'test_get_min_y_2_2');
        assert(Bitmap::get_max_y(Bitmap::set_xy(0, 2, 2)) == 2, 'test_get_max_y_2_2');

        assert(Bitmap::get_min_x(Bitmap::set_xy(0, 15, 15)) == 15, 'test_get_min_x_15_15');
        assert(Bitmap::get_max_x(Bitmap::set_xy(0, 15, 15)) == 15, 'test_get_max_x_15_15');
        assert(Bitmap::get_min_y(Bitmap::set_xy(0, 15, 15)) == 15, 'test_get_min_y_15_15');
        assert(Bitmap::get_max_y(Bitmap::set_xy(0, 15, 15)) == 15, 'test_get_max_y_15_15');

        assert(Bitmap::get_min_x(Bitmap::set_xy(0, 8, 0)) == 8, 'test_get_min_x_8_0');
        assert(Bitmap::get_max_x(Bitmap::set_xy(0, 8, 0)) == 8, 'test_get_max_x_8_0');
        assert(Bitmap::get_min_x(Bitmap::set_xy(0, 8, 15)) == 8, 'test_get_min_x_8_15');
        assert(Bitmap::get_max_x(Bitmap::set_xy(0, 8, 15)) == 8, 'test_get_max_x_8_15');
        let bmpx1 = Bitmap::set_xy(0, 0, 1) | Bitmap::set_xy(0, 15, 14);
        assert(Bitmap::get_min_x(bmpx1) == 0, 'test_get_min_x_0');
        assert(Bitmap::get_max_x(bmpx1) == 15, 'test_get_max_x_15');
        let bmpx2 = Bitmap::set_xy(0, 4, 0) | Bitmap::set_xy(0, 12, 15);
        assert(Bitmap::get_min_x(bmpx2) == 4, 'test_get_min_x_4');
        assert(Bitmap::get_max_x(bmpx2) == 12, 'test_get_max_x_12');
        let bmpy1 = Bitmap::set_xy(0, 1, 0) | Bitmap::set_xy(0, 14, 15);
        assert(Bitmap::get_min_y(bmpy1) == 0, 'test_get_min_y_0');
        assert(Bitmap::get_max_y(bmpy1) == 15, 'test_get_max_y_15');
        let bmpy2 = Bitmap::set_xy(0, 0, 4) | Bitmap::set_xy(0, 15, 12);
        assert(Bitmap::get_min_y(bmpy2) == 4, 'test_get_min_y_4');
        assert(Bitmap::get_max_y(bmpy2) == 12, 'test_get_max_y_12');
    }


    #[test]
    #[available_gas(1_000_000_000)]
    fn test_shift_left_right() {
        let mut bmp = MASK::LEFT_COL;
        assert(Bitmap::shift_right(bmp, 0) == bmp, 'shift_right_zero');
        assert(Bitmap::shift_right(bmp, 16) == 0, 'shift_right_16');
        bmp = Bitmap::shift_right(bmp, 15);
        assert(bmp == MASK::RIGHT_COL, 'shift_left_15');
        assert(Bitmap::shift_left(bmp, 0) == bmp, 'shift_left_zero');
        assert(Bitmap::shift_left(bmp, 16) == 0, 'shift_left_16');
        bmp = Bitmap::shift_left(bmp, 15);
        assert(bmp == MASK::LEFT_COL, 'shift_right_15');
    }

    #[test]
    #[available_gas(1_000_000_000)]
    fn test_shift_up_fown() {
        let mut bmp = MASK::TOP_ROW;
        assert(Bitmap::shift_down(bmp, 0) == bmp, 'shift_down_zero');
        assert(Bitmap::shift_down(bmp, 16) == 0, 'shift_down_16');
        bmp = Bitmap::shift_down(bmp, 15);
        assert(bmp == MASK::BOTTOM_ROW, 'shift_down_15');
        assert(Bitmap::shift_up(bmp, 0) == bmp, 'shift_up_zero');
        assert(Bitmap::shift_up(bmp, 16) == 0, 'shift_up_16');
        bmp = Bitmap::shift_up(bmp, 15);
        assert(bmp == MASK::TOP_ROW, 'shift_up_15');
    }

    #[test]
    #[available_gas(100_000_000)]
    fn test_bitmap_move_tile() {
        assert(Bitmap::move_tile(0, Dir::North) == 0, '0_North');
        assert(Bitmap::move_tile(0, Dir::East) == 1, '0_East');
        assert(Bitmap::move_tile(0, Dir::West) == 0, '0_West');
        assert(Bitmap::move_tile(0, Dir::South) == 16, '0_South');
        assert(Bitmap::move_tile(0, Dir::Over) == 0, '0_Over');
        assert(Bitmap::move_tile(0, Dir::Under) == 0, '0_Under');

        assert(Bitmap::move_tile(15, Dir::North) == 15, '15_North');
        assert(Bitmap::move_tile(15, Dir::East) == 15, '15_East');
        assert(Bitmap::move_tile(15, Dir::West) == 14, '15_West');
        assert(Bitmap::move_tile(15, Dir::South) == 31, '15_South');
        assert(Bitmap::move_tile(15, Dir::Over) == 15, '15_Over');
        assert(Bitmap::move_tile(15, Dir::Under) == 15, '15_Under');

        assert(Bitmap::move_tile(240, Dir::North) == 224, '240_North');
        assert(Bitmap::move_tile(240, Dir::East) == 241, '240_East');
        assert(Bitmap::move_tile(240, Dir::West) == 240, '240_West');
        assert(Bitmap::move_tile(240, Dir::South) == 240, '240_South');
        assert(Bitmap::move_tile(240, Dir::Over) == 240, '240_Over');
        assert(Bitmap::move_tile(240, Dir::Under) == 240, '240_Under');

        assert(Bitmap::move_tile(255, Dir::North) == 239, '255_North');
        assert(Bitmap::move_tile(255, Dir::East) == 255, '255_East');
        assert(Bitmap::move_tile(255, Dir::West) == 254, '255_West');
        assert(Bitmap::move_tile(255, Dir::South) == 255, '255_South');
        assert(Bitmap::move_tile(255, Dir::Over) == 255, '255_Over');
        assert(Bitmap::move_tile(255, Dir::Under) == 255, '255_Under');

        assert(Bitmap::move_tile(100, Dir::North) == 84, '100_North');
        assert(Bitmap::move_tile(100, Dir::East) == 101, '100_East');
        assert(Bitmap::move_tile(100, Dir::West) == 99, '100_West');
        assert(Bitmap::move_tile(100, Dir::South) == 116, '100_South');
        assert(Bitmap::move_tile(100, Dir::Over) == 100, '100_Over');
        assert(Bitmap::move_tile(100, Dir::Under) == 100, '100_Under');
    }

    fn _test_near(prefix: felt252, bitmap: u256, oks: Array<(usize,usize)>, noks: Array<(usize,usize)>) {
        let mut n: usize = 0;
        loop {
            if (n == oks.len()) { break; }
            let (x, y): (usize, usize) = *oks[n];
            assert(Bitmap::is_near_or_at_xy(bitmap, x, y) == true, String::join(prefix, String::join('oks', (n+65).into())));
            n += 1;
        };
        let mut n: usize = 0;
        loop {
            if (n == noks.len()) { break; }
            let (x, y): (usize, usize) = *noks[n];
            assert(Bitmap::is_near_or_at_xy(bitmap, x, y) == false, String::join(prefix, String::join('noks', (n+65).into())));
            n += 1;
        };
    }    

    #[test]
    #[available_gas(100_000_000_000)]
    fn test_bitmap_is_near() {
        // top left
        let bitmap_0_0: u256 = Bitmap::set_xy(0, 0, 0);
        _test_near('bitmap_0_0', bitmap_0_0,
            array![(0,0), (1,0), (0,1)],
            array![(1,1), (2,1), (1,2), (15,15)],
        );
        // top center
        let bitmap_1_0: u256 = Bitmap::set_xy(0, 1, 0);
        _test_near('bitmap_1_0', bitmap_1_0,
            array![(0,0), (1,0), (2,0), (1,1)],
            array![(0,1), (0,2), (1,2), (2,1), (2,2), (3,0)],
        );
        let bitmap_10_0: u256 = Bitmap::set_xy(0, 10, 0);
        _test_near('bitmap_10_0', bitmap_10_0,
            array![(9,0), (10,0), (11,0), (10,1)],
            array![(9,1), (9,2), (10,2), (11,1), (11,2), (12,0), (0, 0)],
        );
        // top right
        let bitmap_15_0: u256 = Bitmap::set_xy(0, 15, 0);
        _test_near('bitmap_15_0', bitmap_15_0,
            array![(14,0), (15,0), (15,1)],
            array![(13,0), (14,1), (15,2), (0, 0)],
        );

        // bottom left
        let bitmap_0_15: u256 = Bitmap::set_xy(0, 0, 15);
        _test_near('bitmap_0_15', bitmap_0_15,
            array![(0,15), (1,15), (0,14)],
            array![(0,13), (1,14), (2,15), (0,0), (15,15)],
        );
        // bottom center
        let bitmap_1_15: u256 = Bitmap::set_xy(0, 1, 15);
        _test_near('bitmap_1_15', bitmap_1_15,
            array![(0,15), (1,15), (2,15), (1,14)],
            array![(0,13), (0,14), (1,13), (2,14), (3,15), (0,0), (15,15)],
        );
        let bitmap_11_15: u256 = Bitmap::set_xy(0, 11, 15);
        _test_near('bitmap_11_15', bitmap_11_15,
            array![(10,15), (11,15), (12,15), (11,14)],
            array![(10,13), (10,14), (11,13), (12,14), (13,15), (0,0), (15,15)],
        );
        // bottom right
        let bitmap_15_15: u256 = Bitmap::set_xy(0, 15, 15);
        _test_near('bitmap_15_15', bitmap_15_15,
            array![(14,15), (15,14), (15,15)],
            array![(13,14), (14,13), (15,13), (13,15), (0, 0)],
        );

        // left top
        let bitmap_0_1: u256 = Bitmap::set_xy(0, 0, 1);
        _test_near('bitmap_0_1', bitmap_0_1,
            array![(0,0), (0,1), (0,2), (1,1)],
            array![(1,0), (2,1), (1,2), (0,3), (15,15)],
        );
        // left center
        let bitmap_0_11: u256 = Bitmap::set_xy(0, 0, 11);
        _test_near('bitmap_0_11', bitmap_0_11,
            array![(0,10), (0,11), (0,12), (1,11)],
            array![(1,10), (2,11), (1,12), (0,13), (15,15)],
        );

        // right top
        let bitmap_15_1: u256 = Bitmap::set_xy(0, 15, 1);
        _test_near('bitmap_15_1', bitmap_15_1,
            array![(15,0), (15,1), (15,2), (14,1)],
            array![(14,0), (13,1), (14,2), (15,3), (15,15)],
        );
        // right center
        let bitmap_15_11: u256 = Bitmap::set_xy(0, 15, 11);
        _test_near('bitmap_15_11', bitmap_15_11,
            array![(15,10), (15,11), (15,12), (14,11)],
            array![(14,10), (13,11), (14,12), (15,13), (15,15)],
        );

        // middle top-left
        let bitmap_1_1: u256 = Bitmap::set_xy(0, 1, 1);
        _test_near('bitmap_1_1', bitmap_1_1,
            array![(1,0), (0,1), (1,1), (2,1), (1,2)],
            array![(0,0), (2,0), (0,2), (2,2), (1,3), (3,1), (15,15)],
        );
        // middle
        let bitmap_11_11: u256 = Bitmap::set_xy(0, 11, 11);
        _test_near('bitmap_11_11', bitmap_11_11,
            array![(11,10), (10,11), (11,11), (12,11), (11,12)],
            array![(10,10), (12,10), (10,12), (12,12), (11,13), (13,11), (9,11), (11,9), (15,15)],
        );
    }

    fn _test_from_to_array(bitmap: u256, expected_len: usize) -> Array<u8> {
        let array = Bitmap::to_tile_array(bitmap);
        assert(array.len() == expected_len,  String::join('len', (expected_len+48).into()));
        assert(Bitmap::from_tile_array(array.span()) == bitmap, String::join('bmp', (expected_len+48).into()));
        (array)
    }

    #[test]
    #[available_gas(1_000_000_000)]
    fn test_from_to_array() {
        _test_from_to_array(0b0, 0);
        _test_from_to_array(0b10, 1);
        _test_from_to_array(0b100, 1);
        _test_from_to_array(0b1000, 1);
        _test_from_to_array(0b1, 1);
        _test_from_to_array(0b11, 2);
        _test_from_to_array(0b111, 3);
        _test_from_to_array(0b10, 1);
        _test_from_to_array(0b1100, 2);
        _test_from_to_array(0b111000, 3);
        _test_from_to_array(MASK::ALL, 256);
        _test_from_to_array(MASK::TOP_ROW, 16);
        _test_from_to_array(MASK::BOTTOM_ROW, 16);
        _test_from_to_array(MASK::LEFT_COL, 16);
        _test_from_to_array(MASK::RIGHT_COL, 16);
        _test_from_to_array(MASK::OUTER_COLS, 32);
        _test_from_to_array(MASK::INNER_COLS, 256-32);
        _test_from_to_array(MASK::OUTER_ROWS, 32);
        _test_from_to_array(MASK::INNER_ROWS, 256-32);
        _test_from_to_array(MASK::OUTER, 60);
        _test_from_to_array(MASK::INNER, 256-60);
    }
}
