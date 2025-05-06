'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

interface Warehouse {
  name: string;
  location: string;
  capacity: number;
  manager: string;
  coordinates: [number, number];
}

interface WarehouseFormData {
  name: string;
  location: string;
  capacity: number;
  manager: string;
  coordinates: [number, number];
}

interface LocationSuggestion {
  display_name: string;
  lat: number;
  lon: number;
}

interface WarehouseFormProps {
  onSubmit: (data: WarehouseFormData) => Promise<void>;
  initialData: Warehouse | null;
  isLoading: boolean;
  locationSuggestions: LocationSuggestion[];
  onLocationChange: (location: string) => Promise<void>;
  isValidatingLocation: boolean;
}

export function WarehouseForm({ 
  onSubmit, 
  initialData, 
  isLoading,
  locationSuggestions,
  onLocationChange,
  isValidatingLocation 
}: WarehouseFormProps) {
  const defaultCoordinates: [number, number] = [51.5074, -0.1278];
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: initialData?.name || '',
    location: initialData?.location || '',
    capacity: initialData?.capacity || 0,
    manager: initialData?.manager || '',
    coordinates: Array.isArray(initialData?.coordinates) ? initialData.coordinates as [number, number] : defaultCoordinates
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a warehouse name');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Please enter a warehouse location');
      return;
    }

    if (!formData.manager.trim()) {
      toast.error('Please enter a manager name');
      return;
    }

    onSubmit({
      ...formData,
      capacity: parseInt(formData.capacity.toString())
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Warehouse name"
          required
        />
      </div>
      <div>
        <Label>Location</Label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Warehouse location"
          required
        />
      </div>
      <div>
        <Label>Capacity (units)</Label>
        <Input
          type="number"
          min="1000"
          step="1000"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
          placeholder="Warehouse capacity"
          required
        />
      </div>
      <div>
        <Label>Manager</Label>
        <Input
          value={formData.manager}
          onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
          placeholder="Warehouse manager"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Warehouse'}
      </Button>
    </form>
  );
}