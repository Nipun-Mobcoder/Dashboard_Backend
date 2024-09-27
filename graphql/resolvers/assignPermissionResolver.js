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
            const data = await Permission.findOne({ module: decoded?.email, operation: "FetchAll" });
            // console.log(data)
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
            const data = await Permission.findOne({ module: decoded?.email, operation: "Assign" });
            isPermission = data?.isAllowed ?? false;
            if(decoded?.isAdmin || isPermission ){
                let permissionData = await Permission.findOne({ module: email, operation: permission });
                if(permissionData) {
                    permissionData = await Permission.findOneAndUpdate({_id: permissionData._id} ,{ isAllowed: true }, {new: true});
                }
                else {
                    permissionData = await Permission.create({isAllowed: true, module: email, operation: permission})
                }
                return permissionData;
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
