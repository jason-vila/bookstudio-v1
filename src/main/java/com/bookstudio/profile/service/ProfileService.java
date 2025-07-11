package com.bookstudio.profile.service;

import javax.servlet.http.Part;

import com.bookstudio.auth.util.LoginConstants;
import com.bookstudio.auth.util.PasswordUtils;
import com.bookstudio.profile.dao.ProfileDao;
import com.bookstudio.profile.dao.ProfileDaoImpl;
import com.bookstudio.user.dao.UserDao;
import com.bookstudio.user.dao.UserDaoImpl;
import com.bookstudio.user.model.User;

import javax.servlet.http.HttpServletRequest;

public class ProfileService {
	private ProfileDao profileDao = new ProfileDaoImpl();
	private UserDao userDao = new UserDaoImpl();

	public User updateProfile(HttpServletRequest request) throws Exception {
		String userId = (String) request.getSession().getAttribute(LoginConstants.ID);
		String firstName = request.getParameter("editProfileFirstName");
		String lastName = request.getParameter("editProfileLastName");
		String password = request.getParameter("editProfilePassword");

		User user = new User();
		user.setUserId(userId);
		user.setFirstName(firstName);
		user.setLastName(lastName);
		
	    if (password != null && !password.isEmpty()) {
	        user.setPassword(PasswordUtils.hashPassword(password));
	    } else {
	        user.setPassword(null);
	    }

		return profileDao.updateProfile(user);
	}

	public User updateProfilePhoto(HttpServletRequest request) throws Exception {
		String userId = (String) request.getSession().getAttribute(LoginConstants.ID);
		byte[] profilePhoto = null;
		String deletePhoto = request.getParameter("deletePhoto");

		if ("true".equals(deletePhoto)) {
			profilePhoto = null;
		} else {
			Part photoPart = request.getPart("editProfilePhoto");
			if (photoPart != null && photoPart.getSize() > 0) {
				profilePhoto = new byte[(int) photoPart.getSize()];
				photoPart.getInputStream().read(profilePhoto);
			} else {
				User currentUser = userDao.getById(userId);
				if (currentUser != null) {
					profilePhoto = currentUser.getProfilePhoto();
				}
			}
		}

		User user = new User();
		user.setUserId(userId);
		user.setProfilePhoto(profilePhoto);

		return profileDao.updateProfilePhoto(user);
	}

	public boolean validatePassword(HttpServletRequest request) {
		String confirmCurrentPassword = request.getParameter("confirmCurrentPassword").trim();
		String userId = (String) request.getSession().getAttribute(LoginConstants.ID);
		
	    if (userId == null || confirmCurrentPassword.isEmpty()) {
	        return false;
	    }
	    
	    String hashedPassword = profileDao.getPasswordByUserId(userId);

	    if (hashedPassword == null) {
	        return false;
	    }
	    
	    return PasswordUtils.checkPassword(confirmCurrentPassword, hashedPassword);
	}
}
