'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Trash2, Edit, Menu, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NavItem {
  id: number;
  title: string;
  slug: string;
  parent_id: number | null;
  position: number;
  children?: NavItem[];
}

interface FormData {
  title: string;
  slug: string;
  parent_id: number | null;
  position: number;
  is_category: boolean;
}

export default function NavigationPage() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    parent_id: null,
    position: 0,
    is_category: false,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNavigation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/navigation');
      if (!res.ok) throw new Error('Failed to fetch navigation');
      const data = await res.json();
      setNavItems(buildTree(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load navigation');
      toast.error('Failed to load navigation');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNavigation();
  }, [fetchNavigation]);

  const buildTree = (items: NavItem[]): NavItem[] => {
    const tree: NavItem[] = [];
    const itemsMap: Record<number, NavItem> = {};
    
    items.forEach(item => {
      itemsMap[item.id] = { ...item, children: [] };
    });

    items.forEach(item => {
      if (item.parent_id !== null && itemsMap[item.parent_id]) {
        itemsMap[item.parent_id].children?.push(itemsMap[item.id]);
      } else {
        tree.push(itemsMap[item.id]);
      }
    });

    // Sort children by position
    tree.forEach(item => {
      if (item.children) {
        item.children.sort((a, b) => a.position - b.position);
      }
    });

    return tree.sort((a, b) => a.position - b.position);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const method = editingId ? 'PUT' : 'POST';
      const url = '/api/navigation';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (editingId ? 'Update failed' : 'Creation failed'));

      await fetchNavigation();
      resetForm();
      toast.success(editingId ? 'Item updated successfully' : 'Item created successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      setError(message);
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      setError(null);
      const res = await fetch('/api/navigation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.children) {
          const childList = data.children.map((c: { id: number }) => `- ${c.id}`).join('\n');
          throw new Error(`This item has children. Please delete them first:\n${childList}`);
        }
        throw new Error(data.error || 'Deletion failed');
      }

      await fetchNavigation();
      toast.success('Item deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deletion failed';
      setError(message);
      toast.error(message);
    }
  };

  const handleEdit = (item: NavItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      slug: item.slug,
      parent_id: item.parent_id,
      position: item.position,
      is_category: false,
    });
    document.getElementById('nav-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', parent_id: null, position: 0, is_category: false });
    setEditingId(null);
  };

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id] ?? false;

    return (
      <motion.div 
        key={item.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('border-l border-muted', depth > 0 && `ml-${depth * 4}`)}
      >
        <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button 
              onClick={() => toggleExpand(item.id)} 
              className="p-1 rounded hover:bg-muted"
              disabled={!hasChildren}
            >
              {hasChildren ? (
                isExpanded ? 
                  <ChevronDown className="w-4 h-4 text-muted-foreground" /> : 
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
              ) : <div className="w-4" />}
            </button>
            
            <Menu className="w-4 h-4 text-muted-foreground" />
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-sm text-muted-foreground truncate">{item.slug}</p>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleEdit(item)}
              className="h-8 w-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(item.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="pl-4">
            {item.children?.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Navigation Management</h1>
        <p className="text-muted-foreground">Organize your site&apos;s navigation structure</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Card */}
        <Card id="nav-form" className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Item' : 'Add New Item'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Menu Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Slug *</label>
                <Input
                  placeholder="/path"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Parent</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.parent_id ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parent_id: e.target.value ? Number(e.target.value) : null,
                  })}
                >
                  <option value="">No Parent (Top Level)</option>
                  {navItems.filter(item => item.id !== editingId).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: Number(e.target.value)})}
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_category"
                  checked={formData.is_category}
                  onChange={(e) => setFormData({ ...formData, is_category: e.target.checked })}
                  className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                />
                <label htmlFor="is_category" className="text-sm font-medium">
                  Is Category?
                </label>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update Item' : 'Add Item'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Navigation Structure Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Navigation Structure</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="w-6 h-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={fetchNavigation}>
                  Retry
                </Button>
              </div>
            ) : navItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 space-y-2 text-center text-muted-foreground">
                <p>No navigation items found</p>
                <p className="text-sm">Add your first item using the form</p>
              </div>
            ) : (
              <div className="space-y-1">
                {navItems.map(item => renderNavItem(item))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}