function cvExpand(btn) {
	const desc = btn.parentElement.parentElement.querySelector('ul');
	if (parseInt(btn.dataset.active) == 0) {
		desc.dataset.active = 1;
		btn.innerText = "Read less";
		btn.dataset.active = 1;
	} else {
		desc.dataset.active = 0;
		btn.innerText = "Read more";
		btn.dataset.active = 0;
	}
}