// This file loads the products, draws the cart, and handles the buttons.

// Get the products from the backend and show them as cards.
async function loadProducts() {
  const response = await fetch('/api/products');
  const products = await response.json();

  const box = document.getElementById('products');
  box.innerHTML = '';

  products.forEach(function (product) {
    box.appendChild(makeProductCard(product));
  });
}

// Build one product card with an emoji, name, price, and an Add button.
function makeProductCard(product) {
  const card = document.createElement('div');
  card.className = 'card';

  const emoji = document.createElement('div');
  emoji.className = 'emoji';
  emoji.textContent = product.emoji;
  card.appendChild(emoji);

  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = product.name;
  card.appendChild(name);

  const price = document.createElement('div');
  price.className = 'price';
  price.textContent = '$' + product.price.toFixed(2);
  card.appendChild(price);

  const addButton = document.createElement('button');
  addButton.textContent = 'Add to cart';
  addButton.onclick = function () {
    addToCart(product.id);
  };
  card.appendChild(addButton);

  return card;
}

// Send one product to the cart, then refresh the cart view.
async function addToCart(productId) {
  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId })
  });
  loadCart();
}

// Get the cart from the backend and show the items and the total.
async function loadCart() {
  const response = await fetch('/api/cart');
  const data = await response.json();

  document.getElementById('total').textContent = 'Total: $' + data.total.toFixed(2);

  const list = document.getElementById('cart');
  list.innerHTML = '';

  // If the cart is empty, show a short message instead of an empty box.
  if (data.items.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Your cart is empty';
    list.appendChild(li);
    return;
  }

  data.items.forEach(function (item) {
    const li = document.createElement('li');
    const left = item.name + ' x' + item.qty;
    const right = '$' + (item.price * item.qty).toFixed(2);
    li.textContent = left + '  ' + right;
    list.appendChild(li);
  });
}

// Empty the cart.
document.getElementById('clear').onclick = async function () {
  await fetch('/api/cart', { method: 'DELETE' });
  loadCart();
};

// Check out. The backend clears the cart and sends back a thank you message.
document.getElementById('checkout').onclick = async function () {
  const response = await fetch('/api/checkout', { method: 'POST' });
  const data = await response.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  alert(data.message + ' Total was $' + data.total.toFixed(2));
  loadCart();
};

// Load everything when the page opens.
loadProducts();
loadCart();
