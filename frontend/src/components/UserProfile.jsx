import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * UserProfile component - Displays user metadata with proper authorization checks
 * 
 * Security considerations:
 * - Only displays metadata for the currently authenticated user
 * - Validates ownership before rendering sensitive fields (lastLogin, preferences)
 * - Uses defensive checks and default values for all metadata access
 * - Masks sensitive information if viewing another user's profile
 */
function UserProfile({ user }) {
  // Get the currently authenticated user from context
  const { currentUser } = useContext(AuthContext);
  
  // Add defensive checks and defaults
  const metadata = user?.metadata ?? {};
  const preferences = metadata.preferences ?? {};
  
  // Authorization check: only show sensitive metadata to the profile owner
  const isOwnProfile = currentUser && user && currentUser.id === user.id;
  
  // Safely render lastLogin only for the profile owner
  const lastLogin = isOwnProfile && metadata.lastLogin 
    ? new Date(metadata.lastLogin).toLocaleString() 
    : null;
  
  // Safely render preferences only for the profile owner
  const preferredTheme = isOwnProfile && preferences.theme 
    ? preferences.theme 
    : null;

  return (
    <div className="user-profile">
      <h2>{user?.name ?? 'Unknown User'}</h2>
      
      {/* Only render sensitive metadata for the profile owner */}
      {isOwnProfile && lastLogin && (
        <p className="user-metadata">Last login: {lastLogin}</p>
      )}
      
      {isOwnProfile && preferredTheme && (
        <p className="user-preferences">Preferred theme: {preferredTheme}</p>
      )}
      
      {!isOwnProfile && (
        <p className="user-note">Some profile details are private.</p>
      )}
    </div>
  );
}

export default UserProfile;
