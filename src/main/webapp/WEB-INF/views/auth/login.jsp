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
	<link rel="stylesheet" href="css/auth-forms-styles.css">
	<title>BookStudio</title>
	<link href="images/logo-dark.png" rel="icon" media="(prefers-color-scheme: light)">
	<link href="images/logo-light.png" rel="icon" media="(prefers-color-scheme: dark)">
</head>
<body>
	<!-- Background -->
	<div class="position-fixed w-100 h-100 bg-body"></div>
	<!-- Centered container -->
	<div class="d-flex justify-content-center align-items-center vh-100">
		<!-- ===================== Main Content ==================== -->
		<main class="w-100 mx-4" style="max-width: 384px;">
			<!-- Card Container -->
			<section class="card border">
				<!-- Card header -->
				<header class="card-header text-center bg-body-secondary">
					<img class="logo mt-1 mb-2" alt="Logo de Bookstudio" src="./images/logo-light.png">
					<h3 class="fw-bold mb-0 text-body-emphasis">Iniciar sesión</h3>
					<p class="text-muted mb-0">Empieza a gestionar tus préstamos.</p>
				</header>
				
				<!-- Card body -->
				<div class="card-body">
					<form id="loginForm" novalidate>
						<!-- Username field -->
						<div class="mb-4">
							<label for="txtUsername" class="form-label">Nombre de usuario</label>
							<input
	                            id="txtUsername" 
	                            name="txtUsername" 
	                            type="text" 
	                            class="form-control" 
	                            placeholder="Nombre de usuario" 
	                            pattern="[A-Za-zÀ-ÿ0-9_]+" 
								oninput="this.value = this.value.replace(/[^A-Za-zÀ-ÿ0-9_]/g, '');" 
	                            aria-describedby="usernameHelp" 
	                            autocomplete="username">
							<div class="invalid-feedback">Por favor introduce tu nombre de usuario.</div>
						</div>
						
						<!-- Password field -->
						<div class="mb-4">
							<div class="d-flex justify-content-between align-items-center">
								<label for="txtPassword" class="form-label">Contraseña</label>
								<a href="forgot-password" class="text-body-emphasis"><small>¿Olvidaste tu contraseña?</small></a>
							</div>
							<div class="input-group">
								<input
	                                id="txtPassword" 
	                                name="txtPassword" 
	                                type="password" 
	                                class="form-control password-field" 
	                                data-toggle-id="1" 
	                                placeholder="Contraseña" 
	                                aria-describedby="passwordHelp" 
	                                autocomplete="current-password">
	                            <span class="input-group-text cursor-pointer" data-toggle-id="1">
	                                <i class="bi bi-eye"></i>
	                            </span>
	                            <div class="invalid-feedback">Por favor introduce tu contraseña.</div>
							</div>
						</div>
						
						<!-- Login Button -->
						<button type="submit" class="btn btn-custom-primary w-100" id="loginBtn">
		                    <span id="spinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
		                    <span id="loginText">Iniciar sesión</span>
		                </button>
					</form>
				</div>
			</section>
		</main>
	</div>

	<!-- Toast Container -->
	<div class="toast-container" id="toast-container"></div>

	<!-- Theme toggle button -->
	<div class="dropdown position-fixed bottom-0 end-0 mb-3 me-3">
		<jsp:include page="/WEB-INF/includes/button-theme.jsp">
			<jsp:param name="dropdownDirection" value="2" />
		</jsp:include>
	</div>

	<!-- External Libraries -->
	<script src="https://code.jquery.com/jquery-3.7.1.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>

	<!-- Custom Scripts -->
	<script type="module" src="js/views/auth/login.js" defer></script>
	<script src="js/utils/ui/password.js" defer></script>
</body>
</html>