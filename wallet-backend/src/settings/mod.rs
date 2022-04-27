use candid::{CandidType, Deserialize, Principal};
use shared::sorted_by_timestamp::SortedByTimestamp;
use shared::validation::{validate_and_trim_str, ValidationError};

#[derive(CandidType, Deserialize)]
pub struct Settings {
    gateway: Principal,
    history_ledgers: SortedByTimestamp<Principal>,
    name: String,
    description: String,
}

impl Settings {
    pub fn new(
        gateway: Principal,
        history_ledger: Principal,
        name: String,
        description: String,
        timestamp: u64,
    ) -> Result<Self, ValidationError> {
        let mut it = Self {
            gateway,
            history_ledgers: SortedByTimestamp::default(),
            name: Self::process_name(name)?,
            description: Self::process_description(description)?,
        };

        it.add_history_ledger(history_ledger, timestamp);

        Ok(it)
    }

    pub fn update(
        &mut self,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), ValidationError> {
        if let Some(name) = new_name {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = new_description {
            self.description = Self::process_description(description)?;
        }

        Ok(())
    }

    pub fn add_history_ledger(&mut self, history_ledger: Principal, timestamp: u64) {
        self.history_ledgers.push(timestamp, history_ledger);
    }

    pub fn get_gateway(&self) -> &Principal {
        &self.gateway
    }

    pub fn get_most_actual_by_history_ledger(&self, to: &u64) -> &Principal {
        // unwrapping, because it is guarantied that there is at least one ledger
        let ledgers = self.history_ledgers.most_actual_by(to).unwrap();
        ledgers.iter().next().unwrap()
    }

    pub fn get_history_ledgers_by_interval(&mut self, from: &u64, to: &u64) -> Vec<&Principal> {
        self.history_ledgers.get_by_interval(from, to)
    }

    pub fn get_history_ledgers(&self) -> Vec<&Principal> {
        self.history_ledgers.get_all()
    }

    pub fn get() -> &'static mut Settings {
        get_settings()
    }

    fn process_name(name: String) -> Result<String, ValidationError> {
        validate_and_trim_str(name, 1, 200, "Union name")
    }

    fn process_description(description: String) -> Result<String, ValidationError> {
        validate_and_trim_str(description, 0, 2000, "Union description")
    }
}

static mut SETTINGS: Option<Settings> = None;

pub fn init_settings(gateway: Principal, history_ledger: Principal, timestamp: u64) {
    unsafe { SETTINGS = Some(Settings::new(gateway, history_ledger, timestamp)) }
}

fn get_settings() -> &'static mut Settings {
    unsafe { SETTINGS.as_mut().unwrap() }
}

pub fn take_settings() -> Option<Settings> {
    unsafe { SETTINGS.take() }
}

pub fn set_settings(settings: Option<Settings>) {
    unsafe { SETTINGS = settings }
}
