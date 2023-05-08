const redis = require('redis')

const options = {
    port: process.env.REDIS_PORT || "redis",
    host: process.env.REDIS_HOST || 6379,
}

if (process.env.REDIS_PASS) {
    options.password = process.env.REDIS_PASS
}

const client = redis.createClient(options)

client.on('connect', () => console.log('Client connected to redis'))

client.on('error', (err) => console.log(err.message))

client.on('ready', () => console.log('Client ready to use'))

client.on('end', () => console.log('Client disconnected from redis'))

process.on('SIGINT', () => client.quit())

module.exports = client