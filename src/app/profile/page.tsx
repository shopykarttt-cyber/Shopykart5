
"use client";

import { useState, useMemo } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Settings, CreditCard, Heart, MapPin, ShieldCheck, HelpCircle, LogOut, Edit3, Loader2, Save } from "lucide-react";
import { useAuth, useUser, useDoc, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function ProfilePage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  
  const customerRef = useMemo(() => user ? doc(db, "customers", user.uid) : null, [db, user]);
  const { data: customerData, loading } = useDoc(customerRef);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleEdit = () => {
    if (customerData) {
      setFormData({
        name: customerData.name || "",
        phone: customerData.phone || "",
        address: customerData.address || ""
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!user || !customerRef) return;
    setSaving(true);
    const data = {
      ...formData,
      updatedAt: new Date().toISOString()
    };

    updateDoc(customerRef, data)
      .then(() => {
        toast({ title: "Profile Updated", description: "Your changes have been saved." });
        setIsEditing(false);
        setSaving(false);
      })
      .catch(async () => {
        setSaving(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: customerRef.path,
          operation: 'update',
          requestResourceData: data
        } satisfies SecurityRuleContext));
      });
  };

  const menuItems = [
    { icon: Heart, label: "Favorites", color: "text-pink-500", bg: "bg-pink-50" },
    { icon: MapPin, label: "Addresses", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: CreditCard, label: "Payments", color: "text-green-500", bg: "bg-green-50" },
    { icon: ShieldCheck, label: "Privacy & Security", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: HelpCircle, label: "Help Center", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Settings, label: "Settings", color: "text-gray-500", bg: "bg-gray-50" },
  ];

  if (loading) return null;

  return (
    <>
      <div className="flex-1 space-y-8 pb-32">
        <div className="bg-black pt-16 pb-12 px-8 rounded-b-[4rem] text-white flex flex-col items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-8 translate-x-8"></div>
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-[#D4AF37]/20 premium-shadow">
              <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} />
              <AvatarFallback className="bg-gray-800 text-white font-black">{customerData?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <button onClick={handleEdit} className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-black">
              <Edit3 className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="text-center space-y-1 z-10">
            <h2 className="text-2xl font-black italic tracking-tight uppercase leading-none">
              {customerData?.name || "Grosify User"}
            </h2>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">{customerData?.email}</p>
          </div>
        </div>

        <div className="px-6 -mt-6">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-gray-50 grid grid-cols-2 gap-4">
            <div className="text-center space-y-1 border-r border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Spent</p>
              <h4 className="text-xl font-black italic">₹{customerData?.totalSpent || 0}</h4>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</p>
              <h4 className="text-xl font-black italic">{customerData?.totalOrders || 0}</h4>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="px-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <Card className="p-8 rounded-[2.5rem] space-y-4 border-none shadow-xl">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Full Name</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Phone Number</label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Default Address</label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 h-14 rounded-2xl font-bold">Cancel</Button>
                <Button disabled={saving} onClick={handleSave} className="flex-1 h-14 rounded-2xl bg-primary gap-2 font-bold">
                  {saving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                  Save
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="px-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {menuItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button key={idx} className="bg-white p-5 rounded-[2rem] premium-shadow flex items-center justify-between group transition-all hover:bg-gray-50 active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className={`${item.bg} p-3 rounded-2xl`}>
                        <Icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <span className="font-bold text-gray-700">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                  </button>
                );
              })}
              
              <button 
                onClick={handleSignOut}
                className="bg-red-50 p-5 rounded-[2rem] flex items-center justify-between group transition-all hover:bg-red-100 mt-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-red-500/10 p-3 rounded-2xl">
                    <LogOut className="w-6 h-6 text-red-500" />
                  </div>
                  <span className="font-bold text-red-500">Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
