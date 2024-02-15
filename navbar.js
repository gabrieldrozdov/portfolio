// ——————————————————————————————————————————————————
// NAVBAR
// ——————————————————————————————————————————————————

// Mobile navbar
let navState = false;
function toggleNav() {
	let body = document.querySelector('body');
	let nav = document.querySelector('.nav');
	if (navState) {
		navState = false;
		nav.dataset.open = 0;
		body.dataset.scroll = 1;
	} else {
		navState = true;
		nav.dataset.open = 1;
		body.dataset.scroll = 0;
	}
}
function closeNav() {
	let body = document.querySelector('body');
	let nav = document.querySelector('.nav');
	navState = false;
	nav.dataset.open = 0;
	body.dataset.scroll = 1;
}

// Close mobile navbar when resized to desktop
window.addEventListener('resize', () => {
	if (window.innerWidth > 820 && navState == true) {
		closeNav();
	}
})