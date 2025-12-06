import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import logo from '../assets/b3d8b34ea9b2d39d49e6a7f9a3f849e348f29c94.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // ✅ نستدعي useAuth

export function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate(); // ✅ نستخدمه للتحويل بعد النجاح

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    setErrorMessage(null);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await login(email, password); // ✅ يتصل فعليًا بالباك إند
      setErrorMessage("✅ Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard"); // ✅ تحويل بعد تسجيل الدخول
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-secondary/30 p-4 overflow-y-auto">
      <div className="w-full max-w-md md:max-w-lg my-8 transition-all duration-300">
        <Card className="border-0 shadow-none md:border-2 md:border-primary/20 md:shadow-2xl bg-transparent md:bg-card">
          <CardHeader className="space-y-4 text-center bg-transparent md:bg-gradient-to-br md:from-card md:to-accent/10 md:p-8">
            <div className="flex justify-center">
              <img src={logo} alt="Fit11" className="h-20 md:h-24 mb-2 transition-all" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base md:text-lg">
              Sign in to continue your fitness journey
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-transparent md:bg-gradient-to-br md:from-card md:to-accent/5 pt-6 md:p-8 md:pt-0">
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-11 ${errors.email ? 'border-destructive' : 'border-primary/20 focus:border-primary'}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-11 ${errors.password ? 'border-destructive' : 'border-primary/20 focus:border-primary'}`}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {errorMessage && (
                <p className={`text-sm text-center ${errorMessage.startsWith('✅') ? 'text-green-600' : 'text-destructive'}`}>
                  {errorMessage}
                </p>
              )}

              <div className="flex justify-end">
                <Button variant="link" className="px-0 h-auto text-primary hover:text-primary/80 text-base">
                  Forgot Password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm md:text-base mt-4 pt-4 border-t border-primary/10">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Create one
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
