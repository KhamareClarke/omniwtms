'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, Clock, CheckCircle, MapPin, Package, AlertCircle, MessageSquare, ChevronRight, ChevronLeft, Navigation, XCircle } from 'lucide-react';
import { supabase } from '@/components/warehouses/SupabaseClient';
import L from 'leaflet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

interface CourierDelivery {
  id: string;
  courier_id: string;
  courier_name: string;
  current_location: {
    latitude: number;
    longitude: number;
    last_updated: string;
  };
  current_delivery: {
    id: string;
    pickup_address: string;
    delivery_address: string;
    status: string;
    estimated_delivery_time: string;
    priority: 'high' | 'medium' | 'low';
    pod_file?: string;
    failure_reason?: string;
  };
  stops: {
    id: string;
    address: string;
    status: 'completed' | 'pending' | 'current';
    estimated_arrival: string;
    actual_arrival?: string;
    latitude: number;
    longitude: number;
    order: number;
  }[];
  messages?: {
    id: string;
    sender: 'client' | 'courier';
    content: string;
    timestamp: string;
  }[];
}

// Update the Completed Deliveries section
const CompletedDeliveries = ({ deliveries }: { deliveries: CourierDelivery[] }) => {
  // Ensure we only show deliveries that are completed
  const completedDeliveries = deliveries.filter(d => d.current_delivery.status === 'completed');

  if (completedDeliveries.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">No completed deliveries yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {completedDeliveries.map((delivery) => (
        <Card key={delivery.id} className="bg-white">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Delivery #{delivery.current_delivery.id.slice(0, 8)}
              </CardTitle>
              <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
                Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">From</p>
                  <p className="text-sm mt-1">{delivery.current_delivery.pickup_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To</p>
                  <p className="text-sm mt-1">{delivery.current_delivery.delivery_address}</p>
                </div>
              </div>
              
              {delivery.current_delivery.pod_file && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Proof of Delivery</p>
                  <div className="border rounded-lg p-3">
                    <a
                      href={delivery.current_delivery.pod_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Package className="h-4 w-4" />
                      <span className="text-sm">View POD</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Add Failed Deliveries Component
const FailedDeliveries = ({ deliveries }: { deliveries: CourierDelivery[] }) => {
  // Ensure we only show deliveries that are failed
  const failedDeliveries = deliveries.filter(d => d.current_delivery.status === 'failed');

  if (failedDeliveries.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">No failed deliveries</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {failedDeliveries.map((delivery) => (
        <Card key={delivery.id} className="bg-white">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Delivery #{delivery.current_delivery.id.slice(0, 8)}
              </CardTitle>
              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                Failed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">From</p>
                  <p className="text-sm mt-1">{delivery.current_delivery.pickup_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To</p>
                  <p className="text-sm mt-1">{delivery.current_delivery.delivery_address}</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-sm font-medium text-red-700">Failure Reason</p>
                <p className="text-sm mt-1 text-red-600">
                  {delivery.current_delivery.failure_reason || "Delivery attempt failed"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Add Pending Deliveries Component
const PendingDeliveries = ({ deliveries }: { deliveries: CourierDelivery[] }) => {
  // Ensure we only show deliveries that are pending
  const pendingDeliveries = deliveries.filter(d => d.current_delivery.status === 'pending');

  if (pendingDeliveries.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">No pending deliveries</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingDeliveries.map((delivery) => (
        <Card key={delivery.id} className="bg-white">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Delivery #{delivery.current_delivery.id.slice(0, 8)}
              </CardTitle>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">From</p>
                  <p className="text-sm mt-1">{delivery.current_delivery.pickup_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To</p>
                  <p className="text-sm mt-1">{delivery.current_delivery.delivery_address}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-center">
                <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-700">
                  Courier not started yet
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Scheduled Delivery</p>
                <p className="text-sm mt-1">
                  {new Date(delivery.current_delivery.estimated_delivery_time).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Update the mapStyles constant with improved scrollbar styles
const mapStyles = `
  .leaflet-container {
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  .leaflet-control-container .leaflet-control {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .leaflet-control-zoom {
    border: none !important;
  }
  .leaflet-control-zoom a {
    border: none !important;
    color: #374151 !important;
  }
  .leaflet-control-zoom a:hover {
    background-color: #f3f4f6 !important;
  }

  /* Custom Scrollbar Styles */
  .scrollbar-custom {
    scrollbar-width: thin;
    scrollbar-color: #3b82f6 #e2e8f0;
    overflow-y: scroll !important;
    -webkit-overflow-scrolling: touch;
  }
  
  .scrollbar-custom::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
    display: block !important;
    background-color: #e2e8f0;
  }
  
  .scrollbar-custom::-webkit-scrollbar-track {
    background: #e2e8f0;
    border-radius: 4px;
  }
  
  .scrollbar-custom::-webkit-scrollbar-thumb {
    background-color: #3b82f6;
    border-radius: 4px;
    border: 2px solid #e2e8f0;
    min-height: 40px;
  }
  
  .scrollbar-custom::-webkit-scrollbar-thumb:hover {
    background-color: #2563eb;
  }

  /* Mobile-specific scrollbar styles */
  @media (max-width: 768px) {
    .scrollbar-custom {
      overflow-y: scroll !important;
      -webkit-overflow-scrolling: touch;
    }
    
    .scrollbar-custom::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
      display: block !important;
      background-color: #e2e8f0;
    }
    
    .scrollbar-custom::-webkit-scrollbar-thumb {
      background-color: #3b82f6;
      border: 1px solid #e2e8f0;
      min-height: 40px;
    }
  }
`;

// Custom map controls component
function MapControls({ selectedCourier, activeCouriers }: { selectedCourier: string | null, activeCouriers: CourierDelivery[] }) {
  const map = useMap();

  const fitBounds = () => {
    if (selectedCourier) {
      const courier = activeCouriers.find(c => c.id === selectedCourier);
      if (courier) {
        const bounds = L.latLngBounds([
          [courier.current_location.latitude, courier.current_location.longitude],
          ...courier.stops.map(stop => [stop.latitude, stop.longitude] as [number, number])
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      const bounds = L.latLngBounds(
        activeCouriers.flatMap(courier => [
          [courier.current_location.latitude, courier.current_location.longitude] as [number, number],
          ...courier.stops.map(stop => [stop.latitude, stop.longitude] as [number, number])
        ])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={fitBounds}
        className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="Fit to delivery"
      >
        <Navigation className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );
}

// Add this component at the top of your file, after the imports
function CourierMap({ courier }: { courier: CourierDelivery }) {
  return (
    <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={[52.4862, -1.8904]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        {/* Courier Marker */}
        <Marker
          position={[courier.current_location.latitude, courier.current_location.longitude]}
          icon={L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="relative">
                <div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>
                <div style="position: absolute; top: -8px; left: -8px; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.2); animation: pulse 2s infinite;"></div>
              </div>
              <style>
                @keyframes pulse {
                  0% { transform: scale(1); opacity: 1; }
                  100% { transform: scale(2); opacity: 0; }
                }
              </style>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })}
        >
          <Popup>
            <div className="p-3">
              <h3 className="font-bold text-gray-900">{courier.courier_name}</h3>
              <p className="text-sm text-gray-600">
                Last updated: {new Date(courier.current_location.last_updated).toLocaleTimeString()}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Stop Markers */}
        {courier.stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `
                <div class="relative">
                  <div style="background-color: ${
                    stop.status === 'completed' ? '#22c55e' :
                    stop.status === 'current' ? '#3b82f6' :
                    '#f59e0b'
                  }; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>
                  <div style="position: absolute; top: -6px; left: -6px; width: 26px; height: 26px; border-radius: 50%; background-color: ${
                    stop.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' :
                    stop.status === 'current' ? 'rgba(59, 130, 246, 0.2)' :
                    'rgba(245, 158, 11, 0.2)'
                  };"></div>
                </div>
              `,
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            })}
          >
            <Popup>
              <div className="p-3">
                <h3 className="font-bold text-gray-900">Stop {index + 1}</h3>
                <p className="text-sm text-gray-600">{stop.address}</p>
                <div className="mt-2">
                  <Badge variant={
                    stop.status === 'completed' ? 'default' :
                    stop.status === 'current' ? 'secondary' :
                    'outline'
                  } className="capitalize">
                    {stop.status}
                  </Badge>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Line */}
        <Polyline
          positions={[
            [courier.current_location.latitude, courier.current_location.longitude] as [number, number],
            ...courier.stops.map(stop => [stop.latitude, stop.longitude] as [number, number])
          ]}
          color="#3b82f6"
          weight={3}
          opacity={0.8}
        />
      </MapContainer>
    </div>
  );
}

// Delivery Failure Dialog Component
const DeliveryFailureDialog = ({ 
  delivery, 
  isOpen, 
  onClose, 
  onReportFailure 
}: { 
  delivery: CourierDelivery | null, 
  isOpen: boolean, 
  onClose: () => void,
  onReportFailure: (id: string, reason: string) => void
}) => {
  const [failureReason, setFailureReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!delivery || !failureReason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onReportFailure(delivery.id, failureReason.trim());
      onClose();
    } catch (error) {
      console.error('Error reporting failure:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset reason when dialog opens with new delivery
  useEffect(() => {
    if (isOpen && delivery) {
      setFailureReason('');
    }
  }, [isOpen, delivery]);
  
  // Add debug logging
  useEffect(() => {
    console.log("Dialog state:", { isOpen, delivery, failureReason });
  }, [isOpen, delivery, failureReason]);

  if (!delivery) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("Dialog onOpenChange called with:", open);
      if (!open) onClose();
    }}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50" />
        <DialogContent className="sm:max-w-[500px] z-[9999] bg-white fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              Report Delivery Failure
            </DialogTitle>
            <DialogDescription>
              Please provide details about why this delivery failed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Delivery Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Delivery ID</p>
                  <p className="font-medium">{delivery.current_delivery.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Courier</p>
                  <p className="font-medium">{delivery.courier_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">From</p>
                  <p className="font-medium">{delivery.current_delivery.pickup_address}</p>
                </div>
                <div>
                  <p className="text-gray-500">To</p>
                  <p className="font-medium">{delivery.current_delivery.delivery_address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="failure-reason" className="text-sm font-medium">
                Reason for Failure
              </Label>
              <Textarea
                id="failure-reason"
                placeholder="Enter the reason why the delivery failed..."
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleSubmit}
              disabled={!failureReason.trim() || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Reporting...' : 'Report Failure'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default function LiveTracking() {
  const [activeCouriers, setActiveCouriers] = useState<CourierDelivery[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageError, setMessageError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'completed' | 'failed' | 'pending'>('completed');
  const [failureDialogOpen, setFailureDialogOpen] = useState(false);
  const [selectedDeliveryForFailure, setSelectedDeliveryForFailure] = useState<CourierDelivery | null>(null);
  const { toast: uiToast } = useToast();

  // Calculate time remaining until estimated delivery
  const getTimeRemaining = (estimatedTime: string) => {
    const remaining = new Date(estimatedTime).getTime() - new Date().getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculate completion percentage
  const getCompletionPercentage = (stops: CourierDelivery['stops']) => {
    const completed = stops.filter(stop => stop.status === 'completed').length;
    return (completed / stops.length) * 100;
  };

  // Function to send message
  const sendMessage = async (courierId: string) => {
    if (!newMessage.trim()) return;

    setMessageError(null);
    try {
      console.log('Sending message:', {
        delivery_id: courierId,
        sender: 'client',
        content: newMessage.trim()
      });

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            delivery_id: courierId,
            sender: 'client',
            content: newMessage.trim(),
            timestamp: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);

      // Update local state
      setActiveCouriers(prev => prev.map(courier => {
        if (courier.id === courierId) {
          return {
            ...courier,
            messages: [
              ...(courier.messages || []),
              {
                id: data[0].id,
                sender: data[0].sender,
                content: data[0].content,
                timestamp: data[0].timestamp
              }
            ]
          };
        }
        return courier;
      }));

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessageError('Failed to send message. Please try again.');
    }
  };

  // Function to fetch messages for a delivery
  const fetchMessages = async (deliveryId: string) => {
    try {
      console.log('Fetching messages for delivery:', deliveryId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('delivery_id', deliveryId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      console.log('Fetched messages:', data);
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  // Fetch messages when courier is selected
  useEffect(() => {
    if (selectedCourier) {
      console.log('Selected courier changed, fetching messages for:', selectedCourier);
      fetchMessages(selectedCourier).then(messages => {
        console.log('Setting messages for courier:', messages);
        setActiveCouriers(prev => prev.map(courier => {
          if (courier.id === selectedCourier) {
            return { ...courier, messages };
          }
          return courier;
        }));
      });
    }
  }, [selectedCourier]);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (selectedCourier) {
      console.log('Setting up message subscription for courier:', selectedCourier);
      
      const messageSubscription = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `delivery_id=eq.${selectedCourier}`
        }, (payload) => {
          console.log('Received message update:', payload);
          if (payload.eventType === 'INSERT') {
            setActiveCouriers(prev => prev.map(courier => {
              if (courier.id === selectedCourier) {
                return {
                  ...courier,
                  messages: [
                    ...(courier.messages || []),
                    {
                      id: payload.new.id,
                      sender: payload.new.sender,
                      content: payload.new.content,
                      timestamp: payload.new.timestamp
                    }
                  ]
                };
              }
              return courier;
            }));
          }
        })
        .subscribe();

      return () => {
        console.log('Cleaning up message subscription');
        messageSubscription.unsubscribe();
      };
    }
  }, [selectedCourier, supabase]);

  // Fetch active couriers and their deliveries
  useEffect(() => {
    const fetchActiveCouriers = async () => {
      try {
        // Get current client ID from localStorage
        const currentUser = localStorage.getItem('currentUser');
        console.log('Current user from localStorage:', currentUser);
        
        if (!currentUser) {
          console.log('No user found in localStorage');
          return;
        }

        const userData = JSON.parse(currentUser);
        console.log('Parsed user data:', userData);
        
        if (!userData.id) {
          console.log('No user ID found in user data');
          return;
        }

        const clientId = userData.id;
        console.log('Fetching deliveries for client:', clientId);
      
        const { data: deliveries, error: deliveriesError } = await supabase
          .from('deliveries')
          .select(`
            id,
            status,
            courier_id,
            pod_file,
            client_id,
            notes,
            couriers!courier_id (
              id,
              name,
              current_latitude,
              current_longitude,
              last_location_update
            ),
            delivery_stops (
              id,
              address,
              status,
              estimated_arrival,
              actual_arrival,
              latitude,
              longitude,
              stop_order
            )
          `)
          .eq('client_id', clientId)
          .or('status.eq.in_progress,status.eq.completed,status.eq.failed,status.eq.pending');

        if (deliveriesError) {
          console.error('Error fetching deliveries:', deliveriesError);
          return;
        }

        console.log('Raw deliveries data:', deliveries);

        if (!deliveries || deliveries.length === 0) {
          console.log('No deliveries found for this client');
          return;
        }

        // Transform the data for our UI
        const transformedData = deliveries.map(delivery => {
          console.log('Processing delivery:', delivery);
          
          // Default coordinates for Birmingham
          const defaultLat = 52.4862;
          const defaultLng = -1.8904;
          
          // Generate coordinates for stops if they're null
          const stops = (delivery.delivery_stops || []).map((stop, index) => {
            // If coordinates are null, generate them with a small offset
            const lat = stop.latitude || (defaultLat + (index * 0.01));
            const lng = stop.longitude || (defaultLng + (index * 0.01));
            
            return {
              ...stop,
              latitude: lat,
              longitude: lng,
              stop_order: stop.stop_order || index
            };
          });

          // If courier data is null, create a default courier object
          const courierObj = delivery.couriers?.[0] || {
            id: delivery.courier_id,
            name: `Courier ${delivery.courier_id.slice(0, 8)}`,
            current_latitude: defaultLat,
            current_longitude: defaultLng,
            last_location_update: new Date().toISOString()
          };

          const pickupAddress = stops[0]?.address || 'Unknown';
          const deliveryAddress = stops[stops.length - 1]?.address || 'Unknown';

          return {
            id: delivery.id,
            courier_id: delivery.courier_id,
            courier_name: courierObj.name,
            current_location: {
              latitude: courierObj.current_latitude,
              longitude: courierObj.current_longitude,
              last_updated: courierObj.last_location_update
            },
            current_delivery: {
              id: delivery.id,
              pickup_address: pickupAddress,
              delivery_address: deliveryAddress,
              status: delivery.status,
              estimated_delivery_time: stops[stops.length - 1]?.estimated_arrival || new Date(Date.now() + 3600000).toISOString(),
              priority: 'medium' as const,
              pod_file: delivery.pod_file,
              failure_reason: delivery.notes
            },
            stops: stops.map((stop, index) => ({
              id: stop.id,
              address: stop.address,
              status: stop.status || 'pending',
              estimated_arrival: stop.estimated_arrival || new Date(Date.now() + (index + 1) * 1800000).toISOString(),
              actual_arrival: stop.actual_arrival,
              latitude: stop.latitude,
              longitude: stop.longitude,
              order: stop.stop_order
            })),
            messages: []
          };
        });

        console.log('Transformed data:', transformedData);
        setActiveCouriers(transformedData);
      } catch (error) {
        console.error('Error in fetchActiveCouriers:', error);
      }
    };

    // Initial fetch
    fetchActiveCouriers();

    // Set up real-time subscription
    const deliverySubscription = supabase
      .channel('courier-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deliveries'
      }, (payload) => {
        console.log('Received delivery update:', payload);
        fetchActiveCouriers();
      })
      .subscribe();

    return () => {
      console.log('Cleaning up delivery subscription');
      deliverySubscription.unsubscribe();
    };
  }, [supabase]);

  // Add this script to handle scroll indicators
  useEffect(() => {
    const scrollContainers = document.querySelectorAll('.scroll-area-container');
    
    const handleScroll = (container: Element) => {
      const hasScroll = container.scrollHeight > container.clientHeight;
      container.classList.toggle('has-scroll', hasScroll);
    };

    scrollContainers.forEach(container => {
      handleScroll(container);
      container.addEventListener('scroll', () => handleScroll(container));
    });

    return () => {
      scrollContainers.forEach(container => {
        container.removeEventListener('scroll', () => handleScroll(container));
      });
    };
  }, [activeCouriers]);

  // Get active (in_progress), completed, failed, and pending deliveries
  const inProgressDeliveries = activeCouriers.filter(d => d.current_delivery.status === 'in_progress');
  const completedDeliveries = activeCouriers.filter(d => d.current_delivery.status === 'completed');
  const failedDeliveries = activeCouriers.filter(d => d.current_delivery.status === 'failed');
  const pendingDeliveries = activeCouriers.filter(d => d.current_delivery.status === 'pending');

  // Function to handle reporting a delivery failure
  const handleReportFailure = async (deliveryId: string, reason: string) => {
    try {
      // Update the delivery status to failed in the database
      const { error } = await supabase
        .from('deliveries')
        .update({
          status: 'failed',
          notes: reason
        })
        .eq('id', deliveryId);

      if (error) throw error;

      // Use sonner toast instead of shadcn/ui toast
      toast.success("Delivery marked as failed");

      // Update local state
      setActiveCouriers(prev => 
        prev.map(courier => 
          courier.id === deliveryId 
            ? {
                ...courier,
                current_delivery: {
                  ...courier.current_delivery,
                  status: 'failed',
                  failure_reason: reason
                }
              }
            : courier
        )
      );

      // Switch to failed tab
      setActiveTab('failed');
    } catch (error) {
      console.error('Error reporting delivery failure:', error);
      // Use sonner toast instead of shadcn/ui toast
      toast.error("Error reporting failure. Please try again.");
    }
  };

  // Function to open the failure dialog for a specific delivery
  const openFailureDialog = (delivery: CourierDelivery) => {
    console.log("Opening failure dialog for delivery:", delivery.id);
    setSelectedDeliveryForFailure(delivery);
    setFailureDialogOpen(true);
  };

  // Show loading state
  if (activeCouriers.length === 0) {
    return (
      <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Deliveries</h2>
          <p className="text-muted-foreground">
            When a courier starts delivering or starts a route, you can see live tracking here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-gray-50 relative">
      {/* Include the failure dialog with a key to force re-render when dialog state changes */}
      <DeliveryFailureDialog
        key={`dialog-${failureDialogOpen ? 'open' : 'closed'}-${selectedDeliveryForFailure?.id || 'none'}`}
        delivery={selectedDeliveryForFailure}
        isOpen={failureDialogOpen}
        onClose={() => {
          console.log("Dialog onClose called");
          setFailureDialogOpen(false);
        }}
        onReportFailure={handleReportFailure}
      />
      
      {/* Header Section */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Live Tracking</h1>
          <p className="text-sm text-gray-600 mt-1">Monitor active deliveries in real-time</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="text-sm font-medium text-blue-700">Active</div>
              <div className="text-xl font-bold text-blue-800 mt-1">{inProgressDeliveries.length}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="text-sm font-medium text-green-700">Completed</div>
              <div className="text-xl font-bold text-green-800 mt-1">{completedDeliveries.length}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <div className="text-sm font-medium text-yellow-700">Pending</div>
              <div className="text-xl font-bold text-yellow-800 mt-1">{pendingDeliveries.length}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="text-sm font-medium text-red-700">Failed</div>
              <div className="text-xl font-bold text-red-800 mt-1">{failedDeliveries.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Courier List - Responsive sidebar */}
        <div className="w-full lg:w-[400px] bg-white border-r flex flex-col h-[calc(50vh-8rem)] lg:h-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Active Couriers</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {inProgressDeliveries.length} deliveries in progress
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-scroll scrollbar-custom">
            <div className="p-4 space-y-4">
              {inProgressDeliveries.map((courier) => (
                <Card
                  key={courier.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCourier === courier.id ? 'border-2 border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedCourier(courier.id)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Truck className="h-5 w-5 text-blue-500" />
                          {courier.courier_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={
                            courier.current_delivery.priority === 'high' ? 'destructive' :
                            courier.current_delivery.priority === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {courier.current_delivery.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {courier.stops.filter(stop => stop.status === 'completed').length} / {courier.stops.length} Stops
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Add action button */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => openFailureDialog(courier)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Mark Failed
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-4">
                      <div className="h-[200px]">
                        <CourierMap courier={courier} />
                      </div>
                      
                      {/* Progress Overview */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                          <div className="text-sm font-medium text-green-700">Done</div>
                          <div className="text-lg font-bold text-green-800 mt-1">
                            {courier.stops.filter(stop => stop.status === 'completed').length}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                          <div className="text-sm font-medium text-blue-700">Current</div>
                          <div className="text-lg font-bold text-blue-800 mt-1">
                            {courier.stops.filter(stop => stop.status === 'current').length}
                          </div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-center">
                          <div className="text-sm font-medium text-orange-700">Left</div>
                          <div className="text-lg font-bold text-orange-800 mt-1">
                            {courier.stops.filter(stop => stop.status === 'pending').length}
                          </div>
                        </div>
                      </div>

                      {/* Time and ETA */}
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="text-sm text-gray-600">Estimated Arrival</div>
                            <div className="text-sm font-medium text-gray-900">
                              {getTimeRemaining(courier.current_delivery.estimated_delivery_time)}
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={getCompletionPercentage(courier.stops)} 
                          className="w-24 h-2"
                        />
                      </div>

                      {/* Messaging Section */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">Messages</span>
                          </div>
                          <Badge variant="outline">
                            {courier.messages?.length || 0}
                          </Badge>
                        </div>
                        {messageError && (
                          <div className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded-lg">
                            {messageError}
                          </div>
                        )}
                        <div className="space-y-2 max-h-32 overflow-y-scroll scrollbar-custom">
                          {courier.messages?.length === 0 ? (
                            <div className="text-sm text-gray-500 text-center py-2">
                              No messages yet
                            </div>
                          ) : (
                            courier.messages?.map((message) => (
                              <div
                                key={message.id}
                                className={`p-2 rounded-lg ${
                                  message.sender === 'client'
                                    ? 'bg-blue-100 text-blue-900 ml-4'
                                    : 'bg-gray-100 text-gray-900 mr-4'
                                }`}
                              >
                                <div className="text-xs font-medium mb-1">
                                  {message.sender === 'client' ? 'You' : 'Courier'}
                                </div>
                                <div className="text-sm">{message.content}</div>
                                <div className="text-xs mt-1 opacity-70">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                sendMessage(courier.id);
                              }
                            }}
                            placeholder="Type your message..."
                            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => sendMessage(courier.id)}
                            disabled={!newMessage.trim()}
                            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {inProgressDeliveries.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">No active deliveries in progress</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map and Completed Deliveries Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Map Section */}
          <div className="flex-1 bg-white relative h-[calc(50vh-8rem)] lg:h-auto">
            <div className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-700" />
                  <span className="text-base font-medium text-gray-900">Live Map</span>
                </div>
                <button 
                  onClick={() => {
                    const map = document.querySelector('.leaflet-container') as HTMLElement;
                    if (map) {
                      map.requestFullscreen();
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors"
                >
                  Fullscreen
                </button>
              </div>
            </div>
            <div className="w-full h-full pt-16">
              <MapContainer
                center={[52.4862, -1.8904]}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />
                <MapControls selectedCourier={selectedCourier} activeCouriers={inProgressDeliveries} />
                
                {inProgressDeliveries.map((courier) => {
                  if (!selectedCourier || selectedCourier === courier.id) {
                    return (
                      <div key={courier.id}>
                        {/* Courier Marker */}
                        <Marker
                          position={[courier.current_location.latitude, courier.current_location.longitude]}
                          icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: `
                              <div class="relative">
                                <div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>
                                <div style="position: absolute; top: -8px; left: -8px; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.2); animation: pulse 2s infinite;"></div>
                              </div>
                              <style>
                                @keyframes pulse {
                                  0% { transform: scale(1); opacity: 1; }
                                  100% { transform: scale(2); opacity: 0; }
                                }
                              </style>
                            `,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                          })}
                        >
                          <Popup>
                            <div className="p-3">
                              <h3 className="font-bold text-gray-900">{courier.courier_name}</h3>
                              <p className="text-sm text-gray-600">
                                Last updated: {new Date(courier.current_location.last_updated).toLocaleTimeString()}
                              </p>
                              <div className="mt-2 text-sm">
                                <div className="font-medium text-gray-900">Current Delivery</div>
                                <p className="text-gray-600">{courier.current_delivery.delivery_address}</p>
                              </div>
                            </div>
                          </Popup>
                        </Marker>

                        {/* Stop Markers */}
                        {courier.stops.map((stop, index) => (
                          <Marker
                            key={stop.id}
                            position={[stop.latitude, stop.longitude]}
                            icon={L.divIcon({
                              className: 'custom-div-icon',
                              html: `
                                <div class="relative">
                                  <div style="background-color: ${
                                    stop.status === 'completed' ? '#22c55e' :
                                    stop.status === 'current' ? '#3b82f6' :
                                    '#f59e0b'
                                  }; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>
                                  <div style="position: absolute; top: -6px; left: -6px; width: 26px; height: 26px; border-radius: 50%; background-color: ${
                                    stop.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' :
                                    stop.status === 'current' ? 'rgba(59, 130, 246, 0.2)' :
                                    'rgba(245, 158, 11, 0.2)'
                                  };"></div>
                                </div>
                              `,
                              iconSize: [14, 14],
                              iconAnchor: [7, 7]
                            })}
                          >
                            <Popup>
                              <div className="p-3">
                                <h3 className="font-bold text-gray-900">Stop {index + 1}</h3>
                                <p className="text-sm text-gray-600">{stop.address}</p>
                                <div className="mt-2">
                                  <Badge variant={
                                    stop.status === 'completed' ? 'default' :
                                    stop.status === 'current' ? 'secondary' :
                                    'outline'
                                  } className="capitalize">
                                    {stop.status}
                                  </Badge>
                                  {stop.actual_arrival && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Arrived: {new Date(stop.actual_arrival).toLocaleTimeString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}

                        {/* Route Line */}
                        <Polyline
                          positions={[
                            [courier.current_location.latitude, courier.current_location.longitude] as [number, number],
                            ...courier.stops.map(stop => [stop.latitude, stop.longitude] as [number, number])
                          ]}
                          color={selectedCourier === courier.id ? "#3b82f6" : "#9ca3af"}
                          weight={selectedCourier === courier.id ? 4 : 2}
                          dashArray={selectedCourier === courier.id ? undefined : "5, 10"}
                          opacity={selectedCourier === courier.id ? 0.8 : 0.5}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </MapContainer>
            </div>
          </div>

          {/* Completed, Failed and Pending Deliveries Section */}
          <div className="bg-white border-t">
            <div className="p-4 border-b">
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-1 text-sm font-medium rounded-lg ${
                    activeTab === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Completed ({completedDeliveries.length})
                </button>
                <button 
                  onClick={() => setActiveTab('failed')}
                  className={`px-3 py-1 text-sm font-medium rounded-lg ${
                    activeTab === 'failed' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Failed ({failedDeliveries.length})
                </button>
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1 text-sm font-medium rounded-lg ${
                    activeTab === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pending ({pendingDeliveries.length})
                </button>
              </div>
            </div>
            <div className="h-[300px] overflow-y-scroll scrollbar-custom">
              <div className="p-4">
                {activeTab === 'completed' && <CompletedDeliveries deliveries={activeCouriers} />}
                {activeTab === 'failed' && <FailedDeliveries deliveries={activeCouriers} />}
                {activeTab === 'pending' && <PendingDeliveries deliveries={activeCouriers} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 