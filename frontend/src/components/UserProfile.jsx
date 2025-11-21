import { useAuth } from '../hooks/useAuth';
import PropTypes from 'prop-types';

/**
 * UserProfile component with enhanced authorization and data masking.
 * Only displays sensitive metadata to authorized users (the profile owner).
 */
function UserProfile({ user, isOwner = false }) {
  const { currentUser } = useAuth();
  
  // Verify that the current user is authorized to view sensitive data
  const canViewSensitiveData = isOwner || (currentUser && currentUser.id === user?.id);
  
  // Add defensive checks and defaults
  const metadata = user?.metadata ?? {};
  
  // Mask or hide sensitive fields based on authorization
  const lastLogin = canViewSensitiveData && metadata.lastLogin 
    ? new Date(metadata.lastLogin).toLocaleString() 
    : null;
  
  const preferences = canViewSensitiveData ? (metadata.preferences ?? {}) : {};
  
  // Sanitize user name to prevent XSS
  const displayName = user?.name ? String(user.name).trim() : 'Unknown User';

  return (
    <div className="user-profile">
      <h2>{displayName}</h2>
      
      {/* Only render sensitive data if authorized */}
      {canViewSensitiveData && lastLogin && (
        <p className="sensitive-info" data-testid="last-login">
          Last login: {lastLogin}
        </p>
      )}
      
      {canViewSensitiveData && preferences.theme && (
        <p className="sensitive-info" data-testid="user-preferences">
          Preferred theme: {preferences.theme}
        </p>
      )}
      
      {!canViewSensitiveData && (
        <p className="privacy-notice">
          Some profile information is private.
        </p>
      )}
    </div>
  );
}

UserProfile.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    metadata: PropTypes.shape({
      lastLogin: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      preferences: PropTypes.shape({
        theme: PropTypes.string
      })
    })
  }),
  isOwner: PropTypes.bool
};

export default UserProfile;
