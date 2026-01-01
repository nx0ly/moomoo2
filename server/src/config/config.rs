use config::File;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub map: MapConfig,
}

#[derive(Debug, Deserialize)]
pub struct MapConfig {
    pub size: u16,
}

pub fn load_config() -> Result<Config, config::ConfigError> {
    let config = config::Config::builder()
        .add_source(File::with_name("src/config/config.toml"))
        .build()?;
    config.try_deserialize()
}
