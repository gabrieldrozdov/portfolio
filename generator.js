const fs = require('fs');

// Get JSON
const archive = require('./archive.json');

// Convert to JSON object format
let archiveJSON = {};
for (let i of Object.keys(archive)) {
	let entry = archive[i];
	let key = entry['key'];
	archiveJSON[key] = entry;
}
console.log(Object.keys(archiveJSON).length);

// Convert JSON to JS file
fs.writeFile(`archive.js`, "const archiveJSON = " + JSON.stringify(archiveJSON), err => {
	if (err) {
		console.error(err);
	}
});

// Sort JSON data by date
let jsonByDate = {};
let jsonSortedByDate = [];
for (let key of Object.keys(archiveJSON)) {
	if (archiveJSON[key]['active']) {
		jsonSortedByDate.push(archiveJSON[key]["sort-chrono"] + "," + key);
	}
}
jsonSortedByDate.sort();
for (let entry of jsonSortedByDate) {
	let splitEntry = entry.split(',');
	jsonByDate[splitEntry[1]] = splitEntry[0];
}
console.log(jsonByDate);

function generatePages() {
	// Automatic site build date/time
	const datetime = new Date();
	let datetimeHours = datetime.getHours();
	let datetimeHoursAMPM = "am";
	if (datetimeHours >= 12) {
		datetimeHours = datetimeHours - 12;
		if (datetimeHours == 0) {
			datetimeHours = 12;
		}
		datetimeHoursAMPM = "pm";
	}
	const buildDatetime = `Last updated: ${datetime.getDate()} ${datetime.toLocaleString('default', { month: 'long' })} ${datetime.getFullYear()} at ${datetimeHours}:${datetime.getMinutes()}${datetimeHoursAMPM} EST`;

	let homepageArchive = '';
	for (let key of Object.keys(archiveJSON)) {
		let entry = archiveJSON[key];

		// Skip unfinished entries
		if (entry['active'] == false) {
			continue
		}

		let folder = "/work/" + entry['key'];

		// ————————————————————————————————————
		// HOMEPAGE ITEM
		// ————————————————————————————————————

		// Thumbnail
		let thumbnail = "";
		if (entry['thumbnail']['format'] == 'video') {
			thumbnail = `
				<video autoplay muted loop playsinline poster="${folder}/${entry['thumbnail']['image']}" class="archive-item-thumbnail" title="${entry['thumbnail']['alt']}">
					<source src="${folder}/${entry['thumbnail']['video']}">
				</video>
			`;
		} else if (entry['thumbnail']['format'] == 'image') {
			thumbnail = `<img src="${folder}/${entry['thumbnail']['image']}" class="archive-item-thumbnail" alt="${entry['thumbnail']['alt']}">`;
		} else if (entry['thumbnail']['format'] == 'placeholder') {
			thumbnail = `<img src="/assets/ui/placeholder.svg" class="archive-item-thumbnail">`;
		}

		// let thumbnail = "";
		// if (entry['thumbnail'][0] == 'video') {
		// 	thumbnail = `
		// 		<video autoplay muted loop playsinline poster="${folder}/${entry['thumbnail'][1]}" class="archive-item-thumbnail">
		// 			<source src="${folder}/${entry['thumbnail'][2]}">
		// 		</video>
		// 	`;
		// } else if (entry['thumbnail'][0] == 'image') {
		// 	thumbnail = `<img src="${folder}/${entry['thumbnail'][1]}" class="archive-item-thumbnail">`;
		// } else {
		// 	thumbnail = `<img src="/assets/ui/placeholder.svg" class="archive-item-thumbnail">`;
		// }

		// Tags
		let tags = entry['tags'].split(',');
		let tagsString = '';
		for (let tag of tags) {
			tag = tag.trim();
			tagsString += `<li>${tag}</li>`;
		}
		tagsString += '';

		// Add to HTML string
		homepageArchive += `
			<div class="archive-item-parent" style="--highlight: ${entry['color']};" data-key="${key}" data-search="1" data-filter="1" data-invert="${entry['invert']}">
				<a href="/work/${entry['key']}/" class="archive-item">
					${thumbnail}
					<div class="archive-item-year">${entry['year']}</div>
					<div class="archive-item-name">
						<span class="archive-item-title">${entry['title']}</span>
						<span class="archive-item-subtitle">${entry['subtitle']}</span>
					</div>
					<div class="archive-item-tagline">${entry['tagline']}</div>
					<ul class="archive-item-tags">
						${tagsString}
					</ul>
				</a>
			</div>
		`

		// ————————————————————————————————————
		// SUBPAGE
		// ————————————————————————————————————

		// Create subpage archive items
		let subpageArchive = ``;
		let subpageArchiveIndex = 0;
		if (entry['assets'].length != 0) {
			for (let asset of entry['assets']) {
				subpageArchive += `<div class="subpage-archive-item" data-index="${subpageArchiveIndex}" onclick="openSubpageLightbox(${subpageArchiveIndex})">`;
				subpageArchiveIndex++;
				if (asset['format'] == 'image') {
					subpageArchive += `
						<div class="subpage-archive-item-content">
							<img src="${folder}/${asset['image']}" alt="${asset['alt']}">
						</div>
					`;
				} else if (asset['format'] == 'video') {
					subpageArchive += `
						<div class="subpage-archive-item-content">
							<video autoplay muted loop playsinline poster="${folder}/${asset['image']}" title="${asset['alt']}" class="subpage-archive-item-content">
								<source src="${folder}/${asset['video']}">
							</video>
						</div>
					`;
				} else if (asset['format'] == 'videosound') {
					subpageArchive += `
						<div class="subpage-archive-item-content">
							<video poster="${folder}/${asset['image']}" title="${asset['alt']}" class="subpage-archive-item-content" data-sound="1">
								<source src="${folder}/${asset['video']}">
							</video>
						</div>
					`;
				} else if (asset['format'] == 'embed') {
					subpageArchive += `
						<img src="${folder}/${asset['image']}" alt="${asset['alt']}">
						<div class="subpage-archive-item-embed subpage-archive-item-content">
							${asset['html']}
						</div>
					`;
				}

				// Add caption if relevant
				if (asset['alt'] != "") {
					subpageArchive += `
						<div class="subpage-archive-item-caption">${asset['alt']}</div>
					`;
				}
				subpageArchive += `</div>`;
			}
			subpageArchive = `
				<main class="subpage-archive">
					${subpageArchive}
				</main>
			`;
		}

		// Create links
		let subpageLinks = '';
		for (let link of entry['links']) {
			subpageLinks += `<a href="${link[1]}" target="_blank">${link[0]}</a>`;
		}
		if (subpageLinks.length != 0) {
			subpageLinks = `
				<div class="subpage-links">
					${subpageLinks}
				</div>
			`;
		}

		// Create prev/next archive links
		let currentIndex = Object.keys(jsonByDate).indexOf(key);
		let prevNext = '';
		if (currentIndex == 0) {
			let nextEntry = Object.keys(jsonByDate)[currentIndex+1];
			prevNext = `
				<div class="subpage-prevnext-item subpage-prevnext-filler"></div>
				<div class="subpage-prevnext-item">
					<a href="/work/${nextEntry}" class="subpage-prevnext-link" style="--highlight: ${archiveJSON[nextEntry]['color']}" data-invert="${archiveJSON[nextEntry]['invert']}">
						<div class="subpage-prevnext-heading">Next Project</div>
						<div class="subpage-prevnext-title">${archiveJSON[nextEntry]['title']}</div>
						<div class="subpage-prevnext-subtitle">${archiveJSON[nextEntry]['subtitle']}</div>
						<div class="subpage-prevnext-tagline">${archiveJSON[nextEntry]['tagline']}</div>
					</a>
				</div>
			`;
		} else if (currentIndex == Object.keys(jsonByDate).length-1) {
			let prevEntry = Object.keys(jsonByDate)[currentIndex-1];
			prevNext = `
				<div class="subpage-prevnext-item">
					<a href="/work/${prevEntry}" class="subpage-prevnext-link" style="--highlight: ${archiveJSON[prevEntry]['color']}" data-invert="${archiveJSON[prevEntry]['invert']}">
						<div class="subpage-prevnext-heading">Previous Project</div>
						<div class="subpage-prevnext-title">${archiveJSON[prevEntry]['title']}</div>
						<div class="subpage-prevnext-subtitle">${archiveJSON[prevEntry]['subtitle']}</div>
						<div class="subpage-prevnext-tagline">${archiveJSON[prevEntry]['tagline']}</div>
					</a>
				</div>
				<div class="subpage-prevnext-item subpage-prevnext-filler"></div>
			`;
		} else {
			let prevEntry = Object.keys(jsonByDate)[currentIndex-1];
			let nextEntry = Object.keys(jsonByDate)[currentIndex+1];
			prevNext = `
				<div class="subpage-prevnext-item">
					<a href="/work/${prevEntry}" class="subpage-prevnext-link" style="--highlight: ${archiveJSON[prevEntry]['color']}" data-invert="${archiveJSON[prevEntry]['invert']}">
						<div class="subpage-prevnext-heading">Previous Project</div>
						<div class="subpage-prevnext-title">${archiveJSON[prevEntry]['title']}</div>
						<div class="subpage-prevnext-subtitle">${archiveJSON[prevEntry]['subtitle']}</div>
						<div class="subpage-prevnext-tagline">${archiveJSON[prevEntry]['tagline']}</div>
					</a>
				</div>
				<div class="subpage-prevnext-item">
					<a href="/work/${nextEntry}" class="subpage-prevnext-link" style="--highlight: ${archiveJSON[nextEntry]['color']}" data-invert="${archiveJSON[nextEntry]['invert']}">
						<div class="subpage-prevnext-heading">Next Project</div>
						<div class="subpage-prevnext-title">${archiveJSON[nextEntry]['title']}</div>
						<div class="subpage-prevnext-subtitle">${archiveJSON[nextEntry]['subtitle']}</div>
						<div class="subpage-prevnext-tagline">${archiveJSON[nextEntry]['tagline']}</div>
					</a>
				</div>
			`;
		}

		// Generate HTML
		let subpageContent = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Gabriel Drozdov | ${entry['title']}</title>
			
				<meta name="author" content="Gabriel Drozdov">
				<meta name="keywords" content="${entry['tags']}">
				<meta name="description" content="${entry['tagline']}">
				<meta property="og:url" content="https://www.gabrieldrozdov.com/${entry['key']}">
				<meta name="og:title" property="og:title" content="Gabriel Drozdov | ${entry['title']}">
				<meta property="og:description" content="${entry['tagline']}">
				<meta property="og:image" content="/assets/work/${entry['thumbnail'][1]}.jpg">
				<link rel="icon" type="image/png" href="/assets/ui/favicon.png">

				<link rel="stylesheet" href="/style.css">
			</head>

			<body style="--highlight: ${entry['color']};">
				<nav class="nav" data-open="0">
					<!-- Desktop navbar -->
					<div class="nav-section">
						<a href="https://www.gabrieldrozdov.com/" class="nav-link" data-active="1">Gabriel Drozdov</a>
					</div>
					<div class="nav-section">
						<a href="/" class="nav-link" data-active="0">Work</a>
						<a href="/about/" class="nav-link" data-active="0">About</a>
						<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
					</div>
			
					<!-- Mobile navbar -->
					<a href="https://gabrieldrozdov.com/" class="nav-link nav-mobile-logo" data-active="1">Gabriel Drozdov</a>
					<button id="nav-toggle" onclick="toggleNav()">
						<svg class="nav-toggle-open" viewBox="0 0 100 100"><line x1="100" y1="20" y2="20" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="50" y2="50" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="80" y2="80" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
						<svg class="nav-toggle-close" viewBox="0 0 100 100"><line x1="2.5" y1="2.5" x2="97.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="97.5" y1="2.5" x2="2.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
					</button>
					<div class="nav-mobile">
						<a href="/" class="nav-link" data-active="0">Work</a>
						<a href="/about/" class="nav-link" data-active="0">About</a>
						<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
						<div class="nav-mobile-separator">Other Projects</div>
						<a href="https://www.noreplica.com/" target="_blank" class="nav-link" data-active="0">No Replica</a>
						<a href="https://www.gdwithgd.com/" target="_blank" class="nav-link" data-active="0">GD with GD</a>
						<a href="https://www.toomuchtype.com/" target="_blank" class="nav-link" data-active="0">Too Much Type</a>
						<a href="https://www.barcoloudly.com/" target="_blank" class="nav-link" data-active="0">Barco Loudly</a>
					</div>
				</nav>
			
				<header class="subpage-header">
					<div class="subpage-heading">
						<ul class="subpage-meta">
							<li id="subpage-year" style="--highlight: ${entry['color']}" data-invert="${entry['invert']}">${entry['year']}</li>
							${tagsString}
						</ul>
						<h1 class="subpage-title">${entry['title']}</h1>
						<h2 class="subpage-subtitle">${entry['subtitle']}</h2>
					</div>
					<div class="subpage-header-grid">
						<div class="subpage-thumbnail" onclick="openSubpageLightbox(-1)">
							${thumbnail}
						</div>
						<div class="subpage-desc">
							${entry['desc']}
							${subpageLinks}
						</div>
					</div>
				</header>

				<div class="subpage-archive-lightbox" data-active="0">
					<svg onclick="prevSubpageLightboxItem();" class="subpage-archive-lightbox-nav subpage-archive-lightbox-left" viewBox="0 0 100 100"><polyline points="73.75 97.5 26.25 50 73.75 2.5" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
					<svg onclick="nextSubpageLightboxItem();" class="subpage-archive-lightbox-nav subpage-archive-lightbox-right" viewBox="0 0 100 100"><polyline points="26.25 2.5 73.75 50 26.25 97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
					<svg class="subpage-archive-lightbox-close" onclick="closeSubpageLightbox();" viewBox="0 0 100 100"><line x1="2.5" y1="2.5" x2="97.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="97.5" y1="2.5" x2="2.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
					<div class="subpage-archive-lightbox-content"></div>
					<div class="subpage-archive-lightbox-caption"></div>
				</div>

				${subpageArchive}

				<div class="subpage-prevnext">
					${prevNext}
				</div>

				<footer class="footer">
					© 2024 Gabriel Drozdov<br>
					All Rights Reserved<br><br>
					${buildDatetime}
				</footer>

				<script src="/navbar.js"></script>
				<script src="/subpage.js"></script>
			</body>
			</html>
		`

		// Check if directory already exists
		// If not, create directory
		let dir = 'work/' + entry['key'];
		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}

		// Create index file in directory
		fs.writeFile(`work/${entry['key']}/index.html`, subpageContent, err => {
			if (err) {
				console.error(err);
			}
		});
	}

	// Homepage
	let homepageContent = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Gabriel Drozdov | Designer and Educator</title>

			<meta name="author" content="Gabriel Drozdov">
			<meta name="keywords" content="Graphic Design, Web Design, Sound Design, Education, Creative Coding, UI, UX">
			<meta name="description" content="Gabriel Drozdov is a designer and educator creating one-of-a-kind websites.">
			<meta property="og:url" content="https://www.gabrieldrozdov.com/">
			<meta name="og:title" property="og:title" content="Gabriel Drozdov | Designer and Educator">
			<meta property="og:description" content="Gabriel Drozdov is a designer and educator creating one-of-a-kind websites.">
			<meta property="og:image" content="">
			<link rel="icon" type="image/png" href="/assets/ui/favicon.png">

			<link rel="stylesheet" href="/style.css">
		</head>
		<body>
			<nav class="nav" data-open="0">
				<!-- Desktop navbar -->
				<div class="nav-section">
					<a href="https://www.gabrieldrozdov.com/" class="nav-link" data-active="1">Gabriel Drozdov</a>
				</div>
				<div class="nav-section">
					<a href="/" class="nav-link" data-active="1">Work</a>
					<a href="/about/" class="nav-link" data-active="0">About</a>
					<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
				</div>

				<!-- Mobile navbar -->
				<a href="https://gabrieldrozdov.com/" class="nav-link nav-mobile-logo" data-active="1">Gabriel Drozdov</a>
				<button id="nav-toggle" onclick="toggleNav()">
					<svg class="nav-toggle-open" viewBox="0 0 100 100"><line x1="100" y1="20" y2="20" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="50" y2="50" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="80" y2="80" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
					<svg class="nav-toggle-close" viewBox="0 0 100 100"><line x1="2.5" y1="2.5" x2="97.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="97.5" y1="2.5" x2="2.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
				</button>
				<div class="nav-mobile">
					<a href="/" class="nav-link" data-active="1">Work</a>
					<a href="/about/" class="nav-link" data-active="0">About</a>
					<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
					<div class="nav-mobile-separator">Other Projects</div>
					<a href="https://www.noreplica.com/" target="_blank" class="nav-link" data-active="0">No Replica</a>
					<a href="https://www.gdwithgd.com/" target="_blank" class="nav-link" data-active="0">GD with GD</a>
					<a href="https://www.toomuchtype.com/" target="_blank" class="nav-link" data-active="0">Too Much Type</a>
					<a href="https://www.barcoloudly.com/" target="_blank" class="nav-link" data-active="0">Barco Loudly</a>
				</div>
			</nav>

			<header class="header">
				<h1 class="header-desc">
					<strong>I’m Gabriel, a designer and educator.</strong> I play with code, typography, and sound to create interactive digital experiences at the intersections of technology and performance.
				</h1>
				<h2 class="header-links">
					I run <a href="https://www.noreplica.com/" target="_blank" class="header-link">No Replica</a>, <a href="https://www.gdwithgd.com/" target="_blank" class="header-link">GD with GD</a>, <a href="https://www.toomuchtype.com/" target="_blank" class="header-link">Too Much Type</a>, and <a href="https://www.barcoloudly.com/" target="_blank" class="header-link">Barco Loudly</a>.
				</h2>
			</header>

			<main class="archive" data-initialized="0">
				<div class="archive-controls">
					<!-- View modes -->
					<div class="controls-view">
						<button class="view-option" data-active="1" data-view="list" onclick="changeView('list')">
							<img src="/assets/ui/view-list.svg" class="view-option-icon">
						</button>
						<button class="view-option" data-active="0" data-view="detail" onclick="changeView('detail')">
							<img src="/assets/ui/view-detail.svg" class="view-option-icon">
						</button>
						<button class="view-option" data-active="0" data-view="thumbnail" onclick="changeView('thumbnail')">
							<img src="/assets/ui/view-thumbnail.svg" class="view-option-icon">
						</button>
						<button class="view-option" data-active="0" data-view="dense" onclick="changeView('dense')">
							<img src="/assets/ui/view-dense.svg" class="view-option-icon">
						</button>
					</div>

					<!-- Search -->
					<input type="text" placeholder="Search by title" class="controls-search">

					<!-- Sorting and filters -->
					<div class="controls-settings">
						<h3 class="settings-label" data-settings-label="sorting" onclick="toggleSettings('sorting')">Sorting</h3>
						<div class="settings-menu" data-active="0" data-settings="sorting">
							<div class="settings-option" data-active="1" data-sorting='curated' onclick="toggleSorting('curated')">
								<div class="settings-option-toggle"></div>
								<p class="settings-option-label">Favorites first</p>
							</div>
							<div class="settings-option" data-active="0" data-sorting='newest' onclick="toggleSorting('newest')">
								<div class="settings-option-toggle"></div>
								<p class="settings-option-label">Newest first</p>
							</div>
							<div class="settings-option" data-active="0" data-sorting='oldest' onclick="toggleSorting('oldest')">
								<div class="settings-option-toggle"></div>
								<p class="settings-option-label">Oldest first</p>
							</div>
							<div class="settings-option" data-active="0" data-sorting='az' onclick="toggleSorting('az')">
								<div class="settings-option-toggle"></div>
								<p class="settings-option-label">A–Z</p>
							</div>
							<div class="settings-option" data-active="0" data-sorting='za' onclick="toggleSorting('za')">
								<div class="settings-option-toggle"></div>
								<p class="settings-option-label">Z–A</p>
							</div>
							<div class="settings-option" data-active="0" data-sorting='random' onclick="toggleSorting('random')">
								<div class="settings-option-toggle"></div>
								<p class="settings-option-label">Random</p>
							</div>
						</div>

						<h3 class="settings-label" data-settings-label="filters" onclick="toggleSettings('filters')">Filters</h3>
						<div class="settings-menu" data-active="0" data-settings="filters">
							<div class="settings-option" data-active="0" data-filter='branding' onclick="toggleFilter('branding')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Branding</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='education' onclick="toggleFilter('education')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Education</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='generative' onclick="toggleFilter('generative')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Generative</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='interactive' onclick="toggleFilter('interactive')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Interactive</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='logo' onclick="toggleFilter('logo')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Logo</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='motion' onclick="toggleFilter('motion')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Motion</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='music' onclick="toggleFilter('music')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Music</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='physical' onclick="toggleFilter('physical')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Physical</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='poster' onclick="toggleFilter('poster')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Poster</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='publication' onclick="toggleFilter('publication')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Publication</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='sound' onclick="toggleFilter('sound')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Sound</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='typeface' onclick="toggleFilter('typeface')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Typeface</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='video' onclick="toggleFilter('video')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Video</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='web' onclick="toggleFilter('web')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Web</p>
							</div>
							<div class="settings-option" data-active="0" data-filter='writing' onclick="toggleFilter('writing')">
								<div class="settings-option-check"></div>
								<p class="settings-option-label">Writing</p>
							</div>
							<div class="settings-clear" onclick="clearFilters(); closeSettings();">
								Clear filters
							</div>
						</div>
					</div>
				</div>

				<!-- Portfolio archive -->
				<div class="archive-content" data-mode="list">
					${homepageArchive}
				</div>

				<!-- Empty notice -->
				<div class="archive-empty" data-hide="1">
					<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" stroke-width="0"/><path d="m27,72.5c0-12.425,10.075-22.5,22.5-22.5s22.5,10.075,22.5,22.5" fill="none" stroke="#fff" stroke-miterlimit="10" stroke-width="4"/><circle cx="38.25" cy="33.125" r="5.625" fill="#fff" stroke-width="0"/><circle cx="60.75" cy="33.125" r="5.625" fill="#fff" stroke-width="0"/></svg>
					<p>No items found!</p>
				</div>

				<!-- Flash on view change -->
				<div class="archive-flash"></div>
			</main>

			<footer class="footer">
				© 2024 Gabriel Drozdov<br>
				All Rights Reserved<br><br>
				${buildDatetime}
			</footer>

			<script src="/navbar.js"></script>
			<script src="/archive.js"></script>
			<script src="/script.js"></script>
		</body>
		</html>
	`;

	// Create homepage file
	fs.writeFile(`index.html`, homepageContent, err => {
		if (err) {
			console.error(err);
		}
	});

	// About page
	let aboutContent = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Gabriel Drozdov | Designer and Educator</title>

			<meta name="author" content="Gabriel Drozdov">
			<meta name="keywords" content="Graphic Design, Web Design, Sound Design, Education, Creative Coding, UI, UX">
			<meta name="description" content="Gabriel Drozdov is a designer and educator creating one-of-a-kind websites.">
			<meta property="og:url" content="https://www.gabrieldrozdov.com/">
			<meta name="og:title" property="og:title" content="Gabriel Drozdov | Designer and Educator">
			<meta property="og:description" content="Gabriel Drozdov is a designer and educator creating one-of-a-kind websites.">
			<meta property="og:image" content="">
			<link rel="icon" type="image/png" href="/assets/ui/favicon.png">

			<link rel="stylesheet" href="/style.css">
		</head>
		<body>
			<nav class="nav" data-open="0">
				<!-- Desktop navbar -->
				<div class="nav-section">
					<a href="https://www.gabrieldrozdov.com/" class="nav-link" data-active="1">Gabriel Drozdov</a>
				</div>
				<div class="nav-section">
					<a href="/" class="nav-link" data-active="0">Work</a>
					<a href="/about/" class="nav-link" data-active="1">About</a>
					<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
				</div>

				<!-- Mobile navbar -->
				<a href="https://gabrieldrozdov.com/" class="nav-link nav-mobile-logo" data-active="1">Gabriel Drozdov</a>
				<button id="nav-toggle" onclick="toggleNav()">
					<svg class="nav-toggle-open" viewBox="0 0 100 100"><line x1="100" y1="20" y2="20" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="50" y2="50" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="80" y2="80" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
					<svg class="nav-toggle-close" viewBox="0 0 100 100"><line x1="2.5" y1="2.5" x2="97.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="97.5" y1="2.5" x2="2.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
				</button>
				<div class="nav-mobile">
					<a href="/" class="nav-link" data-active="0">Work</a>
					<a href="/about/" class="nav-link" data-active="1">About</a>
					<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
					<div class="nav-mobile-separator">Other Projects</div>
					<a href="https://www.noreplica.com/" target="_blank" class="nav-link" data-active="0">No Replica</a>
					<a href="https://www.gdwithgd.com/" target="_blank" class="nav-link" data-active="0">GD with GD</a>
					<a href="https://www.toomuchtype.com/" target="_blank" class="nav-link" data-active="0">Too Much Type</a>
					<a href="https://www.barcoloudly.com/" target="_blank" class="nav-link" data-active="0">Barco Loudly</a>
				</div>
			</nav>

			<header class="header">
				<h1 class="header-desc">
					Hi there, I’m Gabriel.
				</h1>

				<p>
					TODO
				</p>
			</header>

			<footer class="footer">
				© 2024 Gabriel Drozdov<br>
				All Rights Reserved<br><br>
				${buildDatetime}
			</footer>

			<script src="/navbar.js"></script>
		</body>
		</html>
	`;

	// Create homepage file
	fs.writeFile(`about/index.html`, aboutContent, err => {
		if (err) {
			console.error(err);
		}
	});
}
generatePages();