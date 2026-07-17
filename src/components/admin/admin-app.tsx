"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Star,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Lock,
  Mail,
  Loader2,
  TrendingUp,
  IndianRupee,
  Users,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Check,
  XCircle,
  CreditCard,
  Zap,
  Send,
  ShieldCheck,
  KeyRound,
  EyeOff,
  ExternalLink,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn, formatINR, formatDate, slugify } from "@/lib/utils";
import { useAdminStats, useProducts, useCategories, useAdminOrders, useAdminCoupons } from "@/lib/hooks";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import type { Product, Order, Category, Coupon, Settings } from "@/lib/types";
import { StarRating } from "@/components/shared/star-rating";

type AdminTab = "dashboard" | "products" | "orders" | "categories" | "reviews" | "coupons" | "integrations" | "settings";

export function AdminApp({ settings: initialSettings }: { settings: Settings }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAuthed(d?.authenticated === true))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Package }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const logout = async () => {
    await fetch("/api/admin", { method: "DELETE" });
    setAuthed(false);
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-base">🫘</div>
          <div>
            <p className="text-sm font-bold leading-none">Admin Panel</p>
            <p className="text-[10px] text-muted-foreground">{initialSettings.brandName}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <t.icon size={17} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <button onClick={() => navigate("/")} className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-muted">
            <Eye size={17} /> View Store
          </button>
          <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-3 top-20 z-50 md:hidden">
            <Menu size={18} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-base">🫘</div>
            <p className="text-sm font-bold">Admin Panel</p>
          </div>
          <nav className="space-y-1 p-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
                  tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <t.icon size={17} /> {t.label}
              </button>
            ))}
            <button onClick={() => navigate("/")} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
              <Eye size={17} /> View Store
            </button>
            <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
              <LogOut size={17} /> Logout
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden p-4 pt-16 md:p-6 md:pt-6">
        {tab === "dashboard" && <DashboardView />}
        {tab === "products" && <ProductsView />}
        {tab === "orders" && <OrdersView />}
        {tab === "categories" && <CategoriesView />}
        {tab === "reviews" && <ReviewsView />}
        {tab === "coupons" && <CouponsView />}
        {tab === "integrations" && <IntegrationsView initialSettings={initialSettings} />}
        {tab === "settings" && <SettingsView initialSettings={initialSettings} />}
      </main>
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      toast.success("Welcome back, Admin! 👋");
      onSuccess();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-amber-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-3xl shadow-lg">🫘</div>
          <h1 className="font-playfair text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your store</p>
        </div>
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="admin@satnamsinghchana.com" required />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="••••••••" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                Sign In
              </Button>
            </form>
            <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <p className="font-semibold">Default credentials:</p>
              <p>Email: admin@satnamsinghchana.com</p>
              <p>Password: satnam@2026</p>
            </div>
            <Button variant="ghost" className="mt-3 w-full" onClick={() => navigate("/")}>
              ← Back to Store
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardView() {
  const { data: stats, loading } = useAdminStats();

  if (loading || !stats) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  const statCards = [
    { label: "Total Revenue", value: formatINR(stats.totalRevenue), icon: IndianRupee, color: "text-emerald-600 bg-emerald-100" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-blue-600 bg-blue-100" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "text-purple-600 bg-purple-100" },
    { label: "Reviews", value: stats.totalReviews, icon: Star, color: "text-amber-600 bg-amber-100" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: AlertTriangle, color: "text-orange-600 bg-orange-100" },
    { label: "Low Stock", value: stats.lowStockProducts, icon: AlertTriangle, color: "text-red-600 bg-red-100" },
  ];

  const maxSale = Math.max(...stats.salesByDay.map((d) => d.total), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-full", s.color)}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><TrendingUp size={18} className="text-primary" /> Sales (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-end justify-between gap-2">
            {stats.salesByDay.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-primary to-primary/60 transition-all hover:opacity-80"
                    style={{ height: `${(d.total / maxSale) * 100}%`, minHeight: d.total > 0 ? "8px" : "2px" }}
                    title={`${formatINR(d.total)} • ${d.count} orders`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{d.date}</span>
                <span className="text-[10px] font-semibold">{d.count > 0 ? formatINR(d.total) : "-"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent orders */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentOrders.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No orders yet</p>
              ) : (
                stats.recentOrders.map((o) => (
                  <div key={o.id as string} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2 text-sm">
                    <div>
                      <p className="font-semibold">{o.customerName as string}</p>
                      <p className="text-xs text-muted-foreground">{o.orderNumber as string}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatINR(o.total as number)}</p>
                      <Badge variant={o.status === "DELIVERED" ? "default" : o.status === "PENDING" ? "secondary" : "outline"} className="text-[10px]">
                        {o.status as string}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Selling Products</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topProducts.map((p, i) => (
                <div key={p.id as string} className="flex items-center gap-3 rounded-lg border border-border p-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">{p.name as string}</p>
                    <p className="text-xs text-muted-foreground">{p.soldCount as number} sold</p>
                  </div>
                  <span className="text-sm font-bold">{formatINR((p.salePrice as number) || (p.price as number))}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low stock */}
      {stats.lowStock.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base text-destructive"><AlertTriangle size={18} /> Low Stock Alert</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {stats.lowStock.map((p) => (
                <div key={p.id as string} className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-sm">
                  <span className="line-clamp-1 font-medium">{p.name as string}</span>
                  <Badge variant="destructive" className="text-[10px]">{p.stockQuantity as number} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProductsView() {
  const { data, loading, refetch } = useProducts({});
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = (data?.products || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const onDelete = async (slug: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      refetch();
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{data?.count || 0} products total</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-muted">
                        {p.images[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />}
                      </div>
                      <span className="line-clamp-1 max-w-[180px] text-sm font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{p.category?.name || "-"}</TableCell>
                  <TableCell className="text-sm font-semibold">{formatINR(p.salePrice || p.price)}</TableCell>
                  <TableCell className="text-sm">{p.stockQuantity}</TableCell>
                  <TableCell>
                    <Badge variant={p.inStock ? "default" : "destructive"} className="text-[10px]">
                      {p.inStock ? "In Stock" : "Out"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.soldCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/product/${p.slug}`)} title="View">
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(p); setShowForm(true); }} title="Edit">
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(p.slug)} title="Delete">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); refetch(); }}
        />
      )}
    </div>
  );
}

function ProductForm({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const { data: categories } = useCategories();
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    categoryId: product?.categoryId || categories?.[0]?.id || "",
    price: product?.price?.toString() || "",
    salePrice: product?.salePrice?.toString() || "",
    weight: product?.weight || "",
    stockQuantity: product?.stockQuantity?.toString() || "50",
    inStock: product?.inStock ?? true,
    isFeatured: product?.isFeatured ?? false,
    isDealOfDay: product?.isDealOfDay ?? false,
    isBestseller: product?.isBestseller ?? false,
    isNew: product?.isNew ?? false,
    tags: product?.tags?.join(", ") || "",
    ingredients: product?.ingredients || "",
    benefits: product?.benefits?.join("\n") || "",
    shelfLife: product?.shelfLife || "6 Months",
    storageInfo: product?.storageInfo || "",
    images: product?.images?.join("\n") || "/products/roasted-chana-plain.png",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        shortDescription: form.shortDescription,
        description: form.description,
        categoryId: form.categoryId,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        weight: form.weight,
        stockQuantity: Number(form.stockQuantity),
        inStock: form.inStock,
        isFeatured: form.isFeatured,
        isDealOfDay: form.isDealOfDay,
        isBestseller: form.isBestseller,
        isNew: form.isNew,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        ingredients: form.ingredients,
        benefits: form.benefits.split("\n").map((b) => b.trim()).filter(Boolean),
        shelfLife: form.shelfLife,
        storageInfo: form.storageInfo,
        images: form.images.split("\n").map((i) => i.trim()).filter(Boolean),
      };
      const url = product ? `/api/products/${product.slug}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed");
      toast.success(product ? "Product updated" : "Product created");
      onSaved();
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <Label>Category *</Label>
            <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {(categories || []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Price (₹) *</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <Label>Sale Price (₹)</Label>
            <Input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
          </div>
          <div>
            <Label>Weight</Label>
            <Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 360G" />
          </div>
          <div>
            <Label>Stock Quantity</Label>
            <Input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Short Description</Label>
            <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Full Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="sm:col-span-2">
            <Label>Images (one URL per line)</Label>
            <Textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3} placeholder="/products/roasted-chana-plain.png" />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div>
            <Label>Shelf Life</Label>
            <Input value={form.shelfLife} onChange={(e) => setForm({ ...form, shelfLife: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Ingredients</Label>
            <Input value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Benefits (one per line)</Label>
            <Textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={3} />
          </div>
          <div className="sm:col-span-2">
            <Label>Storage Info</Label>
            <Input value={form.storageInfo} onChange={(e) => setForm({ ...form, storageInfo: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-4 rounded-lg border border-border p-3">
            {[
              { k: "inStock" as const, l: "In Stock" },
              { k: "isFeatured" as const, l: "Featured" },
              { k: "isDealOfDay" as const, l: "Deal of Day" },
              { k: "isBestseller" as const, l: "Bestseller" },
              { k: "isNew" as const, l: "New Arrival" },
            ].map((f) => (
              <label key={f.k} className="flex items-center gap-2 text-sm">
                <Switch checked={form[f.k]} onCheckedChange={(v) => setForm({ ...form, [f.k]: v })} />
                {f.l}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {product ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrdersView() {
  const [status, setStatus] = useState("all");
  const { data: orders, loading, refetch } = useAdminOrders(status === "all" ? undefined : status);
  const [selected, setSelected] = useState<Order | null>(null);

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Order status updated to ${newStatus}`);
      refetch();
      if (selected?.id === id) setSelected({ ...selected, status: newStatus });
    } else {
      toast.error("Failed to update");
    }
  };

  const resendEmails = async (id: string) => {
    toast.info("Resending order emails...");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendStatusEmail: true }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success("📧 Order confirmation & admin notification emails sent!");
      } else {
        toast.error(d.error || "Failed to send emails (is Gmail configured in Integrations?)");
      }
    } catch {
      toast.error("Failed to send emails");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{orders?.length || 0} orders</p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (orders || []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No orders found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orders || []).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-semibold">{o.orderNumber}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">{o.email}</p>
                  </TableCell>
                  <TableCell className="font-bold">{formatINR(o.total)}</TableCell>
                  <TableCell>
                    <Badge variant={o.paymentStatus === "PAID" ? "default" : "secondary"} className="text-[10px]">{o.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(o)}><Eye size={14} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
            <DialogHeader><DialogTitle>Order {selected.orderNumber}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-semibold">Customer</p>
                  <p>{selected.customerName}</p>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                  <p className="text-xs text-muted-foreground">{selected.phone}</p>
                </div>
                <div>
                  <p className="font-semibold">Shipping Address</p>
                  <p className="text-xs">{selected.address}</p>
                  <p className="text-xs">{selected.city}, {selected.state} - {selected.pincode}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold">Items</p>
                <div className="space-y-1 rounded-lg border border-border p-2">
                  {selected.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-xs">
                      <span>{i.name} × {i.quantity}{i.weight ? ` (${i.weight})` : ""}</span>
                      <span className="font-semibold">{formatINR(i.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">{formatINR(selected.total)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Payment: {selected.paymentMethod} ({selected.paymentStatus})</span>
                <span>{formatDate(selected.createdAt)}</span>
              </div>
              {selected.razorpayPaymentId && (
                <p className="text-xs text-muted-foreground">Payment ID: {selected.razorpayPaymentId}</p>
              )}
              <div className="flex gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => resendEmails(selected.id)}
                >
                  <Send size={14} /> Resend Order Emails
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CategoriesView() {
  const { data: categories, refetch } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#fef3c7", icon: "📦", image: "" });

  const create = async () => {
    if (!form.name) return toast.error("Name required");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Category created");
      setForm({ name: "", description: "", color: "#fef3c7", icon: "📦", image: "" });
      setShowForm(false);
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold">Categories</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={16} /> Add Category</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(categories || []).map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ backgroundColor: c.color || "#fef3c7" }}>{c.icon}</div>
              <div className="flex-1">
                <p className="font-bold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.productCount || 0} products</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Icon (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
                <div><Label>Color</Label><Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
              </div>
              <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/products/..." /></div>
              <div className="flex gap-2"><Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button onClick={create} className="flex-1">Create</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ReviewsView() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews?approvedOnly=false").then((r) => r.json()).then((d) => { setReviews(d); setLoading(false); });
  }, []);

  const toggleApprove = async (id: string, approved: boolean) => {
    await fetch("/api/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved }) });
    setReviews((r) => r.map((x) => (x.id === id ? { ...x, approved } : x)));
    toast.success(approved ? "Review approved" : "Review hidden");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    setReviews((r) => r.filter((x) => x.id !== id));
    toast.success("Review deleted");
  };

  return (
    <div className="space-y-4">
      <h1 className="font-playfair text-2xl font-bold">Reviews</h1>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">No reviews yet</p>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{r.customerName}</p>
                    <StarRating rating={r.rating} size={12} />
                    <Badge variant={r.approved ? "default" : "secondary"} className="text-[10px]">{r.approved ? "Approved" : "Hidden"}</Badge>
                  </div>
                  {r.title && <p className="text-sm font-medium">{r.title}</p>}
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleApprove(r.id, !r.approved)} title={r.approved ? "Hide" : "Approve"}>
                    {r.approved ? <XCircle size={14} /> : <Check size={14} />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(r.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CouponsView() {
  const { data: coupons, refetch } = useAdminCoupons();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", type: "PERCENTAGE", value: "", minOrder: "0", maxDiscount: "", usageLimit: "100" });

  const create = async () => {
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        description: form.description,
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: Number(form.usageLimit),
      }),
    });
    if (res.ok) {
      toast.success("Coupon created");
      setShowForm(false);
      setForm({ code: "", description: "", type: "PERCENTAGE", value: "", minOrder: "0", maxDiscount: "", usageLimit: "100" });
      refetch();
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
    refetch();
    toast.success("Coupon deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold">Coupons</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={16} /> Add Coupon</Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(coupons || []).map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-bold">{c.code}</TableCell>
                <TableCell className="text-xs">{c.type}</TableCell>
                <TableCell className="text-sm">{c.type === "PERCENTAGE" ? `${c.value}%` : formatINR(c.value)}</TableCell>
                <TableCell className="text-sm">{formatINR(c.minOrder)}</TableCell>
                <TableCell className="text-xs">{c.usageCount}/{c.usageLimit}</TableCell>
                <TableCell><Badge variant={c.isActive ? "default" : "secondary"} className="text-[10px]">{c.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del(c.id)}><Trash2 size={14} /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Coupon</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PERCENTAGE">Percentage</SelectItem><SelectItem value="FLAT">Flat Amount</SelectItem></SelectContent></Select></div>
                <div><Label>Value *</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "PERCENTAGE" ? "10" : "50"} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Min Order (₹)</Label><Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} /></div>
                <div><Label>Max Discount (₹)</Label><Input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} /></div>
              </div>
              <div><Label>Usage Limit</Label><Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} /></div>
              <div className="flex gap-2"><Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button onClick={create} className="flex-1">Create</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SettingsView({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setSettings(d);
      setEmailConfigured(d.emailConfigured);
      setRazorpayConfigured(d.razorpayConfigured);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const d = await res.json();
        setSettings(d);
        setEmailConfigured(d.emailConfigured);
        setRazorpayConfigured(d.razorpayConfigured);
        toast.success("Settings saved! 🎉");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Store Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your store information, shipping & social links.</p>
        </div>
      </div>

      {/* Integration status quick-cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className={cn(emailConfigured ? "border-emerald-200" : "border-amber-200")}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", emailConfigured ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
              {emailConfigured ? <Check size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Gmail SMTP</p>
              <p className="text-xs text-muted-foreground">{emailConfigured ? "Configured & ready" : "Not configured"}</p>
            </div>
            <Mail size={16} className="text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className={cn(razorpayConfigured ? "border-emerald-200" : "border-amber-200")}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", razorpayConfigured ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
              {razorpayConfigured ? <Check size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Razorpay</p>
              <p className="text-xs text-muted-foreground">{razorpayConfigured ? "Configured & ready" : "Demo mode only"}</p>
            </div>
            <CreditCard size={16} className="text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Zap size={16} className="text-primary" />
          <span><strong>Email & Payment Gateway</strong> can now be configured directly from the <strong>Integrations</strong> tab — no need to edit <code className="rounded bg-background px-1 text-xs">.env</code>!</span>
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Store Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Brand Name</Label><Input value={settings.brandName} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} /></div>
            <div><Label>Tagline</Label><Input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} /></div>
          </div>
          <div><Label>Email (display)</Label><Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} /></div>
          <div><Label>Address</Label><Textarea value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} rows={2} /></div>
          <div><Label>Announcement Bar Text</Label><Input value={settings.announcementBar} onChange={(e) => setSettings({ ...settings, announcementBar: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Shipping</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><Label>Free Shipping Threshold (₹)</Label><Input type="number" value={settings.freeShippingThreshold} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })} /></div>
          <div><Label>Shipping Fee (₹)</Label><Input type="number" value={settings.shippingFee} onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Social Links</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><Label>Facebook</Label><Input value={settings.facebook} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} /></div>
          <div><Label>Instagram</Label><Input value={settings.instagram} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} /></div>
          <div><Label>Twitter / X</Label><Input value={settings.twitter} onChange={(e) => setSettings({ ...settings, twitter: e.target.value })} /></div>
          <div><Label>LinkedIn</Label><Input value={settings.linkedin} onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="gap-2">
        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
        Save Settings
      </Button>
    </div>
  );
}

// ============================================================
// INTEGRATIONS VIEW — Configure Email & Payment Gateway from UI
// ============================================================
function IntegrationsView({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingRazorpay, setTestingRazorpay] = useState(false);
  const [showEmailPass, setShowEmailPass] = useState(false);
  const [showRzpSecret, setShowRzpSecret] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d);
        setEmailConfigured(d.emailConfigured);
        setRazorpayConfigured(d.razorpayConfigured);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const saveSettings = async (patch?: Partial<Settings>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch || settings),
      });
      if (res.ok) {
        const d = await res.json();
        setSettings(d);
        setEmailConfigured(d.emailConfigured);
        setRazorpayConfigured(d.razorpayConfigured);
        toast.success("Settings saved! 🎉");
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-email", settings }),
      });
      const d = await res.json();
      if (d.ok) {
        toast.success(d.message);
        setEmailConfigured(true);
      } else {
        toast.error(d.message);
      }
    } catch {
      toast.error("Test failed — check server logs");
    } finally {
      setTestingEmail(false);
    }
  };

  const testRazorpay = async () => {
    setTestingRazorpay(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-razorpay", settings }),
      });
      const d = await res.json();
      if (d.ok) {
        toast.success(d.message);
        setRazorpayConfigured(true);
      } else {
        toast.error(d.message);
      }
    } catch {
      toast.error("Test failed — check server logs");
    } finally {
      setTestingRazorpay(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Configure your payment gateway & email service here. Changes are saved to the database and take effect instantly — no need to restart the server or edit <code className="rounded bg-muted px-1 text-xs">.env</code>.
        </p>
      </div>

      {/* ============ PAYMENT GATEWAY (Razorpay) ============ */}
      <Card className={cn("overflow-hidden", razorpayConfigured ? "border-emerald-200" : "border-amber-200")}>
        <CardHeader className="border-b border-border bg-muted/30 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", razorpayConfigured ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                <CreditCard size={22} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  Payment Gateway
                  <Badge variant={razorpayConfigured ? "default" : "secondary"} className="text-[10px]">
                    {razorpayConfigured ? "● Live" : "● Demo Mode"}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">Razorpay — accept cards, UPI, net banking & wallets</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium">
              <Switch checked={settings.paymentEnabled} onCheckedChange={(v) => update("paymentEnabled", v)} />
              {settings.paymentEnabled ? "Enabled" : "Disabled"}
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {!razorpayConfigured && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Demo mode is active.</p>
                <p>Online payments will use a mock order. Add your Razorpay keys below to accept real payments. Get your keys from the Razorpay Dashboard → API Keys.</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1.5 text-xs"><KeyRound size={12} /> Key ID <span className="text-destructive">*</span></Label>
              <Input
                value={settings.razorpayKeyId}
                onChange={(e) => update("razorpayKeyId", e.target.value)}
                placeholder="rzp_live_xxxxxxxxxxxx"
                className="mt-1 font-mono text-xs"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Public key — safe to expose on client. Starts with <code>rzp_live_</code> or <code>rzp_test_</code>.</p>
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-xs"><Lock size={12} /> Key Secret <span className="text-destructive">*</span></Label>
              <div className="relative mt-1">
                <Input
                  type={showRzpSecret ? "text" : "password"}
                  value={settings.razorpayKeySecret}
                  onChange={(e) => update("razorpayKeySecret", e.target.value)}
                  placeholder="Enter your Razorpay key secret"
                  className="pr-9 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowRzpSecret((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle visibility"
                >
                  {showRzpSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Secret key — stored encrypted in DB. Never share publicly.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">UPI ID (optional)</Label>
              <Input
                value={settings.upiId}
                onChange={(e) => update("upiId", e.target.value)}
                placeholder="yourname@upi"
                className="mt-1 text-xs"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Shown to customers as an alternative UPI payment option.</p>
            </div>
            <label className="flex items-center gap-2 self-end rounded-lg border border-border p-3">
              <Switch checked={settings.codEnabled} onCheckedChange={(v) => update("codEnabled", v)} />
              <div>
                <p className="text-xs font-semibold">Cash on Delivery</p>
                <p className="text-[10px] text-muted-foreground">Allow customers to pay on delivery</p>
              </div>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={() => saveSettings()} disabled={saving} variant="outline" size="sm" className="gap-1.5">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Keys
            </Button>
            <Button onClick={testRazorpay} disabled={testingRazorpay} size="sm" className="gap-1.5">
              {testingRazorpay ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Test Connection
            </Button>
            <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline">
              Get Razorpay Keys <ExternalLink size={11} />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* ============ EMAIL (Gmail SMTP) ============ */}
      <Card className={cn("overflow-hidden", emailConfigured ? "border-emerald-200" : "border-amber-200")}>
        <CardHeader className="border-b border-border bg-muted/30 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", emailConfigured ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                <Mail size={22} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  Email Service
                  <Badge variant={emailConfigured ? "default" : "secondary"} className="text-[10px]">
                    {emailConfigured ? "● Active" : "● Inactive"}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">Gmail SMTP — order confirmations & admin notifications</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium">
              <Switch checked={settings.emailEnabled} onCheckedChange={(v) => update("emailEnabled", v)} />
              {settings.emailEnabled ? "Enabled" : "Disabled"}
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {!emailConfigured && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Email is not configured yet.</p>
                <p>Without email, order confirmations won't be sent to customers and you won't receive order notifications. Set up Gmail below (requires a 16-character App Password).</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1.5 text-xs"><Mail size={12} /> Gmail Address <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                value={settings.gmailUser}
                onChange={(e) => update("gmailUser", e.target.value)}
                placeholder="yourstore@gmail.com"
                className="mt-1 text-xs"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Emails will be sent FROM this address.</p>
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-xs"><Lock size={12} /> App Password <span className="text-destructive">*</span></Label>
              <div className="relative mt-1">
                <Input
                  type={showEmailPass ? "text" : "password"}
                  value={settings.gmailAppPassword}
                  onChange={(e) => update("gmailAppPassword", e.target.value)}
                  placeholder="16-character app password"
                  className="pr-9 font-mono text-xs"
                  maxLength={16}
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPass((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle visibility"
                >
                  {showEmailPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Not your regular password. Generate at myaccount.google.com/apppasswords.</p>
            </div>
          </div>

          <div>
            <Label className="text-xs">Store Notification Email (where order alerts go)</Label>
            <Input
              type="email"
              value={settings.storeNotifyEmail}
              onChange={(e) => update("storeNotifyEmail", e.target.value)}
              placeholder="orders@yourstore.com"
              className="mt-1 text-xs"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">New order notifications will be sent here. Defaults to your Gmail address if empty.</p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <ShieldCheck size={13} /> What gets sent:
            </p>
            <ul className="mt-1.5 space-y-1 text-[11px] text-foreground/80">
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-600" /> <strong>Order confirmation</strong> → to customer's email (instantly after order)</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-600" /> <strong>New order alert</strong> → to your notification email (with full order details)</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-600" /> <strong>Contact form messages</strong> → to your notification email</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={() => saveSettings()} disabled={saving} variant="outline" size="sm" className="gap-1.5">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Config
            </Button>
            <Button onClick={testEmail} disabled={testingEmail} size="sm" className="gap-1.5">
              {testingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Test Email
            </Button>
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline">
              Generate App Password <ExternalLink size={11} />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* ============ Setup Help ============ */}
      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Info size={16} className="text-primary" /> Quick Setup Guide</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">💳 Razorpay Setup (5 min):</p>
            <ol className="ml-4 list-decimal space-y-0.5 pt-1">
              <li>Create an account at <a href="https://razorpay.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">razorpay.com</a> (free for testing)</li>
              <li>Go to Dashboard → Settings → API Keys → Generate Key</li>
              <li>Copy the <strong>Key ID</strong> and <strong>Key Secret</strong> into the fields above</li>
              <li>Click <strong>Test Connection</strong> to verify, then <strong>Save</strong></li>
              <li>For production, use live keys (<code>rzp_live_</code>). For testing, use test keys (<code>rzp_test_</code>).</li>
            </ol>
          </div>
          <div className="border-t border-border pt-3">
            <p className="font-semibold text-foreground">📧 Gmail Setup (5 min):</p>
            <ol className="ml-4 list-decimal space-y-0.5 pt-1">
              <li>Enable <strong>2-Step Verification</strong> on your Google Account (myaccount.google.com)</li>
              <li>Visit <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-primary hover:underline">App Passwords</a> and create a password for "Mail"</li>
              <li>Copy the 16-character password (no spaces) into the <strong>App Password</strong> field above</li>
              <li>Enter your Gmail address & notification email, then click <strong>Send Test Email</strong></li>
              <li>Check your inbox for the test email to confirm it works!</li>
            </ol>
          </div>
          <div className="border-t border-border pt-3 text-[11px]">
            <p className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-primary" /> <strong>Security:</strong> All credentials are stored in your database and never exposed to the browser. Secret fields are masked (••••) when returned to this page. You can still use <code>.env</code> as a fallback if preferred.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
