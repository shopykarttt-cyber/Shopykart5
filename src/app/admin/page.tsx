
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
  const productFileRef = useRef<HTMLInputElement>(null);
  const categoryFileRef = useRef<HTMLInputElement>(null);

  // Firestore Collections
  const customersQuery = useMemo(() => query(collection(db, "customers"), orderBy("joinedAt", "desc")), [db]);
  const { data: customers } = useCollection(customersQuery);

  const productsQuery = useMemo(() => query(collection(db, "products"), orderBy("createdAt", "desc")), [db]);
  const { data: products } = useCollection(productsQuery);

  const categoriesQuery = useMemo(() => query(collection(db, "categories"), orderBy("name", "asc")), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const couponsQuery = useMemo(() => query(collection(db, "coupons"), orderBy("code", "asc")), [db]);
  const { data: coupons } = useCollection(couponsQuery);

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const [productForm, setProductForm] = useState({
    name: "",
    mrp: "",
    price: "",
    unit: "",
    category: "",
    description: "",
    mfgDate: "",
    expiryDate: "",
    imagePreview: ""
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    imagePreview: ""
  });

  const handleProductImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProductForm({ ...productForm, imagePreview: URL.createObjectURL(file) });
  };

  const handleCategoryImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCategoryForm({ ...categoryForm, imagePreview: URL.createObjectURL(file) });
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.mrp || !productForm.price || !productForm.category) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Name, MRP, Price, and Category are required." });
      return;
    }
    
    setIsAddingProduct(true);
    try {
      const imageUrl = productForm.imagePreview || `https://picsum.photos/seed/${Math.random()}/400/400`;
      await addDoc(collection(db, "products"), {
        ...productForm,
        mrp: Number(productForm.mrp),
        price: Number(productForm.price),
        imageUrl,
        createdAt: serverTimestamp()
      });
      toast({ title: "Product Live!" });
      setProductForm({ name: "", mrp: "", price: "", unit: "", category: "", description: "", mfgDate: "", expiryDate: "", imagePreview: "" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name || !categoryForm.imagePreview) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Name and Image are required for Category." });
      return;
    }
    setIsAddingCategory(true);
    try {
      await addDoc(collection(db, "categories"), {
        name: categoryForm.name,
        imageUrl: categoryForm.imagePreview,
        createdAt: serverTimestamp()
      });
      toast({ title: "Category Created" });
      setCategoryForm({ name: "", imagePreview: "" });
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
    { id: "customers", label: "Customers", icon: Users },
    { id: "coupons", label: "Coupons", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col pb-10">
      <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-6 bg-white border-none shadow-2xl">
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="text-2xl font-black italic uppercase">ADMIN HUB</SheetTitle>
              </SheetHeader>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${view === item.id ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold">{item.label}</span>
                  </button>
                ))}
                <div className="pt-8">
                  <Button variant="ghost" onClick={() => router.push("/")} className="w-full justify-start gap-4 px-4 py-6 text-gray-400 font-bold">
                    <ArrowLeft className="w-5 h-5" /> Back to App
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-black italic tracking-tighter uppercase">ADMIN <span className="text-gray-400">HUB</span></h1>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8">
        {view === "dashboard" && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-4xl font-black italic uppercase">DASHBOARD</h2>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">LIVE INSIGHTS</p>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white p-8">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SALES_DATA}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#CBD5E1', fontSize: 12, fontWeight: 700}} />
                    <Tooltip cursor={{fill: '#F8F9FA'}} />
                    <Bar dataKey="sales" radius={[12, 12, 12, 12]} barSize={40}>
                      {SALES_DATA.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={i === 5 ? '#ff4d4d' : '#EDF2F7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "TOTAL PRODUCTS", value: products?.length || 0, icon: Package, bg: "bg-blue-50", color: "text-blue-500" },
                { label: "TOTAL CUSTOMERS", value: customers?.length || 0, icon: Users, bg: "bg-purple-50", color: "text-purple-500" },
                { label: "LIVE CATEGORIES", value: categories?.length || 0, icon: Grid, bg: "bg-emerald-50", color: "text-emerald-500" },
              ].map((stat, i) => (
                <Card key={i} className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <h4 className="text-3xl font-black text-gray-900">{stat.value}</h4>
                  </div>
                  <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-full flex items-center justify-center`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black italic uppercase">PRODUCTS</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="rounded-2xl bg-black text-white px-6 h-12 gap-2"><Plus className="w-5 h-5" /> Add New</Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[95vh] rounded-t-[3rem] bg-white p-0 overflow-hidden">
                  <ScrollArea className="h-full px-8 py-8">
                    <SheetHeader className="mb-6"><SheetTitle className="text-2xl font-black uppercase italic">Add Product</SheetTitle></SheetHeader>
                    <div className="space-y-6 pb-20">
                      <div onClick={() => productFileRef.current?.click()} className="w-full h-48 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden relative">
                        {productForm.imagePreview ? <img src={productForm.imagePreview} className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-gray-300" />}
                        <input type="file" ref={productFileRef} onChange={handleProductImagePick} className="hidden" accept="image/*" />
                      </div>
                      <Input placeholder="Product Name *" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="number" placeholder="MRP (₹) *" value={productForm.mrp} onChange={e => setProductForm({...productForm, mrp: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                        <Input type="number" placeholder="Price (₹) *" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                      </div>
                      <Select value={productForm.category} onValueChange={val => setProductForm({...productForm, category: val})}>
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold">
                          <SelectValue placeholder="Select Category *" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                          {categories?.map((cat: any) => <SelectItem key={cat.id} value={cat.name} className="py-3 font-bold">{cat.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Unit (e.g. 1kg)" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                      <Button className="w-full h-16 rounded-[2rem] bg-primary text-lg font-black italic uppercase shadow-xl" onClick={handleAddProduct} disabled={isAddingProduct}>
                        {isAddingProduct ? <Loader2 className="animate-spin" /> : "Publish Live"}
                      </Button>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid gap-4">
              {products?.map((p: any) => (
                <Card key={p.id} className="p-6 rounded-[2rem] border-none shadow-lg bg-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={p.imageUrl} className="w-16 h-16 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-bold text-gray-800">{p.name}</h4>
                      <p className="text-xs font-black text-primary uppercase">{p.category}</p>
                      <p className="text-sm font-black">₹{p.price}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteDoc(doc(db, "products", p.id))}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "categories" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase">CATEGORIES</h2>
            <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white space-y-4">
              <div onClick={() => categoryFileRef.current?.click()} className="w-full h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden relative">
                {categoryForm.imagePreview ? <img src={categoryForm.imagePreview} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-300" />}
                <input type="file" ref={categoryFileRef} onChange={handleCategoryImagePick} className="hidden" accept="image/*" />
              </div>
              <div className="flex gap-2">
                <Input placeholder="Category Name *" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                <Button onClick={handleAddCategory} disabled={isAddingCategory} className="h-14 w-14 rounded-2xl bg-black">
                  {isAddingCategory ? <Loader2 className="animate-spin" /> : <Plus className="w-6 h-6" />}
                </Button>
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              {categories?.map((cat: any) => (
                <Card key={cat.id} className="p-5 rounded-[2rem] border-none shadow-lg bg-white flex flex-col items-center relative overflow-hidden group">
                  <img src={cat.imageUrl} className="w-20 h-20 object-cover rounded-2xl mb-2" />
                  <span className="font-bold text-gray-800">{cat.name}</span>
                  <button onClick={() => deleteDoc(doc(db, "categories", cat.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "customers" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase">CUSTOMERS</h2>
            <div className="space-y-4">
              {customers?.map((customer: any) => (
                <Card key={customer.id} className="p-6 rounded-[2.5rem] border-none shadow-lg bg-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <UserCheck className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{customer.name}</h4>
                      <p className="text-[10px] text-gray-400 font-black uppercase">{customer.email}</p>
                      <p className="text-xs text-primary font-bold">{customer.phone}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
