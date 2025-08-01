export const dashLinks = {
  reader: [
    {
      key: 'profile',
      label: 'Profile',
      icon: 'UserOutlined',
      path: '/dashboard'
    }
  ],
  author: [
    {
      key: 'profile',
      label: 'Profile',
      icon: 'UserOutlined',
      path: '/dashboard'
    },
    {
      key: 'create-post',
      label: 'Create Post',
      icon: 'EditOutlined',
      path: '/dashboard/create-post'
    },
    {
      key: 'my-posts',
      label: 'My Posts',
      icon: 'FileTextOutlined',
      path: '/dashboard/my-posts'
    }
  ],
  admin: [
    {
      key: 'profile',
      label: 'Profile',
      icon: 'UserOutlined',
      path: '/dashboard'
    },
    {
      key: 'create-post',
      label: 'Create Post',
      icon: 'EditOutlined',
      path: '/dashboard/create-post'
    },
    {
      key: 'my-posts',
      label: 'My Posts',
      icon: 'FileTextOutlined',
      path: '/dashboard/my-posts'
    },
    {
      key: 'user-management',
      label: 'User Management',
      icon: 'TeamOutlined',
      path: '/dashboard/user-management'
    },
    {
      key: 'post-management',
      label: 'Post Management',
      icon: 'BookOutlined',
      path: '/dashboard/post-management'
    }
  ]
};

export const getDashLinksForRole = (role) => {
  return dashLinks[role] || dashLinks.reader;
};