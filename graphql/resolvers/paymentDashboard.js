import { ObjectId } from "mongodb";

import User from "../../models/User.js";
import rateLimiter from "../../middleware/rateLimiter.js";
import setToken from "../../middleware/setToken.js";
import Payment from "../../models/Payment.js";
import { freecurrencyapi, month, monthMapping, earnedMonthly } from "../../helper/mapper.js";

const paymentDashboard = {
    Query : {
        paymentHistory : async (_parent, {}, context) => {
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
                await rateLimiter(`${token}:paymentHistory`);
                const userData = await User.findOne({email: decoded.email})
                const getPayment = await Payment.find({ $or: [{ user_id: userData._id }, { from_id: userData._id }] })
                const payment = getPayment.map(async payment => {
                    const sender = await User.findOne({ _id: payment.from_id });
                    const receiver = await User.findOne({ _id: payment.user_id });
                    const date = new Date(payment.paymentDate);
                    
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    
                    const time = `${ hours <= 12 ? hours : hours % 12 != 0 ? hours % 12 : 12 }:${minutes.toString().padStart(2, "0")} ${ ( hours < 12 || hours == 24 ) ? "AM" : "PM" }`
                    const formattedTime = `${date.getDate()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} (${time})`;
                    var convertedAmount = payment.amount;

                    return {
                        id: payment._id.toString(),
                        amountInUSD: payment.amount,
                        senderEmail: sender.email,
                        receivingEmail: receiver.email,
                        paymentDate: formattedTime,
                        paymentMethod: payment.paymentMethod,
                        currency: payment.currency ?? 'USD',
                        amountConvertToUSD: Math.floor(convertedAmount)
                    };
                });
                return { paymentDetails: payment }
            }
            catch (e) { 
                console.log(e);
                throw new Error(e?.message ?? "Something went wrong");
            }
        },
        dashboard: async ( _parent, {}, context ) => {
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
                await rateLimiter(`${token}:dashboard`);
                let totalAmountEarned = await Payment.aggregate([
                    {
                      "$group": {
                        "_id": "$user_id",
                        "moneySpent": {
                          "$sum": "$amount"
                        }
                      }
                    }
                  ])
                let totalAmountSpent = await Payment.aggregate([
                    {
                      "$group": {
                        "_id": "$from_id",
                        "moneyEarned": {
                          "$sum": "$amount"
                        }
                      }
                    }
                  ]);
                totalAmountSpent = totalAmountSpent.find(item => item._id.toString() === decoded.id);
                totalAmountEarned = totalAmountEarned.find(item => item._id.toString() === decoded.id);
                let paymentsGroupedByMonth = await Payment.aggregate(
                    // {
                    //   "$match": {
                    //     "user_id": ObjectId.createFromHexString(decoded.id),
                    //     "$expr": { $eq: [{ "$year": "$paymentDate" }, 2024] }
                    //   }
                    // },
                    // {
                    //   "$group": {
                    //     "_id": { "$month": "$paymentDate" },
                    //     "totalAmount": { "$sum": "$amount" }
                    //   }
                    // }
                    [
                        {
                            "$group": {
                            "_id": { 
                                "$month": "$paymentDate" 
                            },
                            "totalAmount": { 
                                "$sum": { 
                                    "$cond": [
                                        { 
                                        "$and":
                                            [ 
                                                {"$eq": [{ "$year": "$paymentDate" }, 2024]}, 
                                                { "$eq": ["$user_id", ObjectId.createFromHexString(decoded.id)] }, 
                                            ]
                                        }, 
                                        "$amount",
                                        0
                                    ]
                                }
                                }
                            }
                        }
                    ]
                  );
                paymentsGroupedByMonth.map(payment => {
                    const monthNumber = payment._id;
                    const monthName = monthMapping[monthNumber];
                    earnedMonthly[monthName] = payment.totalAmount;
                })
                let spentGroupedByMonth = await Payment.aggregate(
                    [
                        {
                            "$group": {
                            "_id": { 
                                "$month": "$paymentDate" 
                            },
                            "totalAmount": { 
                                "$sum": { 
                                    "$cond": [
                                        { 
                                        "$and":
                                            [ 
                                                {"$eq": [{ "$year": "$paymentDate" }, 2024]}, 
                                                { "$eq": ["$from_id", ObjectId.createFromHexString(decoded.id)] }, 
                                            ]
                                        }, 
                                        "$amount",
                                        0
                                    ]
                                }
                                }
                            }
                        }
                    ]
                  );
                spentGroupedByMonth.map(payment => {
                    const monthNumber = payment._id;
                    const monthName = monthMapping[monthNumber];
                    month[monthName] = payment.totalAmount;
                })

                const currencyAmt = await Payment.aggregate([
                  [
                    {
                      "$group": {
                        "_id": "$currency",
                        "val": {
                          "$push": {
                            "amount": "$amount",
                            "id": "$user_id"
                          }
                        }
                      }
                    },
                    {
                      "$project": {
                        "amt": {
                          "$sum": {
                            "$map": {
                              "input": "$val", 
                              "as": "entry",
                              "in": {
                                "$cond": [
                                  { "$eq": ["$$entry.id", ObjectId.createFromHexString(decoded.id)] },
                                  "$$entry.amount",
                                  0
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                ])

                const nullAmt = currencyAmt.find(cur => cur._id === null)

                const totalAmountByCurrencyEarned = currencyAmt.filter(cur => cur._id !== null).map( async (cur, ind) => {
                            if (cur._id === 'USD') {
                                return { ...cur, amt: cur.amt + nullAmt.amt };
                            }
                            var amountConvertToUSD = await freecurrencyapi.latest({
                                base_currency: 'USD',
                                currencies: cur._id
                            });
                            if(amountConvertToUSD.errors) {
                                throw new Error(amountConvertToUSD.errors.currencies[0] ?? 'Currency is invalid')
                            }
                            const amount = cur.amt  * amountConvertToUSD.data[cur._id];
                            // cur.amt = Math.floor(amount)
                            return {...cur, amt: Math.floor(amount)};
                        } )

                        const currencySpent = await Payment.aggregate([
                            [
                                {
                                  "$group": {
                                    "_id": "$currency",
                                    "val": {
                                      "$push": {
                                        "amount": "$amount",
                                        "id": "$from_id"
                                      }
                                    }
                                  }
                                },
                                {
                                  "$project": {
                                    "amt": {
                                      "$sum": {
                                        "$map": {
                                          "input": "$val", 
                                          "as": "entry",
                                          "in": {
                                            "$cond": [
                                              { "$eq": ["$$entry.id", ObjectId.createFromHexString(decoded.id)] },
                                              "$$entry.amount",
                                              0
                                            ]
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              ]
                        ])
        
                        const nullSpentAmt = currencySpent.find(cur => cur._id === null)

                    const totalAmountByCurrencySpent = currencySpent.filter(cur => cur._id !== null).map( async (cur, ind) => {
                        if (cur._id === 'USD') {
                            return { ...cur, amt: cur.amt + nullSpentAmt.amt };
                        }
                        var amountConvertToUSD = await freecurrencyapi.latest({
                            base_currency: 'USD',
                            currencies: cur._id
                        });
                        if(amountConvertToUSD.errors) {
                            throw new Error(amountConvertToUSD.errors.currencies[0] ?? 'Currency is invalid')
                        }
                        const amount = cur.amt  * amountConvertToUSD.data[cur._id];
                        // cur.amt = Math.floor(amount)
                        return {...cur, amt: Math.floor(amount)};
                    } )

                return { totalAmountEarned: totalAmountEarned.moneySpent, totalAmountSpent: totalAmountSpent.moneyEarned, earnedMonthly, 
                    spentMonthly: month ,amountByCurrencyEarned: totalAmountByCurrencyEarned, amountByCurrencySpent: totalAmountByCurrencySpent};
            }
            catch (e) {
                console.log(e);
                throw new Error(e?.message ?? "Something went wrong");
            }
        }
    }
}

export default paymentDashboard;