import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useWindowDimensions, StyleSheet } from 'react-native';
import HomeScreen from '../screens/common/HomeScreen';
import BlogPage from '../screens/blog/BlogPage';
import ExploreBlogsPage from '../screens/blog/ExploreBlogsPage';
import AdminBlogList from '../screens/admin/AdminBlogList';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const dimensions = useWindowDimensions();
  
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        drawerPosition: 'left',
        drawerType: dimensions.width >= 768 ? 'permanent' : 'front',
        swipeEnabled: dimensions.width < 768,
        drawerStyle: styles.drawerStyle,
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerStatusBarAnimation: 'slide',
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Blogs" component={BlogPage} />
      <Drawer.Screen name="ExploreBlogsPage" component={ExploreBlogsPage} options={{ drawerLabel: 'Explore' }} />
      <Drawer.Screen name="Admin" component={AdminBlogList} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerStyle: {
    width: '70%',
    maxWidth: 280,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20
  }
});

export default DrawerNavigator;