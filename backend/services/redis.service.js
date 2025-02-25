import Redis from 'ioredis';

const redisCient = new Redis({
    host : process.env.REDIS_HOST,
    port : process.env.REDIS_PORT,
    password : process.env.REDIS_PASSWORD
});

redisCient.on('connect',()=>{
    console.log('Redis connected');
});

export default redisCient;