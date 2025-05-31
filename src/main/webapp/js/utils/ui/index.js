export function showToast(message, type) {
	const $toastContainer = $('#toast-container');
	$toastContainer.find('.toast').toast('hide').remove();

	let borderClasses = '';
	let iconClass = '';
	let btnCloseClass = '';

	switch (type) {
		case 'success':
			borderClasses = 'text-success-emphasis bg-success-subtle border border-success-subtle rounded-2';
			iconClass = 'bi-check2-circle';
			btnCloseClass = 'btn-close-success';
			break;
		case 'error':
			borderClasses = 'text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded-2';
			iconClass = 'bi-x-circle';
			btnCloseClass = 'btn-close-danger';
			break;
		case 'warning':
			borderClasses = 'text-warning-emphasis bg-warning-subtle border border-warning-subtle rounded-2';
			iconClass = 'bi-exclamation-triangle';
			btnCloseClass = 'btn-close-warning';
			break;
	}

	const $toastElement = $(`
		<div class="toast align-items-center ${borderClasses}" role="alert" aria-live="assertive" aria-atomic="true">
			<div class="d-flex">
				<div class="toast-body d-flex align-items-center">
					<i class="bi ${iconClass} me-2"></i>${message}
				</div>
				<button type="button" class="btn-close ${btnCloseClass} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
			</div>
		</div>
	`);

	$toastContainer.append($toastElement);

	const bootstrapToast = new bootstrap.Toast($toastElement[0], { animation: true, autohide: true, delay: 3000 });
	bootstrapToast.show();

	$toastElement.on('hidden.bs.toast', function() {
		$(this).remove();
	});
}

export function toggleButtonLoading(button, loading = true) {
	const icon = button.find('span').first();
	const spinner = button.find('.spinner-border');

	if (loading) {
		button.prop('disabled', true);
		icon.addClass('d-none');
		spinner.removeClass('d-none');
	} else {
		button.prop('disabled', false);
		icon.removeClass('d-none');
		spinner.addClass('d-none');
	}
}

export function populateSelect(selector, dataList, valueKey, textKey, badgeValueKey) {
	const select = $(selector).selectpicker('destroy').empty();

	dataList.forEach(item => {
		if (item[valueKey]) {
			let content = item[textKey];

			if (badgeValueKey && item[badgeValueKey] !== undefined) {
				const badgeValue = item[badgeValueKey];
				content += ` <span class="badge bg-body-tertiary text-body-emphasis border ms-1">${badgeValue}</span>`;
			}

			select.append(
				$('<option>', {
					value: item[valueKey]
				}).attr('data-content', content)
			);
		}
	});
}

export function placeholderColorSelect() {
	$('select.selectpicker').on('change', function() {
		const $select = $(this);
		const $dropdown = $select.closest('.bootstrap-select');
		const $filterOption = $dropdown.find('.filter-option-inner-inner');

		if ($select.val() !== "" && $select.val() !== null) {
			$dropdown.removeClass('placeholder-color');
			$filterOption.css('color', 'var(--bs-body-color)');
		}
	});
}

export function placeholderColorEditSelect() {
	$('select[id^="edit"]').each(function() {
		const $select = $(this);
		const $dropdown = $select.closest('.bootstrap-select');
		const $filterOption = $dropdown.find('.filter-option-inner-inner');

		if ($filterOption.text().trim() === "No hay selección") {
			$filterOption.css('color', 'var(--placeholder-color)');
		} else {
			$filterOption.css('color', 'var(--bs-body-color)');
		}
	});
}

export function placeholderColorDateInput() {
	$('input[type="date"]').each(function() {
		const $input = $(this);

		if (!$input.val()) {
			$input.css('color', 'var(--placeholder-color)');
		} else {
			$input.css('color', '');
		}
	});

	$('input[type="date"]').on('change input', function() {
		const $input = $(this);

		if (!$input.val()) {
			$input.css('color', 'var(--placeholder-color)');
		} else {
			$input.css('color', '');
		}
	});
}

export function initializeCropper(file, $cropperContainer, $imageToCrop, cropper) {
	const reader = new FileReader();
	reader.onload = function(e) {
		$cropperContainer.removeClass('d-none');
		$imageToCrop.attr('src', e.target.result);

		if (cropper) {
			cropper.destroy();
		}

		cropper = new Cropper($imageToCrop[0], {
			aspectRatio: 1,
			viewMode: 1,
			autoCropArea: 1,
			responsive: true,
			checkOrientation: false,
			ready: function() {
				$('.cropper-crop-box').css({
					'border-radius': '50%',
					'overflow': 'hidden'
				});
			}
		});
	};
	reader.readAsDataURL(file);
}

function updateDropdownIcons($dropdown) {
	$dropdown.find('.dropdown-item').each(function() {
		const $item = $(this);
		let $icon = $item.find('i.bi-check2');

		if ($item.hasClass('active') && $item.hasClass('selected')) {
			if ($icon.length === 0) {
				$('<i class="bi bi-check2 ms-auto"></i>').appendTo($item);
			}
		} else {
			$icon.remove();
		}
	});
}

export function setupBootstrapSelectDropdownStyles() {
	const observer = new MutationObserver((mutationsList) => {
		mutationsList.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node.nodeType === 1 && node.classList.contains('dropdown-menu')) {
					const $dropdown = $(node);
					$dropdown.addClass('gap-1 px-2 rounded-3 mx-0 shadow');
					$dropdown.find('.dropdown-item').addClass('rounded-2 d-flex align-items-center justify-content-between');

					$dropdown.find('li:not(:first-child)').addClass('mt-1');

					updateDropdownIcons($dropdown);
				}
			});
		});
	});

	observer.observe(document.body, { childList: true, subtree: true });

	$(document).on('click', '.bootstrap-select .dropdown-item', function() {
		const $dropdown = $(this).closest('.dropdown-menu');
		updateDropdownIcons($dropdown);
	});
}

export function initializeTooltips(container) {
	$(container).find('[data-tooltip="tooltip"]').tooltip({
		trigger: 'hover'
	}).on('click', function() {
		$(this).tooltip('hide');
	});
}

export const togglePasswordVisibility = () => {
	$('.input-group-text').each(function () {
		$(this).on('click', function () {
			const toggleId = $(this).data('toggle-id');
			const $input = $(`.password-field[data-toggle-id="${toggleId}"]`);
			const $icon = $(this).find('i');

			if ($input.attr('type') === 'password') {
				$input.attr('type', 'text');
				$icon.removeClass('bi-eye').addClass('bi-eye-slash');
			} else {
				$input.attr('type', 'password');
				$icon.removeClass('bi-eye-slash').addClass('bi-eye');
			}
		});
	});
};