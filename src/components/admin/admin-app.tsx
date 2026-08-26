"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
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
  MessageSquare,
  MailCheck,
  Download,
  Printer,
  Upload,
  Image as ImageIcon,
  Truck,
  Phone,
  PhoneCall,
  CheckCheck,
  Calendar,
  Receipt,
  FileSpreadsheet,
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

type AdminTab =
  | "dashboard"
  | "products"
  | "orders"
  | "categories"
  | "reviews"
  | "coupons"
  | "messages"
  | "subscribers"
  | "integrations"
  | "settings";

export function AdminApp({ settings: initialSettings }: { settings: Settings }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAuthed(d?.authenticated === true))
      .catch(() => setAuthed(false));

    // Fetch unread count for badge
    fetch("/api/admin/contact?status=unread")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUnreadMsgCount(d?.unreadCount || 0))
      .catch(() => {});
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

  const tabs: { id: AdminTab; label: string; icon: typeof Package; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "messages", label: "Inquiries", icon: MessageSquare, badge: unreadMsgCount },
    { id: "subscribers", label: "Subscribers", icon: MailCheck },
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
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-base text-white">🫘</div>
          <div>
            <p className="text-sm font-bold leading-none">Admin Panel</p>
            <p className="text-[10px] text-muted-foreground">{initialSettings.brandName}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <t.icon size={17} /> {t.label}
              </span>
              {t.badge && t.badge > 0 ? (
                <span className="rounded-full bg-destructive px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {t.badge}
                </span>
              ) : null}
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
          <Button variant="outline" size="icon" className="fixed left-3 top-4 z-50 md:hidden bg-card shadow-md">
            <Menu size={18} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-base text-white">🫘</div>
            <p className="text-sm font-bold">Admin Panel</p>
          </div>
          <nav className="space-y-1 p-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium",
                  tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <t.icon size={17} /> {t.label}
                </span>
                {t.badge && t.badge > 0 ? (
                  <span className="rounded-full bg-destructive px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {t.badge}
                  </span>
                ) : null}
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
        {tab === "orders" && <OrdersView settings={initialSettings} />}
        {tab === "categories" && <CategoriesView />}
        {tab === "reviews" && <ReviewsView />}
        {tab === "coupons" && <CouponsView />}
        {tab === "messages" && <MessagesView onUnreadChange={setUnreadMsgCount} />}
        {tab === "subscribers" && <SubscribersView />}
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
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-3xl text-white shadow-lg">🫘</div>
          <h1 className="font-playfair text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage Satnam Singh Chana</p>
        </div>
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@satnamsinghchana.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardView() {
  const { data: stats, loading } = useAdminStats();

  if (loading || !stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Revenue", value: formatINR(stats.totalRevenue), icon: IndianRupee, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-blue-500/10 text-blue-600" },
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-amber-500/10 text-amber-600" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: AlertTriangle, color: "bg-orange-500/10 text-orange-600" },
    { label: "Total Customers", value: stats.totalCustomers, icon: Users, color: "bg-purple-500/10 text-purple-600" },
    { label: "Total Reviews", value: stats.totalReviews, icon: Star, color: "bg-yellow-500/10 text-yellow-600" },
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
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                        <Image src={p.images[0] || "/products/roasted-chana-plain.png"} alt={p.name} fill className="object-contain p-1" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{p.name}</p>
                        <div className="flex gap-1 pt-0.5">
                          {p.isFeatured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                          {p.isDealOfDay && <Badge variant="destructive" className="text-[10px]">Deal</Badge>}
                          {p.isBestseller && <Badge variant="outline" className="text-[10px]">Bestseller</Badge>}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{p.category?.name}</TableCell>
                  <TableCell>
                    <span className="font-bold text-xs">{formatINR(p.salePrice || p.price)}</span>
                    {p.salePrice && <span className="ml-1 text-[10px] text-muted-foreground line-through">{formatINR(p.price)}</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.inStock && p.stockQuantity > 5 ? "outline" : "destructive"} className="text-[10px]">
                      {p.inStock ? `${p.stockQuantity} in stock` : "Out of stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{p.soldCount}</TableCell>
                  <TableCell className="text-xs">⭐ {p.rating.toFixed(1)} ({p.reviewCount})</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(p); setShowForm(true); }}>
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(p.slug)}>
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
        <ProductFormDialog
          product={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSuccess={() => { setShowForm(false); setEditing(null); refetch(); }}
        />
      )}
    </div>
  );
}

function ProductFormDialog({
  product,
  onClose,
  onSuccess,
}: {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: categories } = useCategories();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    categoryId: product?.categoryId || categories?.[0]?.id || "",
    price: product?.price?.toString() || "195",
    salePrice: product?.salePrice?.toString() || "",
    weight: product?.weight || "360G",
    stockQuantity: product?.stockQuantity?.toString() || "50",
    inStock: product?.inStock ?? true,
    isFeatured: product?.isFeatured ?? false,
    isDealOfDay: product?.isDealOfDay ?? false,
    isBestseller: product?.isBestseller ?? false,
    isNew: product?.isNew ?? false,
    images: (product?.images || []).join("\n"),
    tags: (product?.tags || []).join(", "),
    ingredients: product?.ingredients || "",
    benefits: (product?.benefits || []).join("\n"),
    shelfLife: product?.shelfLife || "9 Months",
    storageInfo: product?.storageInfo || "Store in a cool dry place",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // Add to images list
      const existing = form.images.trim().split("\n").filter(Boolean);
      const updated = [...existing, data.url].join("\n");
      setForm({ ...form, images: updated });
      toast.success("Image uploaded successfully! 📸");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const imageList = form.images.trim().split("\n").filter(Boolean);

  const presetImages = [
    "/products/roasted-chana-plain.png",
    "/products/roasted-peanuts-salted.png",
    "/products/flavored-chana.png",
    "/products/flavored-peanuts.png",
    "/products/combo-pack.png",
    "/products/chikki.png",
  ];

  const save = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      return toast.error("Please fill required fields (Name, Price, Category)");
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        stockQuantity: Number(form.stockQuantity || 0),
        images: imageList,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        benefits: form.benefits.split("\n").map((b) => b.trim()).filter(Boolean),
      };

      const url = product ? `/api/products/${product.slug}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save product");
      toast.success(product ? "Product updated" : "Product created");
      onSuccess();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="sm:col-span-2">
            <Label>Product Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })}
              placeholder="e.g. Hing Jeera Roasted Chana"
            />
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
            <Input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} placeholder="Discounted price" />
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

          {/* Product Image Uploader */}
          <div className="sm:col-span-2 rounded-xl border border-border bg-muted/20 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold flex items-center gap-1.5">
                <ImageIcon size={14} className="text-primary" /> Product Images
              </Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-7 gap-1 text-xs"
              >
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                Upload Image
              </Button>
            </div>

            {/* Image preview grid */}
            {imageList.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {imageList.map((imgUrl, idx) => (
                  <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-card">
                    <Image src={imgUrl} alt="Preview" fill className="object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = imageList.filter((_, i) => i !== idx).join("\n");
                        setForm({ ...form, images: updated });
                      }}
                      className="absolute right-0.5 top-0.5 rounded-full bg-destructive text-white p-0.5 hover:opacity-80"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Preset selector */}
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 font-semibold">Or pick from sample presets:</p>
              <div className="flex flex-wrap gap-1.5">
                {presetImages.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      if (!imageList.includes(preset)) {
                        setForm({ ...form, images: [...imageList, preset].join("\n") });
                      }
                    }}
                    className="rounded border border-border bg-card px-2 py-0.5 text-[10px] hover:border-primary"
                  >
                    + {preset.split("/").pop()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Image URLs (one per line):</Label>
              <Textarea
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                rows={2}
                placeholder="/products/roasted-chana-plain.png"
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="spicy, roasted, combo" />
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
            <Textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={2} />
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
              <label key={f.k} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
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
            {product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrdersView({ settings }: { settings: Settings }) {
  const [status, setStatus] = useState("all");
  const { data: orders, loading, refetch } = useAdminOrders(status === "all" ? undefined : status);
  const [selected, setSelected] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [courierNotes, setCourierNotes] = useState("");
  const [updatingNotes, setUpdatingNotes] = useState(false);

  useEffect(() => {
    if (selected) {
      setCourierNotes(selected.notes || "");
    }
  }, [selected]);

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

  const saveCourierNotes = async (id: string) => {
    setUpdatingNotes(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: courierNotes }),
      });
      if (res.ok) {
        toast.success("Courier & tracking info saved!");
        refetch();
        if (selected?.id === id) setSelected({ ...selected, notes: courierNotes });
      } else {
        toast.error("Failed to save tracking info");
      }
    } catch {
      toast.error("Error saving tracking info");
    } finally {
      setUpdatingNotes(false);
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orders || []).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-semibold">{o.orderNumber}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">{o.phone || o.email}</p>
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
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Print Invoice"
                        onClick={() => setInvoiceOrder(o)}
                      >
                        <Printer size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="View Details"
                        onClick={() => setSelected(o)}
                      >
                        <Eye size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Modal */}
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <DialogTitle>Order #{selected.orderNumber}</DialogTitle>
                <Badge className="text-xs">{selected.status}</Badge>
              </div>
            </DialogHeader>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="font-bold text-foreground">Customer Details</p>
                  <p className="font-medium text-sm">{selected.customerName}</p>
                  <p className="text-muted-foreground">{selected.email}</p>
                  <p className="text-muted-foreground">{selected.phone}</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">Shipping Address</p>
                  <p>{selected.address}</p>
                  <p>{selected.city}, {selected.state} - {selected.pincode}</p>
                </div>
              </div>

              {/* Courier tracking section */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                <Label className="font-bold text-primary flex items-center gap-1.5">
                  <Truck size={13} /> Courier Partner & Tracking AWB Number
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={courierNotes}
                    onChange={(e) => setCourierNotes(e.target.value)}
                    placeholder="e.g. BlueDart AWB: 12345678 or Delhivery"
                    className="h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    disabled={updatingNotes}
                    onClick={() => saveCourierNotes(selected.id)}
                    className="h-8 px-3"
                  >
                    Save
                  </Button>
                </div>
              </div>

              <div>
                <p className="font-bold mb-2">Order Items ({selected.items.length})</p>
                <div className="space-y-1.5 rounded-lg border border-border p-2.5">
                  {selected.items.map((i) => (
                    <div key={i.id} className="flex justify-between items-center text-xs">
                      <span>{i.name} × {i.quantity}{i.weight ? ` (${i.weight})` : ""}</span>
                      <span className="font-semibold">{formatINR(i.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatINR(selected.subtotal)}</span>
                </div>
                {selected.discount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount</span>
                    <span>-{formatINR(selected.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Fee</span>
                  <span>{selected.shipping === 0 ? "FREE" : formatINR(selected.shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-bold text-sm">
                  <span>Total</span>
                  <span className="text-primary">{formatINR(selected.total)}</span>
                </div>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Payment: {selected.paymentMethod} ({selected.paymentStatus})</span>
                <span>{formatDate(selected.createdAt)}</span>
              </div>

              <div className="flex flex-wrap gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setInvoiceOrder(selected)}
                >
                  <Printer size={14} /> Print Invoice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => resendEmails(selected.id)}
                >
                  <Send size={14} /> Resend Emails
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

      {/* Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} settings={settings} onClose={() => setInvoiceOrder(null)} />
      )}
    </div>
  );
}

function InvoiceModal({
  order,
  settings,
  onClose,
}: {
  order: Order;
  settings: Settings;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-6">
        <div id="printable-invoice" className="space-y-6 text-xs text-foreground">
          {/* Header */}
          <div className="flex justify-between border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">🫘</div>
                <span className="font-playfair text-lg font-bold">{settings.brandName}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{settings.address}</p>
              <p className="text-[11px] text-muted-foreground">Phone: {settings.phone} • Email: {settings.email}</p>
            </div>
            <div className="text-right">
              <h2 className="font-playfair text-xl font-bold text-primary uppercase">TAX INVOICE</h2>
              <p className="font-mono font-semibold">#{order.orderNumber}</p>
              <p className="text-muted-foreground">Date: {formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/20 p-3">
            <div>
              <p className="font-bold uppercase text-[10px] text-muted-foreground">Billed / Shipped To:</p>
              <p className="font-semibold text-sm mt-0.5">{order.customerName}</p>
              <p>{order.address}</p>
              <p>{order.city}, {order.state} - {order.pincode}</p>
              <p>Phone: {order.phone}</p>
              <p>Email: {order.email}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-bold uppercase text-[10px] text-muted-foreground">Payment Details:</p>
              <p>Method: <strong>{order.paymentMethod}</strong></p>
              <p>Status: <strong className={order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"}>{order.paymentStatus}</strong></p>
              {order.notes && <p className="text-muted-foreground">Courier: {order.notes}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-2.5 font-semibold">Item Description</th>
                  <th className="p-2.5 font-semibold text-center">Qty</th>
                  <th className="p-2.5 font-semibold text-right">Price</th>
                  <th className="p-2.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items.map((item, i) => (
                  <tr key={item.id || i}>
                    <td className="p-2.5">
                      <p className="font-semibold">{item.name}</p>
                      {item.weight && <p className="text-[10px] text-muted-foreground">{item.weight}</p>}
                    </td>
                    <td className="p-2.5 text-center">{item.quantity}</td>
                    <td className="p-2.5 text-right">{formatINR(item.price)}</td>
                    <td className="p-2.5 text-right font-semibold">{formatINR(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal (Inclusive of GST)</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping & Handling</span>
                <span>{order.shipping === 0 ? "FREE" : formatINR(order.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-bold text-sm">
                <span>Grand Total</span>
                <span className="text-primary">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer declaration */}
          <div className="border-t pt-4 text-[10px] text-muted-foreground text-center">
            <p>Thank you for choosing Satnam Singh Chana! Taste of Tradition, 100% Quality Guaranteed.</p>
            <p className="mt-1">This is a computer-generated invoice and does not require a physical signature.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer size={14} /> Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MessagesView({ onUnreadChange }: { onUnreadChange?: (count: number) => void }) {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (status !== "all") q.set("status", status);
      if (search) q.set("search", search);

      const res = await fetch(`/api/admin/contact?${q.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
        onUnreadChange?.(data.unreadCount || 0);
      }
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [status]);

  const toggleRead = async (id: string, isRead: boolean) => {
    const res = await fetch("/api/admin/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: !isRead }),
    });
    if (res.ok) {
      toast.success(isRead ? "Marked as unread" : "Marked as read");
      fetchMessages();
      if (selectedMsg?.id === id) {
        setSelectedMsg({ ...selectedMsg, isRead: !isRead });
      }
    }
  };

  const deleteMsg = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    const res = await fetch(`/api/admin/contact?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Inquiry deleted");
      fetchMessages();
      if (selectedMsg?.id === id) setSelectedMsg(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Customer Inquiries</h1>
          <p className="text-sm text-muted-foreground">{messages.length} messages</p>
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Inquiries</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="read">Read Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchMessages();
        }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, email, subject, phone..."
          className="pl-9"
        />
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : messages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No customer inquiries found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((m) => (
                <TableRow key={m.id} className={m.isRead ? "" : "bg-primary/5 font-medium"}>
                  <TableCell>
                    <p className="font-semibold text-xs">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground">{m.email}</p>
                    {m.phone && <p className="text-[10px] text-muted-foreground">{m.phone}</p>}
                  </TableCell>
                  <TableCell className="text-xs font-semibold max-w-[150px] truncate">{m.subject}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate">{m.message}</TableCell>
                  <TableCell>
                    <Badge variant={m.isRead ? "outline" : "default"} className="text-[10px]">
                      {m.isRead ? "Read" : "New"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="View details"
                        onClick={() => {
                          setSelectedMsg(m);
                          if (!m.isRead) toggleRead(m.id, false);
                        }}
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        title="Delete"
                        onClick={() => deleteMsg(m.id)}
                      >
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

      {/* Message Modal */}
      {selectedMsg && (
        <Dialog open onOpenChange={() => setSelectedMsg(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base">{selectedMsg.subject}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-xs">
              <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                <p><strong>From:</strong> {selectedMsg.name} ({selectedMsg.email})</p>
                {selectedMsg.phone && <p><strong>Phone:</strong> {selectedMsg.phone}</p>}
                <p><strong>Date:</strong> {formatDate(selectedMsg.createdAt)}</p>
              </div>

              <div className="rounded-lg border border-border p-3">
                <p className="font-bold mb-1 text-muted-foreground uppercase text-[10px]">Message:</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedMsg.message}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <a
                  href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject)}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Mail size={13} /> Reply via Email
                </a>
                {selectedMsg.phone && (
                  <a
                    href={`tel:${selectedMsg.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                  >
                    <PhoneCall size={13} /> Call Customer
                  </a>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRead(selectedMsg.id, selectedMsg.isRead)}
                  className="ml-auto text-xs"
                >
                  {selectedMsg.isRead ? "Mark Unread" : "Mark Read"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SubscribersView() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/newsletter${q}`);
      const data = await res.json();
      if (res.ok) {
        setSubscribers(data.subscribers || []);
      }
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const deleteSub = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Subscriber removed");
      fetchSubscribers();
    }
  };

  const exportCSV = () => {
    window.open("/api/admin/newsletter?format=csv", "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Newsletter Subscribers</h1>
          <p className="text-sm text-muted-foreground">{subscribers.length} total subscribers</p>
        </div>
        <Button onClick={exportCSV} className="gap-2" variant="outline">
          <Download size={15} /> Export to CSV
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchSubscribers();
        }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subscriber emails..."
          className="pl-9"
        />
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : subscribers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No subscribers found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email Address</TableHead>
                <TableHead>Subscribed Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-xs flex items-center gap-2">
                    <Mail size={14} className="text-primary" /> {s.email}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSub(s.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
            <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Category Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Icon Emoji</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📦" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={create} className="flex-1">Create Category</Button>
              </div>
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

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews?approved=all");
      const d = await res.json();
      setReviews(d.reviews || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleApprove = async (id: string, approved: boolean) => {
    await fetch("/api/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved: !approved }),
    });
    toast.success(approved ? "Review unapproved" : "Review approved");
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete review?")) return;
    await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    toast.success("Review deleted");
    fetchReviews();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-playfair text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">Moderate customer feedback</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.rating} size={14} />
                      <span className="font-bold text-sm">{r.title || "Review"}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{r.comment}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      By <strong>{r.customerName}</strong> for <em>{r.product?.name}</em> • {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={r.approved ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => toggleApprove(r.id, r.approved)}
                    >
                      {r.approved ? "Approved" : "Pending"}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteReview(r.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CouponsView() {
  const { data: coupons, refetch } = useAdminCoupons();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: "10",
    minOrder: "0",
    maxDiscount: "",
    usageLimit: "100",
  });

  const create = async () => {
    if (!form.code || !form.value) return toast.error("Code & value required");
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        value: Number(form.value),
        minOrder: Number(form.minOrder || 0),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: Number(form.usageLimit || 100),
      }),
    });
    if (res.ok) {
      toast.success("Coupon created");
      setShowForm(false);
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground">{coupons?.length || 0} active codes</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={16} /> Add Coupon</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(coupons || []).map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-primary">{c.code}</span>
                <Badge variant={c.isActive ? "default" : "secondary"}>
                  {c.type === "PERCENTAGE" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.description || "Discount code"}</p>
              <div className="mt-3 flex justify-between text-[11px] text-muted-foreground border-t pt-2">
                <span>Min Order: {formatINR(c.minOrder)}</span>
                <span>Used: {c.usageCount}/{c.usageLimit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>New Coupon</DialogTitle></DialogHeader>
            <div className="space-y-3 text-xs">
              <div>
                <Label>Coupon Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Discount Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value *</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Min Order (₹)</Label>
                  <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
                </div>
                <div>
                  <Label>Usage Limit</Label>
                  <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={create} className="flex-1">Create Coupon</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function IntegrationsView({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [testingRazorpay, setTestingRazorpay] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [showEmailPass, setShowEmailPass] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.settings) setSettings(d.settings);
      })
      .catch(() => {});
  }, []);

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    setSettings((s) => ({ ...s, [k]: v }));
  };

  const saveSettings = async (override?: Partial<Settings>) => {
    setSaving(true);
    try {
      const payload = { ...settings, ...(override || {}) };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      if (data.settings) setSettings(data.settings);
      toast.success("✅ Configuration saved!");
      return data.settings;
    } catch (e) {
      toast.error((e as Error).message);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const testRazorpay = async () => {
    setTestingRazorpay(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-razorpay",
          razorpayKeyId: settings.razorpayKeyId,
          razorpayKeySecret: settings.razorpayKeySecret,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Connection failed");
      }
      toast.success(data.message || "✅ Razorpay keys verified! Connection working.");
    } catch (e) {
      toast.error(`❌ Razorpay test failed: ${(e as Error).message}`);
    } finally {
      setTestingRazorpay(false);
    }
  };

  const testEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-email",
          gmailUser: settings.gmailUser,
          gmailAppPassword: settings.gmailAppPassword,
          storeNotifyEmail: settings.storeNotifyEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Test email failed");
      }
      toast.success(data.message || "📧 Test email sent successfully! Check your inbox.");
    } catch (e) {
      toast.error(`❌ Email test failed: ${(e as Error).message}`);
    } finally {
      setTestingEmail(false);
    }
  };

  const rzpConfigured = Boolean(settings.razorpayKeyId && settings.razorpayKeySecret);
  const emailConfigured = Boolean(settings.gmailUser && settings.gmailAppPassword);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold">Integrations</h1>
        <p className="text-sm text-muted-foreground">Configure Payment Gateway & Email Service from here.</p>
      </div>

      {/* RAZORPAY */}
      <Card className={cn("overflow-hidden", rzpConfigured ? "border-emerald-200" : "border-amber-200")}>
        <CardHeader className="border-b border-border bg-muted/30 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", rzpConfigured ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                <CreditCard size={22} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  Razorpay Payment Gateway
                  <Badge variant={rzpConfigured ? "default" : "secondary"} className="text-[10px]">
                    {rzpConfigured ? "● Live / Configured" : "● Demo Mode"}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">Accept Cards, UPI, Netbanking, & Wallets</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <Switch checked={settings.paymentEnabled} onCheckedChange={(v) => update("paymentEnabled", v)} />
              {settings.paymentEnabled ? "Enabled" : "Disabled"}
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1.5 text-xs"><KeyRound size={12} /> Key ID <span className="text-destructive">*</span></Label>
              <Input
                value={settings.razorpayKeyId}
                onChange={(e) => update("razorpayKeyId", e.target.value)}
                placeholder="rzp_live_... or rzp_test_..."
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-xs"><Lock size={12} /> Key Secret <span className="text-destructive">*</span></Label>
              <div className="relative mt-1">
                <Input
                  type={showRzpSecret ? "text" : "password"}
                  value={settings.razorpayKeySecret}
                  onChange={(e) => update("razorpayKeySecret", e.target.value)}
                  placeholder="Enter secret"
                  className="pr-9 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowRzpSecret((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showRzpSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">UPI ID / VPA (Optional)</Label>
              <Input
                value={settings.upiId}
                onChange={(e) => update("upiId", e.target.value)}
                placeholder="satnamchana@upi"
                className="mt-1 text-xs"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-xs font-semibold">Cash on Delivery (COD)</p>
                <p className="text-[10px] text-muted-foreground">Allow customers to pay cash upon arrival</p>
              </div>
              <Switch checked={settings.codEnabled} onCheckedChange={(v) => update("codEnabled", v)} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={() => saveSettings()} disabled={saving} variant="outline" size="sm" className="gap-1.5">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Keys
            </Button>
            <Button onClick={testRazorpay} disabled={testingRazorpay} size="sm" className="gap-1.5">
              {testingRazorpay ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* GMAIL SMTP */}
      <Card className={cn("overflow-hidden", emailConfigured ? "border-emerald-200" : "border-amber-200")}>
        <CardHeader className="border-b border-border bg-muted/30 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", emailConfigured ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                <Mail size={22} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  Email Service (Gmail SMTP)
                  <Badge variant={emailConfigured ? "default" : "secondary"} className="text-[10px]">
                    {emailConfigured ? "● Active" : "● Inactive"}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">Order confirmations & admin notifications</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <Switch checked={settings.emailEnabled} onCheckedChange={(v) => update("emailEnabled", v)} />
              {settings.emailEnabled ? "Enabled" : "Disabled"}
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
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
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-xs"><Lock size={12} /> App Password (16-char) <span className="text-destructive">*</span></Label>
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
                >
                  {showEmailPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs">Store Notification Email (where new order alerts go)</Label>
            <Input
              type="email"
              value={settings.storeNotifyEmail}
              onChange={(e) => update("storeNotifyEmail", e.target.value)}
              placeholder="orders@yourstore.com"
              className="mt-1 text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={() => saveSettings()} disabled={saving} variant="outline" size="sm" className="gap-1.5">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Config
            </Button>
            <Button onClick={testEmail} disabled={testingEmail} size="sm" className="gap-1.5">
              {testingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Test Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsView({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.settings) setSettings(d.settings);
      })
      .catch(() => {});
  }, []);

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    setSettings((s) => ({ ...s, [k]: v }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("Settings saved!");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold">Store Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your brand info & shipping rules</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Brand Name</Label>
              <Input value={settings.brandName} onChange={(e) => update("brandName", e.target.value)} />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input value={settings.tagline} onChange={(e) => update("tagline", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input type="email" value={settings.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={settings.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input value={settings.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div>
            <Label>Announcement Bar Text</Label>
            <Input value={settings.announcementBar} onChange={(e) => update("announcementBar", e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Free Shipping Threshold (₹)</Label>
              <Input type="number" value={settings.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", Number(e.target.value))} />
            </div>
            <div>
              <Label>Standard Shipping Fee (₹)</Label>
              <Input type="number" value={settings.shippingFee} onChange={(e) => update("shippingFee", Number(e.target.value))} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Instagram URL</Label>
              <Input value={settings.instagram || ""} onChange={(e) => update("instagram", e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <Label>Facebook URL</Label>
              <Input value={settings.facebook || ""} onChange={(e) => update("facebook", e.target.value)} placeholder="https://facebook.com/..." />
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : null} Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
