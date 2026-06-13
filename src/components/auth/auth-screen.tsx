
"use client";

import { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBasket, Mail, Lock, User, Phone, Chrome, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function AuthScreen() {
  const auth = useAuth();
  const db = useFirestore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords mismatch", description: "Password and Confirm Password must be same." });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!", description: "Successfully logged in." });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        const customerData = {
          name: name,
          email: email,
          phone: phoneNumber,
          joinedAt: new Date().toISOString(),
          totalOrders: 0,
          totalSpent: 0,
          uid: user.uid
        };

        // Non-blocking write for production
        setDoc(doc(db, "customers", user.uid), customerData)
          .catch(async () => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: `customers/${user.uid}`,
              operation: 'create',
              requestResourceData: customerData
            }));
          });

        toast({ title: "Account created!", description: "Welcome to Grosify!" });
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const customerData = {
        name: user.displayName || "Google User",
        email: user.email,
        phone: user.phoneNumber || "",
        joinedAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0,
        uid: user.uid
      };

      setDoc(doc(db, "customers", user.uid), customerData, { merge: true })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `customers/${user.uid}`,
            operation: 'write',
            requestResourceData: customerData
          }));
        });

    } catch (error: any) {
      toast({ variant: "destructive", title: "Google Sign In Failed", description: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col justify-center gap-8 max-w-sm mx-auto w-full">
        <div className="space-y-3 text-center">
          <div className="bg-primary/10 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <ShoppingBasket className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">
            Gros<span className="text-primary">ify</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            {isLogin ? "Welcome back! Please enter your details." : "Join us to get the freshest groceries delivered."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="Full Name" 
                  className="h-14 pl-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="Phone Number" 
                  className="h-14 pl-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-primary"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              type="email" 
              placeholder="Email Address" 
              className="h-14 pl-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              type="password" 
              placeholder="Password" 
              className="h-14 pl-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                type="password" 
                placeholder="Confirm Password" 
                className="h-14 pl-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-primary"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <Button 
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <span className="flex items-center gap-2">
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Or continue with</span></div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGoogleSignIn}
          className="h-14 rounded-2xl border-gray-100 font-bold flex items-center gap-3 hover:bg-gray-50"
        >
          <Chrome className="w-5 h-5" />
          Google Account
        </Button>

        <p className="text-center text-sm font-medium text-gray-500 pb-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
}
