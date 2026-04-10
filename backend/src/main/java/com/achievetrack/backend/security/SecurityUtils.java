package com.achievetrack.backend.security;

import com.achievetrack.backend.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static AuthenticatedUser getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Not authorized to access this route");
        }
        return user;
    }

    public static boolean isAdmin(AuthenticatedUser user) {
        return user != null && "admin".equalsIgnoreCase(user.role());
    }
}
