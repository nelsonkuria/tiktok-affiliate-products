export const getProductSearchTitle = (title: string, commission?: boolean) => {
  const STOPWORDS = new Set([
    'and',
    'the',
    'for',
    'with',
    'of',
    'a',
    'in',
    'on',
    'at',
    'to',
    'is',
    'by',
    'from',
    'this',
    'that',
    'an',
    'it',
    'its',
    'as',
    'or',
    'be',
    'are',
  ]);
  const MARKETING = new Set([
    'new',
    'arrival',
    'official',
    'organic',
    'natural',
    'premium',
    'new',
    'best',
    'top',
    'quality',
    '100',
    'percent',
    'cheap',
    'deal',
    'discount',
    'counts',
    'count',
    'summer',
    'winter',
    'spring',
    'null',
  ]);

  // 1️⃣ Remove decorative/square bracket characters (keep the text inside)
  // e.g. "【Dr.Melaxin PeelShot】" -> " Dr.Melaxin PeelShot "
  // ℹ️ For retrieving product commissions, we remove the entire square bracket section
  let text = commission
    ? title.replace(/[【[(（〔][^\]】)）〕]*(?:[】\])|[)）〕])/g, ' ')
    : title.replace(/[【】〔〕［］[\]（）()]/g, ' ');

  // 2️⃣ Replace most punctuation with a space, except - and _
  text = text.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, ' ');

  // 3️⃣ 🛑 (Removed) Add a space before uppercase letters that follow lowercase letters
  // e.g. "CountsSoap" -> "Counts Soap"
  // text = text.replace(/([a-z])([A-Z])/g, '$1 $2')

  // 4️⃣ Split on any punctuation or whitespace
  const clean = text
    .replace(/[^\w\s-_]/g, '') // keep hyphens and underscores
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !MARKETING.has(w));

  // Deduplicate
  const unique = [...new Set(clean)];

  return unique.join(' ');
};
