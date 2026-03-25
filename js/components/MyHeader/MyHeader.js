import { getCart, getCartLength } from "../../utils/cart.js";

class MyHeader extends HTMLElement {
  #form_search;
  #dialog;
  #btn_mobileMenuOpen;
  #btn_mobileMenuClose;

  #p_cartNumber;
  #animation;

  constructor() {
    super();
    //Non-ShadowRoot since imported CSS files can't contain the needed GoogleFonts import
    this.innerHTML = `
    <header>
      <button id="mobile-menu-open" class="open material-symbols-outlined">
        menu
      </button>
      <a href="index.html" id="logo">
        <img src="public/store_icon.svg" alt="GameStore logo" />
      </a>
      <form id="search" >
        <input type="text" name="" id="" placeholder="Search" />
        <input type="submit" class="material-symbols-outlined" value="search" />
      </form>
      <div id="header-col-3">
        <a href="html/404.html" id="account" aria-label="Account" >
          <div class="material-symbols-outlined">account_circle</div>
        </a>
        <a href="html/cartPage.html" id="cart">
          <div class="material-symbols-outlined">shopping_cart</div>
          <p>1</p>
        </a>
      </div>
    </header>
    <nav>
      <ul>
        <li>
          <a href="html/search.html?platform=ps5&platform=ps4">Playstation</a>
        </li>
        <li><a href="html/search.html?platform=ns">Switch</a></li>
        <li><a href="html/search.html?platform=xbox">XBOX</a></li>
        <li><a href="html/search.html?platform=pc">PC</a></li>
      </ul>
    </nav>
    <dialog closedby="any" id="mobile-nav-dialog">
      <div id="mobile-nav-wrapper">
        <button id="mobile-menu-close" aria-label="Close Menu">
          <span class="material-symbols-outlined"> close </span>
        </button>
        <div class="nav-dialog-pg">
          <section>
            <h2>Menu</h2>
            <ul>
              <li><a href="html/404.html">Account</a></li>
              <li><a href="html/404.html">Logout</a></li>
              <li><a href="html/cartPage.html">Cart</a></li>
            </ul>
          </section>
          <section id="mobile-nav-shop-by-platform">
            <h2>Shop By Platform</h2>
            <ul>
              <li>
                <a
                  href="html/search.html?platform=ps5&platform=ps4"
                  aria-label="Show More Playstation"
                  role="button"
                >
                  Playstation
                </a>
              </li>
              <li>
                <a
                  href="html/search.html?platform=ns"
                  aria-label="Show More Switch"
                  role="button"
                >
                  Switch
                </a>
              </li>
              <li>
                <a
                  href="html/search.html?platform=xbox"
                  aria-label="Show More X-Box"
                  role="button"
                >
                  XBOX
                </a>
              </li>
              <li>
                <a
                  href="html/search.html?platform=pc"
                  aria-label="Show More PC"
                  role="button"
                  >PC
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </dialog>
    `;
  }

  connectedCallback() {
    this.#form_search = this.querySelector("form");
    this.#p_cartNumber = this.querySelector("#cart p");
    this.#dialog = this.querySelector("dialog");
    this.#btn_mobileMenuOpen = this.querySelector("#mobile-menu-open");
    this.#btn_mobileMenuClose = this.querySelector("#mobile-menu-close");

    this.#form_search.onsubmit = (evnt) => this.onFormSubmit(evnt);
    this.#btn_mobileMenuOpen.onclick = () => this.onMobileMenuOpen();
    this.#btn_mobileMenuClose.onclick = () => this.onMobileMenuClose();

    const cartLength = getCartLength();
    this.setCartNumber(cartLength);

    //Prepare "Add to Cart" animation
    const keyFrames = new KeyframeEffect(
      this.#p_cartNumber,
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
    this.#animation = new Animation(keyFrames);
  }

  disconnectedCallback() {
    //Remove every handler
    this.#form_search.onsubmit = null;
    this.#btn_mobileMenuOpen.onclick = null;
    this.#btn_mobileMenuClose.onclick = null;
  }

  onFormSubmit(evnt) {
    evnt.preventDefault();

    const searchQuery = this.#form_search.children[0].value;
    window.location.href = "html/search.html?q=" + searchQuery;
  }

  onMobileMenuOpen() {
    this.#dialog.showModal();
  }

  onMobileMenuClose() {
    this.#dialog.close();
  }

  playAnimation() {
    this.#animation.play();
  }

  setCartNumber(num) {
    if (num > 10) {
      this.#p_cartNumber.innerText = "10+";
    } else if (num > 0) {
      this.#p_cartNumber.innerText = num.toString();
    } else {
      this.#p_cartNumber.innerText = "";
    }
  }

  // Used only by the "search" page
  // Sets the header's search bar to the searched query for the search page
  setSearchQuery(string) {
    this.querySelector("#search").children[0].value = string;
  }
}

customElements.define("my-header", MyHeader);
