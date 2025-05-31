/**
 * books.js
 * 
 * Manages the initialization, data loading, and configuration of the books table,  
 * as well as handling modals for creating, viewing, and editing book details.
 * Also supports logical delete (status change) operations on book records.
 * Utilizes AJAX for CRUD operations on book data.
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
  placeholderColorDateInput,
  setupBootstrapSelectDropdownStyles,
  initializeTooltips
} from '../../utils/ui/index.js';

import { toggleTableLoadingState, setupDataTable } from '../../utils/tables/index.js';

import {
  isValidText,
  isValidTotalCopies,
  isValidTotalCopiesInRange,
  isValidReleaseDate
} from '../../utils/validators/index.js';

/*****************************************
 * GLOBAL VARIABLES AND HELPER FUNCTIONS
 *****************************************/

// Global list of authors, publishers, courses, and genres for the selectpickers
var authorList = [];
var publisherList = [];
var courseList = [];
var genreList = [];

function populateSelectOptions() {
	$.ajax({
		url: 'BookServlet',
		type: 'GET',
		data: { type: 'populateSelects' },
		dataType: 'json',
		success: function(data, xhr) {
			if (xhr.status === 204) {
				console.warn("No data found for select options.");
				return;
			}
			
			if (data) {
				authorList = data.authors;
				publisherList = data.publishers;
				courseList = data.courses;
				genreList = data.genres;

				populateSelect('#addBookAuthor', authorList, 'authorId', 'name', 'formattedAuthorId');
				populateSelect('#addBookPublisher', publisherList, 'publisherId', 'name', 'formattedPublisherId');
				populateSelect('#addBookCourse', courseList, 'courseId', 'name', 'formattedCourseId');
				populateSelect('#addBookGenre', genreList, 'genreId', 'genreName');

				populateSelect('#editBookAuthor', authorList, 'authorId', 'name', 'formattedAuthorId');
				populateSelect('#editBookPublisher', publisherList, 'publisherId', 'name', 'formattedPublisherId');
				populateSelect('#editBookCourse', courseList, 'courseId', 'name', 'formattedCourseId');
				populateSelect('#editBookGenre', genreList, 'genreId', 'genreName');
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

function generateRow(book) {
	const userRole = sessionStorage.getItem('userRole');

	return `
		<tr>
			<td class="align-middle text-start">
				<span class="badge bg-body-tertiary text-body-emphasis border">${book.formattedBookId}</span>
			</td>
			<td class="align-middle text-start">${book.title}</td>
			<td class="align-middle text-center">
				<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle">${book.availableCopies}</span>
			</td>
			<td class="align-middle text-center">
				<span class="badge text-warning-emphasis bg-warning-subtle border border-warning-subtle">${book.loanedCopies}</span>
			</td>
			<td class="align-middle text-start">
				${book.authorName}
				<span class="badge bg-body-tertiary text-body-emphasis border ms-1">${book.formattedAuthorId}</span>
			</td>
			<td class="align-middle text-start">
				${book.publisherName}
				<span class="badge bg-body-tertiary text-body-emphasis border ms-1">${book.formattedPublisherId}</span>
			</td>
			<td class="align-middle text-center">
				${book.status === 'activo'
					? '<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle">Activo</span>'
					: '<span class="badge text-danger-emphasis bg-danger-subtle border border-danger-subtle">Inactivo</span>'}
			</td>
			<td class="align-middle text-center">
				<div class="d-inline-flex gap-2">
					<button class="btn btn-sm btn-icon-hover" data-tooltip="tooltip" data-bs-placement="top" title="Detalles"
						data-bs-toggle="modal" data-bs-target="#detailsBookModal" data-id="${book.bookId}" data-formatted-id="${book.formattedBookId}">
						<i class="bi bi-eye"></i>
					</button>
					${userRole === 'administrador' ?
						`<button class="btn btn-sm btn-icon-hover" data-tooltip="tooltip" data-bs-placement="top" title="Editar"
							data-bs-toggle="modal" data-bs-target="#editBookModal" data-id="${book.bookId}" data-formatted-id="${book.formattedBookId}">
							<i class="bi bi-pencil"></i>
						</button>`
					: ''}
				</div>
			</td>
		</tr>
	`;
}

function addRowToTable(book) {
	var table = $('#bookTable').DataTable();
	var rowHtml = generateRow(book);
	var $row = $(rowHtml);

	table.row.add($row).draw(false);

	initializeTooltips($row);
}

function loadBooks() {
	toggleTableLoadingState('loading');

	let safetyTimer = setTimeout(function() {
		toggleTableLoadingState('loaded');
		$('#tableContainer').removeClass('d-none');
		$('#cardContainer').removeClass('h-100');
	}, 8000);

	$.ajax({
		url: 'BookServlet',
		type: 'GET',
		data: { type: 'list' },
		dataType: 'json',
		success: function(data) {
			clearTimeout(safetyTimer);

			var tableBody = $('#bodyBooks');
			tableBody.empty();

			if (data && data.length > 0) {
				data.forEach(function(book) {
					var row = generateRow(book);
					tableBody.append(row);
				});

				initializeTooltips(tableBody);
			}

			if ($.fn.DataTable.isDataTable('#bookTable')) {
				$('#bookTable').DataTable().destroy();
			}

			let dataTable = setupDataTable('#bookTable');

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
				console.error(`Error listing book data (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
				showToast('Hubo un error al listar los datos de los libros.', 'error');
			} catch (e) {
				console.error("Unexpected error:", xhr.status, xhr.responseText);
				showToast('Hubo un error inesperado.', 'error');
			}
			
			clearTimeout(safetyTimer);

			var tableBody = $('#bodyBooks');
			tableBody.empty();

			if ($.fn.DataTable.isDataTable('#bookTable')) {
				$('#bookTable').DataTable().destroy();
			}

			setupDataTable('#bookTable');
		}
	});
}

function updateRowInTable(book) {
	var table = $('#bookTable').DataTable();

	var row = table.rows().nodes().to$().filter(function() {
		return $(this).find('td').eq(0).text().trim() === book.formattedBookId.toString();
	});

	if (row.length > 0) {
		row.find('td').eq(1).text(book.title);
		row.find('td').eq(2).html(`
			<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle">${book.availableCopies}</span>
		`);
		row.find('td').eq(3).html(`
			<span class="badge text-warning-emphasis bg-warning-subtle border border-warning-subtle">${book.loanedCopies}</span>
		`);
		row.find('td').eq(4).html(`
			${book.authorName}
			<span class="badge bg-body-tertiary text-body-emphasis border ms-1">${book.formattedAuthorId}</span>
		`);
		row.find('td').eq(5).html(`
			${book.publisherName}
			<span class="badge bg-body-tertiary text-body-emphasis border ms-1">${book.formattedPublisherId}</span>
		`);
		row.find('td').eq(6).html(book.status === 'activo'
			? '<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle">Activo</span>'
			: '<span class="badge text-danger-emphasis bg-danger-subtle border border-danger-subtle">Inactivo</span>');

		table.row(row).invalidate().draw(false);

		initializeTooltips(row);
	}
}

/*****************************************
 * FORM LOGIC
 *****************************************/

function handleAddBookForm() {
	let isFirstSubmit = true;

	$('#addBookModal').on('hidden.bs.modal', function() {
		isFirstSubmit = true;
		$('#addBookForm').data("submitted", false);
	});

	$('#addBookForm').on('input change', 'input, select', function() {
		if (!isFirstSubmit) {
			validateAddField($(this));
		}
	});

	$('#addBookForm').on('submit', function(event) {
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
			var data = $('#addBookForm').serialize() + '&type=create';

			var submitButton = $(this).find('[type="submit"]');
			submitButton.prop('disabled', true);
			$("#addBookSpinnerBtn").removeClass("d-none");
			$("#addBookIcon").addClass("d-none");

			$.ajax({
				url: 'BookServlet',
				type: 'POST',
				data: data,
				dataType: 'json',
				success: function(response) {
					if (response && response.success) {
						addRowToTable(response.data);
						$('#addBookModal').modal('hide');
						showToast('Libro agregado exitosamente.', 'success');
					} else {
						console.error(`Backend error (${response.errorType} - ${response.statusCode}):`, response.message);
						$('#addBookModal').modal('hide');
						showToast('Hubo un error al agregar el libro.', 'error');
					}
				},
				error: function(xhr) {
					let errorResponse;
					try {
						errorResponse = JSON.parse(xhr.responseText);
						console.error(`Server error (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
						switch (xhr.status) {
							case 403:
								showToast('No tienes permisos para agregar libros.', 'warning');
								break;
							case 400:
								showToast('Solicitud inválida. Verifica los datos del formulario.', 'error');
								break;
							case 500:
								showToast('Error interno del servidor. Intenta más tarde.', 'error');
								break;
							default:
								showToast(errorResponse.message || 'Hubo un error al agregar el libro.', 'error');
								break;
						}
					} catch (e) {
						console.error("Unexpected error:", xhr.status, xhr.responseText);
						showToast('Hubo un error inesperado.', 'error');
					}
					
					$('#addBookModal').modal('hide');
				},
				complete: function() {
					$("#addBookSpinnerBtn").addClass("d-none");
					$("#addBookIcon").removeClass("d-none");
					submitButton.prop('disabled', false);
				}
			});
		} else {
			$(this).data("submitted", false);
		}
	});

	function validateAddField(field) {
		if (field.attr('type') === 'search') {
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

		// Title validation
		if (field.is('#addBookTitle')) {
			const result = isValidText(field.val(), 'título');
			if (!result.valid) {
				isValid = false;
				errorMessage = result.message;
			}
		}

		// Total copies validation
		if (field.is('#addBookTotalCopies')) {
			const result = isValidTotalCopies(parseInt(field.val(), 10));
			if (!result.valid) {
				isValid = false;
				errorMessage = result.message;
			}
		}

		// Release date validation
		if (field.is('#addReleaseDate')) {
			const result = isValidReleaseDate(field.val());
			if (!result.valid) {
				isValid = false;
				errorMessage = result.message;
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

function handleEditBookForm() {
	let isFirstSubmit = true;

	$('#editBookModal').on('hidden.bs.modal', function() {
		isFirstSubmit = true;
		$('#editBookForm').data("submitted", false);
	});

	$('#editBookForm').on('input change', 'input, select', function() {
		if (!isFirstSubmit) {
			validateEditField($(this));
		}
	});

	$('#editBookForm').on('submit', function(event) {
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
			var data = $(this).serialize() + '&type=update';

			var bookId = $(this).data('bookId');
			if (bookId) {
				data += '&bookId=' + encodeURIComponent(bookId);
			}

			var submitButton = $(this).find('[type="submit"]');
			submitButton.prop('disabled', true);
			$("#editBookSpinnerBtn").removeClass("d-none");
			$("#editBookIcon").addClass("d-none");

			$.ajax({
				url: 'BookServlet',
				type: 'POST',
				data: data,
				dataType: 'json',
				success: function(response) {
					if (response && response.success) {
						updateRowInTable(response.data);
						
						$('#editBookModal').modal('hide');
						showToast('Libro actualizado exitosamente.', 'success');
					} else {
						console.error(`Backend error (${response.errorType} - ${response.statusCode}):`, response.message);
						$('#editBookModal').modal('hide');
						showToast('Hubo un error al actualizar el libro.', 'error');
					}
				},
				error: function(xhr) {
					let errorResponse;
					try {
						errorResponse = JSON.parse(xhr.responseText);
						console.error(`Server error (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
						switch (xhr.status) {
							case 403:
								showToast('No tienes permisos para actualizar libros.', 'warning');
								break;
							case 400:
								showToast('Solicitud inválida. Verifica los datos del formulario.', 'error');
								break;
							case 500:
								showToast('Error interno del servidor. Intenta más tarde.', 'error');
								break;
							default:
								showToast(errorResponse.message || 'Hubo un error al actualizar el libro.', 'error');
								break;
						}
					} catch (e) {
						console.error("Unexpected error:", xhr.status, xhr.responseText);
						showToast('Hubo un error inesperado.', 'error');
					}
					
					$('#editBookModal').modal('hide');
				},
				complete: function() {
					$("#editBookSpinnerBtn").addClass("d-none");
					$("#editBookIcon").removeClass("d-none");
					submitButton.prop('disabled', false);
				}
			});
		} else {
			$(this).data("submitted", false);
		}
	});
}

function validateEditField(field) {
	if (field.attr('type') === 'search') {
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
	
	// Title validation
	if (field.is('#editBookTitle')) {
		const result = isValidText(field.val(), 'título');
		if (!result.valid) {
			isValid = false;
			errorMessage = result.message;
		}
	}

	// Total copies validation
	if (field.is('#editBookTotalCopies')) {
		const copies = parseInt(field.val(), 10);
		const minCopies = parseInt(field.attr('min'), 10);
		const result = isValidTotalCopiesInRange(copies, minCopies, 1000);
		if (!result.valid) {
			isValid = false;
			errorMessage = result.message;
		}
	}

	// Release date validation
	if (field.is('#editReleaseDate')) {
		const result = isValidReleaseDate(field.val());
		if (!result.valid) {
			isValid = false;
			errorMessage = result.message;
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
	$(document).on('click', '[data-bs-target="#addBookModal"]', function() {
		populateSelect('#addBookAuthor', authorList, 'authorId', 'name', 'formattedAuthorId');
		$('#addBookAuthor').selectpicker();

		populateSelect('#addBookPublisher', publisherList, 'publisherId', 'name', 'formattedPublisherId');
		$('#addBookPublisher').selectpicker();

		populateSelect('#addBookCourse', courseList, 'courseId', 'name', 'formattedCourseId');
		$('#addBookCourse').selectpicker();
		
		const today = new Date();
		const peruDateStr = today.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
		$('#addReleaseDate').attr('max', peruDateStr);

		populateSelect('#addBookGenre', genreList, 'genreId', 'genreName');
		$('#addBookGenre').selectpicker();

		$('#addBookStatus').selectpicker('destroy').empty().append(
			$('<option>', {
				value: 'activo',
				text: 'Activo'
			}),
			$('<option>', {
				value: 'inactivo',
				text: 'Inactivo'
			})
		);
		$('#addBookStatus').selectpicker();

		$('#addBookForm')[0].reset();
		$('#addBookForm .is-invalid').removeClass('is-invalid');

		placeholderColorDateInput();
	});

	// Details Modal
	$(document).on('click', '[data-bs-target="#detailsBookModal"]', function() {
		var bookId = $(this).data('id');
		$('#detailsBookModalID').text($(this).data('formatted-id'));

		$('#detailsBookSpinner').removeClass('d-none');
		$('#detailsBookContent').addClass('d-none');
		
		$.ajax({
			url: 'BookServlet',
			type: 'GET',
			data: { type: 'details', bookId: bookId },
			dataType: 'json',
			success: function(data) {				
				$('#detailsBookID').text(data.formattedBookId);
				$('#detailsBookTitle').text(data.title);
				$('#detailsBookAvaibleCopies').text(data.availableCopies);
				$('#detailsBookLoanedCopies').text(data.loanedCopies);
				
				$('#detailsBookAuthor').html(`
					${data.authorName}
					<span class="badge bg-body-tertiary text-body-emphasis border ms-1">${data.formattedAuthorId}</span>
				`);
				$('#detailsBookPublisher').html(`
					${data.publisherName}
					<span class="badge bg-body-tertiary text-body-emphasis border ms-1">${data.formattedPublisherId}</span>
				`);
				$('#detailsBookCourse').html(`
					${data.courseName}
					<span class="badge bg-body-tertiary text-body-emphasis border ms-1">${data.formattedCourseId}</span>
				`);
				
				$('#detailsReleaseDate').text(moment(data.releaseDate).format('DD MMM YYYY'));
				$('#detailsBookGenre').text(data.genreName);
				$('#detailsBookStatus').html(
					data.status === 'activo'
						? '<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle">Activo</span>'
						: '<span class="badge text-danger-emphasis bg-danger-subtle border border-danger-subtle">Inactivo</span>'
				);
				
				$('#detailsBookSpinner').addClass('d-none');
				$('#detailsBookContent').removeClass('d-none');
			},
			error: function(xhr) {
				let errorResponse;
				try {
					errorResponse = JSON.parse(xhr.responseText);
					console.error(`Error loading book details (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
					showToast('Hubo un error al cargar los detalles del libro.', 'error');
				} catch (e) {
					console.error("Unexpected error:", xhr.status, xhr.responseText);
					showToast('Hubo un error inesperado.', 'error');
				}
				$('#detailsBookModal').modal('hide');
			}
		});
	});

	// Edit Modal
	$(document).on('click', '[data-bs-target="#editBookModal"]', function() {
		var bookId = $(this).data('id');
		$('#editBookModalID').text($(this).data('formatted-id'));
		
		$('#editBookSpinner').removeClass('d-none');
		$('#editBookForm').addClass('d-none');
		$('#editBookBtn').prop('disabled', true);
		
		$.ajax({
			url: 'BookServlet',
			type: 'GET',
			data: { type: 'details', bookId: bookId },
			dataType: 'json',
			success: function(data) {
				$('#editBookForm').data('bookId', data.bookId);
				$('#editBookTitle').val(data.title);
				$('#editBookTotalCopies').val(data.totalCopies);
				$('#editBookTotalCopies').attr('min', Math.max(1, data.loanedCopies));
				
				populateSelect('#editBookAuthor', authorList, 'authorId', 'name', 'formattedAuthorId');
				$('#editBookAuthor').val(data.authorId);
				$('#editBookAuthor').selectpicker();

				populateSelect('#editBookPublisher', publisherList, 'publisherId', 'name', 'formattedPublisherId');
				$('#editBookPublisher').val(data.publisherId);
				$('#editBookPublisher').selectpicker();

				populateSelect('#editBookCourse', courseList, 'courseId', 'name', 'formattedCourseId');
				$('#editBookCourse').val(data.courseId);
				$('#editBookCourse').selectpicker();

				populateSelect('#editBookGenre', genreList, 'genreId', 'genreName');
				$('#editBookGenre').val(data.genreId);
				$('#editBookGenre').selectpicker();

				$('#editReleaseDate').val(moment(data.releaseDate).format('YYYY-MM-DD'));
				
				const today = new Date();
				const peruDateStr = today.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
				$('#editReleaseDate').attr('max', peruDateStr);
				
				$('#editBookStatus').selectpicker('destroy').empty().append(
					$('<option>', {
						value: 'activo',
						text: 'Activo'
					}),
					$('<option>', {
						value: 'inactivo',
						text: 'Inactivo'
					})
				);
				$('#editBookStatus').val(data.status);
				$('#editBookStatus').selectpicker();

				$('#editBookForm .is-invalid').removeClass('is-invalid');

				placeholderColorEditSelect();
				placeholderColorDateInput();

				$('#editBookForm').find('select').each(function() {
					validateEditField($(this), true);
				});
				
				$('#editBookSpinner').addClass('d-none');
				$('#editBookForm').removeClass('d-none');
				$('#editBookBtn').prop('disabled', false);
			},
			error: function(xhr) {
				let errorResponse;
				try {
					errorResponse = JSON.parse(xhr.responseText);
					console.error(`Error loading book details for editing (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
					showToast('Hubo un error al cargar los datos del libro.', 'error');
				} catch (e) {
					console.error("Unexpected error:", xhr.status, xhr.responseText);
					showToast('Hubo un error inesperado.', 'error');
				}
				$('#editBookModal').modal('hide');
			}
		});
	});
}

function formatStrings(str) {
  const parts = str?.split(/\s+|\n/).filter(Boolean) || [];
  return parts.length > 1
    ? parts.slice(0, -1).join(' ') + ' - ' + parts.at(-1)
    : parts[0] || '';
}

function applyTextColorByColumnPDF(data) {
	const col = data.column.index;
	const value = data.cell.raw;

	const colorMap = {
		2: [0, 128, 0],
		3: [255, 0, 0],
		6: value === "Activo" ? [0, 128, 0] : [255, 0, 0]
	};

	if (colorMap.hasOwnProperty(col)) {
		data.cell.styles.textColor = colorMap[col];
	}
}

function generatePDF(dataTable) {
	const pdfBtn = $('#generatePDF');
	toggleButtonLoading(pdfBtn, true);
	
	let hasWarnings = false;
	
	try {
		const { jsPDF } = window.jspdf;
		const doc = new jsPDF("l", "mm", "a4");
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
		const margin = 10;
		const topMargin = 5;
	
		try {
			doc.addImage(logoUrl, 'PNG', margin, topMargin - 5, 30, 30);
		} catch (imgError) {
			console.warn("Logo not available:", imgError);
			showToast("No se pudo cargar el logo. Se continuará sin él.", "warning");
			hasWarnings = true;
		}
	
		doc.setFont("helvetica", "bold");
		doc.setFontSize(14);
		doc.text("Lista de libros", pageWidth / 2, topMargin + 13, { align: "center" });
	
		doc.setFont("helvetica", "normal");
		doc.setFontSize(8);
		doc.text(`Fecha: ${fecha}`, pageWidth - margin, topMargin + 10, { align: "right" });
		doc.text(`Hora: ${hora}`, pageWidth - margin, topMargin + 15, { align: "right" });
	
		const data = dataTable.rows({ search: 'applied' }).nodes().toArray().map(row => {
			let estado = row.cells[6].innerText.trim();
			estado = estado.includes("Activo") ? "Activo" : "Inactivo";
	
			return [
				row.cells[0].innerText.trim(),
				row.cells[1].innerText.trim(),
				row.cells[2].innerText.trim(),
				row.cells[3].innerText.trim(),
				formatStrings(row.cells[4].innerText.trim()),
				formatStrings(row.cells[5].innerText.trim()),
				estado
			];
		});
	
		doc.autoTable({
			startY: topMargin + 25,
			margin: { left: margin, right: margin },
			head: [['Código', 'Título', 'Ej. disp.', 'Ej. prest.', 'Autor - Código', 'Editorial - Código', 'Estado']],
			body: data,
			theme: 'grid',
			headStyles: {
				fillColor: [0, 0, 0],
				textColor: 255,
				fontStyle: 'bold',
				fontSize: 8,
				halign: 'left'
			},
			bodyStyles: {
				font: "helvetica",
				fontSize: 7,
				halign: 'left'
			},
			didParseCell: function(data) {
				if (data.section === 'body') {
					applyTextColorByColumnPDF(data);
				}
			}
		});
	
		const filename = `Lista_de_libros_bookstudio_${fecha.replace(/\s+/g, '_')}.pdf`;
	
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

function generateExcel(dataTable) {
	const excelBtn = $('#generateExcel');
	toggleButtonLoading(excelBtn, true);
	
	try {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Libros');
	
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
	
		worksheet.mergeCells('A1:G1');
		const titleCell = worksheet.getCell('A1');
		titleCell.value = 'Lista de libros - BookStudio';
		titleCell.font = { name: 'Arial', size: 14, bold: true };
		titleCell.alignment = { horizontal: 'center' };
	
		worksheet.mergeCells('A2:G2');
		const dateTimeCell = worksheet.getCell('A2');
		dateTimeCell.value = `Fecha: ${dateStr}  Hora: ${timeStr}`;
		dateTimeCell.alignment = { horizontal: 'center' };
	
		worksheet.columns = [
			{ key: 'id', width: 10 },
			{ key: 'titulo', width: 40 },
			{ key: 'disponibles', width: 10 },
			{ key: 'prestados', width: 10 },
			{ key: 'autor', width: 50 },
			{ key: 'editorial', width: 50 },
			{ key: 'estado', width: 15 }
		];
	
		const headerRow = worksheet.getRow(4);
		headerRow.values = ['Código', 'Título', 'Ej. disp.', 'Ej. prest.', 'Autor - Código', 'Editorial - Código', 'Estado'];
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
	
		const data = dataTable.rows({ search: 'applied' }).nodes().toArray().map(row => {
			let estado = row.cells[6].innerText.trim();
			estado = estado.includes("Activo") ? "Activo" : "Inactivo";
	
			return {
				id: row.cells[0].innerText.trim(),
				titulo: row.cells[1].innerText.trim(),
				disponibles: row.cells[2].innerText.trim(),
				prestados: row.cells[3].innerText.trim(),
				autor: formatStrings(row.cells[4].innerText.trim()),
				editorial: formatStrings(row.cells[5].innerText.trim()),
				estado: estado
			};
		});
		
		function applyCellStyle(cell, colorHex, backgroundHex) {
			cell.font = { color: { argb: colorHex } };
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: backgroundHex }
			};
		}
	
		data.forEach((item) => {
			const row = worksheet.addRow(item);
	
			const estadoCell = row.getCell(7);
			if (estadoCell.value === "Activo") {
				applyCellStyle(estadoCell, '008000', 'E6F2E6');
			} else {
				applyCellStyle(estadoCell, 'FF0000', 'FFE6E6');
			}
			
			const disponiblesCell = row.getCell(3);
			applyCellStyle(disponiblesCell, '008000', 'E6F2E6');
			
			const prestadosCell = row.getCell(4);
			applyCellStyle(prestadosCell, 'FF0000', 'FFE6E6');
		});
	
		const filename = `Lista_de_libros_bookstudio_${dateStr.replace(/\s+/g, '_')}.xlsx`;
	
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
	loadBooks();
	handleAddBookForm();
	handleEditBookForm();
	loadModalData();
	populateSelectOptions();
	$('.selectpicker').selectpicker();
	setupBootstrapSelectDropdownStyles();
	placeholderColorSelect();
});