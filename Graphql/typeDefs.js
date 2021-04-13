const { gql } = require('apollo-server');

const typeDefs = gql `
   type User {
       id: ID
       username: String
       email: String
       password: String
       role: String
       avatar: String
   }
   
   input UserInput {
       username: String
       email: String
       password: String
       role: String
       avatar: String
   }

   type LoggedUser {
       token: String
       user: User
   }
   
   input LoginInput {
       email: String
       password: String
   }
   
   
   type Post {
       id: ID
       title: String
       desc: String
       image: String
   }

   input PublierInput {
       title: String
       desc: String
       image: String
   }

   input SupprimerInput {
       id: Int
   }
   
   type Query {
       pfe: String!
       posts: [Post]
       getUserPosts: [Post]
       users: [User]
       getUser: User
       login(input: LoginInput): LoggedUser
       SupprimerPost(input: SupprimerInput): String
       SupprimerUser(input: SupprimerInput): String
   }
   type Mutation {
       CreerUser(input: UserInput): User
       publierPost(input: PublierInput): String
   }
`


module.exports = typeDefs