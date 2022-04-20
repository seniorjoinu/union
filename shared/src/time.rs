const NANO: u64 = 1_000_000_000;

pub const fn secs(secs: u64) -> u64 {
    secs * NANO
}

pub const fn mins(mins: u64) -> u64 {
    mins * secs(60)
}

pub const fn hours(hours: u64) -> u64 {
    hours * mins(60)
}

pub const fn days(days: u64) -> u64 {
    days * hours(24)
}

pub const fn weeks(weeks: u64) -> u64 {
    weeks * days(7)
}
