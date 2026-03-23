//import "/./components/MyHeader/MyHeader.js";
import "./components/MyFooter/MyFooter.js";
import { getCartLength } from "./utils/cart.js";

let a = true;
const cartNumber = document.querySelector("#cart a p");

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
  } else if (evnt.key === "P") {
    if (a) {
      cartNumber.innerText = "";
      a = false;
    } else {
      cartNumber.innerText = 1;
      a = true;
    }
  }
}

const dialog = document.querySelector("dialog");
const btn_mobileMenuOpen = document.querySelector("#mobile-menu-open");
const btn_mobileMenuClose = document.querySelector("#mobile-menu-close");

btn_mobileMenuOpen.onclick = () => {
  dialog.showModal();
  dialog.onclick = (evnt) => {
    evnt.stopPropagation();
    if (evnt.target === dialog) {
      onDialogClose();
    }
  };
};
btn_mobileMenuClose.onclick = () => onDialogClose();

function onDialogClose() {
  dialog.onclick = null;
  dialog.close();
}

//Cart animation
const keyFrames = new KeyframeEffect(
  cartNumber,
  [
    { filter: "brightness(1)" },
    { filter: "brightness(1.75)" },
    { filter: "brightness(1)" },
  ],
  {
    duration: 1250,
    direction: "normal",
    easing: "ease-in-out",
    iterations: 1,
  },
);
const animation = new Animation(keyFrames);
//animation.play();

const btn_wow = document.querySelector("main button");
btn_wow.onclick = () => {
  animation.play();
};
