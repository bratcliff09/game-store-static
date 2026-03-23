import { productList } from "./utils/productList.js";
import { getFinalPrice, formatPrice } from "./utils/money.js";
import { addGameToCart, isProductInCart } from "./utils/cart.js";
import { removeSkeleton } from "./utils/removeSkeleton.js";
import "./components/MyHeader/MyHeader.js";
import "./components/MyFooter/MyFooter.js";

let productID = -1;

//#region Initialization
//Get the product using the ID from the search param
const url = new URL(window.location.href);
const searchParams = new URLSearchParams(url.search);
if (searchParams.has("id")) {
  let id = searchParams.get("id");
  id = parseInt(id);
  if (Number.isNaN(id)) {
    redirectTo404();
  }

  //Check if the ID exists within productList
  if (!productList[id]) {
    redirectTo404();
  }

  productID = id;
} else {
  redirectTo404();
}

function redirectTo404() {
  //TODO: Remove debug
  const debug = false;
  if (debug) {
    throw new Error("404 Redirect simulation");
  }
  window.location.replace("/html/404.html");
}

//#endregion

//#region Populating
//Populate the page based on the product
const product = productList[productID];
let isInCart = isProductInCart(productID);

//Page Title in Browser
document.title = product.title + " | GameStore";

//Title
const h1_gameTitle = document.querySelector("#game-summary section h1");
h1_gameTitle.innerText = product.title;
removeSkeleton(h1_gameTitle);

//Availlable Platforms
const fieldset = document.querySelector("#game-summary section fieldset");
for (const platform of product.platform) {
  const input = document.createElement("input");
  input.type = "button";
  input.value = platform.name;
  input.setAttribute("internal-value", platform.value);
  input.onclick = selectPlatform;
  fieldset.append(input);
}
fieldset.children[1].classList.add("platform-selected");

//Price
const div_price = document.querySelector(".price");
if (product.sale > 0) {
  let finalPrice = getFinalPrice(product.price, product.sale);
  finalPrice = formatPrice(finalPrice);
  let salePercent = (product.sale * 100).toFixed(0);
  div_price.children[0].innerText = finalPrice;
  div_price.children[1].innerText = `${salePercent}%`;
  div_price.children[2].innerText = formatPrice(product.price);
  removeSkeleton(div_price);
} else {
  div_price.children[0].innerText = formatPrice(product.price);
  div_price.children[2].remove();
  div_price.children[1].remove();
  removeSkeleton(div_price);
}

//Add to Cart Button
const btn_cart = document.querySelector("#cta-btn");
if (isInCart) {
  createGoToCartBtn();
} else {
  btn_cart.onclick = (evnt) => {
    evnt.preventDefault();

    //Add to cart
    let selectedPlatform = document.querySelector("input.platform-selected");
    selectedPlatform = selectedPlatform.getAttribute("internal-value");
    addGameToCart(productID, selectedPlatform);

    btn_cart.onclick = null;
    createGoToCartBtn();
  };
}

//Specifications
const div_specificsLeft = document.querySelector("#specifics-left");
//Developer
div_specificsLeft.children[0].children[1].innerText = product.developer;
removeSkeleton(div_specificsLeft.children[0].children[1]);

//Publisher
div_specificsLeft.children[1].children[1].innerText = product.publisher;
removeSkeleton(div_specificsLeft.children[1].children[1]);
//Release
let date = new Date(product.releaseDate + " 00:00:00");
date = date.toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
div_specificsLeft.children[2].children[1].innerText = date;
removeSkeleton(div_specificsLeft.children[2].children[1]);
//ESRB
const div_esrb = document.querySelector("#esrb");
div_esrb.children[0].innerHTML = `<img src="${"/public/esrb/" + product.esrb.rating.img}" />`;
removeSkeleton(div_esrb.children[0]);
div_esrb.children[1].innerHTML = "";
for (const descriptor of product.esrb.content) {
  div_esrb.children[1].innerHTML += `
        <li><p>${descriptor}</p></li>
        `;
}

//Description
const div_gameDescription = document.querySelector("#game-description");
div_gameDescription.children[1].innerText = product.description;
removeSkeleton(div_gameDescription.children[1]);

function createGoToCartBtn() {
  btn_cart.classList.replace("add-to-cart", "go-to-cart");
  btn_cart.innerText = "Go To Cart";
  btn_cart.href = "/html/cartPage.html";
}

function selectPlatform(evnt) {
  const prevSelected = document.querySelector("input.platform-selected");
  if (prevSelected) {
    prevSelected.classList.remove("platform-selected");
  }
  evnt.target.classList.add("platform-selected");
}
//#endregion

//#region Carousel
const ul_carouselMain = document.querySelector("#carousel-main ul");
const ul_carouselSelect = document.querySelector("#carousel-slider ul");
const btn_carouselBack = document.querySelector("#carousel-slider > button");
const btn_carouselForward = document.querySelector(
  "#carousel-slider > button:last-of-type",
);
let carouselCurrPage = 0;

//#region Carousel Initalization
const rootPath = "/public/product/" + product.images.path + "/";
const imgPathArr = [product.images.main].concat(product.images.carousel);

ul_carouselMain.innerHTML = "";
ul_carouselSelect.innerHTML = "";

for (let i = 0; i < imgPathArr.length; i++) {
  const path = rootPath + imgPathArr[i];
  ul_carouselMain.innerHTML += `
    <li><img src="${path}" /></li>
    `;

  const li = document.createElement("li");
  li.innerHTML = `
    <button aria-label="Slide ${i + 1}">
      <img src="${path}" />
    </button>
    `;
  li.children[0].onclick = () => carouselSetPage(i);

  ul_carouselSelect.append(li);
}

ul_carouselSelect.children[0].classList.add("carousel-selected");

//#endregion

btn_carouselBack.onclick = () => {
  let finalIndex = carouselCurrPage - 1;
  if (finalIndex < 0) {
    finalIndex = ul_carouselMain.children.length - 1;
  }
  carouselSetPage(finalIndex);
};

btn_carouselForward.onclick = () => {
  let finalIndex = carouselCurrPage + 1;
  if (finalIndex >= ul_carouselMain.children.length) {
    finalIndex = 0;
  }
  carouselSetPage(finalIndex);
};

function carouselSetPage(pageIndex) {
  const carouselLength = ul_carouselMain.children.length;
  if (pageIndex < 0 || pageIndex >= carouselLength) {
    console.error("pageIndex " + pageIndex + " goes beyond margins");
    return;
  }

  const { offsetLeft: parentOffsetLeft } = ul_carouselMain;
  const { offsetLeft } = ul_carouselMain.children[pageIndex];

  ul_carouselMain.scrollTo({
    left: offsetLeft - parentOffsetLeft,
    behavior: "smooth",
  });

  //Scroll its "Slide Selector" counterpart
  //Check if it's already in view
  const { offsetLeft: slideOffsetLeft } = ul_carouselSelect.children[pageIndex];
  const boundLeft = ul_carouselSelect.scrollLeft;
  const boundRight = boundLeft + ul_carouselSelect.offsetWidth;

  if (slideOffsetLeft < boundLeft) {
    const { offsetLeft: parentOffsetLeft } = ul_carouselSelect;
    const adjustValue = slideOffsetLeft - parentOffsetLeft;
    ul_carouselSelect.scrollTo({ left: adjustValue, behavior: "smooth" });
  } else if (slideOffsetLeft > boundRight) {
    const { offsetWidth } = ul_carouselSelect.children[pageIndex];
    const adjustValue = slideOffsetLeft + offsetWidth - boundRight;
    ul_carouselSelect.scrollBy({ left: adjustValue + 1, behavior: "smooth" });
  }

  ul_carouselSelect.children[carouselCurrPage].classList.remove(
    "carousel-selected",
  );
  ul_carouselSelect.children[pageIndex].classList.add("carousel-selected");
  carouselCurrPage = pageIndex;
}

//#endregion
