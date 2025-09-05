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
        cardById: (id) => `${base.posts}${id}`,
        create: `${base.posts}/create`
    }

const users = {
        login: `${base.users}/login`,
        register: `${base.users}/register`,
        logout: `${base.users}/logout`,
        settings: `${base.users}/settings` , 
        profile: `${base.users}/profile`
    }

const routes = {
    groups,
    posts,
    users
}



export {routes}