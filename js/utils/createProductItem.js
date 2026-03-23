import { productList } from "./productList.js";
import { saleToPercentage, formatPrice, getFinalPrice } from "./money.js";

// Create a product list item from it's productID
// Used in search and home pages
export function createProductItem(productID) {
  const product = productList[productID];

  //Get main cover image
  const publicPhotosPath = "/public/product/";
  let coverImage, path;
  if (product.images) {
    coverImage = product.images.main;
    path = product.images.path + "/";
  } else {
    coverImage = "";
    path = "";
  }

  let finalPrice = getFinalPrice(product.price, product.sale);
  finalPrice = formatPrice(finalPrice);

  let productPage = "/html/product.html?id=" + product.id.toString();

  // Define DOM
  const li = document.createElement("li");
  li.classList.add("product-listing");
  li.innerHTML = `
    <a href="${productPage}">
        <img src="${publicPhotosPath + path + coverImage}" />
        <div class="product-info">
            <p class="title">${product.title}</p>
            <p class="price">${finalPrice}</p>
            <div class="sale">
                <p>-0%</p>
                <p>$0.99</p>
            </div>
            <p class="pre-order">Pre Order Now</p>
        </div>
    </a>
    `;

  //If on sale
  if (product.sale > 0) {
    li.querySelector(".sale > p").innerText =
      `${saleToPercentage(product.sale)}`;
    li.querySelector(".sale > p:last-of-type").innerText =
      `${formatPrice(product.price)}`;
  } else {
    li.querySelector(".sale").remove();
  }

  //Determine if pre-order
  const todaysDate = new Date();
  const releaseDate = new Date(product.releaseDate + " 00:00:00");
  if (todaysDate >= releaseDate) {
    li.querySelector(".pre-order").remove();
  }

  return li;
}
