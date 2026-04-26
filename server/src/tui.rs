use std::{
    io,
    sync::{atomic::Ordering, Arc},
    time::{Duration, Instant},
};

use bevy_ecs::prelude::Entity;
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind},
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
    ExecutableCommand,
};
use parking_lot::Mutex;
use ratatui::{
    backend::CrosstermBackend,
    layout::{Alignment, Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{
        canvas::{Canvas, Circle, Points},
        Block, BorderType, Borders, Cell, Gauge, Paragraph, Row, Table, TableState, Tabs,
    },
    Frame, Terminal,
};

use crate::{
    errors::InternalGameMessages,
    structs::{
        bevy::{IDToConnection, PlayerMap, World as GameWorld},
        components::{AnimalType, Health, Name, ObjectEntity, Position, Resources},
    },
    systems::Collider,
    GameChannel,
};

#[derive(Clone)]
struct PlayerSnap {
    id:         u8,
    name:       String,
    x:          f32,
    y:          f32,
    health:     f32,
    max_health: f32,
    wood:       u32,
    stone:      u32,
    food:       u32,
    gold:       u32,
    kills:      u32,
    bytes_sent: u64,
    bytes_recv: u64,
}

#[derive(Clone)]
struct AnimalSnap {
    x:      f32,
    y:      f32,
    radius: f32,
    kind:   AnimalType,
}

#[derive(Clone)]
struct ObjectSnap {
    x:      f32,
    y:      f32,
    radius: f32,
}

struct App {
    tab:          usize,
    player_tbl:   TableState,
    net_tbl:      TableState,
    players:      Vec<PlayerSnap>,
    animals:      Vec<AnimalSnap>,
    objects:      Vec<ObjectSnap>,
    show_players: bool,
    show_animals: bool,
    show_objects: bool,
    map_size:     f32,
    start:        Instant,
    status_msg:   Option<(String, Instant)>,
}

impl App {
    fn new(map_size: f32) -> Self {
        let mut player_tbl = TableState::default();
        player_tbl.select(Some(0));
        let mut net_tbl = TableState::default();
        net_tbl.select(Some(0));
        Self {
            tab: 0,
            player_tbl,
            net_tbl,
            players: vec![],
            animals: vec![],
            objects: vec![],
            show_players: true,
            show_animals: true,
            show_objects: true,
            map_size,
            start: Instant::now(),
            status_msg: None,
        }
    }

    fn uptime(&self) -> String {
        let s = self.start.elapsed().as_secs();
        format!("{:02}:{:02}:{:02}", s / 3600, (s % 3600) / 60, s % 60)
    }

    fn active_tbl(&mut self) -> &mut TableState {
        if self.tab == 2 {
            &mut self.net_tbl
        } else {
            &mut self.player_tbl
        }
    }

    fn selected_id(&self) -> Option<u8> {
        let tbl = if self.tab == 2 { &self.net_tbl } else { &self.player_tbl };
        tbl.selected().and_then(|i| self.players.get(i)).map(|p| p.id)
    }

    fn move_sel(&mut self, delta: i32) {
        let len = self.players.len();
        if len == 0 {
            return;
        }
        let tbl = self.active_tbl();
        let cur = tbl.selected().unwrap_or(0) as i32;
        let next = ((cur + delta).rem_euclid(len as i32)) as usize;
        tbl.select(Some(next));
    }

    fn set_status(&mut self, msg: impl Into<String>) {
        self.status_msg = Some((msg.into(), Instant::now()));
    }

    fn status(&self) -> Option<&str> {
        self.status_msg.as_ref().and_then(|(msg, t)| {
            if t.elapsed() < Duration::from_secs(3) {
                Some(msg.as_str())
            } else {
                None
            }
        })
    }
}

pub fn init_tui(world: Arc<Mutex<GameWorld>>, connections: IDToConnection, game_tx: GameChannel) -> anyhow::Result<()> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    stdout.execute(EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;
    terminal.clear()?;

    let map_size = world.lock().config.map.size as f32;
    let mut app = App::new(map_size);

    let tick = Duration::from_millis(100);
    let mut last_tick = Instant::now();

    loop {
        refresh(&world, &connections, &mut app);
        terminal.draw(|f| render(f, &mut app))?;

        let timeout = tick.saturating_sub(last_tick.elapsed());
        if event::poll(timeout)? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('q') | KeyCode::Esc => break,

                        KeyCode::Tab => app.tab = (app.tab + 1) % 3,
                        KeyCode::BackTab => app.tab = (app.tab + 2) % 3,
                        KeyCode::Char('1') => app.tab = 0,
                        KeyCode::Char('2') => app.tab = 1,
                        KeyCode::Char('3') => app.tab = 2,

                        KeyCode::Down | KeyCode::Char('j') => app.move_sel(1),
                        KeyCode::Up | KeyCode::Char('k') => app.move_sel(-1),

                        KeyCode::Char('d') | KeyCode::Char('D') => {
                            if let Some(id) = app.selected_id() {
                                let name = app
                                    .players
                                    .iter()
                                    .find(|p| p.id == id)
                                    .map(|p| p.name.clone())
                                    .unwrap_or_default();
                                let _ = game_tx.try_send((id, InternalGameMessages::Disconnect));
                                connections.remove(&id);
                                app.set_status(format!("Disconnected {} (id {})", name, id));
                            }
                        }

                        KeyCode::Char('p') => {
                            app.show_players = !app.show_players;
                        }
                        KeyCode::Char('a') => {
                            app.show_animals = !app.show_animals;
                        }
                        KeyCode::Char('o') => {
                            app.show_objects = !app.show_objects;
                        }

                        _ => {}
                    }
                }
            }
        }

        if last_tick.elapsed() >= tick {
            last_tick = Instant::now();
        }
    }

    disable_raw_mode()?;
    terminal.backend_mut().execute(LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    Ok(())
}

fn refresh(world: &Arc<Mutex<GameWorld>>, connections: &IDToConnection, app: &mut App) {
    let mut w = world.lock();

    let ids: Vec<(u8, Entity)> = {
        let pm = w.bevy_world.resource::<PlayerMap>();
        pm.map.iter().map(|(k, v)| (*k, *v)).collect()
    };

    app.players = ids
        .iter()
        .filter_map(|(id, entity)| {
            let name = w.bevy_world.get::<Name>(*entity)?.0.clone();
            let pos = *w.bevy_world.get::<Position>(*entity)?;
            let hp = *w.bevy_world.get::<Health>(*entity)?;
            let res = w.bevy_world.get::<Resources>(*entity)?;
            let (wood, stone, food, gold, kills) = (res.0, res.1, res.2, res.3, res.4);
            let (bs, br) = connections
                .get(id)
                .map(|c| {
                    (
                        c.bytes_sent.load(Ordering::Relaxed),
                        c.bytes_recv.load(Ordering::Relaxed),
                    )
                })
                .unwrap_or((0, 0));
            Some(PlayerSnap {
                id: *id,
                name,
                x: pos.0,
                y: pos.1,
                health: hp.0,
                max_health: hp.1,
                wood,
                stone,
                food,
                gold,
                kills,
                bytes_sent: bs,
                bytes_recv: br,
            })
        })
        .collect();
    app.players.sort_by_key(|p| p.id);

    {
        let mut q = w.bevy_world.query::<(&Position, &AnimalType)>();
        app.animals = q
            .iter(&w.bevy_world)
            .take(2048)
            .map(|(pos, kind)| AnimalSnap {
                x:      pos.0,
                y:      pos.1,
                radius: match kind {
                    AnimalType::Wolf => 25.0,
                    AnimalType::Fish => 10.0,
                },
                kind:   *kind,
            })
            .collect();
    }

    {
        let mut q = w.bevy_world.query::<(&Position, &Collider, &ObjectEntity)>();
        app.objects = q
            .iter(&w.bevy_world)
            .map(|(pos, col, _)| ObjectSnap {
                x:      pos.0,
                y:      pos.1,
                radius: col.rad,
            })
            .collect();
    }
}

fn render(f: &mut Frame, app: &mut App) {
    let area = f.area();

    f.render_widget(
        Block::default().style(Style::default().bg(Color::Rgb(16, 16, 16))),
        area,
    );

    let root = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Length(3), Constraint::Min(0), Constraint::Length(3)])
        .split(area);

    render_header(f, app, root[0]);

    match app.tab {
        0 => render_players(f, app, root[1]),
        1 => render_minimap(f, app, root[1]),
        2 => render_network(f, app, root[1]),
        _ => {}
    }

    render_footer(f, app, root[2]);
}

fn render_header(f: &mut Frame, app: &mut App, area: Rect) {
    let player_count = app.players.len();
    let uptime = app.uptime();
    let animal_count = app.animals.len();
    let object_count = app.objects.len();

    let title = Span::styled(
        format!(
            "Admin Panel  Players: {}  Uptime: {}  Animals: {}  Objects: {} ",
            player_count, uptime, animal_count, object_count,
        ),
        Style::default().fg(Color::White).add_modifier(Modifier::BOLD),
    );

    let tabs = Tabs::new(["  1: Players  ", "  2: Minimap  ", "  3: Network  "])
        .select(app.tab)
        .style(Style::default().fg(Color::Rgb(80, 80, 100)))
        .highlight_style(
            Style::default()
                .fg(Color::Black)
                .bg(Color::Cyan)
                .add_modifier(Modifier::BOLD),
        )
        .divider(Span::styled("│", Style::default().fg(Color::Rgb(50, 50, 70))))
        .block(
            Block::default()
                .borders(Borders::ALL)
                .border_type(BorderType::Rounded)
                .border_style(Style::default().fg(Color::Cyan))
                .title(title),
        );

    f.render_widget(tabs, area);
}

fn render_players(f: &mut Frame, app: &mut App, area: Rect) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Min(0), Constraint::Length(5)])
        .split(area);

    let header = Row::new(vec![
        "ID", "Name", "Position", "HP", "Kills", "Wood", "Stone", "Food", "Gold",
    ])
    .style(
        Style::default()
            .fg(Color::Cyan)
            .add_modifier(Modifier::BOLD | Modifier::UNDERLINED),
    )
    .height(1);

    let rows: Vec<Row> = app
        .players
        .iter()
        .map(|p| {
            let hp_pct = if p.max_health > 0.0 {
                p.health / p.max_health
            } else {
                0.0
            };
            let hp_color = health_color(hp_pct);

            Row::new(vec![
                Cell::from(format!("{:03}", p.id)).style(Style::default().fg(Color::Rgb(100, 100, 140))),
                Cell::from(p.name.clone()).style(Style::default().fg(Color::White).add_modifier(Modifier::BOLD)),
                Cell::from(format!("({:.0}, {:.0})", p.x, p.y)).style(Style::default().fg(Color::Rgb(120, 120, 160))),
                Cell::from(format!("{:.0}/{:.0}", p.health, p.max_health)).style(Style::default().fg(hp_color)),
                Cell::from(p.kills.to_string()).style(Style::default().fg(Color::Rgb(220, 80, 80))),
                Cell::from(p.wood.to_string()).style(Style::default().fg(Color::Rgb(160, 100, 40))),
                Cell::from(p.stone.to_string()).style(Style::default().fg(Color::Rgb(160, 160, 160))),
                Cell::from(p.food.to_string()).style(Style::default().fg(Color::Rgb(80, 180, 80))),
                Cell::from(p.gold.to_string()).style(Style::default().fg(Color::Rgb(220, 180, 40))),
            ])
        })
        .collect();

    let widths = [
        Constraint::Length(4),
        Constraint::Length(16),
        Constraint::Length(16),
        Constraint::Length(11),
        Constraint::Length(6),
        Constraint::Length(7),
        Constraint::Length(7),
        Constraint::Length(7),
        Constraint::Length(7),
    ];

    let table = Table::new(rows, widths)
        .header(header)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .border_type(BorderType::Rounded)
                .border_style(Style::default().fg(Color::Rgb(40, 80, 140)))
                .title(Span::styled(
                    " Players ",
                    Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
                ))
                .style(Style::default().bg(Color::Rgb(10, 12, 20))),
        )
        .row_highlight_style(Style::default().bg(Color::Rgb(25, 40, 70)).add_modifier(Modifier::BOLD))
        .highlight_symbol("▶ ");

    f.render_stateful_widget(table, chunks[0], &mut app.player_tbl);

    let detail_block = Block::default()
        .borders(Borders::ALL)
        .border_type(BorderType::Rounded)
        .border_style(Style::default().fg(Color::Rgb(40, 80, 140)))
        .title(Span::styled(
            " Selected Player ",
            Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
        ))
        .style(Style::default().bg(Color::Rgb(10, 12, 20)));

    let selected_idx = app.player_tbl.selected();
    if let Some(p) = selected_idx.and_then(|i| app.players.get(i)) {
        let hp_pct = if p.max_health > 0.0 {
            (p.health / p.max_health) as f64
        } else {
            0.0
        };
        let hp_color = health_color(hp_pct as f32);

        let gauge = Gauge::default()
            .block(detail_block)
            .gauge_style(Style::default().fg(hp_color).bg(Color::Rgb(30, 20, 20)))
            .ratio(hp_pct.clamp(0.0, 1.0))
            .label(format!(
                "{}  |  HP {:.0}/{:.0}  |  Kills {}  |  [D] Disconnect",
                p.name, p.health, p.max_health, p.kills
            ));

        f.render_widget(gauge, chunks[1]);
    } else {
        let hint = Paragraph::new(Line::from(vec![
            Span::styled(
                "↑↓ / j k",
                Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                "  to select a player   ",
                Style::default().fg(Color::Rgb(120, 120, 140)),
            ),
            Span::styled("D", Style::default().fg(Color::Red).add_modifier(Modifier::BOLD)),
            Span::styled("  to disconnect", Style::default().fg(Color::Rgb(120, 120, 140))),
        ]))
        .block(detail_block)
        .alignment(Alignment::Center);
        f.render_widget(hint, chunks[1]);
    }
}

fn render_minimap(f: &mut Frame, app: &mut App, area: Rect) {
    let chunks = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Min(0), Constraint::Length(24)])
        .split(area);

    let map_sz = app.map_size as f64;

    let to_canvas_y = |y: f32| map_sz - y as f64;

    let players = app.players.clone();
    let animals = app.animals.clone();
    let objects = app.objects.clone();
    let show_p = app.show_players;
    let show_a = app.show_animals;
    let show_o = app.show_objects;

    let canvas = Canvas::default()
        .block(
            Block::default()
                .borders(Borders::ALL)
                .border_type(BorderType::Rounded)
                .border_style(Style::default().fg(Color::Rgb(40, 80, 140)))
                .title(Span::styled(
                    " Minimap ",
                    Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
                ))
                .style(Style::default().bg(Color::Rgb(8, 14, 10))),
        )
        .x_bounds([0.0, map_sz])
        .y_bounds([0.0, map_sz])
        .paint(move |ctx| {
            if show_o {
                for obj in &objects {
                    ctx.draw(&Circle {
                        x:      obj.x as f64,
                        y:      to_canvas_y(obj.y),
                        radius: (obj.radius as f64).max(60.0),
                        color:  Color::Rgb(120, 80, 30),
                    });
                }
            }

            if show_a {
                let fish: Vec<(f64, f64)> = animals
                    .iter()
                    .filter(|a| matches!(a.kind, AnimalType::Fish))
                    .map(|a| (a.x as f64, to_canvas_y(a.y)))
                    .collect();

                if !fish.is_empty() {
                    ctx.draw(&Points {
                        coords: &fish,
                        color:  Color::Rgb(40, 200, 200),
                    });
                }

                for wolf in animals.iter().filter(|a| matches!(a.kind, AnimalType::Wolf)) {
                    ctx.draw(&Circle {
                        x:      wolf.x as f64,
                        y:      to_canvas_y(wolf.y),
                        radius: 100.0,
                        color:  Color::Rgb(220, 100, 20),
                    });
                }
            }

            if show_p {
                for p in &players {
                    ctx.draw(&Circle {
                        x:      p.x as f64,
                        y:      to_canvas_y(p.y),
                        radius: 140.0,
                        color:  Color::Rgb(60, 255, 100),
                    });

                    ctx.print(
                        p.x as f64,
                        to_canvas_y(p.y) - 220.0,
                        Span::styled(
                            p.name.clone(),
                            Style::default().fg(Color::White).add_modifier(Modifier::BOLD),
                        ),
                    );
                }
            }
        });

    f.render_widget(canvas, chunks[0]);

    let on_style = Style::default().fg(Color::Rgb(255, 255, 255));
    let off_style = Style::default().fg(Color::Rgb(180, 180, 180));

    let lines = vec![
        Line::from(Span::styled(
            " Legend",
            Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
        )),
        Line::from(""),
        Line::from(vec![
            Span::styled("● ", Style::default().fg(Color::Rgb(60, 255, 100))),
            Span::styled(
                format!("[P] Players ({})", if show_p { "on " } else { "off" }),
                if show_p { on_style } else { off_style },
            ),
        ]),
        Line::from(vec![
            Span::styled("● ", Style::default().fg(Color::Rgb(40, 200, 200))),
            Span::styled(
                format!("[A] Fish    ({})", if show_a { "on " } else { "off" }),
                if show_a { on_style } else { off_style },
            ),
        ]),
        Line::from(vec![
            Span::styled("● ", Style::default().fg(Color::Rgb(220, 100, 20))),
            Span::styled(
                format!("    Wolves  ({})", if show_a { "on " } else { "off" }),
                if show_a { on_style } else { off_style },
            ),
        ]),
        Line::from(vec![
            Span::styled("● ", Style::default().fg(Color::Rgb(120, 80, 30))),
            Span::styled(
                format!("[O] Objects ({})", if show_o { "on " } else { "off" }),
                if show_o { on_style } else { off_style },
            ),
        ]),
    ];

    let legend = Paragraph::new(lines).block(
        Block::default()
            .borders(Borders::ALL)
            .border_type(BorderType::Rounded)
            .border_style(Style::default().fg(Color::Rgb(40, 80, 140)))
            .style(Style::default().bg(Color::Rgb(10, 12, 20))),
    );

    f.render_widget(legend, chunks[1]);
}

fn render_network(f: &mut Frame, app: &mut App, area: Rect) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Min(0), Constraint::Length(5)])
        .split(area);

    let header = Row::new(vec!["ID", "Name", "↑ Sent", "↓ Recv", "Total", "Action"])
        .style(
            Style::default()
                .fg(Color::Cyan)
                .add_modifier(Modifier::BOLD | Modifier::UNDERLINED),
        )
        .height(1);

    let rows: Vec<Row> = app
        .players
        .iter()
        .map(|p| {
            let total = p.bytes_sent + p.bytes_recv;
            Row::new(vec![
                Cell::from(format!("{:03}", p.id)).style(Style::default().fg(Color::Rgb(100, 100, 140))),
                Cell::from(p.name.clone()).style(Style::default().fg(Color::White).add_modifier(Modifier::BOLD)),
                Cell::from(fmt_bytes(p.bytes_sent)).style(Style::default().fg(Color::Rgb(60, 200, 100))),
                Cell::from(fmt_bytes(p.bytes_recv)).style(Style::default().fg(Color::Rgb(60, 140, 220))),
                Cell::from(fmt_bytes(total)).style(Style::default().fg(Color::Rgb(180, 180, 220))),
                Cell::from("[D] Kick").style(
                    Style::default()
                        .fg(Color::Rgb(200, 60, 60))
                        .add_modifier(Modifier::BOLD),
                ),
            ])
        })
        .collect();

    let widths = [
        Constraint::Length(4),
        Constraint::Length(16),
        Constraint::Length(12),
        Constraint::Length(12),
        Constraint::Length(12),
        Constraint::Length(10),
    ];

    let table = Table::new(rows, widths)
        .header(header)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .border_type(BorderType::Rounded)
                .border_style(Style::default().fg(Color::Rgb(40, 80, 140)))
                .title(Span::styled(
                    " Network Traffic (cumulative) ",
                    Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
                ))
                .style(Style::default().bg(Color::Rgb(10, 12, 20))),
        )
        .row_highlight_style(Style::default().bg(Color::Rgb(25, 40, 70)).add_modifier(Modifier::BOLD))
        .highlight_symbol("▶ ");

    f.render_stateful_widget(table, chunks[0], &mut app.net_tbl);

    let detail_block = Block::default()
        .borders(Borders::ALL)
        .border_type(BorderType::Rounded)
        .border_style(Style::default().fg(Color::Rgb(40, 80, 140)))
        .title(Span::styled(
            " Connection Detail ",
            Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
        ))
        .style(Style::default().bg(Color::Rgb(10, 12, 20)));

    let selected_idx = app.net_tbl.selected();
    if let Some(p) = selected_idx.and_then(|i| app.players.get(i)) {
        let total = p.bytes_sent + p.bytes_recv;
        let send_ratio = if total > 0 {
            p.bytes_sent as f64 / total as f64
        } else {
            0.0
        };

        let detail = Paragraph::new(vec![Line::from(vec![
            Span::styled(
                format!(" {} ", p.name),
                Style::default().fg(Color::White).add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                format!("id:{:03}  ", p.id),
                Style::default().fg(Color::Rgb(100, 100, 140)),
            ),
            Span::styled("↑ ", Style::default().fg(Color::Rgb(60, 200, 100))),
            Span::styled(fmt_bytes(p.bytes_sent), Style::default().fg(Color::Rgb(60, 200, 100))),
            Span::styled("   ↓ ", Style::default().fg(Color::Rgb(60, 140, 220))),
            Span::styled(fmt_bytes(p.bytes_recv), Style::default().fg(Color::Rgb(60, 140, 220))),
            Span::styled(
                format!("   total: {}  ", fmt_bytes(total)),
                Style::default().fg(Color::Rgb(180, 180, 220)),
            ),
            Span::styled(
                format!("  send ratio: {:.1}%  ", send_ratio * 100.0),
                Style::default().fg(Color::Rgb(140, 140, 180)),
            ),
            Span::styled(
                "  [D] Disconnect",
                Style::default()
                    .fg(Color::Rgb(200, 60, 60))
                    .add_modifier(Modifier::BOLD),
            ),
        ])])
        .block(detail_block)
        .alignment(Alignment::Left);

        f.render_widget(detail, chunks[1]);
    } else {
        let hint = Paragraph::new(Line::from(Span::styled(
            "Select a player with ↑↓ / j k",
            Style::default().fg(Color::Rgb(80, 80, 110)),
        )))
        .block(detail_block)
        .alignment(Alignment::Center);
        f.render_widget(hint, chunks[1]);
    }
}

fn render_footer(f: &mut Frame, app: &App, area: Rect) {
    let status = app.status().map(|s| s.to_string());

    let content = if let Some(msg) = status {
        Line::from(vec![
            Span::styled(" ✓ ", Style::default().fg(Color::Green)),
            Span::styled(msg, Style::default().fg(Color::White)),
        ])
    } else {
        let keys: &[(&str, &str)] = &[
            ("Tab", "Switch"),
            ("↑↓/jk", "Navigate"),
            ("D", "Disconnect"),
            ("P/A/O", "Toggle layers"),
            ("Q/Esc", "Quit"),
        ];
        let mut spans: Vec<Span> = vec![];
        for (i, (key, desc)) in keys.iter().enumerate() {
            if i > 0 {
                spans.push(Span::styled("  │  ", Style::default().fg(Color::Rgb(50, 50, 70))));
            }
            spans.push(Span::styled(
                format!("[{}]", key),
                Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
            ));
            spans.push(Span::styled(
                format!(" {}", desc),
                Style::default().fg(Color::Rgb(120, 120, 160)),
            ));
        }
        Line::from(spans)
    };

    let footer = Paragraph::new(content)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .border_type(BorderType::Rounded)
                .border_style(Style::default().fg(Color::Rgb(40, 40, 60)))
                .style(Style::default().bg(Color::Rgb(10, 12, 20))),
        )
        .alignment(Alignment::Center);

    f.render_widget(footer, area);
}

fn health_color(pct: f32) -> Color {
    if pct > 0.6 {
        Color::Rgb(60, 220, 80)
    } else if pct > 0.3 {
        Color::Rgb(220, 180, 40)
    } else {
        Color::Rgb(220, 60, 60)
    }
}

fn fmt_bytes(b: u64) -> String {
    if b >= 1_073_741_824 {
        format!("{:.2} GB", b as f64 / 1_073_741_824.0)
    } else if b >= 1_048_576 {
        format!("{:.2} MB", b as f64 / 1_048_576.0)
    } else if b >= 1_024 {
        format!("{:.1} KB", b as f64 / 1_024.0)
    } else {
        format!("{} B", b)
    }
}
