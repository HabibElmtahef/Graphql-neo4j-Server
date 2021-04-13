const session=require("../db")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {AuthenticationError}=require("apollo-server-errors")

const resolvers = {
    Query: {
        pfe: () => "Hello Pfe",
        
        posts: async () => {
            const posts = []
            const result = await session.run('MATCH (p: Poste) RETURN p, id(p) ')
            result.records.map(post => {
                posts.push({
                    id: post.get(0).identity.low,
                    title: post.get(0).properties.title,
                    desc: post.get(0).properties.desc,
                    image: post.get(0).properties.image
                })
            })
            return posts
        },

        getUserPosts: async (_,__, context) => {
            const token = context.req.headers.authorization
            if(!token) throw new AuthenticationError("Authentification pas Valid")
            const res = await jwt.verify(token, 'habib')
            if(!res) throw new AuthenticationError("Authentification pas Valid")
            
            const posts = []
            const result = await session.run('MATCH (u: User {email: $email})-[r: publie]->(p: Poste) RETURN p, id(p) ', {email: res})
            result.records.map(post => {
                posts.push({
                    id: post.get(0).identity.low,
                    title: post.get(0).properties.title,
                    desc: post.get(0).properties.desc,
                    image: post.get(0).properties.image
                })
            })
            return posts
        },

        
        login: async (_, {input: {email, password}}) => {
            const result = await session.run('MATCH(n: User) WHERE n.email = $email RETURN n', {email: email})
           if(result.records.length == 0) {
           return new Error("Cette User n'exist pas")
           }
           else {
           const user = result.records[0].get(0).properties
           const isMatch = await bcrypt.compare(password, user.password)
           if(!isMatch) return new Error("Password Incorrect")
           const payload = user.email
           const token = jwt.sign(payload, 'habib');
           return {token,
                    user}
          }
        },

        getUser: async (_,__, context) => {
            const token = context.req.headers.authorization
            if(!token) throw new AuthenticationError("Authentification pas Valid")
            const res = await jwt.verify(token, 'habib')
            if(!res) throw new AuthenticationError("Authentification pas Valid")
            const result = await session.run('MATCH (u: User {email: $email}) RETURN u ', {email: res})
            const user = result.records[0].get(0).properties
            return user
        },
        
        users: async (_,__, context) => {
            const users = []
            const token = context.req.headers.authorization
            if(!token) throw new AuthenticationError("Authentification pas Valid")
            const res = await jwt.verify(token, 'habib')
            if(!res) throw new AuthenticationError("Authentification pas Valid")
            const result = await session.run('MATCH (u: User) RETURN u,id(u) ')
            result.records.map(user => {
                users.push({
                    id: user.get(0).identity.low,
                    username: user.get(0).properties.username,
                    email: user.get(0).properties.email,
                    password: user.get(0).properties.password,
                    role: user.get(0).properties.role,
                    avatar: user.get(0).properties.avatar
                })
            })
            return users
        },

        SupprimerPost: async (_,{input: {id}}, context) => {
            const token = context.req.headers.authorization
            if(!token) throw new AuthenticationError("Authentification pas Valid")
            const res = await jwt.verify(token, 'habib')
            if(!res) throw new AuthenticationError("Authentification pas Valid")
            
            const result = await session.run('MATCH (p: Poste) WHERE id(p) = $id DETACH DELETE p ', {id: id})
            return "Poste Deleted"
        },

        SupprimerUser: async (_, {input: {id}}, context) => {
            const token = context.req.headers.authorization
            if(!token) throw new AuthenticationError("Authentification pas Valid")
            const res = await jwt.verify(token, 'habib')
            if(!res) throw new AuthenticationError("Authentification pas Valid")
            const result = await session.run('MATCH (u: User) WHERE id(u) = $id DELETE u ', {id: id})
            return "User Deleted"
        }

        
    },

    Mutation: {
        CreerUser: async (_,{input: {username, email, password, role, avatar}}) => {

            const HashPassword = await bcrypt.hash(password, 10)
            const result = await session.run('CREATE (u: User {username: $username, email: $email, password: $password, role: $role, avatar: $avatar}) RETURN u', {
                username: username,
                email: email,
                password: HashPassword,
                role: "USER",
                avatar: "https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/batman_hero_avatar_comics-512.png"
            })
            //console.log(result)
            const user = result.records[0].get(0).properties
            return user
        },

        publierPost: async (_, {input: {title, desc, image}}, context) => {
            const token = context.req.headers.authorization
            if(!token) throw new AuthenticationError("Authentification pas Valid")
            const res = await jwt.verify(token, 'habib')
            if(!res) throw new AuthenticationError("Authentification pas Valid")
            const result = await session.run('MATCH (u: User {email: $email}) CREATE (u)-[r: publie]->(p: Poste {title: $title, desc: $desc, image: $image})',{
                email: res,
                title,
                desc,
                image
            })
            return "Poste Est publièe"
        },

        
    }
}

module.exports = resolvers