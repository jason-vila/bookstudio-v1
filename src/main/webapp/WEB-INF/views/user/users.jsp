<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="es" data-bs-theme="auto">
<head>
	<meta charset="UTF-8">
	<meta name="description" content="BookStudio es un sistema de librería para gestionar préstamos, libros, autores y otros recursos, facilitando la administración y seguimiento de los préstamos.">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<jsp:include page="/WEB-INF/includes/styles.jsp"></jsp:include>
	<title>BookStudio</title>
	<link href="images/logo-dark.png" rel="icon" media="(prefers-color-scheme: light)">
	<link href="images/logo-light.png" rel="icon" media="(prefers-color-scheme: dark)">
</head>
<body>
	<!-- ===================== Header ===================== -->
	<jsp:include page="/WEB-INF/includes/header.jsp"></jsp:include>

	<!-- ===================== Sidebar ==================== -->
	<jsp:include page="/WEB-INF/includes/sidebar.jsp">
		<jsp:param name="currentPage" value="users" />
	</jsp:include>

	<!-- ===================== Main Content ==================== -->
	<main class="p-4 bg-body">
		<!-- Card Container -->
		<section id="cardContainer" class="card border">
			<!-- Card Header -->
			<header
				class="card-header d-flex align-items-center position-relative"
				id="buttonGroupHeader">
				<h5 class="card-title text-body-emphasis mb-2 mt-2">
					<i class="bi pe-none me-1 bi-people"></i>
					Tabla de usuarios
				</h5>

				<!-- Excel Button -->
				<button
					class="btn btn-custom-secondary excel d-flex align-items-center me-2"
					id="generateExcel" aria-label="Generar Excel" disabled>
					<span class="me-2"><i class="bi bi-file-earmark-excel text-success"></i></span>
				    <span class="spinner-border spinner-border-sm me-2 text-success d-none" role="status" aria-hidden="true"></span>
					Excel
				</button>

				<!-- PDF Button -->
				<button
					class="btn btn-custom-secondary d-flex align-items-center me-2"
					id="generatePDF" aria-label="Generar PDF" disabled>
					<span class="me-2"><i class="bi bi-file-earmark-pdf text-danger"></i></span>
				    <span class="spinner-border spinner-border-sm me-2 text-danger d-none" role="status" aria-hidden="true"></span>
					PDF
				</button>

				<!-- Add Button -->
				<button class="btn btn-custom-primary d-flex align-items-center"
					data-bs-toggle="modal" data-bs-target="#addUserModal"
					aria-label="Agregar usuario" disabled>
					<i class="bi bi-plus-lg me-2"></i>
					Agregar
				</button>
			</header>

			<!-- Card Body -->
			<div class="card-body">
				<!-- Loading Spinner -->
				<div id="spinnerLoad"
					class="d-flex justify-content-center align-items-center my-5">
					<div class="spinner-border" role="status">
						<span class="visually-hidden">Cargando...</span>
					</div>
				</div>

				<!-- Table Container -->
				<section id="tableContainer" class="d-none small">
					<table id="userTable" class="table table-sm">
						<thead>
							<tr>
								<th scope="col" class="text-start">Código</th>
								<th scope="col" class="text-start">Nombre de usuario</th>
								<th scope="col" class="text-start">Correo electrónico</th>
								<th scope="col" class="text-start">Nombres</th>
								<th scope="col" class="text-start">Apellidos</th>
								<th scope="col" class="text-start">Rol</th>
								<th scope="col" class="text-center">Foto de perfil</th>
								<th scope="col" class="text-center"></th>
							</tr>
						</thead>
						<tbody id="bodyUsers">
							<!-- Data will be populated here via JavaScript -->
						</tbody>
					</table>
				</section>
			</div>
		</section>
	</main>

	<!-- Add User Modal -->
	<div class="modal fade" id="addUserModal" tabindex="-1" aria-labelledby="addUserModalLabel" aria-hidden="true" data-bs-backdrop="static">
	    <div class="modal-dialog modal-lg">
	        <div class="modal-content">
	            <!-- Modal Header -->
	            <header class="modal-header">
	                <h5 class="modal-title text-body-emphasis" id="addUserModalLabel">Agregar usuario</h5>
	                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	            </header>
	            
	            <!-- Modal Body -->
	            <div class="modal-body">
	                <form id="addUserForm" enctype="multipart/form-data" novalidate>
	                    <!-- Username and Email Section -->
	                    <div class="row">
	                        <!-- Username Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="addUserUsername" class="form-label">Nombre de usuario <span class="text-danger">*</span></label>
	                            <input 
	                                type="text" 
	                                class="form-control" 
	                                id="addUserUsername" 
	                                name="addUserUsername" 
	                                placeholder="Ingrese su nombre de usuario" 
	                                pattern="[A-Za-zÀ-ÿ0-9_]+" 
									oninput="this.value = this.value.replace(/[^A-Za-zÀ-ÿ0-9_]/g, '');" 
	                                required
	                            >
	                            <div class="invalid-feedback"></div>
	                        </div>
	                        
	                        <!-- Email Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="addUserEmail" class="form-label">Correo electrónico <span class="text-danger">*</span></label>
	                            <input 
	                                type="email" 
	                                class="form-control" 
	                                id="addUserEmail" 
	                                name="addUserEmail" 
	                                placeholder="ejemplo@correo.com" 
	                                required
	                            >
	                            <div class="invalid-feedback"></div>
	                        </div>
	                    </div>
	                    
	                    <!-- First Name and Last Name Section -->
	                    <div class="row">
	                        <!-- First Name Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="addUserFirstName" class="form-label">Nombres <span class="text-danger">*</span></label>
	                            <input 
	                                type="text" 
	                                class="form-control" 
	                                id="addUserFirstName" 
	                                name="addUserFirstName" 
	                                pattern="[A-Za-zÀ-ÿ\s]+" 
	                                oninput="this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');" 
	                                placeholder="Ingrese sus nombres" 
	                                required
	                            >
	                            <div class="invalid-feedback"></div>
	                        </div>
	                        
	                        <!-- Last Name Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="addUserLastName" class="form-label">Apellidos <span class="text-danger">*</span></label>
	                            <input 
	                                type="text" 
	                                class="form-control" 
	                                id="addUserLastName" 
	                                name="addUserLastName" 
	                                pattern="[A-Za-zÀ-ÿ\s]+" 
	                                oninput="this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');" 
	                                placeholder="Ingrese sus apellidos" 
	                                autocomplete="family-name" 
	                                required
	                            >
	                            <div class="invalid-feedback"></div>
	                        </div>
	                    </div>
	                    
	                    <!-- Password and Confirm Password Section -->
	                    <div class="row">
	                        <!-- Password Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="addUserPassword" class="form-label">Contraseña <span class="text-danger">*</span></label>
	                            <div class="input-group">
	                                <input 
	                                    type="password" 
	                                    class="form-control password-field" 
	                                    data-toggle-id="1" 
	                                    id="addUserPassword" 
	                                    name="addUserPassword" 
	                                    placeholder="Ingrese una contraseña" 
	                                    autocomplete="new-password" 
	                                    required
	                                >
	                                <span class="input-group-text cursor-pointer" data-toggle-id="1">
	                                    <i class="bi bi-eye"></i>
	                                </span>
	                                <div class="invalid-feedback"></div>
	                            </div>
	                        </div>
	                        
	                        <!-- Confirm Password Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="addUserConfirmPassword" class="form-label">Confirmar contraseña <span class="text-danger">*</span></label>
	                            <div class="input-group">
	                                <input 
	                                    type="password" 
	                                    class="form-control password-field" 
	                                    data-toggle-id="2" 
	                                    id="addUserConfirmPassword" 
	                                    placeholder="Confirme su contraseña" 
	                                    autocomplete="new-password" 
	                                    required
	                                >
	                                <span class="input-group-text cursor-pointer" data-toggle-id="2">
	                                    <i class="bi bi-eye"></i>
	                                </span>
	                                <div class="invalid-feedback"></div>
	                            </div>
	                        </div>
	                    </div>
	                    
	                    <!-- Role and Profile Photo Section -->
	                    <div class="row">
	                        <!-- Role Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="addUserRole" class="form-label">Rol <span class="text-danger">*</span></label>
	                            <select 
	                                class="selectpicker form-control placeholder-color" 
	                                id="addUserRole" 
	                                name="addUserRole" 
	                                title="Seleccione un rol" 
	                                required
	                            >
	                                <!-- Options will be dynamically populated via JavaScript -->
	                            </select>
	                            <div class="invalid-feedback"></div>
	                        </div>
	                        
	                        <!-- Profile Photo Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="addUserProfilePhoto" class="form-label">Foto de perfil</label>
	                            <input 
	                                type="file" 
	                                class="form-control" 
	                                id="addUserProfilePhoto" 
	                                name="addUserProfilePhoto" 
	                                accept="image/*"
	                            >
	                            <div class="invalid-feedback"></div>
	                        </div>
	                    </div>
	                    
	                    <!-- Default Photo Section -->
						<div class="row">
							<div class="col-md-12 d-flex justify-content-center">
								<div id="defaultAddPhotoContainer" class="text-center" style="max-width: 180px;">
									<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" fill="currentColor" class="bi-person-circle" viewBox="0 0 16 16">
										<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
										<path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
						            </svg>
								</div>
							</div>
						</div>

						<!-- Image Cropper Section -->
	                    <div id="cropperContainerAdd" class="d-none">
	                        <img id="imageToCropAdd" src="#" alt="Imagen" />
	                    </div>
	                    
	                    <!-- Delete Photo Section -->
						<div class="row">
							<div class="col-md-12 d-flex justify-content-center">
								<!-- Delete Photo Button -->
								<button type="button" class="btn btn-sm btn-danger d-flex align-items-center mt-2 d-none" id="deleteAddPhotoBtn">
									<i class="bi bi-trash me-2"></i>
									Eliminar foto
								</button>
							</div>
						</div>
	                </form>
	            </div>
	            
	            <!-- Modal Footer -->
	            <footer class="modal-footer">
	            	<!-- Cancel Button -->
	                <button type="button" class="btn btn-custom-secondary" data-bs-dismiss="modal">Cancelar</button>
	                
	                <!-- Add Button -->
	                <button type="submit" class="btn btn-custom-primary d-flex align-items-center" form="addUserForm" id="addUserBtn">
	                    <span id="addUserIcon" class="me-2"><i class="bi bi-plus-lg"></i></span>
	                    <span id="addUserSpinnerBtn" class="spinner-border spinner-border-sm me-2 d-none" role="status" aria-hidden="true"></span>
	                    Agregar
	                </button>
	            </footer>
	        </div>
	    </div>
	</div>
	
	<!-- User Details Modal -->
	<div class="modal fade" id="detailsUserModal" tabindex="-1" aria-labelledby="detailsUserModalLabel" aria-hidden="true">
	    <div class="modal-dialog modal-lg">
	        <div class="modal-content">
	            <!-- Modal Header -->
	            <header class="modal-header">
	                <h5 class="modal-title text-body-emphasis" id="detailsUserModalLabel">Detalles del usuario 
	                	<span class="badge bg-body-tertiary text-body-emphasis border ms-1" id="detailsUserModalID"></span>
	                </h5>
	                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	            </header>
	            
	            <!-- Modal Body -->
	            <div class="modal-body">
	            	<div id="detailsUserSpinner" class="text-center my-5">
						<div class="spinner-border" role="status">
						  <span class="visually-hidden">Cargando...</span>
						</div>
					</div>
					
	            	<div id="detailsUserContent" class="d-none">
		                <!-- ID and Username Section -->
		                <div class="row">
		                    <div class="col-md-6 mb-3">
		                        <h6 class="small text-muted">Código</h6>
		                        <p class="badge bg-body-tertiary text-body-emphasis border" id="detailsUserID"></p>
		                    </div>
		                    
		                    <div class="col-md-6 mb-3">
		                        <h6 class="small text-muted">Nombre de usuario</h6>
		                        <p class="fw-bold" id="detailsUserUsername"></p>
		                    </div>
		                </div>
		                
		                <!-- Email and First Name Section -->
		                <div class="row">
		                    <div class="col-md-6 mb-3">
		                        <h6 class="small text-muted">Correo electrónico</h6>
		                        <p class="fw-bold" id="detailsUserEmail"></p>
		                    </div>
		                    
		                    <div class="col-md-6 mb-3">
		                        <h6 class="small text-muted">Nombres</h6>
		                        <p class="fw-bold" id="detailsUserFirstName"></p>
		                    </div>
		                </div>
		                
		                <!-- Last Name and Password Section -->
		                <div class="row">
		                    <div class="col-md-6 mb-3">
		                        <h6 class="small text-muted">Apellidos</h6>
		                        <p class="fw-bold" id="detailsUserLastName"></p>
		                    </div>
		                    
		                    <div class="col-md-6 mb-3">
		                        <h6 class="small text-muted">Rol</h6>
		                        <p class="badge bg-body-secondary text-body-emphasis border" id="detailsUserRole"></p>
		                    </div>
		                </div>
		                
		                <!-- Role and Profile Photo Section -->
		                <div class="row">
		                    <div class="col-md-6 mb-3">
		                        <h6 class="small text-muted">Foto de perfil</h6>
		                        <svg id="detailsUserSvg" xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="currentColor" class="bi-person-circle" viewBox="0 0 16 16">
									<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
									<path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
					            </svg>
					            <img id="detailsUserImg" src="" class="img-fluid rounded-circle" style="width: 120px; height: 120px;" alt="Foto del Usuario">
		                    </div>
		                </div>
					</div>
	            </div>
	            
	            <!-- Modal Footer -->
	            <footer class="modal-footer">
	            	<!-- Close Button -->
	                <button type="button" class="btn btn-custom-secondary" data-bs-dismiss="modal">Cerrar</button>
	            </footer>
	        </div>
	    </div>
	</div>
	
	<!-- Edit User Modal -->
	<div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true" data-bs-backdrop="static">
	    <div class="modal-dialog modal-lg">
	        <div class="modal-content">
	            <!-- Modal Header -->
	            <header class="modal-header">
	                <h5 class="modal-title text-body-emphasis" id="editUserModalLabel">
	                	Editar usuario 
						<span class="badge bg-body-tertiary text-body-emphasis border ms-1" id="editUserModalID"></span>
	                </h5>
	                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	            </header>
	            
	            <!-- Modal Body -->
	            <div class="modal-body">
	            	<div id="editUserSpinner" class="text-center my-5">
						<div class="spinner-border" role="status">
						  <span class="visually-hidden">Cargando...</span>
						</div>
					</div>
					
	                <form id="editUserForm" class="d-none" enctype="multipart/form-data" novalidate>
	                    <!-- Username and Email Section -->
	                    <div class="row">
	                        <!-- Username Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="editUserUsername" class="form-label">Nombre de usuario</label>
	                            <input 
	                                type="text" 
	                                class="form-control" 
	                                id="editUserUsername" 
	                                disabled
	                            >
	                        </div>
	                        
	                        <!-- Email Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="editUserEmail" class="form-label">Correo electrónico</label>
	                            <input 
	                                type="email" 
	                                class="form-control" 
	                                id="editUserEmail" 
	                                disabled
	                            >
	                        </div>
	                    </div>
	                    
	                    <!-- First Name and Last Name Section -->
	                    <div class="row">
	                        <!-- First Name Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="editUserFirstName" class="form-label">Nombres <span class="text-danger">*</span></label>
	                            <input 
	                                type="text" 
	                                class="form-control" 
	                                id="editUserFirstName" 
	                                name="editUserFirstName" 
	                                pattern="[A-Za-zÀ-ÿ\s]+" 
	                                oninput="this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');" 
	                                placeholder="Ingrese sus nombres" 
	                                required
	                            >
	                            <div class="invalid-feedback"></div>
	                        </div>
	                        
	                        <!-- Last Name Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="editUserLastName" class="form-label">Apellidos <span class="text-danger">*</span></label>
	                            <input 
	                                type="text" 
	                                class="form-control" 
	                                id="editUserLastName" 
	                                name="editUserLastName" 
	                                pattern="[A-Za-zÀ-ÿ\s]+" 
	                                oninput="this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');" 
	                                placeholder="Ingrese sus apellidos" 
	                                autocomplete="family-name" 
	                                required
	                            >
	                            <div class="invalid-feedback"></div>
	                        </div>
	                    </div>
	                    
	                    <!-- Password and Role Section -->
	                    <div class="row">      
	                        <!-- Role Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="editUserRole" class="form-label">Rol <span class="text-danger">*</span></label>
	                            <select 
	                                class="selectpicker form-control" 
	                                id="editUserRole" 
	                                name="editUserRole" 
	                                required
	                            >
	                                <!-- Options will be dynamically populated via JavaScript -->
	                            </select>
	                        </div>
	                        
	                        <!-- Profile Photo Field -->
	                        <div class="col-md-6 mb-3">
	                            <label for="editUserProfilePhoto" class="form-label">Foto de perfil</label>
	                            <input 
	                                type="file" 
	                                class="form-control" 
	                                id="editUserProfilePhoto" 
	                                name="editUserProfilePhoto" 
	                                accept="image/*"
	                            >
	                            <div class="invalid-feedback"></div>
	                        </div>
	                    </div>
						
						<!-- Current Profile Photo Section -->
						<div class="row">
							<div class="col-md-12 d-flex justify-content-center">
								<div id="currentEditPhotoContainer" class="text-center" style="max-width: 180px;">
									<!-- The current photo will be displayed here -->
								</div>
							</div>
						</div>

						<!-- Image Cropper Section -->
	                    <div id="cropperContainerEdit" class="d-none">
	                        <img id="imageToCropEdit" src="#" alt="Imagen" />
	                    </div>
	                    
	                    <!-- Delete Profile Photo Section -->
						<div class="row">
							<div class="col-md-12 d-flex justify-content-center">
								<!-- Delete Photo Button -->
								<button type="button" class="btn btn-sm btn-danger d-flex align-items-center mt-2 d-none" id="deleteEditPhotoBtn">
									<i class="bi bi-trash me-2"></i>
									Eliminar foto
								</button>
							</div>
						</div>
	                </form>
	            </div>
	            
	            <!-- Modal Footer -->
	            <footer class="modal-footer">
	            	<!-- Cancel Button -->
	                <button type="button" class="btn btn-custom-secondary" data-bs-dismiss="modal">Cancelar</button>
	                
	                <!-- Update Button -->
	                <button type="submit" class="btn btn-custom-primary d-flex align-items-center" form="editUserForm" id="editUserBtn" disabled>
	                    <span id="editUserIcon" class="me-2"><i class="bi bi-floppy"></i></span>
	                    <span id="editUserSpinnerBtn" class="spinner-border spinner-border-sm me-2 d-none" role="status" aria-hidden="true"></span>
	                    Actualizar
	                </button>
	            </footer>
	        </div>
	    </div>
	</div>
	
	<!-- Delete User Modal -->
	<div class="modal fade" id="deleteUserModal" tabindex="-1" aria-labelledby="deleteUserModalLabel" aria-hidden="true" data-bs-backdrop="static">
	    <div class="modal-dialog">
	        <div class="modal-content">
	            <!-- Modal Header -->
	            <div class="modal-header">
	                <h5 class="modal-title text-body-emphasis" id="deleteUserModalLabel">
	                	Confirmación de usuario 
	                	<span class="badge bg-body-tertiary text-body-emphasis border ms-1" id="deleteUserModalID"></span>
	                </h5>
	                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	            </div>
	            
	            <!-- Modal Body -->
	            <div class="modal-body">
	                <p>¿Estás seguro de que deseas eliminar este usuario?</p>
	            </div>
	            
	            <!-- Modal Footer -->
	            <div class="modal-footer">
	                <!-- Cancel Button -->
	                <button type="button" class="btn btn-custom-secondary d-flex align-items-center" data-bs-dismiss="modal">
	                    Cancelar
	                </button>
	                
	                <!-- Delete Button -->
	                <button type="button" class="btn btn-danger d-flex align-items-center" id="confirmDeleteUser">
	                    <span id="confirmDeleteUserIcon" class="me-2"><i class="bi bi-trash"></i></span>
	                    <span id="confirmDeleteUserSpinner" class="spinner-border spinner-border-sm me-2 d-none" role="status" aria-hidden="true"></span>
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

	<jsp:include page="/WEB-INF/includes/scripts.jsp">
		<jsp:param name="currentPage" value="users.js" />
	</jsp:include>

	<script src="js/utils/ui/password.js" defer></script>
</body>
</html>