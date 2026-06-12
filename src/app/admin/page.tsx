
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
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function AdminPage() {
  const router = useRouter();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);

  // Firestore Collections
  const customersQuery = useMemo(() => query(collection(db, "customers"), orderBy("joinedAt", "desc")), [db]);
  const { data: customers, loading: customersLoading } = useCollection(customersQuery);

  const productsQuery = useMemo(() => query(collection(db, "products"), orderBy("name", "asc")), [db]);
  const { data: products, loading: productsLoading } = useCollection(productsQuery);

  const couponsQuery = useMemo(() => query(collection(db, "coupons"), orderBy("code", "asc")), [db]);
  const { data: coupons, loading: couponsLoading } = useCollection(couponsQuery);

  const notificationsQuery = useMemo(() => query(collection(db, "notifications"), orderBy("sentAt", "desc")), [db]);
  const { data: notifications, loading: notificationsLoading } = useCollection(notificationsQuery);

  // Form States
  const [newProduct, setNewProduct] = useState({ name: "", price: "", unit: "", category: "Fruits & Veggies", description: "" });
  const [newCoupon, setNewCoupon] = useState({ code: "", discountType: "fixed", value: "", minOrder: "0", expiryDate: "" });
  const [newNotification, setNewNotification] = useState({ title: "", body: "" });

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
      toast({ title: "Product Added", description: `${newProduct.name} is now live.` });
      setNewProduct({ name: "", price: "", unit: "", category: "Fruits & Veggies", description: "" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleAddCoupon = async () => {
    if (!newCoupon.code || !newCoupon.value) return;
    setIsAddingCoupon(true);
    try {
      addDoc(collection(db, "coupons"), {
        ...newCoupon,
        value: Number(newCoupon.value),
        minOrder: Number(newCoupon.minOrder),
        createdAt: serverTimestamp()
      });
      toast({ title: "Coupon Created", description: `Code ${newCoupon.code} is active.` });
      setNewCoupon({ code: "", discountType: "fixed", value: "", minOrder: "0", expiryDate: "" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsAddingCoupon(false);
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.body) return;
    try {
      addDoc(collection(db, "notifications"), {
        ...newNotification,
        sentAt: new Date().toISOString(),
        target: "all"
      });
      toast({ title: "Notification Sent", description: "Message broadcasted to all users." });
      setNewNotification({ title: "", body: "" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    try {
      deleteDoc(doc(db, coll, id));
      toast({ title: "Deleted Successfully" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const STATS = [
    { label: "Total Revenue", value: "₹45,230", icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
    { label: "Products", value: products?.length || "0", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Customers", value: customers?.length || "0", icon: UserCheck, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Active Coupons", value: coupons?.length || "0", icon: Tag, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Admin Control</h1>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Grosify Admin
        </div>
      </header>

      <div className="flex-1 overflow-x-hidden p-6 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-2xl border w-full flex overflow-x-auto hide-scrollbar">
            <TabsTrigger value="dashboard" className="rounded-xl flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">Products</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-xl flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">Customers</TabsTrigger>
            <TabsTrigger value="coupons" className="rounded-xl flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">Coupons</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">Push</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <Card key={i} className="p-4 rounded-[2rem] border-none premium-shadow flex flex-col gap-3">
                  <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-2xl flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </Card>
              ))}
            </div>
            
            <Card className="p-6 rounded-[2.5rem] border-none premium-shadow space-y-4">
              <h3 className="font-bold text-lg">Quick Actions</h3>
              <div className="grid gap-3">
                <Button className="h-14 rounded-2xl justify-between bg-white text-gray-800 border-gray-100 border hover:bg-gray-50" onClick={() => setActiveTab("products")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-xl"><Package className="w-4 h-4 text-blue-500" /></div>
                    <span className="font-bold">Manage Products</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Button>
                <Button className="h-14 rounded-2xl justify-between bg-white text-gray-800 border-gray-100 border hover:bg-gray-50" onClick={() => setActiveTab("notifications")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-xl"><BellRing className="w-4 h-4 text-red-500" /></div>
                    <span className="font-bold">Send Notification</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Products ({products?.length || 0})</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" className="rounded-xl h-10 px-4">
                    <Plus className="w-4 h-4 mr-2" /> Add New
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] rounded-t-[3rem]">
                  <SheetHeader>
                    <SheetTitle>Add New Product</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 mt-6">
                    <Input placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                    <Input placeholder="Price (₹)" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    <Input placeholder="Unit (e.g. 1kg, 500g)" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
                    <Input placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                    <Button className="w-full h-14 rounded-2xl" onClick={handleAddProduct} disabled={isAddingProduct}>
                      {isAddingProduct ? <Loader2 className="animate-spin" /> : "Save Product"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="space-y-4">
              {productsLoading ? <p>Loading...</p> : products?.map((p: any) => (
                <Card key={p.id} className="p-4 rounded-3xl border-none premium-shadow flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{p.name}</h4>
                      <p className="text-xs text-gray-500">{p.unit} • ₹{p.price}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete("products", p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <h2 className="text-xl font-bold">Registered Customers ({customers?.length || 0})</h2>
            <div className="space-y-4">
              {customersLoading ? <p>Loading...</p> : customers?.map((customer: any) => (
                <Card key={customer.id} className="p-5 rounded-[2rem] border-none premium-shadow flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{customer.name}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">{customer.email}</p>
                      <p className="text-[10px] text-primary font-bold">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold">JOINED</p>
                    <p className="text-xs font-bold text-gray-600">
                      {customer.joinedAt ? new Date(customer.joinedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Coupons ({coupons?.length || 0})</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" className="rounded-xl h-10 px-4"><Plus className="w-4 h-4 mr-2" /> New</Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[70vh] rounded-t-[3rem]">
                  <SheetHeader><SheetTitle>Create Coupon</SheetTitle></SheetHeader>
                  <div className="space-y-4 mt-6">
                    <Input placeholder="Coupon Code" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} />
                    <Input placeholder="Value (₹ or %)" type="number" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: e.target.value})} />
                    <Input placeholder="Expiry Date" type="date" value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} />
                    <Button className="w-full h-14 rounded-2xl" onClick={handleAddCoupon} disabled={isAddingCoupon}>
                      {isAddingCoupon ? <Loader2 className="animate-spin" /> : "Save Coupon"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid gap-4">
              {couponsLoading ? <p>Loading...</p> : coupons?.map((c: any) => (
                <Card key={c.id} className="p-5 rounded-[2rem] border-none premium-shadow flex items-center justify-between">
                  <div>
                    <code className="bg-gray-100 px-3 py-1 rounded-lg text-primary font-bold text-sm">{c.code}</code>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Value: ₹{c.value} • Exp: {c.expiryDate || 'No Date'}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete("coupons", c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <h2 className="text-xl font-bold">Push Notifications</h2>
            <Card className="p-6 rounded-[2.5rem] border-none premium-shadow space-y-6">
              <div className="space-y-4">
                <Input placeholder="Title" value={newNotification.title} onChange={e => setNewNotification({...newNotification, title: e.target.value})} />
                <textarea className="w-full min-h-[100px] p-4 rounded-2xl bg-gray-50 border-none text-sm resize-none focus:ring-1 focus:ring-primary outline-none" placeholder="Message Body..." value={newNotification.body} onChange={e => setNewNotification({...newNotification, body: e.target.value})} />
              </div>
              <Button className="w-full h-14 rounded-2xl text-lg font-bold" onClick={handleSendNotification}>Send Broadcast</Button>
            </Card>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider">Recent Logs</h3>
              {notificationsLoading ? <p>Loading...</p> : notifications?.map((n: any) => (
                <div key={n.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                   <div className="bg-primary/10 p-2 rounded-xl self-start"><BellRing className="w-4 h-4 text-primary" /></div>
                   <div className="flex-1">
                     <p className="text-sm font-bold">{n.title}</p>
                     <p className="text-xs text-gray-500">{n.body}</p>
                     <p className="text-[10px] text-gray-300 mt-1">{new Date(n.sentAt).toLocaleString()}</p>
                   </div>
                   <Button variant="ghost" size="icon" className="text-red-200" onClick={() => handleDelete("notifications", n.id)}>
                    <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
