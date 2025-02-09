# BLOG APPLICATION API

**COMPANY** : CODTECH IT SOLUTIONS

**NAME** : ROHAN KUMAR GUPTA

**INTERN ID** : CT4MKNM

**DOMAIN** : BACKEND WEB DEVELOPMENT

**DURATION** : 4 WEEKS

**MENTOR** : NEELA SANTOSH

## DESCRIPTION OF TASK

The Blog Application API is a backend service designed to facilitate the creation, management, and storage of blog posts. This system enables users to publish articles with images or videos securely while ensuring data persistence using **MongoDB**. Additionally, the API integrates **Cloudinary** for media storage, allowing users to upload and manage images and videos seamlessly.

### Project Overview

The project is developed using **Node.js** and **Express.js** for backend development. It leverages **MongoDB** as the database to store user details, blog posts, and comments. The application also integrates **Cloudinary** for image and video hosting and **JWT** for authentication.

### Technologies Used

1. **Node.js & Express.js:** Backend framework for building API endpoints.
2. **MongoDB & Mongoose:** NoSQL database for storing blog posts, user details, and comments.
3. **Cloudinary:** Cloud-based service for storing and managing images and videos.
4. **JWT (JSON Web Token):** Used for secure authentication and user authorization.
5. **Bcrypt:** Library used for hashing passwords to enhance security.
6. **Multer:** Middleware for handling file uploads.

### Features

1. **User Authentication:**
   - Users can register and log in securely.
   - Passwords are encrypted using Bcrypt.
   - JWT tokens are used for authentication and authorization.

2. **Blog Post Management:**
   - Users can create, update, and delete blog posts.
   - Each post includes a title, content, and an optional image or video with a thumbnail.

3. **Image & Video Upload & Storage:**
   - Blog media (images/videos) are uploaded and stored in Cloudinary.
   - Secure and optimized media handling.

4. **Commenting System:**
   - Users can comment on blog posts.
   - Comments are stored in MongoDB for future reference.

5. **API Integration:**
   - The API is designed to be integrated with any frontend application.
   - Follows RESTful principles for easy scalability.

### Working of the System

1. A user registers by providing an email and password.
2. Upon verification, the user can log in and generate a JWT token.
3. The user can create a blog post with a title, content, and an optional image or video with a thumbnail.
4. Media files are uploaded to Cloudinary and stored with a URL in MongoDB.
5. Users can view, update, and delete their blog posts.
6. Other users can comment on blog posts.
7. Comments are stored in MongoDB for future retrieval.

### How to Use

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up a `.env` file with MongoDB connection string and Cloudinary credentials.

3. Start the API server:
   ```bash
   npm run dev
   ```
4. Access the API documentation at `http://localhost:8000/docs`.

5. Example request to create a new blog post:
   ```bash
   curl -X POST "http://127.0.0.1:8000/posts" -H "Authorization: Bearer <JWT_TOKEN>" -H "Content-Type: application/json" -d '{"title":"My First Blog", "content":"This is the content of my first blog post.", "media":"<Cloudinary URL>", "thumbnail":"<Cloudinary Thumbnail URL>"}'
   ```

### Example API Response

```json
{
  "message": "Blog post created successfully!",
  "success": true,
  "data": {
    "id": "60b5d75bfc13ae4567c12345",
    "title": "My First Blog",
    "content": "This is the content of my first blog post.",
    "media": "https://res.cloudinary.com/demo/video/upload/sample.mp4",
    "thumbnail": "https://res.cloudinary.com/demo/image/upload/sample_thumbnail.jpg"
  }
}
```

### Conclusion

This Blog Application API is a scalable and secure system designed to facilitate blog management. By integrating MongoDB for data storage and Cloudinary for media handling, the system ensures an efficient user experience. Future improvements could include tagging, likes, and user subscriptions for enhanced engagement.

# OUTPUT

Upon running the API and making a request, the system will:
- Register a user and authenticate using JWT.
- Allow users to create, update, and delete blog posts.
- Enable users to upload and store images and videos using Cloudinary.
- Store and retrieve comments from MongoDB.

![Image](https://github.com/user-attachments/assets/ddfc467e-6a32-445e-8de6-6739bf5908e8)

![Image](https://github.com/user-attachments/assets/4f3c2335-75cd-4fa7-912c-1be01f8846dc)

![Image](https://github.com/user-attachments/assets/f8b2c098-6382-4867-ab71-4da3ef75a365)

![Image](https://github.com/user-attachments/assets/8af3aab3-300c-4a41-87b2-56053f699928)

