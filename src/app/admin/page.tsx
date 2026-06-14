
"use client";

import { useState, useMemo, useRef } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ArrowLeft,
  Plus,
  Loader2,
  Trash2,
  Menu,
  Grid,
  Image as ImageIcon,
  UserCheck,
  Ticket,
  History
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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
  const { user, loading: authLoading } = useUser();
  const [view, setView] = useState("dashboard");
  const productFileRef = useRef<HTMLInputElement>(null);
  const categoryFileRef = useRef<HTMLInputElement>(null);

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
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  
  const [productForm, setProductForm] = useState({
    name: "",
    mrp: "",
    price: "",
    unit: "",
    category: "",
    description: "",
    mfgDate: "",
    expiryDate: "",
    imageData: "" 
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    imageData: "" 
  });

  const [couponForm, setCouponForm] = useState({
    code: "",
    value: "",
    type: "fixed"
  });

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleProductImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileToBase64(file);
      setProductForm({ ...productForm, imageData: base64 });
    }
  };

  const handleCategoryImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileToBase64(file);
      setCategoryForm({ ...categoryForm, imageData: base64 });
    }
  };

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.mrp || !productForm.price || !productForm.category) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Name, MRP, Price, and Category are required." });
      return;
    }
    
    setIsAddingProduct(true);
    const data = {
      ...productForm,
      mrp: Number(productForm.mrp),
      price: Number(productForm.price),
      imageUrl: productForm.imageData || `https://picsum.photos/seed/${Math.random()}/400/400`,
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, "products"), data)
      .then(() => {
        toast({ title: "Product Live!" });
        setProductForm({ name: "", mrp: "", price: "", unit: "", category: "", description: "", mfgDate: "", expiryDate: "", imageData: "" });
        setIsAddingProduct(false);
      })
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'products',
          operation: 'create',
          requestResourceData: data
        }));
        setIsAddingProduct(false);
      });
  };

  const handleAddCategory = () => {
    if (!categoryForm.name || !categoryForm.imageData) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Name and Image are required for Category." });
      return;
    }
    setIsAddingCategory(true);
    const data = {
      name: categoryForm.name,
      imageUrl: categoryForm.imageData,
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, "categories"), data)
      .then(() => {
        toast({ title: "Category Created" });
        setCategoryForm({ name: "", imageData: "" });
        setIsAddingCategory(false);
      })
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'categories',
          operation: 'create',
          requestResourceData: data
        }));
        setIsAddingCategory(false);
      });
  };

  const handleAddCoupon = () => {
    if (!couponForm.code || !couponForm.value) return;
    setIsAddingCoupon(true);
    const data = {
      code: couponForm.code.toUpperCase(),
      value: Number(couponForm.value),
      discountType: couponForm.type,
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, "coupons"), data)
      .then(() => {
        toast({ title: "Coupon Added" });
        setCouponForm({ code: "", value: "", type: "fixed" });
        setIsAddingCoupon(false);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'coupons',
          operation: 'create',
          requestResourceData: data
        }));
        setIsAddingCoupon(false);
      });
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Category", icon: Grid },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "customers", label: "Customers History", icon: History },
  ];

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) { router.push("/"); return null; }

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
                <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">
                  GROSI<span className="text-primary">FY</span> <span className="text-xs text-gray-400">HUB</span>
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${view === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
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
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">LIVE ANALYTICS</p>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-xl">Weekly Sales</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Revenue trends</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                  Live
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SALES_DATA}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#CBD5E1', fontSize: 12, fontWeight: 700}} />
                    <Tooltip cursor={{fill: '#F8F9FA'}} />
                    <Bar 
                      dataKey="sales" 
                      radius={[12, 12, 12, 12]} 
                      barSize={40}
                      onClick={(data) => {
                        toast({ title: `${data.day} Sales`, description: `Total revenue: ₹${data.sales}` });
                      }}
                    >
                      {SALES_DATA.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={i === 5 ? '#ff4d4d' : '#EDF2F7'} className="cursor-pointer hover:opacity-80 transition-opacity" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "TOTAL REVENUE", value: "₹45,820", icon: LayoutDashboard, bg: "bg-orange-50", color: "text-orange-500" },
                { label: "TOTAL ORDERS", value: "128", icon: Package, bg: "bg-blue-50", color: "text-blue-500" },
                { label: "TOTAL CUSTOMERS", value: customers?.length || 0, icon: Users, bg: "bg-purple-50", color: "text-purple-500" },
              ].map((stat, i) => (
                <Card key={i} className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <h4 className="text-3xl font-black text-gray-900">{stat.value}</h4>
                  </div>
                  <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-3xl flex items-center justify-center`}>
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
                      <div onClick={() => productFileRef.current?.click()} className="w-full h-48 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden relative group">
                        {productForm.imageData ? <img src={productForm.imageData} className="w-full h-full object-cover" /> : (
                          <>
                            <ImageIcon className="w-10 h-10 text-gray-300 group-hover:text-primary transition-colors" />
                            <p className="text-xs font-bold text-gray-400">TAP TO OPEN GALLERY</p>
                          </>
                        )}
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 mb-2 uppercase">MFG Date (Optional)</p>
                          <Input type="date" value={productForm.mfgDate} onChange={e => setProductForm({...productForm, mfgDate: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 mb-2 uppercase">Expiry Date (Optional)</p>
                          <Input type="date" value={productForm.expiryDate} onChange={e => setProductForm({...productForm, expiryDate: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                        </div>
                      </div>
                      <Input placeholder="Description (Optional)" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
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
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
                    deleteDoc(doc(db, "products", p.id)).catch(async () => {
                      errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: `products/${p.id}`,
                        operation: 'delete'
                      }));
                    });
                  }}>
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
            <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-white space-y-4">
              <div onClick={() => categoryFileRef.current?.click()} className="w-full h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden relative group">
                {categoryForm.imageData ? <img src={categoryForm.imageData} className="w-full h-full object-cover" /> : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors" />
                    <p className="text-[10px] font-bold text-gray-400">UPLOAD IMAGE</p>
                  </>
                )}
                <input type="file" ref={categoryFileRef} onChange={handleCategoryImagePick} className="hidden" accept="image/*" />
              </div>
              <div className="flex gap-2">
                <Input placeholder="Category Name *" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                <Button onClick={handleAddCategory} disabled={isAddingCategory} className="h-14 w-14 rounded-2xl bg-black">
                  {isAddingCategory ? <Loader2 className="animate-spin" /> : <Plus className="w-6 h-6 text-white" />}
                </Button>
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              {categories?.map((cat: any) => (
                <Card key={cat.id} className="p-5 rounded-[2.5rem] border-none shadow-lg bg-white flex flex-col items-center relative overflow-hidden group text-center">
                  <img src={cat.imageUrl} className="w-20 h-20 object-cover rounded-3xl mb-2" />
                  <span className="font-bold text-gray-800 text-sm line-clamp-1">{cat.name}</span>
                  <button onClick={() => {
                    deleteDoc(doc(db, "categories", cat.id)).catch(async () => {
                      errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: `categories/${cat.id}`,
                        operation: 'delete'
                      }));
                    });
                  }} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "coupons" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase">COUPONS</h2>
            <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-white space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Input placeholder="COUPON CODE (e.g. SAVE20)" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                <div className="flex gap-2">
                  <Input type="number" placeholder="Value" value={couponForm.value} onChange={e => setCouponForm({...couponForm, value: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                  <Select value={couponForm.type} onValueChange={val => setCouponForm({...couponForm, type: val})}>
                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none">
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddCoupon} disabled={isAddingCoupon} className="h-14 rounded-2xl bg-black w-full font-bold">
                  {isAddingCoupon ? <Loader2 className="animate-spin" /> : "ADD COUPON"}
                </Button>
              </div>
            </Card>
            <div className="space-y-4">
              {coupons?.map((c: any) => (
                <Card key={c.id} className="p-6 rounded-[2rem] border-none shadow-lg bg-white flex justify-between items-center border-l-4 border-primary">
                  <div>
                    <h4 className="font-black text-lg tracking-wider">{c.code}</h4>
                    <p className="text-xs text-gray-500 font-bold uppercase">{c.discountType === 'fixed' ? `₹${c.value} OFF` : `${c.value}% OFF`}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc(db, "coupons", c.id))} className="text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "customers" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase">CUSTOMERS HISTORY</h2>
            <div className="space-y-4">
              {customers?.map((customer: any) => (
                <Card key={customer.id} className="p-6 rounded-[2.5rem] border-none shadow-lg bg-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-3xl flex items-center justify-center">
                      <UserCheck className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{customer.name}</h4>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{customer.email}</p>
                      <p className="text-xs text-primary font-bold">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase">Joined</p>
                    <p className="text-xs font-bold text-gray-500">
                      {customer.joinedAt ? new Date(customer.joinedAt).toLocaleDateString() : 'N/A'}
                    </p>
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
