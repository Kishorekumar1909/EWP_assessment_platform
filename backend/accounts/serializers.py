from rest_framework import serializers
from .models import CustomUser, OTP
import re

def validate_password_complexity(value):
    if len(value) < 8:
        raise serializers.ValidationError("Password must be at least 8 characters.")
    if not re.search(r'[A-Z]', value):
        raise serializers.ValidationError("Password must contain at least 1 uppercase letter.")
    if not re.search(r'[a-z]', value):
        raise serializers.ValidationError("Password must contain at least 1 lowercase letter.")
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\'":\\|,.<>\/?]', value):
        raise serializers.ValidationError("Password must contain at least 1 special character.")
    return value

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}
        
    def validate_password(self, value):
        return validate_password_complexity(value)

class RequestOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=[c[0] for c in OTP.PURPOSE_CHOICES])

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    purpose = serializers.ChoiceField(choices=[c[0] for c in OTP.PURPOSE_CHOICES])

class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        return validate_password_complexity(value)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate_password(self, value):
        return validate_password_complexity(value)
