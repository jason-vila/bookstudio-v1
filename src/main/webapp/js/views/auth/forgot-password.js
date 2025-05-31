/**
 * forgot-password.js
 * 
 * Handles forgot password form validation, submission, and UI updates. Validates the email format in real-time,
 * submits the form via AJAX to ForgotPasswordServlet, and updates the UI based on the response.
 * 
 * @author Jason
 */

import { showToast } from '../../utils/ui/index.js';

$(document).ready(function() {
	var isFirstSubmit = false;
	
	var originalTitle = $("header.card-header h3").text();
	var originalParagraph = $("header.card-header p").text();
	var originalCancelHTML = $("#forgotPasswordForm a.btn-custom-secondary").prop("outerHTML");

	function validateEmail() {
		var email = $("#email").val().trim();
		var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		if (!emailRegex.test(email)) {
			$("#email").addClass("is-invalid");
			$("#email").siblings(".invalid-feedback").html("Por favor ingrese un correo electrónico válido.");
			return false;
		} else {
			$("#email").removeClass("is-invalid");
			$("#email").siblings(".invalid-feedback").html("");
			return true;
		}
	}

	$("#email").on("input", function() {
		if (isFirstSubmit) {
			validateEmail();
		}
	});

	function updateUIOnSuccess() {
		const $headerTitle = $("header.card-header h3");
		const $headerParagraph = $("header.card-header p");
		const $emailContainer = $("#email").closest('.mb-4');
		const $sendBtn = $("#sendBtn");
		const $cancelBtn = $("#forgotPasswordForm a.btn-custom-secondary");

		$headerTitle.text("Comprueba tu bandeja de entrada");
		$headerParagraph.text("Te hemos enviado un correo. Sigue las instrucciones para acceder a tu cuenta de BookStudio.");

		$emailContainer.hide();
		$sendBtn.hide();

		$cancelBtn.text("Volver al inicio de sesión")
			.removeClass("btn-custom-secondary mt-3")
			.addClass("btn-custom-primary");

		if ($("#editBtn").length === 0) {
			const $editBtn = $(`
	                <button type="button" class="btn btn-custom-secondary w-100 mt-3 d-flex align-items-center justify-content-center" id="editBtn">
	                    <i class="bi bi-pencil me-2"></i>Editar correo
	                </button>
	            `);
			$cancelBtn.after($editBtn);

			$editBtn.on("click", function() {
				restoreOriginalUI();
				$editBtn.remove();
			});
		}
	}

	function restoreOriginalUI() {
		$("header.card-header h3").text(originalTitle);
		$("header.card-header p").text(originalParagraph);
		$("#email").closest('.mb-4').show();
		$("#sendBtn").show();
		$("#forgotPasswordForm a.btn-custom-primary").replaceWith(originalCancelHTML);
	}

	$("#forgotPasswordForm").on("submit", function(e) {
		e.preventDefault();

		$("#alertContainer").empty();

		isFirstSubmit = true;

		if (!validateEmail()) {
			return;
		}

		var email = $("#email").val().trim();

		$("#sendBtn").prop("disabled", true);
		$("#spinner").removeClass("d-none");
		$("#sendText").addClass("d-none");

		$.ajax({
			type: "POST",
			url: "ForgotPasswordServlet",
			data: { email: email },
			dataType: "json",
			success: function(response) {
				if (response && response.success) {
					updateUIOnSuccess();
				} else {
					if (response.target === "field-error") {
						$("#email").addClass("is-invalid");
						$("#email").siblings(".invalid-feedback").html(response.message);
					} else {
						showToast(response.message, 'error');
					}
				}
			},
			error: function() {
				showToast("Ocurrió un error al procesar la solicitud.", "error");
			},
			complete: function() {
				$("#sendBtn").prop("disabled", false);
				$("#spinner").addClass("d-none");
				$("#sendText").removeClass("d-none");

				const urlParams = new URLSearchParams(window.location.search);
				if (urlParams.get("linkInvalid") === "true") {
					urlParams.delete("linkInvalid");

					if (urlParams.toString()) {
						window.history.replaceState({}, "", `${location.pathname}?${urlParams}`);
					} else {
						window.history.replaceState({}, "", location.pathname);
					}
				}
			}
		});
	});

	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get("linkInvalid") === "true") {
		var alertHTML = `
			<div class="alert alert-danger alert-dismissible fade show" role="alert">
			    <i class="bi bi-x-circle me-1"></i>
			    <small>El enlace de restablecimiento ha expirado o es inválido.</small>
			</div>
        `;
		$("#alertContainer").html(alertHTML);
	}
});