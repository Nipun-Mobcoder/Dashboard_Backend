import Permission from "../../models/Permission.js";
import User from "../../models/User.js";
import client from "../../config/client.js";
import rateLimiter from "../../middleware/rateLimiter.js";

const permissionResolver = {
    Mutation : {
        update: async (_parent, {user: { email, userName, password, role, address }}, context) => {
            try {
                const decoded = context.decoded;
                await rateLimiter(`${context.token}:update`);
                const data = await Permission.findOne( {user_id: decoded.id, operation: "Update" } ); 
                if( decoded?.isAdmin || data?.isAllowed || email === decoded?.email ) {
                    let user = await User.findOne({email});
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

        add: async (_parent, {user: { userName, email, password, role }}, context) => {
            try {
                const decoded = context.decoded;
                await rateLimiter(`${context.token}:add`);
                const data = await Permission.findOne( {user_id: decoded.id, operation: "Add" } ); 
                if( decoded?.isAdmin || data?.isAllowed || email === decoded?.email ) {
                    const userDoc = await User.create({ userName, email, password, isAdmin: false, role : role });
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
                const decoded = context.decoded;
                await rateLimiter(`${context.token}:delete`);
                const data = await Permission.findOne({ user_id: decoded.id, operation: "Delete" });
                if( decoded?.isAdmin || data?.isAllowed || email === decoded?.email  ) {
                    const deleteData = await User.findOneAndDelete( {email} );
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
        }
    }
}

export default permissionResolver;