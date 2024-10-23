import { PubSub, withFilter } from "graphql-subscriptions";
import jwt from "jsonwebtoken";

import User from "../../models/User.js";
import rateLimiter from "../../middleware/rateLimiter.js";
import setToken from "../../middleware/setToken.js";
import Payment from "../../models/Payment.js";
import { freecurrencyapi } from "../../helper/mapper.js";

const pubsub = new PubSub();

const paymentResolver = {
    Mutation: {
        sendPayment: async (_parent,{sendPaymentInput: { amount, sendTo, paymentMethod, currency }}, context) => {
            try {
                let {token, decoded} = context;
                if(!token) {
                    if(context.refresh_token) {
                        const refreshed = await setToken(context.refresh_token);
                        token = refreshed.token;
                        return {
                            message: "Sorry you've been logged out please fill this token",
                            token: token,
                        }
                    }
                    throw new Error("Please Login");
                }
                await rateLimiter(`${token}:sendPayment`, 5, 1);
                const userData = await User.findOne({email: decoded.email})
                if(userData?.walletAmount && userData?.walletAmount >= amount) {
                    var user = await User.findOne({ email: sendTo });
                    if (!user) {
                        throw new Error("Recipient not found.");
                    }
                    if(currency && currency!="USD") {
                        const cur = currency;
                        var amountConvertToUSD = await freecurrencyapi.latest({
                            base_currency: 'USD',
                            currencies: cur
                        });
                        if(amountConvertToUSD.errors) {
                            throw new Error(amountConvertToUSD.errors.currencies[0] ?? 'Currency is invalid')
                        }
                        amount = amount / amountConvertToUSD.data[cur];
                        amount = Math.floor(amount)
                    }
                    const addedAmount = user?.walletAmount ? user.walletAmount + amount : amount;
                    const subtractedAmount = userData.walletAmount - amount;
                    await User.findOneAndUpdate({ _id: user._id }, { walletAmount: addedAmount }, {new: true})
                    var update_user = await User.findOneAndUpdate({ _id: userData._id }, { walletAmount: subtractedAmount }, {new: true})
                    var newPayment = await Payment.create({ user_id: user._id, from_id: userData._id, amount, paymentDate: new Date(), paymentMethod, currency: currency ?? "USD" });
                }
                else {
                    throw new Error("You don't have enough balance.")
                }
                pubsub.publish('PAYMENT_ADDED', {
                    showPayment: { email: userData.email, paymentMethod, amount, recipientEmail: user.email, currency },
                    user_id: newPayment.user_id,
                    from_id: newPayment.from_id
                })
                return { totalAmount: update_user.walletAmount, email: userData.email, paymentMethod, amount, recipientEmail: user.email, currency };
            }
            catch (e) {
                console.log(e);
                throw new Error(e?.message ?? "Something went wrong");
            }
        }
    },
    Subscription: {
        showPayment: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('PAYMENT_ADDED'),
                async (payload, variables) => {
                    try {
                        const { token } = variables;
                        if (!token) {
                            throw new Error("Please Login");
                        }
                        const decoded = jwt.verify(token, process.env.JWT_Secret);
                        return decoded.id === payload.from_id.toString() || decoded.id === payload.user_id.toString();
                    } catch (e) {
                        console.log(e);
                        throw new Error(e?.message ?? "Looks like something went wrong.");
                    }
                }
            ),
            resolve: (payload, {token}) => {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_Secret);
        
                    if (decoded.id === payload.from_id.toString() || decoded.id === payload.user_id.toString()) {
                        return {
                            senderEmail: payload.showPayment.email,
                            paymentMethod: payload.showPayment.paymentMethod,
                            amount: payload.showPayment.amount,
                            recipientEmail: payload.showPayment.recipientEmail,
                            currency: payload.showPayment.currency,
                            isRecieved: decoded.id === payload.user_id.toString()
                        };
                    }
                    return null;
                }
                catch (e) {
                    console.log(e);
                    throw new Error(e?.message ?? "Looks like something went wrong.")
                }
            }
        }
    }
}

export default paymentResolver;