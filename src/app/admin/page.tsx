"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Users, 
  BellRing, 
  ArrowLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  ShoppingBasket,
  DollarSign,
  UserCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  const STATS = [
    { label: "Total Revenue", value: "₹45,230", icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
    { label: "Products", value: "128", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Customers", value: "1,240", icon: UserCheck, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Active Coupons", value: "12", icon: Tag, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden p-6 space-y-8">
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-2xl border w-full flex overflow-x-auto hide-scrollbar">
            <TabsTrigger value="dashboard" className="rounded-xl flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="coupons" className="rounded-xl flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Tag className="w-4 h-4 mr-2" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">
              <BellRing className="w-4 h-4 mr-2" />
              Push
            </TabsTrigger>
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
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Button className="h-14 rounded-2xl justify-between bg-white text-gray-800 border-gray-100 border hover:bg-gray-50" onClick={() => setActiveTab("products")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-xl"><Plus className="w-4 h-4 text-blue-500" /></div>
                    <span className="font-bold">Add New Product</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Button>
                <Button className="h-14 rounded-2xl justify-between bg-white text-gray-800 border-gray-100 border hover:bg-gray-50" onClick={() => setActiveTab("coupons")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 p-2 rounded-xl"><Tag className="w-4 h-4 text-orange-500" /></div>
                    <span className="font-bold">Create Coupon</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Button>
                <Button className="h-14 rounded-2xl justify-between bg-white text-gray-800 border-gray-100 border hover:bg-gray-50" onClick={() => setActiveTab("notifications")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-xl"><BellRing className="w-4 h-4 text-red-500" /></div>
                    <span className="font-bold">Send Push Notification</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Manage Products</h2>
              <Button size="sm" className="rounded-xl h-10 px-4">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-4 rounded-3xl border-none premium-shadow flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl"></div>
                    <div>
                      <h4 className="font-bold text-sm">Product Item {i}</h4>
                      <p className="text-xs text-gray-500">Fruits & Vegetables • 1kg</p>
                      <p className="text-xs font-bold text-primary mt-0.5">₹249</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs font-bold">Edit</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
             <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Coupons</h2>
              <Button size="sm" className="rounded-xl h-10 px-4">
                <Plus className="w-4 h-4 mr-2" /> New
              </Button>
            </div>
            <div className="grid gap-4">
              {["GROSIFY100", "FREESHIP", "WELCOME50"].map((code) => (
                <Card key={code} className="p-5 rounded-[2rem] border-none premium-shadow flex items-center justify-between">
                  <div>
                    <code className="bg-gray-100 px-3 py-1 rounded-lg text-primary font-bold text-sm">{code}</code>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Valid until 30 May, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">Active</p>
                    <p className="text-[10px] text-gray-400">120 Uses</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <h2 className="text-xl font-bold">Push Notifications</h2>
            <Card className="p-6 rounded-[2.5rem] border-none premium-shadow space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Title</label>
                  <Input placeholder="Flash Sale Alert!" className="rounded-2xl h-12 bg-gray-50 border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Message Body</label>
                  <textarea className="w-full min-h-[100px] p-4 rounded-2xl bg-gray-50 border-none text-sm resize-none focus:ring-1 focus:ring-primary outline-none" placeholder="Get 40% off on all organic products..." />
                </div>
              </div>
              <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                Send Notification to All
              </Button>
            </Card>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider">Recent Logs</h3>
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                   <div className="bg-primary/10 p-2 rounded-xl self-start"><BellRing className="w-4 h-4 text-primary" /></div>
                   <div>
                     <p className="text-sm font-bold">Weekly Fresh Stock Update</p>
                     <p className="text-xs text-gray-500">Sent to 1,240 customers • 2 days ago</p>
                   </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
