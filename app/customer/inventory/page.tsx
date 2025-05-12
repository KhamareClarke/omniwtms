"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/auth/SupabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import CustomerSidebar from '../CustomerSidebar';
import { useMediaQuery } from 'react-responsive';

const headerMap: { [key: string]: string } = {
  'accountn': 'account',
  'action': 'action',
  'address1': 'address1',
  'address2': 'address2',
  'address3': 'address3',
  'assemble': 'assembly',
  'assistedl': 'assisted',
  'delivery': 'delivery',
  'deliveryid': 'deliveryid',
  'emailadd': 'emailadd',
  'hub': 'hub',
  'ordernumbr': 'order_numbr',
  'postcode': 'postcod',
  'productcode': 'productcode',
  'productdescription': 'productref',
  'recipient': 'recipient',
  'telephone': 'telephon',
  'towncity': 'towncity',
  'warehouse': 'warehou',
  'cube': 'cube',
  'weightk': 'weight_k',
  'maxparts': 'max_par',
  'quantity': 'quantity',
  'accountname': 'Account Name',
};

export default function CustomerInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const router = useRouter();
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editRowData, setEditRowData] = useState<any>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadRows, setUploadRows] = useState<any[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Responsive check
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const customerStr = localStorage.getItem('currentCustomer');
    if (!customerStr) {
      router.push('/auth/login');
      return;
    }
    const customer = JSON.parse(customerStr);
    
    // Fetch inventory for this customer
    supabase
      .from('customer_inventory')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setInventory(data || []));
  }, [router]);

  const handleEditRow = (row: any) => {
    setEditingRowId(row.id);
    setEditRowData({ ...row });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditRowData({});
  };

  const handleSaveEdit = async () => {
    if (!editingRowId) return;
    const { id, ...updateData } = editRowData;
    const { error } = await supabase
      .from('customer_inventory')
      .update(updateData)
      .eq('id', editingRowId);
    if (error) {
      console.error('Error updating inventory:', error);
    } else {
      setEditingRowId(null);
      setEditRowData({});
      // Refresh inventory data
      const customerStr = localStorage.getItem('currentCustomer');
      if (customerStr) {
        const customer = JSON.parse(customerStr);
        const { data } = await supabase
          .from('customer_inventory')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false });
        setInventory(data || []);
      }
    }
  };

  const handleDeleteRow = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const { error } = await supabase
        .from('customer_inventory')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting inventory:', error);
      } else {
        // Refresh inventory data
        const customerStr = localStorage.getItem('currentCustomer');
        if (customerStr) {
          const customer = JSON.parse(customerStr);
          const { data } = await supabase
            .from('customer_inventory')
            .select('*')
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false });
          setInventory(data || []);
        }
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true, header: 1 });

        if (jsonData.length < 2) {
          alert('Excel file must have at least a header row and one data row');
          return;
        }

        // Normalize headers
        const headers = (jsonData[0] as string[]).map(header =>
          header ? header.toString().replace(/\s|\./g, '').toLowerCase() : ''
        );

        // Map Excel columns to DB columns using headerMap
        const processedRows = jsonData.slice(1).map((row: any) => {
          const processedRow: any = {};
          headers.forEach((header, idx) => {
            const dbCol = headerMap[header];
            if (dbCol) {
              processedRow[dbCol] = row[idx];
            }
          });
          return processedRow;
        });

        setUploadRows(processedRows);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please make sure it\'s a valid Excel or CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveInventory = async () => {
    setUploadLoading(true);
    try {
      const customerStr = localStorage.getItem('currentCustomer');
      if (!customerStr) {
        router.push('/auth/login');
        return;
      }
      const customer = JSON.parse(customerStr);

      // Only allow columns that exist in the DB
      const allowedColumns = [
        'account', 'action', 'address1', 'address2', 'address3', 'assembly', 'assisted',
        'delivery', 'deliveryid', 'emailadd', 'hub', 'order_numbr', 'postcod', 'productcode',
        'productref', 'recipient', 'telephon', 'towncity', 'warehou', 'cube', 'weight_k',
        'max_par', 'quantity', 'Account Name', 'customer_id', 'created_at'
      ];

      const rowsToInsert = uploadRows.map(row => {
        const filtered: Record<string, any> = {};
        allowedColumns.forEach(col => {
          if (row[col] !== undefined) filtered[col] = row[col];
        });
        // Always set customer_id and created_at
        filtered.customer_id = customer.id;
        filtered.created_at = new Date().toISOString();
        return filtered;
      });

      const { error } = await supabase
        .from('customer_inventory')
        .insert(rowsToInsert);

      if (error) {
        console.error('Error saving inventory:', error);
        // No popup, just log
      } else {
        toast.success('Successfully saved!');
        setShowUploadModal(false);
        setUploadRows([]);
        // Refresh inventory data
        const { data } = await supabase
          .from('customer_inventory')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false });
        setInventory(data || []);
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      // No popup, just log
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar: hide on mobile, show on md+ */}
      <div className="hidden md:block">
        <CustomerSidebar />
      </div>
      {/* Mobile sidebar toggle (optional) */}
      {/* Main content */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 text-gray-900">Inventory Management</h1>
            <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto" onClick={() => setShowUploadModal(true)}>
                  Upload Inventory
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg w-full p-0">
                <div className="flex flex-col h-full max-h-[90vh]">
                  <DialogHeader className="p-4 pb-0">
                    <DialogTitle>Upload Inventory</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-2 text-sm text-gray-600">Upload a CSV or Excel file containing your inventory items. Make sure it follows our template format.</div>
                    <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                  </div>
                  <div className="flex gap-2 justify-end p-4 border-t bg-white sticky bottom-0 z-10">
                    <Button variant="outline" onClick={() => { setShowUploadModal(false); setUploadRows([]); }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveInventory} disabled={uploadLoading || uploadRows.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {uploadLoading ? 'Saving...' : 'Save Inventory Data'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded-xl shadow p-2 sm:p-6 overflow-x-auto">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[700px] sm:min-w-[1200px] text-xs">
                <thead>
                  <tr>
                    {inventory[0] && Object.keys(inventory[0])
                      .filter(k => k !== 'id' && k !== 'customer_id' && k !== 'created_at')
                      .map((col, idx) => (
                        <th key={col} className={`px-2 py-1 border-b bg-gray-50 text-left${idx === 0 ? ' sticky left-0 bg-white z-10' : ''}`}>{col}</th>
                      ))}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={99} className="text-center py-8 text-gray-400">
                        No inventory uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((row: any) => (
                      <tr key={row.id}>
                        {Object.keys(row)
                          .filter(k => k !== 'id' && k !== 'customer_id' && k !== 'created_at')
                          .map((col, idx) => (
                            <td key={col} className={`px-2 py-1 border-b${idx === 0 ? ' sticky left-0 bg-white z-10' : ''}`}>
                              {editingRowId === row.id ? (
                                <input
                                  type="text"
                                  value={editRowData[col] || ''}
                                  onChange={(e) => setEditRowData({ ...editRowData, [col]: e.target.value })}
                                  className="border rounded px-1 py-0.5 w-full"
                                />
                              ) : (
                                row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'
                              )}
                            </td>
                          ))}
                        <td className="px-2 py-1 border-b">
                          {editingRowId === row.id ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleCancelEdit}
                                className="bg-gray-500 hover:bg-gray-600 text-white w-full sm:w-auto"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditRow(row)}
                                className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDeleteRow(row.id)}
                                className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 