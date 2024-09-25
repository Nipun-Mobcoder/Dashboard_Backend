import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const roleResolver = {
  Query: {
    getData: async (parent, args, context) => {
      try {
        const decoded = jwt.verify(context.token, process.env.JWT_Secret);
        return decoded;
      } catch (err) {
        console.log(err)
        throw new Error(err?.message ?? "Invalid token");
      }
    },
  },
  Mutation: {
    assignRole: async (parent, {email, role}, context) => {
        try {
            const decoded = jwt.verify(context.token, process.env.JWT_Secret);
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
