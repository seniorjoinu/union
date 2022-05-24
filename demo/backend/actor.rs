use std::collections::{HashMap};
use ic_cdk::export::candid::{export_service, CandidType, Deserialize, Principal};
use ic_cdk::{caller, trap};
use ic_cdk::api::time;
use ic_cdk_macros::{query, update, init, post_upgrade, pre_upgrade};

pub type PostId = u64;

#[derive(CandidType, Deserialize)]
pub struct State {
    pub ids_counter: u64,
    pub posts: HashMap<PostId, Post>,
    pub order: Vec<PostId>,
    pub by_owner: HashMap<Principal, Vec<PostId>>,
    pub profiles: HashMap<Principal, Profile>,
    pub activities: HashMap<PostId, HashMap<Principal, Activity>>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Profile {
    pub id: Principal,
    pub name: String,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Activity {
    heart: bool,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Post {
    pub id: PostId,
    pub content: String,
    pub created_at: u64,
    pub author: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct EditProfileRequest {
    name: String,
}

#[derive(CandidType, Deserialize)]
pub struct GetPostsRequest {
    from: Option<u8>,
    take: Option<u8>,
    owner: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct SetActivityRequest {
    post_id: PostId,
    heart: Option<bool>,
}

#[derive(CandidType, Deserialize)]
pub struct GetPostsResponse {
    total_len: usize,
    posts: Vec<Post>,
}

#[derive(CandidType, Deserialize)]
pub struct GetActivityResponse {
    hearts: Vec<Profile>,
}

#[derive(CandidType, Deserialize)]
pub struct AddPostRequest {
    content: String,
}

#[query]
fn get_posts(req: GetPostsRequest) -> GetPostsResponse {
    let default = vec![];
    let target_ids = match req.owner {
        Some(owner) => &get_state().by_owner.get(&owner).unwrap_or(&default),
        None => &get_state().order,
    };

    let from = usize::from(req.from.unwrap_or(0));
    let take = usize::from(req.take.unwrap_or(5));
    let end = std::cmp::min(target_ids.len(), from + take);

    let ids = target_ids
        .get(from..end)
        .unwrap_or_default();

    let posts = ids.iter().map(|id| { get_state().posts.get(id).unwrap().clone() }).collect();

    GetPostsResponse { posts, total_len: target_ids.len() }
}

#[query]
fn get_post(id: PostId) -> Post {
    get_state().posts.get(&id).unwrap().clone()
}

#[update(guard = "not_anonymous")]
fn add_post(req: AddPostRequest) -> PostId {
    if req.content.trim().len() < 5 {
        trap("Content must be longer than 5 symbols");
    }

    let mut state = get_state();
    let post_id = state.ids_counter + 1;

    let post = Post {
        id: post_id,
        content: req.content,
        author: caller(),
        created_at: time(),
    };

    state.posts.insert(post_id, post);
    state.order.insert(0, post_id);
    let owner_post_ids = state.by_owner.entry(caller()).or_insert(vec![]);
    owner_post_ids.push(post_id);

    state.ids_counter = post_id;
    post_id
}

#[query]
fn get_profile(id: Principal) -> Profile {
    let default_profile = Profile { id, name: "".to_string() };
    get_state().profiles.get(&id).unwrap_or(&default_profile).clone()
}

#[update(guard = "not_anonymous")]
fn edit_profile(req: EditProfileRequest) {
    let mut profile = get_state().profiles.entry(caller()).or_insert(Profile {
        id: caller(),
        name: req.name.clone(),
    });

    profile.name = req.name;
}

#[update(guard = "not_anonymous")]
fn set_activity(req: SetActivityRequest) {
    if get_state().posts.get(&req.post_id).is_none() {
        trap("Post does not exist");
    }
    
    match req.heart {
        Some(heart) => {
            let activity = get_state().activities.entry(req.post_id).or_insert(HashMap::new());
            let mut record = activity.entry(caller()).or_insert(Activity {
                heart,
            });

            record.heart = heart;
        },
        None => {},
    };
}

#[query]
fn get_activity(post_id: PostId) -> GetActivityResponse {
    if get_state().posts.get(&post_id).is_none() {
        trap("Post does not exist");
    }

    let hearts = match get_state().activities.get(&post_id) {
        Some(activity) => {
            activity.keys()
                .filter(|k| activity.get(k).unwrap().heart)
                .map(|k| {
                    let default_profile = Profile { id: k.clone(), name: "".to_string() };
                    get_state().profiles.get(k).unwrap_or(&default_profile).clone()
                })
                .collect::<Vec<_>>()
        },
        _ => vec![],
    };

    GetActivityResponse { hearts }
}

#[init]
fn init() {
    ic_certified_assets::init();
    let state = State {
        ids_counter: 0,
        posts: HashMap::new(),
        order: vec![],
        by_owner: HashMap::new(),
        profiles: HashMap::new(),
        activities: HashMap::new(),
    };

    unsafe {
        STATE = Some(state);
    }
}

#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::storage::stable_save((ic_certified_assets::pre_upgrade(),))
        .expect("failed to save stable state");
}

#[post_upgrade]
fn post_upgrade() {
    let (stable_state,): (ic_certified_assets::StableState,) =
        ic_cdk::storage::stable_restore().expect("failed to restore stable state");
    ic_certified_assets::post_upgrade(stable_state);
}

export_service!();

#[query]
fn export_candid() -> String {
    __export_service()
}

static mut STATE: Option<State> = None;

pub fn get_state() -> &'static mut State {
    unsafe { STATE.as_mut().unwrap() }
}

const ANONYMOUS_SUFFIX: u8 = 4;
pub fn not_anonymous() -> Result<(), String> {
    let principal = caller();
    let bytes = &principal.as_ref();

    match bytes.len() {
        1 if bytes[0] == ANONYMOUS_SUFFIX => Err("Anonymous principal not allowed".to_string()),
        _ => Ok(()),
    }
}