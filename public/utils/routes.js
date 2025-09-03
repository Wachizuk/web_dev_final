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
        cardById: (id) => `${base.posts}${id}`
    }

const users = {
        login: `${base.users}/login`,
        register: `${base.users}/register`
    }



const routes = {
    groups,
    posts,
    users
}



export {routes}