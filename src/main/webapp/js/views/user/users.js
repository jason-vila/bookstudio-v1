/**
 * users.js
 * 
 * Manages the initialization, data loading, and configuration of the users table,  
 * as well as handling modals for creating, viewing, editing, and deleting user details.  
 * Utilizes AJAX for CRUD operations on user data.  
 * Includes functions to manage UI elements like placeholders, dropdown styles, and tooltips.  
 * Additionally, incorporates functionality to generate PDFs and Excel files directly from the datatable.
 * 
 * @author [Jason]
 */

import {
  showToast,
  toggleButtonLoading,
  placeholderColorSelect,
  placeholderColorEditSelect,
  initializeCropper,
  setupBootstrapSelectDropdownStyles,
  initializeTooltips
} from '../../utils/ui/index.js';

import { toggleTableLoadingState, setupDataTable } from '../../utils/tables/index.js';

import {
  isValidEmail,
  isValidUsername,
  isValidText,
  isValidPassword,
  doPasswordsMatch,
  isValidImageFile,
  validateImageFileUI
} from '../../utils/validators/index.js';

/*****************************************
 * GLOBAL VARIABLES AND HELPER FUNCTIONS
 *****************************************/

// Global variable to handle profile photo deletion in edit modal
let deletePhotoFlag = false;

/*****************************************
 * TABLE HANDLING
 *****************************************/

function generateRow(user) {
	return `
		<tr>
			<td class="align-middle text-start">
				<span class="badge bg-body-tertiary text-body-emphasis border">${user.formattedUserId}</span>
			</td>
			<td class="align-middle text-start">${user.username}</td>
			<td class="align-middle text-start">${user.email}</td>
			<td class="align-middle text-start">${user.firstName}</td>
			<td class="align-middle text-start">${user.lastName}</td>
			<td class="align-middle text-start">
			  <span class="badge bg-body-secondary text-body-emphasis border">
			    ${
			      user.role === 'administrador'
			        ? '<i class="bi bi-shield-lock me-1"></i> Administrador'
			        : '<i class="bi bi-person-workspace me-1"></i> Bibliotecario'
			    }
			  </span>
			</td>
			<td class="align-middle text-center">
				${user.profilePhotoBase64 ?
					`<img src="${user.profilePhotoBase64}" alt="Foto del Usuario" class="img-fluid rounded-circle" style="width: 23px; height: 23px;">` :
					`<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi-person-circle" viewBox="0 0 16 16">
						<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"></path>
						<path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"></path>
					</svg>`}
			</td>
			<td class="align-middle text-center">
				<div class="d-inline-flex gap-2">
					<button class="btn btn-sm btn-icon-hover" data-tooltip="tooltip" data-bs-placement="top" title="Detalles"
						data-bs-toggle="modal" data-bs-target="#detailsUserModal" data-id="${user.userId}" data-formatted-id="${user.formattedUserId}">
						<i class="bi bi-eye"></i>
					</button>
					<button class="btn btn-sm btn-icon-hover" data-tooltip="tooltip" data-bs-placement="top" title="Editar"
						data-bs-toggle="modal" data-bs-target="#editUserModal" data-id="${user.userId}" data-formatted-id="${user.formattedUserId}">
						<i class="bi bi-pencil"></i>
					</button>
					<button class="btn btn-sm btn-icon-hover" data-tooltip="tooltip" data-bs-placement="top" title="Eliminar"
						data-bs-toggle="modal" data-bs-target="#deleteUserModal" data-id="${user.userId}" data-formatted-id="${user.formattedUserId}">
						<i class="bi bi-trash"></i>
					</button>
				</div>
			</td>
		</tr>
	`;
}

function addRowToTable(user) {
	var table = $('#userTable').DataTable();
	var rowHtml = generateRow(user);
	var $row = $(rowHtml);

	table.row.add($row).draw(false);

	initializeTooltips($row);
}

function loadUsers() {
	toggleTableLoadingState('loading');

	let safetyTimer = setTimeout(function() {
		toggleTableLoadingState('loaded');
		$('#tableContainer').removeClass('d-none');
		$('#cardContainer').removeClass('h-100');
	}, 8000);

	$.ajax({
		url: 'UserServlet',
		type: 'GET',
		data: { type: 'list' },
		dataType: 'json',
		success: function(data) {
			clearTimeout(safetyTimer);

			var tableBody = $('#bodyUsers');
			tableBody.empty();

			if (data && data.length > 0) {
				data.forEach(function(user) {
					var row = generateRow(user);
					tableBody.append(row);
				});

				initializeTooltips(tableBody);
			}

			if ($.fn.DataTable.isDataTable('#bookTable')) {
				$('#userTable').DataTable().destroy();
			}

			let dataTable = setupDataTable('#userTable');

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
				console.error(`Error listing user data (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
				switch (xhr.status) {
		            case 403:
		                showToast('No tienes permisos para listar los usuarios.', 'warning');
		                break;
		            case 400:
		                showToast('Solicitud inválida. Verifica la petición.', 'error');
		                break;
		            case 500:
		                showToast('Error interno del servidor. Intenta más tarde.', 'error');
		                break;
		            default:
		                showToast('Hubo un error al listar los datos de los usuarios.', 'error');
		                break;
		        }
			} catch (e) {
				console.error("Unexpected error:", xhr.status, xhr.responseText);
				showToast('Hubo un error inesperado.', 'error');
			}
			
			clearTimeout(safetyTimer);

			var tableBody = $('#bodyUsers');
			tableBody.empty();

			if ($.fn.DataTable.isDataTable('#userTable')) {
				$('#userTable').DataTable().destroy();
			}

			setupDataTable('#userTable');
		}
	});
}

function updateRowInTable(user) {
	var table = $('#userTable').DataTable();

	var row = table.rows().nodes().to$().filter(function() {
		return $(this).find('td').eq(0).text().trim() === user.formattedUserId.toString();
	});

	if (row.length > 0) {
		row.find('td').eq(3).text(user.firstName);
		row.find('td').eq(4).text(user.lastName);
		row.find('td').eq(5).find('span').html(user.role === 'administrador'
			? '<i class="bi bi-shield-lock me-1"></i> Administrador'
			: '<i class="bi bi-person-workspace me-1"></i> Bibliotecario');

		if (user.profilePhotoBase64 && user.profilePhotoBase64.trim() !== "") {
			row.find('td').eq(6).html(`<img src="${user.profilePhotoBase64}" alt="Foto del Usuario" class="img-fluid rounded-circle" style="width: 23px; height: 23px;">`);
		} else {
			row.find('td').eq(6).html(`
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

function handleAddUserForm() {
	let isFirstSubmit = true;

	$('#addUserModal').on('hidden.bs.modal', function() {
		isFirstSubmit = true;
		$('#addUserForm').data("submitted", false);
	});

	$('#addUserForm').on('input change', 'input, select', function() {
		if (!isFirstSubmit) {
			validateAddField($(this));
		}
	});

	$('#addUserForm').on('submit', function(event) {
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
			$("#addUserSpinnerBtn").removeClass("d-none");
			$("#addUserIcon").addClass("d-none");

			if (cropper) {
				cropper.getCroppedCanvas({
					width: 460,
					height: 460
				}).toBlob(function(blob) {
					formData.set('addUserProfilePhoto', blob, 'photo.jpg');
					sendAddForm(formData);
				}, 'image/jpeg', 0.7);
			} else {
				sendAddForm(formData);
			}

			function sendAddForm(formData) {
				formData.append('type', 'create');

				$.ajax({
					url: 'UserServlet',
					type: 'POST',
					data: formData,
					dataType: 'json',
					processData: false,
					contentType: false,
					success: function(response) {
						if (response && response.success) {
							addRowToTable(response.data);
							
							$('#addUserModal').modal('hide');
							showToast('Usuario agregado exitosamente.', 'success');
						} else {
							if (response.field) {
								setFieldError(response.field, response.message);
								$('#addUserForm').data("submitted", false);
							}
							else {
								console.error(`Backend error (${response.errorType} - ${response.statusCode}):`, response.message);
								showToast(response.message, 'error');
								$('#addUserModal').modal('hide');
							}
						}
					},
					error: function(xhr) {
						var errorMessage = (xhr.responseJSON && xhr.responseJSON.message)
							? xhr.responseJSON.message
							: 'Hubo un error al agregar el usuario.';
						var errorField = xhr.responseJSON && xhr.responseJSON.field
							? xhr.responseJSON.field
							: null;

						if (errorField) {
							setFieldError(errorField, errorMessage);
							$('#addUserForm').data("submitted", false);
						} else {
							console.error(`Server error (${xhr.responseJSON ? xhr.responseJSON.errorType : 'unknown'} - ${xhr.status}):`, errorMessage);
							switch (xhr.status) {
					            case 403:
					                showToast('No tienes permisos para agregar usuarios.', 'warning');
					                break;
					            case 400:
					                showToast('Solicitud inválida. Verifica los datos del formulario.', 'error');
					                break;
					            case 500:
					                showToast('Error interno del servidor. Intenta más tarde.', 'error');
					                break;
					            default:
					                showToast(errorMessage || 'Hubo un error al agregar el usuario.', 'error');
					                break;
					        }
							$('#addUserModal').modal('hide');
						}
					},
					complete: function() {
						$("#addUserSpinnerBtn").addClass("d-none");
						$("#addUserIcon").removeClass("d-none");
						submitButton.prop('disabled', false);
					}
				});
			}
			function setFieldError(fieldId, message) {
				var field = $('#' + fieldId);
				field.addClass('is-invalid');
				field.siblings('.invalid-feedback').html(message).show();
			}
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

		// Email validation
		if (field.is('#addUserEmail')) {
			const result = isValidEmail(field.val());
			if (!result.valid) {
				errorMessage = result.message;
				isValid = false;
			}
		}

		// Username validation
		if (field.is('#addUserUsername')) {
			const result = isValidUsername(field.val());
			if (!result.valid) {
				errorMessage = result.message;
				isValid = false;
			}
		}
		
		// First name validation
		if (field.is('#addUserFirstName')) {
			const result = isValidText(field.val(), 'nombre');
			if (!result.valid) {
				isValid = false;
				errorMessage = result.message;
			}
		}

		// Last name validation
		if (field.is('#addUserLastName')) {
			const result = isValidText(field.val(), 'apellido');
			if (!result.valid) {
				isValid = false;
				errorMessage = result.message;
			}
		}

		// Password validation
		if (field.is('#addUserPassword')) {
			const result = isValidPassword(field.val());
			if (!result.valid) {
				errorMessage = result.message;
				isValid = false;
			}
		}

		// Confirm password validation
		if (field.is('#addUserConfirmPassword')) {
			const password = $('#addUserPassword').val();
			const result = doPasswordsMatch(password, field.val());
			if (!result.valid) {
				errorMessage = result.message;
				isValid = false;
			}
		}

		// Profile photo validation
		if (field.is('#addUserProfilePhoto')) {
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

$('#addUserProfilePhoto, #editUserProfilePhoto').on('change', function() {
	validateImageFileUI($(this));
});

function handleEditUserForm() {
	let isFirstSubmit = true;

	$('#editUserModal').on('hidden.bs.modal', function() {
		isFirstSubmit = true;
		$('#editUserForm').data("submitted", false);
	});

	$('#editUserForm').on('input change', 'input, select', function() {
		if (!isFirstSubmit) {
			validateEditField($(this));
		}
	});

	$('#editUserForm').on('submit', function(event) {
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

			var userId = $(this).data('userId');
			if (userId) {
				formData.append('userId', userId);
			}
			
			formData.append('deleteProfilePhoto', deletePhotoFlag);

			var submitButton = $(this).find('[type="submit"]');
			submitButton.prop('disabled', true);
			$("#editUserSpinnerBtn").removeClass("d-none");
			$("#editUserIcon").addClass("d-none");

			if (cropper) {
				cropper.getCroppedCanvas({
					width: 460,
					height: 460
				}).toBlob(function(blob) {
					formData.set('editUserProfilePhoto', blob, 'photo.png');
					sendEditForm(formData);
				}, 'image/png');
			} else {
				sendEditForm(formData);
			}

			function sendEditForm(formData) {
				formData.append('type', 'update');

				$.ajax({
					url: 'UserServlet',
					type: 'POST',
					data: formData,
					dataType: 'json',
					processData: false,
					contentType: false,
					success: function(response) {
						if (response && response.success) {
							updateRowInTable(response.data);
							
							$('#editUserModal').modal('hide');
							showToast('Usuario actualizado exitosamente.', 'success');
						} else {
							console.error(`Backend error (${response.errorType} - ${response.statusCode}):`, response.message);
							$('#editUserModal').modal('hide');
							showToast('Hubo un error al actualizar el usuario.', 'error');
						}
					},
					error: function(xhr) {
						let errorResponse;
						try {
							errorResponse = JSON.parse(xhr.responseText);
							console.error(`Server error (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
							switch (xhr.status) {
								case 403:
									showToast('No tienes permisos para actualizar usuarios.', 'warning');
									break;
								case 400:
									showToast('Solicitud inválida. Verifica los datos del formulario.', 'error');
									break;
								case 500:
									showToast('Error interno del servidor. Intenta más tarde.', 'error');
									break;
								default:
									showToast(errorResponse.message || 'Hubo un error al actualizar el usuario.', 'error');
									break;
							}
						} catch (e) {
							console.error("Unexpected error:", xhr.status, xhr.responseText);
							showToast('Hubo un error inesperado.', 'error');
						}
						
						$('#editUserModal').modal('hide');
					},
					complete: function() {
						$("#editUserSpinnerBtn").addClass("d-none");
						$("#editUserIcon").removeClass("d-none");
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

	// First name validation
	if (field.is('#editUserFirstName')) {
		const result = isValidText(field.val(), 'nombre');
		if (!result.valid) {
			isValid = false;
			errorMessage = result.message;
		}
	}

	// Last name validation
	if (field.is('#editUserLastName')) {
		const result = isValidText(field.val(), 'apellido');
		if (!result.valid) {
			isValid = false;
			errorMessage = result.message;
		}
	}

	// Profile photo validation
	if (field.is('#editUserProfilePhoto')) {
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

function handleDeleteUser() {
	var isSubmitted = false;

	$('#confirmDeleteUser').off('click').on('click', function() {
		if (isSubmitted) return;
		isSubmitted = true;

		$('#confirmDeleteUserIcon').addClass('d-none');
		$('#confirmDeleteUserSpinner').removeClass('d-none');
		$('#confirmDeleteUser').prop('disabled', true);

		var userId = $(this).data('userId');
		var formattedUserId = $(this).data('formattedUserId');

		$.ajax({
			url: 'UserServlet',
			type: 'POST',
			data: {
				type: 'delete',
				userId: userId
			},
			dataType: 'json',
			success: function(response) {
				if (response && response.success) {
					var table = $('#userTable').DataTable();

					table.rows().every(function() {
						var data = this.data();
						var spanText = $('<div>').html(data[0]).text().trim();
						if (spanText == formattedUserId) {
							this.remove();
						}
					});

					table.draw(false);

					$('#deleteUserModal').modal('hide');
					showToast("Usuario eliminado exitosamente.", 'success');
				} else {
					console.error(`Backend error (${response.errorType} - ${response.statusCode}):`, response.message);
					$('#deleteUserModal').modal('hide');
					showToast("Hubo un error al eliminar el usuario.", 'error');
				}
			},
			error: function(xhr) {
				let errorResponse;
				try {
					errorResponse = JSON.parse(xhr.responseText);
					console.error(`Server error (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
					switch (xhr.status) {
						case 403:
							showToast('No tienes permisos para eliminar usuarios.', 'warning');
							break;
						case 400:
							showToast('Solicitud inválida. Verifica los datos del formulario.', 'error');
							break;
						case 500:
							showToast('Error interno del servidor. Intenta más tarde.', 'error');
							break;
						default:
							showToast(errorResponse.message || 'Hubo un error al eliminar el usuario.', 'error');
							break;
					}
				} catch (e) {
					console.error("Unexpected error:", xhr.status, xhr.responseText);
					showToast('Hubo un error inesperado.', 'error');
				}
				$('#deleteUserModal').modal('hide');
			},
			complete: function() {
				$('#confirmDeleteUserSpinner').addClass('d-none');
				$('#confirmDeleteUserIcon').removeClass('d-none');
				$('#confirmDeleteUser').prop('disabled', false);
			}
		});
	});
}

/*****************************************
 * MODAL MANAGEMENT
 *****************************************/

function loadModalData() {
	// Add Modal
	$(document).on('click', '[data-bs-target="#addUserModal"]', function() {
		$('#addUserRole').selectpicker('destroy').empty().append(
			$('<option>', {
				value: 'administrador',
				text: 'Administrador'
			}),
			$('<option>', {
				value: 'bibliotecario',
				text: 'Bibliotecario'
			})
		);
		$('#addUserRole').selectpicker();
		
		$('#defaultAddPhotoContainer').removeClass('d-none');
		$('#deleteAddPhotoBtn').addClass('d-none');

		$('#addUserForm')[0].reset();
		$('#addUserForm .is-invalid').removeClass('is-invalid');

		$('#cropperContainerAdd').addClass('d-none');

		if (cropper) {
			cropper.destroy();
			cropper = null;
		}

		$('#addUserForm .password-field').attr('type', 'password');
		$('#addUserForm .input-group-text').find('i').removeClass('bi-eye-slash').addClass('bi-eye');

		preventSpacesInPasswordField("#addUserPassword, #addUserConfirmPassword");
	});

	// Details Modal
	$(document).on('click', '[data-bs-target="#detailsUserModal"]', function() {
		var userId = $(this).data('id');
		$('#detailsUserModalID').text($(this).data('formatted-id'));
		
		$('#detailsUserSpinner').removeClass('d-none');
		$('#detailsUserContent').addClass('d-none');

		$.ajax({
			url: 'UserServlet',
			type: 'GET',
			data: { type: 'details', userId: userId },
			dataType: 'json',
			success: function(data) {
				$('#detailsUserID').text(data.formattedUserId);
				$('#detailsUserUsername').text(data.username);
				$('#detailsUserEmail').text(data.email);
				$('#detailsUserFirstName').text(data.firstName);
				$('#detailsUserLastName').text(data.lastName);
				$('#detailsUserRole').html(
					data.role === 'administrador'
						? '<i class="bi bi-shield-lock me-1"></i> Administrador'
						: '<i class="bi bi-person-workspace me-1"></i> Bibliotecario'
				);
				if (data.profilePhotoBase64) {
					$('#detailsUserImg').attr('src', data.profilePhotoBase64).removeClass('d-none');
					$('#detailsUserSvg').addClass('d-none');
				} else {
					$('#detailsUserImg').addClass('d-none');
					$('#detailsUserSvg').removeClass('d-none');
				}
				
				$('#detailsUserSpinner').addClass('d-none');
				$('#detailsUserContent').removeClass('d-none');
			},
			error: function(xhr) {
				let errorResponse;
				try {
					errorResponse = JSON.parse(xhr.responseText);
					console.error(`Error loading user details (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
					showToast('Hubo un error al cargar los detalles del usuario.', 'error');
				} catch (e) {
					console.error("Unexpected error:", xhr.status, xhr.responseText);
					showToast('Hubo un error inesperado.', 'error');
				}
				$('#detailsUserModal').modal('hide');
			}
		});
	});

	// Edit Modal
	$(document).on('click', '[data-bs-target="#editUserModal"]', function() {
		var userId = $(this).data('id');
		$('#editUserModalID').text($(this).data('formatted-id'));
		
		$('#editUserSpinner').removeClass('d-none');
		$('#editUserForm').addClass('d-none');
		$('#editUserBtn').prop('disabled', true);

		$.ajax({
			url: 'UserServlet',
			type: 'GET',
			data: { type: 'details', userId: userId },
			dataType: 'json',
			success: function(data) {
				$('#editUserForm').data('userId', data.userId);
				$('#editUserUsername').val(data.username);
				$('#editUserEmail').val(data.email);
				$('#editUserFirstName').val(data.firstName);
				$('#editUserLastName').val(data.lastName);

				$('#editUserRole').selectpicker('destroy').empty().append(
					$('<option>', {
						value: 'administrador',
						text: 'Administrador'
					}),
					$('<option>', {
						value: 'bibliotecario',
						text: 'Bibliotecario'
					})
				);
				$('#editUserRole').val(data.role);
				$('#editUserRole').selectpicker();
				
				updateEditImageContainer(data.profilePhotoBase64);

				$('#editUserForm .is-invalid').removeClass('is-invalid');

				placeholderColorEditSelect();

				$('#editUserForm').find('select').each(function() {
					validateEditField($(this), true);
				});

				$('#editUserProfilePhoto').val('');
				
				$('#editUserSpinner').addClass('d-none');
				$('#editUserForm').removeClass('d-none');
				$('#editUserBtn').prop('disabled', false);
			},
			error: function(xhr) {
				let errorResponse;
				try {
					errorResponse = JSON.parse(xhr.responseText);
					console.error(`Error loading user details for editing (${errorResponse.errorType} - ${xhr.status}):`, errorResponse.message);
					showToast('Hubo un error al cargar los datos del usuario.', 'error');
				} catch (e) {
					console.error("Unexpected error:", xhr.status, xhr.responseText);
					showToast('Hubo un error inesperado.', 'error');
				}
				$('#editUserModal').modal('hide');
			}
		});

		$('#cropperContainerEdit').addClass('d-none');

		if (cropper) {
			cropper.destroy();
			cropper = null;
		}
	});

	// Delete Modal
	$('#deleteUserModal').on('show.bs.modal', function(event) {
		var button = $(event.relatedTarget);
		var userId = button.data('id');
		var formattedUserId = button.data('formatted-id');
		
		$('#deleteUserModalID').text(formattedUserId);
		$('#confirmDeleteUser').data('userId', userId);
		$('#confirmDeleteUser').data('formattedUserId', formattedUserId);
	});
}

function preventSpacesInPasswordField(selector) {
	$(selector).off('input').on("input", function() {
		const inputElement = this;
		const cursorPosition = inputElement.selectionStart;
		const originalValue = $(this).val();
		const newValue = originalValue.replace(/\s/g, '');

		if (originalValue !== newValue) {
			$(this).val(newValue);
			const spacesRemoved = (originalValue.slice(0, cursorPosition).match(/\s/g) || []).length;
			inputElement.setSelectionRange(cursorPosition - spacesRemoved, cursorPosition - spacesRemoved);
		}
	});
}

function updateEditImageContainer(profilePhotoBase64) {
	const $editImageContainer = $('#currentEditPhotoContainer');
	const $deleteEditPhotoBtn = $('#deleteEditPhotoBtn');

	$editImageContainer.empty();

	if (profilePhotoBase64) {
		$editImageContainer.html(
			`<img src="${profilePhotoBase64}" class="img-fluid rounded-circle" alt="Foto del Usuario">`
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
	$('#addUserProfilePhoto').val('');
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
	$('#editUserProfilePhoto').val('');
});

let cropper;
const $cropperContainerAdd = $('#cropperContainerAdd');
const $imageToCropAdd = $('#imageToCropAdd');
const $cropperContainerEdit = $('#cropperContainerEdit');
const $imageToCropEdit = $('#imageToCropEdit');

$('#addUserProfilePhoto, #editUserProfilePhoto').on('change', function() {
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
		if ($(this).is('#addUserProfilePhoto')) {
			$container = $cropperContainerAdd;
			$image = $imageToCropAdd;
		} else {
			$container = $cropperContainerEdit;
			$image = $imageToCropEdit;
		}
		initializeCropper(file, $container, $image, cropper);
	} else {
		if ($(this).is('#addUserProfilePhoto')) {
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
		doc.text("Lista de usuarios", pageWidth / 2, topMargin + 13, { align: "center" });
	
		doc.setFont("helvetica", "normal");
		doc.setFontSize(8);
		doc.text(`Fecha: ${fecha}`, pageWidth - margin, topMargin + 10, { align: "right" });
		doc.text(`Hora: ${hora}`, pageWidth - margin, topMargin + 15, { align: "right" });
	
		const data = dataTable.rows({ search: 'applied' }).nodes().toArray().map(row => {
	
			return [
				row.cells[0].innerText.trim(),
				row.cells[1].innerText.trim(),
				row.cells[2].innerText.trim(),
				row.cells[3].innerText.trim(),
				row.cells[4].innerText.trim(),
				row.cells[5].innerText.trim()
			];
		});
	
		doc.autoTable({
			startY: topMargin + 25,
			margin: { left: margin, right: margin },
			head: [['Código', 'Nombre de usuario', 'Correo electrónico', 'Nombres', 'Apellidos', 'Rol']],
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
				if (data.section === 'body' && data.column.index === 6) {
					data.cell.styles.textColor = [0, 0, 0];
				}
			}
		});
	
		const filename = `Lista_de_usuarios_bookstudio_${fecha.replace(/\s+/g, '_')}.pdf`;
	
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
		const worksheet = workbook.addWorksheet('Usuarios');
	
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
	
		worksheet.mergeCells('A1:F1');
		const titleCell = worksheet.getCell('A1');
		titleCell.value = 'Lista de usuarios - BookStudio';
		titleCell.font = { name: 'Arial', size: 14, bold: true };
		titleCell.alignment = { horizontal: 'center' };
	
		worksheet.mergeCells('A2:F2');
		const dateTimeCell = worksheet.getCell('A2');
		dateTimeCell.value = `Fecha: ${dateStr}  Hora: ${timeStr}`;
		dateTimeCell.alignment = { horizontal: 'center' };
	
		worksheet.columns = [
			{ key: 'id', width: 10 },
			{ key: 'usuario', width: 20 },
			{ key: 'correo', width: 30 },
			{ key: 'nombres', width: 30 },
			{ key: 'apellidos', width: 30 },
			{ key: 'rol', width: 20 }
		];
	
		const headerRow = worksheet.getRow(4);
		headerRow.values = ['Código', 'Nombre de usuario', 'Correo electrónico', 'Nombres', 'Apellidos', 'Rol'];
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
			return {
				id: row.cells[0].innerText.trim(),
				usuario: row.cells[1].innerText.trim(),
				correo: row.cells[2].innerText.trim(),
				nombres: row.cells[3].innerText.trim(),
				apellidos: row.cells[4].innerText.trim(),
				rol: row.cells[5].innerText.trim()
			};
		});
	
		data.forEach(item => worksheet.addRow(item));
	
		const filename = `Lista_de_usuarios_bookstudio_${dateStr.replace(/\s+/g, '_')}.xlsx`;
	
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
	loadUsers();
	handleAddUserForm();
	handleEditUserForm();
	handleDeleteUser();
	loadModalData();
	$('.selectpicker').selectpicker();
	setupBootstrapSelectDropdownStyles();
	placeholderColorSelect();
});