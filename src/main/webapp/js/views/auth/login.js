/**
 * login.js
 * 
 * Handles the login form validation, submission, and background image update based on the theme.
 * Implements real-time validation for username and password fields, and authenticates using
 * an AJAX request. Also initializes and updates particle animation based on the current theme.
 * 
 * @author [Jason]
 */

import { showToast } from '../../utils/ui/index.js';

$(document).ready(function() {
	let formSubmitted = false;

	// Validation functions
	function validateUsername() {
		const username = $("#txtUsername").val().trim();
		if (username === "" || username.length < 3) {
			if (formSubmitted) $("#txtUsername").addClass("is-invalid");
			return false;
		} else {
			$("#txtUsername").removeClass("is-invalid");
			return true;
		}
	}

	function validatePassword() {
		const password = $("#txtPassword").val().trim();
		if (password === "" || password.length < 8) {
			if (formSubmitted) $("#txtPassword").addClass("is-invalid");
			return false;
		} else {
			$("#txtPassword").removeClass("is-invalid");
			return true;
		}
	}
	
	// Prevent spaces in password field in real-time
	$("#txtPassword").on("input", function() {
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

	// Event listeners
	$("#txtUsername, #txtPassword").on("input", function() {
		if (formSubmitted) {
			validateUsername();
			validatePassword();
		}
	});

	// Form submission handling
	$("#loginForm").on("submit", function(event) {
		event.preventDefault();
		formSubmitted = true;

		const isUsernameValid = validateUsername();
		const isPasswordValid = validatePassword();

		if (!isUsernameValid || !isPasswordValid) return;

		$("#loginBtn").prop("disabled", true);
		$("#spinner").removeClass("d-none");
		$("#loginText").addClass("d-none");

		const formData = {
			type: "login",
			txtUsername: $("#txtUsername").val().trim(),
			txtPassword: $("#txtPassword").val().trim()
		};

		$.ajax({
			type: "POST",
			url: "LoginServlet",
			data: formData,
			dataType: "json",
			success: function(response) {
				if (response && response.success) {
					window.location.href = "./";
				} else {
					showToast(response.message, "error");
					$("#txtUsername").removeClass("is-invalid");
					$("#txtPassword").removeClass("is-invalid");
				}
			},
			error: function() {
				showToast("Se produjo un error inesperado.", "error");
				$("#txtUsername").removeClass("is-invalid");
				$("#txtPassword").removeClass("is-invalid");
			},
			complete: function() {
				$("#loginBtn").prop("disabled", false);
				$("#spinner").addClass("d-none");
				$("#loginText").removeClass("d-none");
			}
		});
	});
});