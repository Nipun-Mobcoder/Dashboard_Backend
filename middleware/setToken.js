import client from "../config/client.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from 'dotenv';

dotenv.config();

const setToken = async (refresh_token) => {
    try {
        let decoded = jwt.verify(refresh_token, process.env.REFRESH_SECRET);
        if(refresh_token === await client.get(`refresh_token:${decoded.email}`)) {
          const userDoc = await User.findOne({ email: decoded.email });
          const token = jwt.sign({ email: userDoc.email, id: userDoc._id, userName: userDoc.userName, isAdmin: userDoc?.isAdmin ?? false, role: userDoc?.role ?? "Client", address: userDoc?.address ?? null }, process.env.JWT_Secret);
          await client.setex(`token:${decoded?.email}`, 30*60, token)
          decoded = jwt.verify(token, process.env.JWT_Secret);
          return {
            token,
            decoded
          }
        }
        else {
          throw new Error("Token expired");
        }
      } catch(e) {
        console.log(e);
        throw new Error(e?.message ?? "Token not valid");
      }
}

export default setToken;