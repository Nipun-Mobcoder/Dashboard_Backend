import jwt from "jsonwebtoken";
import Permission from "../../models/Permission.js";
import User from "../../models/User.js";
import client from "../../config/client.js";

const permissionResolver = {
    Mutation : {
        update: async (_parent, {email, userName, password, role}, context) => {
            try {
                const decoded = context.decoded;
                const data = await Permission.findOne( {module: decoded.email, operation: "Update" } ); 
                if( decoded?.isAdmin || data?.isAllowed || email === decoded?.email ) {
                    let user = await User.findOne({email});
                    user = await User.findOneAndUpdate( 
                            {_id: user._id}, 
                            { role: role ?? user.role, userName: userName ?? user.userName, password: password ?? user.password }, 
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

        add: async (_parent, { userName, email, password, role }, context) => {
            try {
                const decoded = context.decoded;
                const data = await Permission.findOne( {module: decoded.email, operation: "Add" } ); 
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
                const data = await Permission.findOne({ module: decoded.email, operation: "Delete" });
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