import rateLimiter from "../../middleware/rateLimiter.js";
import setToken from "../../middleware/setToken.js";
import User from "../../models/User.js";

const roleResolver = {
  Query: {
    getData: async (_parent, args, context) => {
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
        await rateLimiter(`${token}:getData`);
        return decoded;
      } catch (err) {
        console.log(err)
        throw new Error(err?.message ?? "Invalid token");
      }
    },
  },
  Mutation: {
    assignRole: async (_parent, {input: { email, role }}, context) => {
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
          await rateLimiter(`${token}:assignRole`);
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
