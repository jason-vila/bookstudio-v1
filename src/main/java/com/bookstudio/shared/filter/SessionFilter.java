package com.bookstudio.shared.filter;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.bookstudio.auth.util.LoginConstants;

@WebFilter("/*")
public class SessionFilter implements Filter {
	private static final String LOGIN_PAGE = "/login";
	private static final String LOGIN_SERVLET = "/LoginServlet";
	private static final String DASHBOARD_PAGE = "/";
	private static final String RESET_PASSWORD_PAGE = "/reset-password";
	private static final String FORGOT_PASSWORD_PAGE = "/forgot-password";
	private static final String RESET_PASSWORD_SERVLET = "/ResetPasswordServlet";
	private static final String FORGOT_PASSWORD_SERVLET = "/ForgotPasswordServlet";
	private static final String VALIDATE_TOKEN_SERVLET = "/ValidateTokenServlet";
	private static final String STATIC_RESOURCES = "/css/";
	private static final String JS_RESOURCES = "/js/";
	private static final String IMAGES_RESOURCES = "/images/";
	private static final String UTILS_RESOURCES = "/utils/";

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		HttpServletResponse httpResponse = (HttpServletResponse) response;

		String type = httpRequest.getParameter("type");
		if ("logout".equals(type)) {
			chain.doFilter(request, response);
			return;
		}

		String contextPath = httpRequest.getContextPath();
		String requestURI = httpRequest.getRequestURI();
		String relativePath = requestURI.substring(contextPath.length());

		HttpSession session = httpRequest.getSession(false);

		if (session != null && session.getAttribute("user") != null) {
			if (relativePath.equals(LOGIN_PAGE) || relativePath.equals(LOGIN_SERVLET)) {
				httpResponse.sendRedirect(contextPath + DASHBOARD_PAGE);
				return;
			}

			if (relativePath.equals(RESET_PASSWORD_PAGE) || relativePath.equals(FORGOT_PASSWORD_PAGE)
					|| relativePath.equals(RESET_PASSWORD_SERVLET) || relativePath.equals(FORGOT_PASSWORD_SERVLET)) {
				httpResponse.sendRedirect(contextPath + DASHBOARD_PAGE);
				return;
			}
			
		    if (relativePath.equals("/users")) {
		        String userRole = (String) session.getAttribute(LoginConstants.ROLE);
		        if (userRole == null || !userRole.equals("administrador")) {
		            httpResponse.sendError(HttpServletResponse.SC_FORBIDDEN);
		            return;
		        }
		    }
		}

		if (session == null || session.getAttribute("user") == null) {
			if (relativePath.equals(LOGIN_PAGE) || relativePath.equals(LOGIN_SERVLET)
					|| relativePath.equals(RESET_PASSWORD_PAGE) || relativePath.equals(FORGOT_PASSWORD_PAGE)
					|| relativePath.equals(RESET_PASSWORD_SERVLET) || relativePath.equals(FORGOT_PASSWORD_SERVLET)
					|| relativePath.equals(VALIDATE_TOKEN_SERVLET)) {
				chain.doFilter(request, response);
				return;
			}
			
			if (!(relativePath.contains(STATIC_RESOURCES) || relativePath.contains(JS_RESOURCES)
					|| relativePath.contains(UTILS_RESOURCES) || relativePath.contains(IMAGES_RESOURCES))) {
				httpResponse.sendRedirect(contextPath + LOGIN_PAGE);
				return;
			}
		}

		chain.doFilter(request, response);
	}

	@Override
	public void destroy() {
	}
}