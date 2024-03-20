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
	let datetimeMinutes = datetime.getMinutes();
	if (datetimeMinutes < 10) {
		datetimeMinutes = "0"+datetimeMinutes;
	}
	const buildDatetime = `Last updated: ${datetime.getDate()} ${datetime.toLocaleString('default', { month: 'long' })} ${datetime.getFullYear()} at ${datetimeHours}:${datetimeMinutes}${datetimeHoursAMPM} EST`;

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
				<video autoplay muted loop playsinline disableRemotePlayback poster="${folder}/${entry['thumbnail']['image']}" class="lazy archive-item-thumbnail" title="${entry['thumbnail']['alt']}">
					<source data-src="${folder}/${entry['thumbnail']['video']}">
				</video>
			`;
		} else if (entry['thumbnail']['format'] == 'image') {
			thumbnail = `<img src="${folder}/${entry['thumbnail']['image']}" class="archive-item-thumbnail" alt="${entry['thumbnail']['alt']}">`;
		} else if (entry['thumbnail']['format'] == 'placeholder') {
			thumbnail = `<img src="/assets/ui/placeholder.svg" class="archive-item-thumbnail">`;
		}

		// Tags
		let tags = entry['tags'].split(',');
		let trimmedTags = [];
		for (let tag of tags) {
			trimmedTags.push(tag.trim());
		}
		let tagsString = '';
		for (let tag of trimmedTags.sort()) {
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
							<video autoplay muted loop playsinline disableRemotePlayback poster="${folder}/${asset['image']}" title="${asset['alt']}" class="lazy subpage-archive-item-content">
								<source data-src="${folder}/${asset['video']}">
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
				<meta property="og:image" content="${folder}/${entry['thumbnail']['image']}">
				<link rel="icon" type="image/png" href="/assets/ui/favicon.png">

				<link rel="stylesheet" href="/style.css">
			</head>

			<body style="--highlight: ${entry['color']};">
				<nav class="nav" data-open="0">
					<!-- Desktop navbar -->
					<div class="nav-section">
						<a href="/" class="nav-link" data-active="1">Gabriel Drozdov</a>
					</div>
					<div class="nav-section">
						<a href="/" class="nav-link" data-active="0">Work</a>
						<a href="/about/" class="nav-link" data-active="0">About</a>
						<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
					</div>
			
					<!-- Mobile navbar -->
					<a href="/" class="nav-link nav-mobile-logo" data-active="1">Gabriel Drozdov</a>
					<button id="nav-toggle" onclick="toggleNav()">
						<svg class="nav-toggle-open" viewBox="0 0 100 100"><line x1="100" y1="20" y2="20" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="50" y2="50" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="80" y2="80" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
						<svg class="nav-toggle-close" viewBox="0 0 100 100"><line x1="2.5" y1="2.5" x2="97.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="97.5" y1="2.5" x2="2.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
					</button>
					<div class="nav-mobile">
						<a href="/" class="nav-link" data-active="0">Work</a>
						<a href="/about/" class="nav-link" data-active="0">About</a>
						<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
						<div class="nav-mobile-separator">Related Projects</div>
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
				<script src="/lazy.js"></script>
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
			<meta property="og:image" content="/assets/ui/opengraph.jpg">
			<link rel="icon" type="image/png" href="/assets/ui/favicon.png">

			<link rel="stylesheet" href="/style.css">
		</head>
		<body>
			<nav class="nav" data-open="0">
				<!-- Desktop navbar -->
				<div class="nav-section">
					<a href="/" class="nav-link" data-active="1">Gabriel Drozdov</a>
				</div>
				<div class="nav-section">
					<a href="/" class="nav-link" data-active="1">Work</a>
					<a href="/about/" class="nav-link" data-active="0">About</a>
					<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
				</div>

				<!-- Mobile navbar -->
				<a href="/" class="nav-link nav-mobile-logo" data-active="1">Gabriel Drozdov</a>
				<button id="nav-toggle" onclick="toggleNav()">
					<svg class="nav-toggle-open" viewBox="0 0 100 100"><line x1="100" y1="20" y2="20" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="50" y2="50" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="80" y2="80" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
					<svg class="nav-toggle-close" viewBox="0 0 100 100"><line x1="2.5" y1="2.5" x2="97.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="97.5" y1="2.5" x2="2.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
				</button>
				<div class="nav-mobile">
					<a href="/" class="nav-link" data-active="1">Work</a>
					<a href="/about/" class="nav-link" data-active="0">About</a>
					<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
					<div class="nav-mobile-separator">Related Projects</div>
					<a href="https://www.noreplica.com/" target="_blank" class="nav-link" data-active="0">No Replica</a>
					<a href="https://www.gdwithgd.com/" target="_blank" class="nav-link" data-active="0">GD with GD</a>
					<a href="https://www.toomuchtype.com/" target="_blank" class="nav-link" data-active="0">Too Much Type</a>
					<a href="https://www.barcoloudly.com/" target="_blank" class="nav-link" data-active="0">Barco Loudly</a>
				</div>
			</nav>

			<header class="header">
				<h1 class="header-desc">
					<strong>Hi! I’m Gabriel.</strong><br>I’m a designer, coder, and teacher.
				</h1>
				<div class="header-links">
					<a href='https://noreplica.com/' target='_blank'>
						<img src="/assets/ui/logo-noreplica.svg" alt="No Replica">
						<h2>Studio</h2>
					</a>
					<a href='https://gdwithgd.com/' target='_blank'>
						<img src="/assets/ui/logo-gdwithgd.svg" alt="GD with GD">
						<h2>Teaching</h2>
					</a>
					<a href='https://toomuchtype.com/' target='_blank'>
						<img src="/assets/ui/logo-toomuchtype.svg" alt="Too Much Type">
						<h2>Fonts</h2>
					</a>
					<a href='https://barcoloudly.com/' target='_blank'>
						<img src="/assets/ui/logo-barcoloudly.svg" alt="Barco Loudly">
						<h2>Music</h2>
					</a>
				</div>
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
				Typeset in Limkin by Gabriel Drozdov (me!)<br><br>
				${buildDatetime}
			</footer>

			<script src="/navbar.js"></script>
			<script src="/archive.js"></script>
			<script src="/script.js"></script>
			<script src="/archive-lazy.js"></script>
		</body>
		</html>
	`;

	// Create homepage file
	fs.writeFile(`index.html`, homepageContent, err => {
		if (err) {
			console.error(err);
		}
	});

	// 404 copy of homepage
	fs.writeFile(`404.html`, homepageContent, err => {
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
			<meta property="og:image" content="/assets/ui/opengraph.jpg">
			<link rel="icon" type="image/png" href="/assets/ui/favicon.png">

			<link rel="stylesheet" href="/style.css">
		</head>
		<body>
			<nav class="nav" data-open="0">
				<!-- Desktop navbar -->
				<div class="nav-section">
					<a href="/" class="nav-link" data-active="1">Gabriel Drozdov</a>
				</div>
				<div class="nav-section">
					<a href="/" class="nav-link" data-active="0">Work</a>
					<a href="/about/" class="nav-link" data-active="1">About</a>
					<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
				</div>

				<!-- Mobile navbar -->
				<a href="/" class="nav-link nav-mobile-logo" data-active="1">Gabriel Drozdov</a>
				<button id="nav-toggle" onclick="toggleNav()">
					<svg class="nav-toggle-open" viewBox="0 0 100 100"><line x1="100" y1="20" y2="20" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="50" y2="50" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="100" y1="80" y2="80" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
					<svg class="nav-toggle-close" viewBox="0 0 100 100"><line x1="2.5" y1="2.5" x2="97.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/><line x1="97.5" y1="2.5" x2="2.5" y2="97.5" fill="none" stroke-miterlimit="10" stroke-width="6"/></svg>
				</button>
				<div class="nav-mobile">
					<a href="/" class="nav-link" data-active="0">Work</a>
					<a href="/about/" class="nav-link" data-active="1">About</a>
					<a href="mailto:gabriel@noreplica.com" class="nav-link" data-active="0">Contact</a>
					<div class="nav-mobile-separator">Related Projects</div>
					<a href="https://www.noreplica.com/" target="_blank" class="nav-link" data-active="0">No Replica</a>
					<a href="https://www.gdwithgd.com/" target="_blank" class="nav-link" data-active="0">GD with GD</a>
					<a href="https://www.toomuchtype.com/" target="_blank" class="nav-link" data-active="0">Too Much Type</a>
					<a href="https://www.barcoloudly.com/" target="_blank" class="nav-link" data-active="0">Barco Loudly</a>
				</div>
			</nav>

			<div class="about">

				<header class="about-info">
					<img src="/assets/ui/headshot.jpg" alt="Portrait" class="about-headshot">
					<h1 class="about-header">
						<strong>Hello! You’re here!</strong><br>I’m Gabriel, and I’m here, too.
					</h1>
					<div class="about-bio">
						<p>
							I make websites. I make other things too, but I really like making websites.
						</p>
						<p>
							I studied computer science and theater at Wesleyan University, and I have since found that websites are the best way to bring those things together. I also studied graphic design in RISD’s MFA program. That made me love websites even more, as well as teaching.
						</p>
						<div class="about-divider"></div>
						<p>
							Right now, I’m running a few companies I founded:
						</p>
						<p>
							<strong><a href='https://noreplica.com/' target='_blank'>No Replica</a></strong> is my design studio.
						</p>
						<p>
							<strong><a href='https://gdwithgd.com/' target='_blank'>GD with GD</a></strong>, or Graphic Design with Gabriel Drozdov, is my teaching practice.
						</p>
						<p>
							<strong><a href='https://toomuchtype.com/' target='_blank'>Too Much Type</a></strong> is my type foundry.
						</p>
						<p>
							<strong><a href='https://barcoloudly.com/' target='_blank'>Barco Loudly</a></strong> is my music project.
						</p>
					</div>
				</header>

				<main class="cv">
					<div class="cv-section">
						<h3 class="cv-section-title">Education</h3>
						<div class="cv-section-item">
							<div><strong>2021–<br>2024</strong></div>
							<div>
								<div>Rhode Island School of Design</div>
								<div><em>MFA in Graphic Design</em></div>
								<div>Providence, RI</div>
							</div>
						</div>
						<div class="cv-section-item">
							<div><strong>2015–<br>2019</strong></div>
							<div>
								<div>Wesleyan University</div>
								<div><em>BA in Computer Science and Theater</em></div>
								<div>Honors in Theater</div>
								<div>Middletown, CT</div>
								<div onclick="cvExpand(this);" data-active="0" class="cv-expand">Read more</div>
							</div>
							<ul data-active="0">
								<li>Honors in Theater, concentration in performance theory and sound design.</li>
								<li>Rachel Henderson Prize, one of 3 recipients awarded for outstanding impact on theater community.</li>
								<li>Designed university monogram by winning logo submission contest with entry garnering over 3,000 community votes.</li>
							</ul>
						</div>
					</div>

					<div class="cv-section">
						<h3 class="cv-section-title">Work Experience</h3>
						<div class="cv-section-item">
							<div><strong>2024–<br>ongoing</strong></div>
							<div>
								<div>No Replica</div>
								<div><em>Founder and Principal Designer</em></div>
							</div>
						</div>
						<div class="cv-section-item">
							<div><strong>2019–<br>2024</strong></div>
							<div>
								<div><em>Freelance Designer & Art Director</em></div>
								<div>Selected clients: Design Observer, Williamstown Theatre Festival, Central Synagogue, The 24 Hour Plays, Dramatists Guild</div>
								<div onclick="cvExpand(this);" data-active="0" class="cv-expand">Read more</div>
							</div>
							<ul data-active="0">
								<li>Spearheaded numerous digital-first initiatives for major cultural institutions, including web-based theater programs for
								Wiliamstown Theatre Festival, a first-of-its-kind online community for Central Synagogue, and several brand identities.</li>
							</ul>
						</div>
						<div class="cv-section-item">
							<div><strong>6/2022–<br>8/2022</strong></div>
							<div>
								<div>Local Projects</div>
								<div><em>Visual Experience Design Intern</em></div>
								<div>New York, NY</div>
								<div onclick="cvExpand(this);" data-active="0" class="cv-expand">Read more</div>
							</div>
							<ul data-active="0">
								<li>Co-led research project with Creative Technologies intern to test immersive motion-tracking AR experience using ZED 2 camera.</li>
								<li>Produced hundreds of final production assets for NYC museum children’s exhibit about Jewish life during the Holocaust.</li>
								<li>Workshopped frequently with large corporate client to lock-in visual identity for multisensorial immersive exhibition space.</li>
								<li>Pitched, designed, and approved visual moves for new National Park Service museum in Philadelphia.</li>
							</ul>
						</div>
						<div class="cv-section-item">
							<div><strong>5/2019–<br>8/2019</strong></div>
							<div>
								<div>Williamstown Theatre Festival</div>
								<div><em>Lead Graphic Designer</em></div>
								<div>Williamstown, MA</div>
								<div onclick="cvExpand(this);" data-active="0" class="cv-expand">Read more</div>
							</div>
							<ul data-active="0">
								<li>Supervised design team of 2 by delegating tasks using Asana and mentoring on challenging projects.</li>
								<li>Orchestrated seasonal branding identity and motion guidelines used for all digital and print marketing.</li>
								<li>Engaged patrons with several weekly newsletters and designed over 40 promotional animations.</li>
								<li>Assembled 52-page programs for 7 shows and oversaw extensive company-wide proofing process.</li>
							</ul>
						</div>
						<div class="cv-section-item">
							<div><strong>7/2018–<br>9/2018</strong></div>
							<div>
								<div>Dramatists Guild</div>
								<div><em>Membership & Creative Affairs Intern</em></div>
								<div>New York, NY</div>
								<div onclick="cvExpand(this);" data-active="0" class="cv-expand">Read more</div>
							</div>
							<ul data-active="0">
								<li>Scripted, storyboarded, animated, and sound designed sizzle reel to promote membership benefits.</li>
								<li>Analyzed brand materials to compile style guide and expand on company’s visual language.</li>
								<li>Programmed 8 membership web pages premiering new visual elements and iconography.</li>
							</ul>
						</div>
						<div class="cv-section-item">
							<div><strong>6/2017–<br>8/2017</strong></div>
							<div>
								<div>The 24 Hour Plays</div>
								<div><em>Web & Graphic Design Intern</em></div>
								<div>New York, NY</div>
								<div onclick="cvExpand(this);" data-active="0" class="cv-expand">Read more</div>
							</div>
							<ul data-active="0">
								<li>Designed company brand refresh and developed WordPress website.</li>
								<li>Produced all print and digital marketing assets including posters, programs, and ads for 3 flagship productions.</li>
								<li>Authored documentation for new visual language style guide and maintenance of website back-end.</li>
							</ul>
						</div>
					</div>

					<div class="cv-section">
						<h3 class="cv-section-title">Teaching Experience</h3>
						<div class="cv-section-item">
							<div><strong>2022–<br>ongoing</strong></div>
							<div>
								<div>Rhode Island School of Design</div>
								<div><em>Instructor in Graphic Design</em></div>
								<div>Providence, RI</div>
								<div>Selected courses: Web Sites & Stories, Digital Form, Variable Fonts Workshop, Web Programming Workshop</div>
							</div>
						</div>
					</div>

					<div class="cv-section">
						<h3 class="cv-section-title">Recognitions</h3>
						<div class="cv-section-item">
							<div><strong>8/2019</strong></div>
							<div>
								<div><em>J. Michael Friedman Fellowship nominee</em></div>
								<div>Williamstown Theatre Festival</div>
							</div>
						</div>
						<div class="cv-section-item">
							<div><strong>5/2019</strong></div>
							<div>
								<div><em>Honors in Theater</em></div>
								<div>Wesleyan University</div>
							</div>
						</div>
						<div class="cv-section-item">
							<div><strong>5/2019</strong></div>
							<div>
								<div><em>Rachel Henderson Prize for Outstanding Achievement in Theater</em></div>
								<div>Wesleyan University</div>
							</div>
						</div>
						<div class="cv-section-item">
							<div><strong>3/2019</strong></div>
							<div>
								<div><em>Official University Monogram Design contest winner</em></div>
								<div>Wesleyan University</div>
							</div>
						</div>
						<div class="cv-section-item">
							<div><strong>5/2013</strong></div>
							<div>
								<div><em>“Our City, My Story” finalist</em></div>
								<div>Tribeca Film Festival</div>
							</div>
						</div>
					</div>

					<div class="cv-section">
						<h3 class="cv-section-title">Exhibitions</h3>
						<div class="cv-section-item">
							<div><strong>4/14–<br>4/30/2022</strong></div>
							<div>
								<div>RISD Graphic Design MFA Biennial:</div>
								<div><em><a href='https://mfabiennial2023.risd.gd/' target='_blank'>Highlights from the Impermanent Collection</a></em></div>
								<div>Providence, RI</div>
							</div>
						</div>
						<div class="cv-section-item">
							<div><strong>10/29–<br>11/14/2021</strong></div>
							<div>
								<div>RISD Graphic Design Triennial:</div>
								<div><em><a href='https://portals.risd.gd/' target='_blank'>Portals</a></em></div>
								<div>Providence, RI</div>
							</div>
						</div>
					</div>
				</main>

			</div>

			<footer class="footer">
				© 2024 Gabriel Drozdov<br>
				All Rights Reserved<br><br>
				Typeset in Limkin by Gabriel Drozdov (me!)<br><br>
				${buildDatetime}
			</footer>

			<script src="/navbar.js"></script>
			<script src="about.js"></script>
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