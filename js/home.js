import "./components/MyHeader/MyHeader.js";
import "./components/MyFooter/MyFooter.js";
import { productList } from "./utils/productList.js";
import { isProductReleased } from "./utils/dates.js";
import { saleToPercentage, formatPrice, getFinalPrice } from "./utils/money.js";
import { createProductItem } from "./utils/createProductItem.js";

const html = document.querySelector("html");
if (html) {
  html.onkeydown = debug;
}

function debug(evnt) {
  if (evnt.key === "M") {
    console.log("Font-Size 16px");
    html.style.fontSize = "16px";
  } else if (evnt.key === "N") {
    console.log("Font-Size 32px");
    html.style.fontSize = "32px";
  } else if (evnt.key === "B") {
    console.log("Font-Size 10px");
    html.style.fontSize = "10px";
  }
}

//#region Carousel
const SLIDE_TYPE = {
  PRODUCT_GAME: 0,
  NON_PRODUCT: 1,
};
const carouselSlides = [
  {
    title: "Resident Evil Requiem",
    description:
      "The 9th installment in this long-running horror franchise is finally here ",
    imgPath: "re9.webp", //Image name with in /public/home/heroCarousel/
    type: SLIDE_TYPE.PRODUCT_GAME,
    link: "./html/product.html?id=14",
    productID: 14,
  },

  {
    title: "A Hat in Time",
    description: "Now on sale!",
    imgPath: "hat.webp",
    type: SLIDE_TYPE.PRODUCT_GAME,
    link: "./html/product.html?id=2",
    productID: 2,
  },
  {
    title: "Kingdom Hearts 4",
    description: "Coming Soon!!",
    imgPath: "kh4.webp",
    type: SLIDE_TYPE.PRODUCT_GAME,
    link: "./html/product.html?id=14",
    productID: 13,
  },
  {
    title: "More Merch On the Way!",
    description: "Stay Tuned for More",
    imgPath: "Illustration.webp",
    type: SLIDE_TYPE.NON_PRODUCT,
    link: "#",
  },
];

//Carousel Population/Initalization
const div_carouselMain = document.querySelector("#carousel-main");
const ul_carouselSlideSelect = document.querySelector("#carousel-slide-select");
div_carouselMain.innerHTML = "";
ul_carouselSlideSelect.innerHTML = "";
for (let i = 0; i < carouselSlides.length; i++) {
  const newSlide = createCarouselSlide(i);
  div_carouselMain.append(newSlide);

  const slideSelectLi = document.createElement("li");
  if (i === 0) {
    slideSelectLi.classList.add("selected");
  }
  slideSelectLi.innerHTML = `<button aria-label="Slide ${i + 1} of ${carouselSlides.length}"></button>`;
  slideSelectLi.children[0].onclick = () => heroCarouselSetPage(i);
  ul_carouselSlideSelect.append(slideSelectLi);
}

let heroCarouselCurrPage = 0;
function heroCarouselSetPage(pageIndex) {
  if (pageIndex < 0 || pageIndex >= div_carouselMain.children.length) {
    console.error("pageIndex " + pageIndex + " goes beyond margins");
    return;
  }

  div_carouselMain.children[pageIndex].scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
  ul_carouselSlideSelect.children[heroCarouselCurrPage].classList.remove(
    "selected",
  );
  ul_carouselSlideSelect.children[pageIndex].classList.add("selected");
  heroCarouselCurrPage = pageIndex;
}

const btn_carouselBack = document.getElementById("carousel-back");
btn_carouselBack.onclick = () => heroCarouselRelativeSetPage(-1);
const btn_carouselForward = document.getElementById("carousel-forward");
btn_carouselForward.onclick = () => heroCarouselRelativeSetPage(1);

// Sets the heroCarouselSetPage using the buttons
function heroCarouselRelativeSetPage(dir) {
  let finalIndex;
  if (dir > 0) {
    finalIndex = heroCarouselCurrPage + 1;
    if (finalIndex >= div_carouselMain.children.length) {
      finalIndex = 0;
    }
  } else {
    finalIndex = heroCarouselCurrPage - 1;
    if (finalIndex < 0) {
      finalIndex = div_carouselMain.children.length - 1;
    }
  }

  heroCarouselSetPage(finalIndex);
}

function createCarouselSlide(indexInCarouselSlides) {
  const carouselSlideInfo = carouselSlides[indexInCarouselSlides];
  const product = productList[carouselSlideInfo.productID];

  const imgPath = "./public/home/heroCarousel/" + carouselSlideInfo.imgPath;

  const li = document.createElement("li");
  li.classList.add("carousel-slide");
  li.innerHTML = `
    <a href="${carouselSlideInfo.link}" class="carousel-part">
      <div class="img-wrapper">
        <img src="${imgPath}" alt="" />
      </div>
      <div class="product-info">
        <p class="title">${carouselSlideInfo.title}</p>
        <p class="description">
          ${carouselSlideInfo.description}
        </p>
        <div class="part-bottom">
          <button>Pre-Order Now</button>
          <div
            class="price"
            role="link"
            aria-label="50% discount, Current Price: $45.99, Original price: $59.99"
          >
            <p class="final-price">$45</p>
            <div class="sale">
              <p>-50%</p>
              <p>$59.99</p>
            </div>
          </div>
        </div>
      </div>
    </a>
  `;

  const slideType = carouselSlideInfo.type;
  if (slideType === SLIDE_TYPE.NON_PRODUCT) {
    li.querySelector(".part-bottom").remove();
  } else if (slideType === SLIDE_TYPE.PRODUCT_GAME) {
    let isOnSale = product.sale > 0;
    let isReleased = isProductReleased(product.releaseDate);

    const p_salePercent = li.querySelector(".sale p");
    const p_originalPrice = li.querySelector(".sale p:last-of-type");
    const btn_preOrder = li.querySelector(".part-bottom button");

    let finalPrice = getFinalPrice(product.price, product.sale);
    finalPrice = formatPrice(finalPrice);
    li.querySelector(".final-price").innerText = finalPrice;

    if (isOnSale) {
      const salePercentage = saleToPercentage(product.sale);
      const originalPrice = formatPrice(product.price);
      p_salePercent.innerText = salePercentage;
      p_originalPrice.innerText = originalPrice;

      const ariaLabel = `${salePercentage.substring(1)} discount, Current Price: ${finalPrice}, Original Price: ${originalPrice}`;
      li.querySelector(".price").ariaLabel = ariaLabel;
    } else {
      li.querySelector(".sale").remove();
      li.querySelector(".price").ariaLabel = "";
    }

    if (isReleased) {
      btn_preOrder.innerText = "Available Now";
    }
  }

  return li;
}
//#endregion

//#region Staff Picks
const staffPicksArr = [1, 8, 2];
const ul_staffPicks = document.querySelector("#staff-picks");
ul_staffPicks.innerHTML = "";
for (let i = 0; i < staffPicksArr.length; i++) {
  const li = createProductItem(staffPicksArr[i]);
  ul_staffPicks.append(li);
}
//#endregion
