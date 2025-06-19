// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "./SupabaseClient";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import JsBarcode from "jsbarcode";
import {
  Trash2,
  CheckCircle2,
  Truck,
  Package,
  Warehouse as WarehouseIcon,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";

interface Product {
  id: string;
  name: string;
  // add other fields as needed
}

interface Warehouse {
  id: string;
  name: string;
  // add other fields as needed
}

interface TruckArrivalForm {
  vehicle_registration: string;
  customer_name: string;
  driver_name: string;
  vehicle_size: string;
  load_type: string;
  arrival_time: string;
  warehouse_id: string;
}

interface TruckArrival extends TruckArrivalForm {
  id: string;
}

interface TruckItem {
  id: string;
  description: string;
  quantity: number;
  condition: string;
}

interface PutawayAssignment {
  id: string;
  truck_item_id: string;
  aisle: string;
  bay: string;
  level: string;
  position: string;
}

interface QualityCheck {
  id: string;
  truck_item_id: string;
  status: string;
  damage_image_url?: string;
  supervisor_name?: string;
  barcode?: string;
}

interface WarehouseOperationsProps {
  warehouseId?: string | null;
}

const steps = [
  "Truck Arrival",
  "Unloading",
  "Quality Check",
  "Warehouse Putaway",
];

// Set the workerSrc for pdfjsLib in browser environments
if (typeof window !== "undefined" && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const WarehouseLabel = dynamic(() => import("./WarehouseLabel"), {
  ssr: false,
});

export function WarehouseOperations({ warehouseId }: WarehouseOperationsProps) {
  // Stepper state
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Truck Arrival
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [truckForm, setTruckForm] = useState<TruckArrivalForm>({
    vehicle_registration: "",
    customer_name: "",
    driver_name: "",
    vehicle_size: "",
    load_type: "",
    arrival_time: "",
    warehouse_id: "",
  });
  const [truckArrivalId, setTruckArrivalId] = useState<string | null>(null);

  // Step 2: Unloading
  const [items, setItems] = useState<TruckItem[]>([]);
  const [itemForm, setItemForm] = useState({
    description: "",
    quantity: "1",
    condition: "Good",
  });
  const [bulkUploadError, setBulkUploadError] = useState<string | null>(null);

  // Step 3: Quality Check
  const [qualityChecks, setQualityChecks] = useState<{
    [itemId: string]: QualityCheck;
  }>({});
  const [supervisorName, setSupervisorName] = useState("");

  // Step 4: Putaway
  const [putaways, setPutaways] = useState<PutawayAssignment[]>([]);
  const [putawayForm, setPutawayForm] = useState<{
    [itemId: string]: {
      aisle: string;
      bay: string;
      level: string;
      position: string;
    };
  }>({});
  const [putawayError, setPutawayError] = useState<string | null>(null);

  // Workflow complete state
  const [workflowComplete, setWorkflowComplete] = useState(false);

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TruckItem | null>(null);

  // Invoice generation state
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    weeks: "1",
    useWeeklyFee: true,
    additionalAmount: "0",
    notes: "",
  });
  const [calculatedAmount, setCalculatedAmount] = useState<string>("0.00");
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch current user and their warehouses
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      setCurrentUser(null);
      setWarehouses([]);
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    // Fetch only warehouses for this user
    supabase
      .from("warehouses")
      .select("*")
      .eq("client_id", user.id)
      .then(({ data }) => setWarehouses(data || []));
  }, []);

  // Fetch all items for the current truck arrival
  const fetchItemsForArrival = async (arrivalId: string | null) => {
    if (!arrivalId) {
      setItems([]);
      return;
    }
    console.log("Fetching items for truckArrivalId:", arrivalId);
    const { data: allItems, error: fetchError } = await supabase
      .from("truck_items")
      .select("*")
      .eq("truck_arrival_id", arrivalId);
    if (fetchError) {
      toast.error("Failed to fetch items");
      setItems([]);
      return;
    }
    console.log("Fetched items:", allItems?.length, allItems);
    setItems(allItems || []);
  };

  // Step 1: Truck Arrival Handlers
  const handleTruckInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTruckForm({ ...truckForm, [name]: value });

    // If customer name is selected, find the matching customer
    if (name === "customer_name") {
      const customer = customers.find((c) => c.name === value);
      setSelectedCustomer(customer || null);
    }
  };

  // Customer selection handler
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customer);
    if (customer) {
      setTruckForm({ ...truckForm, customer_name: customer.name });
    }
  };
  const canRegisterArrival = Object.values(truckForm).every(Boolean);
  const handleRegisterArrival = async () => {
    if (!canRegisterArrival) return;
    const { data, error } = await supabase
      .from("truck_arrivals")
      .insert([{ ...truckForm }])
      .select()
      .single();
    if (error) {
      toast.error("Failed to register arrival");
      return;
    }
    setTruckArrivalId(data.id);
    toast.success("Truck arrival registered!");
    setCurrentStep(1);
    await fetchItemsForArrival(data.id); // Clear items for new arrival
  };

  // Step 2: Unloading Handlers
  const handleItemInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setItemForm({ ...itemForm, [e.target.name]: e.target.value });
  };
  const canAddItem = itemForm.description && itemForm.quantity;
  const handleAddItem = async () => {
    if (!truckArrivalId) return;
    // Only add one item with the correct quantity
    const { data, error } = await supabase
      .from("truck_items")
      .insert([
        {
          truck_arrival_id: truckArrivalId,
          description: itemForm.description,
          quantity: parseInt(itemForm.quantity),
          condition: itemForm.condition,
        },
      ])
      .select()
      .single();
    if (error) {
      toast.error("Failed to add item");
      return;
    }
    setItems([...items, data]);
    setItemForm({ description: "", quantity: "1", condition: "Good" });
  };
  // Bulk upload CSV/Excel/PDF
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        let rows: any[] = [];
        if (ext === "csv") {
          const text = evt.target?.result as string;
          rows = text.split("\n").map((r) => r.split(","));
        } else {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }
        // Process rows: [description, quantity, condition]
        const newItems: TruckItem[] = [];
        for (const row of rows.slice(1)) {
          // skip header
          if (row.length < 2) continue;
          const [description, quantity, condition = "Good"] = row;
          if (!description || !quantity) continue;
          const { data, error } = await supabase
            .from("truck_items")
            .insert([
              {
                truck_arrival_id: truckArrivalId,
                description,
                quantity: parseInt(quantity),
                condition: condition || "Good",
              },
            ])
            .select()
            .single();
          if (error) {
            setBulkUploadError("Bulk upload failed");
            return;
          }
          newItems.push(data);
        }
        setItems([...items, ...newItems]);
      };
      if (ext === "csv") reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
    } else if (ext === "pdf") {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const typedarray = new Uint8Array(evt.target?.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
        // Try to split text into rows/columns (basic, may need to adjust for your PDF format)
        const rows = text.split("\n").map((line) => line.split(/\s{2,}/));
        const newItems: TruckItem[] = [];
        for (const row of rows) {
          if (row.length < 2) continue;
          const [description, quantity, condition = "Good"] = row;
          if (!description || !quantity) continue;
          const { data, error } = await supabase
            .from("truck_items")
            .insert([
              {
                truck_arrival_id: truckArrivalId,
                description,
                quantity: parseInt(quantity),
                condition: condition || "Good",
              },
            ])
            .select()
            .single();
          if (error) {
            setBulkUploadError("Bulk upload failed");
            return;
          }
          newItems.push(data);
        }
        setItems([...items, ...newItems]);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setBulkUploadError(
        "Unsupported file type. Please upload CSV, Excel, or PDF."
      );
    }
  };
  const canProceedUnloading = items.length > 0;

  // Step 3: Quality Check Handlers
  const handleQualityCheck = (itemId: string, status: string, file?: File) => {
    setQualityChecks({
      ...qualityChecks,
      [itemId]: { ...qualityChecks[itemId], status },
    });
    // Handle file upload for damage image if needed
    if (file) {
      // For demo, just set a fake URL
      setQualityChecks((qc) => ({
        ...qc,
        [itemId]: {
          ...qc[itemId],
          damage_image_url: URL.createObjectURL(file),
        },
      }));
    }
  };
  const handleSupervisorSign = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSupervisorName(e.target.value);
  const handleFinishQualityCheck = async () => {
    // Save to DB and generate barcodes
    for (const item of items) {
      const qc = qualityChecks[item.id];
      if (!qc) continue;
      // Generate barcode (for demo, use item.id)
      const barcode = item.id;

      // Save to warehouse_items table with minimal required fields
      console.log("Saving warehouse item:", {
        name: item.description,
        quantity: item.quantity,
        condition: item.condition,
        status: qc.status,
        client_id: currentUser?.id,
        created_at: new Date().toISOString(),
        truck_arrival_id: truckArrivalId,
      });
      const { error: warehouseItemError } = await supabase
        .from("warehouse_items")
        .insert([
          {
            name: item.description,
            quantity: item.quantity,
            condition: item.condition,
            status: qc.status,
            client_id: currentUser?.id,
            created_at: new Date().toISOString(),
            truck_arrival_id: truckArrivalId,
          },
        ]);

      if (warehouseItemError) {
        console.error("Warehouse item insert error:", warehouseItemError);
        toast.error(
          "Failed to add item to warehouse: " + warehouseItemError.message
        );
        return;
      }

      // Save quality check
      await supabase.from("quality_checks").insert([
        {
          truck_item_id: item.id,
          status: qc.status,
          damage_image_url: qc.damage_image_url,
          supervisor_name: supervisorName,
          barcode,
        },
      ]);
    }
    toast.success("Quality check complete!");
    setCurrentStep(3); // Move to putaway step
  };
  const canFinishQuality =
    items.every((item) => qualityChecks[item.id]?.status) && supervisorName;

  // Step 4: Putaway Handlers
  const handlePutawayInput = (itemId: string, field: string, value: string) => {
    setPutawayForm({
      ...putawayForm,
      [itemId]: { ...putawayForm[itemId], [field]: value },
    });
  };
  const handleAssignPutaway = async () => {
    setPutawayError(null);
    // Validate uniqueness
    const positions = Object.values(putawayForm).map(
      (p) => `${p.aisle}-${p.bay}-${p.level}-${p.position}`
    );
    if (new Set(positions).size !== positions.length) {
      setPutawayError("Each position must be unique!");
      return;
    }
    // Save to DB
    for (const item of items) {
      const p = putawayForm[item.id];
      if (!p) continue;
      const { error } = await supabase.from("putaway_assignments").insert([
        {
          truck_item_id: item.id,
          aisle: p.aisle,
          bay: p.bay,
          level: p.level,
          position: p.position,
        },
      ]);
      if (error) {
        setPutawayError("Failed to assign putaway");
        return;
      }
    }
    toast.success("Putaway assigned!");
    setWorkflowComplete(true);
  };
  // Compute all putaway keys for all lines
  const allPutawayKeys = items.flatMap((item) =>
    Array.from({ length: item.quantity }, (_, idx) => `${item.id}-${idx}`)
  );
  const canProceedPutaway = allPutawayKeys.every(
    (key) =>
      putawayForm[key]?.aisle &&
      putawayForm[key]?.bay &&
      putawayForm[key]?.level &&
      putawayForm[key]?.position
  );

  // Stepper icons
  const stepIcons = [Truck, Package, WarehouseIcon, ShieldCheck];

  // Remove item with confirmation dialog
  const handleRemoveItem = (item: TruckItem) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };
  const confirmRemoveItem = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    const { error } = await supabase
      .from("truck_items")
      .delete()
      .eq("id", itemToDelete.id);
    setLoading(false);
    setShowDeleteDialog(false);
    if (!error) setItems(items.filter((i) => i.id !== itemToDelete.id));
    else toast.error("Failed to remove item");
    setItemToDelete(null);
  };

  // Calculate invoice amount based on weekly fee and additional charges
  const calculateInvoiceAmount = () => {
    let total = 0;

    // Add weekly fee if selected and available
    if (invoiceForm.useWeeklyFee && selectedCustomer?.weekly_fee) {
      const weeksNum = parseInt(invoiceForm.weeks, 10) || 1;
      total += selectedCustomer.weekly_fee * weeksNum;
    }

    // Add additional amount if provided
    if (invoiceForm.additionalAmount) {
      total += parseFloat(invoiceForm.additionalAmount) || 0;
    }

    setCalculatedAmount(total.toFixed(2));
    return total;
  };

  // Handle invoice form changes
  const handleInvoiceFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInvoiceForm({ ...invoiceForm, [name]: value });

    // Recalculate amount when form changes
    setTimeout(calculateInvoiceAmount, 0);
  };

  // Toggle weekly fee usage
  const handleToggleWeeklyFee = (value: boolean) => {
    setInvoiceForm({ ...invoiceForm, useWeeklyFee: value });
    setTimeout(calculateInvoiceAmount, 0);
  };

  // Generate and save invoice
  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) {
      toast.error("No customer selected");
      return;
    }

    try {
      // Calculate final amount
      const amount = calculateInvoiceAmount();

      // Generate invoice number
      const invoiceNumber = `INV-${nanoid(8).toUpperCase()}`;

      // Create invoice in database
      const { data, error } = await supabase
        .from("invoices")
        .insert([
          {
            number: invoiceNumber,
            customer: selectedCustomer.name,
            amount: amount,
            currency: "GBP",
            status: "pending",
            created_at: new Date().toISOString(),
            notes: invoiceForm.notes,
            operation_id: truckArrivalId,
          },
        ])
        .select();

      if (error) throw error;

      toast.success("Invoice generated successfully");
      setShowInvoiceDialog(false);

      // Reset form
      setInvoiceForm({
        weeks: "1",
        useWeeklyFee: true,
        additionalAmount: "0",
        notes: "",
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    }
  };

  // Spinner component
  const Spinner = () => (
    <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin align-middle"></span>
  );

  // UI
  return (
    <div ref={mainRef} className="space-y-8 max-w-4xl mx-auto px-2 md:px-0">
      <h1 className="text-2xl font-bold mb-2">Warehouse Operations</h1>
      {/* Workflow Complete Card */}
      {workflowComplete ? (
        <Card className="text-center py-12 mx-auto max-w-xl mt-16 animate-fade-in glass-card border border-gray-200">
          <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-50"></div>
          <CardHeader>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-gradient-to-br from-green-400 to-green-500 mb-4">
              <CheckCircle2 className="text-white" size={36} />
            </div>
            <CardTitle className="text-3xl mb-2 font-heading bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
              Workflow Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg mb-4 font-sans">
              All items have been processed and transferred to inventory
            </div>
            <div className="font-semibold text-green-600 mb-8 font-sans">
              Warehouse Operation Complete!
              <br />
              All {items.length} items have been processed and are now available
              in inventory.
            </div>
            <Button
              onClick={() => {
                setCurrentStep(0);
                setTruckForm({
                  vehicle_registration: "",
                  customer_name: "",
                  driver_name: "",
                  vehicle_size: "",
                  load_type: "",
                  arrival_time: "",
                  warehouse_id: "",
                });
                setTruckArrivalId(null);
                setItems([]);
                setItemForm({
                  description: "",
                  quantity: "1",
                  condition: "Good",
                });
                setBulkUploadError(null);
                setPutaways([]);
                setPutawayForm({});
                setPutawayError(null);
                setQualityChecks({});
                setSupervisorName("");
                setWorkflowComplete(false);
                if (mainRef.current)
                  mainRef.current.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-gradient-to-r from-[#3456FF] to-[#8763FF] hover:opacity-90 transition-all shadow-md font-medium mt-2"
            >
              <div className="absolute inset-0 overflow-hidden rounded-md">
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-shimmer" />
              </div>
              Start New Operation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stepper with enhanced styling */}
          <div className="flex items-center mb-8 justify-center">
            {steps.map((step, idx) => {
              const Icon = stepIcons[idx];
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              return (
                <React.Fragment key={step}>
                  <div
                    className={`flex flex-col items-center ${
                      isActive
                        ? "text-[#3456FF]"
                        : isCompleted
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`rounded-full w-12 h-12 flex items-center justify-center border-2 ${
                        isActive
                          ? "border-[#3456FF] bg-[#3456FF]/10 shadow-md"
                          : isCompleted
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 bg-white"
                      } mb-1`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Icon
                          className={`w-6 h-6 ${
                            isActive ? "animate-pulse-slow" : ""
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive
                          ? "text-[#3456FF]"
                          : isCompleted
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full ${
                        isCompleted
                          ? "bg-gradient-to-r from-green-400 to-green-500"
                          : idx === currentStep - 1
                          ? "bg-gradient-to-r from-green-500 to-[#3456FF]/50"
                          : isActive
                          ? "bg-gradient-to-r from-[#3456FF]/50 to-gray-200"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Step 1: Truck Arrival with enhanced styling */}
          {currentStep === 0 && (
            <Card className="glass-card border-gray-200 shadow-md">
              <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-50"></div>
              <CardHeader>
                <CardTitle className="text-xl font-heading font-bold bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
                  Register Truck Arrival
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-1 font-sans">
                      Vehicle Registration
                    </label>
                    <Input
                      name="vehicle_registration"
                      value={truckForm.vehicle_registration}
                      onChange={handleTruckInput}
                      autoComplete="off"
                      className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 font-sans">
                      Customer Name
                    </label>
                    <Input
                      name="customer_name"
                      value={truckForm.customer_name}
                      onChange={handleTruckInput}
                      autoComplete="off"
                      className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 font-sans">
                      Driver Name
                    </label>
                    <Input
                      name="driver_name"
                      value={truckForm.driver_name}
                      onChange={handleTruckInput}
                      autoComplete="off"
                      className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 font-sans">
                      Vehicle Size
                    </label>
                    <Select
                      name="vehicle_size"
                      value={truckForm.vehicle_size}
                      onValueChange={(val) =>
                        setTruckForm({ ...truckForm, vehicle_size: val })
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all">
                        <SelectValue placeholder="Select Vehicle Size" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 shadow-lg font-sans">
                        <SelectItem value="VAN">VAN</SelectItem>
                        <SelectItem value="7.5T">7.5T</SelectItem>
                        <SelectItem value="18T">18T</SelectItem>
                        <SelectItem value="32T">32T</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 font-sans">
                      Load Type
                    </label>
                    <Select
                      name="load_type"
                      value={truckForm.load_type}
                      onValueChange={(val) =>
                        setTruckForm({ ...truckForm, load_type: val })
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all">
                        <SelectValue placeholder="Select Load Type" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 shadow-lg font-sans">
                        <SelectItem value="PALLETIZED">PALLETIZED</SelectItem>
                        <SelectItem value="LOOSE">LOOSE</SelectItem>
                        <SelectItem value="OTHER">OTHER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 font-sans">
                      Arrival Time
                    </label>
                    <Input
                      name="arrival_time"
                      type="datetime-local"
                      value={truckForm.arrival_time}
                      onChange={handleTruckInput}
                      className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1 font-sans">
                      Select Warehouse
                    </label>
                    <Select
                      name="warehouse_id"
                      value={truckForm.warehouse_id}
                      onValueChange={(val) =>
                        setTruckForm({ ...truckForm, warehouse_id: val })
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all">
                        <SelectValue placeholder="Select Warehouse" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 shadow-lg font-sans">
                        {warehouses.map((w) => (
                          <SelectItem
                            key={w.id}
                            value={w.id}
                            className="font-sans focus:bg-[#3456FF]/5"
                          >
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      type="button"
                      disabled={!canRegisterArrival || loading}
                      onClick={async () => {
                        setLoading(true);
                        await handleRegisterArrival();
                        setLoading(false);
                      }}
                      className="bg-gradient-to-r from-[#3456FF] to-[#8763FF] hover:opacity-90 transition-all shadow-md font-medium w-full md:w-auto text-white"
                    >
                      <div className="absolute inset-0 overflow-hidden rounded-md">
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-shimmer" />
                      </div>
                      {loading ? <Spinner /> : "Register Arrival"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {/* Step 2: Unloading */}
          {currentStep === 1 && (
            <Card className="glass-card border-gray-200 shadow-md">
              <CardHeader>
                <Button
                  variant="outline"
                  className="mb-4"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
                <CardTitle className="text-xl font-heading font-bold bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
                  Unloading
                </CardTitle>
                <p className="text-gray-500 text-sm mt-1">
                  Add each item from the truck. You can also bulk upload via
                  CSV, Excel, or PDF.
                </p>
              </CardHeader>
              <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 font-sans">
                      Description
                    </label>
                    <Select
                      name="description"
                      value={itemForm.description}
                      onValueChange={(val) =>
                        setItemForm({ ...itemForm, description: val })
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all">
                        <SelectValue placeholder="Select Description" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 shadow-lg font-sans">
                        <SelectItem value="PALLETS">PALLETS</SelectItem>
                        <SelectItem value="ITEMS">ITEMS</SelectItem>
                        <SelectItem value="OTHER">OTHER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 font-sans">
                      Quantity
                    </label>
                    <Input
                      name="quantity"
                      type="number"
                      min="1"
                      value={itemForm.quantity}
                      onChange={handleItemInput}
                      className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 font-sans">
                      Condition
                    </label>
                    <select
                      name="condition"
                      value={itemForm.condition}
                      onChange={handleItemInput}
                      className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all rounded px-2 py-1 w-full"
                    >
                      <option value="Good">Good</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                  </div>
                  <Button
                    type="button"
                    disabled={!canAddItem || loading}
                    onClick={async () => {
                      setLoading(true);
                      await handleAddItem();
                      setLoading(false);
                    }}
                    className="w-full bg-gradient-to-r from-[#3456FF] to-[#8763FF] text-white hover:opacity-90"
                  >
                    {loading ? <Spinner /> : "Add Item"}
                  </Button>
                </form>
                <div className="mb-2">
                  <label className="block mb-1 font-medium">
                    Bulk Upload (CSV, Excel, or PDF)
                  </label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf"
                    onChange={handleBulkUpload}
                  />
                  {bulkUploadError && (
                    <div className="text-red-500 text-xs">
                      {bulkUploadError}
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
                  <Table className="min-w-full text-sm">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, idx) => (
                        <TableRow
                          key={item.id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.condition}</TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Remove item"
                              onClick={() => handleRemoveItem(item)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button
                  className="mt-4 w-full md:w-auto bg-gradient-to-r from-[#3456FF] to-[#8763FF] text-white hover:opacity-90"
                  disabled={!canProceedUnloading}
                  onClick={() => setCurrentStep(2)}
                >
                  Proceed to Quality Check
                </Button>
              </CardContent>
            </Card>
          )}
          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Item</DialogTitle>
              </DialogHeader>
              <div>Are you sure you want to remove this item?</div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmRemoveItem}
                  disabled={loading}
                >
                  {loading ? <Spinner /> : "Remove"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Generate Invoice Dialog */}
          <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Generate Invoice for {selectedCustomer?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedCustomer?.weekly_fee ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Use Weekly Fee (£
                        {parseFloat(selectedCustomer.weekly_fee).toFixed(2)}
                        /week)
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant={
                            invoiceForm.useWeeklyFee ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handleToggleWeeklyFee(true)}
                          className={
                            invoiceForm.useWeeklyFee
                              ? "bg-blue-600 text-white"
                              : ""
                          }
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={
                            !invoiceForm.useWeeklyFee ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handleToggleWeeklyFee(false)}
                          className={
                            !invoiceForm.useWeeklyFee ? "bg-gray-200" : ""
                          }
                        >
                          No
                        </Button>
                      </div>
                    </div>

                    {invoiceForm.useWeeklyFee && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Number of Weeks
                        </label>
                        <Input
                          name="weeks"
                          type="number"
                          min="1"
                          step="1"
                          value={invoiceForm.weeks}
                          onChange={handleInvoiceFormChange}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    No weekly fee set for this customer. You can set a weekly
                    fee in the Customers page.
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Additional Amount (£)
                  </label>
                  <Input
                    name="additionalAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoiceForm.additionalAmount}
                    onChange={handleInvoiceFormChange}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">
                    For extra services, materials, or special charges
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    name="notes"
                    value={invoiceForm.notes}
                    onChange={handleInvoiceFormChange}
                    className="w-full"
                    placeholder="Operation details, special instructions, etc."
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-lg font-bold">
                      £{calculatedAmount}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex space-x-2 sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowInvoiceDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateInvoice}
                  className="bg-gradient-to-r from-[#3456FF] to-[#8763FF] text-white hover:from-[#2345EE] hover:to-[#7652EE]"
                >
                  Generate Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Step 3: Quality Check */}
          {currentStep === 2 && (
            <Card className="glass-card border-gray-200 shadow-md">
              <CardHeader>
                <Button
                  variant="outline"
                  className="mb-4"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
                <CardTitle className="text-xl font-heading font-bold bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
                  Quality Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <Table className="min-w-full text-sm">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="whitespace-nowrap">
                          Description
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Status
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Damage Image
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, idx) => (
                        <TableRow
                          key={item.id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <TableCell className="whitespace-nowrap">
                            {item.description}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={qualityChecks[item.id]?.status || ""}
                              onValueChange={(val) =>
                                handleQualityCheck(item.id, val)
                              }
                            >
                              <SelectTrigger className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all">
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                              <SelectContent className="border-gray-200 shadow-lg font-sans">
                                <SelectItem value="ok">OK</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {qualityChecks[item.id]?.status === "damaged" && (
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file)
                                    handleQualityCheck(
                                      item.id,
                                      "damaged",
                                      file
                                    );
                                }}
                                className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                              />
                            )}
                            {qualityChecks[item.id]?.damage_image_url && (
                              <img
                                src={qualityChecks[item.id].damage_image_url}
                                alt="Damage"
                                className="w-16 h-16 object-cover mt-2 rounded border"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex flex-col md:flex-row gap-2 items-center justify-end">
                  <Input
                    placeholder="Supervisor Name"
                    value={supervisorName}
                    onChange={handleSupervisorSign}
                    className="w-full md:w-auto"
                  />
                  <Button
                    disabled={!canFinishQuality || completing}
                    onClick={async () => {
                      setCompleting(true);
                      await handleFinishQualityCheck();
                      setCompleting(false);
                    }}
                    className="w-full md:w-auto bg-gradient-to-r from-[#3456FF] to-[#8763FF] text-white hover:opacity-90 transition-all shadow-md font-medium"
                  >
                    {completing ? <Spinner /> : "Proceed to Putaway"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Step 4: Putaway */}
          {currentStep === 3 && (
            <Card className="glass-card border-gray-200 shadow-md">
              <CardHeader>
                <Button
                  variant="outline"
                  className="mb-4"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
                <CardTitle className="text-xl font-heading font-bold bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
                  Warehouse Putaway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <Table className="min-w-full text-sm">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="whitespace-nowrap">
                          Description
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Aisle
                        </TableHead>
                        <TableHead className="whitespace-nowrap">Bay</TableHead>
                        <TableHead className="whitespace-nowrap">
                          Level
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Position
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.flatMap((item) =>
                        Array.from({ length: item.quantity }, (_, idx) => {
                          const rowKey = `${item.id}-${idx}`;
                          return (
                            <TableRow key={rowKey}>
                              <TableCell className="whitespace-nowrap">
                                {item.description}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={putawayForm[rowKey]?.aisle || ""}
                                  onChange={(e) =>
                                    handlePutawayInput(
                                      rowKey,
                                      "aisle",
                                      e.target.value
                                    )
                                  }
                                  className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={putawayForm[rowKey]?.bay || ""}
                                  onChange={(e) =>
                                    handlePutawayInput(
                                      rowKey,
                                      "bay",
                                      e.target.value
                                    )
                                  }
                                  className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={putawayForm[rowKey]?.level || ""}
                                  onChange={(e) =>
                                    handlePutawayInput(
                                      rowKey,
                                      "level",
                                      e.target.value
                                    )
                                  }
                                  className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={putawayForm[rowKey]?.position || ""}
                                  onChange={(e) =>
                                    handlePutawayInput(
                                      rowKey,
                                      "position",
                                      e.target.value
                                    )
                                  }
                                  className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                {putawayError && (
                  <div className="text-red-500 text-xs mt-2">
                    {putawayError}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    className="w-full md:w-auto bg-gradient-to-r from-[#3456FF] to-[#8763FF] text-white hover:opacity-90"
                    disabled={!canProceedPutaway}
                    onClick={handleAssignPutaway}
                  >
                    Assign Putaway
                  </Button>
                </div>
                {/* Render warehouse labels for each item with assigned location */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.flatMap((item) =>
                    Array.from({ length: item.quantity }, (_, idx) => {
                      const rowKey = `${item.id}-${idx}`;
                      const p = putawayForm[rowKey] || {};
                      // Format date and time
                      let arrivalDate = "";
                      let arrivalTime = "";
                      if (truckForm.arrival_time) {
                        const d = new Date(truckForm.arrival_time);
                        arrivalDate = d.toLocaleDateString();
                        arrivalTime = d.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }
                      return (
                        <div
                          key={rowKey}
                          className="flex flex-col items-center mb-8 relative group"
                        >
                          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const labelElement = document.getElementById(
                                  `label-${rowKey}`
                                );
                                if (labelElement) {
                                  html2canvas(labelElement).then((canvas) => {
                                    const link = document.createElement("a");
                                    link.download = `warehouse-label-${item.description}-${p.aisle}-${p.bay}-${p.level}-${p.position}.png`;
                                    link.href = canvas.toDataURL();
                                    link.click();
                                  });
                                }
                              }}
                              className="bg-white shadow-md hover:bg-gray-50"
                            >
                              Download Label
                            </Button>
                          </div>
                          <div
                            id={`label-${rowKey}`}
                            className="transform hover:scale-105 transition-transform duration-200"
                          >
                            <WarehouseLabel
                              company={
                                truckForm.customer_name
                                  ? truckForm.customer_name + " Warehouse"
                                  : "Warehouse Label"
                              }
                              customerName={truckForm.customer_name}
                              dateOfArrival={arrivalDate}
                              timeOfArrival={arrivalTime}
                              aisle={p.aisle}
                              bay={p.bay}
                              level={p.level}
                              position={p.position}
                              barcodeValue={item.id}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
