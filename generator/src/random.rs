use rand_core::{impls::fill_bytes_via_next, le::read_u64_into, Error, RngCore, SeedableRng};

/// A counter-based middle-square random number generator.
///
/// The algorithm uses a counter-based implementation of John von Neumann's
/// middle-square random number generator, presented in Bernard Widynski's paper
/// [Squares: A Fast Counter-Based RNG](https://arxiv.org/abs/2004.06278).
///
/// ```ignore
/// use rand::Rng;
///
/// let mut rng = SquaresRng::new(0, 0x548c9decbce65297);
/// let sample: [u64; 3] = rng.gen();
/// assert_eq!(sample, [
///     0x36d88366cee633a5,
///     0x944716e00e60dfaa,
///     0xc8a8f4e0678654bf
/// ]);
/// ```
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SquaresRng {
    counter: u64,
    key: u64,
}

impl SquaresRng {
    /// Create a `SquaresRng` with a counter and an arbitrary key.
    pub fn new(counter: u64, key: u64) -> Self {
        Self { counter, key }
    }
}

impl RngCore for SquaresRng {
    #[inline]
    fn next_u32(&mut self) -> u32 {
        let result = squares_32(self.counter, self.key);
        self.counter += 1;
        result
    }

    #[inline]
    fn next_u64(&mut self) -> u64 {
        let result = squares_64(self.counter, self.key);
        self.counter += 1;
        result
    }

    #[inline]
    fn fill_bytes(&mut self, dest: &mut [u8]) {
        fill_bytes_via_next(self, dest)
    }

    #[inline]
    fn try_fill_bytes(&mut self, dest: &mut [u8]) -> Result<(), Error> {
        Ok(self.fill_bytes(dest))
    }
}

impl SeedableRng for SquaresRng {
    type Seed = [u8; 8];

    /// Create a new `SquaresRng`.
    fn from_seed(seed: [u8; 8]) -> Self {
        let mut state = [0; 1];
        read_u64_into(&seed, &mut state);
        Self {
            counter: 0,
            key: state[0],
        }
    }

    /// Seed a `SquaresRng` from a `u64`.
    fn seed_from_u64(seed: u64) -> Self {
        Self::from_seed(seed.to_le_bytes())
    }
}

/// Generate a random number using the four round counter-based implementation
/// of John von Neumann's middle-square random number generator, presented in
/// Bernard Widynski's paper [Squares: A Fast Counter-Based RNG](https://arxiv.org/abs/2004.06278).
#[inline]
pub const fn squares_32(counter: u64, key: u64) -> u32 {
    let mut x;
    let y;
    let z;

    // Initialization
    //  y = x = counter * key
    //  z = y + key
    x = counter.wrapping_mul(key);
    y = x;
    z = y.wrapping_add(key);

    // Round 1
    //  x = x*x + y
    //  x = (x>>32) | (x<<32)
    x = x.wrapping_mul(x).wrapping_add(y);
    x = (x >> 32) | (x << 32);

    // Round 2
    //  x = x*x + z
    //  x = (x>>32) | (x<<32)
    x = x.wrapping_mul(x).wrapping_add(z);
    x = (x >> 32) | (x << 32);

    // Round 3
    //  x = x*x + y
    //  x = (x>>32) | (x<<32)
    x = x.wrapping_mul(x).wrapping_add(y);
    x = (x >> 32) | (x << 32);

    // Round 4
    //  (x*x + z) >> 32
    ((x.wrapping_mul(x).wrapping_add(z)) >> 32) as u32
}

/// Generate a random number using the five round counter-based implementation
/// of John von Neumann's middle-square random number generator, presented in
/// Bernard Widynski's paper [Squares: A Fast Counter-Based RNG](https://arxiv.org/abs/2004.06278).
#[inline]
pub const fn squares_64(counter: u64, key: u64) -> u64 {
    let mut x;
    let y;
    let z;
    let t;

    // Initialization
    //  y = x = counter * key
    //  z = y + key
    x = counter.wrapping_mul(key);
    y = x;
    z = y.wrapping_add(key);

    // Round 1
    //  x = x*x + y
    //  x = (x>>32) | (x<<32)
    x = x.wrapping_mul(x).wrapping_add(y);
    x = (x >> 32) | (x << 32);

    // Round 2
    //  x = x*x + z
    //  x = (x>>32) | (x<<32)
    x = x.wrapping_mul(x).wrapping_add(z);
    x = (x >> 32) | (x << 32);

    // Round 3
    //  x = x*x + y
    //  x = (x>>32) | (x<<32)
    x = x.wrapping_mul(x).wrapping_add(y);
    x = (x >> 32) | (x << 32);

    // Round 4
    //  t = x = x*x + z
    //  x = (x>>32) | (x<<32)
    x = x.wrapping_mul(x).wrapping_add(z);
    t = x;
    x = (x >> 32) | (x << 32);

    // Round 5
    //  t ^ ((x*x + y) >> 32)
    t ^ (x.wrapping_mul(x).wrapping_add(y) >> 32)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn next_u32() {
        let mut rng = SquaresRng::seed_from_u64(0x548c9decbce65297);

        // Values produced by the reference implementation (`squaresrngv7.zip`).
        // See https://squaresrng.wixsite.com/rand
        let expected: [u32; 100] = [
            0x36d88366, 0x944716e0, 0xc8a8f4e0, 0x35cc666a, 0x7094eab1, 0xa2a1b6f5, 0xd884957d,
            0xe61f37b9, 0xe4d45c47, 0xb0dbd071, 0x4e25c6af, 0xd54d50af, 0x7dab9179, 0xe43baa93,
            0x18b03264, 0xeef7e3a1, 0x1effa688, 0x42b59a95, 0x1de1f790, 0xb405ccc0, 0x88bcdab6,
            0xaceaa3b4, 0xd7ff6132, 0x18c5baf9, 0x113bb169, 0xb820dc1e, 0xcdcec927, 0x702f689f,
            0x6f7116fe, 0x3c098f81, 0x11d035ff, 0xcf307c25, 0xd1fd6e2c, 0x881c37e3, 0x57c8e8e5,
            0xcfe893ce, 0x580cbdeb, 0x4d92ff83, 0x84c5c959, 0x93a1f4ca, 0x1d4025ca, 0x0d2275ef,
            0x90fe8153, 0xeb78bd50, 0xf77b2070, 0xde54a10a, 0x56002a15, 0xb2f88079, 0xefd45592,
            0xb40c852d, 0x3e482fb2, 0xc45e315e, 0x052e4916, 0x294da951, 0xbd523849, 0x61a64b21,
            0x1cf5b347, 0x9a6a218e, 0x2d3fd4ad, 0xfbc198e4, 0xedf3b929, 0x81bc2a2b, 0x70cefddb,
            0x49efc27b, 0x3941543e, 0x3e4e0bbd, 0x12e665d3, 0xd09bb80d, 0x1a7b92c1, 0x009ed8ff,
            0xf016407c, 0x852074d8, 0x68db8ca8, 0xcbd7740d, 0xbddc7795, 0x9b67418d, 0xe8994184,
            0x241af269, 0x83c0dc04, 0xc084d296, 0x73583db1, 0x24c5eb34, 0x27281513, 0x9483d385,
            0xe924f1fa, 0xb251b8dc, 0x64ba7843, 0x884ee1d9, 0x20667555, 0x328baf24, 0xf27f38d9,
            0x87dae6b8, 0x934dc651, 0x7ae552df, 0x31f300c9, 0x5eeb2ed0, 0xd03b7254, 0xb4945fa4,
            0x998e12cd, 0xe00433a3,
        ];

        for &e in expected.iter() {
            assert_eq!(rng.next_u32(), e);
        }
    }

    #[test]
    fn next_u64() {
        let mut rng = SquaresRng::seed_from_u64(0x548c9decbce65297);

        // Values produced by the reference implementation (`squaresrngv7.zip`).
        // See https://squaresrng.wixsite.com/rand
        let expected: [u64; 50] = [
            0x36d88366cee633a5,
            0x944716e00e60dfaa,
            0xc8a8f4e0678654bf,
            0x35cc666aab11c80d,
            0x7094eab1cbae8747,
            0xa2a1b6f56e92a96f,
            0xd884957d48007552,
            0xe61f37b97d593453,
            0xe4d45c4762b10dad,
            0xb0dbd071f201dd2a,
            0x4e25c6af4a5064a7,
            0xd54d50af36134ceb,
            0x7dab917950850951,
            0xe43baa9306de9c8d,
            0x18b032647cb30acf,
            0xeef7e3a14a148ca7,
            0x1effa68839b30880,
            0x42b59a95cab118b3,
            0x1de1f790addcdcc8,
            0xb405ccc03cdd7164,
            0x88bcdab60da7ef96,
            0xaceaa3b4e95f70fb,
            0xd7ff6132ef93b956,
            0x18c5baf9702cee48,
            0x113bb16978d8182c,
            0xb820dc1e480add2a,
            0xcdcec92762e3c589,
            0x702f689f31d43cb6,
            0x6f7116fece0042d6,
            0x3c098f813a7a70cb,
            0x11d035ff056ea74a,
            0xcf307c257fc33fc1,
            0xd1fd6e2c9d3050f1,
            0x881c37e3438cae0c,
            0x57c8e8e54c846b93,
            0xcfe893cef6bf3888,
            0x580cbdeb3b89ce0f,
            0x4d92ff83ad6849fa,
            0x84c5c9591f2585f8,
            0x93a1f4ca5b4a313b,
            0x1d4025cac7be8278,
            0x0d2275ef7222fb0d,
            0x90fe81530ee708de,
            0xeb78bd50af99dbcb,
            0xf77b2070d7742ecf,
            0xde54a10a71c4663a,
            0x56002a15b1dbdaf6,
            0xb2f88079f7cb5bd4,
            0xefd455926d395f9f,
            0xb40c852df3134edd,
        ];

        for &e in expected.iter() {
            assert_eq!(rng.next_u64(), e);
        }
    }

    #[test]
    fn average_u32() {
        const N: usize = 1_000_000;
        const MAX: f64 = u32::MAX as f64;

        let mut rng = SquaresRng::seed_from_u64(0x548c9decbce65297);
        let mut sum: f64 = 0.0;

        for _ in 0..N {
            sum += (rng.next_u32() as f64) / MAX;
        }

        let average = sum / (N as f64);

        assert!(average > 0.49 && average < 0.51);
    }

    #[test]
    fn average_u64() {
        const N: usize = 1_000_000;
        const MAX: f64 = u64::MAX as f64;

        let mut rng = SquaresRng::seed_from_u64(0x548c9decbce65297);
        let mut sum: f64 = 0.0;

        for _ in 0..N {
            sum += (rng.next_u64() as f64) / MAX;
        }

        let average = sum / (N as f64);

        assert!(average > 0.49 && average < 0.51);
    }
}
