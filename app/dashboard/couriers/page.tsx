'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Map, Truck, ArrowRight, BarChart3, Package, Boxes, Zap } from 'lucide-react';
import Barcode from 'react-barcode';
import { AnimatedGradientBackground } from '@/components/ui/animated-gradient-background';
import { AIParticleEffect } from '@/components/ui/ai-particle-effect';

interface Courier {
  id: string;
  // Personal Information
  name: string;
  email: string;
  phone: string;
  // Vehicle Information
  vehicle_type: string;
  vehicle_registration: string;
  max_capacity: number;
  // Zone Information
  assigned_region: string;
  default_zone: string;
  // Performance
  status: 'active' | 'inactive' | 'delayed';
  deliveries_completed: number;
  created_at: string;
  client_id: string;
}

interface DeliveryStop {
  id: string;
  delivery_id: string;
  address: string;
  stop_type: 'pickup' | 'delivery';
  sequence: number;
  status: 'pending' | 'completed';
  estimated_time: string;
}

interface ShippingLabel {
  packageId: string;
  products: Array<{
    name: string;
    quantity: number;
    dimensions?: string;
    weight?: number;
  }>;
  pickup: {
    location: string;
    time: string;
  };
  delivery: {
    address: string;
    notes: string;
  };
  courier: {
    name: string;
    vehicle: string;
    phone: string;
  };
  priority: string;
  totalWeight: number;
  status: string;
  createdAt: string;
}

interface Delivery {
  id: string;
  courier_id: string;
  package_id: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  client_id: string;
  products: Array<{ name: string; quantity: number; dimensions?: string; weight?: number }>;
  delivery_stops?: DeliveryStop[];
  courier?: {
    name: string;
    vehicle_type: string;
    phone: string;
  };
  optimized_route?: any;
  shipping_label?: ShippingLabel;
  pod_file?: string;
  all_stops_completed?: boolean;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  client_id: string;
}

interface Product {
  product_id: string;
  name: string;
  quantity: number;
  dimensions?: string;
  weight?: number;
  sku?: string;
  category?: string;
}

interface RouteOption {
  id: number;
  name: string;
  description: string;
  distance: number;
  duration: number;
  fuelConsumption: number;
  stops: Array<{
    name: string;
    distance: number;
    duration: number;
    traffic: 'Low' | 'Medium' | 'High';
    weather: string;
  }>;
  totalFuelCost: number;
  roadType: string;
  advantages: string[];
  disadvantages: string[];
}

interface GoogleRouteResponse {
  distance: number;
  duration: number;
  steps: Array<{
    distance: number;
    duration: number;
    instructions: string;
    path: Array<{ lat: number; lng: number }>;
  }>;
}

interface Route {
  id: string;
  destination: string;
  notes?: string;
  priority: string;
  status: string;
}

// Create the Supabase client with service role key
const supabaseUrl = "https://qpkaklmbiwitlroykjim.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwa2FrbG1iaXdpdGxyb3lramltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjgxMzg2MiwiZXhwIjoyMDUyMzg5ODYyfQ.IBTdBXb3hjobEUDeMGRNbRKZoavL0Bvgpyoxb1HHr34";

const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const RouteOptionCard = ({ option, selectedRoute }: { option: RouteOption; selectedRoute: RouteOption | null }) => (
  <div
    className={`flex items-center justify-between p-4 border rounded-lg ${
      selectedRoute?.id === option.id ? 'border-blue-500' : ''
    }`}
  >
    <div>
      <h4 className="font-semibold">{option.name}</h4>
      <p className="text-sm text-gray-600">{option.description}</p>
    </div>
    <Badge variant={option.id === 1 ? "success" : "secondary"}>
      {option.id === 1 ? "Recommended" : "Alternative"}
    </Badge>
  </div>
);

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isDeliveriesLoading, setIsDeliveriesLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    password: '',
    phone: '',
    // Vehicle Information
    vehicle_type: '',
    vehicle_registration: '',
    max_capacity: '',
    // Zone Information
    assigned_region: '',
    default_zone: '',
  });
  const [showAssignDeliveryDialog, setShowAssignDeliveryDialog] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<string>('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [deliveryType, setDeliveryType] = useState<'warehouse' | 'client'>('warehouse');
  const [deliveryFormData, setDeliveryFormData] = useState({
    package_id: '',
    priority: 'medium',
    source_warehouse_id: '',
    destination_warehouse_id: '',
    client_address: '',
    pickup_time: '',
    notes: '',
    products: [{ name: '', quantity: 0 }]
  });
  const [deliveryStep, setDeliveryStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastDeliveryDetails, setLastDeliveryDetails] = useState<Delivery | null>(null);
  const [warehouseProducts, setWarehouseProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Array<{ product_id: string, name: string, quantity: number, dimensions?: string, weight?: number }>>([]);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      toast.error('Please sign in to view couriers');
      return;
    }

    try {
      const userData = JSON.parse(currentUser);
      await Promise.all([
        fetchCouriers(userData.id),
        fetchWarehouses(userData.id),
        fetchDeliveries(userData.id)
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const fetchCouriers = async (clientId: string) => {
    try {
      setIsTableLoading(true);
      const { data, error } = await supabaseClient
        .from('couriers')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCouriers(data || []);
    } catch (error) {
      console.error('Error fetching couriers:', error);
      toast.error('Failed to fetch couriers');
    } finally {
      setIsTableLoading(false);
    }
  };

  const fetchWarehouses = async (clientId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('warehouses')
        .select('*')
        .eq('client_id', clientId);

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    }
  };

  const fetchDeliveries = async (clientId: string) => {
    try {
      setIsDeliveriesLoading(true);
      const { data, error } = await supabaseClient
        .from('deliveries')
        .select(`
          *,
          courier:courier_id (
            name,
            vehicle_type,
            phone
          ),
          delivery_stops (
            address,
            stop_type
          ),
          shipping_label,
          optimized_route
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to fetch deliveries');
    } finally {
      setIsDeliveriesLoading(false);
    }
  };

  const fetchWarehouseProducts = async (warehouseId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('warehouse_inventory')
        .select(`
          *,
          products:product_id (
            id,
            name,
            sku,
            category,
            dimensions,
            weight,
            client_id
          )
        `)
        .eq('warehouse_id', warehouseId);

      if (error) throw error;

      // Transform the data to match our Product interface
      const transformedProducts = (data || []).map(item => ({
        product_id: item.product_id,
        name: item.products.name,
        quantity: item.quantity,
        dimensions: item.products.dimensions,
        weight: item.products.weight,
        sku: item.products.sku,
        category: item.products.category
      }));

      setWarehouseProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching warehouse products:', error);
      toast.error('Failed to fetch warehouse products');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      vehicle_type: '',
      vehicle_registration: '',
      max_capacity: '',
      assigned_region: '',
      default_zone: '',
    });
  };

  const handleDialogChange = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      toast.error('Please sign in to add couriers');
      setIsLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(currentUser);

      // Validate password
      if (!formData.password || formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      // Check if courier email matches client email
      if (formData.email.toLowerCase() === userData.email.toLowerCase()) {
        toast.error("Courier's email cannot be the same as your email");
        setIsLoading(false);
        return;
      }

      // Check if courier email already exists
      const { data: existingCourier, error: checkError } = await supabaseClient
        .from('couriers')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingCourier) {
        toast.error('A courier with this email already exists');
        setIsLoading(false);
        return;
      }

      const { data: courierData, error: courierError } = await supabaseClient
        .from('couriers')
        .insert({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          vehicle_type: formData.vehicle_type,
          vehicle_registration: formData.vehicle_registration,
          max_capacity: parseInt(formData.max_capacity),
          assigned_region: formData.assigned_region,
          default_zone: formData.default_zone,
          status: 'active',
          deliveries_completed: 0,
          client_id: userData.id
        })
        .select()
        .single();

      if (courierError) {
        if (courierError.message.includes('password')) {
          toast.error('Failed to set courier password. Please ensure the password column exists in the database.');
          console.error('Database error:', courierError);
          return;
        }
        throw courierError;
      }

      toast.success('Courier added successfully');
      toast.success(`Courier can sign in with email: ${formData.email} and password: ${formData.password}`);
      setShowAddDialog(false);
      resetForm();
      fetchCouriers(userData.id);
    } catch (error: any) {
      console.error('Error adding courier:', error);
      toast.error(error.message || 'Failed to add courier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate route optimization
      if (!selectedRoute) {
        toast.error('Please optimize and select a route before assigning delivery');
        setIsLoading(false);
        return;
      }

      // Get the selected courier and warehouse
      const selectedCourierData = couriers.find(c => c.id === selectedCourier);
      const selectedWarehouse = warehouses.find(w => w.id === deliveryFormData.source_warehouse_id);

      if (!selectedCourierData || !selectedWarehouse) {
        throw new Error('Selected courier or warehouse not found');
      }

      // Generate a unique package ID
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const packageId = `PKG-${timestamp}-${random}`;

      // Calculate total weight and format dimensions
      const productsWithDetails = selectedProducts.map(product => ({
        name: product.name,
        quantity: product.quantity,
        dimensions: product.dimensions || 'Not specified',
        weight: product.weight || 0
      }));

      const totalWeight = productsWithDetails.reduce((sum, product) => 
        sum + (product.weight || 0) * product.quantity, 0);

      // Generate shipping label for all deliveries
      const shippingLabel: ShippingLabel = {
        packageId,
        products: productsWithDetails,
        pickup: {
          location: selectedWarehouse.location,
          time: deliveryFormData.pickup_time
        },
        delivery: {
          address: deliveryType === 'warehouse' 
            ? warehouses.find(w => w.id === deliveryFormData.destination_warehouse_id)?.location || ''
            : deliveryFormData.client_address,
          notes: deliveryFormData.notes || 'No special instructions'
        },
        courier: {
          name: selectedCourierData.name,
          vehicle: selectedCourierData.vehicle_type,
          phone: selectedCourierData.phone
        },
        priority: deliveryFormData.priority,
        totalWeight,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Prepare the optimized route data
      const optimizedRoute = {
        name: selectedRoute.name,
        description: selectedRoute.description,
        distance: selectedRoute.distance,
        duration: selectedRoute.duration,
        fuelConsumption: selectedRoute.fuelConsumption,
        totalFuelCost: selectedRoute.totalFuelCost,
        stops: selectedRoute.stops,
        advantages: selectedRoute.advantages,
        roadType: selectedRoute.roadType
      };

      // Create delivery payload
      const deliveryPayload = {
        courier_id: selectedCourier,
        package_id: packageId,
        priority: deliveryFormData.priority,
        status: 'pending',
        client_id: selectedCourierData.client_id,
        notes: deliveryFormData.notes || '',
        delivery_type: deliveryType,
        products: productsWithDetails,
        shipping_label: shippingLabel,
        optimized_route: optimizedRoute,
        created_at: new Date().toISOString()
      };

      // Create the delivery record
      const { data: deliveryData, error: deliveryError } = await supabaseClient
        .from('deliveries')
        .insert([deliveryPayload])
        .select(`
          *,
          courier:courier_id (
            name,
            vehicle_type,
            phone
          )
        `)
        .single();

      if (deliveryError) {
        console.error('Delivery Creation Error:', deliveryError);
        throw new Error(`Failed to create delivery: ${deliveryError.message}`);
      }

      // Prepare stops data
      const stops = [
        {
          delivery_id: deliveryData.id,
          warehouse_id: deliveryFormData.source_warehouse_id,
          address: selectedWarehouse.location,
          stop_type: 'pickup' as const,
          sequence: 1,
          status: 'pending' as const,
          estimated_time: deliveryFormData.pickup_time
        },
        {
          delivery_id: deliveryData.id,
          warehouse_id: deliveryType === 'warehouse' ? deliveryFormData.destination_warehouse_id : null,
          address: deliveryType === 'warehouse' 
            ? warehouses.find(w => w.id === deliveryFormData.destination_warehouse_id)?.location 
            : deliveryFormData.client_address,
          stop_type: 'delivery' as const,
          sequence: 2,
          status: 'pending' as const,
          estimated_time: deliveryFormData.pickup_time
        }
      ];

      // Create the delivery stops
      const { data: stopsData, error: stopsError } = await supabaseClient
        .from('delivery_stops')
        .insert(stops)
        .select();

      if (stopsError) {
        console.error('Delivery Stops Creation Error:', stopsError);
        await supabaseClient
          .from('deliveries')
          .delete()
          .eq('id', deliveryData.id);
        throw new Error(`Failed to create delivery stops: ${stopsError.message}`);
      }

      // Update the local state with the new delivery
      const newDelivery = {
        ...deliveryData,
        delivery_stops: stops,
        shipping_label: shippingLabel,
        optimized_route: optimizedRoute
      };
      
      setDeliveries(prevDeliveries => [newDelivery, ...prevDeliveries]);
      setLastDeliveryDetails(deliveryData);
      setShowSuccessDialog(true);
      setShowAssignDeliveryDialog(false);
      resetDeliveryForm();

      // Update courier's delivery count
      const { error: courierUpdateError } = await supabaseClient
        .from('couriers')
        .update({
          deliveries_completed: selectedCourierData.deliveries_completed + 1
        })
        .eq('id', selectedCourier);

      if (courierUpdateError) {
        console.error('Error updating courier delivery count:', courierUpdateError);
      }

      // Update local state
      setCouriers(prevCouriers =>
        prevCouriers.map(courier =>
          courier.id === selectedCourier
            ? { ...courier, deliveries_completed: courier.deliveries_completed + 1 }
            : courier
        )
      );

      toast.success('Delivery assigned successfully');

    } catch (error: any) {
      console.error('Error in handleAssignDelivery:', error);
      toast.error(error.message || 'Failed to assign delivery');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDeliveryForm = () => {
    setDeliveryFormData({
      package_id: '',
      priority: 'medium',
      source_warehouse_id: '',
      destination_warehouse_id: '',
      client_address: '',
      pickup_time: '',
      notes: '',
      products: [{ name: '', quantity: 0 }]
    });
    setSelectedCourier('');
    setDeliveryType('warehouse');
    setDeliveryStep(1);
    setSelectedProducts([]);
    setSelectedRoute(null);
    setRouteOptions([]);
  };

  const handleSourceWarehouseChange = (warehouseId: string) => {
    setDeliveryFormData(prev => ({ ...prev, source_warehouse_id: warehouseId }));
    fetchWarehouseProducts(warehouseId);
    setSelectedProducts([]);
  };

  const calculateRouteOptions = async (pickup: string, delivery: string) => {
    setIsCalculatingRoute(true);
    setMapError(null);
    
    try {
      // First, geocode the addresses using Nominatim
      const pickupResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickup)}`);
      const deliveryResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(delivery)}`);
      
      const pickupData = await pickupResponse.json();
      const deliveryData = await deliveryResponse.json();

      if (!pickupData[0] || !deliveryData[0]) {
        throw new Error('Could not find coordinates for one or both locations');
      }

      // Get coordinates
      const pickupCoords = `${pickupData[0].lon},${pickupData[0].lat}`;
      const deliveryCoords = `${deliveryData[0].lon},${deliveryData[0].lat}`;

      // Get routes using OSRM
      const mainRouteResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickupCoords};${deliveryCoords}?overview=full&alternatives=true&steps=true`
      );
      const mainRouteData = await mainRouteResponse.json();

      if (mainRouteData.code !== 'Ok' || !mainRouteData.routes.length) {
        throw new Error('Could not calculate route');
      }

      // Transform OSRM results into our RouteOption format
      const options: RouteOption[] = mainRouteData.routes.slice(0, 2).map((route: { distance: number; duration: number; legs: any[] }, index: number) => {
        const distanceInKm = route.distance / 1000;
        const durationInMinutes = route.duration / 60;
        const fuelConsumption = (distanceInKm * 10) / 100; // Assuming 10L/100km
        const fuelCost = fuelConsumption * 250; // PKR 250 per liter

        // Filter and process steps to get meaningful stops
        const allSteps = route.legs[0].steps;
        const significantSteps = allSteps.filter((step: any, i: number) => {
          // Keep steps that are major turns or have significant distance
          const isSignificantDistance = step.distance > 5000; // More than 5km
          const isImportantManeuver = step.maneuver?.type === 'turn' || 
                                    step.maneuver?.type === 'merge' ||
                                    step.maneuver?.type === 'motorway';
          const isEveryFifthStep = i % 5 === 0; // Take every 5th step for long routes
          return isSignificantDistance || isImportantManeuver || isEveryFifthStep;
        });

        // Limit to maximum 5 intermediate stops
        const limitedSteps = significantSteps.slice(0, 5);

        // Calculate cumulative distances and durations
        let cumulativeDistance = 0;
        let cumulativeDuration = 0;

        const stops = [
          {
            name: pickupData[0].display_name.split(',')[0],
            distance: 0,
            duration: 0,
            traffic: 'Low',
            weather: 'Clear'
          },
          ...limitedSteps.map((step: any) => {
            cumulativeDistance += step.distance / 1000;
            cumulativeDuration += step.duration / 60;
            
            // Get a meaningful name for the stop
            const locationName = step.name || 
              (step.maneuver?.location ? `Major Junction at ${step.maneuver.location[1].toFixed(3)}°N, ${step.maneuver.location[0].toFixed(3)}°E` : 
              'Major Waypoint');

            return {
              name: locationName,
              distance: cumulativeDistance,
              duration: cumulativeDuration,
              traffic: Math.random() > 0.7 ? 'Medium' : 'Low', // Randomize traffic for variety
              weather: 'Clear'
            };
          }),
          {
            name: deliveryData[0].display_name.split(',')[0],
            distance: distanceInKm,
            duration: durationInMinutes,
            traffic: 'Low',
            weather: 'Clear'
          }
        ];

        return {
          id: index + 1,
          name: index === 0 ? "Primary Route" : "Alternative Route",
          description: index === 0 ? 
            "Recommended route based on distance and time" : 
            "Alternative route with different path",
          distance: distanceInKm,
          duration: durationInMinutes,
          fuelConsumption,
          stops,
          totalFuelCost: fuelCost,
          roadType: index === 0 ? "Primary roads" : "Secondary roads",
          advantages: index === 0 ?
            ["Shortest distance", "Optimal path", "Main roads"] :
            ["Alternative path", "Less traffic", "Backup option"],
          disadvantages: index === 0 ?
            ["May have tolls", "Peak hour traffic", "Popular route"] :
            ["Longer distance", "More turns", "Secondary roads"]
        };
      });

      setRouteOptions(options);
    } catch (error) {
      console.error('Error calculating routes:', error);
      setMapError(error instanceof Error ? error.message : 'Failed to calculate routes');
      toast.error('Failed to calculate route options');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleOptimizeRoute = async (delivery: Delivery) => {
    const pickup = delivery.delivery_stops?.find(stop => stop.stop_type === 'pickup')?.address || '';
    const deliveryAddress = delivery.delivery_stops?.find(stop => stop.stop_type === 'delivery')?.address || '';

    if (!pickup || !deliveryAddress) {
      toast.error('Missing pickup or delivery address');
      return;
    }

    setSelectedDelivery(delivery);
    setShowRouteDialog(true);
    calculateRouteOptions(pickup, deliveryAddress);
  };

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
    toast.success(`Selected route: ${route.name}`);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!selectedCourier || !deliveryType) {
          toast.error('Please select a courier and delivery type');
          return false;
        }
        return true;

      case 2:
        if (!deliveryFormData.source_warehouse_id) {
          toast.error('Please select a source warehouse');
          return false;
        }
        if (deliveryType === 'warehouse' && !deliveryFormData.destination_warehouse_id) {
          toast.error('Please select a destination warehouse');
          return false;
        }
        if (deliveryType === 'client' && !deliveryFormData.client_address) {
          toast.error('Please enter a client delivery address');
          return false;
        }
        return true;

      case 3:
        if (selectedProducts.length === 0) {
          toast.error('Please select at least one product');
          return false;
        }
        return true;

      case 4:
        if (!selectedRoute) {
          toast.error('Please calculate and select a route');
          return false;
        }
        return true;

      case 5:
        if (!deliveryFormData.pickup_time) {
          toast.error('Please select a pickup time');
          return false;
        }
        if (!deliveryFormData.priority) {
          toast.error('Please select a priority level');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handlePodUpload = async (deliveryId: string, file: File) => {
    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${deliveryId}-pod.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabaseClient
        .storage
        .from('pod_files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabaseClient
        .storage
        .from('pod_files')
        .getPublicUrl(fileName);

      // Update delivery record with POD file URL
      const { error: updateError } = await supabaseClient
        .from('deliveries')
        .update({ 
          pod_file: publicUrl,
          status: 'completed'
        })
        .eq('id', deliveryId);

      if (updateError) throw updateError;

      // Update local state
      setDeliveries(prevDeliveries =>
        prevDeliveries.map(delivery =>
          delivery.id === deliveryId
            ? { ...delivery, pod_file: publicUrl, status: 'completed' }
            : delivery
        )
      );

      toast.success('POD uploaded and delivery marked as completed');
    } catch (error) {
      console.error('Error uploading POD:', error);
      toast.error('Failed to upload POD');
    }
  };

  return (
    <AnimatedGradientBackground className="min-h-screen">
      <AIParticleEffect particleColor="#3456FF" density="low" />
      
      <div className="container mx-auto p-4 space-y-6 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-96 bg-gradient-to-bl from-[#3456FF]/5 to-[#8763FF]/5 rounded-bl-full -z-10 opacity-70"></div>
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
              Courier Management
            </h1>
            <p className="text-gray-500 mt-1 font-sans">Manage your delivery personnel and assign new deliveries</p>
          </div>
        <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-[#3456FF] to-[#8763FF] hover:opacity-90 transition-all shadow-md font-medium"
            >
              <div className="absolute inset-0 overflow-hidden rounded-md">
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-shimmer" />
              </div>
              <Plus className="w-4 h-4 mr-2" /> Add Courier
          </Button>
            <Button 
              onClick={() => setShowAssignDeliveryDialog(true)} 
              className="bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 shadow-sm font-medium transition-all hover:border-[#3456FF]/30"
            >
              <Truck className="w-4 h-4 mr-2 text-[#3456FF]" /> Assign Delivery
          </Button>
        </div>
      </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card border border-gray-200 shadow-sm rounded-xl p-4 relative overflow-hidden">
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-50"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-sans">Total Couriers</p>
                <p className="text-2xl font-semibold font-heading">{couriers.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#3456FF]/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#3456FF]" />
              </div>
            </div>
          </div>
          
          <div className="glass-card border border-gray-200 shadow-sm rounded-xl p-4 relative overflow-hidden">
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-50"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-sans">Active Deliveries</p>
                <p className="text-2xl font-semibold font-heading">{deliveries.filter(d => d.status === 'pending' || d.status === 'in_progress').length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#3456FF]/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#3456FF]" />
              </div>
            </div>
          </div>
          
          <div className="glass-card border border-gray-200 shadow-sm rounded-xl p-4 relative overflow-hidden">
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-50"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-sans">Completed</p>
                <p className="text-2xl font-semibold font-heading">{deliveries.filter(d => d.status === 'completed').length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#3456FF]/10 flex items-center justify-center">
                <Boxes className="w-5 h-5 text-[#3456FF]" />
              </div>
            </div>
          </div>
          
          <div className="glass-card border border-gray-200 shadow-sm rounded-xl p-4 relative overflow-hidden">
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-50"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-sans">Priority Deliveries</p>
                <p className="text-2xl font-semibold font-heading">{deliveries.filter(d => d.priority === 'high').length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#3456FF]/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#3456FF]" />
              </div>
            </div>
        </div>
      </div>

      {/* Couriers Table */}
        <div className="card-gradient glass-card rounded-xl border border-gray-200 shadow-md p-5 overflow-hidden relative">
          {/* Background patterns */}
          <div className="absolute inset-0 bg-circuit-pattern opacity-5 pointer-events-none"></div>
          
          <h2 className="text-xl font-heading font-semibold flex items-center mb-4">
            <span className="w-1.5 h-5 bg-gradient-to-b from-[#3456FF] to-[#8763FF] rounded-full mr-2"></span>
            <span className="bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
              Couriers
            </span>
          </h2>
          
          <div className="overflow-x-auto">
        <Table>
              <TableHeader className="bg-gray-50/80 backdrop-blur-sm">
            <TableRow>
                  <TableHead className="font-semibold text-gray-700 font-heading">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700 font-heading">Email</TableHead>
                  <TableHead className="font-semibold text-gray-700 font-heading">Phone</TableHead>
                  <TableHead className="font-semibold text-gray-700 font-heading">Vehicle</TableHead>
                  <TableHead className="font-semibold text-gray-700 font-heading">Region</TableHead>
                  <TableHead className="font-semibold text-gray-700 font-heading">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 font-heading">Deliveries</TableHead>
                  <TableHead className="font-semibold text-gray-700 font-heading">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isTableLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#3456FF]/10 to-[#8763FF]/10 flex items-center justify-center animate-pulse-slow">
                          <Truck className="h-8 w-8 text-[#3456FF]" />
                        </div>
                        <p className="font-sans text-gray-500">Loading couriers...</p>
                      </div>
                </TableCell>
              </TableRow>
            ) : couriers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#3456FF]/10 to-[#8763FF]/10 flex items-center justify-center">
                          <Truck className="h-10 w-10 text-[#3456FF]" />
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3456FF]/0 via-[#3456FF]/30 to-[#3456FF]/0 rounded-full opacity-50 animate-scan"></div>
                        </div>
                        <p className="font-sans text-lg text-gray-600">No couriers found</p>
                        <p className="font-sans text-sm text-gray-500 max-w-md text-center">Add your first courier using the button above</p>
                      </div>
                </TableCell>
              </TableRow>
            ) : (
              couriers.map((courier) => (
                    <TableRow key={courier.id} className="hover:bg-gray-50/70 backdrop-blur-sm transition-colors group">
                      <TableCell className="font-medium font-sans group-hover:text-[#3456FF] transition-colors">
                        {courier.name}
                      </TableCell>
                      <TableCell className="font-sans">{courier.email}</TableCell>
                      <TableCell className="font-sans">{courier.phone}</TableCell>
                      <TableCell className="font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#3456FF]"></span>
                          {courier.vehicle_type} 
                          <span className="text-xs text-gray-500 ml-1 font-mono">
                            ({courier.vehicle_registration})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-sans">{courier.assigned_region}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        courier.status === 'active' ? 'success' : 
                        courier.status === 'delayed' ? 'warning' : 'secondary'
                      }
                          className={
                            courier.status === 'active' 
                              ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200' 
                              : courier.status === 'delayed'
                                ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200'
                                : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200'
                          }
                        >
                          <span className="relative flex h-2 w-2 mr-1.5">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                              courier.status === 'active' ? 'bg-green-400' : 
                              courier.status === 'delayed' ? 'bg-amber-400' : 'bg-gray-400'
                            } opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${
                              courier.status === 'active' ? 'bg-green-500' : 
                              courier.status === 'delayed' ? 'bg-amber-500' : 'bg-gray-500'
                            }`}></span>
                          </span>
                          <span className="font-sans">{courier.status}</span>
                    </Badge>
                  </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-mono text-sm">{courier.deliveries_completed}</span>
                          {courier.deliveries_completed > 10 && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200 text-xs">Pro</Badge>
                          )}
                        </div>
                      </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-[#3456FF] hover:bg-[#3456FF]/5 transition-colors"
                          >
                        <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                      </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                        <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
          </div>
      </div>

      {/* Assigned Deliveries Table */}
      <div className="space-y-4">
          <h2 className="text-xl font-heading font-semibold flex items-center">
            <span className="w-1.5 h-5 bg-gradient-to-b from-[#3456FF] to-[#8763FF] rounded-full mr-2"></span>
            <span className="bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
              Assigned Deliveries
            </span>
          </h2>
          
          <div className="card-gradient glass-card rounded-xl border border-gray-200 shadow-md p-5 overflow-hidden relative">
            {/* Background patterns */}
            <div className="absolute inset-0 bg-circuit-pattern opacity-5 pointer-events-none"></div>
            
            <div className="overflow-x-auto">
          <Table>
                <TableHeader className="bg-gray-50/80 backdrop-blur-sm">
              <TableRow>
                    <TableHead className="font-semibold text-gray-700 font-heading">Package ID</TableHead>
                    <TableHead className="font-semibold text-gray-700 font-heading">Courier</TableHead>
                    <TableHead className="font-semibold text-gray-700 font-heading">Priority</TableHead>
                    <TableHead className="font-semibold text-gray-700 font-heading">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 font-heading">Pickup</TableHead>
                    <TableHead className="font-semibold text-gray-700 font-heading">Delivery</TableHead>
                    <TableHead className="font-semibold text-gray-700 font-heading">Shipping Label</TableHead>
                    <TableHead className="font-semibold text-gray-700 font-heading">Route Details</TableHead>
                    <TableHead className="font-semibold text-gray-700 font-heading">Created At</TableHead>
                    <TableHead className="font-semibold text-gray-700 font-heading">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isDeliveriesLoading ? (
                <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#3456FF]/10 to-[#8763FF]/10 flex items-center justify-center animate-pulse-slow">
                            <Package className="h-8 w-8 text-[#3456FF]" />
                          </div>
                          <p className="font-sans text-gray-500">Loading deliveries...</p>
                        </div>
                  </TableCell>
                </TableRow>
              ) : deliveries.length === 0 ? (
                <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#3456FF]/10 to-[#8763FF]/10 flex items-center justify-center">
                            <Package className="h-10 w-10 text-[#3456FF]" />
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3456FF]/0 via-[#3456FF]/30 to-[#3456FF]/0 rounded-full opacity-50 animate-scan"></div>
                          </div>
                          <p className="font-sans text-lg text-gray-600">No deliveries found</p>
                          <p className="font-sans text-sm text-gray-500 max-w-md text-center">
                            Assign your first delivery using the "Assign Delivery" button
                          </p>
                        </div>
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                      <TableRow key={delivery.id} className="hover:bg-gray-50/70 backdrop-blur-sm transition-colors group">
                        <TableCell className="font-mono text-xs">{delivery.package_id}</TableCell>
                        <TableCell className="font-sans">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#3456FF]"></span>
                            {delivery.courier?.name} 
                            <span className="text-xs text-gray-500 ml-1">
                              ({delivery.courier?.vehicle_type})
                            </span>
                          </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        delivery.priority === 'high' ? 'destructive' :
                        delivery.priority === 'medium' ? 'warning' : 'default'
                          }
                          className={
                            delivery.priority === 'high' 
                              ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200' 
                              : delivery.priority === 'medium'
                                ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200'
                                : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200'
                      }>
                        {delivery.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        delivery.status === 'completed' ? 'success' :
                        delivery.status === 'in_progress' ? 'warning' :
                        delivery.status === 'failed' ? 'destructive' : 'default'
                          }
                          className={
                            delivery.status === 'completed' 
                              ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200' 
                              : delivery.status === 'in_progress'
                                ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200'
                                : delivery.status === 'failed'
                                  ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200'
                                  : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200'
                      }>
                        {delivery.status}
                      </Badge>
                    </TableCell>
                        <TableCell className="font-sans text-sm max-w-[150px] truncate" title={delivery.delivery_stops?.find(stop => stop.stop_type === 'pickup')?.address || ''}>
                      {delivery.delivery_stops?.find(stop => stop.stop_type === 'pickup')?.address}
                    </TableCell>
                        <TableCell className="font-sans text-sm max-w-[150px] truncate" title={delivery.delivery_stops?.find(stop => stop.stop_type === 'delivery')?.address || ''}>
                      {delivery.delivery_stops?.find(stop => stop.stop_type === 'delivery')?.address}
                    </TableCell>
                    <TableCell>
                      {delivery.shipping_label ? (
                        <div className="space-y-2">
                          <div className="flex flex-col gap-1">
                                <div className="text-sm font-sans">
                              <span className="font-medium">Products:</span> {delivery.products?.length || 0}
                            </div>
                                <div className="text-sm font-sans">
                              <span className="font-medium">Total Weight:</span> {delivery.shipping_label.totalWeight}kg
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="bg-white border-[#3456FF]/30 text-[#3456FF] hover:bg-[#3456FF]/5 transition-all text-xs">
                                  View Label
                                </Button>
                              </DialogTrigger>
                                  <DialogContent className="max-w-[600px] max-h-[80vh] overflow-y-auto glass-card border-gray-200">
                                    <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-30"></div>
                                <DialogHeader>
                                      <DialogTitle className="text-xl font-heading font-bold bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
                                        Shipping Label
                                      </DialogTitle>
                                </DialogHeader>
                                    {/* Label content remains the same */}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {delivery.optimized_route ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-2 text-green-600 mb-2">
                            <Map className="h-4 w-4" />
                            <p className="font-medium">Route Stops:</p>
                          </div>
                          <div className="space-y-1.5">
                            {delivery.optimized_route.stops?.map((stop: any, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs 
                                  ${index === 0 ? 'bg-blue-100 text-blue-600' : 
                                    index === delivery.optimized_route.stops.length - 1 ? 'bg-green-100 text-green-600' : 
                                    'bg-gray-100 text-gray-600'}`}>
                                  {index + 1}
                                </div>
                                    <div className="flex-1 truncate text-gray-600">
                                  {stop.name}
                                      {index === 0 && <span className="text-blue-600 ml-1">(Start)</span>}
                                      {index === delivery.optimized_route.stops.length - 1 && <span className="text-green-600 ml-1">(End)</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Map className="h-4 w-4" />
                          <span>Not optimized</span>
                        </div>
                      )}
                    </TableCell>
                        <TableCell className="font-sans text-sm whitespace-nowrap">
                      {new Date(delivery.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {delivery.status !== 'completed' && (
                            <div className="flex gap-2 flex-col">
                          {!delivery.optimized_route && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOptimizeRoute(delivery)}
                                  className="h-8 text-xs text-[#3456FF] hover:bg-[#3456FF]/5 transition-all"
                            >
                              <Map className="h-4 w-4 mr-2" />
                              Optimize Route
                            </Button>
                          )}
                          
                          {delivery.all_stops_completed && !delivery.pod_file && (
                            <div className="flex items-center">
                              <Label htmlFor={`pod-${delivery.id}`} className="cursor-pointer">
                                <Input
                                  id={`pod-${delivery.id}`}
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handlePodUpload(delivery.id, file);
                                    }
                                  }}
                                />
                                    <Badge variant="outline" className="bg-yellow-50 hover:bg-yellow-100 cursor-pointer border-yellow-200 text-yellow-800">
                                      Upload POD
                                </Badge>
                              </Label>
                            </div>
                          )}
                          
                          {!delivery.all_stops_completed && (
                                <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600">
                                  Complete All Stops
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {delivery.status === 'completed' && delivery.pod_file && (
                        <div className="flex items-center gap-2">
                              <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
                          <a 
                            href={delivery.pod_file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            View POD
                          </a>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
            </div>
        </div>
      </div>

      {/* Add Courier Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleDialogChange}>
          <DialogContent className="sm:max-w-[600px] glass-card border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-50"></div>
            <div className="absolute -z-10 top-0 right-0 w-1/3 h-1/2 bg-gradient-to-bl from-[#3456FF]/10 to-transparent blur-xl"></div>
            
          <DialogHeader>
              <DialogTitle className="text-xl font-heading font-bold bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
                Add New Courier
              </DialogTitle>
          </DialogHeader>
            
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information Section */}
            <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <span className="w-1 h-4 bg-gradient-to-b from-[#3456FF] to-[#8763FF] rounded-full mr-2"></span>
                  <span className="font-heading">Personal Information</span>
                </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="font-sans text-gray-700">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                      className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Information Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_type">Vehicle Type</Label>
                  <Input
                    id="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle_type: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_registration">Registration</Label>
                  <Input
                    id="vehicle_registration"
                    value={formData.vehicle_registration}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle_registration: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_capacity">Max Capacity (packages)</Label>
                  <Input
                    id="max_capacity"
                    type="number"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_capacity: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Zone Information Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Zone Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assigned_region">Assigned Region</Label>
                  <Input
                    id="assigned_region"
                    value={formData.assigned_region}
                    onChange={(e) => setFormData(prev => ({ ...prev, assigned_region: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_zone">Default Zone</Label>
                  <Input
                    id="default_zone"
                    value={formData.default_zone}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_zone: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleDialogChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Courier'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Delivery Dialog */}
      <Dialog 
        open={showAssignDeliveryDialog} 
        onOpenChange={(open) => {
          if (!open) {
            resetDeliveryForm();
            setSelectedRoute(null);
          }
          setShowAssignDeliveryDialog(open);
        }}
      >
          <DialogContent className="sm:max-w-[500px] glass-card border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-50"></div>
            <div className="absolute -z-10 top-0 right-0 w-1/3 h-1/2 bg-gradient-to-bl from-[#3456FF]/10 to-transparent blur-xl"></div>
            
          <DialogHeader>
              <DialogTitle className="text-xl font-heading font-bold bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
                Assign Delivery - Step {deliveryStep} of 5
              </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAssignDelivery} className="space-y-4">
            {/* Step 1: Delivery Type and Courier */}
            {deliveryStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="font-sans text-gray-700">Delivery Type</Label>
                  <select
                      className="w-full p-2 border rounded-md border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as 'warehouse' | 'client')}
                    required
                  >
                    <option value="warehouse">Warehouse to Warehouse</option>
                    <option value="client">Warehouse to Client Address</option>
                  </select>
                </div>

                <div className="space-y-2">
                    <Label className="font-sans text-gray-700">Select Courier</Label>
                  <select
                      className="w-full p-2 border rounded-md border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                    value={selectedCourier}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                    required
                  >
                    <option value="">Select a courier</option>
                    {couriers.map((courier) => (
                      <option key={courier.id} value={courier.id}>
                        {courier.name} - {courier.vehicle_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Location Details */}
            {deliveryStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="font-sans text-gray-700">Source Warehouse</Label>
                  <select
                      className="w-full p-2 border rounded-md border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                    value={deliveryFormData.source_warehouse_id}
                    onChange={(e) => handleSourceWarehouseChange(e.target.value)}
                    required
                  >
                    <option value="">Select source warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} - {warehouse.location}
                      </option>
                    ))}
                  </select>
                </div>

                {deliveryType === 'warehouse' ? (
                  <div className="space-y-2">
                      <Label className="font-sans text-gray-700">Destination Warehouse</Label>
                    <select
                        className="w-full p-2 border rounded-md border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                      value={deliveryFormData.destination_warehouse_id}
                      onChange={(e) => setDeliveryFormData(prev => ({ ...prev, destination_warehouse_id: e.target.value }))}
                      required
                    >
                      <option value="">Select destination warehouse</option>
                      {warehouses
                        .filter(w => w.id !== deliveryFormData.source_warehouse_id)
                        .map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} - {warehouse.location}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                      <Label className="font-sans text-gray-700">Client Delivery Address</Label>
                    <Input
                      value={deliveryFormData.client_address}
                      onChange={(e) => setDeliveryFormData(prev => ({ ...prev, client_address: e.target.value }))}
                      placeholder="Enter delivery address"
                      required
                        className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Products */}
            {deliveryStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="font-sans text-gray-700">Select Products from Warehouse</Label>
                  {warehouseProducts.length === 0 ? (
                      <p className="text-sm text-gray-500 font-sans">No products available in selected warehouse</p>
                  ) : (
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {warehouseProducts.map((product) => (
                          <div key={product.product_id} className="flex items-center gap-4 p-3 border rounded-md bg-white border-gray-200 hover:border-[#3456FF]/30 hover:bg-[#3456FF]/5 transition-colors">
                          <div className="flex-grow">
                              <p className="font-medium font-sans">{product.name}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 text-xs">SKU: {product.sku}</Badge>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">Available: {product.quantity}</Badge>
                            {product.category && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">Category: {product.category}</Badge>
                            )}
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                                className="w-24 border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                              placeholder="Qty"
                              min="1"
                              max={product.quantity}
                              value={selectedProducts.find(p => p.product_id === product.product_id)?.quantity || ''}
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value);
                                if (quantity > 0 && quantity <= product.quantity) {
                                  const newSelectedProducts = selectedProducts.filter(p => p.product_id !== product.product_id);
                                  if (quantity > 0) {
                                    newSelectedProducts.push({
                                      product_id: product.product_id,
                                      name: product.name,
                                      quantity: quantity,
                                      dimensions: product.dimensions,
                                      weight: product.weight
                                    });
                                  }
                                  setSelectedProducts(newSelectedProducts);
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Route Optimization */}
            {deliveryStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="font-sans text-gray-700">Route Optimization</Label>
                    <div className="p-4 border rounded-md max-h-[400px] overflow-y-auto border-gray-200 bg-white/80">
                    {isCalculatingRoute ? (
                        <div className="text-center py-6">
                          <div className="relative w-16 h-16 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3456FF] to-[#8763FF] opacity-20 animate-ping"></div>
                            <div className="relative flex items-center justify-center w-full h-full rounded-full border-2 border-[#3456FF]/50 border-t-[#3456FF] animate-spin"></div>
                            <div className="absolute inset-[20%] rounded-full bg-white flex items-center justify-center">
                              <Map className="w-8 h-8 text-[#3456FF]" />
                            </div>
                          </div>
                          <p className="text-sm font-heading text-gray-800">Calculating optimal routes...</p>
                          <p className="text-xs font-sans text-gray-500 mt-1">This may take a few moments</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {routeOptions.length === 0 ? (
                          <Button
                            type="button"
                            onClick={() => {
                              const pickup = deliveryFormData.source_warehouse_id 
                                ? warehouses.find(w => w.id === deliveryFormData.source_warehouse_id)?.location 
                                : '';
                              const delivery = deliveryType === 'warehouse'
                                ? warehouses.find(w => w.id === deliveryFormData.destination_warehouse_id)?.location
                                : deliveryFormData.client_address;
                              
                              if (!pickup || !delivery) {
                                toast.error('Missing pickup or delivery location');
                                return;
                              }
                              
                              calculateRouteOptions(pickup, delivery);
                            }}
                              className="w-full bg-gradient-to-r from-[#3456FF] to-[#8763FF] hover:opacity-90 transition-all shadow-md font-medium"
                          >
                              <div className="absolute inset-0 overflow-hidden rounded-md">
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-shimmer" />
                              </div>
                            Calculate Routes
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            {routeOptions.map((route, index) => (
                              <div 
                                key={index}
                                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                    selectedRoute?.id === route.id ? 'border-[#3456FF] bg-[#3456FF]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleRouteSelect(route)}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                      <p className="font-medium font-heading text-gray-800">{route.name}</p>
                                      <p className="text-xs text-gray-600 font-sans">{route.description}</p>
                                  </div>
                                  {route.id === 1 && (
                                      <Badge className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200 text-xs">Recommended</Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-4 gap-2 text-xs mb-2 bg-gray-50 p-2 rounded">
                                  <div>
                                      <p className="text-gray-500 font-sans">Distance</p>
                                      <p className="font-medium font-mono">{route.distance.toFixed(1)} km</p>
                                  </div>
                                  <div>
                                      <p className="text-gray-500 font-sans">Duration</p>
                                      <p className="font-medium font-mono">{route.duration.toFixed(0)} min</p>
                                  </div>
                                  <div>
                                      <p className="text-gray-500 font-sans">Fuel</p>
                                      <p className="font-medium font-mono">{route.fuelConsumption.toFixed(1)}L</p>
                                  </div>
                                  <div>
                                      <p className="text-gray-500 font-sans">Cost</p>
                                      <p className="font-medium font-mono">₨{route.totalFuelCost.toFixed(0)}</p>
                                  </div>
                                </div>

                                  <div className="text-xs space-y-1 bg-white p-2 rounded border border-gray-100">
                                    <div className="flex items-center gap-1 text-[#3456FF]">
                                    <Map className="h-3 w-3" />
                                      <p className="font-medium font-sans">Stops:</p>
                                  </div>
                                  <div className="space-y-1 ml-4">
                                    {route.stops.map((stop, stopIndex) => (
                                      <div key={stopIndex} className="flex items-center gap-1">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center 
                                          ${stopIndex === 0 ? 'bg-blue-100 text-blue-600' : 
                                            stopIndex === route.stops.length - 1 ? 'bg-green-100 text-green-600' : 
                                            'bg-gray-100 text-gray-600'}`}
                                        >
                                          {stopIndex + 1}
                                        </div>
                                          <div className="flex-1 truncate font-sans">
                                          {stop.name}
                                            {stopIndex === 0 && <span className="text-blue-600 ml-1 text-[10px]">(Start)</span>}
                                            {stopIndex === route.stops.length - 1 && <span className="text-green-600 ml-1 text-[10px]">(End)</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setRouteOptions([]);
                                setSelectedRoute(null);
                              }}
                                className="w-full mt-2 border-gray-200 hover:bg-gray-50 font-sans"
                            >
                              Recalculate Routes
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Delivery Details */}
            {deliveryStep === 5 && (
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="font-sans text-gray-700">Priority</Label>
                  <select
                      className="w-full p-2 border rounded-md border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                    value={deliveryFormData.priority}
                    onChange={(e) => setDeliveryFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-2">
                    <Label className="font-sans text-gray-700">Pickup Time</Label>
                  <Input
                    type="datetime-local"
                    value={deliveryFormData.pickup_time}
                    onChange={(e) => setDeliveryFormData(prev => ({ ...prev, pickup_time: e.target.value }))}
                    required
                      className="border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                  />
                </div>

                <div className="space-y-2">
                    <Label className="font-sans text-gray-700">Notes (Optional)</Label>
                  <textarea
                      className="w-full p-2 border rounded-md border-gray-300 focus:border-[#3456FF] focus:ring focus:ring-[#3456FF]/10 font-sans transition-all"
                    value={deliveryFormData.notes}
                    onChange={(e) => setDeliveryFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    placeholder="Add any special instructions"
                  />
                </div>

                  {selectedProducts.length > 0 && (
                    <div className="p-3 border rounded-md bg-gray-50/80 border-gray-200 mt-2">
                      <h4 className="text-sm font-medium font-sans text-gray-700 mb-2">Selected Products Summary:</h4>
                      <div className="max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                        {selectedProducts.map((product, idx) => (
                          <div key={idx} className="flex justify-between text-xs p-1.5 bg-white rounded mb-1 border border-gray-100">
                            <span className="font-medium font-sans">{product.name}</span>
                            <Badge className="bg-[#3456FF]/10 text-[#3456FF] border-[#3456FF]/20">
                              {product.quantity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

              <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (deliveryStep === 1) {
                    setShowAssignDeliveryDialog(false);
                    resetDeliveryForm();
                  } else {
                    setDeliveryStep(prev => prev - 1);
                  }
                }}
                  className="bg-white border-gray-200 hover:bg-gray-50 font-sans"
              >
                {deliveryStep === 1 ? 'Cancel' : 'Back'}
              </Button>

              {deliveryStep < 5 ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (validateStep(deliveryStep)) {
                      setDeliveryStep(prev => prev + 1);
                    }
                  }}
                    className="bg-gradient-to-r from-[#3456FF] to-[#8763FF] hover:opacity-90 transition-all shadow-md font-medium"
                >
                    <div className="absolute inset-0 overflow-hidden rounded-md">
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-shimmer" />
                    </div>
                  Next
                </Button>
              ) : (
                  <Button 
                    type="submit" 
                    disabled={isLoading || !validateStep(5)}
                    className="bg-gradient-to-r from-[#3456FF] to-[#8763FF] hover:opacity-90 transition-all shadow-md font-medium"
                  >
                    <div className="absolute inset-0 overflow-hidden rounded-md">
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-shimmer" />
                    </div>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Assigning...</span>
                      </div>
                    ) : 'Assign Delivery'}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-[500px] glass-card border-gray-200">
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-50"></div>
            
          <DialogHeader>
              <DialogTitle className="text-xl font-heading font-bold bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
                Delivery Assigned Successfully
              </DialogTitle>
          </DialogHeader>
            
          <div className="space-y-4">
              <div className="p-4 rounded-lg border border-gray-200 bg-white/80 relative">
                <div className="absolute -z-5 top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-[#3456FF]/5 to-transparent rounded-tr-lg rounded-br-lg"></div>
                <h3 className="font-medium font-heading flex items-center text-gray-800">
                  <span className="w-1 h-4 bg-gradient-to-b from-[#3456FF] to-[#8763FF] rounded-full mr-2"></span>
                  Delivery Details
                </h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
                    <p className="text-sm text-gray-500 font-sans">Package ID:</p>
                    <p className="font-mono text-sm">{lastDeliveryDetails?.package_id}</p>
            </div>
            <div>
                    <p className="text-sm text-gray-500 font-sans">Priority:</p>
                    <Badge variant={
                      lastDeliveryDetails?.priority === 'high' ? 'destructive' :
                      lastDeliveryDetails?.priority === 'medium' ? 'warning' : 'default'
                    }
                    className={
                      lastDeliveryDetails?.priority === 'high' 
                        ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200' 
                        : lastDeliveryDetails?.priority === 'medium'
                          ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200'
                          : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200'
                    }>
                      {lastDeliveryDetails?.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-sans">Status:</p>
                    <Badge variant={
                      lastDeliveryDetails?.status === 'completed' ? 'success' :
                      lastDeliveryDetails?.status === 'in_progress' ? 'warning' :
                      lastDeliveryDetails?.status === 'failed' ? 'destructive' : 'default'
                    }
                    className={
                      lastDeliveryDetails?.status === 'completed' 
                        ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200' 
                        : lastDeliveryDetails?.status === 'in_progress'
                          ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200'
                          : lastDeliveryDetails?.status === 'failed'
                            ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200'
                            : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200'
                    }>
                      {lastDeliveryDetails?.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                <h3 className="font-medium font-heading flex items-center text-gray-800 sticky top-0 bg-white z-10 py-1">
                  <span className="w-1 h-4 bg-gradient-to-b from-[#3456FF] to-[#8763FF] rounded-full mr-2"></span>
                  Selected Products
                </h3>
                <div className="space-y-2 mt-2">
                {selectedProducts.map((product, index) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50/80 rounded border border-gray-200">
                      <div className="font-sans">
                        <span className="font-medium">{product.name}</span>
                        {product.dimensions && (
                          <span className="text-xs text-gray-500 ml-2">{product.dimensions}</span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="font-sans text-sm text-gray-700 mr-2">Qty:</span>
                        <Badge className="bg-[#3456FF]/10 text-[#3456FF] border-[#3456FF]/20">
                          {product.quantity}
                        </Badge>
                      </div>
                    </div>
                  ))}
            </div>
              </div>
              
              <Button 
                onClick={() => setShowSuccessDialog(false)} 
                className="w-full bg-gradient-to-r from-[#3456FF] to-[#8763FF] hover:opacity-90 transition-all shadow-md font-medium"
              >
                <div className="absolute inset-0 overflow-hidden rounded-md">
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-shimmer" />
                </div>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Route Optimization Dialog */}
      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-4 glass-card border-gray-200">
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#3456FF]/5 via-transparent to-[#8763FF]/5 rounded-lg opacity-30"></div>
            
          <DialogHeader className="sticky top-0 bg-white pb-4 z-10">
              <DialogTitle className="text-2xl font-heading font-bold bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">
                Route Optimization
              </DialogTitle>
          </DialogHeader>
            
          <div className="space-y-4">
            {isCalculatingRoute ? (
              <div className="text-center py-8">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3456FF] to-[#8763FF] opacity-20 animate-ping"></div>
                    <div className="relative flex items-center justify-center w-full h-full rounded-full border-2 border-[#3456FF]/50 border-t-[#3456FF] animate-spin"></div>
                    <div className="absolute inset-[20%] rounded-full bg-white flex items-center justify-center">
                      <Map className="w-8 h-8 text-[#3456FF]" />
                    </div>
                  </div>
                  <p className="text-lg font-heading text-gray-800">Calculating optimal routes...</p>
                  <p className="text-sm font-sans text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : mapError ? (
              <div className="text-center py-8">
                  <div className="relative w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                    <span className="absolute -inset-0.5 bg-gradient-to-r from-red-200/0 via-red-200 to-red-200/0 rounded-full opacity-50 animate-scan"></span>
                    <Zap className="w-10 h-10 text-red-500" />
                  </div>
                  <p className="text-red-600 text-lg mb-4 font-heading">{mapError}</p>
                <Button
                  onClick={() => {
                    setMapError(null);
                    const pickup = selectedDelivery?.delivery_stops?.find(stop => stop.stop_type === 'pickup')?.address || '';
                    const delivery = selectedDelivery?.delivery_stops?.find(stop => stop.stop_type === 'delivery')?.address || '';
                    calculateRouteOptions(pickup, delivery);
                  }}
                  size="lg"
                    className="bg-gradient-to-r from-[#3456FF] to-[#8763FF] hover:opacity-90 transition-all shadow-md font-medium"
                >
                    <div className="absolute inset-0 overflow-hidden rounded-md">
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-shimmer" />
                    </div>
                  Retry Calculation
                </Button>
              </div>
            ) : (
              <>
                  <div className="bg-slate-50 p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500 font-sans">Package ID</p>
                        <p className="font-medium font-mono">{selectedDelivery?.package_id}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 font-sans">Priority</p>
                      <Badge variant={
                        selectedDelivery?.priority === 'high' ? 'destructive' :
                        selectedDelivery?.priority === 'medium' ? 'warning' : 'default'
                        } className={
                          selectedDelivery?.priority === 'high' 
                            ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200' 
                            : selectedDelivery?.priority === 'medium'
                              ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200'
                              : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200'
                      }>
                        {selectedDelivery?.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {routeOptions.map((option: RouteOption) => (
                      <div 
                        key={option.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRoute?.id === option.id ? 'border-[#3456FF] bg-[#3456FF]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleRouteSelect(option)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-medium font-heading bg-gradient-to-r from-[#3456FF] to-[#8763FF] bg-clip-text text-transparent">{option.name}</p>
                            <p className="text-sm text-gray-600 font-sans">{option.description}</p>
                          </div>
                          {option.id === 1 && (
                            <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">Recommended</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 my-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 font-sans">Distance</p>
                            <p className="font-medium font-heading text-lg">{option.distance.toFixed(1)} <span className="text-xs">km</span></p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 font-sans">Duration</p>
                            <p className="font-medium font-heading text-lg">{option.duration.toFixed(0)} <span className="text-xs">min</span></p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 font-sans">Fuel</p>
                            <p className="font-medium font-heading text-lg">{option.fuelConsumption.toFixed(1)} <span className="text-xs">L</span></p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 font-sans">Cost</p>
                            <p className="font-medium font-heading text-lg">₨{option.totalFuelCost.toFixed(0)}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-1 text-green-600 mb-3">
                            <Map className="h-4 w-4" />
                            <p className="font-medium font-heading">Route Stops:</p>
                          </div>
                          <div className="space-y-2 pl-2">
                            {option.stops.map((stop, stopIndex) => (
                              <div key={stopIndex} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs 
                                  ${stopIndex === 0 ? 'bg-blue-100 text-blue-600' : 
                                    stopIndex === option.stops.length - 1 ? 'bg-green-100 text-green-600' : 
                                    'bg-gray-100 text-gray-600'}`}
                                >
                                  {stopIndex + 1}
                                </div>
                                <div className="flex-1 font-sans">
                                  <div className="flex items-center">
                                    <span className="truncate text-gray-700">{stop.name}</span>
                                    {stopIndex === 0 && <span className="text-blue-600 text-xs ml-1">(Start)</span>}
                                    {stopIndex === option.stops.length - 1 && <span className="text-green-600 text-xs ml-1">(End)</span>}
                                  </div>
                                  {stopIndex > 0 && (
                                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                      <span>{stop.distance.toFixed(1)} km</span>
                                      <span className="mx-1">•</span>
                                      <span>{stop.duration.toFixed(0)} min</span>
                                      {stop.traffic !== 'Low' && (
                                        <>
                                          <span className="mx-1">•</span>
                                          <span className={stop.traffic === 'High' ? 'text-red-500' : 'text-amber-500'}>
                                            {stop.traffic} traffic
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {(option.advantages.length > 0 || option.disadvantages.length > 0) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {option.advantages.map((advantage, i) => (
                              <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <span className="text-green-600 mr-1">✓</span> {advantage}
                              </Badge>
                            ))}
                            {option.disadvantages.map((disadvantage, i) => (
                              <Badge key={i} variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                {disadvantage}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRouteDialog(false)}
                      className="bg-white border-gray-200 hover:bg-gray-50 font-sans"
                    >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AnimatedGradientBackground>
  );
} 