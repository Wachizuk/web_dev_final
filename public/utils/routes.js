const base = {
  base: "/",
  groups: "/groups",
  users: "/user",
  posts: "/posts",
};

const groups = {
  new: `${base.groups}/new`,
  groupName: (groupName) => `${base.groups}/${groupName}`,
  allGroups: `${base.groups}/allGroups`
};

const posts = {
  cardById: (id) => `${base.posts}/${id}`,
  create: `${base.posts}/create`,
  edit: (postId) => `${base.posts}/edit/${postId}`,
  delete: (postId) => `${base.posts}/${postId}`,
  removeGroup: (postId) => `${base.posts}/removeGroup/${postId}`,
  toggleLike: (postId) => `${base.posts}/toggleLike/${postId}`,
  uploadFile: (postId, blockIndex, fileName) =>
    `uploads/posts/${postId}/${blockIndex}/${fileName}`,
  myFeed: `${base.posts}/feed`,
  myPosts: `${base.posts}/my`,
  postPage: (postId) => `${base.posts}/page/${postId}`,
};

const users = {
  login: `${base.users}/login`,
  register: `${base.users}/register`,
  logout: `${base.users}/logout`,
  settings: `${base.users}/settings`,
  profile: `${base.users}/profile`,
  selectedProfile: `${base.users}/profile/:username`,
  getFriends: `${base.users}/friends`,
  isFriend: (friendId) => `${base.users}/friends/${friendId}`,
};

const routes = {
  mainFeed: "/main-feed",
  myFeed: "/my-feed",
  myPosts: "/my-posts",
  groups,
  posts,
  users,
};

export { routes };
