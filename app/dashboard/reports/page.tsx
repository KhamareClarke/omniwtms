'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download, FileText, Package, Warehouse, Truck, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import { Progress } from "@/components/ui/progress";
import { AnimatedGradientBackground } from '@/components/ui/animated-gradient-background';
import { AIParticleEffect } from '@/components/ui/ai-particle-effect';
import { DateRange } from 'react-day-picker';

interface ReportStats {
  products: {
    total: number;
    addedToday: number;
    addedThisWeek: number;
    addedThisMonth: number;
  };
  warehouse: {
    total: number;
    totalStocks: number;
    utilization: { name: string; utilization: number }[];
  };
  deliveries: {
    total: number;
    completed: number;
    inProgress: number;
    failed: number;
    pending: number;
    daily: { date: string; count: number }[];
  };
  timeline: {
    date: string;
    activity: string;
    details: string;
    status: string;
  }[];
}

interface Warehouse {
  name?: string;
  products?: number;
  capacity?: number;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reportType, setReportType] = useState('all');
  const [stats, setStats] = useState<ReportStats>({
    products: { total: 0, addedToday: 0, addedThisWeek: 0, addedThisMonth: 0 },
    warehouse: { total: 0, totalStocks: 0, utilization: [] },
    deliveries: { total: 0, completed: 0, inProgress: 0, failed: 0, pending: 0, daily: [] },
    timeline: []
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const downloadReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      reportType,
      statistics: stats
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Activity Report', 15, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 30);

    // Add Products Statistics
    doc.setFontSize(16);
    doc.text('Products Statistics', 15, 45);
    
    let yPos = 50;
    
    autoTable(doc, {
      startY: yPos,
      theme: 'grid',
      head: [['Metric', 'Count']],
      body: [
        ['Total Products', stats.products.total.toString()],
        ['Added Today', stats.products.addedToday.toString()],
        ['Added This Week', stats.products.addedThisWeek.toString()],
        ['Added This Month', stats.products.addedThisMonth.toString()]
      ],
      margin: { left: 15 }
    });

    // Get the last Y position and add some padding
    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Add Warehouse Statistics
    doc.setFontSize(16);
    doc.text('Warehouse Statistics', 15, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      theme: 'grid',
      head: [['Metric', 'Count']],
      body: [
        ['Total Items', stats.warehouse.total.toString()],
        ['Total Stocks', stats.warehouse.totalStocks.toString()],
        ['Utilization', stats.warehouse.utilization.length.toString()]
      ],
      margin: { left: 15 }
    });

    // Update Y position for next section
    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Add Delivery Statistics
    doc.setFontSize(16);
    doc.text('Delivery Statistics', 15, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      theme: 'grid',
      head: [['Metric', 'Count']],
      body: [
        ['Total Deliveries', stats.deliveries.total.toString()],
        ['Completed', stats.deliveries.completed.toString()],
        ['In Progress', stats.deliveries.inProgress.toString()],
        ['Failed', stats.deliveries.failed.toString()],
        ['Pending', stats.deliveries.pending.toString()]
      ],
      margin: { left: 15 }
    });

    // Add Timeline on new page
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Activity Timeline', 15, 20);
    
    const timelineData = stats.timeline.map(activity => [
      format(new Date(activity.date), 'MMM dd, HH:mm'),
      activity.activity,
      activity.details,
      activity.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: 25,
      theme: 'grid',
      head: [['Time', 'Activity', 'Details', 'Status']],
      body: timelineData,
      styles: { 
        overflow: 'linebreak',
        fontSize: 9,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 90 },
        3: { cellWidth: 25 }
      },
      margin: { left: 15 }
    });

    // Save the PDF
    doc.save(`report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const fetchReportData = async () => {
    try {
      // First verify the client exists and log current user
      const currentUser = localStorage.getItem('currentUser');
      const userData = JSON.parse(currentUser || '{}');
      console.log('🔍 Current User Data:', userData);

      // Get products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('client_id', userData.id);

      if (productsError) throw productsError;

      // Get warehouses with their inventory movements
      const { data: warehousesData, error: warehousesError } = await supabase
        .from('warehouses')
        .select(`
          *,
          inventory_movements (*)
        `)
        .eq('client_id', userData.id);

      if (warehousesError) throw warehousesError;

      // Get deliveries
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('client_id', userData.id);

      if (deliveriesError) throw deliveriesError;

      // Ensure we have arrays even if data is null
      const warehouses = warehousesData || [];
      const products = productsData || [];
      const deliveries = deliveriesData || [];

      // Calculate statistics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const productsStats = {
        total: products.length,
        addedToday: products.filter(p => new Date(p.created_at) >= today).length,
        addedThisWeek: products.filter(p => new Date(p.created_at) >= thisWeek).length,
        addedThisMonth: products.filter(p => new Date(p.created_at) >= thisMonth).length
      };

      const warehouseStats = {
        total: warehouses.length,
        totalStocks: warehouses.reduce((sum: number, w: Warehouse) => sum + (w.products || 0), 0),
        utilization: warehouses.map((w: Warehouse) => ({
          name: w.name || '',
          utilization: ((w.products || 0) / (w.capacity || 100)) * 100
        }))
      };

      const deliveriesStats = {
        total: deliveries.length,
        completed: deliveries.filter(d => d.status === 'completed').length,
        inProgress: deliveries.filter(d => d.status === 'in_progress').length,
        failed: deliveries.filter(d => d.status === 'failed').length,
        pending: deliveries.filter(d => d.status === 'pending').length,
        daily: processDaily(deliveries, 'created_at')
      };

      // Generate timeline with enhanced activities
      const timeline = [
        ...products.map(p => ({
          date: p.created_at,
          activity: 'Product Added',
          details: `Product: ${p.name}, Quantity: ${p.quantity || 0}`,
          status: 'success'
        })),
        ...warehouses.flatMap(w => (w.inventory_movements || []).map(m => ({
          date: m.timestamp,
          activity: 'Warehouse Movement',
          details: `Warehouse: ${w.name}, Type: ${m.movement_type}, Quantity: ${m.quantity}`,
          status: m.movement_type
        }))),
        ...deliveries.map(d => ({
          date: d.created_at,
          activity: 'Delivery',
          details: `From: ${d.pickup_address?.split(',')[0]} To: ${d.delivery_address?.split(',')[0]}`,
          status: d.status
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setStats({
        products: productsStats,
        warehouse: {
          ...warehouseStats,
          assigned: warehouses.filter(w => w.status === 'assigned').length,
          pending: warehouses.filter(w => w.status === 'pending').length
        },
        deliveries: deliveriesStats,
        timeline
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    }
  };

  // Helper function to process daily data
  const processDaily = (data: any[], dateField: string): { date: string; count: number }[] => {
    if (!data || data.length === 0) return [];

    const latestDate = new Date(Math.max(...data.map(item => new Date(item[dateField]).getTime())));
    
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date(latestDate);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const countsByDay = data.reduce((acc: Record<string, number>, item) => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return last7Days.map(date => ({
      date,
      count: countsByDay[date] || 0
    }));
  };

  return (
    <AnimatedGradientBackground className="min-h-screen p-8">
      <AIParticleEffect className="absolute inset-0" />
      
      {/* Controls Section */}
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Reports & Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Generate and analyze detailed reports about your warehouse operations
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
            <CardContent className="pt-4">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="deliveries">Deliveries</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
            <CardContent className="pt-4">
              <DatePickerWithRange 
                date={dateRange} 
                setDate={(range: DateRange | undefined) => setDateRange(range)}
              />
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
            <CardContent className="pt-4 flex gap-2">
              <Button
                onClick={downloadReport}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Download className="mr-2 h-4 w-4" />
                JSON
              </Button>
              <Button
                onClick={downloadPDF}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <FileDown className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Products Stats */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-heading">
              <Package className="mr-2 h-5 w-5 text-blue-500" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Products</span>
                  <span className="font-medium">{stats.products.total}</span>
                </div>
                <Progress value={100} className="bg-blue-200 h-2">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: '100%' }} />
                </Progress>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Today</p>
                  <p className="font-medium">{stats.products.addedToday}</p>
                </div>
                <div>
                  <p className="text-gray-500">This Week</p>
                  <p className="font-medium">{stats.products.addedThisWeek}</p>
                </div>
                <div>
                  <p className="text-gray-500">This Month</p>
                  <p className="font-medium">{stats.products.addedThisMonth}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Stats */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-heading">
              <Warehouse className="mr-2 h-5 w-5 text-indigo-500" />
              Warehouse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Total Warehouses</p>
                  <p className="font-medium text-lg">{stats.warehouse.total}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Stocks</p>
                  <p className="font-medium text-lg">{stats.warehouse.totalStocks}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Utilization</p>
                {stats.warehouse.utilization.map((w, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{w.name}</span>
                      <span>{Math.round(w.utilization)}%</span>
                    </div>
                    <Progress value={w.utilization} className="bg-indigo-200 h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500" 
                        style={{ width: `${w.utilization}%` }} 
                      />
                    </Progress>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries Stats */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-heading">
              <Truck className="mr-2 h-5 w-5 text-blue-500" />
              Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Total Deliveries</p>
                  <p className="font-medium text-lg">{stats.deliveries.total}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="font-medium text-lg">{stats.deliveries.completed}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-gray-500 text-sm">In Progress</p>
                  <p className="font-medium">{stats.deliveries.inProgress}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Failed</p>
                  <p className="font-medium">{stats.deliveries.failed}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="font-medium">{stats.deliveries.pending}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Daily Deliveries</p>
                <div className="h-24 flex items-end gap-1">
                  {stats.deliveries.daily.map((delivery: { count: number }, index: number) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t"
                      style={{
                        height: `${(delivery.count / Math.max(...stats.deliveries.daily.map(d => d.count))) * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-heading">
            <FileText className="mr-2 h-5 w-5 text-blue-500" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.timeline.map((activity, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-32 text-sm text-gray-500">
                  {format(new Date(activity.date), 'MMM dd, HH:mm')}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.activity}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                  activity.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {activity.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AnimatedGradientBackground>
  );
} 