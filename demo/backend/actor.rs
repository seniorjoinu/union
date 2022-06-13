use crate::utils::{create_execute_request, AccessConfigId, GroupId, Shares};
use ic_cdk::api::call::call_raw;
use ic_cdk::api::time;
use ic_cdk::export::candid::{export_service, CandidType, Deserialize, Principal};
use ic_cdk::print;
use ic_cdk::{caller, spawn, trap};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use std::collections::HashMap;

mod utils;

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
    pub name: Option<String>,
    pub union_group_id: Option<GroupId>,
    pub union_access_config_id: Option<AccessConfigId>,
}

impl Profile {
    pub fn new(
        id: Principal,
        name: Option<String>,
        union_group_id: Option<GroupId>,
        union_access_config_id: Option<AccessConfigId>,
    ) -> Self {
        Self {
            id,
            name,
            union_group_id,
            union_access_config_id,
        }
    }
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
    name: Option<String>,
    union_group_id: Option<GroupId>,
    union_access_config_id: Option<AccessConfigId>,
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
    alias_principal: Option<Principal>,
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
        Some(owner) => get_state().by_owner.get(&owner).unwrap_or(&default),
        None => &get_state().order,
    };

    let from = usize::from(req.from.unwrap_or(0));
    let take = usize::from(req.take.unwrap_or(5));
    let end = std::cmp::min(target_ids.len(), from + take);

    let ids = target_ids.get(from..end).unwrap_or_default();

    let posts = ids
        .iter()
        .map(|id| get_state().posts.get(id).unwrap().clone())
        .collect();

    GetPostsResponse {
        posts,
        total_len: target_ids.len(),
    }
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
    if let Some(profile) = get_state().profiles.get(&id) {
        profile.clone()
    } else {
        Profile::new(id, None, None, None)
    }
}

#[update(guard = "not_anonymous")]
fn edit_profile(req: EditProfileRequest) {
    let caller = caller();

    let profile = get_state()
        .profiles
        .entry(caller)
        .or_insert_with(|| Profile::new(caller, None, None, None));

    profile.union_group_id = req.union_group_id;
    profile.union_access_config_id = req.union_access_config_id;
    profile.name = req.name;
}

#[update(guard = "not_anonymous")]
fn set_activity(req: SetActivityRequest) {
    let caller = caller();
    get_state()
        .posts
        .get(&req.post_id)
        .unwrap_or_else(|| trap("Post does not exist"));

    match req.heart {
        Some(heart) => {
            let activity = get_state()
                .activities
                .entry(req.post_id)
                .or_insert_with(HashMap::new);
            let mut record = activity.entry(caller).or_insert(Activity { heart });

            record.heart = heart;

            // this block makes a remote call to a union (post's author) and automatically mints 10 shares at the group
            spawn(async move {
                let post = get_state()
                    .posts
                    .get(&req.post_id)
                    .unwrap_or_else(|| trap("Post does not exist"));
                let union_profile = get_profile(post.author);

                if union_profile.union_group_id.is_none()
                    || union_profile.union_access_config_id.is_none()
                    || req.alias_principal.is_none()
                {
                    print("Unable to mint shares on like - some info is missing");
                    return;
                }

                print("Lets mint shares...");
                // WARNING: this canister doesn't memorize if you already received your reward liking this post
                let res = call_raw(
                    post.author,
                    "execute",
                    &create_execute_request(
                        post.author,
                        union_profile.union_group_id.unwrap(),
                        union_profile.union_access_config_id.unwrap(),
                        req.alias_principal.unwrap(),
                        Shares::from(10),
                    ),
                    0,
                )
                .await
                .unwrap_or_else(|err| {
                    print(format!(
                        "Unable to mint shares on like - remote call failed - {:?}",
                        err
                    ));
                    vec![]
                });
                print(format!("{:?}", res))
            })
        }
        None => {}
    };
}

#[query]
fn get_activity(post_id: PostId) -> GetActivityResponse {
    if get_state().posts.get(&post_id).is_none() {
        trap("Post does not exist");
    }

    let hearts = match get_state().activities.get(&post_id) {
        Some(activity) => activity
            .keys()
            .filter(|k| activity.get(k).unwrap().heart)
            .map(|k| {
                get_state()
                    .profiles
                    .get(k)
                    .cloned()
                    .unwrap_or_else(|| Profile::new(*k, None, None, None))
            })
            .collect::<Vec<_>>(),
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
    ic_cdk::storage::stable_save((ic_certified_assets::pre_upgrade(), get_state()))
        .expect("failed to save stable state");
}

#[post_upgrade]
fn post_upgrade() {
    let (stable_state, state): (ic_certified_assets::StableState, State) =
        ic_cdk::storage::stable_restore().expect("failed to restore stable state");
    ic_certified_assets::post_upgrade(stable_state);

    unsafe {
        STATE = Some(state);
    }
}

export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    include_str!("./backend.did").to_string()
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
