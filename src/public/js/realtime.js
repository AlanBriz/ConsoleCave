const socket = io();

// Add new product
document.getElementById('addProductForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const product = Object.fromEntries(formData.entries());
  product.status = true;
  product.thumbnails = [];

  socket.emit('newProduct', product);
  e.target.reset();
});

// Delete product
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('deleteBtn')) {
    const id = e.target.closest('li').dataset.id;
    socket.emit('deleteProduct', id);
  }
});

// Update list
socket.on('updateProducts', (products) => {
  const list = document.getElementById('productList');
  list.innerHTML = '';
  products.forEach(p => {
    const li = document.createElement('li');
    li.dataset.id = p.id;
    li.innerHTML = `<strong>${p.title}</strong> — ${p.description} — $${p.price}
                    <button class="deleteBtn">❌</button>`;
    list.appendChild(li);
  });
});
