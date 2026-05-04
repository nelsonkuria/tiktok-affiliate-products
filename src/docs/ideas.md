## Features we could add

1. Allow search products by category

- Add category index
- Show category lookup

2. Allow fetching all categories

- New endpoint

3. Compute revenue and store 7d and 30d figures

- Search by revenue

### How to compute revenue

Store an array of stat values.

If `lastSync` is not today, update product record.
Get new `date`, `unitsSold` and `price` and push to array `{ date, price, unitsSold }`
