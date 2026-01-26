use std::collections::HashMap;

pub struct SpatialHash {
    cell_size: f32,
    pub grid: HashMap<u64, Vec<usize>>,
}

impl SpatialHash {
    pub fn new(cell_size: f32) -> Self {
        Self {
            cell_size,
            grid: HashMap::with_capacity(1024),
        }
    }

    pub fn clear(&mut self) {
        for list in self.grid.values_mut() {
            list.clear();
        }
    }

    #[inline(always)]
    fn hash(&self, x: f32, y: f32) -> u64 {
        let gx = (x / self.cell_size).floor() as i32 as u64;
        let gy = (y / self.cell_size).floor() as i32 as u64;

        // double check
        (gx << 32) | (gy & 0xFFFFFFFF)
    }

    pub fn insert(&mut self, x: f32, y: f32, index: usize) {
        let key = self.hash(x, y);
        self.grid
            .entry(key)
            .or_insert_with(|| Vec::with_capacity(8))
            .push(index);
    }

    pub fn query(&self, x: f32, y: f32, radius: f32, found: &mut Vec<usize>) {
        let min_x = ((x - radius) / self.cell_size).floor() as i32;
        let max_x = ((x + radius) / self.cell_size).floor() as i32;
        let min_y = ((y - radius) / self.cell_size).floor() as i32;
        let max_y = ((y + radius) / self.cell_size).floor() as i32;

        for gx in min_x..=max_x {
            for gy in min_y..=max_y {
                let key = ((gx as u64) << 32) | ((gy as u64) & 0xFFFFFFFF);
                if let Some(entities) = self.grid.get(&key) {
                    found.extend(entities);
                }
            }
        }
    }
}
