import "./components/MyHeader/MyHeader.js";
import "./components/MyFooter/MyFooter.js";
import { productList } from "./utils/productList.js";
import { getFinalPrice, formatPrice } from "./utils/money.js";
import { createProductItem } from "./utils/createProductItem.js";

const filters = {
  query: "",
  platform: [], //PLATFORM.value
  ratings: [], //ESRB.value
  minPrice: null, //float
  maxPrice: null, //float
};
let isCached = false;
let cachedIDList = [];
let filteredList = []; //The indexes of the products

//#region Mobile Filters Menu
const div_asideWrapper = document.querySelector("#aside-wrapper");
const btn_mobileFilterOpen = document.querySelector("#mobile-filters-open");
const btn_mobileFilterClose = document.querySelector("#mobile-filters-close");

btn_mobileFilterOpen.onclick = () => {
  div_asideWrapper.classList.toggle("open");
  div_asideWrapper.onclick = (evnt) => {
    //Close the mobile nav if clicked outside the aside
    evnt.stopPropagation();
    if (evnt.target === div_asideWrapper) {
      mobileAsideClose();
    }
  };
};

btn_mobileFilterClose.onclick = () => {
  mobileAsideClose();
};

function mobileAsideClose() {
  div_asideWrapper.classList.remove("open");
  div_asideWrapper.onclick = null;
}

//#endregion

//#region Inital Load
// On first page load, get the search query and other filters from the URL Params
const url = new URL(window.location.href);

//Query Text Search filtering
if (url.searchParams.get("q")) {
  // Get product based on their title and if it matches the query string
  filters.query = url.searchParams.get("q");
  let queryWords = url.searchParams.get("q").split(" ");
  queryWords = queryWords.map((word) => word.toLowerCase());
  for (let i = 0; i < productList.length; i++) {
    const productTitle = productList[i].title.toLowerCase();
    for (const word of queryWords) {
      if (productTitle.includes(word)) {
        cachedIDList.push(i);
      }
    }
  }
  isCached = true;
}

//Get the other filters from the URL Params
for (const [key, value] of url.searchParams) {
  switch (key) {
    case "platform":
    case "ratings":
      addToFilters(value, key, false);
      break;
    case "minPrice":
    case "maxPrice":
      const valueToInt = parseInt(value);
      if (!Number.isNaN(valueToInt)) {
        filters[key] = valueToInt;
      }
      break;
  }
}

//#endregion

//#region Filtering
const form = document.querySelector("aside form");
const fieldset_platform = document.getElementById("platform-fieldset");
const fieldset_ratings = document.getElementById("rating-fieldset");
const fieldset_price = document.getElementById("price-fieldset");
const btn_clearFilters = document.getElementById("clear-filters-btn");

btn_clearFilters.onclick = () => {
  filters.maxPrice = undefined;
  filters.minPrice = undefined;
  filters.platform = [];
  filters.ratings = [];

  const url = new URL(window.location.href);
  url.searchParams.delete("maxPrice");
  url.searchParams.delete("minPrice");
  url.searchParams.delete("platform");
  url.searchParams.delete("ratings");
  history.pushState({}, "", url);

  filterProcess();
};

fieldset_platform.onchange = (evnt) => {
  const isChecked = evnt.target.checked;
  const value = evnt.target.value;
  const attributeName = "platform";
  if (isChecked) {
    addToFilters(value, attributeName, true);
  } else {
    removeFromFilters(value, attributeName, true);
  }

  filterProcess();
};

fieldset_ratings.onchange = (evnt) => {
  const isChecked = evnt.target.checked;
  const value = evnt.target.value;
  const attributeName = "ratings";
  if (isChecked) {
    addToFilters(value, attributeName, true);
  } else {
    removeFromFilters(value, attributeName, true);
  }

  filterProcess();
};

form.onsubmit = (evnt) => {
  evnt.preventDefault();

  let minPrice = fieldset_price.children[1].children[0].value;
  minPrice = parseInt(minPrice);
  let maxPrice = fieldset_price.children[1].children[1].value;
  maxPrice = parseInt(maxPrice);

  filters.minPrice = Number.isNaN(minPrice) ? null : minPrice;
  filters.maxPrice = Number.isNaN(maxPrice) ? null : maxPrice;

  filterProcess();
};

function filter() {
  let tmpArr = [];
  if (isCached) {
    for (let i = 0; i < cachedIDList.length; i++) {
      tmpArr.push(productList[cachedIDList[i]]);
    }
  } else {
    tmpArr = productList;
  }

  //Platform
  if (filters.platform.length > 0) {
    tmpArr = tmpArr.filter((product) => {
      for (const platform of filters.platform) {
        if (product.platform.find((element) => element.value == platform)) {
          return true;
        }
      }
    });
  }

  //Age Rating
  if (filters.ratings.length > 0) {
    tmpArr = tmpArr.filter((product) => {
      for (const rating of filters.ratings) {
        return rating === product.esrb.rating.value;
      }
    });
  }

  //Price
  if (!filters.minPrice) {
    if (filters.maxPrice) {
      tmpArr = tmpArr.filter(
        (product) =>
          getFinalPrice(product.price, product.sale) <= filters.maxPrice,
      );
    }
  } else if (!filters.maxPrice) {
    tmpArr = tmpArr.filter(
      (product) =>
        getFinalPrice(product.price, product.sale) >= filters.minPrice,
    );
  } else {
    tmpArr = tmpArr.filter((product) => {
      const finalPrice = getFinalPrice(product.price, product.sale);
      return finalPrice >= filters.minPrice && finalPrice <= filters.maxPrice;
    });
  }

  filteredList = tmpArr;
}

let isFormDisabled = false;
function filterProcess() {
  if (!isFormDisabled) {
    isFormDisabled = true;
    filter();
    updateAside();
    updateMain();
    isFormDisabled = false;
  }
}

//Push a value to an array in the 'filters' object
function addToFilters(inputValue, filterAttribute, changeURL) {
  if (filters[filterAttribute]) {
    filters[filterAttribute].push(inputValue);
  }

  if (!changeURL) return;
  const url = new URL(window.location.href);
  url.searchParams.append(filterAttribute, inputValue);
  history.pushState({}, "", url);
}

//Remove a value from an array in the 'filters' object
function removeFromFilters(inputValue, filterAttribute, changeURL) {
  if (filters[filterAttribute]) {
    const index = filters[filterAttribute].indexOf(inputValue);
    if (index !== -1) {
      filters[filterAttribute].splice(index, 1);

      if (!changeURL) return;
      const url = new URL(window.location.href);
      url.searchParams.delete(filterAttribute, inputValue);
      history.pushState({}, "", url);
    }
  }
}
//#endregion

//#region Aside
function updateAside() {
  let platformArr = filteredList
    .map((product) => product.platform)
    .flat()
    .filter(onlyUnique);
  platformArr = platformArr.sort((a, b) => a.name.localeCompare(b.name)); // Sort Alphabetically
  const ul_platform = fieldset_platform.children[1];
  createCheckboxFieldset(platformArr, ul_platform, "platform");

  const ratingArr = filteredList
    .map((product) => product.esrb.rating)
    .filter(onlyUnique)
    .sort((a, b) => a.id - b.id);
  const ul_ratings = fieldset_ratings.children[1];
  createCheckboxFieldset(ratingArr, ul_ratings, "ratings");
}

function createCheckboxFieldset(availableOptions, ulDOM, filtersCategory) {
  //Split into those already checked and those not checked
  const checkedArr = availableOptions.filter((option) =>
    filters[filtersCategory].includes(option.value),
  );
  const notCheckedArr = availableOptions.filter(
    (option) => !filters[filtersCategory].includes(option.value),
  );
  const concatedArr = checkedArr.concat(notCheckedArr);

  ulDOM.innerHTML = "";
  for (let i = 0; i < availableOptions.length; i++) {
    const optionIsChecked = i < checkedArr.length ? "checked" : "";
    const option = concatedArr[i];

    const liStr = `
    <li>
      <label class="custom-checkbox">
        <input type="checkbox" value="${option.value}" ${optionIsChecked}/>
        <div>${option.name}</div>
      </label>
    </li>
    `;
    ulDOM.innerHTML += liStr;
  }
}

function onlyUnique(value, index, array) {
  //https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
  return array.indexOf(value) === index;
}
//#endregion

//#region Main
const main = document.querySelector("main");
const ul_resultsList = document.querySelector("main ul");
const span_resultNumber = document.querySelector("main #result-number");

//"{x} Results for {search query}"
if (filters.query) {
  const span_resultQuery = document.querySelector("#result-query");
  span_resultQuery.innerText = filters.query;
  span_resultQuery.classList.remove("skeleton");
  const myHeader = document.querySelector("my-header");
  if (myHeader) {
    myHeader.setSearchQuery(filters.query);
  }
} else {
  document.querySelector("main h2").childNodes[2].nodeValue = " Results";
  document.querySelector("#result-query").remove();
}

function updateMain() {
  if (filteredList.length === 0) {
    span_resultNumber.innerText = 0;
    ul_resultsList.innerHTML = "";
    return;
  } else {
    span_resultNumber.innerText = filteredList.length;
  }

  ul_resultsList.innerHTML = "";

  for (let i = 0; i < filteredList.length; i++) {
    const productID = filteredList[i].id;
    const li = createProductItem(productID);
    ul_resultsList.append(li);
  }
}

//#endregion
filterProcess();
