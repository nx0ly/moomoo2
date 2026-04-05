pub mod tree;
pub mod stone;
pub mod bush;

pub trait GameObject {
    fn init(&mut self);
    fn destroy(&mut self);
}

pub enum GameObjects {
    UsableGameObjects, PlacableGameObjects, StaticGameObjects
}

// healing
pub enum UsableGameObjects {
    Apple
}

pub enum PlacableGameObjects {
    Block,
}

pub enum StaticGameObjects {
    Tree,
    Stone,
    Bush,
}