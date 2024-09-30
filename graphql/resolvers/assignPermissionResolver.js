import User from "../../models/User.js";
import Permission from "../../models/Permission.js";
import rateLimiter from "../../middleware/rateLimiter.js";

const assignPermissionResolver = {
  Query: {
    fetchAll: async (_parent, _args, context) => {
        try {
            const decoded = context.decoded;
            await rateLimiter(`${context.token}:fetchAll`);
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
    assignPermission: async (_parent, {email, permission}, context) => {
        try {
            const decoded = context.decoded;
            await rateLimiter(`${context.token}:assignPermission`);
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
