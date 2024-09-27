const typeDefs = `
    type User {
        userName: String!
        email: String!
        isAdmin: Boolean!
        role: String!
    }

    enum Operation {
        Add
        Delete 
        FetchAll 
        Update 
        Assign
    }

    type Permission {
        module: String!
        operation: Operation!
        isAllowed: Boolean
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
        fetchAll: [User]
    }

    type Mutation {
        register(userName: String!, email: String!, password: String!, isAdmin:Boolean): User
        assignRole(email: String!, role: Role!): User
        assignPermission(email: String!, permission: Operation!): Permission
        update(email: String!, userName: String, password: String, role: Role): User
        add(userName: String!, email: String!, password: String!, role: Role!): User
        delete(email: String!): User
    }

`;

export default typeDefs;