/**
 * publishers.js
 * 
 * Manages the initialization, data loading, and configuration of the publishers table,  
 * as well as handling modals for creating, viewing, editing publisher details, 
 * and performing logical delete (status change) operations on publishers.
 * Utilizes AJAX for CRUD operations on publisher data.
 * Includes functions to manage UI elements like placeholders, dropdown styles, and tooltips.
 * Additionally, incorporates functionality to generate PDFs and Excel files directly from the datatable.
 * 
 * @author [Jason]
 */

import {
  showToast,
  toggleButtonLoading,
  populateSelect,
  placeholderColorSelect,
  placeholderColorEditSelect,
  initializeCropper,
  setupBootstrapSelectDropdownStyles,
  initializeTooltips
} from '../../utils/ui/index.js';

import { toggleTableLoadingState, setupDataTable } from '../../utils/tables/index.js';

import {
  isValidText,
  isValidFoundationYear,
  isValidImageFile,
  validateImageFileUI
} from '../../utils/validators/index.js';

/*****************************************
 * GLOBAL VARIABLES AND HELPER FUNCTIONS
 *****************************************/

// Global list of nationalities and literary genres for the selectpickers
var nationalityList = [];
var literaryGenreList = [];

// Global variable to handle photo deletion in edit modal
let deletePhotoFlag = false;

function populateSelectOptions() {
	$.ajax({
		url: 'PublisherServlet',
		type: 'GET',
		data: { type: 'populateSelects' },
		dataType: 'json',
		success: function(data, xhr) {
			if (xhr.status === 204) {
				console.warn("No data found for select options.");
				return;
			}
			
			if (data) {
				nationalityList = data.nationalities;
				literaryGenreList = data.literaryGenres;

				populateSelect('#addPublisherNationality', nationalityList, 'nationalityId', 'nationalityName');
				populateSelect('#addLiteraryGenre', literaryGenreList, 'literaryGenreId', 'genreName');

				populateSelect('#editPublisherNationality', nationalityList, 'nationalityId', 'nationalityName');
				populateSelect('#editLiteraryGenre', literaryGenreList, 'literaryGenreId', 'genreName');
			}
		},
		error: function(xhr) {
			let errorResponse;
			try {
				errorResponse = JSON.parse(xhr.responseText);
				console.error(`Error fetching select options (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
			} catch (e) {
				console.error("Unexpected error:", xhr.status, xhr.responseText);
			}
		}
	});
}

/*****************************************
 * TABLE HANDLING
 *****************************************/

function generateRow(publisher) {
	const userRole = sessionStorage.getItem('userRole');

	return `
		<tr>
			<td class="align-middle text-start">
				<span class="badge bg-body-tertiary text-body-emphasis border">${publisher.formattedPublisherId}</span>
			</td>
			<td class="align-middle text-start">${publisher.name}</td>
			<td class="align-middle text-start">
				<span class="badge bg-body-secondary text-body-emphasis border">${publisher.nationalityName}</span>
			</td>
			<td class="align-middle text-start">
				<span class="badge bg-body-secondary text-body-emphasis border">${publisher.literaryGenreName}</span>
			</td>
			<td class="align-middle text-center">
				${publisher.status === 'activo'
					? '<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle">Activo</span>'
					: '<span class="badge text-danger-emphasis bg-danger-subtle border border-danger-subtle">Inactivo</span>'}
			</td>
			<td class="align-middle text-center">
				${publisher.photoBase64 ?
					`<img src="${publisher.photoBase64}" alt="Foto de la Editorial" class="img-fluid rounded-circle" style="width: 23px; height: 23px;">` :
					`<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi-person-circle" viewBox="0 0 16 16">
						<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"></path>
						<path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"></path>
					</svg>`}
			</td>
            <td class="align-middle text-center">
				<div class="d-inline-flex gap-2">
					<button class="btn btn-sm btn-icon-hover" data-tooltip="tooltip" data-bs-placement="top" title="Detalles"
						data-bs-toggle="modal" data-bs-target="#detailsPublisherModal" data-id="${publisher.publisherId}" data-formatted-id="${publisher.formattedPublisherId}">
						<i class="bi bi-eye"></i>
					</button>
					${userRole === 'administrador' ?
						`<button class="btn btn-sm btn-icon-hover" data-tooltip="tooltip" data-bs-placement="top" title="Editar"
							data-bs-toggle="modal" data-bs-target="#editPublisherModal" data-id="${publisher.publisherId}" data-formatted-id="${publisher.formattedPublisherId}">
							<i class="bi bi-pencil"></i>
						</button>`
					: ''}
				</div>
			</td>
		</tr>
	`;
}

function addRowToTable(publisher) {
	var table = $('#publisherTable').DataTable();
	var rowHtml = generateRow(publisher);
	var $row = $(rowHtml);

	table.row.add($row).draw(false);

	initializeTooltips($row);
}

function loadPublishers() {
	toggleTableLoadingState('loading');

	let safetyTimer = setTimeout(function() {
		toggleTableLoadingState('loaded');
		$('#tableContainer').removeClass('d-none');
		$('#cardContainer').removeClass('h-100');
	}, 8000);

	$.ajax({
		url: 'PublisherServlet',
		type: 'GET',
		data: { type: 'list' },
		dataType: 'json',
		success: function(data) {
			clearTimeout(safetyTimer);

			var tableBody = $('#bodyPublishers');
			tableBody.empty();

			if (data && data.length > 0) {
				data.forEach(function(publisher) {
					var row = generateRow(publisher);
					tableBody.append(row);
				});

				initializeTooltips(tableBody);
			}

			if ($.fn.DataTable.isDataTable('#publisherTable')) {
				$('#publisherTable').DataTable().destroy();
			}

			let dataTable = setupDataTable('#publisherTable');

			if (data && data.length > 0) {
				$("#generatePDF, #generateExcel").prop("disabled", false);
			} else {
				$("#generatePDF, #generateExcel").prop("disabled", true);
			}

			dataTable.on('draw', function() {
				const filteredCount = dataTable.rows({ search: 'applied' }).count();
				const noDataMessage = $("#authorTable").find("td.dataTables_empty").length > 0;
				$("#generatePDF, #generateExcel").prop("disabled", filteredCount === 0 || noDataMessage);
			});

			$("#generatePDF").off("click").on("click", function() {
				generatePDF(dataTable);
			});

			$("#generateExcel").off("click").on("click", function() {
				generateExcel(dataTable);
			});
		},
		error: function(xhr) {
			let errorResponse;
			try {
				errorResponse = JSON.parse(xhr.responseText);
				console.error(`Error listing publisher data (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
				showToast('Hubo un error al listar los datos de las editoriales.', 'error');
			} catch (e) {
				console.error("Unexpected error:", xhr.status, xhr.responseText);
				showToast('Hubo un error inesperado.', 'error');
			}
			
			clearTimeout(safetyTimer);

			var tableBody = $('#bodyPublishers');
			tableBody.empty();

			if ($.fn.DataTable.isDataTable('#publisherTable')) {
				$('#publisherTable').DataTable().destroy();
			}

			setupDataTable('#publisherTable');
		}
	});
}

function updateRowInTable(publisher) {
	var table = $('#publisherTable').DataTable();

	var row = table.rows().nodes().to$().filter(function() {
		return $(this).find('td').eq(0).text().trim() === publisher.formattedPublisherId.toString();
	});

	if (row.length > 0) {
		row.find('td').eq(1).text(publisher.name);
		row.find('td').eq(2).find('span').text(publisher.nationalityName);
		row.find('td').eq(3).find('span').text(publisher.literaryGenreName);
		row.find('td').eq(4).html(publisher.status === 'activo'
			? '<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle">Activo</span>'
			: '<span class="badge text-danger-emphasis bg-danger-subtle border border-danger-subtle">Inactivo</span>');

		if (publisher.photoBase64 && publisher.photoBase64.trim() !== "") {
			row.find('td').eq(5).html(`<img src="${publisher.photoBase64}" alt="Foto de la Editorial" class="img-fluid rounded-circle" style="width: 23px; height: 23px;">`);
		} else {
			row.find('td').eq(5).html(`
				<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi-person-circle" viewBox="0 0 16 16">
					<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"></path>
					<path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"></path>
				</svg>
			`);
		}

		table.row(row).invalidate().draw(false);

		initializeTooltips(row);
	}
}

/*****************************************
 * FORM LOGIC
 *****************************************/

function handleAddPublisherForm() {
	let isFirstSubmit = true;

	$('#addPublisherModal').on('hidden.bs.modal', function() {
		isFirstSubmit = true;
		$('#addPublisherForm').data("submitted", false);
	});

	$('#addPublisherForm').on('input change', 'input, select', function() {
		if (!isFirstSubmit) {
			validateAddField($(this));
		}
	});

	$('#addPublisherForm').on('submit', function(event) {
		event.preventDefault();

		if ($(this).data("submitted") === true) {
			return;
		}
		$(this).data("submitted", true);

		if (isFirstSubmit) {
			isFirstSubmit = false;
		}

		var form = $(this)[0];
		var isValid = true;

		$(form).find('input, select').not('.bootstrap-select input[type="search"]').each(function() {
			const field = $(this);
			const valid = validateAddField(field);
			if (!valid) {
				isValid = false;
			}
		});

		if (isValid) {
			var formData = new FormData(this);

			var submitButton = $(this).find('[type="submit"]');
			submitButton.prop('disabled', true);
			$("#addPublisherSpinnerBtn").removeClass("d-none");
			$("#addPublisherIcon").addClass("d-none");

			if (cropper) {
				cropper.getCroppedCanvas({
					width: 460,
					height: 460
				}).toBlob(function(blob) {
					formData.set('addPublisherPhoto', blob, 'photo.jpg');
					sendAddForm(formData);
				}, 'image/jpeg', 0.7);
			} else {
				sendAddForm(formData);
			}

			function sendAddForm(formData) {
				formData.append('type', 'create');

				$.ajax({
					url: 'PublisherServlet',
					type: 'POST',
					data: formData,
					dataType: 'json',
					processData: false,
					contentType: false,
					success: function(response) {
						if (response && response.success) {
							addRowToTable(response.data);
							
							$('#addPublisherModal').modal('hide');
							showToast('Editorial agregada exitosamente.', 'success');
						} else {
							console.error(`Backend error (${response.errorType} - ${response.statusCode}):`, response.message);
							$('#addPublisherModal').modal('hide');
							showToast('Hubo un error al agregar la editorial.', 'error');
						}
					},
					error: function(xhr) {
						let errorResponse;
						try {
							errorResponse = JSON.parse(xhr.responseText);
							console.error(`Server error (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
							switch (xhr.status) {
								case 403:
									showToast('No tienes permisos para agregar editoriales.', 'warning');
									break;
								case 400:
									showToast('Solicitud inválida. Verifica los datos del formulario.', 'error');
									break;
								case 500:
									showToast('Error interno del servidor. Intenta más tarde.', 'error');
									break;
								default:
									showToast(errorResponse.message || 'Hubo un error al agregar la editorial.', 'error');
									break;
							}
						} catch (e) {
							console.error("Unexpected error:", xhr.status, xhr.responseText);
							showToast('Hubo un error inesperado.', 'error');
						}
						
						$('#addPublisherModal').modal('hide');
					},
					complete: function() {
						$("#addPublisherSpinnerBtn").addClass("d-none");
						$("#addPublisherIcon").removeClass("d-none");
						submitButton.prop('disabled', false);
					}
				});
			}
		} else {
			$(this).data("submitted", false);
		}
	});

	function validateAddField(field) {
		if (field.attr('type') === 'search' || field.is('#addPublisherWebsite') || field.is('#addPublisherAddress')) {
			return true;
		}

		var errorMessage = 'Este campo es obligatorio.';
		var isValid = true;

		// Default validation
		if (!field.val() || (field[0].checkValidity && !field[0].checkValidity())) {
			field.addClass('is-invalid');
			field.siblings('.invalid-feedback').html(errorMessage);
			isValid = false;
		} else {
			field.removeClass('is-invalid');
		}

		// Name validation
		if (field.is('#addPublisherName')) {
			const result = isValidText(field.val(), 'nombre');
			if (!result.valid) {
				isValid = false;
				errorMessage = result.message;
			}
		}

		// Foundation year validation
		if (field.is('#addFoundationYear')) {
			const result = isValidFoundationYear(field.val());
			if (!result.valid) {
				errorMessage = result.message;
				isValid = false;
			}
		}

		// Photo validation
		if (field.is('#addPublisherPhoto')) {
			const file = field[0].files[0];
			const result = isValidImageFile(file);

			if (!result.valid) {
				isValid = false;
				errorMessage = result.message;
			} else {
				field.removeClass('is-invalid');
				return true;
			}
		}

		// Select validation
		if (field.is('select')) {
			var container = field.closest('.bootstrap-select');
			container.toggleClass('is-invalid', field.hasClass('is-invalid'));
			container.siblings('.invalid-feedback').html(errorMessage);
		}

		if (!isValid) {
			field.addClass('is-invalid');
			field.siblings('.invalid-feedback').html(errorMessage).show();
		} else {
			field.removeClass('is-invalid');
			field.siblings('.invalid-feedback').hide();
		}

		return isValid;
	}
}

$('#addPublisherPhoto, #editPublisherPhoto').on('change', function() {
	validateImageFileUI($(this));
});

function handleEditPublisherForm() {
	let isFirstSubmit = true;

	$('#editPublisherModal').on('hidden.bs.modal', function() {
		isFirstSubmit = true;
		$('#editPublisherForm').data("submitted", false);
	});

	$('#editPublisherForm').on('input change', 'input, select', function() {
		if (!isFirstSubmit) {
			validateEditField($(this));
		}
	});

	$('#editPublisherForm').on('submit', function(event) {
		event.preventDefault();

		if ($(this).data("submitted") === true) {
			return;
		}
		$(this).data("submitted", true);

		if (isFirstSubmit) {
			isFirstSubmit = false;
		}

		var form = $(this)[0];
		var isValid = true;

		$(form).find('input, select').not('.bootstrap-select input[type="search"]').each(function() {
			const field = $(this);
			const valid = validateEditField(field);
			if (!valid) {
				isValid = false;
			}
		});

		if (isValid) {
			var formData = new FormData(this);

			var publisherId = $(this).data('publisherId');
			if (publisherId) {
				formData.append('publisherId', publisherId);
			}
			
			formData.append('deletePhoto', deletePhotoFlag);

			var submitButton = $(this).find('[type="submit"]');
			submitButton.prop('disabled', true);
			$("#editPublisherSpinnerBtn").removeClass("d-none");
			$("#editPublisherIcon").addClass("d-none");

			if (cropper) {
				cropper.getCroppedCanvas({
					width: 460,
					height: 460
				}).toBlob(function(blob) {
					formData.set('editPublisherPhoto', blob, 'photo.png');
					sendEditForm(formData);
				}, 'image/png');
			} else {
				sendEditForm(formData);
			}

			function sendEditForm(formData) {
				formData.append('type', 'update');

				$.ajax({
					url: 'PublisherServlet',
					type: 'POST',
					data: formData,
					dataType: 'json',
					processData: false,
					contentType: false,
					success: function(response) {
						if (response && response.success) {
							updateRowInTable(response.data);
							
							$('#editPublisherModal').modal('hide');
							showToast('Editorial actualizada exitosamente.', 'success');
						} else {
							console.error(`Backend error (${response.errorType} - ${response.statusCode}):`, response.message);
							$('#editPublisherModal').modal('hide');
							showToast('Hubo un error al actualizar la editorial.', 'error');
						}
					},
					error: function(xhr) {
						let errorResponse;
						try {
							errorResponse = JSON.parse(xhr.responseText);
							console.error(`Server error (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
							switch (xhr.status) {
								case 403:
									showToast('No tienes permisos para actualizar editoriales.', 'warning');
									break;
								case 400:
									showToast('Solicitud inválida. Verifica los datos del formulario.', 'error');
									break;
								case 500:
									showToast('Error interno del servidor. Intenta más tarde.', 'error');
									break;
								default:
									showToast(errorResponse.message || 'Hubo un error al actualizar la editorial.', 'error');
									break;
							}
						} catch (e) {
							console.error("Unexpected error:", xhr.status, xhr.responseText);
							showToast('Hubo un error inesperado.', 'error');
						}
						
						$('#editPublisherModal').modal('hide');
					},
					complete: function() {
						$("#editPublisherSpinnerBtn").addClass("d-none");
						$("#editPublisherIcon").removeClass("d-none");
						submitButton.prop('disabled', false);
					}
				});
			}
		} else {
			$(this).data("submitted", false);
		}
	});
}

function validateEditField(field) {
	if (field.attr('type') === 'search' || field.is('#editPublisherWebsite') || field.is('#editPublisherAddress')) {
		return true;
	}

	var errorMessage = 'Este campo es obligatorio.';
	var isValid = true;

	// Default validation
	if (!field.val() || (field[0].checkValidity && !field[0].checkValidity())) {
		field.addClass('is-invalid');
		field.siblings('.invalid-feedback').html(errorMessage);
		isValid = false;
	} else {
		field.removeClass('is-invalid');
	}
	
	// Name validation
	if (field.is('#editPublisherName')) {
		const result = isValidText(field.val(), 'nombre');
		if (!result.valid) {
			isValid = false;
			errorMessage = result.message;
		}
	}

	// Foundation year validation
	if (field.is('#editFoundationYear')) {
		const result = isValidFoundationYear(field.val());
		if (!result.valid) {
			errorMessage = result.message;
			isValid = false;
		}
	}

	// Photo validation
	if (field.is('#editPublisherPhoto')) {
		const file = field[0].files[0];
		const result = isValidImageFile(file);

		if (!result.valid) {
			isValid = false;
			errorMessage = result.message;
		} else {
			field.removeClass('is-invalid');
			return true;
		}
	}

	// Select validation
	if (field.is('select')) {
		var container = field.closest('.bootstrap-select');
		container.toggleClass('is-invalid', field.hasClass('is-invalid'));
		container.siblings('.invalid-feedback').html('Opción seleccionada inactiva o no existente.');
	}

	if (!isValid) {
		field.addClass('is-invalid');
		field.siblings('.invalid-feedback').html(errorMessage).show();
	} else {
		field.removeClass('is-invalid');
		field.siblings('.invalid-feedback').hide();
	}

	return isValid;
}

/*****************************************
 * MODAL MANAGEMENT
 *****************************************/

function loadModalData() {
	// Add Modal
	$(document).on('click', '[data-bs-target="#addPublisherModal"]', function() {
		populateSelect('#addPublisherNationality', nationalityList, 'nationalityId', 'nationalityName');
		$('#addPublisherNationality').selectpicker();
		
		populateSelect('#addLiteraryGenre', literaryGenreList, 'literaryGenreId', 'genreName');
		$('#addLiteraryGenre').selectpicker();

		$('#addPublisherStatus').selectpicker('destroy').empty().append(
			$('<option>', {
				value: 'activo',
				text: 'Activo'
			}),
			$('<option>', {
				value: 'inactivo',
				text: 'Inactivo'
			})
		);
		$('#addPublisherStatus').selectpicker();
		
		$('#defaultAddPhotoContainer').removeClass('d-none');
		$('#deleteAddPhotoBtn').addClass('d-none');

		$('#addPublisherForm')[0].reset();
		$('#addPublisherForm .is-invalid').removeClass('is-invalid');

		$('#cropperContainerAdd').addClass('d-none');

		if (cropper) {
			cropper.destroy();
			cropper = null;
		}
	});

	// Details Modal
	$(document).on('click', '[data-bs-target="#detailsPublisherModal"]', function() {
		var publisherId = $(this).data('id');
		$('#detailsPublisherModalID').text($(this).data('formatted-id'));
		
		$('#detailsPublisherSpinner').removeClass('d-none');
		$('#detailsPublisherContent').addClass('d-none');

		$.ajax({
			url: 'PublisherServlet',
			type: 'GET',
			data: { type: 'details', publisherId: publisherId },
			dataType: 'json',
			success: function(data) {
				$('#detailsPublisherID').text(data.formattedPublisherId);
				$('#detailsPublisherName').text(data.name);
				$('#detailsPublisherNationality').text(data.nationalityName);
				$('#detailsPublisherGenre').text(data.literaryGenreName);
				$('#detailsPublisherYear').text(data.foundationYear);
				$('#detailsPublisherWebsite a').attr('href', data.website).text(data.website);
				$('#detailsPublisherAddress').text(data.address);
				$('#detailsPublisherStatus').html(
					data.status === 'activo'
						? '<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle">Activo</span>'
						: '<span class="badge text-danger-emphasis bg-danger-subtle border border-danger-subtle">Inactivo</span>'
				);
				if (data.photoBase64) {
					$('#detailsPublisherImg').attr('src', data.photoBase64).removeClass('d-none');
					$('#detailsPublisherSvg').addClass('d-none');
				} else {
					$('#detailsPublisherImg').addClass('d-none');
					$('#detailsPublisherSvg').removeClass('d-none');
				}
				
				$('#detailsPublisherSpinner').addClass('d-none');
				$('#detailsPublisherContent').removeClass('d-none');
			},
			error: function(xhr) {
				let errorResponse;
				try {
					errorResponse = JSON.parse(xhr.responseText);
					console.error(`Error loading publisher details (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
					showToast('Hubo un error al cargar los detalles de la editorial.', 'error');
				} catch (e) {
					console.error("Unexpected error:", xhr.status, xhr.responseText);
					showToast('Hubo un error inesperado.', 'error');
				}
				$('#detailsPublisherModal').modal('hide');
			}
		});
	});

	// Edit Modal
	$(document).on('click', '[data-bs-target="#editPublisherModal"]', function() {
		var publisherId = $(this).data('id');
		$('#editPublisherModalID').text($(this).data('formatted-id'));
		
		$('#editPublisherSpinner').removeClass('d-none');
		$('#editPublisherForm').addClass('d-none');
		$('#editPublisherBtn').prop('disabled', true);

		$.ajax({
			url: 'PublisherServlet',
			type: 'GET',
			data: { type: 'details', publisherId: publisherId },
			dataType: 'json',
			success: function(data) {
				$('#editPublisherForm').data('publisherId', data.publisherId);
				$('#editPublisherName').val(data.name);
				
				populateSelect('#editPublisherNationality', nationalityList, 'nationalityId', 'nationalityName');
				$('#editPublisherNationality').val(data.nationalityId);
				$('#editPublisherNationality').selectpicker();

				populateSelect('#editLiteraryGenre', literaryGenreList, 'literaryGenreId', 'genreName');
				$('#editLiteraryGenre').val(data.literaryGenreId);
				$('#editLiteraryGenre').selectpicker();

				$('#editFoundationYear').val(data.foundationYear);
				$('#editPublisherWebsite').val(data.website);
				$('#editPublisherAddress').val(data.address);

				$('#editPublisherStatus').selectpicker('destroy').empty().append(
					$('<option>', {
						value: 'activo',
						text: 'Activo'
					}),
					$('<option>', {
						value: 'inactivo',
						text: 'Inactivo'
					})
				);
				$('#editPublisherStatus').val(data.status);
				$('#editPublisherStatus').selectpicker();
				
				updateEditImageContainer(data.photoBase64);

				$('#editPublisherForm .is-invalid').removeClass('is-invalid');

				placeholderColorEditSelect();

				$('#editPublisherForm').find('select').each(function() {
					validateEditField($(this), true);
				});

				$('#editPublisherPhoto').val('');
				
				$('#editPublisherSpinner').addClass('d-none');
				$('#editPublisherForm').removeClass('d-none');
				$('#editPublisherBtn').prop('disabled', false);
			},
			error: function(xhr) {
				let errorResponse;
				try {
					errorResponse = JSON.parse(xhr.responseText);
					console.error(`Error loading publisher details for editing (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
					showToast('Hubo un error al cargar los datos de la editorial.', 'error');
				} catch (e) {
					console.error("Unexpected error:", xhr.status, xhr.responseText);
					showToast('Hubo un error inesperado.', 'error');
				}
				$('#editPublisherModal').modal('hide');
			}
		});

		$('#cropperContainerEdit').addClass('d-none');

		if (cropper) {
			cropper.destroy();
			cropper = null;
		}
	});
}

function updateEditImageContainer(photoBase64) {
	const $editImageContainer = $('#currentEditPhotoContainer');
	const $deleteEditPhotoBtn = $('#deleteEditPhotoBtn');

	$editImageContainer.empty();

	if (photoBase64) {
		$editImageContainer.html(
			`<img src="${photoBase64}" class="img-fluid rounded-circle" alt="Foto de la Editorial">`
		);
		$deleteEditPhotoBtn.removeClass('d-none');
	} else {
		$editImageContainer.html(
			`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" fill="currentColor" class="bi-person-circle" viewBox="0 0 16 16">
				<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
				<path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
            </svg>`
		);
		$deleteEditPhotoBtn.addClass('d-none');
	}
	$editImageContainer.removeClass('d-none');
}

$('#deleteAddPhotoBtn').on('click', function() {
	$(this).addClass('d-none');

	if (cropper) {
		cropper.destroy();
		cropper = null;
	}
	$('#cropperContainerAdd').addClass('d-none');
	$('#addPublisherPhoto').val('');
	$('#defaultAddPhotoContainer').removeClass('d-none');
});

$('#deleteEditPhotoBtn').on('click', function() {
	deletePhotoFlag = true;
	updateEditImageContainer(null);

	$(this).addClass('d-none');

	if (cropper) {
		cropper.destroy();
		cropper = null;
	}
	$('#cropperContainerEdit').addClass('d-none');
	$('#editPublisherPhoto').val('');
});

let cropper;
const $cropperContainerAdd = $('#cropperContainerAdd');
const $imageToCropAdd = $('#imageToCropAdd');
const $cropperContainerEdit = $('#cropperContainerEdit');
const $imageToCropEdit = $('#imageToCropEdit');

$('#addPublisherPhoto, #editPublisherPhoto').on('change', function() {
	const file = this.files[0];
	deletePhotoFlag = false;
	
	$('#deleteAddPhotoBtn').addClass('d-none');
	$('#deleteEditPhotoBtn').addClass('d-none');

	if (file && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
		$('#defaultAddPhotoContainer').addClass('d-none');
		$('#currentEditPhotoContainer').addClass('d-none');

		$('#deleteAddPhotoBtn').removeClass('d-none');
		$('#deleteEditPhotoBtn').removeClass('d-none');

		let $container, $image;
		if ($(this).is('#addPublisherPhoto')) {
			$container = $cropperContainerAdd;
			$image = $imageToCropAdd;
		} else {
			$container = $cropperContainerEdit;
			$image = $imageToCropEdit;
		}
		initializeCropper(file, $container, $image, cropper);
	} else {
		if ($(this).is('#addPublisherPhoto')) {
			$cropperContainerAdd.addClass('d-none');
			if (cropper) {
				cropper.destroy();
				cropper = null;
			}
			$('#defaultAddPhotoContainer').removeClass('d-none');
		} else {
			$cropperContainerEdit.addClass('d-none');
			if (cropper) {
				cropper.destroy();
				cropper = null;
			}
			$('#currentEditPhotoContainer').removeClass('d-none');
		}

		if ($('#currentEditPhotoContainer').find('img').length > 0) {
			$('#deleteEditPhotoBtn').removeClass('d-none');
		}
	}
});

function generatePDF(publisherTable) {
	const pdfBtn = $('#generatePDF');
	toggleButtonLoading(pdfBtn, true);
	
	let hasWarnings = false;
	
	try {
		const { jsPDF } = window.jspdf;
		const doc = new jsPDF("p", "mm", "a4");
		const logoUrl = '/images/bookstudio-logo-no-bg.png';
	
		const currentDate = new Date();
		const fecha = currentDate.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});
		const hora = currentDate.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	
		const pageWidth = doc.internal.pageSize.getWidth();
		const margin = 15;
		const topMargin = 5;
		
		try {
			doc.addImage(logoUrl, 'PNG', margin, topMargin, 30, 30);
		} catch (imgError) {
			console.warn("Logo not available:", imgError);
			showToast("No se pudo cargar el logo. Se continuará sin él.", "warning");
			hasWarnings = true;
		}
	
		doc.setFont("helvetica", "bold");
		doc.setFontSize(18);
		doc.setTextColor(40);
		doc.text("Lista de editoriales", pageWidth / 2, topMargin + 18, { align: "center" });
	
		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.text(`Fecha: ${fecha}`, pageWidth - margin, topMargin + 15, { align: "right" });
		doc.text(`Hora: ${hora}`, pageWidth - margin, topMargin + 20, { align: "right" });
	
		const data = publisherTable.rows({ search: 'applied' }).nodes().toArray().map(row => {
			let estado = row.cells[4].innerText.trim();
			estado = estado.includes("Activo") ? "Activo" : "Inactivo";
	
			return [
				row.cells[0].innerText.trim(),
				row.cells[1].innerText.trim(),
				row.cells[2].innerText.trim(),
				row.cells[3].innerText.trim(),
				estado
			];
		});
	
		doc.autoTable({
			startY: topMargin + 35,
			margin: { left: margin, right: margin },
			head: [['Código', 'Nombre', 'Nacionalidad', 'Género literario', 'Estado']],
			body: data,
			theme: 'grid',
			headStyles: {
				fillColor: [0, 0, 0],
				textColor: 255,
				fontStyle: 'bold',
				halign: 'left'
			},
			bodyStyles: {
				font: "helvetica",
				fontSize: 10,
				halign: 'left'
			},
			columnStyles: {
				0: { cellWidth: 20 },
				1: { cellWidth: 50 },
				2: { cellWidth: 30 },
				3: { cellWidth: 50 },
				4: { cellWidth: 30 }
			},
			didParseCell: function(data) {
				if (data.section === 'body' && data.column.index === 4) {
					data.cell.styles.textColor = data.cell.raw === "Activo" ? [0, 128, 0] : [255, 0, 0];
				}
			}
		});
	
		const filename = `Lista_de_editoriales_bookstudio_${fecha.replace(/\s+/g, '_')}.pdf`;
	
		const pdfBlob = doc.output('blob');
		const blobUrl = URL.createObjectURL(pdfBlob);
		const link = document.createElement('a');
		link.href = blobUrl;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		
		if (!hasWarnings) {
			showToast("PDF generado exitosamente.", "success");
		}
	} catch (error) {
		console.error("Error generating PDF file:", error);
		showToast("Ocurrió un error al generar el PDF. Inténtalo nuevamente.", "error");
	} finally {
		toggleButtonLoading(pdfBtn, false);
	}
}

function generateExcel(publisherTable) {
	const excelBtn = $('#generateExcel');
	toggleButtonLoading(excelBtn, true);
	
	try {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Editoriales');
	
		const currentDate = new Date();
		const dateStr = currentDate.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});
		const timeStr = currentDate.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	
		worksheet.mergeCells('A1:E1');
		const titleCell = worksheet.getCell('A1');
		titleCell.value = 'Lista de editoriales - BookStudio';
		titleCell.font = { name: 'Arial', size: 14, bold: true };
		titleCell.alignment = { horizontal: 'center' };
	
		worksheet.mergeCells('A2:E2');
		const dateTimeCell = worksheet.getCell('A2');
		dateTimeCell.value = `Fecha: ${dateStr}  Hora: ${timeStr}`;
		dateTimeCell.alignment = { horizontal: 'center' };
	
		worksheet.columns = [
			{ key: 'id', width: 10 },
			{ key: 'nombre', width: 30 },
			{ key: 'nacionalidad', width: 25 },
			{ key: 'genero', width: 30 },
			{ key: 'estado', width: 15 }
		];
	
		const headerRow = worksheet.getRow(4);
		headerRow.values = ['Código', 'Nombre', 'Nacionalidad', 'Género literario', 'Estado'];
		headerRow.eachCell((cell) => {
			cell.font = { bold: true, color: { argb: 'FFFFFF' } };
			cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '000000' } };
			cell.alignment = { horizontal: 'left', vertical: 'middle' };
			cell.border = {
				top: { style: 'thin', color: { argb: 'FFFFFF' } },
				bottom: { style: 'thin', color: { argb: 'FFFFFF' } },
				left: { style: 'thin', color: { argb: 'FFFFFF' } },
				right: { style: 'thin', color: { argb: 'FFFFFF' } }
			};
		});
	
		const data = publisherTable.rows({ search: 'applied' }).nodes().toArray().map(row => {
			let estado = row.cells[4].innerText.trim();
			estado = estado.includes("Activo") ? "Activo" : "Inactivo";
	
			return {
				id: row.cells[0].innerText.trim(),
				nombre: row.cells[1].innerText.trim(),
				nacionalidad: row.cells[2].innerText.trim(),
				genero: row.cells[3].innerText.trim(),
				estado: estado
			};
		});
	
		data.forEach((item) => {
			const row = worksheet.addRow(item);
			const estadoCell = row.getCell(5);
			if (estadoCell.value === "Activo") {
				estadoCell.font = { color: { argb: '008000' } };
				estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6F2E6' } };
			} else {
				estadoCell.font = { color: { argb: 'FF0000' } };
				estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6' } };
			}
		});
	
		const filename = `Lista_de_editoriales_bookstudio_${dateStr.replace(/\s+/g, '_')}.xlsx`;
	
		workbook.xlsx.writeBuffer().then(buffer => {
			const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = filename;
			link.click();
	
			showToast("Excel generado exitosamente.", "success");
		}).catch(error => {
			console.error("Error generating Excel file:", error);
			showToast("Ocurrió un error al generar el Excel.", "error");
		}).finally(() => {
			toggleButtonLoading(excelBtn, false);
		});
	} catch (error) {
		console.error("General error while generating Excel file:", error);
		showToast("Ocurrió un error inesperado al generar el Excel.", "error");
		toggleButtonLoading(excelBtn, false);
	}
}

/*****************************************
 * INITIALIZATION
 *****************************************/

$(document).ready(function() {
	loadPublishers();
	handleAddPublisherForm();
	handleEditPublisherForm();
	loadModalData();
	populateSelectOptions();
	$('.selectpicker').selectpicker();
	setupBootstrapSelectDropdownStyles();
	placeholderColorSelect();
});