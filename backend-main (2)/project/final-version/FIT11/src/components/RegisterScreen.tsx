import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import logo from 'figma:asset/b3d8b34ea9b2d39d49e6a7f9a3f849e348f29c94.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
 // ✅ نضيف الاستدعاء

export function RegisterScreen() {
  const { register } = useAuth(); // ✅ نستدعي register من الـ Context
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gymLevel, setGymLevel] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!gymLevel) newErrors.gymLevel = 'Please select your experience level';

    setErrors(newErrors);
    setErrorMessage(null);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
await register({ firstName, lastName, email, password, gymLevel });
setErrorMessage("✅ Account created successfully! Redirecting to sign in...");
setTimeout(() => {
  window.location.href = "/login";
}, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
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
              <img src={logo} alt="Fit11" className="h-16 md:h-20 mb-2 transition-all" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Join Fit11
            </CardTitle>
            <CardDescription className="text-base md:text-lg">
              Create your account to start your journey
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-transparent md:bg-gradient-to-br md:from-card md:to-accent/5 pt-6 md:p-8 md:pt-0">
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`h-11 ${errors.firstName ? 'border-destructive' : 'border-primary/20 focus:border-primary'}`}
                  />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`h-11 ${errors.lastName ? 'border-destructive' : 'border-primary/20 focus:border-primary'}`}
                  />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-11 ${errors.email ? 'border-destructive' : 'border-primary/20 focus:border-primary'}`}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-11 ${errors.password ? 'border-destructive' : 'border-primary/20 focus:border-primary'}`}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label>Gym Experience Level</Label>
                <Select value={gymLevel} onValueChange={setGymLevel}>
                  <SelectTrigger className={`h-11 ${errors.gymLevel ? 'border-destructive' : 'border-primary/20 focus:border-primary'}`}>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-6 months)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (6-24 months)</SelectItem>
                    <SelectItem value="advanced">Advanced (2+ years)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gymLevel && <p className="text-sm text-destructive">{errors.gymLevel}</p>}
              </div>

              {errorMessage && (
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
