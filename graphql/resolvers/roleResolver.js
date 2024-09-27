import rateLimiter from "../../middleware/rateLimiter.js";
import User from "../../models/User.js";

const roleResolver = {
  Query: {
    getData: async (_parent, args, context) => {
      try {
        const decoded = context.decoded;
        await rateLimiter(`${context.token}:getData`);
        return decoded;
      } catch (err) {
        console.log(err)
        throw new Error(err?.message ?? "Invalid token");
      }
    },
  },
  Mutation: {
    assignRole: async (_parent, {email, role}, context) => {
        try {
            const decoded = context.decoded;
            await rateLimiter(`${context.token}:assignRole`);
            if(decoded?.isAdmin){
                const updateRole = { role: role };
                const userData = await User.findOne({email})
                await User.findOneAndUpdate(userData._id ,updateRole)
                const newUserData = await User.findOne({email});
                return newUserData;
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

export default roleResolver;
