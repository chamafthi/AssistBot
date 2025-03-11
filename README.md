# Assistbot - Chatbot Application

## Description
Assistbot is a chatbot application built with Django Rest Framework (DRF), PostgreSQL, and Next.js. It integrates Azure OpenAI for AI-powered conversations and stores chat history in PostgreSQL.

## Features
- AI-powered chatbot using **Azure OpenAI**.
- Stores conversation history in **PostgreSQL**.
- Frontend powered by **Next.js**.

## Prerequisites
- **Python 3.x** (Backend)
- **Node.js 16+** (Frontend)
- **PostgreSQL** for the database
- **Azure OpenAI API Key** for the AI model

## Installation

### Backend (Django)

1. Clone the project:
   ```bash
   git clone https://github.com/chamafthi/Assistbot.git
   cd Assistbot
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables in `.env`**:
   Create a `.env` file in the root of the `backend` directory and add the following variables:
   ```env
   AZURE_OPENAI_API_KEY="your_api_key"
   AZURE_OPENAI_API_BASE="https://your_url_azure_openai"
   AZURE_OPENAI_API_VERSION="your_api_version"
   ```

4. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Start the Django server**:
   ```bash
   python manage.py runserver
   ```

### Frontend (Next.js)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
