/**
 * dashboard.js
 * 
 * Initializes Chart.js charts for borrowed books, returned books, average loan time, and loan comparison.
 * Retrieves dashboard data via AJAX and updates charts and statistics on the page.
 * 
 * @author Jason
 */

$(document).ready(function() {
	var borrowedBooksChart = new Chart($('#borrowedBooksChart'), {
		type: 'bar',
		data: {
			labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
			datasets: [{
				label: 'Libros prestados',
				data: [],
				backgroundColor: 'rgba(54, 162, 235, 0.2)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1
			}]
		},
		options: {
			scales: { y: { beginAtZero: true } }
		}
	});

	var returnedBooksChart = new Chart($('#returnedBooksChart'), {
		type: 'bar',
		data: {
			labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
			datasets: [{
				label: 'Libros devueltos',
				data: [],
				backgroundColor: 'rgba(75, 192, 192, 0.2)',
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 1
			}]
		},
		options: {
			scales: { y: { beginAtZero: true } }
		}
	});

	var avgLoanTimeChart = new Chart($('#avgLoanTimeChart'), {
		type: 'line',
		data: {
			labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
			datasets: [{
				label: 'Duración promedio de préstamo (días)',
				data: [],
				borderColor: 'rgba(255, 99, 132, 1)',
				backgroundColor: 'rgba(255, 99, 132, 0.2)',
				borderWidth: 2,
				tension: 0.4
			}]
		},
		options: {
			scales: { y: { beginAtZero: true } }
		}
	});

	var loanComparisonChart = new Chart($('#loanComparisonChart'), {
		type: 'bar',
		data: {
			labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
			datasets: [
				{ label: 'Año anterior', data: [], backgroundColor: 'rgba(54, 162, 235, 0.7)' },
				{ label: 'Año actual', data: [], backgroundColor: 'rgba(255, 99, 132, 0.7)' }
			]
		},
		options: {
			responsive: true,
			scales: { y: { beginAtZero: true } }
		}
	});

	$.ajax({
		url: 'DashboardServlet',
		type: 'GET',
		data: { type: 'getDashboardData' },
		dataType: 'json',
		success: function(data) {
			var loansData = [];
			var returnsData = [];
			var avgDurationData = [];

			for (var m = 1; m <= 6; m++) {
				loansData.push(data.loansByMonth[m] || 0);
				returnsData.push(data.returnsByMonth[m] || 0);
				avgDurationData.push(data.averageLoanDurationByMonth[m] || 0);
			}

			borrowedBooksChart.data.datasets[0].data = loansData;
			borrowedBooksChart.update();

			returnedBooksChart.data.datasets[0].data = returnsData;
			returnedBooksChart.update();

			avgLoanTimeChart.data.datasets[0].data = avgDurationData;
			avgLoanTimeChart.update();

			var comparison = data.monthlyLoanComparison;
			comparison.sort(function(a, b) { return a.month - b.month; });

			var year1Data = [];
			var year2Data = [];

			for (var i = 1; i <= 6; i++) {
				var comp = comparison.find(function(item) { return item.month === i; });
				if (comp) {
					year1Data.push(comp.loansYear1);
					year2Data.push(comp.loansYear2);
				} else {
					year1Data.push(0);
					year2Data.push(0);
				}
			}

			loanComparisonChart.data.datasets[0].data = year1Data;
			loanComparisonChart.data.datasets[1].data = year2Data;
			loanComparisonChart.update();

			$('#totalBooks').text(data.totalActiveBooks + " Libros activos");
			$('#totalAuthors').text(data.totalActiveAuthors + " Autores activos");
			$('#totalPublishers').text(data.totalActivePublishers + " Editoriales activas");
			$('#totalCourses').text(data.totalActiveCourses + " Cursos activos");
			$('#totalStudents').text(data.totalActiveStudents + " Estudiantes activos");
			$('#totalLoans').text(data.totalActiveLoans + " Préstamos activos");
		},
		error: function(error) {
			console.error("Error fetching dashboard data from backend:", error);
		}
	});
});