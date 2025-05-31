<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="es" data-bs-theme="auto">
<head>
	<meta charset="UTF-8">
	<meta name="description" content="BookStudio es un sistema de librería para gestionar préstamos, libros, autores y otros recursos, facilitando la administración y seguimiento de los préstamos.">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script src="js/setup/color-modes.js"></script>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
	<link rel="stylesheet" href="css/index-styles.css">
	<title>BookStudio</title>
	<link href="images/logo-dark.png" rel="icon" media="(prefers-color-scheme: light)">
	<link href="images/logo-light.png" rel="icon" media="(prefers-color-scheme: dark)">
</head>
<body>
	<!-- ===================== Header ===================== -->
	<jsp:include page="/WEB-INF/includes/header.jsp"></jsp:include>

	<!-- ===================== Sidebar ==================== -->
	<jsp:include page="/WEB-INF/includes/sidebar.jsp">
		<jsp:param name="currentPage" value="./" />
	</jsp:include>

	<!-- ===================== Main Content ==================== -->
	<main class="p-4 d-flex flex-column min-vh-100 bg-body">
		<!-- First Row -->
		<section class="row">
			<!-- Total Books -->
			<article class="col-md-4">
				<div class="card border-start-primary bg-body-secondary border mb-3">
					<div class="card-body">
						<h5 class="card-title d-flex align-items-center text-body-emphasis">
							<i class="bi pe-none me-2 bi-journal-bookmark text-primary"></i>
							Libros
						</h5>
						<p class="card-text text-body-emphasis" id="totalBooks">Libros</p>
					</div>
				</div>
			</article>

			<!-- Total Authors -->
			<article class="col-md-4">
				<div class="card border-start-success bg-body-secondary border mb-3">
					<div class="card-body">
						<h5 class="card-title d-flex align-items-center text-body-emphasis">
							<i class="bi pe-none me-2 bi-person-plus text-success"></i>
							Autores
						</h5>
						<p class="card-text text-body-emphasis" id="totalAuthors">Autores</p>
					</div>
				</div>
			</article>

			<!-- Total Publishers -->
			<article class="col-md-4">
				<div class="card border-start-warning bg-body-secondary border mb-3">
					<div class="card-body sombra">
						<h5 class="card-title d-flex align-items-center text-body-emphasis">
							<i class="bi pe-none me-2 bi-map text-warning"></i> Editoriales
						</h5>
						<p class="card-text text-body-emphasis" id="totalPublishers">Editoriales</p>
					</div>
				</div>
			</article>
		</section>

		<!-- Second Row -->
		<section class="row">
			<!-- Courses -->
			<article class="col-md-4">
				<div class="card border-start-info bg-body-secondary border mb-3">
					<div class="card-body sombra">
						<h5 class="card-title d-flex align-items-center text-body-emphasis">
							<i class="bi pe-none me-2 bi-stickies text-info"></i> Cursos
						</h5>
						<p class="card-text text-body-emphasis" id="totalCourses">Cursos</p>
					</div>
				</div>
			</article>

			<!-- Students -->
			<article class="col-md-4">
				<div
					class="card border-start-secondary bg-body-secondary border mb-3">
					<div class="card-body sombra">
						<h5 class="card-title d-flex align-items-center text-body-emphasis">
							<i class="bi pe-none me-2 bi-mortarboard text-secondary"></i>
							Estudiantes
						</h5>
						<p class="card-text text-body-emphasis" id="totalStudents">Estudiantes</p>
					</div>
				</div>
			</article>

			<!-- Active Loans -->
			<article class="col-md-4">
				<div class="card border-start-danger bg-body-secondary border mb-3">
					<div class="card-body sombra">
						<h5 class="card-title d-flex align-items-center text-body-emphasis">
							<i class="bi pe-none me-2 bi-file-earmark-text text-danger"></i>
							Préstamos
						</h5>
						<p class="card-text text-body-emphasis" id="totalLoans">Préstamos</p>
					</div>
				</div>
			</article>
		</section>

		<section class="row mt-2">
			<!-- Borrowed Books by Month Chart -->
			<article class="col-md-6">
				<div class="card mb-3 border">
					<div class="card-body">
						<h5 class="card-title d-flex align-items-center text-body-emphasis">
							<i class="bi pe-none me-2 bi-journal-plus"></i>
							Libros prestados por mes
						</h5>
						<canvas id="borrowedBooksChart" width="400" height="200"></canvas>
					</div>
				</div>
			</article>

			<!-- Returned Books by Month Chart -->
			<article class="col-md-6">
				<div class="card mb-3 border">
					<div class="card-body">
						<h5 class="card-title d-flex align-items-center text-body-emphasis">
							<i class="bi pe-none me-2 bi-arrow-clockwise"></i>
							Libros devueltos por mes
						</h5>
						<canvas id="returnedBooksChart" width="400" height="200"></canvas>
					</div>
				</div>
			</article>

			<!-- Average Loan Time Chart -->
			<article class="col-md-6">
				<div class="card penultimate-chart border">
					<div class="card-body">
						<h5 class="card-title d-flex align-items-center text-body-emphasis">
							<i class="bi pe-none me-2 bi-clock"></i>
							Tiempo promedio de préstamo
						</h5>
						<canvas id="avgLoanTimeChart" width="400" height="200"></canvas>
					</div>
				</div>
			</article>

			<!-- Loan Comparison by Year Chart -->
			<article class="col-md-6">
				<div class="card border">
					<div class="card-body">
						<h5 class="card-title d-flex align-items-center text-body-emphasis">
							<i class="bi pe-none me-2 bi-bar-chart-line"></i>
							Comparación de préstamos por año
						</h5>
						<canvas id="loanComparisonChart" width="400" height="200"></canvas>
					</div>
				</div>
			</article>
		</section>
	</main>

	<!-- External Libraries -->
	<script src="https://code.jquery.com/jquery-3.7.1.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

	<!-- Custom Scripts -->
	<script src="js/views/user/dashboard.js" defer></script>
	<script src="js/layout/header.js" defer></script>
	<script src="js/layout/sidebar.js" defer></script>
</body>
</html>