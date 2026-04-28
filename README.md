# EWP - Test Preparation Platform

EWP is a production-ready, full-stack web application designed for taking evaluations and academic test preparations. It features a modern, responsive React frontend designed with a premium dark-themed glassmorphism aesthetic, backed by a secure Django REST Framework API using JWT HTTP-only cookies and PostgreSQL.

## 🛠 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (v4)
- React Router DOM
- Custom CSS Properties with Glassmorphism Animations
- Lucide React Icons

**Backend:**
- Django
- Django REST Framework (DRF)
- PostgreSQL
- Simple JWT (Configured for strict HTTP-Only Secure Cookies)

---

## 🚀 Getting Started

To run this application locally, you will need two separate terminal windows—one for the backend and one for the frontend.

### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables:**
   Create a `.env` file in the `backend` folder and configure your database and email settings:
   ```env
   SECRET_KEY=your-super-secret-key
   DEBUG=True
   DB_NAME=ewp_db
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_HOST=127.0.0.1
   DB_PORT=5432
   FRONTEND_URL=http://localhost:5173
   
   # Required for OTP Signup/Reset Password
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_app_password
   ```
5. **Run Migrations and Start the Server:**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser  # Create an admin account
   python manage.py runserver
   ```

### 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install node dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 📝 How to Add Domains and Questions

You can add Domains (like "Articulation", "Mathematics", etc.) and test questions in two different ways.

### Method 1: Using the Django Admin Panel (Granular Control)

If you want to manually manage different distinct domains, tests, and individual questions, the Django Admin panel provides full control.

1. Navigate to `http://127.0.0.1:8000/admin/` and log in with your superuser credentials.
2. Under **Domains**, click "Add" to create a new Domain category.
3. Under **Tests**, click "Add" to create a new Test. Link it to the Domain you just created.
4. Under **Questions** and **Options**, you can manually type out the evaluation questions mapped directly to your new test!

### Method 2: Bulk JSON Upload API (Fast)

If you have hundreds of questions, the backend provides an automated `/api/upload/` endpoint. 
*Note: Currently, this endpoint automatically creates and maps all uploaded queries to the "Articulation" domain, and groups them dynamically into blocks of 30-question tests.*

1. **Prepare your JSON payload.** It must follow this exact structure:
   ```json
   [
     {
       "question": "To enable fruitful conversation in a meeting, one needs to:",
       "options": [
           "Listen to one's interlocutors.",
           "Stick to original opinions.",
           "Give an opportunity to others."
       ],
       "answer": [
           "Listen to one's interlocutors.",
           "Give an opportunity to others."
       ],
       "check_box": true
     }
   ]
   ```
   *(Set `"check_box": false` if there is only a single correct answer in the array).*

2. **Send a POST request** to `http://127.0.0.1:8000/api/upload/` containing your full JSON array using Postman, Curl, or your browser. The backend will automatically map the matching options to the database constraints and format trailing dots reliably.
