import 'dotenv/config';

import { withAccelerate } from '@prisma/extension-accelerate';

import { PrismaClient } from '../../prisma-tsc/generated/prisma/client.js';

const accelerateUrl = process.env.BQ_DATABASE_URL ?? '';

const prismaBuzz = new PrismaClient({ accelerateUrl }).$extends(withAccelerate());

export default prismaBuzz;
