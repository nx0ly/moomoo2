use bevy_ecs::system::Query;
use shared::structs::server::Player;

type AttackQuery<'a> = Query<'a, 'a, (&'a mut Player)>;
pub fn attack_system(mut query: AttackQuery) {
    // i guess you could make a vec to hold all current players attacking.
    // this works too.
    query.iter().filter(|x| x.attacked).for_each(|x| {
        // get all entities within reach and figure out what to do.
    });
}
