import prismaBuzz from './prisma.buzz.js';
import prismaTsc from './prisma.tsc.js';

const BATCH_SIZE = 1000;

export async function seedCategories() {
  let cursor = '';
  let count = 0;

  while (true) {
    console.log(`📚 Processing batch ${count + 1}..`);
    const categories = await prismaBuzz.category.findMany({
      take: BATCH_SIZE,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
    });

    if (categories.length === 0) break;

    const categoryPayload = categories.map((c) => {
      const { cid, parentId, name, isLeaf } = c;
      return { cid, parentId, name, isLeaf };
    });

    await prismaTsc.category.createMany({ data: categoryPayload, skipDuplicates: true });

    cursor = categories[categories.length - 1].id;
    count++;
    console.log('✔️ Done');
  }

  console.log(`✅ Syncd ${count} categories successfully.`);
}
