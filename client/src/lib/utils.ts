// Environment-aware configuration
export const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'elmas.website';
export const devDomain = 'localhost:3001';

// Helper function to check if we're in a development environment
export const isDev = () => {
  return process.env.NODE_ENV === 'development' || 
         typeof window !== 'undefined' && (
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1'
         );
};

// Get the appropriate domain based on environment
export const getDomain = () => {
  return isDev() ? devDomain : rootDomain;
};

// Format a tenant URL based on environment and tenant slug
export const getTenantUrl = (slug: string) => {
  if (isDev()) {
    return `${protocol}://${slug}.${devDomain}`;
  }
  return `${protocol}://${slug}.${rootDomain}`;
};
