'use client';

import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <RegisterForm />
    </div>
  );
}