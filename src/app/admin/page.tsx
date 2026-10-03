"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ArrowLeft,
  Plus,
  Trash2,
  Menu,
  Grid,
  ImageIcon,
  ShoppingBag,
  Star,
  Edit3,
  Save,
  Settings as SettingsIcon,
  Loader2,
  X,
  FileSpreadsheet,
  Download,
  Ticket,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clock,
  MoreVertical
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase";
import { collection, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, setDoc, writeBatch, onSnapshot, where } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SALES_DATA = [
  { day: "Sun", sales: 4000 },
  { day: "Mon", sales: 1500 },
  { day: "Tue", sales: 1800 },
  { day: "Wed", sales: 1200 },
  { day: "Thu", sales: 1100 },
  { day: "Fri", sales: 3800 },
  { day: "Sat", sales: 500 },
];

const optimizeImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
    reader.onerror = error => reject(error);
  });
};

export default function AdminPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isCouponSheetOpen, setIsCouponSheetOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const productFileRef = useRef<HTMLInputElement>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const categoryFileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Incoming Order Alert State
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Settings state
  const settingsRef = useMemo(() => doc(db, "settings", "global"), [db]);
  const { data: settingsData } = useDoc(settingsRef);
  const [taxCharges, setTaxCharges] = useState<{ label: string; amount: number }[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settingsData?.taxCharges) {
      setTaxCharges(settingsData.taxCharges);
    }
  }, [settingsData]);

  useEffect(() => {
    setIsClient(true);
    // Initialize audio alert (Requires interaction)
    audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
    audioRef.current.loop = true;
    audioRef.current.volume = 1.0;
  }, []);

  // Listen for new orders
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("status", "==", "Pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingOrders(orders);
      
      if (orders.length > 0) {
        setIsAlertOpen(true);
        audioRef.current?.play().catch(() => {
          console.warn("Audio autoplay blocked.");
        });
      } else {
        setIsAlertOpen(false);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      }
    });
    return () => unsubscribe();
  }, [db, user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const productsQuery = useMemo(() => user ? query(collection(db, "products"), orderBy("createdAt", "desc")) : null, [db, user]);
  const { data: products } = useCollection(productsQuery);

  const categoriesQuery = useMemo(() => user ? query(collection(db, "categories"), orderBy("name", "asc")) : null, [db, user]);
  const { data: categories } = useCollection(categoriesQuery);

  const ordersQuery = useMemo(() => user ? query(collection(db, "orders"), orderBy("createdAt", "desc")) : null, [db, user]);
  const { data: orders } = useCollection(ordersQuery);

  const customersQuery = useMemo(() => user ? query(collection(db, "customers"), orderBy("joinedAt", "desc")) : null, [db, user]);
  const { data: customers } = useCollection(customersQuery);

  const couponsQuery = useMemo(() => user ? query(collection(db, "coupons"), orderBy("createdAt", "desc")) : null, [db, user]);
  const { data: coupons } = useCollection(couponsQuery);

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    updateDoc(doc(db, "orders", orderId), { status: newStatus })
      .then(() => toast({ title: `Order ${newStatus}!` }))
      .catch(err => toast({ variant: "destructive", title: "Error", description: err.message }));
  };

  const [productForm, setProductForm] = useState({
    name: "", mrp: "", price: "", unit: "", category: "", description: "", imageData: "", isTopRated: false,
    pricingTiers: [] as { minQty: number; maxQty: number | null; price: number }[]
  });

  const [categoryForm, setCategoryForm] = useState({ name: "", imageData: "" });

  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "fixed" as "fixed" | "percentage",
    value: "",
    minOrder: ""
  });

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.mrp || !productForm.price || !productForm.category) {
      toast({ variant: "destructive", title: "Missing Fields" });
      return;
    }
    const data = {
      ...productForm,
      mrp: Number(productForm.mrp),
      price: Number(productForm.price),
      pricingTiers: productForm.pricingTiers.map(t => ({
        ...t,
        minQty: Number(t.minQty),
        maxQty: t.maxQty ? Number(t.maxQty) : null,
        price: Number(t.price)
      })),
      imageUrl: productForm.imageData || `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/400/400`,
      updatedAt: serverTimestamp()
    };
    if (editingProductId) {
      updateDoc(doc(db, "products", editingProductId), data)
        .then(() => { toast({ title: "Product Updated!" }); resetProductForm(); })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `products/${editingProductId}`,
            operation: 'update',
            requestResourceData: data
          }));
        });
    } else {
      const newProduct = { ...data, createdAt: serverTimestamp() };
      addDoc(collection(db, "products"), newProduct)
        .then(() => { toast({ title: "Product Live!" }); resetProductForm(); })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'products',
            operation: 'create',
            requestResourceData: newProduct
          }));
        });
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: "", mrp: "", price: "", unit: "", category: "", description: "", imageData: "", isTopRated: false, pricingTiers: [] });
    setEditingProductId(null);
    setIsProductSheetOpen(false);
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const binaryString = event.target?.result;
        const workbook = XLSX.read(binaryString, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (data.length === 0) {
          toast({ variant: "destructive", title: "Empty File", description: "The uploaded file contains no data." });
          setIsUploading(false);
          return;
        }

        const batch = writeBatch(db);
        const productsCol = collection(db, "products");

        data.forEach((row: any) => {
          const docRef = doc(productsCol);
          batch.set(docRef, {
            name: row.name || "Unnamed Product",
            mrp: Number(row.mrp) || 0,
            price: Number(row.price) || 0,
            unit: row.unit || "unit",
            category: row.category || "General",
            description: row.description || "",
            imageUrl: row.imageUrl || `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/400/400`,
            isTopRated: String(row.isTopRated).toLowerCase() === 'true',
            pricingTiers: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });

        await batch.commit();
        toast({ title: "Bulk Upload Success!", description: `${data.length} products added successfully.` });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Upload Failed", description: err.message });
      } finally {
        setIsUploading(false);
        if (bulkFileRef.current) bulkFileRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAddCategory = () => {
    if (!categoryForm.name || !categoryForm.imageData) return;
    const data = { 
      name: categoryForm.name,
      imageUrl: categoryForm.imageData,
      updatedAt: serverTimestamp() 
    };
    if (editingCategoryId) {
      updateDoc(doc(db, "categories", editingCategoryId), data)
        .then(() => { toast({ title: "Category Updated" }); resetCategoryForm(); })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `categories/${editingCategoryId}`,
            operation: 'update',
            requestResourceData: data
          }));
        });
    } else {
      const newCat = { ...data, createdAt: serverTimestamp() };
      addDoc(collection(db, "categories"), newCat)
        .then(() => { toast({ title: "Category Created" }); resetCategoryForm(); })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'categories',
            operation: 'create',
            requestResourceData: newCat
          }));
        });
    }
  };

  const handleAddCoupon = () => {
    if (!couponForm.code || !couponForm.value) return;
    const data = {
      code: couponForm.code.toUpperCase(),
      discountType: couponForm.discountType,
      value: Number(couponForm.value),
      minOrder: Number(couponForm.minOrder || 0),
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, "coupons"), data)
      .then(() => {
        toast({ title: "Coupon Created" });
        setCouponForm({ code: "", discountType: "fixed", value: "", minOrder: "" });
        setIsCouponSheetOpen(false);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'coupons',
          operation: 'create',
          requestResourceData: data
        }));
      });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", imageData: "" });
    setEditingCategoryId(null);
    setIsCategorySheetOpen(false);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Live Orders", icon: ShoppingBag },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Category", icon: Grid },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "customers", label: "Customers", icon: Users },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Real-time Order Alert Overlay */}
      <AlertDialog open={isAlertOpen}>
        <AlertDialogContent className="max-w-md rounded-[3rem] p-8 border-none bg-black text-white shadow-[0_0_100px_rgba(255,184,0,0.2)] border-4 border-primary">
          <AlertDialogHeader className="items-center text-center space-y-6">
            <div className="bg-primary p-6 rounded-full shadow-[0_0_30px_rgba(255,184,0,0.5)]">
              <BellRing className="w-16 h-16 text-black" />
            </div>
            <AlertDialogTitle className="text-4xl font-black italic uppercase tracking-tighter">
              NEW <span className="text-primary">ORDER!</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 font-bold uppercase text-xs tracking-widest leading-relaxed">
              A CUSTOMER HAS JUST PLACED AN ORDER. <br/> PLEASE ACCEPT IT TO START PROCESSING.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 my-8">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white/10 p-5 rounded-3xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-primary italic">Order ID: {order.id.slice(-6)}</span>
                  <span className="text-xl font-black">₹{order.total}</span>
                </div>
                <p className="text-xs font-bold text-gray-300 truncate">{order.customerName}</p>
                <Button 
                  onClick={() => handleUpdateOrderStatus(order.id, "Processing")}
                  className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase italic tracking-tight gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Accept Order
                </Button>
              </div>
            ))}
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <header className="bg-black text-white px-6 py-4 flex items-center justify-between sticky top-0 z-[1000] rounded-b-3xl">
        <div className="flex items-center gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 bg-white border-none shadow-2xl flex flex-col h-full overflow-hidden z-[1001]">
              <SheetHeader className="text-left p-6">
                <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">
                  GROSI<span className="text-primary">FY</span> <span className="text-xs text-gray-400">ADMIN</span>
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-2 pb-20">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setView(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${view === item.id ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="flex flex-col">
            <span className="text-lg font-black italic tracking-tighter uppercase leading-none">ADMIN <span className="text-primary">HUB</span></span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
        {view === "dashboard" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black italic uppercase">DASHBOARD</h2>
            <Card className="p-8 rounded-[2.5rem] bg-white shadow-xl">
               <div className="h-[250px] w-full">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SALES_DATA}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#CBD5E1', fontSize: 12, fontWeight: 700}} />
                      <Tooltip cursor={{fill: '#F8F9FA'}} />
                      <Bar dataKey="sales" radius={[12, 12, 12, 12]} barSize={40}>
                        {SALES_DATA.map((entry, i) => <Cell key={`cell-${i}`} fill={i === 5 ? '#ff4d4d' : '#EDF2F7'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="p-6 rounded-[2rem] bg-white flex justify-between items-center shadow-lg">
                <div><p className="text-[10px] font-black text-gray-400 uppercase">REVENUE</p><h4 className="text-2xl font-black">₹{orders?.reduce((s, o) => s + (o.total ?? 0), 0) ?? 0}</h4></div>
                <div className="bg-orange-50 text-orange-500 p-4 rounded-3xl"><LayoutDashboard className="w-6 h-6" /></div>
              </Card>
              <Card className="p-6 rounded-[2rem] bg-white flex justify-between items-center shadow-lg">
                <div><p className="text-[10px] font-black text-gray-400 uppercase">ORDERS</p><h4 className="text-2xl font-black">{orders?.length ?? 0}</h4></div>
                <div className="bg-blue-50 text-blue-500 p-4 rounded-3xl"><ShoppingBag className="w-6 h-6" /></div>
              </Card>
              <Card className="p-6 rounded-[2rem] bg-white flex justify-between items-center shadow-lg">
                <div><p className="text-[10px] font-black text-gray-400 uppercase">CUSTOMERS</p><h4 className="text-2xl font-black">{customers?.length ?? 0}</h4></div>
                <div className="bg-purple-50 text-purple-500 p-4 rounded-3xl"><Users className="w-6 h-6" /></div>
              </Card>
            </div>
          </div>
        )}

        {view === "orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase">LIVE ORDERS</h2>
            <div className="grid gap-4">
              {orders?.map((order: any) => (
                <Card key={order.id} className="p-6 rounded-[2rem] bg-white shadow-lg border-none overflow-hidden relative group">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          order.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-600' :
                          order.status === 'Shipped' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                        )}>
                          {order.status}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">ID: {order.id.slice(-6).toUpperCase()}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-lg font-black">{order.customerName}</h4>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{order.address}</p>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-gray-600 font-bold">{item.quantity}x {item.name}</span>
                            <span className="font-black text-gray-900">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="h-px bg-gray-200 my-2" />
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-sm font-black italic uppercase">Grand Total</span>
                          <span className="text-xl font-black text-primary">₹{order.total}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <Clock className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[8px] font-black text-gray-400 uppercase">Placed At</span>
                        <span className="text-xs font-bold text-gray-900">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="rounded-xl h-12 bg-black text-white px-6 gap-2">
                            Update Status <ChevronRight className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-xl border-none shadow-2xl z-[1002]">
                          <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'Processing')} className="font-bold py-3">Mark Processing</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'Shipped')} className="font-bold py-3">Mark Shipped</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')} className="font-bold py-3">Mark Delivered</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')} className="font-bold py-3 text-red-500">Cancel Order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
              {orders?.length === 0 && (
                <div className="py-32 text-center space-y-4">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No orders yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-black italic uppercase">PRODUCTS</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => {
                  const ws = XLSX.utils.json_to_sheet([{ name: "Tomato", category: "Vegetables", mrp: 100, price: 80, unit: "1kg", description: "", imageUrl: "", isTopRated: "TRUE" }]);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Products");
                  XLSX.writeFile(wb, "Grosify_Bulk_Template.xlsx");
                }} className="rounded-2xl h-12 gap-2 px-6 border-2 border-gray-100 font-bold hover:bg-gray-50">
                  <Download className="w-4 h-4" /> Template
                </Button>
                <div className="relative">
                  <input type="file" ref={bulkFileRef} onChange={handleBulkUpload} className="hidden" accept=".xlsx, .xls" />
                  <Button disabled={isUploading} onClick={() => bulkFileRef.current?.click()} className="rounded-2xl bg-white border-2 border-primary text-primary hover:bg-primary/5 h-12 gap-2 px-6 shadow-sm">
                    {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />} 
                    Bulk XL Upload
                  </Button>
                </div>
                <Sheet open={isProductSheetOpen} onOpenChange={setIsProductSheetOpen}>
                  <SheetTrigger asChild>
                    <Button onClick={() => { setEditingProductId(null); resetProductForm(); setIsProductSheetOpen(true); }} className="rounded-2xl bg-black text-white px-6 h-12 gap-2 shadow-lg"><Plus className="w-5 h-5" /> Add New</Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[95vh] rounded-t-[3rem] bg-white p-0 z-[1001]">
                    <ScrollArea className="h-full px-8 py-8">
                      <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-black uppercase italic">{editingProductId ? "Edit Product" : "Add Product"}</SheetTitle>
                      </SheetHeader>
                      <div className="space-y-8 pb-20 max-w-2xl mx-auto">
                        <div onClick={() => productFileRef.current?.click()} className="w-full h-48 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group">
                          {productForm.imageData ? <img src={productForm.imageData} alt="Product Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-gray-300" />}
                          <input type="file" ref={productFileRef} onChange={async (e) => { const opt = await optimizeImage(e.target.files![0]); setProductForm(p => ({...p, imageData: opt})); }} className="hidden" accept="image/*" />
                        </div>
                        
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Basic Details</Label>
                          <Input placeholder="Product Name *" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                          <div className="grid grid-cols-2 gap-4">
                            <Input type="number" placeholder="MRP (₹) *" value={productForm.mrp} onChange={e => setProductForm({...productForm, mrp: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                            <Input type="number" placeholder="Default Sale Price (₹) *" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Select value={productForm.category} onValueChange={val => setProductForm({...productForm, category: val})}>
                              <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold"><SelectValue placeholder="Select Category *" /></SelectTrigger>
                              <SelectContent className="rounded-2xl border-none shadow-2xl z-[1002]">
                                {categories?.map((cat: any) => <SelectItem key={cat.id} value={cat.name} className="py-3 font-bold">{cat.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Input placeholder="Unit (e.g. 1kg)" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl">
                            <Label className="font-bold">Top Rated Product</Label>
                            <Switch checked={productForm.isTopRated} onCheckedChange={val => setProductForm({...productForm, isTopRated: val})} />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bulk Pricing Tiers (Optional)</Label>
                            <Button variant="ghost" onClick={() => setProductForm({...productForm, pricingTiers: [...productForm.pricingTiers, { minQty: 0, maxQty: null, price: 0 }]})} className="text-primary font-black text-xs uppercase gap-1">
                              <Plus className="w-3 h-3" /> Add Tier
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {productForm.pricingTiers.map((tier, idx) => (
                              <div key={idx} className="flex gap-3 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 animate-in fade-in">
                                <div className="flex-1 space-y-1">
                                  <span className="text-[8px] font-black uppercase text-gray-400">Min Qty</span>
                                  <Input type="number" value={tier.minQty} onChange={e => {
                                    const newTiers = [...productForm.pricingTiers];
                                    newTiers[idx].minQty = Number(e.target.value);
                                    setProductForm({...productForm, pricingTiers: newTiers});
                                  }} className="h-10 rounded-xl bg-white border-none" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <span className="text-[8px] font-black uppercase text-gray-400">Tier Price (₹)</span>
                                  <Input type="number" value={tier.price} onChange={e => {
                                    const newTiers = [...productForm.pricingTiers];
                                    newTiers[idx].price = Number(e.target.value);
                                    setProductForm({...productForm, pricingTiers: newTiers});
                                  }} className="h-10 rounded-xl bg-white border-none" />
                                </div>
                                <button onClick={() => setProductForm({...productForm, pricingTiers: productForm.pricingTiers.filter((_, i) => i !== idx)})} className="text-red-500 mt-5 p-2"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button className="w-full h-16 rounded-[2rem] bg-primary text-lg font-black italic uppercase shadow-xl mt-4" onClick={handleAddProduct}>
                          {editingProductId ? "Update Changes" : "Publish Live"}
                        </Button>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products?.map((p: any) => (
                <Card key={p.id} className="p-6 rounded-[2rem] bg-white flex items-center justify-between shadow-lg relative border-none">
                  <div className="flex items-center gap-4">
                    <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-bold">{p.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-primary">₹{p.price}</p>
                        {p.pricingTiers?.length > 0 && <span className="text-[8px] font-black uppercase bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md">Bulk Enabled</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => {
                      setEditingProductId(p.id);
                      setProductForm({
                        name: p.name,
                        mrp: String(p.mrp),
                        price: String(p.price),
                        unit: p.unit,
                        category: p.category,
                        description: p.description || "",
                        imageData: p.imageUrl,
                        isTopRated: p.isTopRated || false,
                        pricingTiers: p.pricingTiers || []
                      });
                      setIsProductSheetOpen(true);
                    }} className="text-gray-400 hover:text-primary p-2"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deleteDoc(doc(db, "products", p.id))} className="text-gray-200 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black italic uppercase">CATEGORIES</h2>
              <Sheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen}>
                <SheetTrigger asChild>
                  <Button onClick={() => { setEditingCategoryId(null); resetCategoryForm(); setIsCategorySheetOpen(true); }} className="rounded-2xl bg-black text-white h-12 gap-2 px-6 shadow-lg"><Plus className="w-5 h-5" /> Add New</Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[60vh] rounded-t-[3rem] bg-white z-[1001]">
                  <div className="p-8 max-w-xl mx-auto space-y-6">
                    <SheetHeader><SheetTitle className="text-2xl font-black uppercase italic">Add Category</SheetTitle></SheetHeader>
                    <div onClick={() => categoryFileRef.current?.click()} className="w-full h-32 rounded-2xl bg-gray-50 border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative">
                      {categoryForm.imageData ? <img src={categoryForm.imageData} alt="Category Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-300" />}
                      <input type="file" ref={categoryFileRef} onChange={async (e) => { const opt = await optimizeImage(e.target.files![0]); setCategoryForm(p => ({...p, imageData: opt})); }} className="hidden" accept="image/*" />
                    </div>
                    <Input placeholder="Category Name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                    <Button onClick={handleAddCategory} className="h-16 w-full rounded-2xl bg-black font-black uppercase italic">Add Category</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories?.map((cat: any) => (
                <Card key={cat.id} className="p-5 rounded-[2.5rem] bg-white flex flex-col items-center relative text-center shadow-lg group border-none">
                  <img src={cat.imageUrl} alt={cat.name} className="w-20 h-20 object-cover rounded-3xl mb-2" />
                  <span className="font-bold text-gray-800 text-sm">{cat.name}</span>
                  <button onClick={() => deleteDoc(doc(db, "categories", cat.id))} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "coupons" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black italic uppercase">COUPONS</h2>
              <Sheet open={isCouponSheetOpen} onOpenChange={setIsCouponSheetOpen}>
                <SheetTrigger asChild>
                  <Button onClick={() => setIsCouponSheetOpen(true)} className="rounded-2xl bg-black text-white h-12 gap-2 px-6 shadow-lg"><Plus className="w-5 h-5" /> Add Coupon</Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[70vh] rounded-t-[3rem] bg-white z-[1001]">
                  <div className="p-8 max-w-xl mx-auto space-y-6">
                    <SheetHeader><SheetTitle className="text-2xl font-black uppercase italic">Create New Coupon</SheetTitle></SheetHeader>
                    <Input placeholder="COUPON CODE (e.g. SAVE20)" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                    <Select value={couponForm.discountType} onValueChange={(val: any) => setCouponForm({...couponForm, discountType: val})}>
                      <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold"><SelectValue placeholder="Discount Type" /></SelectTrigger>
                      <SelectContent className="rounded-2xl z-[1002]">
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Discount Value" value={couponForm.value} onChange={e => setCouponForm({...couponForm, value: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                    <Input type="number" placeholder="Min Order Amount (₹)" value={couponForm.minOrder} onChange={e => setCouponForm({...couponForm, minOrder: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                    <Button onClick={handleAddCoupon} className="h-16 w-full rounded-2xl bg-primary text-white font-black uppercase italic">Create Coupon</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons?.map((coupon: any) => (
                <Card key={coupon.id} className="p-6 rounded-[2.5rem] bg-white shadow-lg border-2 border-dashed border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-xl italic text-primary uppercase">{coupon.code}</h4>
                    <p className="text-xs font-bold text-gray-400">
                      {coupon.discountType === 'fixed' ? `₹${coupon.value} OFF` : `${coupon.value}% OFF`}
                      {coupon.minOrder > 0 && ` on min order ₹${coupon.minOrder}`}
                    </p>
                  </div>
                  <button onClick={() => deleteDoc(doc(db, "coupons", coupon.id))} className="text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase">GLOBAL SETTINGS</h2>
            <Card className="p-8 rounded-[2.5rem] bg-white shadow-lg space-y-8 border-none">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black italic uppercase text-lg">Additional Bill Charges</h3>
                  <Button onClick={() => setTaxCharges([...taxCharges, { label: "", amount: 0 }])} className="rounded-2xl gap-2"><Plus className="w-5 h-5" /> Add Charge</Button>
                </div>
                <div className="space-y-4">
                  {taxCharges.map((charge, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400">Label</Label>
                        <Input value={charge.label} onChange={e => {
                          const newCharges = [...taxCharges];
                          newCharges[idx].label = e.target.value;
                          setTaxCharges(newCharges);
                        }} className="h-12 rounded-xl bg-white border-none" />
                      </div>
                      <div className="w-32 space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400">Price (₹)</Label>
                        <Input type="number" value={charge.amount} onChange={e => {
                          const newCharges = [...taxCharges];
                          newCharges[idx].amount = Number(e.target.value);
                          setTaxCharges(newCharges);
                        }} className="h-12 rounded-xl bg-white border-none" />
                      </div>
                      <button onClick={() => setTaxCharges(taxCharges.filter((_, i) => i !== idx))} className="text-red-500 mt-5"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => {
                setSavingSettings(true);
                setDoc(settingsRef, { taxCharges, updatedAt: serverTimestamp() }, { merge: true })
                  .then(() => { toast({ title: "Settings Saved" }); setSavingSettings(false); })
                  .catch(() => setSavingSettings(false));
              }} disabled={savingSettings} className="w-full h-16 rounded-[2rem] bg-black text-white font-black italic uppercase shadow-xl gap-2">
                {savingSettings ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
                Save Settings
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
