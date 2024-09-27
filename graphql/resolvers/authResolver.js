import client from "../../config/client.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

const authResolver = {
  Query: {
    login: async (parent, { email, password }) => {
      const userDoc = await User.findOne({ email });
      if(!userDoc) throw new Error("User not found.");
      if (password === userDoc.password) {
        const token = jwt.sign({ email: userDoc.email, id: userDoc._id, userName: userDoc.userName, isAdmin: userDoc?.isAdmin ?? false, role: userDoc?.role ?? "Client"  }, process.env.JWT_Secret);
        client.setex(`token:${userDoc.email}`, 10*60,token);
        return {token, name: userDoc.userName};
      } else {
        throw new Error("Invalid credentials");
      }
    },
  },
  Mutation: {
    register: async (parent, { userName, email, password, isAdmin }) => {
      const userDoc = await User.create({ userName, email, password, isAdmin, role : isAdmin ? "Admin" : "Client" });
      return userDoc;
    }
  },
};

export default authResolver;