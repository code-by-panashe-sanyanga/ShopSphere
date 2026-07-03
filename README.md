# ShopSphere

**Built:** April 2026  
**Author:** [Panashe Sanyanga](https://github.com/code-by-panashe-sanyanga)

A small online shop demo built with Flask. Browse products, add them to a session-based cart, see a running total, clear the cart, and complete a fake checkout. The frontend is plain HTML, CSS, and JavaScript.

I built this to practise **session-based state** in a web app without setting up a database.

---

## What this project does

1. **Shop grid** — `GET /api/products` returns a fixed list of items (name, price, emoji).
2. **Add to cart** — each “Add” button sends `POST /api/cart` with `product_id`. Quantities stack if you add the same item twice.
3. **Cart panel** — `GET /api/cart` returns line items and total price.
4. **Clear cart** — `DELETE /api/cart` empties the session cart.
5. **Checkout** — `POST /api/checkout` calculates the total, clears the cart, and returns a thank-you message. There is no real payment.

Each browser visitor gets their own cart via a signed Flask session cookie.

---

## Why I chose each technology

| Technology | Why I used it |
|------------|---------------|
| **Flask** | Same stack as PixelGram — I could reuse patterns for serving static files and JSON routes. |
| **Flask sessions** | Perfect for a cart that belongs to one browser without user login. The cart is a dict in the session: `{ "product_id": quantity }`. |
| **In-memory `PRODUCTS` list** | The catalogue is tiny and static. Keeping it in `app.py` avoided another data file for a shop with six items. |
| **Vanilla JS** | Practise updating the cart UI after each API call without React. |
| **Emoji as product images** | Quick visual placeholder — no image hosting needed. |

---

## Folder structure

```
ShopSphere/
├── app.py                 # Flask server, products, cart, checkout
├── requirements.txt       # Flask dependency
├── screenshots/
│   └── home.png           # README screenshot
├── static/
│   ├── index.html         # Product grid and cart sidebar
│   ├── style.css          # Shop layout and cart styles
│   └── app.js             # Load products, cart actions, checkout
├── .gitignore
└── README.md
```

---

## How to run it

### Prerequisites

- Python 3.10 or newer

### Installation

```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
python app.py
```

Open **http://localhost:5002**

---

## Frontend files in detail

| File | What it does |
|------|----------------|
| **static/index.html** | Two-column layout: product grid area and cart panel with total, clear button, and checkout button. |
| **static/style.css** | Product cards, emoji display, cart list styling, and button states. |
| **static/app.js** | `loadProducts()` renders the grid; `addToCart(id)` POSTs to the API; `loadCart()` refreshes items and total; `clearCart()` and `checkout()` call the matching endpoints and show status messages. |

The browser must allow cookies — Flask sessions depend on them.

---

## Backend files in detail

| File | What it does |
|------|----------------|
| **app.py** | Defines `PRODUCTS`, sets `secret_key` for signing sessions, implements product lookup, cart GET/POST/DELETE, and checkout. Serves static files and runs on port **5002**. |
| **requirements.txt** | Flask only — install with pip. |

### Session cart format

Internally the session stores something like:

```json
{ "1": 2, "3": 1 }
```

Keys are product IDs (strings); values are quantities. `get_cart()` expands this into full product objects plus a `total`.

### API routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/cart` | Cart items and total |
| `POST` | `/api/cart` | Add one item — body: `{ "product_id": 1 }` |
| `DELETE` | `/api/cart` | Clear cart |
| `POST` | `/api/checkout` | Fake order — empties cart |

### Example cart response

```json
{
  "items": [
    { "id": 1, "name": "Notebook", "price": 4.5, "emoji": "📓", "qty": 2 }
  ],
  "total": 9.0
}
```

---

## JSON in this project

ShopSphere does not use a `products.json` file. Products are a Python list in `app.py`.

JSON still matters because:

- Every API response is JSON the frontend parses with `res.json()`.
- `POST /api/cart` expects JSON: `{ "product_id": <number> }`.

If the catalogue grew, moving products to a `products.json` file (like StreamFlix’s `movies.json`) would be a natural next step.

---

## venv — what not to upload

| Do commit | Do not commit |
|-----------|----------------|
| `app.py`, `static/`, `requirements.txt`, `screenshots/` | `venv/`, `__pycache__/`, `.pyc` files |

There is no `node_modules` folder — the frontend has no npm step.

---

## Screenshots

![Shop home — product grid and cart](screenshots/home.png)

---

## Limitations and possible improvements

**Current limitations**

- No real payment (Stripe, PayPal, etc.).
- Cart lives in the session — clearing browser cookies loses the cart.
- Product list is hard-coded; changing stock requires editing Python.
- No user accounts, order history, or inventory counts.
- `secret_key` is a dev string in source code — not safe for production.

**Ideas for later**

- Move products to JSON or a database with an admin page.
- Persist carts per logged-in user.
- Stock limits and “out of stock” states.
- Order confirmation emails (even mocked).
- Stripe test mode for payment flow practice.

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| **Cart always empty after add** | Ensure cookies are enabled. Do not use incognito with strict blocking unless you stay in the same tab session. |
| **“unknown product”** | `product_id` must match an ID in the `PRODUCTS` list (1–6). |
| **“cart is empty” on checkout** | Add at least one item before checkout. |
| **Wrong port** | ShopSphere uses **5002** on purpose (PixelGram uses 5000, ChatWire 5001). |
| **Static files 404** | Run `python app.py` from the project root where `app.py` lives. |
| **`ModuleNotFoundError: flask`** | Activate `venv` and run `pip install -r requirements.txt`. |

---

## Links

- [Portfolio](https://github.com/code-by-panashe-sanyanga/PS-PORTFOLIO)
- [GitHub profile](https://github.com/code-by-panashe-sanyanga)
