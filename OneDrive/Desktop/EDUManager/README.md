# EDUManager - Education Management System

A comprehensive, modern education management system designed for colleges and universities to manage teachers, subjects, departments, and generate conflict-free timetables automatically.

## 🚀 Features

### Core Management
- **Teacher Management**: Add, edit, and manage faculty members with workload tracking
- **Subject Management**: Create and organize courses with detailed information
- **Department Management**: Organize academic departments and semesters
- **Real-time Dashboard**: Live statistics and analytics with auto-refresh

### Advanced Timetable Generation
- **Automated Timetable Creation**: Upload Excel files to generate conflict-free timetables
- **Conflict Detection**: Intelligent algorithm to avoid faculty and class conflicts
- **Multiple Output Formats**: Generate faculty, class, and department timetables
- **Excel Template Download**: Pre-formatted templates for easy data entry

### Modern User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live data fetching with 30-second refresh intervals
- **Professional Branding**: Clean, modern interface with EDUManager branding
- **Interactive Elements**: Hover effects, loading states, and smooth transitions

## 🛠 Technology Stack

### Frontend
- **React 18** with modern hooks and functional components
- **Tailwind CSS** for responsive, utility-first styling
- **React Router DOM** for client-side routing
- **Vite** for fast development and building

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM for data persistence
- **JWT** for secure authentication
- **Multer** for file upload handling
- **Child Process** for Python script integration

### Python Integration
- **Pandas** for data manipulation and analysis
- **NumPy** for numerical computations
- **OpenPyXL** for Excel file processing
- **Automated Algorithm** for conflict-free timetable generation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager

### Backend Setup
```bash
cd Backend
npm install
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd Frontend/sanjivani
npm install
```

### Environment Configuration
Create a `.env` file in the `Backend` directory:
```env
MONGO_URI=mongodb://localhost:27017/timetable_db
PORT=5000
JWT_SECRET=your-secret-key-here
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd Backend
npm start
```

### Start Frontend Development Server
```bash
cd Frontend/sanjivani
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📊 Dashboard Features

### Real-time Statistics
- Total teachers, subjects, and departments
- Live workload distribution
- Department-wise analytics
- Recent activity tracking

### Interactive Elements
- **Quick Action Buttons**: Direct navigation to key features
- **Live Data Refresh**: Automatic updates every 30 seconds
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages

### Analytics Display
- **Department Overview**: Teacher and subject counts per department
- **Teacher Workload**: Total hours and status indicators
- **Recent Activity**: Timeline of system events
- **Status Indicators**: Color-coded workload levels

## 📅 Timetable Generation

### Excel Upload Process
1. **Download Template**: Get pre-formatted Excel template
2. **Fill Data**: Add teacher, subject, and workload information
3. **Upload File**: Use the "Quick Generate from Excel" feature
4. **Auto-Generation**: System processes and generates timetables
5. **Download Results**: Get faculty, class, and department timetables

### Generated Files
- `faculty_timetable.csv`: Individual teacher schedules
- `class_timetable.csv`: Class-wise timetables
- `department_summary.csv`: Department overview and statistics

### Algorithm Features
- **Conflict Avoidance**: Prevents faculty and class overlaps
- **Workload Balancing**: Distributes sessions evenly
- **Department Separation**: Maintains academic organization
- **Success Rate Tracking**: Provides generation statistics

## 🔐 Authentication

### User Management
- **Secure Login**: JWT-based authentication
- **Account Creation**: Self-registration for new users
- **Role-based Access**: Teacher and admin roles
- **Session Management**: Persistent login sessions

### Security Features
- **Password Hashing**: bcrypt encryption
- **Token-based Auth**: Secure JWT tokens
- **Input Validation**: Server-side data validation
- **Error Handling**: Secure error responses

## 📱 User Interface

### Modern Design
- **Gradient Backgrounds**: Professional color schemes
- **Card-based Layout**: Clean, organized information display
- **Responsive Grid**: Adapts to different screen sizes
- **Interactive Elements**: Hover effects and transitions

### Navigation
- **Sidebar Navigation**: Easy access to all features
- **Breadcrumb Trails**: Clear navigation context
- **Quick Actions**: Direct access to common tasks
- **Status Indicators**: Visual feedback for actions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Add new teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Add new subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Add new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Timetable Generation
- `POST /api/departments/generate-from-excel` - Generate from Excel
- `POST /api/departments/upload-excel` - Upload to database
- `GET /api/departments/download-template` - Download template
- `GET /api/departments/download/:filename` - Download generated files

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **Python Dependencies**: Install all required Python packages
3. **Port Conflicts**: Check if ports 5000 and 5173 are available
4. **File Permissions**: Ensure proper read/write permissions

### Error Handling
- **Network Errors**: Check server connectivity
- **Authentication Errors**: Verify JWT token validity
- **File Upload Errors**: Check file format and size
- **Database Errors**: Verify MongoDB connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**EDUManager** - Empowering Education Management with Modern Technology 