import { createURL } from '../utils/deepLinking';

// Define linking configuration for deep links
export const linking = {
  prefixes: [
    'mediafeedapp://', // Custom URL scheme
    'https://yourdomain.com/', // Universal links for iOS
    'http://yourdomain.com/', // Universal links for iOS (optional)
  ],

  // Custom function to get the initial URL
  async getInitialURL() {
    return null; // Let the default handler work
  },

  // Configuration for mapping URL paths to screens
  config: {
    screens: {
      BlogDetailPage: {
        path: 'blog/:id',
        parse: {
          id: (id) => `${id}`,
        },
      },
      ExploreBlogsPage: 'explore',
      AdminBlogList: 'admin/blogs',
      AdminBlogEdit: {
        path: 'admin/blog/:id/edit',
        parse: {
          id: (id) => `${id}`,
        },
      },
    },
  },

  // Subscribe to URL changes
  subscribe(listener) {
    const onReceiveURL = ({ url }) => {
      listener(url);
    };

    // Listen to incoming links
    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      subscription.remove();
    };
  },
};

export const createDeepLink = (screen, params) => {
  let path = '';
  
  switch (screen) {
    case 'BlogDetailPage':
      path = `blog/${params.id}`;
      break;
    case 'ExploreBlogsPage':
      path = 'explore';
      break;
    case 'AdminBlogList':
      path = 'admin/blogs';
      break;
    case 'AdminBlogEdit':
      path = `admin/blog/${params.id}/edit`;
      break;
    default:
      path = '';
  }

  return createURL(path, params);
};