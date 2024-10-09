import User from "../../models/User.js";
import Permission from "../../models/Permission.js";
import rateLimiter from "../../middleware/rateLimiter.js";
import setToken from "../../middleware/setToken.js";

const assignPermissionResolver = {
  Query: {
    fetchAll: async (_parent, _args, context) => {
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
            await rateLimiter(`${token}:fetchAll`);
            let isPermission
            const data = await Permission.findOne({ user_id: decoded.id, operation: "FetchAll" });
            isPermission = data?.isAllowed ?? false;
            if(decoded?.isAdmin || isPermission ){
                let allUsers = await User.find({});
                return allUsers;
            }
            else {
                throw new Error("Sorry but only admin can perform this action");
            }
          } catch (err) {
            console.log(err)
            throw new Error(err?.message ?? "Invalid token");
          }
    },
  },
  Mutation: {
    assignPermission: async (_parent, {input: { email, permission }}, context) => {
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
            await rateLimiter(`${token}:assignPermission`);
            let isPermission
            const data = await Permission.findOne({ user_id: decoded?.id, operation: "Assign" });
            isPermission = data?.isAllowed ?? false;
            if(decoded?.isAdmin || isPermission ){
                const userData = await User.findOne({email});
                if(userData){
                  let permissionData = await Permission.findOne({ user_id: userData._id, operation: permission });
                  if(permissionData) {
                      permissionData = await Permission.findOneAndUpdate({_id: permissionData._id} ,{ isAllowed: true }, {new: true});
                  }
                  else {
                      permissionData = await Permission.create({isAllowed: true, module: email, operation: permission, user_id: userData._id})
                  }
                  return permissionData;
                }
                throw new Error("No such user found.");
            }
            else {
                throw new Error("Sorry but only admin can perform this action");
            }
          } catch (err) {
            console.log(err)
            throw new Error(err?.message ?? "Invalid token");
          }
    }
  }
};

export default assignPermissionResolver;
