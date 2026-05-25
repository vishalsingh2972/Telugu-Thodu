import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()

await redis.get("foo");