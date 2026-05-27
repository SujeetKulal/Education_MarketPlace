# Education Marketplace

A comprehensive full-stack education marketplace platform built with a Django backend and a React (Vite) frontend.

## 🚀 Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Python, Django
- **Database:** SQLite (Default for development)

## 📂 Project Structure

- `/frontend` - Contains the React application.
- `/backend` - Contains the Django application.

## 🛠️ Getting Started

### Prerequisites

- Node.js & npm (for the frontend)
- Python 3.x (for the backend)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations (if any):
   ```bash
   python manage.py migrate
   ```
5. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 📝 License

This project is licensed under the [MIT License](LICENSE).
