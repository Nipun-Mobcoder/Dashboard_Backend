import Permission from "../../models/Permission.js";
import User from "../../models/User.js";
import rateLimiter from "../../middleware/rateLimiter.js";
import setToken from "../../middleware/setToken.js";

const getPermissionResolver = {
    Query : {
        getPermissions : async (_parent, {}, context) => {
            try {
                let {token} = context;
                if(!token) {
                    if(context.refresh_token) {
                        const refreshed = await setToken(context.refresh_token);
                        token = refreshed.token;
                        return {
                            message: "Sorry you've been logged out please fill this token",
                            token: token,
                        }
                    }
                    throw new Error("Please Login");
                }
                await rateLimiter(`${token}:getPermissions`);
                const userData = await User.findOne({email: context.decoded.email})
                const perm = await Permission.aggregate([
                    {
                        "$match": {
                            "user_id": userData._id,
                            "isAllowed": true
                        }
                    },
                    {
                        "$project": {
                            "operation": 1
                        }
                    }
                ])
                const permission = perm.map(item => item.operation);
                return { permissionArr: permission };
            }
            catch (e) { 
                console.log(e);
                throw new Error(e?.message ?? "Something went wrong");
            }
        },
        showRole: async (_parent, {}, context) => {
            try {
                let {token} = context;
                if(!token) {
                    if(context.refresh_token) {
                        const refreshed = await setToken(context.refresh_token);
                        token = refreshed.token;
                        return {
                            message: "Sorry you've been logged out please fill this token",
                            token: token,
                        }
                    }
                    throw new Error("Please Login");
                }
                await rateLimiter(`${token}:showRole`);
                const perm = await User.aggregate([
                    {
                        "$group": {
                            "_id": "$role",
                            "users": {
                                "$push": {
                                    "email": "$email", 
                                    "name": "$userName",
                                    "address": "$address"
                                }
                            }
                        }
                    },
                ])
                return {getRoleGroups: perm};
            }
            catch (e) {
                console.log(e);
                throw new Error(e?.message ?? "Something went wrong");
            }
        }
    }
}

export default getPermissionResolver;