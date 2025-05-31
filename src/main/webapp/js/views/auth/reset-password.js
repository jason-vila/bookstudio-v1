/**
 * reset-password.js
 * 
 * Validates the reset token and new password inputs, then submits an AJAX request to reset the password.
 * On success, updates the UI to prompt the user to log in.
 * 
 * @author Jason
 */

import { showToast } from '../../utils/ui/index.js';

$(document).ready(function() {
	var isFirstSubmit = false;

	function getTokenFromURL() {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get("token");
	}

	function redirectToForgotPassword() {
		window.location.href = "forgot-password?linkInvalid=true";
	}

	var token = getTokenFromURL();
	if (!token) {
		redirectToForgotPassword();
		return;
	}

	$.ajax({
		type: "POST",
		url: "ValidateTokenServlet",
		data: { token: token },
		dataType: "json",
		success: function(response) {
			if (!response.valid) {
				redirectToForgotPassword();
			}
		},
		error: function() {
			redirectToForgotPassword();
		}
	});

	function validatePassword() {
		var password = $("#newPassword").val().trim();
		var passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

		if (!passwordRegex.test(password)) {
			$("#newPassword").addClass("is-invalid");
			$("#newPassword").siblings(".invalid-feedback").html("La contraseña debe tener 8 caracteres, una mayúscula, un número y un símbolo.");
			return false;
		} else {
			$("#newPassword").removeClass("is-invalid");
			$("#newPassword").siblings(".invalid-feedback").html("");
			return true;
		}
	}

	function validateConfirmPassword() {
		var password = $("#newPassword").val().trim();
		var confirmPassword = $("#confirmNewPassword").val().trim();

		if (confirmPassword !== password) {
			$("#confirmNewPassword").addClass("is-invalid");
			$("#confirmNewPassword").siblings(".invalid-feedback").html("Las contraseñas no coinciden.");
			return false;
		} else {
			$("#confirmNewPassword").removeClass("is-invalid");
			$("#confirmNewPassword").siblings(".invalid-feedback").html("");
			return true;
		}
	}

	$("#newPassword, #confirmNewPassword").on("input", function() {
		if (isFirstSubmit) {
			validatePassword();
			validateConfirmPassword();
		}
	});

	$("#resetPasswordForm").on("submit", function(e) {
		e.preventDefault();

		isFirstSubmit = true;

		if (!validatePassword() || !validateConfirmPassword()) {
			return;
		}

		var newPassword = $("#newPassword").val().trim();

		$("#createBtn").prop("disabled", true);
		$("#spinner").removeClass("d-none");
		$("#resetText").addClass("d-none");

		$.ajax({
			type: "POST",
			url: "ResetPasswordServlet",
			data: { token: token, newPassword: newPassword },
			dataType: "json",
			success: function(response) {
				if (response && response.success) {
					$("header.card-header h3").text("¡Todo listo!");
					$("header.card-header p").text("La contraseña se actualizó con éxito, inicie sesión nuevamente para disfrutar de BookStudio.");

					$("#newPassword").closest('.mb-4').remove();
					$("#confirmNewPassword").closest('.mb-4').remove();
					$("#createBtn").remove();

					if ($("#backToLogin").length === 0) {
						$("#resetPasswordForm").append(`
							<a href="login" class="btn btn-custom-primary w-100 text-decoration-none" id="backToLogin">Volver al inicio de sesión</a>
						`);
					}
				} else {
					showToast(response.message, 'error');
				}
			},
			error: function() {
				showToast("Ocurrió un error al procesar la solicitud.", "error");
			},
			complete: function() {
				$("#createBtn").prop("disabled", false);
				$("#spinner").addClass("d-none");
				$("#resetText").removeClass("d-none");
			}
		});
	});
});