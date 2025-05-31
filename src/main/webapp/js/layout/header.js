$(document).ready(function() {
	// Menu Button
	$('.btn-menu').on('click', function() {
		let icon = $(this).find('i');

		if (icon.hasClass('bi-list')) {
			icon.removeClass('bi-list').addClass('bi-x');
		} else {
			icon.removeClass('bi-x').addClass('bi-list');
		}
	});

	$('#offcanvasSidebar').on('hidden.bs.offcanvas', function() {
		$('.btn-menu i').removeClass('bi-x').addClass('bi-list');
	});

	// Keep Session
	const sessionTimeoutMinutes = 15;
	const warningTimeMinutes = 2;

	const sessionTimeout = sessionTimeoutMinutes * 60 * 1000;
	const warningTime = (sessionTimeoutMinutes - warningTimeMinutes) * 60 * 1000;

	let warningTimer, logoutTimer;

	function showSessionExpiredModal() {
		$("#sessionExpiredModal").modal("show");
	}

	function startSessionTimers() {
		warningTimer = setTimeout(() => {
			showSessionExpiredModal();
		}, warningTime);

		logoutTimer = setTimeout(() => {
			window.location.href = "LoginServlet?type=logout";
		}, sessionTimeout);
	}

	function resetSessionTimers() {
		clearTimeout(warningTimer);
		clearTimeout(logoutTimer);
		startSessionTimers();
	}

	$(document).on("mousemove keydown", resetSessionTimers);

	startSessionTimers();

	$("#extendSessionBtn").click(function() {
		$.ajax({
			url: "KeepSessionAliveServlet",
			method: "GET",
			success: function() {
				resetSessionTimers();
				$("#sessionExpiredModal").modal("hide");
			},
			error: function() {
				alert("Error al extender la sesión. Intenta nuevamente.");
			}
		});
	});

	$("#logoutBtn").click(function() {
		window.location.href = "LoginServlet?type=logout";
	});
});