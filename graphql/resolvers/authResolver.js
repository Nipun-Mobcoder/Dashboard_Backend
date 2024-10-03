import client from "../../config/client.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import { sendMailSES } from "../../helper/sendMailSes.js";
import { sendMail } from "../../helper/sendMail.js";

const authResolver = {
  Query: {
    login: async (_parent, { user: { email, password }}) => {
      const userDoc = await User.findOne({ email });
      if(!userDoc) throw new Error("User not found.");
      if (password === userDoc.password) {
        const token = jwt.sign({ email: userDoc.email, id: userDoc._id, userName: userDoc.userName, isAdmin: userDoc?.isAdmin ?? false, role: userDoc?.role ?? "Client", address: userDoc?.address ?? null }, process.env.JWT_Secret);
        client.setex(`token:${userDoc.email}`, 30*60,token);
        return {token, name: userDoc.userName};
      } else {
        throw new Error("Invalid credentials");
      }
    },
  },
  Mutation: {
    register: async (_parent, { user: {userName, email, password, isAdmin, address} }) => {
      const userDoc = await User.create({ userName, email, password, isAdmin, role : isAdmin ? "Admin" : "Client", address });
      if(process.env.SEND_MAIL === "SENDGRID")
        await sendMail(userDoc.userName, "nipunbhardwaj11@gmail.com")
      else
        await sendMailSES(userDoc.userName, "nipunbhardwaj11@gmail.com")
      return userDoc;
    }
  },
};

export default authResolver;