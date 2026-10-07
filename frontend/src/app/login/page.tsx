import { Container } from '@/components/layout/Container';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Container>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </Container>
  );
}