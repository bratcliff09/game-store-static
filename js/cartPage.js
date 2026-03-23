import "/js/components/MyHeader/MyHeader.js";
import "/js/components/MyFooter/MyFooter.js";
import { getCart, removeFromCart } from "./utils/cart.js";
import { productList } from "./utils/productList.js";
import { getFinalPrice, formatPrice } from "./utils/money.js";
import { removeSkeleton } from "./utils/removeSkeleton.js";

let total = 0;
let salesTax = 0.06;
let shippingHandling = 3;

const ul_itemList = document.querySelector("#items ul");
createListDOM();

//Creates DOM elements based on cart item
function createListItem(
  productID,
  platformName,
  finalPriceFormatted,
  indexInCart,
) {
  const product = productList[productID];
  const { main: mainImg, path: imgFolder } = product.images;
  const imgPath = "/public/product/" + imgFolder + "/" + mainImg;

  const li = document.createElement("li");
  li.classList.add("product-game");

  li.innerHTML = `
    <div>
        <img src="${imgPath}" />
    </div>
    <div>
        <a href="/html/product.html?id=${productID}" class="title">
            ${product.title}
        </a>
        <div class="platform">
            <p>Platform</p>
            <p>${platformName}</p>
        </div>
        <button>Delete</button>
    </div>
    <p>${finalPriceFormatted}</p>
  `;
  li.querySelector("button").onclick = () => onListItemDelete(indexInCart);

  ul_itemList.append(li);
}

//Creates the list items and caluclates price based on cart
function createListDOM() {
  const cart = getCart();
  if (cart.length === 0) {
    const div_gridWrapper = document.querySelector("#grid-wrapper");
    div_gridWrapper.innerHTML = '<p class="empty-cart">Your Cart is Empty</p>';
    return;
  }

  ul_itemList.innerHTML = "";
  total = 0;

  for (let i = 0; i < cart.length; i++) {
    const { id: productID, platform: platformValue } = cart[i];

    //Check if product with the ID exists
    if (!productList[productID]) continue;
    const { price, sale } = productList[productID];
    const finalPrice = getFinalPrice(price, sale);

    //Check if the product is available in the given platform
    const { platform: platformArr } = productList[productID];
    let platformName = platformArr.find(
      (element) => element.value === platformValue,
    );
    if (!platformName) continue;
    platformName = platformName.name;

    total += finalPrice;
    createListItem(productID, platformName, formatPrice(finalPrice), i);
  }

  const div_subtotal = document.getElementById("subtotal");
  div_subtotal.children[1].innerText = formatPrice(total);
  removeSkeleton(div_subtotal.children[1]);

  const div_tax = document.getElementById("tax");
  div_tax.children[1].innerText = formatPrice(total * salesTax);
  removeSkeleton(div_tax.children[1]);

  const div_shipping = document.getElementById("shipping");
  div_shipping.children[1].innerText = formatPrice(shippingHandling);
  removeSkeleton(div_shipping.children[1]);

  const div_totalCost = document.getElementById("total-cost");
  let finalPrice = getFinalPrice(
    total + total * salesTax + shippingHandling,
    0,
  );
  div_totalCost.children[1].innerText = formatPrice(finalPrice);
  removeSkeleton(div_totalCost.children[1]);
}

async function onListItemDelete(cartIndex) {
  await removeFromCart(cartIndex);

  //Remove event handlers from list
  for (const listItem of ul_itemList.children) {
    listItem.querySelector("button").onclick = null;
  }

  //Recreate list
  createListDOM();
}
