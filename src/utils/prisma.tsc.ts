import 'dotenv/config';

import { withAccelerate } from '@prisma/extension-accelerate';

import { PrismaClient } from '../../prisma-tsc/generated/prisma/client.js';

const accelerateUrl = process.env.TSC_DATABASE_URL ?? '';

const prismaTsc = new PrismaClient({ accelerateUrl }).$extends(withAccelerate());

export default prismaTsc;
