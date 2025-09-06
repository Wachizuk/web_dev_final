const base = {
    base: "/",
    groups: "/groups",
    users: "/user",
    posts: "/posts"
}

const groups = {
        new: `${base.groups}/new`,
        groupName: (groupName) => `${base.groups}/${groupName}`,
    }

const posts = {
        cardById: (id) => `${base.posts}/${id}`,
        create: `${base.posts}/create`
        edit: (postId) => `${base.posts}/edit/${postId}`,
        delete: (postId) => `${base.posts}/${postId}`,
        changeGroup: (postId) => `${base.posts}/changeGroup/${postId}`,
    }

const users = {
        login: `${base.users}/login`,
        register: `${base.users}/register`,
        logout: `${base.users}/logout`,
        settings: `${base.users}/settings` , 
        profile: `${base.users}/profile` ,
        selectedProfile : `${base.users}/profile/:username`
    }

const routes = {
    mainFeed: "/main-feed",
    groups,
    posts,
    users
}



export {routes}