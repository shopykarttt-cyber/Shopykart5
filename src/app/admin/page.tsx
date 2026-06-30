
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
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
  Ticket,
  Flag,
  FileUp,
  ShoppingBag,
  Star,
  Edit3,
  MapPin,
  Map as MapIcon,
  RotateCcw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Optimized Map Component with better error handling
const ZoneMap = dynamic(() => import('react-leaflet').then((mod) => {
  const { MapContainer, TileLayer, Marker, Polygon, Polyline, useMapEvents } = mod;
  
  function MapEvents({ onClick }: { onClick: (pos: [number, number]) => void }) {
    useMapEvents({
      click(e) {
        onClick([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  return function MapComponent({ 
    points, 
    onMapClick, 
    center 
  }: { 
    points: [number, number][], 
    onMapClick: (pos: [number, number]) => void,
    center: [number, number]
  }) {
    return (
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{x}/{y}/{z}.png" />
        <MapEvents onClick={onMapClick} />
        {points?.map((pos, i) => <Marker key={`marker-${i}`} position={pos} />)}
        {points?.length > 1 && <Polyline positions={points} color="red" />}
        {points?.length > 2 && <Polygon positions={points} color="green" fillColor="green" fillOpacity={0.3} />}
      </MapContainer>
    );
  }), { ssr: false });

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isCouponSheetOpen, setIsCouponSheetOpen] = useState(false);
  const [isZoneSheetOpen, setIsZoneSheetOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  const productFileRef = useRef<HTMLInputElement>(null);
  const csvFileRef = useRef<HTMLInputElement>(null);
  const categoryFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);

  const [zonePoints, setZonePoints] = useState<[number, number][]>([]);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const customersQuery = useMemo(() => user ? query(collection(db, "customers"), orderBy("joinedAt", "desc")) : null, [db, user]);
  const { data: customers } = useCollection(customersQuery);

  const productsQuery = useMemo(() => user ? query(collection(db, "products"), orderBy("createdAt", "desc")) : null, [db, user]);
  const { data: products } = useCollection(productsQuery);

  const categoriesQuery = useMemo(() => user ? query(collection(db, "categories"), orderBy("name", "asc")) : null, [db, user]);
  const { data: categories } = useCollection(categoriesQuery);

  const couponsQuery = useMemo(() => user ? query(collection(db, "coupons"), orderBy("code", "asc")) : null, [db, user]);
  const { data: coupons } = useCollection(couponsQuery);

  const ordersQuery = useMemo(() => user ? query(collection(db, "orders"), orderBy("createdAt", "desc")) : null, [db, user]);
  const { data: orders } = useCollection(ordersQuery);

  const bannersQuery = useMemo(() => user ? query(collection(db, "banners"), orderBy("createdAt", "desc")) : null, [db, user]);
  const { data: banners } = useCollection(bannersQuery);

  const zonesQuery = useMemo(() => user ? query(collection(db, "zones"), orderBy("name", "asc")) : null, [db, user]);
  const { data: zones } = useCollection(zonesQuery);

  const [productForm, setProductForm] = useState({
    name: "", mrp: "", price: "", unit: "", category: "", description: "", imageData: "", isTopRated: false
  });

  const [categoryForm, setCategoryForm] = useState({ name: "", imageData: "" });
  const [bannerForm, setBannerForm] = useState({ title: "", imageData: "" });
  const [couponForm, setCouponForm] = useState({ code: "", value: "", type: "fixed" });
  const [zoneForm, setZoneForm] = useState({ name: "", pincode: "" });

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

  const handleProductImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const optimized = await optimizeImage(file);
      setProductForm(prev => ({ ...prev, imageData: optimized }));
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      const dataRows = rows.slice(1).filter(row => row.length >= 5 && row[0]?.trim() !== "");
      let successCount = 0;
      for (const row of dataRows) {
        const name = row[0]?.trim();
        const mrp = parseFloat(row[1]?.trim());
        const price = parseFloat(row[2]?.trim());
        const unit = row[3]?.trim();
        const category = row[4]?.trim();
        const description = row[5]?.trim() || "";
        if (name && !isNaN(mrp) && !isNaN(price) && category) {
          const productData = {
            name, mrp, price, unit, category, description,
            isTopRated: false,
            imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/400/400`,
            createdAt: serverTimestamp()
          };
          addDoc(collection(db, "products"), productData)
            .catch(async () => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: 'products',
                operation: 'create',
                requestResourceData: productData
              }));
            });
          successCount++;
        }
      }
      toast({ title: "Import Successful", description: `Added ${successCount} products.` });
    };
    reader.readAsText(file);
  };

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.mrp || !productForm.price || !productForm.category) {
      toast({ variant: "destructive", title: "Missing Fields" });
      return;
    }
    const data = {
      ...productForm,
      mrp: Number(productForm.mrp),
      price: Number(productForm.price),
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
    setProductForm({ name: "", mrp: "", price: "", unit: "", category: "", description: "", imageData: "", isTopRated: false });
    setEditingProductId(null);
    setIsProductSheetOpen(false);
  };

  const handleEditProduct = (p: any) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name ?? "",
      mrp: p.mrp?.toString() ?? "",
      price: p.price?.toString() ?? "",
      unit: p.unit ?? "",
      category: p.category ?? "",
      description: p.description ?? "",
      imageData: p.imageUrl ?? "",
      isTopRated: p.isTopRated ?? false
    });
    setIsProductSheetOpen(true);
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

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", imageData: "" });
    setEditingCategoryId(null);
    setIsCategorySheetOpen(false);
  };

  const handleAddBanner = () => {
    if (!bannerForm.imageData) return;
    const data = { 
      title: bannerForm.title,
      imageUrl: bannerForm.imageData,
      createdAt: serverTimestamp() 
    };
    addDoc(collection(db, "banners"), data)
      .then(() => {
        toast({ title: "Banner Uploaded" });
        setBannerForm({ title: "", imageData: "" });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'banners',
          operation: 'create',
          requestResourceData: data
        }));
      });
  };

  const handleAddCoupon = () => {
    if (!couponForm.code || !couponForm.value) return;
    const data = {
      code: couponForm.code.toUpperCase(),
      value: Number(couponForm.value),
      discountType: couponForm.type,
      updatedAt: serverTimestamp()
    };
    if (editingCouponId) {
      updateDoc(doc(db, "coupons", editingCouponId), data)
        .then(() => { toast({ title: "Coupon Updated!" }); resetCouponForm(); })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `coupons/${editingCouponId}`,
            operation: 'update',
            requestResourceData: data
          }));
        });
    } else {
      const newCoupon = { ...data, createdAt: serverTimestamp() };
      addDoc(collection(db, "coupons"), newCoupon)
        .then(() => { toast({ title: "Coupon Added!" }); resetCouponForm(); })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'coupons',
            operation: 'create',
            requestResourceData: newCoupon
          }));
        });
    }
  };

  const resetCouponForm = () => {
    setCouponForm({ code: "", value: "", type: "fixed" });
    setEditingCouponId(null);
    setIsCouponSheetOpen(false);
  };

  const handleAddZone = () => {
    if (!zoneForm.name || !zoneForm.pincode || zonePoints.length < 3) {
      toast({ variant: "destructive", title: "Invalid Zone", description: "Name, Pincode and at least 3 map points required." });
      return;
    }
    const formattedPoints = zonePoints.map(p => ({ lat: p[0], lng: p[1] }));
    const data = { 
      ...zoneForm, 
      points: formattedPoints,
      updatedAt: serverTimestamp() 
    };
    if (editingZoneId) {
      updateDoc(doc(db, "zones", editingZoneId), data)
        .then(() => { toast({ title: "Zone Updated" }); resetZoneForm(); })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `zones/${editingZoneId}`,
            operation: 'update',
            requestResourceData: data
          }));
        });
    } else {
      const newZone = { ...data, createdAt: serverTimestamp() };
      addDoc(collection(db, "zones"), newZone)
        .then(() => { toast({ title: "Zone Created" }); resetZoneForm(); })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'zones',
            operation: 'create',
            requestResourceData: newZone
          }));
        });
    }
  };

  const resetZoneForm = () => {
    setZoneForm({ name: "", pincode: "" });
    setZonePoints([]);
    setEditingZoneId(null);
    setIsZoneSheetOpen(false);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Live Orders", icon: ShoppingBag },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Category", icon: Grid },
    { id: "zones", label: "Zones", icon: MapPin },
    { id: "banners", label: "Banners", icon: Flag },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "customers", label: "Customers", icon: Users },
  ];

  const formatOrderDate = (timestamp: any) => {
    if (!timestamp || !isClient) return 'Recent';
    try {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    } catch (e) {
      return 'Recent';
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
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
                  <div className="pt-8">
                    <Button variant="ghost" onClick={() => router.push("/")} className="w-full justify-start gap-4 px-4 py-6 text-gray-400 font-bold">
                      <ArrowLeft className="w-5 h-5" /> Back to App
                    </Button>
                  </div>
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

        {view === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-2">
              <h2 className="text-2xl font-black italic uppercase">PRODUCTS</h2>
              <div className="flex gap-2">
                <input type="file" ref={csvFileRef} onChange={handleCsvUpload} className="hidden" accept=".csv" />
                <Button variant="outline" onClick={() => csvFileRef.current?.click()} className="rounded-2xl border-dashed h-12 gap-2 font-bold px-4"><FileUp className="w-4 h-4" /> Bulk Import</Button>
                <Sheet open={isProductSheetOpen} onOpenChange={setIsProductSheetOpen}>
                  <SheetTrigger asChild>
                    <Button onClick={() => { setEditingProductId(null); resetProductForm(); setIsProductSheetOpen(true); }} className="rounded-2xl bg-black text-white px-6 h-12 gap-2 shadow-lg"><Plus className="w-5 h-5" /> Add New</Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[95vh] rounded-t-[3rem] bg-white p-0 z-[1001]">
                    <ScrollArea className="h-full px-8 py-8">
                      <SheetHeader className="mb-6"><SheetTitle className="text-2xl font-black uppercase italic">{editingProductId ? "Edit Product" : "Add Product"}</SheetTitle></SheetHeader>
                      <div className="space-y-6 pb-20 max-w-xl mx-auto">
                        <div onClick={() => productFileRef.current?.click()} className="w-full h-48 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group">
                          {productForm.imageData ? <img src={productForm.imageData} alt="Product Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-gray-300" />}
                          <input type="file" ref={productFileRef} onChange={handleProductImagePick} className="hidden" accept="image/*" />
                        </div>
                        <Input placeholder="Product Name *" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                        <div className="grid grid-cols-2 gap-4">
                          <Input type="number" placeholder="MRP (₹) *" value={productForm.mrp} onChange={e => setProductForm({...productForm, mrp: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                          <Input type="number" placeholder="Price (₹) *" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                        </div>
                        <Select value={productForm.category} onValueChange={val => setProductForm({...productForm, category: val})}>
                          <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold"><SelectValue placeholder="Select Category *" /></SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl z-[1002]">
                            {categories?.map((cat: any) => <SelectItem key={cat.id} value={cat.name} className="py-3 font-bold">{cat.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input placeholder="Unit (e.g. 1kg)" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                        <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <Star className={`w-5 h-5 ${productForm.isTopRated ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                            <Label className="font-bold cursor-pointer" htmlFor="top-rated-toggle">Top Rated Product</Label>
                          </div>
                          <Switch id="top-rated-toggle" checked={productForm.isTopRated} onCheckedChange={val => setProductForm({...productForm, isTopRated: val})} />
                        </div>
                        <Button className="w-full h-16 rounded-[2rem] bg-primary text-lg font-black italic uppercase shadow-xl" onClick={handleAddProduct}>
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
                <Card key={p.id} className="p-6 rounded-[2rem] bg-white flex items-center justify-between shadow-lg relative overflow-hidden">
                  {p.isTopRated && <div className="absolute top-0 right-0 bg-yellow-500 text-white p-1 rounded-bl-xl shadow-md"><Star className="w-3 h-3 fill-current" /></div>}
                  <div className="flex items-center gap-4">
                    <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-2xl object-cover" />
                    <div><h4 className="font-bold text-gray-800">{p.name}</h4><p className="text-[10px] font-black text-primary uppercase">{p.category}</p><p className="text-sm font-black">₹{p.price}</p></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditProduct(p)} className="text-gray-200 hover:text-primary p-2 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => { deleteDoc(doc(db, "products", p.id)).catch(async () => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `products/${p.id}`, operation: 'delete' })); }); }} className="text-gray-200 hover:text-red-500 p-2 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                    <SheetHeader><SheetTitle className="text-2xl font-black uppercase italic">{editingCategoryId ? "Edit Category" : "Add Category"}</SheetTitle></SheetHeader>
                    <div onClick={() => categoryFileRef.current?.click()} className="w-full h-32 rounded-2xl bg-gray-50 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative">
                      {categoryForm.imageData ? <img src={categoryForm.imageData} alt="Category Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-300" />}
                      <input type="file" ref={categoryFileRef} onChange={e => { const file = e.target.files?.[0]; if (file) optimizeImage(file).then(opt => setCategoryForm(p => ({...p, imageData: opt}))); }} className="hidden" accept="image/*" />
                    </div>
                    <Input placeholder="Category Name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                    <Button onClick={handleAddCategory} className="h-16 w-full rounded-2xl bg-black font-black uppercase italic">{editingCategoryId ? "Update Category" : "Add Category"}</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories?.map((cat: any) => (
                <Card key={cat.id} className="p-5 rounded-[2.5rem] bg-white flex flex-col items-center relative text-center shadow-lg group">
                  <img src={cat.imageUrl} alt={cat.name} className="w-20 h-20 object-cover rounded-3xl mb-2" />
                  <span className="font-bold text-gray-800 text-sm">{cat.name}</span>
                  <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditCategory(cat)} className="bg-white/80 p-1.5 rounded-full text-primary hover:bg-white shadow-sm"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { deleteDoc(doc(db, "categories", cat.id)).catch(async () => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `categories/${cat.id}`, operation: 'delete' })); }); }} className="bg-white/80 p-1.5 rounded-full text-red-500 hover:bg-white shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "zones" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black italic uppercase">ZONES</h2>
              <Sheet open={isZoneSheetOpen} onOpenChange={setIsZoneSheetOpen}>
                <SheetTrigger asChild>
                  <Button onClick={() => { resetZoneForm(); setIsZoneSheetOpen(true); }} className="rounded-2xl bg-black text-white h-12 gap-2 px-6 shadow-lg"><Plus className="w-5 h-5" /> Add Zone</Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[95vh] rounded-t-[3rem] bg-white z-[1001] p-0">
                  <ScrollArea className="h-full px-8 py-8">
                    <div className="p-8 max-w-2xl mx-auto space-y-6">
                      <SheetHeader><SheetTitle className="text-2xl font-black uppercase italic">Add/Edit Zone</SheetTitle></SheetHeader>
                      <Input placeholder="Zone Name" value={zoneForm.name} onChange={e => setZoneForm({...zoneForm, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                      <Input placeholder="Pincode" value={zoneForm.pincode} onChange={e => setZoneForm({...zoneForm, pincode: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                      <div className="h-[400px] rounded-3xl overflow-hidden border-2 border-gray-100 relative z-0">
                        {isClient && (
                          <ZoneMap 
                            center={zonePoints.length > 0 ? zonePoints[0] : [28.6139, 77.2090]} 
                            points={zonePoints}
                            onMapClick={(pos) => setZonePoints([...zonePoints, pos])}
                          />
                        )}
                      </div>
                      <Button onClick={handleAddZone} className="h-16 w-full rounded-2xl bg-black font-black uppercase italic shadow-xl">Save Zone</Button>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {zones?.map((z: any) => (
                <Card key={z.id} className="p-6 rounded-[2rem] bg-white flex justify-between items-center shadow-lg border-l-4 border-primary">
                  <div className="flex items-center gap-4"><div className="bg-gray-50 p-3 rounded-2xl"><MapIcon className="w-6 h-6 text-gray-400" /></div><div><h4 className="font-black text-lg">{z.name}</h4><p className="text-xs text-gray-500 font-bold uppercase">{z.pincode}</p></div></div>
                  <button onClick={() => { deleteDoc(doc(db, "zones", z.id)).catch(async () => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `zones/${z.id}`, operation: 'delete' })); }); }} className="text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "banners" && (
           <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase">HOME BANNERS</h2>
            <Card className="p-6 rounded-[2.5rem] bg-white shadow-xl space-y-4 max-w-xl">
              <div onClick={() => bannerFileRef.current?.click()} className="w-full h-40 rounded-3xl bg-gray-50 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative">
                {bannerForm.imageData ? <img src={bannerForm.imageData} alt="Banner Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-gray-300" />}
                <input type="file" ref={bannerFileRef} onChange={e => { const file = e.target.files?.[0]; if (file) optimizeImage(file).then(opt => setBannerForm(p => ({...p, imageData: opt}))); }} className="hidden" accept="image/*" />
              </div>
              <Input placeholder="Offer Title" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
              <Button onClick={handleAddBanner} className="h-14 w-full rounded-2xl bg-black font-black uppercase italic">Upload Banner</Button>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners?.map((b: any) => (
                <Card key={b.id} className="relative h-40 rounded-[2rem] overflow-hidden group shadow-xl">
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-6">
                    <span className="text-white font-black italic uppercase">{b.title}</span>
                    <button onClick={() => { deleteDoc(doc(db, "banners", b.id)).catch(async () => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `banners/${b.id}`, operation: 'delete' })); }); }} className="text-white hover:text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                  </div>
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
                  <Button onClick={() => { setEditingCouponId(null); resetCouponForm(); setIsCouponSheetOpen(true); }} className="rounded-2xl bg-black text-white h-12 gap-2 px-6 shadow-lg"><Plus className="w-5 h-5" /> Add Coupon</Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[60vh] rounded-t-[3rem] bg-white z-[1001]">
                  <div className="p-8 max-w-xl mx-auto space-y-6">
                    <SheetHeader><SheetTitle className="text-2xl font-black uppercase italic">{editingCouponId ? "Edit Coupon" : "Add Coupon"}</SheetTitle></SheetHeader>
                    <Input placeholder="CODE" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Value" value={couponForm.value} onChange={e => setCouponForm({...couponForm, value: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                      <Select value={couponForm.type} onValueChange={val => setCouponForm({...couponForm, type: val})}>
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold w-32"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-none"><SelectItem value="fixed">Fixed</SelectItem><SelectItem value="percentage">%</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddCoupon} className="h-16 w-full rounded-2xl bg-black font-black uppercase italic">Save Coupon</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons?.map((c: any) => (
                <Card key={c.id} className="p-6 rounded-[2rem] bg-white flex justify-between items-center shadow-lg border-l-4 border-primary">
                  <div><h4 className="font-black text-lg">{c.code}</h4><p className="text-xs text-gray-500 font-bold uppercase">{c.discountType === 'fixed' ? `₹${c.value} OFF` : `${c.value}% OFF`}</p></div>
                  <button onClick={() => { deleteDoc(doc(db, "coupons", c.id)).catch(async () => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `coupons/${c.id}`, operation: 'delete' })); }); }} className="text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase">LIVE ORDERS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders?.map((order: any) => (
                <Card key={order.id} className="p-6 rounded-[2.5rem] bg-white shadow-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <div><h4 className="font-bold text-gray-900">Order #{order.id?.slice(0, 6)}</h4><p className="text-[10px] text-gray-400 font-black uppercase">{formatOrderDate(order.createdAt)}</p></div>
                    <Badge className="bg-orange-100 text-orange-600 border-none font-black uppercase tracking-widest">{order.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm"><span className="text-gray-500">{item.name} x {item.quantity}</span><span className="font-bold">₹{(item.price ?? 0) * (item.quantity ?? 0)}</span></div>
                    ))}
                  </div>
                  <div className="pt-4 border-t flex justify-between items-center"><div className="text-[10px] font-black text-gray-400 uppercase">Total Amount</div><div className="text-xl font-black italic">₹{order.total}</div></div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "customers" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase">REGISTERED USERS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers?.map((customer: any) => (
                <Card key={customer.id} className="p-6 rounded-[2.5rem] bg-white flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
                    <div><h4 className="font-bold text-gray-900">{customer.name}</h4><p className="text-[10px] text-gray-400 font-black uppercase">{customer.email}</p></div>
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
