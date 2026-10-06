import React from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { PageBackground } from '@/components/layout/PageBackground';

export default function LoginPage() {
  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </PageBackground>
  );
}
