
'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Phone,
  MessageCircle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const TrackingMap = dynamic(() => import('@/components/tracking/TrackingMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-[2.5rem]" />
});

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const orderId = params.orderId as string;

  const orderRef = useMemo(() => doc(db, "orders", orderId), [db, orderId]);
  const { data: order, loading } = useDoc(orderRef);

  const steps = [
    { label: "Ordered", status: "Completed", icon: CheckCircle2 },
    { label: "Processing", status: order?.status === "Processing" || order?.status === "Shipped" || order?.status === "Delivered" ? "Active" : "Pending", icon: Clock },
    { label: "Shipped", status: order?.status === "Shipped" || order?.status === "Delivered" ? "Active" : "Pending", icon: Truck },
    { label: "Delivered", status: order?.status === "Delivered" ? "Active" : "Pending", icon: Package },
  ];

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Locating Your Order...</p>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-black uppercase italic">Order Not Found</h2>
      <Button onClick={() => router.push('/')} className="mt-4 rounded-2xl">Go Home</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col max-w-xl mx-auto">
      <header className="bg-white px-6 py-6 border-b flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 transition-transform active:scale-90">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black italic uppercase tracking-tighter">Track Order</h1>
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">ID: {orderId.slice(-8).toUpperCase()}</p>
        </div>
        <div className="w-8" />
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-20">
          {/* Status Card */}
          <div className="bg-[#2D2D2D] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-8 translate-x-8"></div>
            
            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black italic uppercase leading-none tracking-tighter">
                    {order.status === "Processing" ? "Processing" : order.status === "Shipped" ? "Out for Delivery" : order.status === "Delivered" ? "Delivered" : "Order Placed"}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Expected Arrival: 15-20 Mins</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-2xl border border-primary/20">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Steps Progress */}
              <div className="flex justify-between relative px-2">
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-700 -z-0" />
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 z-10">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                      step.status === "Active" || step.status === "Completed" 
                        ? "bg-primary border-primary shadow-lg shadow-primary/30 text-white" 
                        : "bg-gray-800 border-gray-700 text-gray-500"
                    )}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-tighter",
                      step.status === "Active" || step.status === "Completed" ? "text-white" : "text-gray-500"
                    )}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Map Preview */}
          <div className="h-64 relative bg-gray-50 rounded-[2.5rem] overflow-hidden shadow-inner border-2 border-gray-100">
             <TrackingMap deliveryPos={[28.6139, 77.2090]} />
             <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="bg-primary/10 p-2 rounded-xl"><MapPin className="w-4 h-4 text-primary" /></div>
                   <div className="max-w-[200px]">
                      <p className="text-[8px] font-black text-gray-400 uppercase">Delivery Location</p>
                      <p className="text-[10px] font-bold text-gray-800 truncate">{order.address}</p>
                   </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
             </div>
          </div>

          {/* Delivery Partner */}
          <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-6 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                   <img src={`https://picsum.photos/seed/delivery/100/100`} alt="Partner" className="w-full h-full object-cover" />
                </div>
                <div>
                   <h4 className="font-black italic uppercase text-sm tracking-tight">Rajesh Kumar</h4>
                   <p className="text-[9px] font-bold text-green-500 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Partner
                   </p>
                </div>
             </div>
             <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-xl bg-gray-50 border-none"><Phone className="w-4 h-4 text-gray-600" /></Button>
                <Button size="icon" variant="outline" className="rounded-xl bg-gray-50 border-none"><MessageCircle className="w-4 h-4 text-gray-600" /></Button>
             </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 space-y-6">
             <h3 className="font-black italic uppercase text-lg tracking-tighter">Order Summary</h3>
             <div className="space-y-4">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400 italic">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="text-gray-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="h-px bg-gray-100 my-4" />
                <div className="flex justify-between items-center text-lg font-black italic uppercase leading-none">
                   <span>Total Paid</span>
                   <span className="text-primary">₹{order.total}</span>
                </div>
             </div>
          </div>

          <Button 
            onClick={() => router.push('/')}
            className="w-full h-16 rounded-[2rem] bg-black text-white font-black italic uppercase text-lg shadow-xl"
          >
             Back to Shopping
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
