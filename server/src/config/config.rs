use config::File;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub map: MapConfig,
    pub players: PlayerConfig,
    pub entities: EntityConfig,
    pub animals: AnimalConfig,
}

#[derive(Debug, Deserialize)]
pub struct MapConfig {
    pub size: u16,

    pub snow_start: u16,
    pub snow_end: u16,

    pub grassland_start: u16,
    pub grassland_end: u16,

    pub desert_start: u16,
    pub desert_end: u16,

    pub lava_start: u16,
    pub lava_end: u16,

    pub ocean_start_x: u16,
    pub ocean_end_x: u16,
}

#[derive(Debug, Deserialize)]
pub struct PlayerConfig {
    pub update_dt: f32,
    pub player_max_speed: f32,
    pub player_acceleration: f32,
    pub player_friction: f32,
}

#[derive(Debug, Deserialize)]
pub struct EntityConfig {
    pub trees_per_chunk: u8,
    pub bushes_per_chunk: u8,
    pub stones_per_chunk: u8,
    pub gold_per_chunk: u8,
}

#[derive(Debug, Deserialize)]
pub struct AnimalConfig {
    pub max_fish_alive: u16,
    pub max_wolf: u8,
    pub fish_turn_factor: f32,
}

pub fn load_config() -> Result<Config, config::ConfigError> {
    let config = config::Config::builder()
        .add_source(File::with_name("src/config/config.toml"))
        .build()?;
    config.try_deserialize()
}
