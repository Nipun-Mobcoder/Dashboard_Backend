import client from "../config/client.js";

const rateLimiter = async (token, timer=60, limit=5) => {
    const rate = await client.incr(token);
    if(rate === 1){
        await client.expire(token, timer);
    }
    const timeLimit = await client.ttl(token);
    if(rate > limit) {
        throw new Error(`Callled too many times please try after ${timeLimit}`)
    }
}

export default rateLimiter;