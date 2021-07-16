/**
 *
 * example use of paint.js - vanilla js
 * by M J Livesey ©2021 Polymathic Design
 *
 * @format
 */

import createPolymathicPaint from './paint.js';

let paint;

const colourPalette = ['#f00', '#f80', '#ff0', '#8f0', '#0f0', '#0f8', '#0ff', '#08f', '#00f', '#80f', '#f0f', '#f08', '#fff', '#000'];
const paintBrushes = ['brushes/brush1.png', 'brushes/brush2.png', 'brushes/brush3.png', 'brushes/brush4.png', 'brushes/brush5.png', 'brushes/brush6.png'];
const paintTools = [
	{ type: 'paint', src: 'icons/paint.png' },
	{ type: 'spray', src: 'icons/spray.png' },
	{ type: 'pen', src: 'icons/pen.png' },
	{ type: 'fill', src: 'icons/fill.png' },
	{ type: 'eraser', src: 'icons/eraser.png' }
];

const canvasGuids = [];

let setBrushParameters = () => {
	let sliders = document.querySelectorAll('.slider');
	let size = sliders[0].value;
	let opacity = sliders[1].value / 100;
	paint.setBrushProperties(paint.getActiveBrushIndex(), { width: size, height: size, opacity: opacity });
};

/**
 * @public
 * @description
 * initialization method
 */
const init = () => {
	paint = createPolymathicPaint();
	let guid = paint.addCanvas(document.querySelector('.canvas'));
	canvasGuids.push(guid);
	for (let i = 0; i < paintBrushes.length; i++) {
		paint.addBrush(paintBrushes[i], colourPalette[i]);
	}
	paint.setActiveBrush(0);

	let brushProperies = paint.getBrushProperties();
	let sliders = document.querySelectorAll('.slider');

	sliders[0].value = brushProperies.width;
	sliders[1].value = brushProperies.opacity * 100;
	for (let slider of sliders) {
		slider.addEventListener('input', setBrushParameters);
	}
	document.addEventListener('click', paintModalSelector);
	paint.setToolType('paint');
	window.addEventListener('resize', resize);
	//document.addEventListener('contextmenu', (e) => e.preventDefault(), true);
};

/**
 * @public
 * @description
 * modal open and result handling event method
 * create brush, tool, palette modals based on attribute type
 * @param {*} e
 */
const paintModalSelector = (e) => {
	if (e.target.hasAttribute('brush-picker')) {
		createModalSelector('brush', paintBrushes);
	} else if (e.target.hasAttribute('tool-picker')) {
		createModalSelector('tool', paintTools);
	} else if (e.target.hasAttribute('brush-picker')) {
		createModalSelector('brush', paintBrushes);
	} else if (e.target.hasAttribute('colour-picker')) {
		createModalSelector('palette', colourPalette);
	} else if (e.target.hasAttribute('paint-colour')) {
		//colour modal
		let colour = e.target.getAttribute('paint-colour');
		paint.setBrushProperties(paint.getActiveBrushIndex(), { colour: colour });
		setSelectedColourToColourPicker(colour);
		destroySelectorModal();
	} else if (e.target.hasAttribute('paint-tool')) {
		//tool modal
		let toolType = e.target.getAttribute('paint-tool');
		paint.setToolType(toolType);
		let toolObject = paintTools.find((v) => v.type === toolType);
		if (toolObject != undefined) {
			let toolPickerImg = document.querySelector(`[tool-picker] img`);
			toolPickerImg.src = toolObject.src;
		}
		destroySelectorModal();
	} else if (e.target.hasAttribute('paint-brush')) {
		//brush modal
		let brushIndex = e.target.getAttribute('paint-brush');
		let brushProperties = paint.setActiveBrush(brushIndex);
		if (brushProperties != undefined) {
			let sliders = document.querySelectorAll('.slider');
			sliders[0].value = brushProperties.width;
			sliders[1].value = brushProperties.opacity * 100;
			setSelectedColourToColourPicker(brushProperties.colour);
		}
		let brushPickerImg = document.querySelector(`[brush-picker] img`);
		brushPickerImg.src = paintBrushes[brushIndex];
		destroySelectorModal();
	} else {
		destroySelectorModal();
	}
};

const setSelectedColourToColourPicker = (colour) => {
	let colourPicker = document.querySelector('[colour-picker]');
	if (colourPicker != undefined) {
		colourPicker.style.backgroundColor = colour;
	}
};

const createModalSelector = (modalType, itemArray) => {
	let itemSelector = document.createElement('div');
	itemSelector.className = 'polymathic-paint-selector';
	let itemCount = itemArray.length;
	let rect = document.body.getBoundingClientRect();
	let itemSize = Math.min(rect.width, rect.height) / itemCount;
	if (itemSize > 70) itemSize = 70;
	let cX = rect.width / 2;
	let cY = rect.height / 2;
	let r = (itemSize * 1.5 * itemCount) / 3.1415 / 2;
	let angleInc = 6.28 / itemCount;
	let angle = 0;
	let html = '';

	for (let i = 0, item; (item = itemArray[i]); i++) {
		let commonStyles = `width:${itemSize}px; height:${itemSize}px; transform: translate(${Math.sin(angle) * r + cX - 35}px, ${Math.cos(angle) * -r + cY - 35}px);`;
		switch (modalType) {
			case 'palette':
				html += `<div class="polymathic-paint-selector_item" paint-colour="${item}" style="background-color:${item}; ${commonStyles}"></div>`;
				break;
			case 'brush':
				html += `<div class="polymathic-paint-selector_item" paint-brush="${i}" style="${commonStyles}"><img src="${item}"></div>`;
				break;
			case 'tool':
				html += `<div class="polymathic-paint-selector_item" paint-tool="${item.type}" style="${commonStyles}"><img src="${item.src}"></div>`;
				break;
		}
		angle += angleInc;
	}
	itemSelector.innerHTML = html;
	document.body.appendChild(itemSelector);
};

const destroySelectorModal = () => {
	let selectorModals = document.querySelectorAll('.polymathic-paint-selector');
	for (let selector of selectorModals) {
		if (selector != undefined) selector.parentNode.removeChild(selector);
	}
};

const resize = () => {
	let canvasArray = document.querySelectorAll('.canvas');
	for (let canvas of canvasArray) {
		let guid = canvas.getAttribute('canvas-guid');
		paint.setCanvasSize(canvas, guid);
	}
};

init();
