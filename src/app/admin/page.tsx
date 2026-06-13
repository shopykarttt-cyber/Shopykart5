
"use client";

import { useState, useMemo, useRef } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Users, 
  BellRing, 
  ArrowLeft,
  Plus,
  DollarSign,
  UserCheck,
  Loader2,
  Trash2,
  Menu,
  TrendingUp,
  ShoppingBag,
  Globe,
  History,
  Grid,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firestore Collections
  const customersQuery = useMemo(() => query(collection(db, "customers"), orderBy("joinedAt", "desc")), [db]);
  const { data: customers } = useCollection(customersQuery);

  const productsQuery = useMemo(() => query(collection(db, "products"), orderBy("name", "asc")), [db]);
  const { data: products } = useCollection(productsQuery);

  const categoriesQuery = useMemo(() => query(collection(db, "categories"), orderBy("name", "asc")), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const couponsQuery = useMemo(() => query(collection(db, "coupons"), orderBy("code", "asc")), [db]);
  const { data: coupons } = useCollection(couponsQuery);

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const [productForm, setProductForm] = useState({
    name: "",
    mrp: "",
    price: "",
    unit: "",
    category: "",
    description: "",
    mfgDate: "",
    expiryDate: "",
    imageFile: null as File | null,
    imagePreview: ""
  });

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductForm({
        ...productForm,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.mrp || !productForm.price || !productForm.category) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all required fields including category." });
      return;
    }
    
    setIsAddingProduct(true);
    try {
      // In a real app, you would upload the imageFile to Firebase Storage here.
      // For this prototype, we'll use the preview URL or a placeholder if no image is picked.
      const imageUrl = productForm.imagePreview || `https://picsum.photos/seed/${Math.random()}/400/400`;

      await addDoc(collection(db, "products"), {
        name: productForm.name,
        mrp: Number(productForm.mrp),
        price: Number(productForm.price),
        unit: productForm.unit || "1 unit",
        category: productForm.category,
        description: productForm.description || "",
        mfgDate: productForm.mfgDate || null,
        expiryDate: productForm.expiryDate || null,
        imageUrl: imageUrl,
        createdAt: serverTimestamp()
      });

      toast({ title: "Product Added Successfully!" });
      setProductForm({
        name: "", mrp: "", price: "", unit: "", category: "",
        description: "", mfgDate: "", expiryDate: "", imageFile: null, imagePreview: ""
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    setIsAddingCategory(true);
    try {
      await addDoc(collection(db, "categories"), {
        name: newCategoryName,
        createdAt: serverTimestamp()
      });
      toast({ title: "Category Created" });
      setNewCategoryName("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsAddingCategory(false);
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

            {/* Stats Cards */}
            <div className="space-y-4">
              {[
                { label: "TOTAL REVENUE", value: "₹16,335.15", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50", subtitle: "Live from Firestore" },
                { label: "TOTAL PRODUCTS", value: products?.length || "0", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50", subtitle: "Live from Firestore" },
                { label: "REGISTERED USERS", value: customers?.length || "0", icon: Users, color: "text-purple-500", bg: "bg-purple-50", subtitle: "Live from Firestore" },
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
                  <Button size="icon" className="rounded-2xl bg-black text-white w-12 h-12 shadow-xl shadow-black/20"><Plus className="w-6 h-6" /></Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[95vh] rounded-t-[3rem] bg-white p-0 overflow-hidden">
                  <ScrollArea className="h-full px-8 py-8">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="text-2xl font-black uppercase italic">Add New Product</SheetTitle>
                    </SheetHeader>
                    
                    <div className="space-y-6 pb-20">
                      {/* Image Upload Area */}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative"
                      >
                        {productForm.imagePreview ? (
                          <>
                            <img src={productForm.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={(e) => { e.stopPropagation(); setProductForm({...productForm, imageFile: null, imagePreview: ""}); }}
                              className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-md"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="bg-white p-4 rounded-3xl shadow-sm">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tap to open gallery</p>
                          </>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImagePick} accept="image/*" className="hidden" />
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Product Name *</label>
                          <Input placeholder="Enter product name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">MRP (₹) *</label>
                            <Input type="number" placeholder="0.00" value={productForm.mrp} onChange={e => setProductForm({...productForm, mrp: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Discount Price (₹) *</label>
                            <Input type="number" placeholder="0.00" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Category *</label>
                          <Select value={productForm.category} onValueChange={val => setProductForm({...productForm, category: val})}>
                            <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                              {categories?.map((cat: any) => (
                                <SelectItem key={cat.id} value={cat.name} className="py-3 font-bold">{cat.name}</SelectItem>
                              ))}
                              {(!categories || categories.length === 0) && (
                                <p className="p-4 text-xs text-center font-bold text-red-400 italic">Please create categories first!</p>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Unit (e.g. 1kg, 500g)</label>
                          <Input placeholder="1 unit" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">MFG Date</label>
                            <Input type="date" value={productForm.mfgDate} onChange={e => setProductForm({...productForm, mfgDate: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Expiry Date</label>
                            <Input type="date" value={productForm.expiryDate} onChange={e => setProductForm({...productForm, expiryDate: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description (Optional)</label>
                          <Textarea placeholder="Write something about the product..." value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="min-h-[100px] rounded-2xl bg-gray-50 border-none px-6 py-4 font-bold" />
                        </div>

                        <Button className="w-full h-16 rounded-[2rem] bg-primary text-lg font-black italic tracking-tight uppercase shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" onClick={handleAddProduct} disabled={isAddingProduct}>
                          {isAddingProduct ? <Loader2 className="animate-spin" /> : "Publish Product"}
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="grid gap-4">
              {products?.map((p: any) => (
                <Card key={p.id} className="p-6 rounded-[2rem] border-none shadow-lg bg-white flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shadow-inner">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-primary uppercase tracking-widest">{p.category}</p>
                      <h4 className="font-bold text-gray-800">{p.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900">₹{p.price}</span>
                        {p.mrp > p.price && (
                          <span className="text-[10px] font-bold text-gray-400 line-through">₹{p.mrp}</span>
                        )}
                        <span className="text-[10px] font-bold text-gray-400">/ {p.unit}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={() => deleteDoc(doc(db, "products", p.id))}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </Card>
              ))}
              {(!products || products.length === 0) && (
                <div className="py-20 text-center space-y-4">
                   <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                     <Package className="w-8 h-8 text-gray-300" />
                   </div>
                   <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No products yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "categories" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">MANAGE CATEGORIES</h2>
            <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">New Category Name</label>
                <div className="flex gap-2">
                  <Input placeholder="e.g. Fruits, Drinks" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                  <Button onClick={handleAddCategory} disabled={isAddingCategory} className="h-14 w-14 rounded-2xl bg-black">
                    {isAddingCategory ? <Loader2 className="animate-spin" /> : <Plus className="w-6 h-6" />}
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              {categories?.map((cat: any) => (
                <Card key={cat.id} className="p-5 rounded-[2rem] border-none shadow-lg bg-white flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                  <div className="bg-primary/5 p-4 rounded-3xl transition-transform group-hover:scale-110">
                    <Grid className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-bold text-gray-800">{cat.name}</span>
                  <button 
                    onClick={() => deleteDoc(doc(db, "categories", cat.id))}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
