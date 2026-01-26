#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Point {
    pub x: f32,
    pub y: f32,
    pub index: usize,
}

#[derive(Debug, Clone, Copy)]
pub struct Rect {
    pub x_min: f32,
    pub y_min: f32,
    pub x_max: f32,
    pub y_max: f32,
}

impl Rect {
    #[inline(always)]
    pub fn new(x: f32, y: f32, width: f32, height: f32) -> Self {
        Self {
            x_min: x - width,
            y_min: y - height,
            x_max: x + width,
            y_max: y + height,
        }
    }

    #[inline(always)]
    pub fn contains(&self, p: &Point) -> bool {
        // inshallah this gets optimized by compiler
        p.x >= self.x_min && p.x <= self.x_max && p.y >= self.y_min && p.y <= self.y_max
    }

    #[inline(always)]
    pub fn intersects(&self, other: &Rect) -> bool {
        !(other.x_min > self.x_max
            || other.x_max < self.x_min
            || other.y_min > self.y_max
            || other.y_max < self.y_min)
    }
}

pub struct Quadtree {
    boundary: Rect,
    capacity: usize,
    points: Vec<Point>,
    children: Option<Box<[Quadtree; 4]>>,
}

impl Quadtree {
    pub fn new(boundary: Rect, capacity: usize) -> Self {
        Self {
            boundary,
            capacity,
            points: Vec::with_capacity(capacity),
            children: None,
        }
    }

    pub fn insert(&mut self, point: Point) -> bool {
        if !self.boundary.contains(&point) {
            return false;
        }

        if self.children.is_none() {
            if self.points.len() < self.capacity {
                self.points.push(point);
                return true;
            }
            self.subdivide();
        }

        let children = unsafe { self.children.as_mut().unwrap_unchecked() };

        children[0].insert(point)
            || children[1].insert(point)
            || children[2].insert(point)
            || children[3].insert(point)
    }

    fn subdivide(&mut self) {
        let x_mid = (self.boundary.x_min + self.boundary.x_max) * 0.5;
        let y_mid = (self.boundary.y_min + self.boundary.y_max) * 0.5;

        let nw = Quadtree::new(
            Rect {
                x_min: self.boundary.x_min,
                y_min: self.boundary.y_min,
                x_max: x_mid,
                y_max: y_mid,
            },
            self.capacity,
        );
        let ne = Quadtree::new(
            Rect {
                x_min: x_mid,
                y_min: self.boundary.y_min,
                x_max: self.boundary.x_max,
                y_max: y_mid,
            },
            self.capacity,
        );
        let sw = Quadtree::new(
            Rect {
                x_min: self.boundary.x_min,
                y_min: y_mid,
                x_max: x_mid,
                y_max: self.boundary.y_max,
            },
            self.capacity,
        );
        let se = Quadtree::new(
            Rect {
                x_min: x_mid,
                y_min: y_mid,
                x_max: self.boundary.x_max,
                y_max: self.boundary.y_max,
            },
            self.capacity,
        );

        self.children = Some(Box::new([nw, ne, sw, se]));

        for p in self.points.drain(..) {
            for child in self.children.as_mut().unwrap().iter_mut() {
                if child.insert(p) {
                    break;
                }
            }
        }
    }

    pub fn query(&self, range: &Rect, found: &mut Vec<Point>) {
        if !self.boundary.intersects(range) {
            return;
        }

        for point in &self.points {
            if range.contains(point) {
                found.push(*point);
            }
        }

        if let Some(children) = &self.children {
            for child in children.iter() {
                child.query(range, found);
            }
        }
    }
}
