import { Container } from '@/components/layout/Container';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <Container>
      <AuthShell>
        <RegisterForm />
      </AuthShell>
    </Container>
  );
}