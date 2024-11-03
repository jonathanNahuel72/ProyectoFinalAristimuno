document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCartFromStorage();
});

const PRODUCTS_URL = 'data/products.json';
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Cargar productos
const loadProducts = async () => {
  try {
    const response = await fetch(PRODUCTS_URL);
    if (!response.ok) throw new Error("Error al cargar los productos.");
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    Swal.fire("Error", "No se pudieron cargar los productos.", "error");
  }
};

const displayProducts = (products) => {
  const productsContainer = document.getElementById("products-container");
  products.forEach(product => {
    const productCard = createProductCard(product);
    productsContainer.appendChild(productCard);
  });
};

const createProductCard = ({ id, image, name, price }) => {
  const productCard = document.createElement("div");
  productCard.classList.add("product-card");
  productCard.innerHTML = `
    <img src="${image}" alt="${name}">
    <h3>${name}</h3>
    <p>${formatCurrency(price)}</p>
    <button id="add-${id}">Agregar</button>
  `;
  productCard.querySelector(`#add-${id}`).addEventListener("click", () => addToCart(id));
  return productCard;
};

const addToCart = async (productId) => {
  try {
    const response = await fetch(PRODUCTS_URL);
    const products = await response.json();
    const product = products.find(p => p.id === productId);
    if (product) {
      const existingProduct = cart.find(item => item.id === productId);
      existingProduct ? existingProduct.quantity++ : cart.push({ ...product, quantity: 1 });
      updateCart();
      Swal.fire("Producto agregado", `${product.name} se añadió al carrito.`, "success");
    }
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
  }
};

const updateCart = () => {
  const cartList = document.getElementById("cart-list");
  cartList.innerHTML = "";

  cart.forEach(({ name, price, quantity, image }) => {
    const cartItem = document.createElement("li");
    cartItem.classList.add("cart-item");

    cartItem.innerHTML = `
      <img src="${image}" alt="${name}" class="cart-item-image">
      <div class="cart-item-info">
        <p>${name}</p>
        <p>Cantidad: ${quantity}</p>
        <p>Subtotal: ${formatCurrency(price * quantity)}</p>
      </div>
    `;

    cartList.appendChild(cartItem);
  });

  calculateTotal();
  localStorage.setItem("cart", JSON.stringify(cart));
};

const calculateTotal = () => {
  const total = cart.reduce((sum, { price, quantity }) => sum + price * quantity, 0);
  document.getElementById("cart-total").textContent = `Total: ${formatCurrency(total)}`;
};

const formatCurrency = (value) => `$${value.toFixed(2)}`;

document.getElementById("checkout-button").addEventListener("click", () => {
  if (cart.length > 0) {
    Swal.fire("Compra realizada", "Gracias por su compra", "success");
    clearCart();
  } else {
    Swal.fire("El carrito está vacío", "Por favor, agregue productos al carrito.", "info");
  }
});

document.getElementById("clear-cart-button").addEventListener("click", clearCart);

const clearCart = () => {
  cart = [];
  updateCart();
  Swal.fire("Carrito vacío", "Se ha vaciado el carrito.", "info");
};

const loadCartFromStorage = () => {
  cart.length > 0 && updateCart();
};