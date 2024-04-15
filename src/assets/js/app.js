import MobileMenu from 'mmenu-light';
import Swal from 'sweetalert2';
import Anime from './partials/anime';
import initTootTip from './partials/tooltip';
import AppHelpers from "./app-helpers";

class App extends AppHelpers {
  constructor() {
    super();
    window.app = this;
  }

  loadTheApp() {
    this.commonThings();
    this.initiateNotifier();
    this.initiateMobileMenu();
    if(header_is_sticky){
      this.initiateStickyMenu();
    }
    this.initAddToCart();
    this.initiateAdAlert();
    this.initiateDropdowns();
    this.initiateModals();
    this.initiateCollapse();
    this.changeMenuDirection()
    initTootTip();
    this.loadModalImgOnclick();

    salla.comment.event.onAdded(() => window.location.reload());

    this.status = 'ready';
    document.dispatchEvent(new CustomEvent('theme::ready'));
    this.log('Theme Loaded 🎉');
  }

  log(message) {
    salla.log(`ThemeApp(Raed)::${message}`);
    return this;
  }

    // fix Menu Direction at the third level >> The menu at the third level was popping off the page
    changeMenuDirection(){
      app.all('.root-level.has-children',item=>{
        if(item.classList.contains('change-menu-dir')) return;
        app.on('mouseover',item,()=>{
          let submenu = item.querySelector('.sub-menu .sub-menu'),
              rect = submenu.getBoundingClientRect();
            (rect.left < 10 || rect.right > window.innerWidth - 10) && app.addClass(item,'change-menu-dir')
        })
      })
    }

  loadModalImgOnclick(){
    document.querySelectorAll('.load-img-onclick').forEach(link => {
      link.addEventListener('click', (event)=> {
        event.preventDefault();
        let modal = document.querySelector('#' + link.dataset.modalId),
            img = modal.querySelector('img'),
            imgSrc = img.dataset.src;
        modal.open();
        
        if(img.classList.contains('loaded')) return;

        img.src = imgSrc;
        img.classList.add('loaded');
      })
    })
  }

  commonThings(){
    this.cleanContentArticles('.content-entry');
  }

  cleanContentArticles(elementsSelector){
    let articleElements = document.querySelectorAll(elementsSelector);

    if (articleElements.length) {
      articleElements.forEach(article => {
        article.innerHTML = article.innerHTML.replace(/\&nbsp;/g, ' ')
      })
    }
  }

  copyToClipboard(event) {
    event.preventDefault();
    let aux = document.createElement("input"),
      btn = event.currentTarget;
    aux.setAttribute("value", btn.dataset.content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    this.toggleElementClassIf(btn, 'copied', 'code-to-copy', () => true);
    setTimeout(() => {
      this.toggleElementClassIf(btn, 'code-to-copy', 'copied', () => true)
    }, 1000);
  }

  initiateNotifier() {
    salla.notify.setNotifier(function (message, type, data) {
      if (typeof message == 'object') {
        return Swal.fire(message).then(type);
      }

      return Swal.mixin({
        toast            : true,
        position         : salla.config.get('theme.is_rtl') ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer            : 3500,
        didOpen          : (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      }).fire({
        icon            : type,
        title           : message,
        showCloseButton : true,
        timerProgressBar: true
      })
    });
  }

  initiateMobileMenu() {
    let menu = this.element("#mobile-menu");
    //in landing menu will not be their
    if (!menu) {
      return;
    }
    menu = new MobileMenu(menu, "(max-width: 1024px)", "( slidingSubmenus: false)");
    salla.lang.onLoaded(() => {
      menu.navigation({title: salla.lang.get('blocks.header.main_menu')});
    });
    const drawer = menu.offcanvas({position: salla.config.get('theme.is_rtl') ? "right" : 'left'});

    this.onClick("a[href='#mobile-menu']", event => {
      document.body.classList.add('menu-opened');
      event.preventDefault() || drawer.close() || drawer.open()
    });
    this.onClick(".close-mobile-menu", event => {
      document.body.classList.remove('menu-opened');
      event.preventDefault() || drawer.close()
    });
  }

  initiateStickyMenu() {
    let header = this.element('#mainnav'),
      height = this.element('#mainnav .inner')?.clientHeight;
    //when it's landing page, there is no header
    if (!header) {
      return;
    }

    window.addEventListener('load', () => setTimeout(() => this.setHeaderHeight(), 500))
    window.addEventListener('resize', () => this.setHeaderHeight())

    window.addEventListener('scroll', () => {
      window.scrollY >= header.offsetTop + height ? header.classList.add('fixed-pinned', 'animated') : header.classList.remove('fixed-pinned');
      window.scrollY >= 200 ? header.classList.add('fixed-header') : header.classList.remove('fixed-header', 'animated');
    }, {passive: true});
  }

  setHeaderHeight() {
    let height = this.element('#mainnav .inner').clientHeight,
      header = this.element('#mainnav');
    header.style.height = height + 'px';
  }

  /**
   * Because salla caches the response, it's important to keep the alert disabled if the visitor closed it.
   * by store the status of the ad in local storage `salla.storage.set(...)`
   */
  initiateAdAlert() {
    let ad = this.element(".salla-advertisement");

    if (!ad) {
      return;
    }

    if (!salla.storage.get('statusAd-' + ad.dataset.id)) {
      ad.classList.remove('hidden');
    }

    this.onClick('.ad-close', function (event) {
      event.preventDefault();
      salla.storage.set('statusAd-' + ad.dataset.id, 'dismissed');

      anime({
        targets : '.salla-advertisement',
        opacity : [1, 0],
        duration: 300,
        height  : [ad.clientHeight, 0],
        easing  : 'easeInOutQuad',
      });
    });
  }

  initiateDropdowns() {
    this.onClick('.dropdown__trigger', ({target: btn}) => {
      btn.parentElement.classList.toggle('is-opened');
      document.body.classList.toggle('dropdown--is-opened');
      // Click Outside || Click on close btn
      window.addEventListener('click', ({target: element}) => {
        if (!element.closest('.dropdown__menu') && element !== btn || element.classList.contains('dropdown__close')) {
          btn.parentElement.classList.remove('is-opened');
          document.body.classList.remove('dropdown--is-opened');
        }
      });
    });
  }

  initiateModals() {
    this.onClick('[data-modal-trigger]', e => {
      let id = '#' + e.target.dataset.modalTrigger;
      this.removeClass(id, 'hidden');
      setTimeout(() => this.toggleModal(id, true)); //small amont of time to running toggle After adding hidden
    });
    salla.event.document.onClick("[data-close-modal]", e => this.toggleModal('#' + e.target.dataset.closeModal, false));
  }

  toggleModal(id, isOpen) {
    this.toggleClassIf(`${id} .s-salla-modal-overlay`, 'ease-out duration-300 opacity-100', 'opacity-0', () => isOpen)
      .toggleClassIf(`${id} .s-salla-modal-body`,
        'ease-out duration-300 opacity-100 translate-y-0 sm:scale-100', //add these classes
        'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95', //remove these classes
        () => isOpen)
      .toggleElementClassIf(document.body, 'modal-is-open', 'modal-is-closed', () => isOpen);
    if (!isOpen) {
      setTimeout(() => this.addClass(id, 'hidden'), 350);
    }
  }

  initiateCollapse() {
    document.querySelectorAll('.btn--collapse')
      .forEach((trigger) => {
        const content = document.querySelector('#' + trigger.dataset.show);
        const state = {isOpen: false}

        const onOpen = () => anime({
          targets : content,
          duration: 225,
          height  : content.scrollHeight,
          opacity : [0, 1],
          easing  : 'easeOutQuart',
        });

        const onClose = () => anime({
          targets : content,
          duration: 225,
          height  : 0,
          opacity : [1, 0],
          easing  : 'easeOutQuart',
        })

        const toggleState = (isOpen) => {
          state.isOpen = !isOpen
          this.toggleElementClassIf(content, 'is-closed', 'is-opened', () => isOpen);
        }

        trigger.addEventListener('click', () => {
          const {isOpen} = state
          toggleState(isOpen)
          isOpen ? onClose() : onOpen();
        })
      });
  }


  /**
   * Workaround for seeking to simplify & clean, There are three ways to use this method:
   * 1- direct call: `this.anime('.my-selector')` - will use default values
   * 2- direct call with overriding defaults: `this.anime('.my-selector', {duration:3000})`
   * 3- return object to play it letter: `this.anime('.my-selector', false).duration(3000).play()` - will not play animation unless calling play method.
   * @param {string|HTMLElement} selector
   * @param {object|undefined|null|null} options - in case there is need to set attributes one by one set it `false`;
   * @return {Anime|*}
   */
  anime(selector, options = null) {
    let anime = new Anime(selector, options);
    return options === false ? anime : anime.play();
  }

  /**
   * These actions are responsible for pressing "add to cart" button,
   * they can be from any page, especially when mega-menu is enabled
   */
  initAddToCart() {
    salla.cart.event.onUpdated(summary => {
      document.querySelectorAll('[data-cart-total]').forEach(el => el.innerText = salla.money(summary.total));
      document.querySelectorAll('[data-cart-count]').forEach(el => el.innerText = salla.helpers.number(summary.count));
    });

    salla.cart.event.onItemAdded((response, prodId) => {
      app.element('salla-cart-summary').animateToCart(app.element(`#product-${prodId} img`));
    });
  }

  cartSummary() {
    const cartBtn = document.querySelector('#cart-button');
    cartBtn.addEventListener('click', async event => {
      const cartPanel = app.element('#cart-summary-panel'),
        itemsWrap = cartPanel.querySelector('#cart-summary__items'),
        total = cartPanel.querySelector('[data-cart-total]'),
        subTotal = cartPanel.querySelector('#sub-total'),
        count = cartPanel.querySelector('.cart-products-count'),
        placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));

      cartPanel.classList.add('is-opened');

      cartPanel.classList.add('is-loading');

      await salla.api.cart.details().then((res) => {

        let cart = res.data.cart;
        if (cart.items.length) {
          cartPanel.classList.remove('cart-is-empty');
          count.innerHTML = '(' + cart.count + ' منتج)';
          itemsWrap.innerHTML = cart.items.map(item => {
            let item_url = item.product_url || salla.url.get('*/p' + item.product_id);
            return `
            <form onchange="salla.form.onChange('cart.updateItem', event)" id="item-${item.id}">
              <section class="cart-item bg-white p-2.5 md:p-5 rounded mb-2.5 md:mb-5 relative border border-gray-100">
                  <input type="hidden" name="id" value="${item.id}">
                  
                  <div class="md:flex rtl:space-x-reverse md:space-x-12 items-start justify-between">
                      <div class="flex flex-1 rtl:space-x-reverse space-x-4">
                          <a href="${item_url}" class="shrink-0">
                            <img src="${item.product_image}" alt="${item.product_name}" class="flex-none w-24 h-20 rounded object-center object-cover">
                          </a>
                          <div class="space-y-1">
                              <h2 class="text-gray-900 leading-6 text-lg">
                                  <a href="${item_url}" class="text-base">${item.product_name}</a>
                              </h2>

                              <div class="flex items-center gap-1.5">
                                <span class="text-sm text-gray-500 line-through item-regular-price ${item.offer?'':'hidden'}">${ salla.money(item.product_price)}</span>
                                <span class="item-price">${salla.money(item.price)}</span>
                              </div>

                              ${item.offer ? `
                                <div class="flex items-center gap-1.5">
                                  <i class="sicon-discount-calculator text-gray-500 offer-icon"></i>
                                  <span class="text-sm text-gray-500 offer-name">${item.offer.names}</span>
                                </div>
                              ` : ``}

                              <p class="text-primary flex-none font-bold text-sm rtl:md:pl-12 ltr:md:pr-12">
                                  <span>${salla.lang.get('pages.cart.total')}:</span>
                                  <span class="inline-block item-total">${ item.is_available ? salla.money(item.total) : salla.lang.get('pages.cart.out_of_stock')}</span>
                              </p>
                          </div>
                      </div>

                      <div class="flex-1 border-t border-gray-100 pt-3 md:border-none mt-5 md:mt-0 flex justify-between items-center md:items-start">
                          
                        <salla-quantity-input cart-item-id="${item.id}" max="{{ product.max_quantity }}"
                            class="transtion transition-color duration-300" aria-label="Quantity"
                            value="${item.quantity}" name="quantity">
                        </salla-quantity-input>
                          
                      </div>
                  </div>

                  <span class="absolute top-1.5 rtl:left-1.5 ltr:right-1.5 rtl:xs:left-5 ltr:xs:right-5 xs:top-5">
                      <salla-button type="button" shape="icon" size="medium" color="danger" class="btn--delete" aria-label="Remove from the cart" onclick="salla.cart.deleteItem(${item.id}).then(() => document.querySelector('#item-${item.id}').remove())">
                        <i class="smticon-trash"></i>
                      </salla-button>
                  </span>
              </section>
            </form>
            `
          }).join('');

          total.innerHTML = salla.money(cart.total);

          if (cart.sub_total) {
            subTotal.classList.remove('hidden');
            subTotal.innerHTML = salla.money(cart.sub_total);
          } else
            subTotal.classList.add('hidden');

        } else {
          cartPanel.classList.add('cart-is-empty');
          itemsWrap.innerHTML = `
            <div class="no-content-placeholder">
                <i class="sicon-shopping-bag icon"></i>
                <p>${salla.lang.get('pages.cart.empty_cart')}</p>
            </div>
          `
        }
      }).finally(() => {
        cartPanel.classList.remove('is-loading');
      })
    })
  }
}

salla.onReady(() => (new App).loadTheApp());
