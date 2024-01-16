/*!
 * Crafted with ❤ by Salla
 */
System.register(["./p-52326bc0.system.js","./p-1932c8ef.system.js"],(function(e){"use strict";var t,r,s,u,o;return{setters:[function(e){t=e.r;r=e.h;s=e.H;u=e.g},function(e){o=e.H}],execute:function(){var i="";var n=e("salla_products_slider",function(){function e(e){t(this,e);this.blockTitle=undefined;this.subTitle=undefined;this.sliderId=undefined;this.displayAllUrl=undefined;this.autoplay=undefined;this.source=undefined;this.sourceValue=undefined;this.limit=undefined;this.sliderConfig=undefined;this.productCardComponent="custom-salla-product-card";this.productsData=undefined;this.isReady=undefined;this.sourceValueIsValid=undefined;this.hasCustomComponent=undefined;this.apiUrl="";this.parsedSourceValue=undefined}e.prototype.isSourceWithoutValue=function(){return["offers","latest","sales"].includes(this.getSource())};e.prototype.getItemHTML=function(e){this.getSource()==="landing-page"&&(e.url="");if(this.hasCustomComponent&&this.productCardComponent.toLowerCase()=="custom-salla-product-card"){return r("div",{class:"s-products-slider-card"},r("custom-salla-product-card",{product:e,source:this.getSource(),"source-value":this.getSourceValue()}))}if(this.hasCustomComponent){var t=document.createElement(this.productCardComponent);t.setAttribute("product",JSON.stringify(e));t.setAttribute("source",this.getSource());t.setAttribute("source-value",this.getSourceValue());return r("div",{class:"s-products-slider-card",innerHTML:t.outerHTML})}return r("div",{class:"s-products-slider-card"},r("salla-product-card",{"show-quantity":this.getSource()=="landing-page","hide-add-btn":this.getSource()=="landing-page","shadow-on-hover":true,product:e}))};e.prototype.canRender=function(){return this.sourceValueIsValid&&this.isReady};e.prototype.componentWillLoad=function(){var e=this;return o.onSallaReadyPromise((function(){e.sourceValueIsValid=!!(e.getSourceValue()||e.isSourceWithoutValue());if(!e.sourceValueIsValid){salla.logger.warn("source-value prop is required for source [".concat(e.getSource(),"]"));return}e.hasCustomComponent=!!customElements.get(e.productCardComponent);if(e.source==="json"){e.productsData=e.getSourceValue();e.isReady=true;return}if(e.getSource()=="related"&&!salla.config.get("store.settings.product.related_products_enabled")){return e.isReady=false}return o.fetchProducts(e.getSource(),e.getSourceValue(),e.limit).then((function(t){e.productsData=t.data;e.isReady=true;salla.event.emit("salla-products-slider::products.fetched",t.data)}))}))};e.prototype.getSource=function(){return o.getProductsSource(this.source)};e.prototype.getSourceValue=function(){return o.getProductsSourceValue(this.source,this.sourceValue)};e.prototype.render=function(){var e=this;var t;if(!this.canRender()){return}return r(s,{class:"s-products-slider-wrapper"},r("salla-slider",{class:"s-products-slider-slider",id:this.sliderId||"s-products-slider-".concat(Math.random().toString(36).substr(2,9)),"auto-play":this.autoplay,type:"carousel","block-title":this.blockTitle,"block-subTitle":this.subTitle,"display-all-url":this.displayAllUrl,sliderConfig:this.sliderConfig?this.sliderConfig:null},r("div",{slot:"items"},(t=this.productsData)===null||t===void 0?void 0:t.map((function(t){return e.getItemHTML(t)})))))};Object.defineProperty(e.prototype,"host",{get:function(){return u(this)},enumerable:false,configurable:true});return e}());n.style=i}}}));
//# sourceMappingURL=p-0bfedf5d.system.entry.js.map