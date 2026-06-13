import React, { useState } from 'react';
import { useIonRouter } from '@ionic/react';
import RegisterPage from './RegisterPage';
import './Register.css';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RegisterContainer: React.FC = () => {
  const router = useIonRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    company_code: '',
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.company_name || !form.company_code || !form.name || !form.mobile || !form.password) {
      alert('Please fill in all required fields.');
      return;
    }

    if (form.company_code.length !== 3) {
      alert('Company code must be exactly 3 characters.');
      return;
    }

    if (form.password !== form.confirm_password) {
      alert('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        company_name: form.company_name,
        company_code: form.company_code.toUpperCase(),
        name: form.name,
        mobile: form.mobile,
        email: form.email || undefined,
        password: form.password,
        confirm_password: form.confirm_password,
      });

      alert('Registration successful! You can now log in.');
      router.push('/login', 'root', 'replace');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterPage
      onRegister={handleRegister}
      onChange={handleChange}
      loading={loading}
    />
  );
};

export default RegisterContainer;
