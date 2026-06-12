
"use client";

import { useState } from "react";
import { Sparkles, X, ChevronRight, ShoppingCart, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { smartBasketAssistant, type SmartBasketAssistantOutput } from "@/ai/flows/smart-basket-assistant";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SmartBasketAssistant() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartBasketAssistantOutput | null>(null);

  const handleGenerate = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await smartBasketAssistant({ userSearchIntent: query });
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-4">
      <Sheet>
        <SheetTrigger asChild>
          <button className="w-full bg-gradient-to-r from-primary to-accent rounded-3xl p-6 text-left relative overflow-hidden group premium-shadow">
            <div className="absolute right-0 top-0 h-full w-32 bg-white/10 skew-x-[-20deg] translate-x-12 group-hover:translate-x-4 transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 fill-current animate-pulse" />
                  <span className="font-bold text-lg">Smart Basket AI</span>
                </div>
                <p className="text-white/80 text-sm font-medium">Get meal bundles & recipes tailored for you.</p>
              </div>
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-[3rem] p-0 bg-white">
          <div className="p-8 space-y-6 overflow-y-auto h-full hide-scrollbar">
            <SheetHeader className="space-y-2">
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <SheetTitle className="text-2xl font-bold">Smart Basket Assistant</SheetTitle>
              </div>
              <p className="text-gray-500 font-medium">Tell us what you're planning, and we'll suggest everything you need.</p>
            </SheetHeader>

            <div className="space-y-4">
              <Textarea 
                placeholder="e.g. Quick Italian dinner for 2, Vegan BBQ party, Summer breakfast prep..."
                className="min-h-[120px] rounded-[2rem] border-gray-100 bg-gray-50 p-6 focus:ring-primary text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button 
                onClick={handleGenerate} 
                disabled={loading || !query}
                className="w-full h-14 rounded-2xl bg-primary text-lg font-bold transition-all hover:scale-[1.02]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Plan My Basket"}
              </Button>
            </div>

            {result && (
              <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Suggested Bundles
                  </h3>
                  <div className="grid gap-4">
                    {result.groceryBundles.map((bundle, idx) => (
                      <div key={idx} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 hover:border-primary/20 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800 text-lg">{bundle.name}</h4>
                          <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10">Add All</Button>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{bundle.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Recommended Recipes
                  </h3>
                  <div className="grid gap-6">
                    {result.recipes.map((recipe, idx) => (
                      <div key={idx} className="space-y-4 p-6 bg-white border border-gray-100 rounded-[2rem] premium-shadow">
                        <div>
                          <h4 className="font-bold text-xl text-primary">{recipe.name}</h4>
                          <p className="text-gray-500 text-sm mt-1">{recipe.description}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Ingredients</span>
                          <div className="flex flex-wrap gap-2">
                            {recipe.ingredients.map((ing, i) => (
                              <span key={i} className="text-xs font-medium bg-gray-100 px-3 py-1.5 rounded-full">{ing}</span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Instructions</span>
                          <div className="space-y-3">
                            {recipe.instructions.map((step, i) => (
                              <div key={i} className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                                  {i + 1}
                                </span>
                                <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
