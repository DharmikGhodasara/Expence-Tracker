from django.urls import path
from . import views

urlpatterns = [
    path('check-username/', views.check_username_availability, name='check_username'),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('expenses/', views.create_expense, name='create_expense'),
    path('expenses/list/', views.list_expenses, name='list_expenses'),
    path('expenses/<int:expense_id>/update/', views.update_expense, name='update_expense'),
    path('expenses/<int:expense_id>/delete/', views.delete_expense, name='delete_expense'),
    path('expenses/summary/', views.get_expense_summary, name='expense_summary'),
    path('accounts/', views.list_accounts, name='list_accounts'),
    path('accounts/create/', views.create_account, name='create_account'),
    path('accounts/<int:account_id>/update/', views.update_account, name='update_account'),
    path('accounts/<int:account_id>/delete/', views.delete_account, name='delete_account'),
]
