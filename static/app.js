// ShopSphere frontend
// Loads products from the API, draws the catalogue, and keeps the basket updated.

let products = [];
let searchTerm = '';

// Show a short message at the bottom of the screen.
function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show' + (type ? ' ' + type : '');

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () {
    toast.className = 'toast';
  }, 3200);
}

// Prices are shown in pounds for the UK shop demo.
function formatMoney(amount) {
  return '£' + amount.toFixed(2);
}

async function loadProducts() {
  const response = await fetch('/api/products');
  products = await response.json();
  renderProducts();
}

function renderProducts() {
  const box = document.getElementById('products');
  const empty = document.getElementById('products-empty');
  const term = searchTerm.trim().toLowerCase();
  const filtered = products.filter(function (product) {
    if (!term) {
      return true;
    }
    return (
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term)
    );
  });

  box.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  filtered.forEach(function (product) {
    box.appendChild(makeProductCard(product));
  });
}

// Build one product card with a photo, category, price, and add button.
function makeProductCard(product) {
  const card = document.createElement('article');
  card.className = 'card';

  const thumb = document.createElement('div');
  thumb.className = 'card-thumb';

  const img = document.createElement('img');
  img.src = '/images/' + product.image;
  img.alt = product.name;
  img.loading = 'lazy';
  thumb.appendChild(img);
  card.appendChild(thumb);

  const body = document.createElement('div');
  body.className = 'card-body';

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = product.category + ' · ' + product.sku;
  body.appendChild(meta);

  const name = document.createElement('h3');
  name.className = 'name';
  name.textContent = product.name;
  body.appendChild(name);

  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = formatMoney(product.price);
  body.appendChild(price);

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.textContent = 'Add to basket';
  addButton.onclick = function () {
    addToCart(product.id);
  };
  body.appendChild(addButton);

  card.appendChild(body);
  return card;
}

async function addToCart(productId) {
  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId })
  });
  showToast('Added to basket', 'success');
  loadCart();
}

async function updateQty(productId, qty) {
  await fetch('/api/cart/item', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId, qty: qty })
  });
  loadCart();
}

async function loadCart() {
  const response = await fetch('/api/cart');
  const data = await response.json();

  document.getElementById('total').textContent = formatMoney(data.total);
  document.getElementById('subtotal').textContent = formatMoney(data.total);

  const itemCount = data.items.reduce(function (sum, item) {
    return sum + item.qty;
  }, 0);
  document.getElementById('cart-count').textContent = itemCount + (itemCount === 1 ? ' item' : ' items');

  const list = document.getElementById('cart');
  const empty = document.getElementById('cart-empty');
  list.innerHTML = '';

  if (data.items.length === 0) {
    empty.classList.remove('hidden');
    document.getElementById('checkout').disabled = true;
    return;
  }

  empty.classList.add('hidden');
  document.getElementById('checkout').disabled = false;

  data.items.forEach(function (item) {
    list.appendChild(makeCartRow(item));
  });
}

function makeCartRow(item) {
  const li = document.createElement('li');
  li.className = 'cart-item';

  const name = document.createElement('div');
  name.className = 'cart-item-name';
  name.textContent = item.name;
  li.appendChild(name);

  const unitPrice = document.createElement('div');
  unitPrice.className = 'cart-item-price';
  unitPrice.textContent = formatMoney(item.price) + ' each';
  li.appendChild(unitPrice);

  const lineTotal = document.createElement('div');
  lineTotal.className = 'cart-item-total';
  lineTotal.textContent = formatMoney(item.price * item.qty);
  li.appendChild(lineTotal);

  const controls = document.createElement('div');
  controls.className = 'qty-controls';

  const minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'secondary';
  minus.textContent = '−';
  minus.setAttribute('aria-label', 'Decrease quantity');
  minus.onclick = function () {
    updateQty(item.id, item.qty - 1);
  };

  const qty = document.createElement('span');
  qty.textContent = String(item.qty);

  const plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'secondary';
  plus.textContent = '+';
  plus.setAttribute('aria-label', 'Increase quantity');
  plus.onclick = function () {
    updateQty(item.id, item.qty + 1);
  };

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'ghost';
  remove.textContent = 'Remove';
  remove.onclick = function () {
    updateQty(item.id, 0);
  };

  controls.appendChild(minus);
  controls.appendChild(qty);
  controls.appendChild(plus);
  controls.appendChild(remove);
  li.appendChild(controls);

  return li;
}

document.getElementById('search').addEventListener('input', function (event) {
  searchTerm = event.target.value;
  renderProducts();
});

document.getElementById('clear').onclick = async function () {
  await fetch('/api/cart', { method: 'DELETE' });
  showToast('Basket cleared');
  loadCart();
};

document.getElementById('checkout').onclick = async function () {
  const response = await fetch('/api/checkout', { method: 'POST' });
  const data = await response.json();

  if (data.error) {
    showToast(data.error, 'error');
    return;
  }

  showToast(data.message + ' Total: ' + formatMoney(data.total), 'success');
  loadCart();
};

loadProducts();
loadCart();
