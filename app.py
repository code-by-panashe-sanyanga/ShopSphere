# ShopSphere backend
# A small Flask shop. The products live in a list in memory and the shopping
# cart is kept in the user session, so each visitor has their own cart.

from flask import Flask, request, jsonify, session, send_from_directory

app = Flask(__name__, static_folder="static")

# The secret key is needed so Flask can sign the session cookie.
# In a real app this would be a long random value kept out of the code.
app.secret_key = "shopsphere-dev"

# Our catalogue. Prices are in GBP. Images live in static/images/.
PRODUCTS = [
    {"id": 1, "name": "Hardcover Notebook", "price": 3.99, "category": "Stationery", "sku": "SS-001", "image": "notebook.jpg"},
    {"id": 2, "name": "Ceramic Mug", "price": 9.99, "category": "Kitchen", "sku": "SS-002", "image": "mug.jpg"},
    {"id": 3, "name": "Wireless Headphones", "price": 44.99, "category": "Electronics", "sku": "SS-003", "image": "headphones.jpg"},
    {"id": 4, "name": "Day Backpack", "price": 32.00, "category": "Bags", "sku": "SS-004", "image": "backpack.jpg"},
    {"id": 5, "name": "Pen Set (3 pack)", "price": 5.50, "category": "Stationery", "sku": "SS-005", "image": "pens.jpg"},
    {"id": 6, "name": "Steel Water Bottle", "price": 8.00, "category": "Kitchen", "sku": "SS-006", "image": "bottle.jpg"},
]


# Find a product by its id. The id can be a number or a string (the cart keeps
# ids as strings), so I compare them as strings to be safe. Returns None if not found.
def find_product(product_id):
    for product in PRODUCTS:
        if str(product["id"]) == str(product_id):
            return product
    return None


# Serve the main page.
@app.route("/")
def index():
    return send_from_directory("static", "index.html")


# Serve the other files in the static folder (style.css and app.js).
@app.route("/<path:path>")
def static_files(path):
    return send_from_directory("static", path)


# Send the product list to the frontend as JSON.
@app.get("/api/products")
def get_products():
    return jsonify(PRODUCTS)


# Build the cart for the current visitor.
# The cart in the session looks like {"1": 2, "3": 1} (product id -> quantity).
# Here we turn that into a full list with names, prices, and a total.
@app.get("/api/cart")
def get_cart():
    cart = session.get("cart", {})
    items = []
    for product_id, qty in cart.items():
        product = find_product(product_id)
        if product:
            items.append({**product, "qty": qty})

    total = sum(item["price"] * item["qty"] for item in items)
    return jsonify({"items": items, "total": round(total, 2)})


# Add one product to the cart.
@app.post("/api/cart")
def add_to_cart():
    data = request.get_json() or {}
    product_id = str(data.get("product_id", ""))

    # Make sure the product actually exists before adding it.
    if find_product(product_id) is None:
        return jsonify({"error": "unknown product"}), 400

    cart = session.get("cart", {})
    cart[product_id] = cart.get(product_id, 0) + 1
    session["cart"] = cart
    return jsonify({"ok": True})


# Change quantity for one product. qty 0 removes the line.
@app.patch("/api/cart/item")
def update_cart_item():
    data = request.get_json() or {}
    product_id = str(data.get("product_id", ""))
    qty = data.get("qty")

    if find_product(product_id) is None:
        return jsonify({"error": "unknown product"}), 400

    try:
        qty = int(qty)
    except (TypeError, ValueError):
        return jsonify({"error": "invalid quantity"}), 400

    cart = session.get("cart", {})

    if qty <= 0:
        cart.pop(product_id, None)
    else:
        cart[product_id] = qty

    session["cart"] = cart
    return jsonify({"ok": True})


# Empty the whole cart.
@app.delete("/api/cart")
def clear_cart():
    session["cart"] = {}
    return jsonify({"ok": True})


# Pretend to check out. We work out the total, empty the cart, and send back a
# short message. There is no real payment, this is just for the demo.
@app.post("/api/checkout")
def checkout():
    cart = session.get("cart", {})
    if not cart:
        return jsonify({"error": "basket is empty"}), 400

    total = 0
    for product_id, qty in cart.items():
        product = find_product(product_id)
        if product:
            total += product["price"] * qty

    session["cart"] = {}
    return jsonify({"ok": True, "message": "Thanks for your order!", "total": round(total, 2)})


if __name__ == "__main__":
    app.run(port=5002, debug=True)
