
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import { 
  ShoppingBag, ShoppingCart, Trash2, Loader2, Package, 
  ArrowRight, Minus, Plus, CreditCard, Lock, X, Smartphone, Wallet,
  Info, ChevronRight, CheckCircle2, Image as ImageIcon, PlusCircle, AlertTriangle
} from 'lucide-react';
import { ShopItem, OrderItem } from '../types';

// Define payment methods available for the school
const PAYMENT_METHODS = [
  { id: 'Ecocash', name: 'Ecocash', logo: 'https://i.ibb.co/7NQSc15p/ecocash.png' },
  { id: 'Omari', name: "O'mari", logo: 'https://i.ibb.co/BDp0pNV/omari.png' },
  { id: 'Visa-Mastercard', name: 'Visa / Mastercard', logo: 'https://i.ibb.co/tw59PtJJ/visamastercard.png' }
];

export const UniformShop: React.FC = () => {
  const { user, shopItems, addShopItem, deleteShopItem, addToCart, cart, isLoggedIn, updateCartQuantity, removeFromCart, placeOrder, students, parents } = useStore();
  const [filter, setFilter] = useState<'All' | 'Required' | 'Optional'>('All');
  const [showCartView, setShowCartView] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Visa-Mastercard' | 'Ecocash' | 'Omari'>('Visa-Mastercard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Management state for Admin
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddModalClosing, setIsAddModalClosing] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', imageUrl: '', category: 'Required' as 'Required' | 'Optional' });
  const [imageFileName, setImageFileName] = useState('');
  const [itemToDelete, setItemToDelete] = useState<ShopItem | null>(null);

  const isAdmin = user?.role === 'SUPER_ADMIN';
  // Parents, students and visitors can shop
  const canShop = !user || user?.role === 'PARENT' || user?.role === 'STUDENT';
  const googleInput = "w-full px-5 py-4 border border-slate-300 dark:border-slate-700 rounded-[15px] bg-white dark:bg-slate-950 font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm";
  const googleLabel = "text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 ml-1";

  const subtotal = (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const linkedStudent = useMemo(() => {
    if (!isLoggedIn || !user) return null;
    if (user.role === 'STUDENT') return (students || []).find(s => s.firebaseUid === user.id);
    if (user.role === 'PARENT') {
      const parent = (parents || []).find(p => p.firebaseUid === user.id);
      return parent ? (students || []).find(s => s.id === parent.studentId) : null;
    }
    return null;
  }, [isLoggedIn, user, students, parents]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 2000)); // Simulate processing
      await placeOrder({
        userId: user?.id || 'guest',
        studentId: linkedStudent?.id || 'guest-user',
        studentName: linkedStudent?.fullName || 'Online Visitor',
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, imageUrl: i.imageUrl, quantity: i.quantity })),
        total: subtotal,
        paymentMethod
      });
      setOrderSuccess(true);
      setTimeout(() => { 
        setOrderSuccess(false); 
        setShowCheckout(false); 
        setShowCartView(false); 
      }, 3000);
    } finally { setIsProcessing(false); }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.imageUrl) return;
    await addShopItem({
      name: newItem.name,
      price: parseFloat(newItem.price),
      imageUrl: newItem.imageUrl,
      category: newItem.category,
      stock: 100
    });
    setNewItem({ name: '', price: '', imageUrl: '', category: 'Required' });
    setImageFileName('');
    closeAddUniformForm(true);
  };

  function openAddUniformForm() {
    setIsAddModalClosing(false);
    setShowAddModal(true);
  }

  function closeAddUniformForm(_force = false) {
    setIsAddModalClosing(true);
    window.setTimeout(() => {
      setShowAddModal(false);
      setIsAddModalClosing(false);
    }, 180);
  }

  const handleUniformImageSelect = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewItem(prev => ({ ...prev, imageUrl: String(reader.result || '') }));
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      await deleteShopItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const filteredItems = (shopItems || []).filter(item => filter === 'All' ? true : item.category === filter);

  return (
    <div className="relative w-full space-y-5 px-4 py-4 pb-24 font-sans animate-in fade-in duration-500 selection:bg-blue-100 sm:px-6 sm:py-6 lg:px-8">
      
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <ShoppingBag size={19} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-white sm:text-xl">
              {showCartView ? 'Your Shopping Cart' : 'School Uniform Shop'}
            </h1>
            <p className="mt-1 truncate text-xs text-slate-500">Official uniforms and school gear</p>
          </div>
        </div>
        
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {isAdmin && !showCartView && (
            <button 
              onClick={openAddUniformForm}
              className="flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <PlusCircle size={14} /> Add uniform
            </button>
          )}

          {!showCartView && (
            <div className="flex min-w-0 flex-1 gap-0.5 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800 sm:flex-none">
              {['All', 'Required', 'Optional'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f as any)} 
                  className={`min-w-0 flex-1 rounded px-2.5 py-1.5 text-[10px] font-medium transition-all sm:flex-none sm:px-3 ${filter === f ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {showCartView && (
            <button 
              onClick={() => setShowCartView(false)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to Shop
            </button>
          )}
        </div>
      </header>

      {/* Product Grid */}
      {!showCartView ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-950 overflow-hidden relative border-b border-slate-100 dark:border-slate-800">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" alt={item.name} />
                <div className="absolute top-3 left-3">
                   <span className="rounded-full bg-slate-950 px-2 py-1 text-[8px] font-medium text-white">{item.category}</span>
                </div>
                {isAdmin && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}
                    className="absolute top-3 right-3 p-2 bg-rose-600 text-white hover:bg-rose-700 shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3 sm:p-5">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-slate-900 dark:text-white sm:text-sm">{item.name}</h3>
                  <span className="shrink-0 font-mono text-sm font-semibold text-slate-950 dark:text-white sm:text-base">${item.price}</span>
                </div>
                {canShop && (
                  <button 
                    onClick={() => addToCart(item)}
                    className="mt-auto flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-slate-950 px-2 text-[10px] font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                  >
                    <ShoppingCart size={13} /> Add to cart
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
               <Package size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No items available in this category</p>
            </div>
          )}
        </div>
      ) : (
        /* Cart List Table */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-in slide-in-from-bottom-4 duration-500 dark:border-slate-800 dark:bg-slate-900">
           <div className="divide-y divide-slate-200 dark:divide-slate-800 md:hidden">
             {cart.length === 0 ? (
               <div className="px-5 py-16 text-center text-sm text-slate-400">Your cart is empty.</div>
             ) : cart.map(item => (
               <div key={item.cartId} className="flex min-w-0 items-center gap-3 p-4">
                 <img src={item.imageUrl} className="h-12 w-12 shrink-0 rounded-lg object-cover" alt={item.name} />
                 <div className="min-w-0 flex-1">
                   <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.name}</p>
                   <p className="mt-0.5 font-mono text-xs text-slate-500">${item.price} each</p>
                   <div className="mt-2 flex w-fit items-center rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                     <button onClick={() => updateCartQuantity(item.cartId, -1)} className="grid h-7 w-8 place-items-center"><Minus size={12} /></button>
                     <span className="min-w-7 text-center font-mono text-xs font-medium">{item.quantity}</span>
                     <button onClick={() => updateCartQuantity(item.cartId, 1)} className="grid h-7 w-8 place-items-center"><Plus size={12} /></button>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-mono text-sm font-semibold text-slate-950 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                   <button onClick={() => removeFromCart(item.cartId)} className="mt-2 text-rose-500"><Trash2 size={16} /></button>
                 </div>
               </div>
             ))}
           </div>
           <table className="hidden w-full border-collapse text-left md:table">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                 <tr>
                    <th className="px-8 py-6">Item</th>
                    <th className="px-8 py-6">Price</th>
                    <th className="px-8 py-6">Quantity</th>
                    <th className="px-8 py-6 text-right">Total</th>
                    <th className="px-8 py-6 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {cart.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="py-40 text-center">
                        <ShoppingCart size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-[10px] font-black uppercase text-slate-300 italic tracking-[0.4em]">Your cart is empty</p>
                     </td>
                   </tr>
                 ) : cart.map(item => (
                   <tr key={item.cartId} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/5 transition-colors group">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                           <div className="w-16 h-16 bg-slate-100 border border-slate-200 overflow-hidden rounded-none shadow-sm">
                              <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                           </div>
                           <p className="text-sm font-black uppercase dark:text-white tracking-tight">{item.name}</p>
                        </div>
                     </td>
                     <td className="px-8 py-6 font-mono text-sm text-slate-500 font-bold">${item.price}</td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 w-fit p-1.5 border border-slate-200 dark:border-slate-700">
                           <button onClick={() => updateCartQuantity(item.cartId, -1)} className="p-1.5 hover:text-blue-600 transition-colors"><Minus size={14} /></button>
                           <span className="font-black text-xs min-w-[30px] text-center font-mono">{item.quantity}</span>
                           <button onClick={() => updateCartQuantity(item.cartId, 1)} className="p-1.5 hover:text-blue-600 transition-colors"><Plus size={14} /></button>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right font-black text-blue-600 font-mono text-lg">${(item.price * item.quantity).toFixed(2)}</td>
                     <td className="px-8 py-6 text-right">
                        <button onClick={() => removeFromCart(item.cartId)} className="text-slate-300 hover:text-rose-500 transition-colors p-2"><Trash2 size={20}/></button>
                     </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           
           {cart.length > 0 && (
             <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50 sm:p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-10">
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Order Total</p>
                   <p className="font-mono text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">${subtotal.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                >
                   Proceed to Payment <ArrowRight size={22} />
                </button>
             </div>
           )}
        </div>
      )}

      {/* Floating Cart Widget */}
      {canShop && cart.length > 0 && !showCartView && (
        <button 
          onClick={() => setShowCartView(true)}
          className="fixed bottom-4 right-4 z-[100] flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white shadow-xl transition hover:bg-slate-800 sm:bottom-8 sm:right-8 dark:bg-blue-600"
        >
           <div className="text-left">
              <p className="text-[9px] font-black uppercase text-white/40 tracking-[0.3em] mb-1">Items Total</p>
              <p className="font-mono text-lg font-semibold leading-none">${subtotal.toFixed(2)}</p>
           </div>
           <div className="relative grid h-9 w-9 place-items-center rounded-lg bg-white/10">
              <ShoppingCart size={18} />
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-950 shadow-lg">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
           </div>
        </button>
      )}

      {/* Admin: Add Item Modal */}
      {showAddModal && createPortal((
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white dark:bg-slate-950 sm:bg-slate-100/95 sm:p-6 sm:backdrop-blur-md dark:sm:bg-slate-950/90">
           <div className={`relative flex h-full w-full flex-col overflow-hidden bg-white dark:bg-slate-900 sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-xl sm:border sm:border-slate-200 sm:shadow-2xl dark:sm:border-slate-800 ${isAddModalClosing ? 'form-screen-out' : 'form-screen-in'}`}>
              <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 sm:py-4">
                 <div>
                   <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl">Add new uniform</h3>
                   <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Add a product to the school shop.</p>
                 </div>
                 <button aria-label="Close add uniform" onClick={() => closeAddUniformForm()} className="grid h-9 w-9 place-items-center text-slate-400 transition hover:text-slate-950 dark:hover:text-white"><X size={20}/></button>
              </header>
              <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/50 p-4 dark:bg-slate-950/20 sm:p-6">
                 <div className="space-y-3">
                    <label className={googleLabel}>Item Name</label>
                    <input 
                      value={newItem.name} 
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      className={googleInput}
                      placeholder="e.g. Academy Tracksuit"
                    />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-3">
                        <label className={googleLabel}>Price (USD)</label>
                        <input 
                          type="number"
                          value={newItem.price} 
                          onChange={e => setNewItem({...newItem, price: e.target.value})}
                          className={`${googleInput} font-mono`}
                          placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className={googleLabel}>Category</label>
                        <select 
                          value={newItem.category} 
                          onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                          className={`${googleInput} appearance-none cursor-pointer`}
                        >
                           <option value="Required">Required</option>
                           <option value="Optional">Optional</option>
                        </select>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className={googleLabel}>Product Image</label>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={e => handleUniformImageSelect(e.target.files?.[0])}
                      />
                      <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white shadow-sm transition hover:border-blue-600 hover:ring-4 hover:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 sm:min-h-56">
                        {newItem.imageUrl ? (
                          <img src={newItem.imageUrl} className="h-48 w-full object-cover sm:h-56" alt="Uniform preview" />
                        ) : (
                          <div className="text-center px-8">
                            <ImageIcon size={34} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Choose Image From Computer</p>
                          </div>
                        )}
                      </div>
                    </label>
                    {imageFileName && (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold text-slate-400 truncate">{imageFileName}</p>
                        <button
                          type="button"
                          onClick={() => { setNewItem({ ...newItem, imageUrl: '' }); setImageFileName(''); }}
                          className="px-3 py-1.5 rounded-[15px] text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                 </div>
                 <button 
                  onClick={handleAddItem}
                  className="h-11 w-full rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                 >
                    Save to Shop
                 </button>
              </div>
           </div>
        </div>
      ), document.body)}

      {/* Admin: Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[1100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 max-w-md w-full p-10 border border-slate-200 dark:border-slate-800 rounded-none shadow-2xl animate-in zoom-in-95">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-none flex items-center justify-center mx-auto mb-8 border border-rose-100">
                 <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-center mb-4 dark:text-white leading-none">Remove this item?</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center leading-relaxed italic mb-12">
                 You are about to permanently delete <b className="text-slate-900 dark:text-white uppercase">"{itemToDelete.name}"</b> from the shop. This cannot be undone.
              </p>
              <div className="flex gap-4">
                 <button onClick={() => setItemToDelete(null)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors">Cancel</button>
                 <button onClick={confirmDeleteItem} className="flex-1 py-5 bg-rose-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-rose-700 transition-all active:scale-95">Yes, Delete</button>
              </div>
           </div>
        </div>
      )}

      {/* Payment Selection Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 max-w-lg w-full border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden animate-in zoom-in-95 shadow-2xl">
              {orderSuccess ? (
                <div className="p-24 text-center space-y-8 animate-in zoom-in duration-500">
                   <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-none flex items-center justify-center mx-auto border border-emerald-100">
                      <CheckCircle2 size={48} />
                   </div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">Order Received</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your order has been sent to the school office</p>
                </div>
              ) : (
                <>
                  <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                     <div>
                        <h3 className="text-base font-black uppercase tracking-widest dark:text-white">Payment Details</h3>
                        <p className="text-[8px] font-black uppercase text-slate-400 mt-1">Choose your payment method</p>
                     </div>
                     <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={24}/></button>
                  </header>
                  <div className="p-10 space-y-10">
                     <div className="grid grid-cols-3 gap-3">
                        {PAYMENT_METHODS.map(m => (
                          <button 
                            key={m.id} 
                            onClick={() => setPaymentMethod(m.id as any)} 
                            className={`flex flex-col items-center justify-center gap-4 p-6 border-2 transition-all rounded-none ${paymentMethod === m.id ? 'bg-blue-50 border-blue-600 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                          >
                             <img src={m.logo} className={`h-8 w-auto ${paymentMethod === m.id ? 'grayscale-0' : 'grayscale'}`} alt={m.name} />
                             <span className="text-[8px] font-black uppercase tracking-widest text-center">{m.name}</span>
                          </button>
                        ))}
                     </div>
                     
                     <div className="bg-slate-50 dark:bg-slate-950 p-6 border border-slate-100 dark:border-slate-800 rounded-none">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black uppercase text-slate-400">Total to Pay</span>
                           <span className="text-3xl font-black font-mono text-blue-600">${subtotal.toFixed(2)}</span>
                        </div>
                        <p className="text-[8px] font-medium text-slate-400 italic">Secure payment processing with 256-bit encryption</p>
                     </div>

                     <button 
                      onClick={handleCheckout} 
                      disabled={isProcessing}
                      className="w-full py-6 bg-slate-950 dark:bg-blue-600 text-white font-black uppercase text-xs tracking-[0.4em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all active:scale-[0.98]"
                     >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <>Verify and Pay Now <Lock size={18}/></>}
                     </button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
