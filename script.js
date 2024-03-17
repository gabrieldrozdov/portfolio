// ——————————————————————————————————————————————————
// VIEW MODE
// ——————————————————————————————————————————————————

let viewModes = ['list', 'detail', 'thumbnail', 'dense'];
let view = 'list';
function changeView(mode) {
	let prevView = document.querySelector(`[data-view="${view}"]`);
	prevView.dataset.active = 0;
	view = mode;
	let currView = document.querySelector(`[data-view="${view}"]`);
	currView.dataset.active = 1;

	let archiveContent = document.querySelector('.archive-content');
	archiveContent.dataset.mode = view;

	archiveFlash();
	scrollArchive();
}
// Change view without scroll/flash
function changeViewAlt(mode) {
	let prevView = document.querySelector(`[data-view="${view}"]`);
	prevView.dataset.active = 0;
	view = mode;
	let currView = document.querySelector(`[data-view="${view}"]`);
	currView.dataset.active = 1;

	let archiveContent = document.querySelector('.archive-content');
	archiveContent.dataset.mode = view;
}

// Flash on view change
function archiveFlash() {
	let flash = document.querySelector('.archive-flash');
	flash.style.transition = 'unset';
	flash.style.opacity = 1;
	flash.style.backgroundColor = `hsl(${Math.floor(Math.random()*360)}deg, 100%, 50%)`;
	setTimeout(() => {
		flash.style.transition = 'opacity .5s';
		flash.style.opacity = 0;
	}, 100)
}

// ——————————————————————————————————————————————————
// SEARCH
// ——————————————————————————————————————————————————

// Add event listener
let searchInput = document.querySelector('.controls-search');
searchInput.addEventListener('input', () => {
	searchArchive(searchInput.value);
})

// Search function
function searchArchive(query) {
	formattedInput = query.toLowerCase().replace(/[.,\/#!$%\^&*;:{}=\-_`~()‘’“”\?]/g,"");
	for (let key of Object.keys(archiveJSON)) {
		let entry = archiveJSON[key];
		if (entry['active'] == false) {
			continue
		}
		let archiveItemParent = document.querySelector(`.archive-item-parent[data-key="${key}"]`);

		// Format title and subtitle
		let title = entry['title'];
		let subtitle = entry['subtitle'];
		let formattedTitle = title.toLowerCase().replace(/[.,\/#!$%\^&*;:{}=\-_`~()‘’“”\?]/g,"");
		let formattedSubtitle = subtitle.toLowerCase().replace(/[.,\/#!$%\^&*;:{}=\-_`~()‘’“”\?]/g,"");

		if (formattedTitle.includes(formattedInput) || formattedSubtitle.includes(formattedInput)) {
			archiveItemParent.dataset.search = 1;
		} else {
			archiveItemParent.dataset.search = 0;
		}
	}

	checkIfEmpty();
	scrollArchive();
}
function clearSearch() {
	for (let archiveItemParent of document.querySelectorAll('.archive-item-parent')) {
		archiveItemParent.dataset.search = 1;
	}
}

// Clear search when resized to mobile
window.addEventListener('resize', () => {
	if (window.innerWidth <= 820) {
		searchInput.value = "";
		clearSearch();
		checkIfEmpty();
	}
})

// ——————————————————————————————————————————————————
// SORTING AND FILTERS
// ——————————————————————————————————————————————————

// Open/close settings menu
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
function closeSettings() {
	settings = '';
	for (let i of document.querySelectorAll(".settings-menu")) {
		i.dataset.active = 0;
	}
	for (let i of document.querySelectorAll(".settings-label")) {
		i.dataset.active = 0;
	}
}

// Close settings if somewhere else clicked
function detectClose(e) {
	let controlsSettings = document.querySelector('.controls-settings');
	if (!controlsSettings.contains(e.target)) {
		closeSettings();
	}
}
document.addEventListener('click', (e) => detectClose(e));

// Toggle sorting
let sortingModes = ['curated', 'newest', 'oldest', 'az', 'za', 'random'];
let sorting = 'curated';
function toggleSorting(mode) {
	let prevSorting = document.querySelector(`[data-sorting="${sorting}"]`);
	prevSorting.dataset.active = 0;
	sorting = mode;
	let currSorting = document.querySelector(`[data-sorting="${sorting}"]`);
	currSorting.dataset.active = 1;

	sortArchive();
	scrollArchive();
}

// Apply sorting order
function sortArchive() {
	if (sorting == "curated") {
		for (let archiveItemParent of document.querySelectorAll('.archive-item-parent')) {
			archiveItemParent.style.order = archiveJSON[archiveItemParent.dataset.key]['sort-custom'] + Math.floor(Math.random()*90+10).toString();
		}

	} else if (sorting == "newest") {
		for (let archiveItemParent of document.querySelectorAll('.archive-item-parent')) {
			let sort = "-" + archiveJSON[archiveItemParent.dataset.key]['sort-chrono'].toString().replaceAll('-','');
			archiveItemParent.style.order = sort;
		}

	} else if (sorting == "oldest") {
		for (let archiveItemParent of document.querySelectorAll('.archive-item-parent')) {
			let sort = archiveJSON[archiveItemParent.dataset.key]['sort-chrono'].toString().replaceAll('-','');
			archiveItemParent.style.order = sort;
		}

	} else if (sorting == "az") {
		let sortOrder = [];

		// Build object containing alpha/key pairs
		let sortingAlpha = {};
		for (let key of Object.keys(archiveJSON)) {
			let entry = archiveJSON[key];
			if (entry['active'] == false) {
				continue
			}
			sortingAlpha[entry['sort-alpha']] = key;
		}

		// Sort alpha keys
		for (let key of Object.keys(sortingAlpha).sort()) {
			sortOrder.push(sortingAlpha[key]);
		}

		// Apply sorting
		let sortCounter = 0;
		for (let key of sortOrder) {
			let archiveItemParent = document.querySelector(`.archive-item-parent[data-key="${key}"]`);
			archiveItemParent.style.order = sortCounter;
			sortCounter++;
		}

	} else if (sorting == "za") {
		let sortOrder = [];

		// Build object containing alpha/key pairs
		let sortingAlpha = {};
		for (let key of Object.keys(archiveJSON)) {
			let entry = archiveJSON[key];
			if (entry['active'] == false) {
				continue
			}
			sortingAlpha[entry['sort-alpha']] = key;
		}

		// Sort alpha keys
		for (let key of Object.keys(sortingAlpha).sort()) {
			sortOrder.push(sortingAlpha[key]);
		}

		// Apply sorting
		let sortCounter = 0;
		for (let key of sortOrder) {
			let archiveItemParent = document.querySelector(`.archive-item-parent[data-key="${key}"]`);
			archiveItemParent.style.order = sortCounter;
			sortCounter--;
		}

	} else if (sorting == "random") {
		for (let archiveItemParent of document.querySelectorAll('.archive-item-parent')) {
			archiveItemParent.style.order = Math.floor(Math.random()*1000);
		}
	}
}

// Set filters
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

	filterArchive();
	scrollArchive();
}

// Clear filters
function clearFilters() {
	filters = [];
	for (let i of document.querySelectorAll(`[data-filter]`)) {
		i.dataset.active = 0;
	}
	let clear = document.querySelector(`.settings-clear`);
	clear.dataset.active = 0;

	for (let archiveItemParent of document.querySelectorAll('.archive-item-parent')) {
		archiveItemParent.dataset.filter = 1;
	}

	filterArchive();
	scrollArchive();
}

// Apply filters
function filterArchive() {
	for (let archiveItemParent of document.querySelectorAll('.archive-item-parent')) {
		if (filters.length == 0) {
			archiveItemParent.dataset.filter = 1;
		} else {
			archiveItemParent.dataset.filter = 0;
			let key = archiveItemParent.dataset.key;
			let entryTags = archiveJSON[key]['tags'];
			for (let filter of filters) {
				if (entryTags.includes(filter)) {
					archiveItemParent.dataset.filter = 1;
					continue
				}
			}
		}
	}

	checkIfEmpty();
	scrollArchive();
}

// ——————————————————————————————————————————————————
// ARCHIVE HELPER FUNCTIONS
// ——————————————————————————————————————————————————

// Scroll back to top
function scrollArchive() {
	let archive = document.querySelector(".archive");
	archive.scrollIntoView({ block: "start", inline: "nearest" });
}

// Check if no results are showing
function checkIfEmpty() {
	document.querySelector('.archive-content').dataset.hide = 1;
	document.querySelector('.archive-empty').dataset.hide = 0;
	for (let archiveItemParent of document.querySelectorAll('.archive-item-parent')) {
		if (parseInt(archiveItemParent.dataset.search) == 1 && parseInt(archiveItemParent.dataset.filter) == 1) {
			document.querySelector('.archive-empty').dataset.hide = 1;
			document.querySelector('.archive-content').dataset.hide = 0;
			return
		}
	}
}

// ——————————————————————————————————————————————————
// INITIALIZE
// ——————————————————————————————————————————————————

sortArchive();
// changeViewAlt(viewModes[Math.floor(Math.random()*viewModes.length)]);
setTimeout(() => {
	const archive = document.querySelector('.archive');
	archive.dataset.initialized = 1;
}, 50)

// OLD CODE: Shuffle archive if visiting the homepage directly
// SCRAPPED: Would need cookies to save portfolio order
// window.addEventListener("pageshow", async (event) => {
// 	const historyTraversal = event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward";
// 	if (!historyTraversal) {
// 		sortArchive();
// 		changeViewAlt(viewModes[Math.floor(Math.random()*viewModes.length)]);
// 	}
// 	setTimeout(() => {
// 		const archive = document.querySelector('.archive');
// 		archive.dataset.initialized = 1;
// 	}, 50)
// });

// OLD CODE: Fetch JSON and build archive
// let archiveJSON = {};
// fetch('/archive.json')
// 	.then((response) => response.json())
// 	.then((json) => {
// 		// Convert to JSON object format
// 		for (let i of Object.keys(json)) {
// 			let entry = json[i];
// 			let key = entry['key'];
// 			archiveJSON[key] = entry;
// 		}

// 		sortArchive();
// 		setTimeout(() => {
// 			let archive = document.querySelector('.archive');
// 			archive.dataset.initialized = 1;
// 		}, 50)
// 	})