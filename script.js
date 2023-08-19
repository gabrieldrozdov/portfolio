let view = 'list';
function changeView(mode) {
	let prevView = document.querySelector(`[data-view="${view}"]`);
	prevView.dataset.active = 0;
	view = mode;
	let currView = document.querySelector(`[data-view="${view}"]`);
	currView.dataset.active = 1;
}

let featured = true;
function toggleFeatured() {
	let controlsFeatured = document.querySelector(".controls-featured");
	if (!featured) {
		controlsFeatured.dataset.active = 1;
		featured = 1;
	} else {
		controlsFeatured.dataset.active = 0;
		featured = 0;
	}
}

let settings = '';
function toggleSettings(menu) {
	for (let i of document.querySelectorAll(".settings-menu")) {
		i.dataset.active = 0;
	}
	for (let i of document.querySelectorAll(".settings-label")) {
		i.dataset.active = 0;
	}
	if (settings == menu) {
		settings = '';
	} else {
		settings = menu;
		let currMenu = document.querySelector(`[data-settings="${settings}"]`);
		currMenu.dataset.active = 1;
		let currLabel = document.querySelector(`[data-settings-label="${settings}"]`);
		currLabel.dataset.active = 1;
	}
}

let sorting = 'curated';
function toggleSorting(mode) {
	let prevSorting = document.querySelector(`[data-sorting="${sorting}"]`);
	prevSorting.dataset.active = 0;
	sorting = mode;
	let currSorting = document.querySelector(`[data-sorting="${sorting}"]`);
	currSorting.dataset.active = 1;

}

let filters = [];
function toggleFilter(filter) {
	let currFilter = document.querySelector(`[data-filter="${filter}"]`);
	if (filters.includes(filter)) {
		filters.splice(filters.indexOf(filter), 1);
		currFilter.dataset.active = 0;
	} else {
		filters.push(filter);
		currFilter.dataset.active = 1;
	}
	let clear = document.querySelector(`.settings-clear`);
	if (filters.length == 0) {
		clear.dataset.active = 0;
	} else {
		clear.dataset.active = 1;
	}
}
function clearFilters() {
	filters = [];
	for (let i of document.querySelectorAll(`[data-filter]`)) {
		i.dataset.active = 0;
	}
	let clear = document.querySelector(`.settings-clear`);
	clear.dataset.active = 0;
}