package com.bookstudio.auth.controller;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import com.bookstudio.auth.dao.PasswordResetTokenDao;
import com.bookstudio.auth.dao.PasswordResetTokenDaoImpl;

@WebServlet("/ResetPasswordServlet")
public class ResetPasswordServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		request.setCharacterEncoding("UTF-8");
		response.setCharacterEncoding("UTF-8");
		response.setContentType("application/json");

		String token = request.getParameter("token");
		String newPassword = request.getParameter("newPassword");

		PasswordResetTokenDao tokenDao = new PasswordResetTokenDaoImpl();
		String jsonResponse;

		if (tokenDao.isTokenValid(token)) {
			String email = tokenDao.getEmailByToken(token);

			boolean updated = tokenDao.updatePassword(token, newPassword);

			if (updated) {
				jsonResponse = "{\"success\": true}";

				if (email != null && !email.trim().isEmpty()) {
					boolean emailSent = sendPasswordChangeEmail(email, request);
					if (!emailSent) {
						System.err.println("No se pudo enviar el correo de aviso de cambio de contraseña.");
					}
				} else {
					System.err.println("No se encontró un email asociado al token.");
				}
			} else {
				jsonResponse = "{\"success\": false, \"message\": \"Ocurrió un error al actualizar la contraseña.\"}";
			}
		} else {
			jsonResponse = "{\"success\": false, \"message\": \"El enlace de restablecimiento ha expirado o es inválido.\"}";
		}

		response.getWriter().write(jsonResponse);
	}

	private boolean sendPasswordChangeEmail(String email, HttpServletRequest request) {
		final String username = System.getenv("BOOKSTUDIO_EMAIL");
		final String password = System.getenv("BOOKSTUDIO_PASSWORD");

		if (username == null || password == null) {
		    System.err.println("Credenciales de email no encontradas en variables de entorno");
		    return false;
		}

		Properties props = new Properties();
		props.put("mail.smtp.auth", "true");
		props.put("mail.smtp.starttls.enable", "true");
		props.put("mail.smtp.host", "smtp.gmail.com");
		props.put("mail.smtp.port", "587");
		props.put("mail.smtp.ssl.trust", "smtp.gmail.com");

		Session session = Session.getInstance(props, new javax.mail.Authenticator() {
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(username, password);
			}
		});

		try {
			Message message = new MimeMessage(session);
			message.setFrom(new InternetAddress(username));
			message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(email));
			message.setSubject("Cambio de contraseña");

			String msg = "<!DOCTYPE html>" + "<html>" + "<head>" + "<meta charset='UTF-8'>" + "<style>"
					+ "body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }"
					+ ".container { max-width: 600px; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }"
					+ ".header img { width: 120px; }"
					+ ".title { font-size: 24px; font-weight: bold; color: #333; text-align: center; }"
					+ ".content { font-size: 16px; color: #555; line-height: 1.5; text-align: center; }"
					+ ".footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }" + "</style>"
					+ "</head>" + "<body>" + "<div class='container'>"
					+ "    <p class='title'>Se cambió tu contraseña</p>"
					+ "    <p class='content'>Se cambió tu contraseña, tal como lo pediste.</p>"
					+ "    <p class='content'>Si no realizaste este cambio, contacta con nuestro soporte inmediatamente.</p>"
					+ "    <p class='footer'>Saludos,<br/>El equipo de BookStudio</p>" + "</div>" + "</body>"
					+ "</html>";

			message.setContent(msg, "text/html; charset=UTF-8");

			Transport.send(message);
			return true;
		} catch (MessagingException e) {
			e.printStackTrace();
			return false;
		}
	}
}
