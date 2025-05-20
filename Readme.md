:

🎓 **Online AcademicAxis Management System**


A full-stack academic management platform built using the MERN (MongoDB, Express.js, React, Node.js) stack. This system is designed to digitize academic operations such as managing students, lecturers, departments, courses, and results. It features separate interfaces for administrators, lecturers, and students.

## Features

### For Students
- User authentication and profile management
- View and enroll in courses
- Select a teacher
- Take online examinations
- View exam results and performance statistics
- Track enrolled courses and progress

### For Teachers
- User authentication and profile management
- Create and manage courses
- Create and administer online examinations
- View student performance and results
- Manage enrolled students

### For Administrators
- User management (students and teachers)
- Block/unblock users
- View system statistics
- Manage exam results

## Tech Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Frontend       | React, Bootstrap, Axios |
| Backend        | Node.js, Express.js     |
| Database       | MongoDB (Mongoose ODM)  |
| Authentication | JWT (JSON Web Tokens)   |
| API Testing    | Postman                 |


## Project Structure

```
project/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── admin/          # Admin-specific components
│       ├── teacher/        # Teacher-specific components
│       ├── student/        # Student-specific components
│       ├── shared/         # Shared components and utilities
│       └── App.js          # Main application component
│
├── server/                 # Backend Node.js application
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── websocket/          # WebSocket handlers
│   └── server.js           # Main server file
│
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/kkmanuu/online-academicaxis-management-system/
cd online-examination-system
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam-system
JWT_SECRET=your_jwt_secret
```

5. Start the development servers

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Student Routes
- GET `/api/student/my-teacher` - Get enrolled teacher
- GET `/api/student/available-teachers` - Get available teachers
- POST `/api/student/select-teacher/:teacherId` - Select a teacher
- GET `/api/student/available-courses` - Get available courses
- GET `/api/student/enrolled-courses` - Get enrolled courses
- POST `/api/student/enroll/:courseId` - Enroll in a course
- GET `/api/student/results` - Get exam results

### Teacher Routes
- GET `/api/teacher/courses` - Get teacher's courses
- POST `/api/teacher/courses` - Create a new course
- GET `/api/teacher/students` - Get enrolled students
- GET `/api/teacher/exams` - Get teacher's exams
- POST `/api/teacher/exams` - Create a new exam

### Admin Routes
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/:id/block` - Toggle user block status
- GET `/api/admin/students` - Get all students
- GET `/api/admin/results` - Get all exam results


## : Authors <a name="authors"></a>
- *Emmanuel Kipngeno*
- GitHub: [@githubhandle](https://github.com/kkmanuu)
- Twitter: [@twitterhandle](https://twitter.com/kkmanuu)
- LinkedIn: [LinkedIn](https://www.linkedin.com/in/emmanuel-kipngeno-879370242/)
## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is [MIT](./LICENSE.md) licensed.
<p align="right">(<a href="#readme-top">back to top</a>)</p>
