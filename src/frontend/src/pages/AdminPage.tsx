import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Database,
  Edit2,
  Home,
  KeyRound,
  Loader2,
  LogIn,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClaimAdmin,
  useInitialize,
  useIsCallerAdmin,
  useListProducts,
  useRegisterProduct,
  useRemoveProduct,
  useUpdateProduct,
} from "../hooks/useQueries";

const EMPTY_PRODUCT: Product = {
  id: "",
  name: "",
  manufacturer: "",
  productionDate: "",
  currentOwner: "",
  serialNumber: "",
  batchNumber: "",
  warrantyInfo: "",
  distributorName: "",
  distributorContact: "",
  distributorAddress: "",
  distributorCountry: "",
  registeredAt: BigInt(0),
};

export default function AdminPage() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: products = [], isLoading: productsLoading } = useListProducts();

  const registerMutation = useRegisterProduct();
  const updateMutation = useUpdateProduct();
  const removeMutation = useRemoveProduct();
  const initializeMutation = useInitialize();
  const claimAdminMutation = useClaimAdmin();

  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Product>(EMPTY_PRODUCT);
  const [adminToken, setAdminToken] = useState("");

  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const openAdd = () => {
    setForm({
      ...EMPTY_PRODUCT,
      id: `VP-${Date.now().toString(36).toUpperCase()}`,
    });
    setAddOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({ ...p });
    setEditProduct(p);
  };

  const handleSaveAdd = async () => {
    try {
      await registerMutation.mutateAsync({
        ...form,
        registeredAt: BigInt(Date.now() * 1_000_000),
      });
      toast.success("Product registered successfully");
      setAddOpen(false);
    } catch {
      toast.error("Failed to register product");
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateMutation.mutateAsync(form);
      toast.success("Product updated successfully");
      setEditProduct(null);
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removeMutation.mutateAsync(deleteId);
      toast.success("Product removed");
      setDeleteId(null);
    } catch {
      toast.error("Failed to remove product");
    }
  };

  const handleInitialize = async () => {
    try {
      await initializeMutation.mutateAsync();
      toast.success("Database initialized with AI-generated sample products!");
    } catch {
      toast.error("Failed to initialize database.");
    }
  };

  const handleClaimAdmin = async () => {
    if (!adminToken.trim()) {
      toast.error("Please enter the admin token");
      return;
    }
    try {
      await claimAdminMutation.mutateAsync(adminToken.trim());
      const stillAdmin = await queryClient
        .fetchQuery({ queryKey: ["isCallerAdmin"] })
        .catch(() => false);
      if (stillAdmin) {
        toast.success("Admin access granted!");
        setAdminToken("");
      } else {
        toast.error(
          "Incorrect token or admin has already been claimed by another account.",
        );
      }
    } catch {
      toast.error(
        "Failed to claim admin access. Check your token and try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage the genuine product registry on the blockchain
              </p>
            </div>
          </div>

          {/* Not logged in */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24"
              data-ocid="admin.login.panel"
            >
              <div className="w-20 h-20 rounded-2xl bg-teal/10 ring-2 ring-teal/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-teal/60" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Authentication Required
              </h2>
              <p className="text-muted-foreground text-sm mb-8 text-center max-w-xs">
                Login with Internet Identity to access the admin panel. Your
                identity is secured and private.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  data-ocid="admin.login.primary_button"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="bg-teal text-white hover:bg-teal/80 px-8"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-1.5" />
                  )}
                  {isLoggingIn
                    ? "Logging in..."
                    : "Login with Internet Identity"}
                </Button>
                <Link to="/">
                  <Button
                    variant="outline"
                    data-ocid="admin.go_home.button"
                    className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Home className="w-4 h-4 mr-1.5" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Logged in, checking admin */}
          {isAuthenticated && adminLoading && (
            <div
              className="flex items-center justify-center py-20"
              data-ocid="admin.loading_state"
            >
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Not admin — show claim form */}
          {isAuthenticated && !adminLoading && !isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16"
              data-ocid="admin.claim_admin.panel"
            >
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 ring-2 ring-amber-500/20 flex items-center justify-center mb-6">
                <KeyRound className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Claim Admin Access</h2>
              <p className="text-muted-foreground text-sm mb-8 text-center max-w-sm">
                Enter your admin token to activate admin privileges for this
                account. The token is shown in your Caffeine project dashboard
                under Settings.
              </p>

              <div className="w-full max-w-sm space-y-3">
                <Input
                  type="password"
                  placeholder="Paste your admin token here"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleClaimAdmin()}
                  data-ocid="admin.claim_admin.token_input"
                  className="bg-white/5 border-white/20"
                />
                <Button
                  className="w-full bg-teal text-white hover:bg-teal/80"
                  onClick={handleClaimAdmin}
                  disabled={claimAdminMutation.isPending || !adminToken.trim()}
                  data-ocid="admin.claim_admin.submit_button"
                >
                  {claimAdminMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4 mr-1.5" />
                  )}
                  {claimAdminMutation.isPending
                    ? "Verifying..."
                    : "Activate Admin Access"}
                </Button>
              </div>

              <div className="flex gap-3 mt-6">
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-white"
                  >
                    <Home className="w-4 h-4 mr-1.5" />
                    Back to Home
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  data-ocid="admin.logout.button"
                  className="text-muted-foreground hover:text-white"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Switch Account
                </Button>
              </div>
            </motion.div>
          )}

          {/* Admin content */}
          {isAuthenticated && !adminLoading && isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Initialize Database Card */}
              <Card className="border-teal/20 bg-teal/5">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal/15 flex items-center justify-center">
                      <Database className="w-5 h-5 text-teal" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        Initialize AI-Generated Database
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Seed the product registry with realistic AI-generated
                        sample products
                      </p>
                    </div>
                  </div>
                  <Button
                    data-ocid="admin.init_db.button"
                    onClick={handleInitialize}
                    disabled={initializeMutation.isPending}
                    className="bg-teal text-white hover:bg-teal/80 shrink-0"
                  >
                    {initializeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4 mr-1.5" />
                    )}
                    {initializeMutation.isPending
                      ? "Initializing..."
                      : "Initialize Database"}
                  </Button>
                </CardContent>
              </Card>

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Product Registry
                    </CardTitle>
                    <Button
                      data-ocid="admin.add_product.button"
                      size="sm"
                      onClick={openAdd}
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add Product
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {productsLoading ? (
                    <div
                      className="flex items-center justify-center py-10"
                      data-ocid="admin.products.loading_state"
                    >
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Table data-ocid="admin.products.table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Manufacturer</TableHead>
                          <TableHead>Production Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-8 text-muted-foreground"
                              data-ocid="admin.products.empty_state"
                            >
                              No products yet. Click{" "}
                              <span className="font-medium text-teal">
                                Initialize Database
                              </span>{" "}
                              to seed sample products or add one manually.
                            </TableCell>
                          </TableRow>
                        ) : (
                          products.map((product, i) => (
                            <TableRow
                              key={product.id}
                              data-ocid={`admin.products.item.${i + 1}`}
                            >
                              <TableCell className="font-mono text-xs">
                                {product.id}
                              </TableCell>
                              <TableCell className="font-medium">
                                {product.name}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {product.manufacturer}
                              </TableCell>
                              <TableCell className="text-sm">
                                {product.productionDate}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-success-bg text-success hover:bg-success-bg text-xs">
                                  Active
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    data-ocid={`admin.products.edit_button.${i + 1}`}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => openEdit(product)}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    data-ocid={`admin.products.delete_button.${i + 1}`}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteId(product.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Add Product Dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => !v && setAddOpen(false)}>
        <DialogContent
          data-ocid="admin.add_product.dialog"
          className="max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Register New Product</DialogTitle>
          </DialogHeader>
          <ProductForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="admin.add_product.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.add_product.submit_button"
              onClick={handleSaveAdd}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              Register Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editProduct}
        onOpenChange={(v) => !v && setEditProduct(null)}
      >
        <DialogContent
          data-ocid="admin.edit_product.dialog"
          className="max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditProduct(null)}
              data-ocid="admin.edit_product.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.edit_product.submit_button"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="admin.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the product from the blockchain
              registry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : null}
              Remove Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductForm({
  form,
  setForm,
}: {
  form: Product;
  setForm: (f: Product) => void;
}) {
  const field = (key: keyof Product, label: string, placeholder: string) => (
    <div className="space-y-1">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        data-ocid={`admin.form.${key}.input`}
        placeholder={placeholder}
        value={String(form[key] || "")}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3 py-2">
      {field("id", "Product ID", "VP-001234")}
      {field("name", "Product Name", "Nike Air Max 2024")}
      {field("manufacturer", "Manufacturer", "Nike Inc.")}
      {field("productionDate", "Production Date", "2024-01-15")}
      {field("currentOwner", "Current Owner", "Retailer XYZ")}
      {field("serialNumber", "Serial Number", "SN-987654321")}
      {field("batchNumber", "Batch Number", "BATCH-2024-Q1")}
      {field("warrantyInfo", "Warranty Info", "2 years manufacturer warranty")}
      {field("distributorName", "Distributor Name", "ElectroTech Distributors")}
      {field(
        "distributorContact",
        "Distributor Contact",
        "contact@distributor.com",
      )}
      {field(
        "distributorAddress",
        "Distributor Address",
        "123 Tech Park, Silicon City",
      )}
      {field("distributorCountry", "Country", "USA")}
    </div>
  );
}
