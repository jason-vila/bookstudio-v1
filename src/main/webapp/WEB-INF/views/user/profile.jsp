<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
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
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cropperjs/dist/cropper.min.css">
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
		<jsp:param name="currentPage" value="" />
	</jsp:include>

	<!-- ===================== Main Content ==================== -->
	<main class="d-flex flex-column overflow-auto bg-body">
    	<section id="cardContainer" class="card border">
    		<!-- Card Header -->
    		<header class="card-header d-flex align-items-center position-relative">
				<h5 class="card-title text-body-emphasis mb-2 mt-2">Configuración de perfil</h5>
			</header>
    	
	    	<!-- Card Body -->
			<div class="card-body">
				<div class="d-flex justify-content-center">
				    <figure class="position-relative">
				        <!-- Profile Image -->
				        <img id="profileImage" 
				             src="${not empty sessionScope.user_profile_image ? sessionScope.user_profile_image : ''}" 
				             alt="Foto" 
				             width="150" 
				             height="150" 
				             class="rounded-circle mt-4 mb-4 ${not empty sessionScope.user_profile_image ? '' : 'd-none'}">
				
				        <!-- Default Icon if no profile image -->
				        <svg xmlns="http://www.w3.org/2000/svg" 
				             width="150" 
				             height="150" 
				             fill="currentColor" 
				             class="bi-person-circle mt-4 mb-4 ${not empty sessionScope.user_profile_image ? 'd-none' : ''}" 
				             viewBox="0 0 16 16">
				          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
				          <path fill-rule="evenodd" 
				                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
				        </svg>
				
				        <!-- Form for Editing Profile Image -->
				        <form id="editProfilePhotoForm" enctype="multipart/form-data">     
				            <!-- Pencil Icon for Edit -->
				            <label id="photoLabel" for="editProfilePhoto" 
				                   class="position-absolute rounded-circle d-flex align-items-center justify-content-center pencil-icon"
				                   data-bs-toggle="dropdown" 
				                   aria-expanded="false">
				              <i class="bi bi-pencil"></i>
				            </label>
				        
				            <!-- Dropdown for Profile Options -->
				            <ul class="dropdown-menu dropdown-menu-start gap-1 p-2 rounded-3 mx-0 shadow bg-body-secondary" aria-labelledby="photoLabel">
				                <li>
				                    <!-- Option to Upload New Profile Image -->
				                    <label for="editProfilePhoto" class="dropdown-item rounded-2 d-flex align-items-center cursor-pointer">
				                        <i class="bi bi-upload me-2"></i> Subir imagen
				                    </label>
				                </li>
				                <!-- Option to Delete Image (if exists) -->
				                <c:if test="${not empty sessionScope.user_profile_image}">
				                    <li class="mt-1">
				                        <button type="button" class="dropdown-item rounded-2 d-flex align-items-center dropdown-danger" data-bs-toggle="modal" data-bs-target="#deletePhotoModal">
				                            <i class="bi bi-trash me-2"></i> Eliminar imagen
				                        </button>
				                    </li>
				                </c:if>
				            </ul>
				
				            <!-- Hidden File Input for Image Upload -->
				            <input type="file" id="editProfilePhoto" name="editProfilePhoto" class="d-none" accept="image/*">
				        </form>
				    </figure>
				</div>
			
		        <!-- Profile Form -->
		        <article class="d-flex justify-content-center mb-3">
		            <div class="col-12 col-md-10 col-lg-8">
		                <form id="editProfileForm" accept-charset="UTF-8">
		                    <!-- Form Fields -->
		                    <fieldset class="row">
		                        <!-- User and Email Section -->
		                        <div class="col-12 col-md-6 mb-3">
		                            <label for="editProfileUsername" class="form-label">Nombre de usuario</label>
		                            <input 
		                                type="text" 
		                                class="form-control w-100" 
		                                id="editProfileUsername" 
		                                value="${sessionScope.username}" 
		                                disabled
		                            >
		                        </div>
		                        <div class="col-12 col-md-6 mb-3">
		                            <label for="editProfileEmail" class="form-label">Correo electrónico</label>
		                            <input 
		                                type="email" 
		                                class="form-control w-100" 
		                                id="editProfileEmail" 
		                                value="${sessionScope.email}" 
		                                disabled
		                            >
		                        </div>
		                                                
		                        <!-- First Name and Last Name Section -->
		                        <div class="col-12 col-md-6 mb-3">
		                            <label for="editProfileFirstName" class="form-label">Nombres</label>
		                            <input 
		                                type="text" 
		                                class="form-control w-100" 
		                                id="editProfileFirstName" 
		                                name="editProfileFirstName" 
		                                value="${sessionScope.firstname}" 
		                                placeholder="Actualizar nombres" 
		                                autocomplete="given-name" 
		                                pattern="[A-Za-zÀ-ÿ\s]+" 
		                                oninput="this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');"
		                            >
		                        </div>
		                        <div class="col-12 col-md-6 mb-3">
		                            <label for="editProfileLastName" class="form-label">Apellidos</label>
		                            <input 
		                                type="text" 
		                                class="form-control w-100" 
		                                id="editProfileLastName" 
		                                name="editProfileLastName" 
		                                value="${sessionScope.lastname}" 
		                                placeholder="Actualizar apellidos" 
		                                autocomplete="family-name" 
		                                pattern="[A-Za-zÀ-ÿ\s]+" 
		                                oninput="this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');"
		                            >
		                        </div>
		                        
		                        <!-- Password Section -->
		                        <div class="col-12 col-md-6 mb-4 position-relative">
		                            <label for="currentProfilePassword" class="form-label">Contraseña actual</label>
		                            <div class="input-group">
		                                <input 
		                                    type="password" 
		                                    class="form-control password-field" 
		                                    id="currentProfilePassword" 
		                                    name="currentProfilePassword" 
		                                    data-toggle-id="1" 
		                                    placeholder="Contraseña actual" 
		                                    autocomplete="current-password"
		                                >
		                                <span class="input-group-text cursor-pointer" data-toggle-id="1">
		                                    <i class="bi bi-eye"></i>
		                                </span>
		                                <div class="invalid-feedback"></div>
		                            </div>
		                        </div>
		                        <div class="col-12 col-md-6 mb-4 position-relative">
		                            <label for="editProfilePassword" class="form-label">Nueva contraseña</label>
		                            <div class="input-group">       
		                                <input 
		                                    type="password" 
		                                    class="form-control password-field" 
		                                    id="editProfilePassword" 
		                                    name="editProfilePassword" 
		                                    data-toggle-id="2" 
		                                    placeholder="Actualizar contraseña" 
		                                    autocomplete="new-password"
		                                >
		                                <span class="input-group-text cursor-pointer" data-toggle-id="2">
		                                    <i class="bi bi-eye"></i>
		                                </span>
		                                <div class="invalid-feedback"></div>
		                            </div>
		                        </div>
		                    </fieldset>
		                    
		                    <div class="row justify-content-center">
		                        <div class="col-12 col-md-4">
		                        	<!-- Update Button -->
		                        	<button type="submit" class="btn btn-custom-primary w-100 fs-6" id="updateProfileBtn" disabled>
					                    <span id="updateProfileSpinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
					                    <span id="updateProfileText">Actualizar perfil</span>
					                </button>
		                        </div>
		                    </div>
		                </form>
		            </div>
		        </article>
			</div>
    	</section>
	</main>
	
	<!-- Modal for Cropping the Image -->
	<div class="modal fade" id="cropperModal" tabindex="-1" aria-labelledby="cropperModalLabel" aria-hidden="true" data-bs-backdrop="static">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<!-- Modal Header -->
				<div class="modal-header">
					<h5 class="modal-title" id="cropperModalLabel">Recortar foto de perfil</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				
				<!-- Modal Body -->
				<div class="modal-body">
					<div>
						<img id="cropperImage" src="" alt="Imagen para recortar">
					</div>	        
				</div>
				
				<!-- Modal Footer -->
				<div class="modal-footer">
					<!-- Cancel Button -->
					<button type="button" class="btn btn-custom-secondary" data-bs-dismiss="modal">Cancelar</button>
					
					<!-- Upload Button -->
					<button type="button" class="btn btn-custom-primary d-flex align-items-center" id="saveCroppedImage">
					    <span id="savePhotoIcon" class="me-2"><i class="bi bi-upload"></i></span>
					    <span id="savePhotoSpinner" class="spinner-border spinner-border-sm me-2 d-none" role="status" aria-hidden="true"></span>
					    Subir imagen
					</button>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Delete Photo Modal -->
	<div class="modal fade" id="deletePhotoModal" tabindex="-1" aria-labelledby="deletePhotoModalLabel" aria-hidden="true" data-bs-backdrop="static">
		<div class="modal-dialog">
			<div class="modal-content">
				<!-- Modal Header -->
				<div class="modal-header">
					<h5 class="modal-title" id="deletePhotoModalLabel">Confirmar eliminación</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
				</div>
				
				<!-- Modal Body -->
				<div class="modal-body">
					<p>¿Estás seguro de que deseas eliminar tu foto de perfil?</p>
				</div>
				
				<!-- Modal Footer -->
				<div class="modal-footer">
					<!-- Cancel Button -->
					<button type="button" class="btn btn-custom-secondary d-flex align-items-center" data-bs-dismiss="modal">Cancelar</button>
					
					<!-- Delete Button -->
					<button type="button" class="btn btn-danger d-flex align-items-center" id="confirmDeletePhoto">
	                    <span id="deletePhotoIcon" class="me-2"><i class="bi bi-trash"></i></span>
	                    <span id="deletePhotoSpinner" class="spinner-border spinner-border-sm me-2 d-none" role="status" aria-hidden="true"></span>
	                    Eliminar
	                </button>
				</div>
			</div>
		</div>
	</div>

	<!-- Toast Container -->
	<div class="toast-container" id="toast-container">
		<!-- Toasts will be added here by JavaScript -->
	</div>

	<!-- External Libraries -->
	<script src="https://code.jquery.com/jquery-3.7.1.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/cropperjs@1.5.12/dist/cropper.min.js" defer></script>

	<!-- Custom Scripts -->
	<script src="js/layout/header.js" defer></script>
	<script src="js/layout/sidebar.js" defer></script>
	<script src="js/utils/ui/password.js" defer></script>
	<script type="module" src="js/views/user/profile.js" defer></script>
</body>
</html>