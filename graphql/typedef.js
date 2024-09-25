const typeDefs = `
    type User {
        userName: String!
        email: String!
        isAdmin: Boolean!
        role: String!
    }

    enum Role {
        Engineer
        Client
        Tester
    }

    type loginResponse {
        token: String
        name: String
    }

    type Query {
        login(email: String!, password: String!): loginResponse
        getData: User
    }

    type Mutation {
        register(userName: String!, email: String!, password: String!, isAdmin:Boolean): User
        assignRole(email: String!, role: Role!): User
    }

`;

export default typeDefs;
