import { useEffect, useState } from 'react';
import { getCurrentUser } from '../utils/auth';

/**
 * UserProfile component with proper authorization checks
 * 
 * Security improvements:
 * - Validates that the displayed user matches the authenticated user
 * - Fetches user data through authorized API endpoints
 * - Sanitizes and validates metadata before rendering
 * - Only exposes whitelisted metadata fields
 * - Implements defensive null/undefined checks
 */
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAndLoadUser = async () => {
      try {
        // Get the currently authenticated user
        const currentUser = await getCurrentUser();
        
        // Authorization check: ensure the requested userId matches the authenticated user
        if (!currentUser || currentUser.id !== userId) {
          setIsAuthorized(false);
          setError('Unauthorized: You can only view your own profile');
          return;
        }

        setIsAuthorized(true);
        
        // Fetch user profile data through authorized endpoint
        // The backend should enforce additional authorization
        const response = await fetch(`/api/users/${userId}/profile`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message || 'An error occurred loading the profile');
        setIsAuthorized(false);
      }
    };

    if (userId) {
      verifyAndLoadUser();
    }
  }, [userId]);

  // Sanitize and validate metadata with strict whitelisting
  const getSafeMetadata = (user) => {
    if (!user || !user.metadata) {
      return {
        lastLogin: 'N/A',
        theme: 'default'
      };
    }

    const metadata = user.metadata;
    
    // Whitelist only safe, non-sensitive fields
    const safeMetadata = {
      // Validate and format lastLogin
      lastLogin: metadata.lastLogin 
        ? new Date(metadata.lastLogin).toLocaleString()
        : 'N/A',
      
      // Only expose non-sensitive preference fields
      theme: metadata.preferences?.theme ?? 'default'
    };

    return safeMetadata;
  };

  // Unauthorized access attempt
  if (error && !isAuthorized) {
    return (
      <div className="user-profile error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  // Loading state
  if (!user) {
    return (
      <div className="user-profile loading">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Get sanitized metadata
  const safeData = getSafeMetadata(user);

  return (
    <div className="user-profile">
      <h2>{user?.name ?? 'Unknown User'}</h2>
      
      {/* Only display metadata if properly authorized */}
      {isAuthorized && (
        <>
          <p>Last login: {safeData.lastLogin}</p>
          <p>Preferred theme: {safeData.theme}</p>
        </>
      )}
      
      {/* Additional profile content can be added here */}
    </div>
  );
}

export default UserProfile;
