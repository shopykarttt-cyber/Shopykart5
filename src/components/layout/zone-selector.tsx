
"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Search, CheckCircle2 } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export function ZoneSelector() {
  const db = useFirestore();
  const [open, setOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const zonesQuery = useMemo(() => query(collection(db, "zones"), orderBy("name", "asc")), [db]);
  const { data: zones } = useCollection(zonesQuery);

  useEffect(() => {
    const saved = localStorage.getItem("grosify_selected_zone");
    if (!saved) {
      setOpen(true);
    } else {
      setSelectedZone(saved);
    }
  }, []);

  const handleSelect = (zoneName: string) => {
    setSelectedZone(zoneName);
    localStorage.setItem("grosify_selected_zone", zoneName);
    setOpen(false);
  };

  const filteredZones = zones?.filter(z => 
    z.name.toLowerCase().includes(search.toLowerCase()) || 
    z.pincode.includes(search)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-[3rem] p-0 overflow-hidden border-none bg-white">
        <div className="p-8 space-y-6">
          <DialogHeader className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
              SELECT <span className="text-primary">ZONE</span>
            </DialogTitle>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Choose your area for the best delivery experience
            </p>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search your area or pincode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 pl-12 rounded-2xl bg-gray-50 border-none font-bold"
            />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {filteredZones?.map((zone: any) => (
                <button
                  key={zone.id}
                  onClick={() => handleSelect(zone.name)}
                  className="w-full text-left p-5 rounded-2xl border-2 border-transparent bg-gray-50 hover:border-primary/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex flex-col">
                    <span className="font-black text-gray-800 uppercase italic">{zone.name}</span>
                    <span className="text-[10px] font-bold text-gray-400">{zone.pincode}</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              {filteredZones?.length === 0 && (
                <div className="py-20 text-center space-y-2">
                  <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No zones found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
