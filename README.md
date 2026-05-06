## 🛍️ TikTok Shop Affiliate Products

Access **structured TikTok Shop affiliate product data** — including pricing, commission, and sales signals — through a simple, flexible API.

This actor is designed for developers and data teams who need reliable product-level data without dealing with scraping complexity or inconsistent formats.

---

## 🚀 What This Actor Does

The **TikTok Shop Affiliate Products** actor retrieves and standardizes product data from TikTok Shop affiliate surfaces.

🔄 Data refreshes daily!

For each product, you can get:

- 💰 Pricing data (original + current ranges)
- 📊 Commission details (rate + estimated amount)
- 🔢 Units sold (useful performance signal)
- 📦 Inventory availability
- 🏪 Shop information
- 🖼️ Product metadata (title, image, categories, link)

> **Rate Limit:** To maximise success, try and limit the number of requests you make per second to betwee 1 and 10. Any more and the API might choke.

---

## 🌍 Region Support

- ✅ **United States** — fully supported
- 🌎 **Other regions coming soon** (UK, TH, SEA, EU, BR)

---

## 💡 Use Cases — What You Can Build

With this focused dataset, this actor enables solid building blocks for:

- 🛒 Affiliate tooling — surface products with commission + pricing
- 📊 Internal dashboards — track product listings and availability
- 🔍 Product research tools — explore categories, shops, and search results
- 🤖 Data pipelines — feed structured product data into other systems

If you work in **influencer marketing**, **e-commerce**, or **social commerce intelligence**, this actor is a must-have.

---

## ⚙️ How to Use

1. Choose an `endpoint`
2. Provide the matching `params`
3. Run the actor

## 📦 Available Endpoints

| Endpoint               | Description                               |
| ---------------------- | ----------------------------------------- |
| `/products`            | Get individual product details            |
| `/products/categories` | Get products by category (⚠️ coming soon) |

## 📘 Endpoint Reference

Optional params are marked by `"?"` next to their type.

If you pass wrong params e.g. typos or non acceptable values, the api will return an error.

### 1️⃣ `/products`

Retruns specific product information.

#### Params

| Name       | Type    | Description - Allowed args                      |
| ---------- | ------- | ----------------------------------------------- |
| `id`       | string  | The product id e.g. - `1731887139711062704`     |
| `title`    | string  | Full product title                              |
| `category` | string? | Product category id e.g. `600001`               |
| `price`    | string? | Minimum product price / sale price e.g. `39.49` |

#### Example Response

```js
{
}
```

---

## 🧠 Why Choose This Actor

- ✅Clean, predictable schema (no messy scraping output)
- ✅ Includes commission + pricing together (rare combo)
- ✅ Flexible endpoint system for multiple entry points
- ✅ Easy to integrate into pipelines or apps

This is a **practical data access layer** — not overloaded, but reliable where it matters.

---

## 📩 Contact

- For any queries, requests for more data or consultation send an email to `lemurxn@gmail.com` ✌️
