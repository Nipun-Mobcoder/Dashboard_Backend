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
        walletAmount: Int
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

    input sendPaymentInput {
        amount: Int! 
        sendTo: String! 
        paymentMethod: PaymentMethod!
        currency: String!
    }

    enum Operation {
        Add
        Delete 
        FetchAll 
        Update 
        Assign
        Match
        AllUsersPermission
    }

    type Permission {
        module: String
        operation: Operation
        isAllowed: Boolean
        message: String
        token: String
    }

    enum Role {
        Engineer
        Client
        Tester
    }

    enum PaymentMethod {
        Paytm 
        PhonePe 
        Paypal 
        GooglePay
        ApplePay
    }

    enum Currency {
        USD
        JPY
        INR
        EUR
        KRW
        AUD
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

    type allPermissions {
        module: String
        operation: String
        isAllowed: Boolean
    }

    type allUsersGroup {
        _id: String
        users: [allPermissions]
    }

    type allUsersType {
        users: [allUsersGroup]
        message: String
        token: String
    }

    type sendPayment {
        totalAmount: Int 
        email: String 
        paymentMethod: PaymentMethod 
        amount: Int 
        recipientEmail: String
        message: String
        token: String
        currency: String
    }

    type showPayment {
        senderEmail: String 
        paymentMethod: PaymentMethod 
        amount: Int 
        recipientEmail: String
        currency: String
        isRecieved: Boolean
    }

    type PaymentDetails {
        id: String
        amount: Int
        senderEmail: String
        receivingEmail: String
        paymentDate: String
        paymentMethod: String
        currency: String
        amountConvertToUSD: Int
    }

    type allPaymentDetails {
        paymentDetails: [PaymentDetails]
        token: String
        message: String
    }

    type Month {
        January: Int
        February: Int
        March: Int
        April: Int
        May: Int
        June: Int
        July: Int
        August: Int
        September: Int
        October: Int
        November: Int
        December: Int
    }

    type amountByCurrency {
        _id: String
        amt: Int
    }

    type dashboardType { 
        totalAmountEarned: Int 
        totalAmountSpent: Int 
        token: String 
        message: String
        earnedMonthly: JSON
        spentMonthly: JSON
        amountByCurrencyEarned: [amountByCurrency] 
        amountByCurrencySpent: [amountByCurrency]
    }

    type Query {
        login(user: LoginInput!): loginResponse
        getData: User
        fetchAll: [User]
        match(role: Role!): [User]
        getPermissions: permissionType
        showRole: showRoleType
        getAllUsersPermission: allUsersType
        getPaymentDetails: allPaymentDetails
        dashboard: dashboardType
    }

    type Mutation {
        register(user: UserInput!): User
        assignRole(input: AssignRoleInput!): User
        assignPermission(input: AssignPermissionInput!): Permission
        update(user: UpdateUserInput!): User
        add(user: AddUserInput!): User
        delete(email: String!): User
        sendPayment(sendPaymentInput: sendPaymentInput): sendPayment
    }

    type Subscription {
        showPayment(token: String!): showPayment
    }
`;

export default typeDefs;