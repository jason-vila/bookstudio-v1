<%
    String currentPage = (String) request.getParameter("currentPage");
%>

<!-- External Libraries -->
<script src="https://code.jquery.com/jquery-3.7.1.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/es.min.js" defer></script>
<script src="https://cdn.datatables.net/2.1.8/js/dataTables.js" defer></script>
<script src="https://cdn.datatables.net/2.1.8/js/dataTables.bootstrap5.js" defer></script>
<script src="https://cdn.datatables.net/responsive/3.0.3/js/dataTables.responsive.js" defer></script>
<script src="https://cdn.datatables.net/responsive/3.0.3/js/responsive.bootstrap5.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta3/dist/js/bootstrap-select.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.1/js/i18n/defaults-es_ES.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/cropperjs@1.5.12/dist/cropper.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.30/jspdf.plugin.autotable.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js" defer></script>

<!-- Custom Scripts -->
<script src="js/layout/header.js" defer></script>
<script src="js/layout/sidebar.js" defer></script>

<!-- Page-Specific Script -->
<script type="module" src="js/views/user/<%= currentPage %>" defer></script>