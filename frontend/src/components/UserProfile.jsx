import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * UserProfile Component
 * 
 * Security considerations:
 * - Only displays user metadata for the authenticated user viewing their own profile
 * - Validates that the current user matches the profile being viewed
 * - Sanitizes and validates all metadata fields before rendering
 * - Applies defensive programming with null checks and default values
 */
function UserProfile({ user }) {
  const { currentUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Verify that the current authenticated user matches the profile being viewed
    if (currentUser && user && currentUser.id === user.id) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [currentUser, user]);

  // Early return if user data is missing
  if (!user) {
    return (
      <div className="user-profile">
        <p>User profile not available</p>
      </div>
    );
  }

  // Early return if user is not authorized to view this profile
  if (!isAuthorized) {
    return (
      <div className="user-profile">
        <h2>{user?.name ?? 'User Profile'}</h2>
        <p>You do not have permission to view detailed information for this profile.</p>
      </div>
    );
  }

  // Defensive checks and sanitization for metadata
  const metadata = user?.metadata ?? {};
  
  // Validate and sanitize lastLogin
  let lastLogin = 'N/A';
  if (metadata.lastLogin) {
    try {
      const loginDate = new Date(metadata.lastLogin);
      // Verify it's a valid date
      if (!isNaN(loginDate.getTime())) {
        lastLogin = loginDate.toLocaleString();
      }
    } catch (error) {
      console.error('Invalid lastLogin date format', error);
      lastLogin = 'Invalid date';
    }
  }

  // Validate and sanitize preferences
  const preferences = metadata.preferences ?? {};
  const allowedThemes = ['default', 'dark', 'light', 'high-contrast'];
  const theme = allowedThemes.includes(preferences.theme) ? preferences.theme : 'default';

  return (
    <div className="user-profile">
      <h2>{user?.name ?? 'Unknown User'}</h2>
      <div className="profile-metadata">
        <p>Last login: {lastLogin}</p>
        <p>Preferred theme: {theme}</p>
      </div>
    </div>
  );
}

export default UserProfile;
