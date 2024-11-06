import { sendMail } from "../../helper/sendMail.js";
import { sendMailSES } from "../../helper/sendMailSes.js";
import rateLimiter from "../../middleware/rateLimiter.js";
import setToken from "../../middleware/setToken.js";

const refundResolver =  {
    Query: {
        refund: async (_parent, { complaintMessage }, context) => {
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
                await rateLimiter(`${token}:refund`);
                if(process.env.SEND_MAIL === "SENDGRID")
                    await sendMail(decoded.userName, "nipunbhardwaj11@gmail.com", "refundMail.ejs", complaintMessage)
                else
                    await sendMailSES(decoded.userName, "nipunbhardwaj11@gmail.com", "refundMail.ejs", complaintMessage)
                return { refund: "Message Sent Succesfully" };
            }
            catch(e) {
                console.log(e);
                throw new Error(e?.message ?? "Looks like something went wrong.")
            }
        }
    }
}

export default refundResolver;