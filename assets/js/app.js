require('mmenu-light');
require('./partials/custom')
// require('./partials/search-modal')
require('@sallaapp/theme-utils') // todo :: change the namespace to salla.sa
require('@salla.sa/twilight-components')

window.anime = require('animejs').default;
import Alpine from 'alpinejs'
window.Alpine = Alpine;
Alpine.start();
