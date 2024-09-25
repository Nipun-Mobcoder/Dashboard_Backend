import User from "../../models/User.js";
import jwt from "jsonwebtoken";

const authResolver = {
  Query: {
    login: async (parent, { email, password }) => {
      const userDoc = await User.findOne({ email });
      if (userDoc && password === userDoc.password) {
        const token = jwt.sign({ email: userDoc.email, id: userDoc._id, userName: userDoc.userName, isAdmin: userDoc?.isAdmin ?? false, role: userDoc?.role ?? "Client"  }, process.env.JWT_Secret);
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
//k set env deployment/login MONGO_URL/=/mongodb+srv://nipunbhardwaj:E4K1qtXWLFY4w117@chatcluster.cqlok.mongodb.net/?retryWrites=true&w=majority&appName=chatCluster
