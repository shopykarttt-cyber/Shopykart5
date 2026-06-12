
"use client";

import { useState, useEffect } from "react";
import { sendEmailVerification, reload, signOut } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, LogOut, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function VerifyEmailScreen() {
  const auth = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResend = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await sendEmailVerification(user);
      toast({ title: "Verification Sent", description: "Please check your inbox." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to send", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!user) return;
    setChecking(true);
    try {
      await reload(user);
      if (user.emailVerified) {
        toast({ title: "Verified!", description: "Your email has been successfully verified." });
        window.location.reload();
      } else {
        toast({ title: "Not verified yet", description: "Please click the link in your email." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-8 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col justify-center gap-8 max-w-sm mx-auto w-full">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200 space-y-8 text-center border border-gray-50">
          <div className="bg-blue-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-12 h-12 text-blue-500" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Verify Email</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              We've sent a verification link to <br/>
              <span className="text-gray-900 font-bold">{user?.email}</span>
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleCheck}
              disabled={checking}
              className="w-full h-14 rounded-2xl bg-primary text-lg font-bold shadow-xl shadow-primary/20"
            >
              {checking ? <Loader2 className="w-6 h-6 animate-spin" /> : "I've Verified My Email"}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleResend}
              disabled={loading}
              className="w-full h-12 rounded-xl text-primary font-bold hover:bg-primary/5"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Resend Link
            </Button>
          </div>
        </div>

        <button 
          onClick={() => signOut(auth)}
          className="flex items-center justify-center gap-2 text-gray-400 font-bold hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out & Use Different Account
        </button>
      </div>
    </div>
  );
}
