// ——————————————————————————————————————————————————
// LIGHTBOX
// ——————————————————————————————————————————————————
let subpageLightboxIndex = 0;
let subpageLightboxOpen = false;
function openSubpageLightbox(index) {
	subpageLightboxOpen = true;
	subpageLightboxIndex = index;
	
	let lightbox = document.querySelector('.subpage-archive-lightbox');
	let lightboxContent = lightbox.querySelector('.subpage-archive-lightbox-content');
	let lightboxCaption = lightbox.querySelector('.subpage-archive-lightbox-caption');

	// Hide handles if only 1 image
	let maxIndex = document.querySelectorAll(`[data-index]`).length-1;
	if (maxIndex < 0) {
		for (let navBtn of document.querySelectorAll('.subpage-archive-lightbox-nav')) {
			navBtn.style.display = "none";
		}
	}

	// Navigate normally, or show thumbnail at index -1
	if (subpageLightboxIndex != -1) {
		let target = document.querySelector(`[data-index="${index}"]`);
		let content = target.querySelector('.subpage-archive-item-content');
		lightboxContent.innerHTML = content.innerHTML;
		lightbox.dataset.active = 1;

		// Handle caption
		if (target.querySelector('.subpage-archive-item-caption') != undefined) {
			let caption = target.querySelector('.subpage-archive-item-caption');
			lightboxCaption.innerText = caption.innerText;
			lightbox.dataset.caption = 1;
		} else {
			lightbox.dataset.caption = 0;
		}
	} else {
		let target = document.querySelector(`.subpage-thumbnail`);
	
		lightboxContent.innerHTML = target.innerHTML;
		lightbox.dataset.caption = 0;

		// Handle caption
		if (lightboxContent.querySelector('video') != undefined) {
			if (lightboxContent.querySelector('video').title != "") {
				lightboxCaption.innerText = lightboxContent.querySelector('video').title;
				lightbox.dataset.caption = 1;
			} else {
				lightbox.dataset.caption = 0;
			}
		} else if (lightboxContent.querySelector('img') != undefined) {
			if (lightboxContent.querySelector('img').alt != "") {
				lightboxCaption.innerText = lightboxContent.querySelector('img').alt;
				lightbox.dataset.caption = 1;
			} else {
				lightbox.dataset.caption = 0;
			}
		} else {
			lightbox.dataset.caption = 0;
		}
	}

	// Add controls to videos with sound (or just when specified)
	if (lightboxContent.querySelector('video') != undefined) {
		if (lightboxContent.querySelector('video').dataset.sound == "1") {
			lightboxContent.querySelector('video').setAttribute('controls', true);
		}
	}

	lightbox.dataset.active = 1;
}
function prevSubpageLightboxItem() {
	subpageLightboxIndex--;
	if (subpageLightboxIndex < -1) {
		subpageLightboxIndex = document.querySelectorAll(`[data-index]`).length-1;
	}
	openSubpageLightbox(subpageLightboxIndex);
}
function nextSubpageLightboxItem() {
	subpageLightboxIndex++;
	let maxIndex = document.querySelectorAll(`[data-index]`).length-1;
	if (subpageLightboxIndex > maxIndex) {
		subpageLightboxIndex = -1;
	}
	openSubpageLightbox(subpageLightboxIndex);
}
function closeSubpageLightbox() {
	subpageLightboxOpen = false;
	let lightbox = document.querySelector('.subpage-archive-lightbox');
	let lightboxContent = lightbox.querySelector('.subpage-archive-lightbox-content');
	lightbox.dataset.active = 0;
	lightboxContent.innerHTML = '';
}

// Detect arrow keys
document.addEventListener('keydown', (e) => {
	if (subpageLightboxOpen) {
		if (e.key == 'ArrowLeft') {
			prevSubpageLightboxItem();
		} else if (e.key == "ArrowRight") {
			nextSubpageLightboxItem();
		} else if (e.key == "Escape") {
			closeSubpageLightbox();
		}
	}
})