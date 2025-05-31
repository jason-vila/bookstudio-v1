const togglePasswordVisibility = () => {
	$('.input-group-text').each(function() {
		$(this).on('click', function() {
			const toggleId = $(this).data('toggle-id');
			const $input = $(`.password-field[data-toggle-id="${toggleId}"]`);
			const $icon = $(this).find('i');

			if ($input.attr('type') === 'password') {
				$input.attr('type', 'text');
				$icon.removeClass('bi-eye').addClass('bi-eye-slash');
			} else {
				$input.attr('type', 'password');
				$icon.removeClass('bi-eye-slash').addClass('bi-eye');
			}
		});
	});
};

togglePasswordVisibility();