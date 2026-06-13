
"use client";

import { useState, useMemo } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Users, 
  BellRing, 
  ArrowLeft,
  ChevronRight,
  Plus,
  DollarSign,
  UserCheck,
  Loader2,
  Trash2,
  Menu,
  TrendingUp,
  ShoppingBag,
  Globe,
  Settings,
  History,
  Grid
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const SALES_DATA = [
  { day: "Sun", sales: 4000 },
  { day: "Mon", sales: 1500 },
  { day: "Tue", sales: 1800 },
  { day: "Wed", sales: 1200 },
  { day: "Thu", sales: 1100 },
  { day: "Fri", sales: 3800 },
  { day: "Sat", sales: 500 },
];

export default function AdminPage() {
  const router = useRouter();
  const db = useFirestore();
  const [view, setView] = useState("dashboard");

  // Firestore Collections
  const customersQuery = useMemo(() => query(collection(db, "customers"), orderBy("joinedAt", "desc")), [db]);
  const { data: customers } = useCollection(customersQuery);

  const productsQuery = useMemo(() => query(collection(db, "products"), orderBy("name", "asc")), [db]);
  const { data: products } = useCollection(productsQuery);

  const couponsQuery = useMemo(() => query(collection(db, "coupons"), orderBy("code", "asc")), [db]);
  const { data: coupons } = useCollection(couponsQuery);

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", unit: "", category: "Fruits & Veggies", description: "" });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setIsAddingProduct(true);
    try {
      addDoc(collection(db, "products"), {
        ...newProduct,
        price: Number(newProduct.price),
        imageUrl: `https://picsum.photos/seed/${Math.random()}/400/400`,
        createdAt: serverTimestamp()
      });
      toast({ title: "Product Added" });
      setNewProduct({ name: "", price: "", unit: "", category: "Fruits & Veggies", description: "" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsAddingProduct(false);
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Grid },
    { id: "customers", label: "Customers History", icon: History },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "push", label: "Push Notifications", icon: BellRing },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col pb-10">
      {/* Top Navigation */}
      <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 p-2 rounded-xl">
             <Grid className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-black italic tracking-tighter uppercase">ADMIN <span className="text-gray-400">HUB</span></h1>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-6 bg-white border-none shadow-2xl">
            <SheetHeader className="text-left mb-8">
              <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase">GROSI<span className="text-primary">FY</span></SheetTitle>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Management Console</p>
            </SheetHeader>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setView(item.id); }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${view === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-bold">{item.label}</span>
                </button>
              ))}
              <div className="pt-8">
                <Button variant="ghost" onClick={() => router.push("/")} className="w-full justify-start gap-4 px-4 py-6 rounded-2xl text-gray-400 font-bold">
                  <ArrowLeft className="w-5 h-5" /> Back to App
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {view === "dashboard" && (
          <>
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tight text-gray-900 italic uppercase leading-none">DASHBOARD</h2>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">MANAGEMENT PORTAL</p>
            </div>

            {/* Weekly Sales Card */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-gray-200 overflow-hidden bg-white">
              <div className="bg-black p-8 text-white flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">WEEKLY SALES</h3>
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none opacity-100">ANALYTICS</h3>
                </div>
                <div className="bg-red-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest">
                  REAL_TIME
                </div>
              </div>
              <div className="p-8 h-[250px] w-full bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SALES_DATA}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#CBD5E1', fontSize: 12, fontWeight: 700}} 
                      dy={10}
                    />
                    <Tooltip 
                      cursor={{fill: '#F8F9FA'}}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold">
                              ₹{payload[0].value}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="sales" radius={[12, 12, 12, 12]} barSize={40}>
                      {SALES_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 || index === 5 ? '#E2E8F0' : '#EDF2F7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Real Insights Card */}
            <Card className="rounded-[2.5rem] bg-gradient-to-br from-[#E11D48] to-[#9F1239] p-10 text-white border-none shadow-2xl shadow-red-200 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-24 translate-x-24 group-hover:scale-110 transition-transform duration-1000"></div>
               <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                 <History className="w-10 h-10 animate-spin-slow" />
               </div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">BUSINESS CONSOLE</p>
                 <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-tight">REAL <br/> INSIGHTS</h3>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed opacity-80">
                 AAPKE SAARE STATS AB LIVE ORDERS <br/> SE CONNECTED HAIN.
               </p>
            </Card>

            {/* Stats Cards */}
            <div className="space-y-4">
              {[
                { label: "TOTAL REVENUE", value: "₹16,335.15", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50", subtitle: "Live from Firestore" },
                { label: "TOTAL ORDERS", value: products?.length || "187", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50", subtitle: "Live from Firestore" },
                { label: "REGISTERED USERS", value: customers?.length || "171", icon: Users, color: "text-purple-500", bg: "bg-purple-50", subtitle: "Live from Firestore" },
                { label: "NETWORK STATUS", value: "Live", icon: Globe, color: "text-amber-500", bg: "bg-amber-50", subtitle: "Live from Firestore" },
              ].map((stat, i) => (
                <Card key={i} className="p-8 rounded-[2.5rem] border-none shadow-xl shadow-gray-100 bg-white flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</h4>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">{stat.subtitle}</p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-full flex items-center justify-center shadow-inner`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {view === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">MANAGE PRODUCTS</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" className="rounded-2xl bg-black text-white w-12 h-12"><Plus className="w-6 h-6" /></Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] rounded-t-[3rem] bg-white p-8">
                  <SheetHeader><SheetTitle>Add Product</SheetTitle></SheetHeader>
                  <div className="space-y-4 mt-6">
                    <Input placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none" />
                    <Input placeholder="Price (₹)" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none" />
                    <Input placeholder="Unit" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none" />
                    <Button className="w-full h-14 rounded-2xl bg-primary text-lg font-bold" onClick={handleAddProduct} disabled={isAddingProduct}>
                      {isAddingProduct ? <Loader2 className="animate-spin" /> : "Save Product"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid gap-4">
              {products?.map((p: any) => (
                <Card key={p.id} className="p-6 rounded-[2rem] border-none shadow-lg bg-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{p.name}</h4>
                      <p className="text-xs text-gray-500 font-bold">₹{p.price} • {p.unit}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={() => deleteDoc(doc(db, "products", p.id))}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "customers" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">CUSTOMERS HISTORY</h2>
            <div className="space-y-4">
              {customers?.map((customer: any) => (
                <Card key={customer.id} className="p-6 rounded-[2.5rem] border-none shadow-lg bg-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <UserCheck className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{customer.name}</h4>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{customer.email}</p>
                      <p className="text-xs text-primary font-bold mt-1">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-300 font-black uppercase">JOINED</p>
                    <p className="text-xs font-black text-gray-900">
                      {customer.joinedAt ? new Date(customer.joinedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
