"use client"
import { useRouter } from 'next/navigation';

const SomeComponent = () => {
  const router = useRouter();

  // Redirect to /login
  router.push('/auth/login');

  return (
    <div>
      {/* Redirecting to login... */}
    </div>
  );
};

export default SomeComponent;
