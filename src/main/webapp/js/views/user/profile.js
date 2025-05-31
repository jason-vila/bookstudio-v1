/**
 * profile.js
 * 
 * Manages user profile updates, including photo cropping, password validation, and general profile editing.
 * Handles the AJAX requests for updating the profile photo and details, including validation of password changes.
 * 
 * @author [Jason]
 */

import { showToast } from '../../utils/ui/index.js';

$(document).ready(function() {
	/************** Logic for Profile Photo **************/
	var croppedImageBlob = null;
	var cropper;

	$("#currentProfilePassword, #editProfilePassword").on("input", function() {
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

	$('#cropperModal').on('shown.bs.modal', function() {
		if (cropper) {
			cropper.destroy();
			cropper = null;
		}
		cropper = new Cropper(document.getElementById('cropperImage'), {
			aspectRatio: 1,
			viewMode: 1,
			autoCropArea: 1,
			responsive: true,
			ready: function() {
				$('.cropper-crop-box').css({
					'border-radius': '50%',
					'overflow': 'hidden'
				});
			}
		});
	});

	$('#cropperModal').on('hidden.bs.modal', function() {
		if (cropper) {
			cropper.destroy();
			cropper = null;
		}
	});

	// When a photo is selected in the profile photo input
	$('#editProfilePhoto').on('change', function() {
		var file = this.files[0];
		if (!file) return;

		var validExtensions = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

		if (!validExtensions.includes(file.type)) {
			showToast('Solo se permiten imágenes en formato JPG, PNG, GIF o WEBP.', 'error');

			$(this).val('');
			return;
		}

		var reader = new FileReader();
		reader.onload = function(e) {
			$('#cropperImage').attr('src', e.target.result);
			$('#cropperModal').modal('show');
		};

		reader.readAsDataURL(file);
	});

	// When "Save" is clicked in the cropper modal
	$('#saveCroppedImage').on('click', function() {
		if ($(this).prop('disabled')) return;

		$(this).prop('disabled', true);
		$('#savePhotoIcon').addClass('d-none');
		$('#savePhotoSpinner').removeClass('d-none');

		if (!cropper) return;
		var canvas = cropper.getCroppedCanvas({
			width: 460,
			height: 460
		});

		canvas.toBlob(function(blob) {
			croppedImageBlob = blob;
			var photoFormData = new FormData($('#editProfilePhotoForm')[0]);
			photoFormData.delete('editProfilePhoto');

			photoFormData.append('editProfilePhoto', croppedImageBlob, 'croppedImage.png');
			photoFormData.set('type', 'updateProfilePhoto');
			photoFormData.append('deletePhoto', 'false');

			$.ajax({
				url: 'ProfileServlet',
				method: 'POST',
				data: photoFormData,
				processData: false,
				contentType: false,
				success: function(response) {
					if (response && response.success) {
						sessionStorage.setItem('toastMessage', 'Foto de perfil subida exitosamente.');
						sessionStorage.setItem('toastType', 'success');
						window.location.href = "profile";
					} else {
						showToast(response.message, 'error');
					}
				},
				error: function() {
					showToast("Error al actualizar la foto.", 'error');
					$('#cropperModal').modal('hide');
				},
				complete: function() {
					$('#savePhotoIcon').removeClass('d-none');
					$('#savePhotoSpinner').addClass('d-none');
				}
			});
		});
	});

	// Reset button state when the modal is hidden
	$('#cropperModal').on('hidden.bs.modal', function() {
		$('#saveCroppedImage').prop('disabled', false);
		$('#savePhotoIcon').removeClass('d-none');
		$('#savePhotoSpinner').addClass('d-none');
	});

	// Confirm photo deletion
	$('#confirmDeletePhoto').on('click', function() {
		if ($(this).prop('disabled')) return;

		$(this).prop('disabled', true);
		$('#deletePhotoIcon').addClass('d-none');
		$('#deletePhotoSpinner').removeClass('d-none');

		var photoFormData = new FormData();
		photoFormData.append('type', 'updateProfilePhoto');
		photoFormData.append('deletePhoto', 'true');

		$.ajax({
			url: 'ProfileServlet',
			method: 'POST',
			data: photoFormData,
			processData: false,
			contentType: false,
			success: function(response) {
				if (response && response.success) {
					sessionStorage.setItem('toastMessage', 'Foto de perfil eliminada exitosamente.');
					sessionStorage.setItem('toastType', 'success');
					window.location.href = "profile";
				} else {
					showToast(response.message, 'error');
				}
			},
			error: function() {
				showToast("Error al eliminar la foto.", 'error');
				$('#deletePhotoModal').modal('hide');
			},
			complete: function() {
				$('#deletePhotoIcon').removeClass('d-none');
				$('#deletePhotoSpinner').addClass('d-none');
			}
		});
	});

	// Reset button state when the modal is hidden
	$('#deletePhotoModal').on('hidden.bs.modal', function() {
		$('#confirmDeletePhoto').prop('disabled', false);
		$('#deletePhotoIcon').removeClass('d-none');
		$('#deletePhotoSpinner').addClass('d-none');
	});

	/************** Profile update logic **************/
	// Validate new password
	function validateNewPassword() {
		var newPassword = $('#editProfilePassword').val().trim();
		var passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
		if (newPassword && !passwordRegex.test(newPassword)) {
			$('#editProfilePassword').addClass("is-invalid");
			$('#editProfilePassword').siblings('.invalid-feedback')
				.text('La contraseña debe tener 8 caracteres, una mayúscula, un número y un símbolo.');
			return false;
		} else {
			$('#editProfilePassword').removeClass("is-invalid");
			$('#editProfilePassword').siblings('.invalid-feedback').text('');
			return true;
		}
	}

	// Real-time validation for "Current Password"
	$("#currentProfilePassword").on("input", function() {
		$(this).removeClass("is-invalid");
		$(this).siblings('.invalid-feedback').text('');
	});

	// Real-time validation for "New Password"
	$("#editProfilePassword").on("input", function() {
		validateNewPassword();
	});

	// Handle profile update form submission
	$('#editProfileForm').on('submit', function(event) {
		event.preventDefault();

		var currentPassword = $('#currentProfilePassword').val().trim();
		var newPassword = $('#editProfilePassword').val().trim();
		var data = $(this).serialize();

		if (currentPassword && !newPassword) {
			$("#editProfilePassword").addClass("is-invalid");
			$("#editProfilePassword").siblings('.invalid-feedback')
				.text("Debes ingresar tu contraseña nueva.");
			return;
		}

		if (newPassword) {
			if (!validateNewPassword()) {
				return;
			}
			if (!currentPassword) {
				$("#currentProfilePassword").addClass("is-invalid");
				$("#currentProfilePassword").siblings('.invalid-feedback')
					.text("Debes ingresar tu contraseña actual.");
				return;
			}

			$.ajax({
				url: 'ProfileServlet',
				method: 'GET',
				data: {
					type: 'validatePassword',
					confirmCurrentPassword: currentPassword
				},
				success: function(response) {
					if (response && response.success) {
						$("#currentProfilePassword").removeClass("is-invalid");
						$("#currentProfilePassword").siblings('.invalid-feedback').text('');
						data += '&editProfilePassword=' + encodeURIComponent(newPassword);
						submitProfileForm(data);
					} else {
						$("#currentProfilePassword").addClass("is-invalid");
						$("#currentProfilePassword").siblings('.invalid-feedback')
							.text(response.message || "La contraseña actual no es correcta.");
					}
				},
				error: function() {
					$("#currentProfilePassword").addClass("is-invalid");
					$("#currentProfilePassword").siblings('.invalid-feedback')
						.text("Ocurrió un error inesperado al validar la contraseña.");
				}
			});
		} else {
			data += '&editProfilePassword=';
			submitProfileForm(data);
		}
	});

	let formSubmitted = false;

	// Submit profile form
	function submitProfileForm(data) {
		if (formSubmitted) return;
		formSubmitted = true;

		$("#updateProfileBtn").prop("disabled", true);
		$("#updateProfileSpinner").removeClass("d-none");
		$("#updateProfileText").addClass("d-none");

		data += '&type=updateProfile';

		$.ajax({
			url: 'ProfileServlet',
			method: 'POST',
			data: data,
			success: function(response) {
				if (response && response.success) {
					sessionStorage.setItem('toastMessage', 'Perfil actualizado exitosamente.');
					sessionStorage.setItem('toastType', 'success');
					window.location.href = "profile";
				} else {
					showToast(response.message, 'error');
					formSubmitted = false;
				}
			},
			error: function() {
				showToast("Ocurrió un error inesperado.", 'error');
				formSubmitted = false;
			},
			complete: function() {
				$("#updateProfileBtn").prop("disabled", false);
				$("#updateProfileSpinner").addClass("d-none");
				$("#updateProfileText").removeClass("d-none");
			}
		});
	}

	// Check messages to show toasts
	$(document).ready(function() {
		const toastMessage = sessionStorage.getItem('toastMessage');
		const toastType = sessionStorage.getItem('toastType');

		if (toastMessage && toastType) {
			showToast(toastMessage, toastType);
			sessionStorage.removeItem('toastMessage');
			sessionStorage.removeItem('toastType');
		}
	});

	// Enable or disable the update profile button
	var originalFirstName = $("#editProfileFirstName").val();
	var originalLastName = $("#editProfileLastName").val();

	function checkChanges() {
		var currentFirstName = $("#editProfileFirstName").val();
		var currentLastName = $("#editProfileLastName").val();
		var currentPassword = $("#currentProfilePassword").val().trim();
		var newPassword = $("#editProfilePassword").val().trim();

		var nameChanged = (currentFirstName !== originalFirstName) || (currentLastName !== originalLastName);
		var passwordChanged = newPassword !== "" || currentPassword !== "";

		if (nameChanged || passwordChanged) {
			$("#editProfileForm button[type=submit]").prop("disabled", false);
		} else {
			$("#editProfileForm button[type=submit]").prop("disabled", true);
		}
	}

	$("#editProfileFirstName, #editProfileLastName, #currentProfilePassword, #editProfilePassword").on("input", checkChanges);
});