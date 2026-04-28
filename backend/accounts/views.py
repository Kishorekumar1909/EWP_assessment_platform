from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import logging

from .models import CustomUser, OTP
from .serializers import (
    UserSerializer, RequestOTPSerializer, VerifyOTPSerializer,
    SignupSerializer, ResetPasswordSerializer
)
from .utils import generate_otp, send_otp_email

# NOTE: Minimal Error Handling defined to meet criteria.

class RequestOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            purpose = serializer.validated_data['purpose']

            if purpose == 'signup' and CustomUser.objects.filter(email=email).exists():
                return Response({'error': 'User with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            if purpose == 'forgot_password' and not CustomUser.objects.filter(email=email).exists():
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

            otp = generate_otp()
            try:
                send_otp_email(email, otp, purpose)
                return Response({'message': 'OTP sent successfully to email.'})
            except Exception as e:
                logging.error(f"OTP Email failure: {e}")
                return Response({'error': 'Failed to send OTP.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            purpose = serializer.validated_data['purpose']

            otp_record = OTP.objects.filter(email=email, otp=otp, purpose=purpose).first()
            if not otp_record:
                return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if timezone.now() > otp_record.created_at + timedelta(minutes=10):
                return Response({'error': 'OTP expired.'}, status=status.HTTP_400_BAD_REQUEST)
            
            otp_record.is_verified = True
            otp_record.save()
            return Response({'message': 'OTP verified successfully.'})
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            username = serializer.validated_data.get('username', '')

            otp_record = OTP.objects.filter(email=email, purpose='signup', is_verified=True).first()
            if not otp_record:
                return Response({'error': 'Email not verified.'}, status=status.HTTP_400_BAD_REQUEST)

            user = CustomUser.objects.create_user(email=email, password=password, username=username)
            otp_record.delete()  # Clean up

            # Optional: auto login, but let's encourage them to login
            return Response({'message': 'User registered successfully.'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            response = Response({
                'message': 'Login successful.',
                'user': UserSerializer(user).data
            })
            
            from django.conf import settings
            # Set cookies securely based on settings
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=str(refresh.access_token),
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            return response
            
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [AllowAny] # You can potentially only let authed users logout but usually AllowAny is fine to clear cookies

    def post(self, request):
        response = Response({'message': 'Logged out successfully.'})
        from django.conf import settings
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
        response.delete_cookie('refresh_token')
        return response


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            otp_record = OTP.objects.filter(email=email, purpose='forgot_password', is_verified=True).first()
            if not otp_record:
                return Response({'error': 'Email not verified.'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = CustomUser.objects.filter(email=email).first()
            if user:
                user.set_password(password)
                user.save()
                otp_record.delete()
                return Response({'message': 'Password reset successful.'})
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
