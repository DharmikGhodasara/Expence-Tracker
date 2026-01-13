# Full-Stack Django + React Application

This is a full-stack web application with Django backend and React frontend.

## Project Structure

```
IP/
├── backend/          # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── core/
│   ├── api/
│   └── ...
├── frontend/         # React frontend
│   ├── package.json
│   ├── public/
│   ├── src/
│   └── ...
└── README.md
```

## Setup Instructions

### Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

The Django backend will be available at `http://localhost:8000`

### Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The React frontend will be available at `http://localhost:3000`

## Features

- Django REST API backend
- React frontend with modern UI
- CORS configuration for cross-origin requests
- Sample API endpoints
- Responsive design

## API Endpoints

- `GET /api/items/` - List all items
- `POST /api/items/` - Create a new item
- `GET /api/items/{id}/` - Get a specific item
- `PUT /api/items/{id}/` - Update an item
- `DELETE /api/items/{id}/` - Delete an item
