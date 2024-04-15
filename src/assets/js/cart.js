import BasePage from './base-page';

class Cart extends BasePage {
    onReady() {
        // keep update the dom base in the events
        salla.event.cart.onUpdated(data => this.updateCartPageInfo(data));

        app.watchElements({
            couponCodeInput: '#coupon-input',
            couponBtn: '#coupon-btn',
            couponError: '#coupon-error',
            subTotal: '#sub-total',
            totalDiscount: '#total-discount',
            shippingCost: '#shipping-cost',
            freeShipping: '#free-shipping',
            freeShippingBar: '#free-shipping-bar',
            freeShippingMsg: '#free-shipping-msg',
            freeShipApplied: '#free-shipping-applied'
        });

        this.initiateCoupon();
        this.initSubmitCart();
        this.cartSummary(); // Adding the cartSummary function call
    }

    initSubmitCart() {
        let submitBtn = document.querySelector('#cart-submit');
        let cartForms = document.querySelectorAll('form[id^="item-"]');
        
        if (!submitBtn) {
            return;
        }
        
        app.onClick(submitBtn, event => {
            let isValid = true;
            cartForms.forEach(form => {
                isValid = isValid && form.reportValidity();
                if (!isValid) {
                    event.preventDefault();
                    salla.notify.error(salla.lang.get('common.messages.required_fields'));
                    return;
                }
            });
    
            if (isValid) {
                /** @type HTMLSallaButtonElement */
                let btn = event.currentTarget;
                salla.config.get('user.type') == 'guest' ? salla.cart.submit() : btn.load().then(() => salla.cart.submit())
            }
        });
    }

    updateCartOptions(options) {
      if (!options || !options.length) return;

      const arrayTwoId = options.map((item) => (item.id));

      document.querySelectorAll('.cart-options form')?.forEach((form) => {
        if (!arrayTwoId.includes(parseInt(form.id.value))) {
          form.remove();
        }
      })
    }
    
    /**
     * @param {import("@salla.sa/twilight/types/api/cart").CartSummary} cartData
     */
    updateCartPageInfo(cartData) {
        //if item deleted & there is no more items, just reload the page
        if (!cartData.count) {
            // clear cart options from the dom before page reload
            document.querySelector('.cart-options')?.remove();
            return window.location.reload();
        }

        // update the dom for cart options
        this.updateCartOptions(cartData?.options);
        // update each item data
        cartData.items?.forEach(item => this.updateItemInfo(item));

        app.subTotal.innerText = salla.money(cartData.sub_total);

        app.toggleElementClassIf(app.totalDiscount, 'discounted', 'hidden', () => !!cartData.discount)
            .toggleElementClassIf(app.shippingCost, 'has_shipping', 'hidden', () => !!cartData.real_shipping_cost)
            .toggleElementClassIf(app.freeShipping, 'has_free', 'hidden', () => !!cartData.free_shipping_bar);

        app.totalDiscount.querySelector('b').innerText = '- ' + salla.money(cartData.discount);
        app.shippingCost.querySelector('b').innerText = salla.money(cartData.real_shipping_cost);

        if (!cartData.free_shipping_bar) {
            return;
        }

        let isFree = cartData.free_shipping_bar.has_free_shipping;
        app.toggleElementClassIf(app.freeShippingBar, 'active', 'hidden', () => !isFree)
            .toggleElementClassIf(app.freeShipApplied, 'active', 'hidden', () => isFree);

        app.freeShippingMsg.innerHTML = isFree
            ? salla.lang.get('pages.cart.has_free_shipping')
            : salla.lang.get('pages.cart.free_shipping_alert', { amount: salla.money(cartData.free_shipping_bar.remaining) });
        app.freeShippingBar.children[0].style.width = cartData.free_shipping_bar.percent + '%';
    }

    /**
     * @param {import("@salla.sa/twilight/types/api/cart").CartItem} item
     */
    updateItemInfo(item) {
        // lets get the elements for this item
        let cartItem = document.querySelector('#item-' + item.id);
        if (!cartItem) {
            salla.log(`Can't get the cart item dom for ${item.id}!`);
            return;
        }
        let totalElement = cartItem.querySelector('.item-total'),
            priceElement = cartItem.querySelector('.item-price'),
            regularPriceElement = cartItem.querySelector('.item-regular-price'),
            offerElement = cartItem.querySelector('.offer-name'),
            offerIconElement = cartItem.querySelector('.offer-icon'),
            hasSpecialPrice = item.offer || item.special_price > 0;

        let total = salla.money(item.total);
        if (total !== totalElement.innerText) {
            totalElement.innerText = total;
            app.anime(totalElement, { scale: [.88, 1] });
        }

        app.toggleElementClassIf(offerElement, 'offer-applied', 'hidden', () => hasSpecialPrice)
            .toggleElementClassIf(offerIconElement, 'offer-applied', 'hidden', () => hasSpecialPrice)
            .toggleElementClassIf(regularPriceElement, 'offer-applied', 'hidden', () => hasSpecialPrice)
            .toggleElementClassIf(priceElement, 'text-red-400', 'text-sm text-gray-400', () => hasSpecialPrice);

        priceElement.innerText = salla.money(item.price);
        if (hasSpecialPrice) {
            offerElement.innerText = item.offer.names;
            regularPriceElement.innerText = salla.money(item.product_price);
        }
    }


    //=================== Coupon Method ========================//
    initiateCoupon() {
        if (!app.couponCodeInput) {
            return;
        }

        app.onKeyUp(app.couponCodeInput, event => {
            event.keyCode === 13 && app.couponBtn.click();
            app.couponError.value = '';
            app.removeClass(app.couponCodeInput, 'has-error');
        });

        app.onClick(app.couponBtn, event => {
            //if it's remove coupon, will have `btn--danger` class
            let hasCoupon = app.couponBtn.classList.contains('btn--danger');
            /** @type HTMLSallaButtonElement */
            let btn = event.currentTarget;
            if (!hasCoupon && !app.couponCodeInput.value.length) {
                this.showCouponError('* ' + salla.lang.get('pages.checkout.enter_coupon'));
                return;
            }
            btn.load()
                .then(() => hasCoupon ? salla.cart.deleteCoupon() : salla.cart.addCoupon(app.couponCodeInput.value))
                .then(res => this.toggleCoupon(res, !hasCoupon))
                .catch(err => this.showCouponError(err.response?.data?.error.message, !hasCoupon))
                .finally(() => btn.stop());
        });
    }

    /**
     * @param {CartResponse.update} res
     * @param {boolean} applied
     */
    toggleCoupon(res, applied) {
        app.couponError.innerText = '';
        app.couponCodeInput.value = applied ? app.couponCodeInput.value : '';
        app.couponCodeInput.toggleAttribute('disabled', applied);

        app.toggleElementClassIf(app.couponBtn, ['btn--danger', 'has-coupon'], ['btn-default', 'has-not-coupon'], () => applied)
            .toggleElementClassIf(app.couponBtn, ['btn-default', 'has-not-coupon'], ['btn--danger', 'has-coupon'], () => !applied)
            .hideElement(app.couponBtn.querySelector(applied ? 'span' : 'i'))
            .showElement(app.couponBtn.querySelector(applied ? 'i' : 'span'))
            .removeClass(app.couponCodeInput, 'has-error');
    }

    showCouponError(message, isApplying = true) {
        app.couponError.innerText = message || salla.lang.get('pages.checkout.error_occurred');
        isApplying ? app.addClass(app.couponCodeInput, 'has-error') : null;
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
        });
    }
}

Cart.initiateWhenReady(['cart']);
