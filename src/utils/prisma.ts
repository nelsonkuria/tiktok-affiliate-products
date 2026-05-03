import 'dotenv/config';

import { withAccelerate } from '@prisma/extension-accelerate';

import { PrismaClient } from '../../generated/prisma/client.js';

const accelerateUrl = process.env.DATABASE_URL ?? '';

const prisma = new PrismaClient({ accelerateUrl }).$extends(withAccelerate());

export default prisma;
