(() => {
	'use strict'

	const getStoredTheme = () => localStorage.getItem('theme')
	const setStoredTheme = theme => localStorage.setItem('theme', theme)

	const getPreferredTheme = () => {
		const storedTheme = getStoredTheme()
		if (storedTheme) {
			return storedTheme
		}
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	}

	const setTheme = theme => {
		if (theme === 'auto') {
			const selectedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
			document.documentElement.setAttribute('data-bs-theme', selectedTheme)
		} else {
			document.documentElement.setAttribute('data-bs-theme', theme)
		}
	}

	setTheme(getPreferredTheme())

	const showActiveTheme = (theme, focus = false) => {
		const themeSwitcher = document.querySelector('#bd-theme')
		if (!themeSwitcher) {
			return
		}

		const themeSwitcherText = document.querySelector('#bd-theme-text')
		const activeThemeIcon = document.querySelector('.theme-icon-active')
		const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
		const newIconClass = btnToActive.getAttribute('data-bs-icon')

		activeThemeIcon.classList.forEach(clase => {
			if (clase.startsWith('bi-') && clase !== 'bi') {
				activeThemeIcon.classList.remove(clase)
			}
		})
		activeThemeIcon.classList.add(newIconClass)

		document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
			element.classList.remove('active')
			element.setAttribute('aria-pressed', 'false')
		})

		btnToActive.classList.add('active')
		btnToActive.setAttribute('aria-pressed', 'true')

		const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`
		themeSwitcher.setAttribute('aria-label', themeSwitcherLabel)

		if (focus) {
			themeSwitcher.focus()
		}
	}

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		const storedTheme = getStoredTheme()
		if (storedTheme !== 'light' && storedTheme !== 'dark') {
			setTheme(getPreferredTheme())
		}
	})

	window.addEventListener('DOMContentLoaded', () => {
		const preferredTheme = getPreferredTheme()
		showActiveTheme(preferredTheme)

		document.querySelectorAll('[data-bs-theme-value]')
			.forEach(toggle => {
				toggle.addEventListener('click', () => {
					const theme = toggle.getAttribute('data-bs-theme-value')
					setStoredTheme(theme)
					setTheme(theme)
					showActiveTheme(theme, true)
				})
			})
	})
})()
