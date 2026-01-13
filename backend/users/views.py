from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import User, Expense, Account
from .serializers import UserRegistrationSerializer, UserLoginSerializer, ExpenseSerializer, AccountSerializer
from django.db.models import Sum, Count
from datetime import datetime, timedelta
import calendar
from decimal import Decimal

@api_view(['GET'])
@permission_classes([AllowAny])
def check_username_availability(request):
    username = request.GET.get('username')
    if not username:
        return Response({'error': 'Username parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if username exists
    exists = User.objects.filter(username=username).exists()
    return Response({
        'available': not exists,
        'message': 'Username is available' if not exists else 'Username already exists'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        
        if user:
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_expense(request):
    serializer = ExpenseSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        expense = serializer.save()

        # Adjust account balances according to transaction type
        amount = expense.amount or Decimal('0')

        def adjust_account_by_type(account_type: str, delta: Decimal):
            if not account_type:
                return
            acc = Account.objects.filter(user=expense.user, account_type=account_type).first()
            if acc:
                acc.balance = (acc.balance or Decimal('0')) + Decimal(delta)
                acc.save(update_fields=['balance', 'updated_at'])

        if expense.transaction_type == 'expense':
            adjust_account_by_type(expense.account, -amount)
        elif expense.transaction_type == 'income':
            adjust_account_by_type(expense.account, amount)
        elif expense.transaction_type == 'transfer':
            adjust_account_by_type(expense.transfer_from, -amount)
            adjust_account_by_type(expense.transfer_to, amount)

        return Response({
            'message': 'Transaction created successfully',
            'expense': ExpenseSerializer(expense).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_expenses(request):
    username = request.GET.get('username')
    if not username:
        return Response({'error': 'Username parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
        expenses = Expense.objects.filter(user=user)
        serializer = ExpenseSerializer(expenses, many=True)
        return Response({'expenses': serializer.data})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def update_expense(request, expense_id):
    try:
        expense = Expense.objects.get(id=expense_id)
    except Expense.DoesNotExist:
        return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)

    # Basic ownership check using provided username (since auth is AllowAny)
    username = request.data.get('username')
    if username and expense.user.username != username:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    # Capture old values to reverse their effect
    old_amount = expense.amount or Decimal('0')
    old_type = expense.transaction_type
    old_account = expense.account
    old_from = expense.transfer_from
    old_to = expense.transfer_to

    # Helper to adjust an account by account_type for this expense's user
    def adjust_account(account_type: str, delta: Decimal):
        if not account_type:
            return
        acc = Account.objects.filter(user=expense.user, account_type=account_type).first()
        if acc:
            acc.balance = (acc.balance or Decimal('0')) + Decimal(delta)
            acc.save(update_fields=['balance', 'updated_at'])

    # Reverse old impact
    if old_type == 'expense':
        adjust_account(old_account, old_amount)
    elif old_type == 'income':
        adjust_account(old_account, -old_amount)
    elif old_type == 'transfer':
        adjust_account(old_from, old_amount)
        adjust_account(old_to, -old_amount)

    # Apply update
    serializer = ExpenseSerializer(expense, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        expense = serializer.save()

        # Apply new impact
        new_amount = expense.amount or Decimal('0')
        new_type = expense.transaction_type
        new_account = expense.account
        new_from = expense.transfer_from
        new_to = expense.transfer_to

        if new_type == 'expense':
            adjust_account(new_account, -new_amount)
        elif new_type == 'income':
            adjust_account(new_account, new_amount)
        elif new_type == 'transfer':
            adjust_account(new_from, -new_amount)
            adjust_account(new_to, new_amount)

        return Response({'message': 'Expense updated successfully', 'expense': ExpenseSerializer(expense).data})
    else:
        # If validation fails, re-apply old impact to keep balances consistent
        if old_type == 'expense':
            adjust_account(old_account, -old_amount)
        elif old_type == 'income':
            adjust_account(old_account, old_amount)
        elif old_type == 'transfer':
            adjust_account(old_from, -old_amount)
            adjust_account(old_to, old_amount)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_expense(request, expense_id):
    try:
        expense = Expense.objects.get(id=expense_id)
    except Expense.DoesNotExist:
        return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)

    # Basic ownership check using provided username (since auth is AllowAny)
    username = request.data.get('username') if hasattr(request, 'data') else None
    if username and expense.user.username != username:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    amount = expense.amount or Decimal('0')
    tx_type = expense.transaction_type
    account = expense.account
    transfer_from = expense.transfer_from
    transfer_to = expense.transfer_to

    def adjust_account(account_type: str, delta: Decimal):
        if not account_type:
            return
        acc = Account.objects.filter(user=expense.user, account_type=account_type).first()
        if acc:
            acc.balance = (acc.balance or Decimal('0')) + Decimal(delta)
            acc.save(update_fields=['balance', 'updated_at'])

    # Reverse the effect of the expense before deletion
    if tx_type == 'expense':
        adjust_account(account, amount)
    elif tx_type == 'income':
        adjust_account(account, -amount)
    elif tx_type == 'transfer':
        adjust_account(transfer_from, amount)
        adjust_account(transfer_to, -amount)

    expense.delete()
    return Response({'message': 'Expense deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_expense_summary(request):
    username = request.GET.get('username')
    if not username:
        return Response({'error': 'Username parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
        
        # Get current month expenses
        now = datetime.now()
        current_month = now.month
        current_year = now.year
        
        monthly_expenses = Expense.objects.filter(
            user=user,
            date__month=current_month,
            date__year=current_year
        )
        
        monthly_total = monthly_expenses.aggregate(total=Sum('amount'))['total'] or 0
        monthly_transactions = monthly_expenses.count()
        
        # Get all time total
        total_expenses = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        
        # Get category breakdown
        category_breakdown = monthly_expenses.values('category').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        return Response({
            'monthly_total': monthly_total,
            'total_expenses': total_expenses,
            'monthly_transactions': monthly_transactions,
            'category_breakdown': list(category_breakdown)
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_accounts(request):
    username = request.GET.get('username')
    if not username:
        return Response({'error': 'Username parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
        accounts = Account.objects.filter(user=user)
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_account(request):
    serializer = AccountSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        # Get user from username in request data
        username = request.data.get('username')
        if username:
            try:
                user = User.objects.get(username=username)
                validated_data = serializer.validated_data
                validated_data['user'] = user
                account = Account.objects.create(**validated_data)
                return Response({
                    'message': 'Account created successfully',
                    'account': AccountSerializer(account).data
                }, status=status.HTTP_201_CREATED)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Username required'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_account(request, account_id):
    try:
        account = Account.objects.get(id=account_id)
        # Verify user owns this account
        username = request.data.get('username')
        if username and account.user.username != username:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AccountSerializer(account, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Account updated successfully',
                'account': AccountSerializer(account).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Account.DoesNotExist:
        return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_account(request, account_id):
    try:
        account = Account.objects.get(id=account_id)
        # Verify user owns this account
        username = request.data.get('username')
        if username and account.user.username != username:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        account.delete()
        return Response({
            'message': 'Account deleted successfully'
        }, status=status.HTTP_200_OK)
    except Account.DoesNotExist:
        return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)
