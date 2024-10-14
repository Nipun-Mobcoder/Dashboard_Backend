import Permission from "../../models/Permission.js";
import User from "../../models/User.js";
import client from "../../config/client.js";
import rateLimiter from "../../middleware/rateLimiter.js";
import setToken from "../../middleware/setToken.js";

const permissionResolver = {
    Query : {
        match: async (_parent, { role }, context) => {
            try {
                let {token, decoded} = context;
                if(!token) {
                    if(context.refresh_token) {
                        const refreshed = await setToken(context.refresh_token);
                        token = refreshed.token;
                        decoded = refreshed.decoded;
                        return [{
                            message: "Sorry you've been logged out please fill this token",
                            token: token,
                        }]
                    }
                    throw new Error("Please Login");
                }
                await rateLimiter(`${token}:match`);
                const data = await Permission.findOne({ user_id: decoded.id, operation: "Match" });
                if( decoded?.isAdmin || data?.isAllowed  ) {
                    const clientUser =  await User.aggregate([
                        {
                            "$match": {
                                "role": role
                            }
                        }
                    ])
                    return clientUser;
                }
                else {
                    throw new Error("Sorry but only admin can perform this action");
                }
            }
            catch (e) { 
                console.log(e);
                throw new Error(e?.message ?? "Something went wrong");
                }
            },
    },
    Mutation : {
        update: async (_parent, {user: { email, userName, password, role, address }}, context) => {
            try {
                let {token, decoded} = context;
                if(!token) {
                    if(context.refresh_token) {
                        const refreshed = await setToken(context.refresh_token);
                        token = refreshed.token;
                        decoded = refreshed.decoded;
                        return {
                            message: "Sorry you've been logged out please fill this token",
                            token: token,
                        }
                    }
                    throw new Error("Please Login");
                }
                await rateLimiter(`${token}:update`);
                const data = await Permission.findOne( {user_id: decoded.id, operation: "Update" } ); 
                if( decoded?.isAdmin || data?.isAllowed || email === decoded?.email ) {
                    let user = await User.findOne({email});
                    if(!user) throw new Error("User not found.")
                    let updatedAddress = user.address;
                    if (address) {
                        updatedAddress = { ...user.address, ...address };
                    }
                    user = await User.findOneAndUpdate( 
                            {_id: user._id}, 
                            { role: role ?? user.role, userName: userName ?? user.userName, password: password ?? user.password, address: updatedAddress }, 
                            {new: true}
                        );
                    return user;
                }
                else {
                    throw new Error("Sorry but only admin can perform this action");
                }
            }
            catch(e) {
                console.log(e);
                throw new Error(e?.message ?? "Something went wrong.");
            }
        },

        add: async (_parent, {user: { userName, email, password, role, address }}, context) => {
            try {
                let {token, decoded} = context;
                if(!token) {
                    if(context.refresh_token) {
                        const refreshed = await setToken(context.refresh_token);
                        token = refreshed.token;
                        decoded = refreshed.decoded;
                        return {
                            message: "Sorry you've been logged out please fill this token",
                            token: token,
                        }
                    }
                    throw new Error("Please Login");
                }
                await rateLimiter(`${token}:add`);
                const data = await Permission.findOne( {user_id: decoded.id, operation: "Add" } ); 
                if( decoded?.isAdmin || data?.isAllowed ) {
                    const userDoc = await User.create({ userName, email, password, isAdmin: false, role : role, address });
                    return userDoc;
                }
                else {
                    throw new Error("Sorry but only admin can perform this action");
                }
            }
            catch(e) {
                console.log(e);
                throw new Error(e?.message ?? "Something went wrong.");
            }
        },

        delete: async (_parent, {email}, context) => {
            try {
                let {token, decoded} = context;
                if(!token) {
                    if(context.refresh_token) {
                        const refreshed = await setToken(context.refresh_token);
                        token = refreshed.token;
                        decoded = refreshed.decoded;
                        return {
                            message: "Sorry you've been logged out please fill this token",
                            token: token,
                        }
                    }
                    throw new Error("Please Login");
                }
                await rateLimiter(`${token}:delete`);
                const data = await Permission.findOne({ user_id: decoded.id, operation: "Delete" });
                if( decoded?.isAdmin || data?.isAllowed || email === decoded?.email  ) {
                    const deleteData = await User.findOneAndDelete( {email} );
                    if(!deleteData) throw new Error("User not found.")
                    client.del(`token:${deleteData.email}`)
                    return deleteData;
                }
                else {
                    throw new Error("Sorry but only admin can perform this action");
                }
            }
            catch (e) { 
                console.log(e);
                throw new Error(e?.message ?? "Something went wrong");
            }
        },
    }
}

export default permissionResolver;