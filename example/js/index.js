/**
 * @name storm-modal-gallery: Modal gallery/lightbox
 * @version 1.0.1: Fri, 05 May 2017 16:22:12 GMT
 * @author mjbp
 * @license MIT
 */
import defaults from './lib/defaults';
import componentPrototype from './lib/component-prototype';

const init = (src, opts) => {
	if(!src.length) throw new Error('Modal Gallery cannot be initialised, no images found');

	let items;

	if(typeof src === 'string'){
		let els = [].slice.call(document.querySelectorAll(src));

		if(!els.length) throw new Error('Modal Gallery cannot be initialised, no images found');
		
		items = els.map(el => {
			return {
				trigger: el,
				src: el.getAttribute('href'),
				srcset: el.getAttribute('data-srcset') || null,
				sizes: el.getAttribute('data-sizes') || null,
				title: el.getAttribute('data-title') || '',
				description: el.getAttribute('data-description') || ''
			};
		});
	} else {
		items = src;
	}
	
	return Object.assign(Object.create(componentPrototype), {
		items: items,
		total: items.length,
		settings: Object.assign({}, defaults, opts)
	}).init();
};

export default { init };