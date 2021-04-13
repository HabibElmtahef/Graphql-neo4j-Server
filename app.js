const { ApolloServer } = require('apollo-server');
const typeDefs = require('./Graphql/typeDefs')
const resolvers = require('./Graphql/resolvers');
//const middleware=require('./utils/middleware');


const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context: ctx => ctx
});

server.listen({port:4000}).then(res => {
    console.log(`Server Running at ${res.url}`)
})