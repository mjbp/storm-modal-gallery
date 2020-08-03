(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _component = require('./libs/component');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var onDOMContentLoadedTasks = [function () {

	var gallery = _component2.default.init([{
		src: 'http://placehold.it/500x500',
		srcset: 'http://placehold.it/800x800 800w, http://placehold.it/500x500 320w',
		title: 'Image 1',
		description: 'Description 1'
	}, {
		src: 'http://placehold.it/300x800',
		srcset: 'http://placehold.it/500x800 800w, http://placehold.it/300x500 320w',
		title: 'Image 2',
		description: 'Description 2'
	}]);

	//console.log(gallery);

	// document.querySelector('.js-modal-gallery__trigger').addEventListener('click', gallery.open.bind(gallery, 0));

	_component2.default.init('.js-modal-gallery');

	// ModalGallery.init('.js-modal-single', {
	// 	single: true
	// });
}];

if ('addEventListener' in window) window.addEventListener('DOMContentLoaded', function () {
	onDOMContentLoadedTasks.forEach(function (fn) {
		return fn();
	});
});

},{"./libs/component":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _defaults = require('./lib/defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _componentPrototype = require('./lib/component-prototype');

var _componentPrototype2 = _interopRequireDefault(_componentPrototype);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var create = function create(items, opts) {
	return Object.assign(Object.create(_componentPrototype2.default), {
		items: items,
		settings: Object.assign({}, _defaults2.default, opts)
	}).init();
};

var singles = function singles(src, opts) {
	var els = [].slice.call(document.querySelectorAll(src));

	if (!els.length) throw new Error('Modal Gallery cannot be initialised, no images found');

	return els.map(function (el) {
		return create([{
			trigger: el,
			src: el.getAttribute('href'),
			srcset: el.getAttribute('data-srcset') || null,
			sizes: el.getAttribute('data-sizes') || null,
			title: el.getAttribute('data-title') || '',
			description: el.getAttribute('data-description') || ''
		}], opts);
	});
};

var galleries = function galleries(src, opts) {
	var items = void 0;

	if (typeof src === 'string') {
		var els = [].slice.call(document.querySelectorAll(src));

		if (!els.length) throw new Error('Modal Gallery cannot be initialised, no images found');

		items = els.map(function (el) {
			return {
				trigger: el,
				src: el.getAttribute('href'),
				srcset: el.getAttribute('data-srcset') || null,
				sizes: el.getAttribute('data-sizes') || null,
				title: el.getAttribute('data-title') || '',
				description: el.getAttribute('data-description') || ''
			};
		});
	} else items = src;

	return create(items, opts);
};

var init = function init(src, opts) {
	if (!src.length) throw new Error('Modal Gallery cannot be initialised, no images found');

	if (opts && opts.single) return singles(src, opts);else return galleries(src, opts);
};

exports.default = { init: init };

},{"./lib/component-prototype":3,"./lib/defaults":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _templates = require('./templates');

var KEY_CODES = {
	TAB: 9,
	ESC: 27,
	LEFT: 37,
	RIGHT: 39,
	ENTER: 13
},
    TRIGGER_EVENTS = window.PointerEvent ? ['pointerdown', 'keydown'] : ['ontouchstart' in window ? 'touchstart' : 'click', 'keydown'];

exports.default = {
	init: function init() {
		var _this = this;

		this.isOpen = false;
		this.current = false;
		this.imageCache = [];
		this.items[0].trigger && this.initTriggers();
		this.settings.preload && this.items.forEach(function (item, i) {
			_this.loadImage(i);
		});
		return this;
	},
	initTriggers: function initTriggers() {
		var _this2 = this;

		this.items.forEach(function (item, i) {
			TRIGGER_EVENTS.forEach(function (ev) {
				item.trigger.addEventListener(ev, function (e) {
					if (e.keyCode && e.keyCode !== KEY_CODES.ENTER || e.which && e.which === 3) return;
					e.preventDefault();
					e.stopPropagation();
					_this2.open(i);
				});
			});
		});
	},
	initUI: function initUI(i) {
		var _this3 = this;

		this.DOMOverlay = document.body.appendChild((0, _templates.overlay)());
		this.DOMOverlay.insertAdjacentHTML('beforeend', (0, _templates.overlayInner)(this.items.map(_templates.details).map((0, _templates.item)(this.items)).join('')));
		this.DOMItems = [].slice.call(this.DOMOverlay.querySelectorAll('.js-modal-gallery__item'));
		this.DOMTotals = this.DOMOverlay.querySelector('.js-gallery-totals');
		if (this.imageCache.length === this.items.length) this.imageCache.forEach(function (img, i) {
			_this3.writeImage(i);
		});else this.loadImages(i);
		return this;
	},
	unmountUI: function unmountUI() {
		this.DOMOverlay.parentNode.removeChild(this.DOMOverlay);
	},
	initButtons: function initButtons() {
		var _this4 = this;

		this.closeBtn = this.DOMOverlay.querySelector('.js-modal-gallery__close');
		this.closeBtn.addEventListener('click', this.close.bind(this));

		if (this.items.length < 2) {
			this.DOMOverlay.removeChild(this.DOMOverlay.querySelector('.js-modal-gallery__previous'));
			this.DOMOverlay.removeChild(this.DOMOverlay.querySelector('.js-modal-gallery__next'));
			return;
		}

		this.previousBtn = this.DOMOverlay.querySelector('.js-modal-gallery__previous');
		this.nextBtn = this.DOMOverlay.querySelector('.js-modal-gallery__next');

		TRIGGER_EVENTS.forEach(function (ev) {
			['previous', 'next'].forEach(function (type) {
				_this4[type + 'Btn'].addEventListener(ev, function (e) {
					if (e.keyCode && e.keyCode !== KEY_CODES.ENTER) return;
					_this4[type]();
				});
			});
		});
	},
	writeTotals: function writeTotals() {
		this.DOMTotals.innerHTML = this.current + 1 + '/' + this.items.length;
	},
	writeImage: function writeImage(i) {
		var imageContainer = this.DOMItems[i].querySelector('.js-modal-gallery__img-container'),
		    imageClassName = this.settings.scrollable ? 'modal-gallery__img modal-gallery__img--scrollable' : 'modal-gallery__img',
		    srcsetAttribute = this.items[i].srcset ? ' srcset="' + this.items[i].srcset + '"' : '',
		    sizesAttribute = this.items[i].sizes ? ' sizes="' + this.items[i].sizes + '"' : '';

		imageContainer.innerHTML = '<img class="' + imageClassName + '" src="' + this.items[i].src + '" alt="' + this.items[i].title + '"' + srcsetAttribute + sizesAttribute + '>';
		this.DOMItems[i].classList.remove('loading');
	},
	loadImage: function loadImage(i) {
		var _this5 = this;

		var img = new Image(),
		    loaded = function loaded() {
			_this5.imageCache[i] = img;
			_this5.writeImage(i);
		};
		img.onload = loaded;
		img.src = this.items[i].src;
		img.onerror = function () {
			_this5.DOMItems[i].classList.remove('loading');
			_this5.DOMItems[i].classList.add('error');
		};
		if (img.complete) loaded();
	},
	loadImages: function loadImages(i) {
		var _this6 = this;

		var indexes = [i];

		if (this.items.length > 1) indexes.push(i === 0 ? this.items.length - 1 : i - 1);
		if (this.items.length > 2) indexes.push(i === this.items.length - 1 ? 0 : i + 1);

		indexes.forEach(function (idx) {
			if (_this6.imageCache[idx] === undefined) {
				_this6.DOMItems[idx].classList.add('loading');
				_this6.loadImage(idx);
			}
		});
	},
	getFocusableChildren: function getFocusableChildren() {
		var focusableElements = ['a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex="-1"])'];

		return [].slice.call(this.DOMOverlay.querySelectorAll(focusableElements.join(',')));
	},
	trapTab: function trapTab(e) {
		var focusedIndex = this.focusableChildren.indexOf(document.activeElement);
		if (e.shiftKey && focusedIndex === 0) {
			e.preventDefault();
			this.focusableChildren[this.focusableChildren.length - 1].focus();
		} else {
			if (!e.shiftKey && focusedIndex === this.focusableChildren.length - 1) {
				e.preventDefault();
				this.focusableChildren[0].focus();
			}
		}
	},
	keyListener: function keyListener(e) {
		if (!this.isOpen) return;

		switch (e.keyCode) {
			case KEY_CODES.ESC:
				e.preventDefault();
				this.toggle();
				break;
			case KEY_CODES.TAB:
				this.trapTab(e);
				break;
			case KEY_CODES.LEFT:
				this.previous();
				break;
			case KEY_CODES.RIGHT:
				this.next();
				break;
			default:
				break;
		}
	},
	incrementDecrement: function incrementDecrement(fn) {
		this.current !== false && this.DOMItems[this.current].classList.remove('active');
		this.current = fn();
		this.DOMItems[this.current].classList.add('active');
		this.loadImages(this.current);
		this.items.length > 1 && this.settings.totals && this.writeTotals();
	},
	previous: function previous() {
		var _this7 = this;

		this.incrementDecrement(function () {
			return _this7.current === 0 ? _this7.DOMItems.length - 1 : _this7.current - 1;
		});
	},
	next: function next() {
		var _this8 = this;

		this.incrementDecrement(function () {
			return _this8.current === _this8.DOMItems.length - 1 ? 0 : _this8.current + 1;
		});
	},
	open: function open(i) {
		this.initUI(i);
		this.initButtons();
		this.focusableChildren = this.getFocusableChildren();
		document.addEventListener('keydown', this.keyListener.bind(this));
		this.lastFocused = document.activeElement;
		this.focusableChildren.length && window.setTimeout(function () {
			this.focusableChildren[0].focus();
		}.bind(this), 0);
		this.DOMItems[i || 0].classList.add('active');
		this.toggle(i || 0);
	},
	close: function close() {
		document.removeEventListener('keydown', this.keyListener.bind(this));
		this.lastFocused && this.lastFocused.focus();
		this.DOMItems[this.current].classList.remove('active');
		this.toggle(null);
		this.unmountUI();
	},
	toggle: function toggle(i) {
		this.isOpen = !this.isOpen;
		this.current = i;
		this.DOMOverlay.classList.toggle('active');
		this.DOMOverlay.setAttribute('aria-hidden', !this.isOpen);
		this.DOMOverlay.setAttribute('tabindex', this.isOpen ? '0' : '-1');
		this.settings.fullscreen && this.toggleFullScreen();
		this.items.length > 1 && this.settings.totals && this.writeTotals();
	},
	toggleFullScreen: function toggleFullScreen() {
		if (this.isOpen) {
			this.DOMOverlay.requestFullscreen && this.DOMOverlay.requestFullscreen();
			this.DOMOverlay.webkitRequestFullscreen && this.DOMOverlay.webkitRequestFullscreen();
			this.DOMOverlay.mozRequestFullScreen && this.DOMOverlay.mozRequestFullScreen();
		} else {
			document.exitFullscreen && document.exitFullscreen();
			document.mozCancelFullScreen && document.mozCancelFullScreen();
			document.webkitExitFullscreen && document.webkitExitFullscreen();
		}
	}
};

},{"./templates":5}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    fullscreen: false,
    preload: false,
    totals: true,
    scrollable: false,
    single: false
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var overlay = exports.overlay = function overlay() {
    var overlay = document.createElement('div');

    overlay.className = 'modal-gallery__outer js-modal-gallery__outer';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('tabindex', '-1');
    overlay.setAttribute('aria-hidden', true);

    return overlay;
};

var overlayInner = exports.overlayInner = function overlayInner(items) {
    return '<div class="modal-gallery__inner js-modal-gallery__inner" role="group" aria-roledescription="carousel">\n                                    <button class="js-modal-gallery__previous modal-gallery__previous" aria-label="Previous">\n                                        <svg focusable="false" aria-hidden="true" width="44" height="60">\n                                            <polyline points="30 10 10 30 30 50" stroke="rgb(255,255,255)" stroke-width="4" stroke-linecap="butt" fill="none" stroke-linejoin="round"/>\n                                        </svg>\n                                    </button>\n                                    <button class="js-modal-gallery__next modal-gallery__next" aria-label="Next">\n                                        <svg focusable="false" aria-hidden="true" width="44" height="60">\n                                            <polyline points="14 10 34 30 14 50" stroke="rgb(255,255,255)" stroke-width="4" stroke-linecap="butt" fill="none" stroke-linejoin="round"/>\n                                        </svg>\n                                    </button>\n                                    <button class="js-modal-gallery__close modal-gallery__close" aria-label="Close">\n                                        <svg focusable="false" aria-hidden="true" width="30" height="30">\n                                            <g stroke="rgb(255,255,255)" stroke-width="4">\n                                                <line x1="5" y1="5" x2="25" y2="25"/>\n                                                <line x1="5" y1="25" x2="25" y2="5"/>\n                                            </g>\n                                        </svg>\n                                    </button>\n                                    <div class="modal-gallery__content js-modal-gallery__content" aria-atomic="false" aria-live="polite">\n                                        ' + items + '\n                                    </div>\n                                </div>\n                                <div class="modal-gallery__total js-gallery-totals"></div>';
};

var item = exports.item = function item(items) {
    return function (details, i) {
        return '<div class="modal-gallery__item js-modal-gallery__item" role="group" aria-roledescription="slide" aria-label="Image ' + (i + 1) + ' of ' + items.length + (items[i].title ? ', ' + items[i].title : '') + '">\n                                    <div class="modal-gallery__img-container js-modal-gallery__img-container"></div>\n                                    ' + details + '\n                                </div>';
    };
};

var details = exports.details = function details(item) {
    return '<div class="modal-gallery__details">\n                                    <h1 class="modal-gallery__title">' + item.title + '</h1>\n                                    <div class="modal-gallery__description">' + item.description + '</div>\n                                </div>';
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2RlZmF1bHRzLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBQSxhQUFBLFFBQUEsa0JBQUEsQ0FBQTs7Ozs7Ozs7QUFFQSxJQUFNLDBCQUEwQixDQUFDLFlBQU07O0FBRXRDLEtBQUksVUFBVSxZQUFBLE9BQUEsQ0FBQSxJQUFBLENBQWtCLENBQy9CO0FBQ0MsT0FERCw2QkFBQTtBQUVDLFVBRkQsb0VBQUE7QUFHQyxTQUhELFNBQUE7QUFJQyxlQUFhO0FBSmQsRUFEK0IsRUFPL0I7QUFDQyxPQURELDZCQUFBO0FBRUMsVUFGRCxvRUFBQTtBQUdDLFNBSEQsU0FBQTtBQUlDLGVBQWE7QUFKZCxFQVArQixDQUFsQixDQUFkOztBQWNBOztBQUVBOztBQUVBLGFBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxtQkFBQTs7QUFFQTtBQUNBO0FBQ0E7QUF4QkQsQ0FBZ0MsQ0FBaEM7O0FBNEJBLElBQUcsc0JBQUgsTUFBQSxFQUFpQyxPQUFBLGdCQUFBLENBQUEsa0JBQUEsRUFBNEMsWUFBTTtBQUFFLHlCQUFBLE9BQUEsQ0FBZ0MsVUFBQSxFQUFBLEVBQUE7QUFBQSxTQUFBLElBQUE7QUFBaEMsRUFBQTtBQUFwRCxDQUFBOzs7Ozs7Ozs7QUM5QmpDLElBQUEsWUFBQSxRQUFBLGdCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLHNCQUFBLFFBQUEsMkJBQUEsQ0FBQTs7Ozs7Ozs7QUFFQSxJQUFNLFNBQVMsU0FBVCxNQUFTLENBQUEs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QUFBLEdBQUEsZ0RBQUE7QUFBaEIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCBNb2RhbEdhbGxlcnkgZnJvbSAnLi9saWJzL2NvbXBvbmVudCc7XG5cbmNvbnN0IG9uRE9NQ29udGVudExvYWRlZFRhc2tzID0gWygpID0+IHtcblxuXHRsZXQgZ2FsbGVyeSA9IE1vZGFsR2FsbGVyeS5pbml0KFtcblx0XHR7XG5cdFx0XHRzcmM6ICdodHRwOi8vcGxhY2Vob2xkLml0LzUwMHg1MDAnLFxuXHRcdFx0c3Jjc2V0OidodHRwOi8vcGxhY2Vob2xkLml0LzgwMHg4MDAgODAwdywgaHR0cDovL3BsYWNlaG9sZC5pdC81MDB4NTAwIDMyMHcnLFxuXHRcdFx0dGl0bGU6ICdJbWFnZSAxJyxcblx0XHRcdGRlc2NyaXB0aW9uOiAnRGVzY3JpcHRpb24gMSdcblx0XHR9LFxuXHRcdHtcblx0XHRcdHNyYzogJ2h0dHA6Ly9wbGFjZWhvbGQuaXQvMzAweDgwMCcsXG5cdFx0XHRzcmNzZXQ6J2h0dHA6Ly9wbGFjZWhvbGQuaXQvNTAweDgwMCA4MDB3LCBodHRwOi8vcGxhY2Vob2xkLml0LzMwMHg1MDAgMzIwdycsXG5cdFx0XHR0aXRsZTogJ0ltYWdlIDInLFxuXHRcdFx0ZGVzY3JpcHRpb246ICdEZXNjcmlwdGlvbiAyJ1xuXHRcdH1dKTtcblxuXHQvL2NvbnNvbGUubG9nKGdhbGxlcnkpO1xuXHRcblx0Ly8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW1vZGFsLWdhbGxlcnlfX3RyaWdnZXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGdhbGxlcnkub3Blbi5iaW5kKGdhbGxlcnksIDApKTtcblxuXHRNb2RhbEdhbGxlcnkuaW5pdCgnLmpzLW1vZGFsLWdhbGxlcnknKTtcblxuXHQvLyBNb2RhbEdhbGxlcnkuaW5pdCgnLmpzLW1vZGFsLXNpbmdsZScsIHtcblx0Ly8gXHRzaW5nbGU6IHRydWVcblx0Ly8gfSk7XG5cbn1dO1xuICAgIFxuaWYoJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7IG9uRE9NQ29udGVudExvYWRlZFRhc2tzLmZvckVhY2goZm4gPT4gZm4oKSk7IH0pOyIsImltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2xpYi9kZWZhdWx0cyc7XG5pbXBvcnQgY29tcG9uZW50UHJvdG90eXBlIGZyb20gJy4vbGliL2NvbXBvbmVudC1wcm90b3R5cGUnO1xuXG5jb25zdCBjcmVhdGUgPSAoaXRlbXMsIG9wdHMpID0+IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShjb21wb25lbnRQcm90b3R5cGUpLCB7XG5cdFx0aXRlbXM6IGl0ZW1zLFxuXHRcdHNldHRpbmdzOiBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgb3B0cylcblx0fSkuaW5pdCgpO1xuXG5jb25zdCBzaW5nbGVzID0gKHNyYywgb3B0cykgPT4ge1xuXHRsZXQgZWxzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNyYykpO1xuXG5cdGlmKCFlbHMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ01vZGFsIEdhbGxlcnkgY2Fubm90IGJlIGluaXRpYWxpc2VkLCBubyBpbWFnZXMgZm91bmQnKTtcblxuXHRyZXR1cm4gZWxzLm1hcChlbCA9PiBjcmVhdGUoW3tcblx0XHR0cmlnZ2VyOiBlbCxcblx0XHRzcmM6IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpLFxuXHRcdHNyY3NldDogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXNyY3NldCcpIHx8IG51bGwsXG5cdFx0c2l6ZXM6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1zaXplcycpIHx8IG51bGwsXG5cdFx0dGl0bGU6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpIHx8ICcnLFxuXHRcdGRlc2NyaXB0aW9uOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzY3JpcHRpb24nKSB8fCAnJ1xuXHR9XSwgb3B0cykpO1xufTtcblxuY29uc3QgZ2FsbGVyaWVzID0gKHNyYywgb3B0cykgPT4ge1xuXHRsZXQgaXRlbXM7XG5cblx0aWYodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycpe1xuXHRcdGxldCBlbHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc3JjKSk7XG5cblx0XHRpZighZWxzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdNb2RhbCBHYWxsZXJ5IGNhbm5vdCBiZSBpbml0aWFsaXNlZCwgbm8gaW1hZ2VzIGZvdW5kJyk7XG5cdFx0XG5cdFx0aXRlbXMgPSBlbHMubWFwKGVsID0+IHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHRyaWdnZXI6IGVsLFxuXHRcdFx0XHRzcmM6IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpLFxuXHRcdFx0XHRzcmNzZXQ6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1zcmNzZXQnKSB8fCBudWxsLFxuXHRcdFx0XHRzaXplczogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXNpemVzJykgfHwgbnVsbCxcblx0XHRcdFx0dGl0bGU6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpIHx8ICcnLFxuXHRcdFx0XHRkZXNjcmlwdGlvbjogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWRlc2NyaXB0aW9uJykgfHwgJydcblx0XHRcdH07XG5cdFx0fSk7XG5cdH0gZWxzZSBpdGVtcyA9IHNyYztcblxuXHRyZXR1cm4gY3JlYXRlKGl0ZW1zLCBvcHRzKTtcbn07XG5cbmNvbnN0IGluaXQgPSAoc3JjLCBvcHRzKSA9PiB7XG5cdGlmKCFzcmMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ01vZGFsIEdhbGxlcnkgY2Fubm90IGJlIGluaXRpYWxpc2VkLCBubyBpbWFnZXMgZm91bmQnKTtcblxuXHRpZihvcHRzICYmIG9wdHMuc2luZ2xlKSByZXR1cm4gc2luZ2xlcyhzcmMsIG9wdHMpO1xuXHRlbHNlIHJldHVybiBnYWxsZXJpZXMoc3JjLCBvcHRzKTtcblx0XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7IGluaXQgfTsiLCJpbXBvcnQgeyBcblx0b3ZlcmxheSxcblx0b3ZlcmxheUlubmVyLFxuXHRpdGVtLFxuXHRkZXRhaWxzXG59IGZyb20gJy4vdGVtcGxhdGVzJztcblxuY29uc3QgS0VZX0NPREVTID0ge1xuXHRcdFRBQjogOSxcblx0XHRFU0M6IDI3LFxuXHRcdExFRlQ6IDM3LFxuXHRcdFJJR0hUOiAzOSxcblx0XHRFTlRFUjogMTNcblx0fSxcblx0VFJJR0dFUl9FVkVOVFMgPSB3aW5kb3cuUG9pbnRlckV2ZW50ID8gWydwb2ludGVyZG93bicsICdrZXlkb3duJ10gOiBbJ29udG91Y2hzdGFydCcgaW4gd2luZG93ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJywgJ2tleWRvd24nIF07XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0aW5pdCgpIHtcblx0XHR0aGlzLmlzT3BlbiA9IGZhbHNlO1xuXHRcdHRoaXMuY3VycmVudCA9IGZhbHNlO1xuXHRcdHRoaXMuaW1hZ2VDYWNoZSA9IFtdO1xuXHRcdHRoaXMuaXRlbXNbMF0udHJpZ2dlciAmJiB0aGlzLmluaXRUcmlnZ2VycygpO1xuXHRcdHRoaXMuc2V0dGluZ3MucHJlbG9hZCAmJiB0aGlzLml0ZW1zLmZvckVhY2goKGl0ZW0sIGkpID0+IHsgdGhpcy5sb2FkSW1hZ2UoaSk7IH0pO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRpbml0VHJpZ2dlcnMoKXtcblx0XHR0aGlzLml0ZW1zLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcblx0XHRcdFRSSUdHRVJfRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0XHRpdGVtLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdFx0aWYoKGUua2V5Q29kZSAmJiBlLmtleUNvZGUgIT09IEtFWV9DT0RFUy5FTlRFUikgfHwgKGUud2hpY2ggJiYgZS53aGljaCA9PT0gMykpIHJldHVybjtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0XHR0aGlzLm9wZW4oaSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cdGluaXRVSShpKXtcblx0XHR0aGlzLkRPTU92ZXJsYXkgPSBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG92ZXJsYXkoKSk7XG5cdFx0dGhpcy5ET01PdmVybGF5Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgb3ZlcmxheUlubmVyKHRoaXMuaXRlbXMubWFwKGRldGFpbHMpLm1hcChpdGVtKHRoaXMuaXRlbXMpKS5qb2luKCcnKSkpO1xuXHRcdHRoaXMuRE9NSXRlbXMgPSBbXS5zbGljZS5jYWxsKHRoaXMuRE9NT3ZlcmxheS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtZ2FsbGVyeV9faXRlbScpKTtcblx0XHR0aGlzLkRPTVRvdGFscyA9IHRoaXMuRE9NT3ZlcmxheS5xdWVyeVNlbGVjdG9yKCcuanMtZ2FsbGVyeS10b3RhbHMnKTtcblx0XHRpZih0aGlzLmltYWdlQ2FjaGUubGVuZ3RoID09PSB0aGlzLml0ZW1zLmxlbmd0aCkgdGhpcy5pbWFnZUNhY2hlLmZvckVhY2goKGltZywgaSkgPT4geyB0aGlzLndyaXRlSW1hZ2UoaSk7IH0pO1xuXHRcdGVsc2UgdGhpcy5sb2FkSW1hZ2VzKGkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHR1bm1vdW50VUkoKXtcblx0XHR0aGlzLkRPTU92ZXJsYXkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLkRPTU92ZXJsYXkpO1xuXHR9LFxuXHRpbml0QnV0dG9ucygpe1xuXHRcdHRoaXMuY2xvc2VCdG4gPSB0aGlzLkRPTU92ZXJsYXkucXVlcnlTZWxlY3RvcignLmpzLW1vZGFsLWdhbGxlcnlfX2Nsb3NlJyk7XG5cdFx0dGhpcy5jbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XG5cblx0XHRpZiAodGhpcy5pdGVtcy5sZW5ndGggPCAyKSB7XG5cdFx0XHR0aGlzLkRPTU92ZXJsYXkucmVtb3ZlQ2hpbGQodGhpcy5ET01PdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5qcy1tb2RhbC1nYWxsZXJ5X19wcmV2aW91cycpKTtcblx0XHRcdHRoaXMuRE9NT3ZlcmxheS5yZW1vdmVDaGlsZCh0aGlzLkRPTU92ZXJsYXkucXVlcnlTZWxlY3RvcignLmpzLW1vZGFsLWdhbGxlcnlfX25leHQnKSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5wcmV2aW91c0J0biA9IHRoaXMuRE9NT3ZlcmxheS5xdWVyeVNlbGVjdG9yKCcuanMtbW9kYWwtZ2FsbGVyeV9fcHJldmlvdXMnKTtcblx0XHR0aGlzLm5leHRCdG4gPSB0aGlzLkRPTU92ZXJsYXkucXVlcnlTZWxlY3RvcignLmpzLW1vZGFsLWdhbGxlcnlfX25leHQnKTtcblxuXHRcdFRSSUdHRVJfRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0WydwcmV2aW91cycsICduZXh0J10uZm9yRWFjaCh0eXBlID0+IHtcblx0XHRcdFx0dGhpc1tgJHt0eXBlfUJ0bmBdLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRcdGlmKGUua2V5Q29kZSAmJiBlLmtleUNvZGUgIT09IEtFWV9DT0RFUy5FTlRFUikgcmV0dXJuO1xuXHRcdFx0XHRcdHRoaXNbdHlwZV0oKTtcblx0XHRcdFx0fSlcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9LFxuXHR3cml0ZVRvdGFscygpIHsgdGhpcy5ET01Ub3RhbHMuaW5uZXJIVE1MID0gYCR7dGhpcy5jdXJyZW50ICsgMX0vJHt0aGlzLml0ZW1zLmxlbmd0aH1gOyB9LFxuXHR3cml0ZUltYWdlKGkpe1xuXHRcdGxldCBpbWFnZUNvbnRhaW5lciA9IHRoaXMuRE9NSXRlbXNbaV0ucXVlcnlTZWxlY3RvcignLmpzLW1vZGFsLWdhbGxlcnlfX2ltZy1jb250YWluZXInKSxcblx0XHRcdGltYWdlQ2xhc3NOYW1lID0gdGhpcy5zZXR0aW5ncy5zY3JvbGxhYmxlID8gJ21vZGFsLWdhbGxlcnlfX2ltZyBtb2RhbC1nYWxsZXJ5X19pbWctLXNjcm9sbGFibGUnIDogJ21vZGFsLWdhbGxlcnlfX2ltZycsXG5cdFx0XHRzcmNzZXRBdHRyaWJ1dGUgPSB0aGlzLml0ZW1zW2ldLnNyY3NldCA/IGAgc3Jjc2V0PVwiJHt0aGlzLml0ZW1zW2ldLnNyY3NldH1cImAgOiAnJyxcblx0XHRcdHNpemVzQXR0cmlidXRlID0gdGhpcy5pdGVtc1tpXS5zaXplcyA/IGAgc2l6ZXM9XCIke3RoaXMuaXRlbXNbaV0uc2l6ZXN9XCJgIDogJyc7XG5cdFx0XG5cdFx0aW1hZ2VDb250YWluZXIuaW5uZXJIVE1MID0gYDxpbWcgY2xhc3M9XCIke2ltYWdlQ2xhc3NOYW1lfVwiIHNyYz1cIiR7dGhpcy5pdGVtc1tpXS5zcmN9XCIgYWx0PVwiJHt0aGlzLml0ZW1zW2ldLnRpdGxlfVwiJHtzcmNzZXRBdHRyaWJ1dGV9JHtzaXplc0F0dHJpYnV0ZX0+YDtcblx0XHR0aGlzLkRPTUl0ZW1zW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcblx0fSxcblx0bG9hZEltYWdlKGkpIHtcblx0XHRsZXQgaW1nID0gbmV3IEltYWdlKCksXG5cdFx0XHRsb2FkZWQgPSAoKSA9PiB7IFxuXHRcdFx0XHR0aGlzLmltYWdlQ2FjaGVbaV0gPSBpbWc7XG5cdFx0XHRcdHRoaXMud3JpdGVJbWFnZShpKTtcblx0XHRcdH07XG5cdFx0aW1nLm9ubG9hZCA9IGxvYWRlZDtcblx0XHRpbWcuc3JjID0gdGhpcy5pdGVtc1tpXS5zcmM7XG5cdFx0aW1nLm9uZXJyb3IgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLkRPTUl0ZW1zW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcblx0XHRcdHRoaXMuRE9NSXRlbXNbaV0uY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcblx0XHR9O1xuXHRcdGlmKGltZy5jb21wbGV0ZSkgbG9hZGVkKCk7XG5cdH0sXG5cdGxvYWRJbWFnZXMoaSl7XG5cdFx0bGV0IGluZGV4ZXMgPSBbaV07XG5cblx0XHRpZih0aGlzLml0ZW1zLmxlbmd0aCA+IDEpIGluZGV4ZXMucHVzaChpID09PSAwID8gdGhpcy5pdGVtcy5sZW5ndGggLSAxIDogaSAtIDEpO1xuXHRcdGlmKHRoaXMuaXRlbXMubGVuZ3RoID4gMikgaW5kZXhlcy5wdXNoKGkgPT09IHRoaXMuaXRlbXMubGVuZ3RoIC0gMSA/IDAgOiBpICsgMSk7XG5cblx0XHRpbmRleGVzLmZvckVhY2goaWR4ID0+IHtcblx0XHRcdGlmKHRoaXMuaW1hZ2VDYWNoZVtpZHhdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dGhpcy5ET01JdGVtc1tpZHhdLmNsYXNzTGlzdC5hZGQoJ2xvYWRpbmcnKTtcblx0XHRcdFx0dGhpcy5sb2FkSW1hZ2UoaWR4KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXHRnZXRGb2N1c2FibGVDaGlsZHJlbigpIHtcblx0XHRsZXQgZm9jdXNhYmxlRWxlbWVudHMgPSBbJ2FbaHJlZl0nLCAnYXJlYVtocmVmXScsICdpbnB1dDpub3QoW2Rpc2FibGVkXSknLCAnc2VsZWN0Om5vdChbZGlzYWJsZWRdKScsICd0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSknLCAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKScsICdpZnJhbWUnLCAnb2JqZWN0JywgJ2VtYmVkJywgJ1tjb250ZW50ZWRpdGFibGVdJywgJ1t0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSddO1xuXG5cdFx0cmV0dXJuIFtdLnNsaWNlLmNhbGwodGhpcy5ET01PdmVybGF5LnF1ZXJ5U2VsZWN0b3JBbGwoZm9jdXNhYmxlRWxlbWVudHMuam9pbignLCcpKSk7XG5cdH0sXG5cdHRyYXBUYWIoZSl7XG5cdFx0bGV0IGZvY3VzZWRJbmRleCA9IHRoaXMuZm9jdXNhYmxlQ2hpbGRyZW4uaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcblx0XHRpZihlLnNoaWZ0S2V5ICYmIGZvY3VzZWRJbmRleCA9PT0gMCkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy5mb2N1c2FibGVDaGlsZHJlblt0aGlzLmZvY3VzYWJsZUNoaWxkcmVuLmxlbmd0aCAtIDFdLmZvY3VzKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKCFlLnNoaWZ0S2V5ICYmIGZvY3VzZWRJbmRleCA9PT0gdGhpcy5mb2N1c2FibGVDaGlsZHJlbi5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0dGhpcy5mb2N1c2FibGVDaGlsZHJlblswXS5mb2N1cygpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0a2V5TGlzdGVuZXIoZSl7XG5cdFx0aWYoIXRoaXMuaXNPcGVuKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKGUua2V5Q29kZSkge1xuXHRcdGNhc2UgS0VZX0NPREVTLkVTQzpcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHRoaXMudG9nZ2xlKCk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEtFWV9DT0RFUy5UQUI6XG5cdFx0XHR0aGlzLnRyYXBUYWIoZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEtFWV9DT0RFUy5MRUZUOlxuXHRcdFx0dGhpcy5wcmV2aW91cygpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBLRVlfQ09ERVMuUklHSFQ6XG5cdFx0XHR0aGlzLm5leHQoKTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH0sXG5cdGluY3JlbWVudERlY3JlbWVudChmbil7XG5cdFx0dGhpcy5jdXJyZW50ICE9PSBmYWxzZSAmJiB0aGlzLkRPTUl0ZW1zW3RoaXMuY3VycmVudF0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdFx0dGhpcy5jdXJyZW50ID0gZm4oKTtcblx0XHR0aGlzLkRPTUl0ZW1zW3RoaXMuY3VycmVudF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0dGhpcy5sb2FkSW1hZ2VzKHRoaXMuY3VycmVudCk7XG5cdFx0KHRoaXMuaXRlbXMubGVuZ3RoID4gMSAmJiB0aGlzLnNldHRpbmdzLnRvdGFscykgJiYgdGhpcy53cml0ZVRvdGFscygpO1xuXHR9LFxuXHRwcmV2aW91cygpeyB0aGlzLmluY3JlbWVudERlY3JlbWVudCgoKSA9PiAodGhpcy5jdXJyZW50ID09PSAwID8gdGhpcy5ET01JdGVtcy5sZW5ndGggLSAxIDogdGhpcy5jdXJyZW50IC0gMSkpOyB9LFxuXHRuZXh0KCl7IHRoaXMuaW5jcmVtZW50RGVjcmVtZW50KCgpID0+ICh0aGlzLmN1cnJlbnQgPT09IHRoaXMuRE9NSXRlbXMubGVuZ3RoIC0gMSA/IDAgOiB0aGlzLmN1cnJlbnQgKyAxKSk7IH0sXG5cdG9wZW4oaSl7XG5cdFx0dGhpcy5pbml0VUkoaSk7XG5cdFx0dGhpcy5pbml0QnV0dG9ucygpO1xuXHRcdHRoaXMuZm9jdXNhYmxlQ2hpbGRyZW4gPSB0aGlzLmdldEZvY3VzYWJsZUNoaWxkcmVuKCk7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5TGlzdGVuZXIuYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5sYXN0Rm9jdXNlZCA9ICBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXHRcdHRoaXMuZm9jdXNhYmxlQ2hpbGRyZW4ubGVuZ3RoICYmIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhpcy5mb2N1c2FibGVDaGlsZHJlblswXS5mb2N1cygpO30uYmluZCh0aGlzKSwgMCk7XG5cdFx0dGhpcy5ET01JdGVtc1tpIHx8IDBdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdHRoaXMudG9nZ2xlKGkgfHwgMCk7XG5cdH0sXG5cdGNsb3NlKCl7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5TGlzdGVuZXIuYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5sYXN0Rm9jdXNlZCAmJiB0aGlzLmxhc3RGb2N1c2VkLmZvY3VzKCk7XG5cdFx0dGhpcy5ET01JdGVtc1t0aGlzLmN1cnJlbnRdLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXHRcdHRoaXMudG9nZ2xlKG51bGwpO1xuXHRcdHRoaXMudW5tb3VudFVJKCk7XG5cdH0sXG5cdHRvZ2dsZShpKXtcblx0XHR0aGlzLmlzT3BlbiA9ICF0aGlzLmlzT3Blbjtcblx0XHR0aGlzLmN1cnJlbnQgPSBpO1xuXHRcdHRoaXMuRE9NT3ZlcmxheS5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcblx0XHR0aGlzLkRPTU92ZXJsYXkuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICF0aGlzLmlzT3Blbik7XG5cdFx0dGhpcy5ET01PdmVybGF5LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCB0aGlzLmlzT3BlbiA/ICcwJyA6ICctMScpO1xuXHRcdHRoaXMuc2V0dGluZ3MuZnVsbHNjcmVlbiAmJiB0aGlzLnRvZ2dsZUZ1bGxTY3JlZW4oKTtcblx0XHQodGhpcy5pdGVtcy5sZW5ndGggPiAxICYmIHRoaXMuc2V0dGluZ3MudG90YWxzKSAmJiB0aGlzLndyaXRlVG90YWxzKCk7XG5cdH0sXG5cdHRvZ2dsZUZ1bGxTY3JlZW4oKXtcblx0XHRpZih0aGlzLmlzT3Blbil7XG5cdFx0XHR0aGlzLkRPTU92ZXJsYXkucmVxdWVzdEZ1bGxzY3JlZW4gJiYgdGhpcy5ET01PdmVybGF5LnJlcXVlc3RGdWxsc2NyZWVuKCk7XG5cdFx0XHR0aGlzLkRPTU92ZXJsYXkud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4gJiYgdGhpcy5ET01PdmVybGF5LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCk7XG5cdFx0XHR0aGlzLkRPTU92ZXJsYXkubW96UmVxdWVzdEZ1bGxTY3JlZW4gJiYgdGhpcy5ET01PdmVybGF5Lm1velJlcXVlc3RGdWxsU2NyZWVuKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuICYmIGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuKCk7XG5cdFx0XHRkb2N1bWVudC5tb3pDYW5jZWxGdWxsU2NyZWVuICYmIGRvY3VtZW50Lm1vekNhbmNlbEZ1bGxTY3JlZW4oKTtcblx0XHRcdGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuICYmIGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XG5cdFx0fVxuXHR9XG59OyIsImV4cG9ydCBkZWZhdWx0IHtcbiAgICBmdWxsc2NyZWVuOiBmYWxzZSxcbiAgICBwcmVsb2FkOiBmYWxzZSxcbiAgICB0b3RhbHM6IHRydWUsXG4gICAgc2Nyb2xsYWJsZTogZmFsc2UsXG4gICAgc2luZ2xlOiBmYWxzZVxufTsiLCJleHBvcnQgY29uc3Qgb3ZlcmxheSA9ICgpID0+IHtcbiAgICBsZXQgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgb3ZlcmxheS5jbGFzc05hbWUgPSAnbW9kYWwtZ2FsbGVyeV9fb3V0ZXIganMtbW9kYWwtZ2FsbGVyeV9fb3V0ZXInO1xuICAgIG92ZXJsYXkuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2RpYWxvZycpO1xuICAgIG92ZXJsYXkuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICctMScpO1xuICAgIG92ZXJsYXkuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuXG4gICAgcmV0dXJuIG92ZXJsYXk7XG59O1xuXG5leHBvcnQgY29uc3Qgb3ZlcmxheUlubmVyID0gaXRlbXMgPT4gYDxkaXYgY2xhc3M9XCJtb2RhbC1nYWxsZXJ5X19pbm5lciBqcy1tb2RhbC1nYWxsZXJ5X19pbm5lclwiIHJvbGU9XCJncm91cFwiIGFyaWEtcm9sZWRlc2NyaXB0aW9uPVwiY2Fyb3VzZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJqcy1tb2RhbC1nYWxsZXJ5X19wcmV2aW91cyBtb2RhbC1nYWxsZXJ5X19wcmV2aW91c1wiIGFyaWEtbGFiZWw9XCJQcmV2aW91c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZm9jdXNhYmxlPVwiZmFsc2VcIiBhcmlhLWhpZGRlbj1cInRydWVcIiB3aWR0aD1cIjQ0XCIgaGVpZ2h0PVwiNjBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz1cIjMwIDEwIDEwIDMwIDMwIDUwXCIgc3Ryb2tlPVwicmdiKDI1NSwyNTUsMjU1KVwiIHN0cm9rZS13aWR0aD1cIjRcIiBzdHJva2UtbGluZWNhcD1cImJ1dHRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCIvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwianMtbW9kYWwtZ2FsbGVyeV9fbmV4dCBtb2RhbC1nYWxsZXJ5X19uZXh0XCIgYXJpYS1sYWJlbD1cIk5leHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZvY3VzYWJsZT1cImZhbHNlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgd2lkdGg9XCI0NFwiIGhlaWdodD1cIjYwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwb2x5bGluZSBwb2ludHM9XCIxNCAxMCAzNCAzMCAxNCA1MFwiIHN0cm9rZT1cInJnYigyNTUsMjU1LDI1NSlcIiBzdHJva2Utd2lkdGg9XCI0XCIgc3Ryb2tlLWxpbmVjYXA9XCJidXR0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImpzLW1vZGFsLWdhbGxlcnlfX2Nsb3NlIG1vZGFsLWdhbGxlcnlfX2Nsb3NlXCIgYXJpYS1sYWJlbD1cIkNsb3NlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBmb2N1c2FibGU9XCJmYWxzZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIHdpZHRoPVwiMzBcIiBoZWlnaHQ9XCIzMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZyBzdHJva2U9XCJyZ2IoMjU1LDI1NSwyNTUpXCIgc3Ryb2tlLXdpZHRoPVwiNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpbmUgeDE9XCI1XCIgeTE9XCI1XCIgeDI9XCIyNVwiIHkyPVwiMjVcIi8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGluZSB4MT1cIjVcIiB5MT1cIjI1XCIgeDI9XCIyNVwiIHkyPVwiNVwiLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtZ2FsbGVyeV9fY29udGVudCBqcy1tb2RhbC1nYWxsZXJ5X19jb250ZW50XCIgYXJpYS1hdG9taWM9XCJmYWxzZVwiIGFyaWEtbGl2ZT1cInBvbGl0ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7aXRlbXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1nYWxsZXJ5X190b3RhbCBqcy1nYWxsZXJ5LXRvdGFsc1wiPjwvZGl2PmA7XG5cbmV4cG9ydCBjb25zdCBpdGVtID0gaXRlbXMgPT4gKGRldGFpbHMsIGkpID0+IGA8ZGl2IGNsYXNzPVwibW9kYWwtZ2FsbGVyeV9faXRlbSBqcy1tb2RhbC1nYWxsZXJ5X19pdGVtXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1yb2xlZGVzY3JpcHRpb249XCJzbGlkZVwiIGFyaWEtbGFiZWw9XCJJbWFnZSAke2kgKyAxfSBvZiAke2l0ZW1zLmxlbmd0aH0ke2l0ZW1zW2ldLnRpdGxlID8gYCwgJHtpdGVtc1tpXS50aXRsZX1gIDogJyd9XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtZ2FsbGVyeV9faW1nLWNvbnRhaW5lciBqcy1tb2RhbC1nYWxsZXJ5X19pbWctY29udGFpbmVyXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2RldGFpbHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWxzID0gaXRlbSA9PiBgPGRpdiBjbGFzcz1cIm1vZGFsLWdhbGxlcnlfX2RldGFpbHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMSBjbGFzcz1cIm1vZGFsLWdhbGxlcnlfX3RpdGxlXCI+JHtpdGVtLnRpdGxlfTwvaDE+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtZ2FsbGVyeV9fZGVzY3JpcHRpb25cIj4ke2l0ZW0uZGVzY3JpcHRpb259PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7Il19
