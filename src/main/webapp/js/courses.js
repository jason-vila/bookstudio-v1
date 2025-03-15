/**
 * courses.js
 * 
 * Manages the initialization, data loading, and configuration of the courses table,  
 * as well as handling modals for creating, viewing, and editing course details.
 * Also supports logical delete (status change) operations on course records.
 * Utilizes AJAX for CRUD operations on course data.
 * Includes functions to manage UI elements like placeholders, dropdown styles, and tooltips.
 * Additionally, incorporates functionality to generate PDFs and Excel files directly from the datatable.
 * 
 * @author [Jason]
 */

function placeholderColorSelect() {
	$('select.selectpicker').on('change', function() {
		var $select = $(this);
		var $dropdown = $select.closest('.bootstrap-select');
		var $filterOption = $dropdown.find('.filter-option-inner-inner');

		if ($select.val() !== "" && $select.val() !== null) {
			$dropdown.removeClass('placeholder-color');
			$filterOption.css('color', 'var(--bs-body-color)');
		}
	});
}

function placeholderColorEditSelect() {
	$('select[id^="edit"]').each(function() {
		var $select = $(this);
		var $dropdown = $select.closest('.bootstrap-select');
		var $filterOption = $dropdown.find('.filter-option-inner-inner');

		if ($filterOption.text().trim() === "No hay selección") {
			$filterOption.css('color', 'var(--placeholder-color)');
		} else {
			$filterOption.css('color', 'var(--bs-body-color)');
		}
	});
}

/*****************************************
 * TABLE HANDLING
 *****************************************/

function generateRow(course) {
	const userRole = sessionStorage.getItem('userRole');

	return `
		<tr>
			<td class="align-middle text-start">${course.courseId}</td>
			<td class="align-middle text-start">${course.name}</td>
			<td class="align-middle text-start">${course.level}</td>
			<td class="align-middle text-start">${course.description}</td>
			<td class="align-middle text-center">
				${course.status === 'activo'
					? '<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle p-1">Activo</span>'
					: '<span class="badge text-danger-emphasis bg-danger-subtle border border-danger-subtle p-1">Inactivo</span>'}
			</td>
			<td class="align-middle text-center">
				<div class="d-inline-flex gap-2">
					<button class="btn btn-sm btn-icon-hover" data-tooltip="tooltip" data-bs-placement="top" title="Detalles"
						data-bs-toggle="modal" data-bs-target="#detailsCourseModal" data-id="${course.courseId}">
						<i class="bi bi-eye"></i>
					</button>
					${userRole === 'administrador' ?
						`<button class="btn btn-sm btn-icon-hover" data-tooltip="tooltip" data-bs-placement="top" title="Editar"
							data-bs-toggle="modal" data-bs-target="#editCourseModal" data-id="${course.courseId}">
							<i class="bi bi-pencil"></i>
						</button>`
					: ''}
				</div>
			</td>
		</tr>
	`;
}

function addRowToTable(course) {
	var table = $('#courseTable').DataTable();
	var rowHtml = generateRow(course);
	var $row = $(rowHtml);

	table.row.add($row).draw();

	initializeTooltips($row);
}

function loadCourses() {
	toggleButtonAndSpinner('loading');

	let safetyTimer = setTimeout(function() {
		toggleButtonAndSpinner('loaded');
		$('#tableContainer').removeClass('d-none');
		$('#cardContainer').removeClass('h-100');
	}, 8000);

	$.ajax({
		url: 'CourseServlet',
		type: 'GET',
		data: { type: 'list' },
		dataType: 'json',
		success: function(data) {
			clearTimeout(safetyTimer);

			var tableBody = $('#bodyCourses');
			tableBody.empty();

			if (data && data.length > 0) {
				data.forEach(function(course) {
					var row = generateRow(course);
					tableBody.append(row);
				});

				initializeTooltips(tableBody);
			}

			if ($.fn.DataTable.isDataTable('#courseTable')) {
				$('#courseTable').DataTable().destroy();
			}

			let dataTable = setupDataTable('#courseTable');

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
				console.error(`Error listing loan data (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
				showToast('Hubo un error al listar los datos de los cursos.', 'error');
			} catch (e) {
				console.error("Unexpected error:", xhr.status, xhr.responseText);
				showToast('Hubo un error inesperado.', 'error');
			}
			
			clearTimeout(safetyTimer);

			var tableBody = $('#bodyCourses');
			tableBody.empty();

			if ($.fn.DataTable.isDataTable('#courseTable')) {
				$('#courseTable').DataTable().destroy();
			}

			setupDataTable('#courseTable');
		}
	});
}

function updateRowInTable(course) {
	var table = $('#courseTable').DataTable();

	var row = table.rows().nodes().to$().filter(function() {
		return $(this).find('td').eq(0).text() === course.courseId.toString();
	});

	if (row.length > 0) {
		row.find('td').eq(1).text(course.name);
		row.find('td').eq(2).text(course.level);
		row.find('td').eq(3).text(course.description);

		row.find('td').eq(4).html(course.status === 'activo'
			? '<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle p-1">Activo</span>'
			: '<span class="badge text-danger-emphasis bg-danger-subtle border border-danger-subtle p-1">Inactivo</span>');

		table.row(row).invalidate().draw();

		initializeTooltips(row);
	}
}

/*****************************************
 * FORM LOGIC
 *****************************************/

function handleAddCourseForm() {
	let isFirstSubmit = true;

	$('#addCourseModal').on('hidden.bs.modal', function() {
		isFirstSubmit = true;
		$('#addCourseForm').data("submitted", false);
	});

	$('#addCourseForm').on('input change', 'input, select', function() {
		if (!isFirstSubmit) {
			validateAddField($(this));
		}
	});

	$('#addCourseForm').on('submit', function(event) {
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
			var data = $(this).serialize() + '&type=create';

			var submitButton = $(this).find('[type="submit"]');
			submitButton.prop('disabled', true);
			$("#addCourseSpinner").removeClass("d-none");
			$("#addCourseIcon").addClass("d-none");

			$.ajax({
				url: 'CourseServlet',
				type: 'POST',
				data: data,
				dataType: 'json',
				success: function(response) {
					if (response && response.success) {
						addRowToTable(response.data);
						$('#addCourseModal').modal('hide');
						showToast('Curso agregado exitosamente.', 'success');
					} else {
						console.error(`Backend error (${response.errorType} - ${response.statusCode}):`, response.message);
						$('#addCourseModal').modal('hide');
						showToast('Hubo un error al agregar el curso.', 'error');
					}
				},
				error: function(xhr) {
					let errorResponse;
					try {
						errorResponse = JSON.parse(xhr.responseText);
						console.error(`Server error (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
						showToast('Hubo un error al agregar el curso.', 'error');
					} catch (e) {
						console.error("Unexpected error:", xhr.status, xhr.responseText);
						showToast('Hubo un error inesperado.', 'error');
					}
					
					$('#addCourseModal').modal('hide');
				},
				complete: function() {
					$("#addCourseSpinner").addClass("d-none");
					$("#addCourseIcon").removeClass("d-none");
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

		// Name validation
		if (field.is('#addCourseName')) {
			const firstName = field.val();

			if (firstName.length < 3) {
				errorMessage = 'El nombre debe tener al menos 3 caracteres.';
				isValid = false;
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

function handleEditCourseForm() {
	let isFirstSubmit = true;

	$('#editCourseModal').on('hidden.bs.modal', function() {
		isFirstSubmit = true;
		$('#editCourseForm').data("submitted", false);
	});

	$('#editCourseForm').on('input change', 'input, select', function() {
		if (!isFirstSubmit) {
			validateEditField($(this));
		}
	});

	$('#editCourseForm').on('submit', function(event) {
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

			var courseId = $(this).data('courseId');
			if (courseId) {
				data += '&courseId=' + encodeURIComponent(courseId);
			}

			var submitButton = $(this).find('[type="submit"]');
			submitButton.prop('disabled', true);
			$("#editCourseSpinner").removeClass("d-none");
			$("#editCourseIcon").addClass("d-none");

			$.ajax({
				url: 'CourseServlet',
				type: 'POST',
				data: data,
				dataType: 'json',
				success: function(response) {
					if (response && response.success) {
						updateRowInTable(response.data);
						
						$('#editCourseModal').modal('hide');
						showToast('Curso actualizado exitosamente.', 'success');
					} else {
						console.error(`Backend error (${response.errorType} - ${response.statusCode}):`, response.message);
						$('#editCourseModal').modal('hide');
						showToast('Hubo un error al actualizar el curso.', 'error');
					}
				},
				error: function(xhr) {
					let errorResponse;
					try {
						errorResponse = JSON.parse(xhr.responseText);
						console.error(`Server error (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
						showToast('Hubo un error al actualizar el curso.', 'error');
					} catch (e) {
						console.error("Unexpected error:", xhr.status, xhr.responseText);
						showToast('Hubo un error inesperado.', 'error');
					}
					
					$('#editCourseModal').modal('hide');
				},
				complete: function() {
					$("#editCourseSpinner").addClass("d-none");
					$("#editCourseIcon").removeClass("d-none");
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

	// Name validation
	if (field.is('#editCourseName')) {
		const firstName = field.val();

		if (firstName.length < 3) {
			errorMessage = 'El nombre debe tener al menos 3 caracteres.';
			isValid = false;
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
	$(document).on('click', '[data-bs-target="#addCourseModal"]', function() {
		$('#addCourseLevel').selectpicker('destroy').empty().append(
			$('<option>', {
				value: 'Básico',
				text: 'Básico'
			}),
			$('<option>', {
				value: 'Intermedio',
				text: 'Intermedio'
			}),
			$('<option>', {
				value: 'Avanzado',
				text: 'Avanzado'
			})
		);
		$('#addCourseLevel').selectpicker();

		$('#addCourseStatus').selectpicker('destroy').empty().append(
			$('<option>', {
				value: 'activo',
				text: 'Activo'
			}),
			$('<option>', {
				value: 'inactivo',
				text: 'Inactivo'
			})
		);
		$('#addCourseStatus').selectpicker();

		$('#addCourseForm')[0].reset();
		$('#addCourseForm .is-invalid').removeClass('is-invalid');
	});

	// Details Modal
	$(document).on('click', '[data-bs-target="#detailsCourseModal"]', function() {
		var courseId = $(this).data('id');

		$.ajax({
			url: 'CourseServlet',
			type: 'GET',
			data: { type: 'details', courseId: courseId },
			dataType: 'json',
			success: function(data) {
				$('#detailsCourseID').text(data.courseId);
				$('#detailsCourseName').text(data.name);
				$('#detailsCourseLevel').text(data.level);
				$('#detailsCourseStatus').html(
					data.status === 'activo'
						? '<span class="badge text-success-emphasis bg-success-subtle border border-success-subtle p-1">Activo</span>'
						: '<span class="badge text-danger-emphasis bg-danger-subtle border border-danger-subtle p-1">Inactivo</span>'
				);
				$('#detailsCourseDescription').text(data.description);
			},
			error: function(xhr) {
				let errorResponse;
				try {
					errorResponse = JSON.parse(xhr.responseText);
					console.error(`Error loading course details (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
					showToast('Hubo un error al cargar los detalles del curso.', 'error');
				} catch (e) {
					console.error("Unexpected error:", xhr.status, xhr.responseText);
					showToast('Hubo un error inesperado.', 'error');
				}
			}
		});
	});

	// Edit Modal
	$(document).on('click', '[data-bs-target="#editCourseModal"]', function() {
		var courseId = $(this).data('id');

		$.ajax({
			url: 'CourseServlet',
			type: 'GET',
			data: { type: 'details', courseId: courseId },
			dataType: 'json',
			success: function(data) {
				$('#editCourseForm').data('courseId', data.courseId);
				$('#editCourseName').val(data.name);
				$('#editCourseDescription').val(data.description);

				$('#editCourseLevel').selectpicker('destroy').empty().append(
					$('<option>', {
						value: 'Básico',
						text: 'Básico'
					}),
					$('<option>', {
						value: 'Intermedio',
						text: 'Intermedio'
					}),
					$('<option>', {
						value: 'Avanzado',
						text: 'Avanzado'
					})
				);
				$('#editCourseLevel').val(data.level);
				$('#editCourseLevel').selectpicker();

				$('#editCourseStatus').selectpicker('destroy').empty().append(
					$('<option>', {
						value: 'activo',
						text: 'Activo'
					}),
					$('<option>', {
						value: 'inactivo',
						text: 'Inactivo'
					})
				);
				$('#editCourseStatus').val(data.status);
				$('#editCourseStatus').selectpicker();

				$('#editCourseForm .is-invalid').removeClass('is-invalid');

				placeholderColorEditSelect();

				$('#editCourseForm').find('select').each(function() {
					validateEditField($(this), true);
				});
			},
			error: function(xhr) {
				let errorResponse;
				try {
					errorResponse = JSON.parse(xhr.responseText);
					console.error(`Error loading course details for editing (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
					showToast('Hubo un error al cargar los datos del curso.', 'error');
				} catch (e) {
					console.error("Unexpected error:", xhr.status, xhr.responseText);
					showToast('Hubo un error inesperado.', 'error');
				}
			}
		});
	});
}

function setupBootstrapSelectDropdownStyles() {
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

function initializeTooltips(container) {
	$(container).find('[data-tooltip="tooltip"]').tooltip({
		trigger: 'hover'
	}).on('click', function() {
		$(this).tooltip('hide');
	});
}

function generatePDF(dataTable) {
	const { jsPDF } = window.jspdf;
	const doc = new jsPDF("p", "mm", "a4");
	const logoUrl = '/bookstudio-v1/images/bookstudio-logo-no-bg.png';

	const currentDate = new Date();
	const fecha = currentDate.toLocaleDateString('es-ES', {
		day: '2-digit',
		month: '2-digit',
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

	doc.addImage(logoUrl, 'PNG', margin, topMargin, 30, 30);

	doc.setFont("helvetica", "bold");
	doc.setFontSize(18);
	doc.setTextColor(40);
	doc.text("Lista de cursos", pageWidth / 2, topMargin + 18, { align: "center" });

	doc.setFont("helvetica", "normal");
	doc.setFontSize(10);
	doc.text(`Fecha: ${fecha}`, pageWidth - margin, topMargin + 15, { align: "right" });
	doc.text(`Hora: ${hora}`, pageWidth - margin, topMargin + 20, { align: "right" });

	const data = dataTable.rows({ search: 'applied' }).nodes().toArray().map(row => {
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
		head: [['ID', 'Nombre', 'Nivel', 'Descripción', 'Estado']],
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

	const filename = `Lista_de_cursos_BookStudio_${fecha.replace(/\//g, '-')}.pdf`;

	const pdfBlob = doc.output('blob');
	const blobUrl = URL.createObjectURL(pdfBlob);
	const link = document.createElement('a');
	link.href = blobUrl;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function generateExcel(dataTable) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Cursos');

	const currentDate = new Date();
	const dateStr = currentDate.toLocaleDateString('es-ES', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
	const timeStr = currentDate.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});

	worksheet.mergeCells('A1:E1');
	const titleCell = worksheet.getCell('A1');
	titleCell.value = 'Lista de cursos - BookStudio';
	titleCell.font = { name: 'Arial', size: 14, bold: true };
	titleCell.alignment = { horizontal: 'center' };

	worksheet.mergeCells('A2:E2');
	const dateTimeCell = worksheet.getCell('A2');
	dateTimeCell.value = `Fecha: ${dateStr}  Hora: ${timeStr}`;
	dateTimeCell.alignment = { horizontal: 'center' };

	worksheet.columns = [
		{ key: 'id', width: 10 },
		{ key: 'nombre', width: 40 },
		{ key: 'nivel', width: 20 },
		{ key: 'descripcion', width: 50 },
		{ key: 'estado', width: 15 }
	];

	const headerRow = worksheet.getRow(4);
	headerRow.values = ['ID', 'Nombre', 'Nivel', 'Descripción', 'Estado'];
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
		let estado = row.cells[4].innerText.trim();
		estado = estado.includes("Activo") ? "Activo" : "Inactivo";

		return {
			id: row.cells[0].innerText.trim(),
			nombre: row.cells[1].innerText.trim(),
			nivel: row.cells[2].innerText.trim(),
			descripcion: row.cells[3].innerText.trim(),
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

	const filename = `Lista_de_cursos_BookStudio_${dateStr.replace(/\//g, '-')}.xlsx`;

	workbook.xlsx.writeBuffer().then(buffer => {
		const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		link.click();
	});
}

/*****************************************
 * INITIALIZATION
 *****************************************/

$(document).ready(function() {
	loadCourses();
	handleAddCourseForm();
	handleEditCourseForm();
	loadModalData();
	$('.selectpicker').selectpicker();
	setupBootstrapSelectDropdownStyles();
	placeholderColorSelect();
});