import client from "../../config/client.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import { sendMailSES } from "../../helper/sendMailSes.js";
import { sendMail } from "../../helper/sendMail.js";

const authResolver = {
  Query: {
    login: async (_parent, { user: { email, password }}) => {
      try {
        const emailRegex = /^[^\W_]+\w*(?:[.-]\w*)*[^\W_]+@[^\W_]+(?:[.-]?\w*[^\W_]+)*(?:\.[^\W_]{2,})$/;
        if(!emailRegex.test(email)) 
          throw new Error("Please type a correct email Id");
        const userDoc = await User.findOne({ email });
        if(!userDoc) throw new Error("User not found.");
        if (password === userDoc.password) {
          const token = jwt.sign({ email: userDoc.email, id: userDoc._id, userName: userDoc.userName, isAdmin: userDoc?.isAdmin ?? false, role: userDoc?.role ?? "Client", address: userDoc?.address ?? null }, process.env.JWT_Secret);
          const refresh_token = jwt.sign({id: userDoc._id, email: userDoc.email}, process.env.REFRESH_SECRET, { expiresIn: '1d' });
          client.setex(`token:${userDoc.email}`, 30*60,token);
          client.set(`refresh_token:${userDoc.email}`, refresh_token)
          return {name: userDoc.userName,token, refresh_token};
        } else {
          throw new Error("Invalid credentials");
        }
      }
      catch(e) {
        console.log(e);
        throw new Error(e?.message ?? "Looks like something went wrong.")
      }
    },
  },
  Mutation: {
    register: async (_parent, { user: {userName, email, password, isAdmin, address} }) => {
      try {
        const emailRegex = /^[^\W_]+\w*(?:[.-]\w*)*[^\W_]+@[^\W_]+(?:[.-]?\w*[^\W_]+)*(?:\.[^\W_]{2,})$/;
        if(!emailRegex.test(email)) 
          throw new Error("Please type a correct email Id");
        const userDoc = await User.create({ userName, email, password, isAdmin, role : isAdmin ? "Admin" : "Client", address });
        if(process.env.SEND_MAIL === "SENDGRID")
          await sendMail(userDoc.userName, "nipunbhardwaj11@gmail.com")
        else
          await sendMailSES(userDoc.userName, "nipunbhardwaj11@gmail.com")
        return userDoc;
      }
      catch(e) {
        console.log(e);
        throw new Error(e?.message ?? "Looks like something went wrong.");
      }
    }
  },
};

export default authResolver;