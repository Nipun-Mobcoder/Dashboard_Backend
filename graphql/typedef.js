const typeDefs = `

    scalar JSON

    type User {
        userName: String
        email: String
        isAdmin: Boolean
        role: String
        address: JSON
        message: String
        token: String
    }

    input UserInput {
        userName: String!
        email: String!
        password: String!
        isAdmin: Boolean
        address: JSON
    }

    input UpdateUserInput {
        email: String!
        userName: String
        password: String
        role: Role
        address: JSON
    }

    input AddUserInput {
        userName: String!
        email: String!
        password: String!
        role: Role!
        address: JSON
    }

    input AssignRoleInput {
        email: String!
        role: Role!
    }

    input AssignPermissionInput {
        email: String!
        permission: Operation!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    enum Operation {
        Add
        Delete 
        FetchAll 
        Update 
        Assign
        Match
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
        refresh_token: String
    }

    type UserRole {
        email: String
        name: String
        address: JSON
    }

    type RoleGroup {
        _id: String
        users: [UserRole]
    }

    type showRoleType {
        getRoleGroups: [RoleGroup]
        message: String
        token: String
    }

    type permissionType {
        permissionArr: [String]
        message: String
        token: String
    }


    type Query {
        login(user: LoginInput!): loginResponse
        getData: User
        fetchAll: [User]
        match(role: Role!): [User]
        getPermissions: permissionType
        showRole: showRoleType
    }

    type Mutation {
        register(user: UserInput!): User
        assignRole(input: AssignRoleInput!): User
        assignPermission(input: AssignPermissionInput!): Permission
        update(user: UpdateUserInput!): User
        add(user: AddUserInput!): User
        delete(email: String!): User
    }

`;

export default typeDefs;