import { Linking, Platform } from 'react-native';

// Configure deep linking
export const configureDeepLinking = (navigationRef) => {
  // ✅ Run only on Android
  if (Platform.OS !== 'android') return;

  const handleUrl = (url) => {
    if (!url) return;

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      console.error('Invalid URL:', url);
      return;
    }

    const path = parsedUrl.pathname;
    const params = Object.fromEntries(parsedUrl.searchParams);

    console.log('Deep link received:', url);
    console.log('Path:', path);
    console.log('Params:', params);

    // Navigate based on path
    if (path.includes('/blog/')) {
      const blogId = path.split('/').pop();
      if (blogId) {
        navigationRef.navigate('BlogDetail', { blogId });
      }
    } else if (path.includes('/login')) {
      navigationRef.navigate('Login');
    } else if (path.includes('/signup')) {
      navigationRef.navigate('Signup');
    }
  };

  const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
    handleUrl(url);
  });

  Linking.getInitialURL().then((url) => {
    if (url) {
      handleUrl(url);
    }
  });

  return () => {
    linkingSubscription.remove();
  };
};

// Function to create a deep link
export const createDeepLink = (path, params) => {
  let scheme = 'mediafeedapp://';

  if (Platform.OS === 'ios') {
    scheme = 'https://yourdomain.com/'; // Use your iOS universal link domain here
  }

  let url = `${scheme}${path}`;

  if (params) {
    const queryParams = new URLSearchParams(params).toString();
    url += `?${queryParams}`;
  }

  return url;
};
