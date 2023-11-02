use traits::Into;
use debug::PrintTrait;
use underdark::utils::hash::{hash_u128, hash_u128_to_u256};

// https://github.com/starkware-libs/cairo/blob/main/corelib/src/starknet/info.cairo
use starknet::get_block_info;

fn get_block_hash() -> u128 {
    // let block_number = get_block_number();
    // let block_timestamp = get_block_timestamp();
    let block_info = get_block_info().unbox();
    hash_u128(block_info.block_number.into(), block_info.block_timestamp.into())
}

fn make_seed(location: u128) -> u256 {
    _make_seed(location, get_block_hash())
}

fn _make_seed(location: u128, block_hash: u128) -> u256 {
    let h = hash_u128(location, block_hash);
    hash_u128_to_u256(h)
}

fn make_underseed(seed: u256) -> u256 {
    let h = hash_u128(seed.low, seed.high);
    seed & hash_u128_to_u256(h)
}

fn make_overseed(seed: u256) -> u256 {
    let h = hash_u128(seed.low, seed.high);
    seed | hash_u128_to_u256(h)
}


//----------------------------------------
// Unit  tests
//
#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use underdark::utils::bitwise::{U256Bitwise};
    use underdark::core::seeder::{
        get_block_hash,
        _make_seed,
        make_seed,
        make_underseed,
        make_overseed,
    };

    #[test]
    #[available_gas(100_000)]
    fn test_get_block_hash() {
        let h = get_block_hash();
        // h.print()
        assert(h != 0, 'block hash');
    }


    #[test]
    #[available_gas(100_000_000)]
    fn test_make_seed() {
        let s1 = _make_seed(1, 1);
        let s2 = _make_seed(1, 2);
        let s3 = _make_seed(2, 1);
        let s4 = _make_seed(2, 2);
        assert(s1.low !=s1.high, 's1 h/l');
        assert(s2.low !=s2.high, 's2 h/l');
        assert(s3.low !=s3.high, 's3 h/l');
        assert(s4.low !=s4.high, 's4 h/l');
        assert(s1!=s2 && s1!=s3 && s1!=s4, 's1');
        assert(s2!=s1 && s2!=s3 && s2!=s4, 's2');
        assert(s3!=s1 && s3!=s2 && s3!=s4, 's3');
        assert(s4!=s1 && s4!=s2 && s4!=s3, 's4');
    }

    #[test]
    #[available_gas(1_000_000_000)]
    fn test_under_over_seed() {
        let mut n: usize = 0;
        loop {
            if n == 8 { break; }
            let seed = _make_seed(1, 2);
            let under = make_underseed(seed);
            let over = make_overseed(seed);
            assert(U256Bitwise::count_bits(under) < U256Bitwise::count_bits(seed), 'under < seed');
            assert(U256Bitwise::count_bits(seed) < U256Bitwise::count_bits(over), 'seed < over');
            n += 1;
        };
    }
}
