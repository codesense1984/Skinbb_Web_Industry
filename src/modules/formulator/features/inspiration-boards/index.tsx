import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { basePythonApiUrl } from '@/core/config/baseUrls';
import { PageContent } from '@/core/components/ui/structure';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Badge } from '@/core/components/ui/badge';
import { toast } from 'sonner';

// Types
interface Ingredient {
  name: string;
  inci: string;
  phase: 'water' | 'oil' | 'active' | 'preservative' | 'other';
  concentration: number;
  cost: number;
  function: string;
}

interface DecodedData {
  ingredientCount: number;
  heroIngredients: string[];
  estimatedCost: number;
  phRange: string;
  formulationType: string;
  manufacturingComplexity: string;
  shelfLife: string;
  ingredients: Ingredient[];
  compliance: {
    bis: { status: string; notes: string };
    eu: { status: string; notes: string };
    fda: { status: string; notes: string };
  };
  marketPosition: {
    priceSegment: string;
    targetAudience: string;
    usp: string;
    competitors: string[];
  };
}

interface Product {
  id: number | string;
  name: string;
  brand: string;
  url: string;
  platform: string;
  image: string;
  price: number;
  size: number;
  unit: string;
  pricePerMl: number;
  category: string;
  rating: number;
  reviews: number;
  dateAdded: string;
  notes?: string;
  tags: string[];
  myRating?: number | null;
  decoded: boolean;
  decodedData?: DecodedData | null;
}

interface Board {
  id: number | string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  products: Product[];
}

const InspirationBoards = () => {
  const [currentView, setCurrentView] = useState<'boards' | 'board-detail' | 'decoded-detail' | 'competitor-analysis'>('boards');
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<(number | string)[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [credits, setCredits] = useState(247);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterTag, setFilterTag] = useState('all');
  const [analysisTab, setAnalysisTab] = useState<'overview' | 'ingredients' | 'pricing' | 'positioning' | 'gaps'>('overview');

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);

  // API functions
  const api = {
    async extractProductFromUrl(url: string) {
      const response = await axios.post(
        `${basePythonApiUrl}/api/extract-ingredients-from-url`,
        { url }
      );
      return response.data;
    },

    async decodeProduct(productId: number | string, boardId: number | string, product: Product) {
      // This will call the analyze-url endpoint to get full decoded data
      const response = await axios.post(
        `${basePythonApiUrl}/api/analyze-url`,
        { url: product.url }
      );
      return response.data;
    },

    async getBoards() {
      // TODO: Implement backend API
      // For now, return empty array or load from localStorage
      const saved = localStorage.getItem('inspiration_boards');
      return saved ? JSON.parse(saved) : [];
    },

    async saveBoard(board: Board) {
      // TODO: Implement backend API
      // For now, save to localStorage
      const boards = await this.getBoards();
      boards.push(board);
      localStorage.setItem('inspiration_boards', JSON.stringify(boards));
      return board;
    },

    async updateBoard(boardId: number | string, updates: Partial<Board>) {
      // TODO: Implement backend API
      const boards = await this.getBoards();
      const index = boards.findIndex((b: Board) => b.id === boardId);
      if (index !== -1) {
        boards[index] = { ...boards[index], ...updates };
        localStorage.setItem('inspiration_boards', JSON.stringify(boards));
        return boards[index];
      }
      return null;
    },

    async addProductToBoard(boardId: number | string, product: Product) {
      // TODO: Implement backend API
      const boards = await this.getBoards();
      const index = boards.findIndex((b: Board) => b.id === boardId);
      if (index !== -1) {
        boards[index].products.push(product);
        localStorage.setItem('inspiration_boards', JSON.stringify(boards));
        return boards[index];
      }
      return null;
    },
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const loadedBoards = await api.getBoards();
      setBoards(loadedBoards);
    } catch (error) {
      console.error('Error loading boards:', error);
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  const useCredits = (amount: number, action: string): boolean => {
    if (credits >= amount) {
      setCredits(p => p - amount);
      showToast(`${action} complete! ${amount}◆ used`);
      return true;
    }
    showToast('Insufficient credits!', 'error');
    return false;
  };

  const decodeProduct = async (boardId: number | string, productId: number | string) => {
    if (!useCredits(20, 'Decode')) return;

    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const product = board.products.find(p => p.id === productId);
    if (!product) return;

    try {
      setLoading(true);
      const decodedData = await api.decodeProduct(productId, boardId, product);
      
      // Transform the decoded data to match our format
      const transformedData: DecodedData = {
        ingredientCount: decodedData.ingredients?.length || 0,
        heroIngredients: decodedData.hero_ingredients || decodedData.ingredients?.slice(0, 3).map((i: any) => i.name || i) || [],
        estimatedCost: decodedData.estimated_cost || decodedData.cost_analysis?.total_cost_per_100g || 0,
        phRange: decodedData.ph_range || '5.0-6.5',
        formulationType: decodedData.formulation_type || 'Water-based',
        manufacturingComplexity: decodedData.complexity || 'Medium',
        shelfLife: decodedData.shelf_life || '12 months',
        ingredients: decodedData.ingredients?.map((ing: any) => ({
          name: ing.name || ing,
          inci: ing.inci_name || ing.name || ing,
          phase: ing.phase || 'other',
          concentration: ing.concentration || ing.percent || 0,
          cost: ing.cost || 0,
          function: ing.function || ing.purpose || ''
        })) || [],
        compliance: {
          bis: { status: 'compliant', notes: 'Review needed' },
          eu: { status: 'compliant', notes: 'Review needed' },
          fda: { status: 'compliant', notes: 'Review needed' }
        },
        marketPosition: {
          priceSegment: 'Mid-range',
          targetAudience: 'General',
          usp: 'Effective formulation',
          competitors: []
        }
      };

      setBoards(prev => prev.map(b => b.id === boardId ? {
        ...b,
        products: b.products.map(p => p.id === productId ? {
          ...p,
          decoded: true,
          decodedData: transformedData
        } : p)
      } : b));

      // Save to localStorage
      localStorage.setItem('inspiration_boards', JSON.stringify(boards));
    } catch (error: any) {
      console.error('Error decoding product:', error);
      showToast(error.response?.data?.detail || 'Failed to decode product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      water: 'bg-sky-100 text-sky-700',
      oil: 'bg-amber-100 text-amber-700',
      active: 'bg-emerald-100 text-emerald-700',
      preservative: 'bg-rose-100 text-rose-700',
      other: 'bg-slate-100 text-slate-700'
    };
    return colors[phase] || 'bg-slate-100 text-slate-700';
  };

  const getPlatformStyle = (platform: string) => {
    const styles: Record<string, { bg: string; text: string; icon: string }> = {
      nykaa: { bg: 'bg-pink-500', text: 'Nykaa', icon: '💄' },
      amazon: { bg: 'bg-orange-500', text: 'Amazon', icon: '📦' },
      purplle: { bg: 'bg-purple-600', text: 'Purplle', icon: '💜' },
      flipkart: { bg: 'bg-blue-600', text: 'Flipkart', icon: '🛒' }
    };
    return styles[platform] || { bg: 'bg-slate-500', text: 'Other', icon: '🔗' };
  };

  // Sidebar Component
  const Sidebar = () => (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-700/50 z-40 flex flex-col">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-black">F</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Formulynx</h1>
            <p className="text-xs text-slate-400">Inspiration Board</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          onClick={() => { setCurrentView('boards'); setSelectedBoard(null); setSelectedProduct(null); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'boards' && !selectedBoard ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <span>📋</span>
          <span className="font-medium">All Boards</span>
          <span className="ml-auto text-xs bg-slate-700 px-2 py-0.5 rounded-full">{boards.length}</span>
        </button>
        <button
          onClick={() => setCurrentView('competitor-analysis')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'competitor-analysis' ? 'bg-violet-500/20 text-violet-300' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <span>📊</span>
          <span className="font-medium">Competitor Analysis</span>
        </button>
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase">My Boards</p>
        </div>
        {boards.map(b => (
          <button
            key={b.id}
            onClick={() => { setSelectedBoard(b); setCurrentView('board-detail'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedBoard?.id === b.id ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <span>{b.icon}</span>
            <span className="font-medium truncate flex-1 text-left">{b.name}</span>
            <span className="text-xs text-slate-500">{b.products.length}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-amber-200/70">Credits</span>
            <span className="text-lg font-bold text-amber-300">{credits}◆</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              style={{ width: `${(credits / 400) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );

  // Boards List View
  const BoardsListView = () => {
    const totalProducts = boards.reduce((s, b) => s + b.products.length, 0);
    const totalDecoded = boards.reduce((s, b) => s + b.products.filter(p => p.decoded).length, 0);

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Inspiration Boards</h1>
            <p className="text-slate-400">Collect, analyze, and compare competitor products</p>
          </div>
          <Button
            onClick={() => setShowCreateBoardModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
          >
            <span>+</span>
            <span>New Board</span>
            <span className="text-rose-200 text-sm">10◆</span>
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Boards', value: boards.length, icon: '📋', color: 'from-rose-500 to-pink-600' },
            { label: 'Products', value: totalProducts, icon: '🧴', color: 'from-violet-500 to-purple-600' },
            { label: 'Decoded', value: totalDecoded, icon: '✅', color: 'from-emerald-500 to-teal-600' },
            { label: 'Pending', value: totalProducts - totalDecoded, icon: '⏳', color: 'from-amber-500 to-orange-600' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-3`}>
                {s.icon}
              </div>
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {boards.map(b => (
            <button
              key={b.id}
              onClick={() => { setSelectedBoard(b); setCurrentView('board-detail'); }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-left hover:border-rose-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-3xl`}>
                  {b.icon}
                </div>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-lg">{b.products.length} products</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-rose-300">{b.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{b.description}</p>
              {b.products.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {b.products.slice(0, 4).map((p, i) => (
                      <div key={i} className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-sm border-2 border-slate-800">
                        {p.image}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 ml-2">
                    {b.products.filter(p => p.decoded).length}/{b.products.length} decoded
                  </span>
                </div>
              )}
            </button>
          ))}

          <button
            onClick={() => setShowCreateBoardModal(true)}
            className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-rose-500/50 hover:bg-slate-800/30 transition-all group min-h-[200px] flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-4 group-hover:bg-rose-500/20">
              ➕
            </div>
            <p className="text-slate-400 group-hover:text-rose-300 font-medium">Create New Board</p>
            <p className="text-xs text-slate-500 mt-1">10◆</p>
          </button>
        </div>
      </div>
    );
  };

  // Board Detail View
  const BoardDetailView = () => {
    if (!selectedBoard) return null;

    const board = boards.find(b => b.id === selectedBoard.id);
    if (!board) return null;

    const decodedCount = board.products.filter(p => p.decoded).length;
    const pendingCount = board.products.length - decodedCount;
    const allTags = [...new Set(board.products.flatMap(p => p.tags))];

    const filteredProducts = board.products
      .filter(p => filterTag === 'all' || p.tags.includes(filterTag))
      .sort((a, b) => {
        switch (sortBy) {
          case 'price': return a.price - b.price;
          case 'pricePerMl': return a.pricePerMl - b.pricePerMl;
          case 'rating': return b.rating - a.rating;
          default: return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        }
      });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => { setCurrentView('boards'); setSelectedBoard(null); }}
              variant="ghost"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              ←
            </Button>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-3xl`}>
              {board.icon}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{board.name}</h1>
              <p className="text-slate-400">{board.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAddProductModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold flex items-center gap-2"
            >
              <span>+</span>
              <span>Add Product</span>
            </Button>
            {selectedProducts.length >= 2 && (
              <Button
                onClick={() => setCurrentView('competitor-analysis')}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2"
              >
                <span>📊</span>
                <span>Compare ({selectedProducts.length})</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Products', value: board.products.length, icon: '🧴' },
            { label: 'Decoded', value: decodedCount, icon: '✅', color: 'text-emerald-400' },
            {
              label: 'Price Range',
              value: board.products.length > 0
                ? `₹${Math.min(...board.products.map(p => p.price))}-${Math.max(...board.products.map(p => p.price))}`
                : '-',
              icon: '💰'
            },
            {
              label: 'Avg Price',
              value: board.products.length > 0
                ? `₹${Math.round(board.products.reduce((s, p) => s + p.price, 0) / board.products.length)}`
                : '-',
              icon: '📊'
            },
            { label: 'Tags', value: allTags.length, icon: '🏷️' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className={`text-xl font-bold ${s.color || 'text-white'}`}>{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between bg-slate-800/30 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800 rounded-lg p-1">
              {(['grid', 'table'] as const).map(m => (
                <Button
                  key={m}
                  onClick={() => setViewMode(m)}
                  variant={viewMode === m ? 'default' : 'ghost'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === m ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {m === 'grid' ? '▦ Grid' : '☰ Table'}
                </Button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 text-sm"
            >
              <option value="dateAdded">Date Added</option>
              <option value="price">Price</option>
              <option value="pricePerMl">Price/ml</option>
              <option value="rating">Rating</option>
            </select>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 text-sm"
            >
              <option value="all">All Tags</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            {selectedProducts.length > 0 && (
              <>
                <span className="text-sm text-slate-400">{selectedProducts.length} selected</span>
                <Button
                  onClick={() => setSelectedProducts([])}
                  variant="ghost"
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Clear
                </Button>
              </>
            )}
            {pendingCount > 0 && (
              <Button
                onClick={() => board.products.filter(p => !p.decoded).forEach(p => decodeProduct(board.id, p.id))}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm font-medium"
              >
                Decode All ({pendingCount}) • {pendingCount * 20}◆
              </Button>
            )}
          </div>
        </div>

        {board.products.length === 0 ? (
          <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🧴</div>
            <h3 className="text-xl font-bold text-white mb-2">No products yet</h3>
            <p className="text-slate-400 mb-6">Add products by pasting URLs from e-commerce platforms</p>
            <Button
              onClick={() => setShowAddProductModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold"
            >
              + Add First Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filteredProducts.map(p => (
              <div
                key={p.id}
                className={`bg-slate-800/50 border rounded-2xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer ${
                  selectedProducts.includes(p.id) ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="p-4 pb-0 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProducts(prev =>
                        prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                      );
                    }}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                      selectedProducts.includes(p.id) ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-600'
                    }`}
                  >
                    {selectedProducts.includes(p.id) && '✓'}
                  </button>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs px-2 py-1 rounded-lg ${getPlatformStyle(p.platform).bg} text-white`}>
                      {getPlatformStyle(p.platform).icon} {getPlatformStyle(p.platform).text}
                    </Badge>
                    {p.decoded && (
                      <Badge className="text-xs px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                        ✓ Decoded
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-4" onClick={() => { setSelectedProduct(p); setCurrentView('decoded-detail'); }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center text-3xl">
                      {p.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 mb-1">{p.brand}</p>
                      <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-rose-300">
                        {p.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-white">₹{p.price}</p>
                      <p className="text-xs text-slate-400">{p.size}ml • ₹{p.pricePerMl.toFixed(2)}/ml</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-400">⭐ {p.rating}</p>
                      <p className="text-xs text-slate-400">{(p.reviews / 1000).toFixed(1)}K</p>
                    </div>
                  </div>
                  {p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {p.tags.slice(0, 3).map(t => (
                        <Badge key={t} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-lg">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {p.decoded && p.decodedData && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-emerald-300 font-medium">Decoded Insights</span>
                        <span className="text-xs text-slate-400">{p.decodedData.ingredientCount} ingredients</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.decodedData.heroIngredients.slice(0, 2).map((ing, i) => (
                          <Badge key={i} className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                            {ing.split(' ')[0]}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Est. cost: ₹{p.decodedData.estimatedCost}/100g</p>
                    </div>
                  )}
                  {p.notes && <p className="text-xs text-slate-400 italic line-clamp-2">{p.notes}</p>}
                </div>
                <div className="p-4 pt-0 flex gap-2">
                  <Button
                    onClick={() => { setSelectedProduct(p); setCurrentView('decoded-detail'); }}
                    className="flex-1 py-2 bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-600"
                  >
                    View Details
                  </Button>
                  {!p.decoded && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        decodeProduct(board.id, p.id);
                      }}
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-xl text-sm font-medium"
                    >
                      Decode 20◆
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Decoded Detail View - Simplified version for now
  const DecodedDetailView = () => {
    if (!selectedProduct) return null;

    const p = selectedProduct;
    const d = p.decodedData;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => { setCurrentView('board-detail'); setSelectedProduct(null); }}
              variant="ghost"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              ←
            </Button>
            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center text-4xl">
              {p.image}
            </div>
            <div>
              <p className="text-sm text-slate-400">{p.brand}</p>
              <h1 className="text-2xl font-black text-white">{p.name}</h1>
            </div>
          </div>
        </div>

        {!p.decoded ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-xl font-bold text-white mb-2">Product Not Yet Decoded</h3>
            <p className="text-slate-400 mb-6">Decode this product to reveal its full ingredient breakdown.</p>
            <Button
              onClick={() => decodeProduct(selectedBoard?.id || '', p.id)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold"
            >
              Decode This Product 20◆
            </Button>
          </div>
        ) : d ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Formulation Analysis</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-white">{d.ingredientCount}</p>
                  <p className="text-xs text-slate-400">Ingredients</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-white">{d.formulationType.split(' ')[0]}</p>
                  <p className="text-xs text-slate-400">Type</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-white">{d.manufacturingComplexity}</p>
                  <p className="text-xs text-slate-400">Complexity</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-white">{d.phRange}</p>
                  <p className="text-xs text-slate-400">pH Range</p>
                </div>
              </div>
            </div>

            {d.ingredients && d.ingredients.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-700">
                  <h3 className="font-bold text-white">Ingredient Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-800/50">
                        <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase">Ingredient</th>
                        <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase">INCI</th>
                        <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase">Phase</th>
                        <th className="p-4 text-right text-xs font-medium text-slate-400 uppercase">Conc. %</th>
                        <th className="p-4 text-right text-xs font-medium text-slate-400 uppercase">Cost ₹</th>
                        <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase">Function</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.ingredients.map((ing, i) => (
                        <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="p-4 font-medium text-white">{ing.name}</td>
                          <td className="p-4 text-slate-400 text-sm">{ing.inci}</td>
                          <td className="p-4">
                            <Badge className={`text-xs px-2 py-1 rounded-lg ${getPhaseColor(ing.phase)}`}>
                              {ing.phase}
                            </Badge>
                          </td>
                          <td className="p-4 text-right font-mono text-white">{ing.concentration}%</td>
                          <td className="p-4 text-right font-mono text-emerald-400">₹{ing.cost.toFixed(2)}</td>
                          <td className="p-4 text-slate-400 text-sm">{ing.function}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  // Competitor Analysis View - Simplified for now
  const CompetitorAnalysisView = () => {
    const allDecodedProducts = boards.flatMap(b => b.products.filter(p => p.decoded && p.decodedData));
    const productsToAnalyze = selectedProducts.length >= 2
      ? allDecodedProducts.filter(p => selectedProducts.includes(p.id))
      : allDecodedProducts;

    if (productsToAnalyze.length < 2) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setCurrentView('boards')}
              variant="ghost"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              ←
            </Button>
            <div>
              <h1 className="text-2xl font-black text-white">Competitor Analysis</h1>
              <p className="text-slate-400">Compare formulations, pricing, and market positioning</p>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Need More Products</h3>
            <p className="text-slate-400 mb-6">
              You need at least 2 decoded products. Currently you have {allDecodedProducts.length}.
            </p>
            <Button
              onClick={() => setCurrentView('boards')}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold"
            >
              Go to Boards
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setCurrentView(selectedBoard ? 'board-detail' : 'boards')}
              variant="ghost"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              ←
            </Button>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-3">
                <span>📊</span>Competitor Analysis
              </h1>
              <p className="text-slate-400">Comparing {productsToAnalyze.length} products</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-4">Comparison Overview</h3>
          <p className="text-slate-400">Full competitor analysis view coming soon...</p>
        </div>
      </div>
    );
  };

  // Add Product Modal
  const AddProductModal = () => {
    const [step, setStep] = useState(1);
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchedProduct, setFetchedProduct] = useState<any>(null);
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const suggestedTags = ['bestseller', 'premium', 'budget-friendly', 'natural', 'vegan', 'cruelty-free', 'trending', 'cult-favorite'];

    const detectPlatform = (url: string) => {
      if (url.includes('nykaa')) return 'nykaa';
      if (url.includes('amazon')) return 'amazon';
      if (url.includes('purplle')) return 'purplle';
      if (url.includes('flipkart')) return 'flipkart';
      return 'other';
    };

    const fetchProduct = async () => {
      if (!url.trim()) return;
      setLoading(true);
      try {
        const data = await api.extractProductFromUrl(url);
        const platform = detectPlatform(url);
        
        // Extract product info from the response
        setFetchedProduct({
          name: data.product_name || 'Unknown Product',
          brand: 'Unknown Brand',
          url,
          platform,
          image: '🧴',
          price: 0, // Will need to extract from URL or use AI
          size: 30,
          unit: 'ml',
          category: 'Serum',
          rating: 0,
          reviews: 0,
          ingredients: data.ingredients || [],
        });
        setStep(2);
      } catch (error: any) {
        console.error('Error fetching product:', error);
        showToast(error.response?.data?.detail || 'Failed to fetch product', 'error');
      } finally {
        setLoading(false);
      }
    };

    const addProduct = async () => {
      if (!fetchedProduct || !selectedBoard) return;

      const newProduct: Product = {
        ...fetchedProduct,
        id: Date.now(),
        pricePerMl: fetchedProduct.price / fetchedProduct.size,
        dateAdded: new Date().toISOString().split('T')[0],
        notes,
        tags,
        myRating: null,
        decoded: false,
        decodedData: null,
      };

      try {
        await api.addProductToBoard(selectedBoard.id, newProduct);
        setBoards(prev => prev.map(b => b.id === selectedBoard.id ? {
          ...b,
          products: [...b.products, newProduct]
        } : b));
        showToast('Product added to board!');
        setShowAddProductModal(false);
        setStep(1);
        setUrl('');
        setNotes('');
        setTags([]);
        setFetchedProduct(null);
      } catch (error) {
        console.error('Error adding product:', error);
        showToast('Failed to add product', 'error');
      }
    };

    if (!showAddProductModal) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-lg w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">{step === 1 ? 'Add Product' : 'Confirm Product'}</h3>
            <Button
              onClick={() => {
                setShowAddProductModal(false);
                setStep(1);
                setUrl('');
                setNotes('');
                setTags([]);
                setFetchedProduct(null);
              }}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              ✕
            </Button>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Product URL</label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste URL from Nykaa, Amazon, Purplle, or Flipkart"
                  className="w-full"
                />
              </div>
              <Button
                onClick={fetchProduct}
                disabled={!url || loading}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? 'Fetching...' : 'Fetch Product'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fetchedProduct && (
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="font-medium text-white">{fetchedProduct.name}</p>
                  <p className="text-sm text-slate-400">{fetchedProduct.brand}</p>
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Notes (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add observations..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map(t => (
                    <Button
                      key={t}
                      onClick={() => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                      variant={tags.includes(t) ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={addProduct} className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600">
                  Add to Board
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Create Board Modal
  const CreateBoardModal = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('🎯');
    const [color, setColor] = useState('rose');

    const icons = ['🎯', '📈', '💰', '🔬', '🏷️', '📦', '⭐', '💜', '🧴', '✨', '🔥', '💎'];
    const colors = ['rose', 'violet', 'blue', 'cyan', 'emerald', 'amber', 'orange', 'pink'];

    const createBoard = async () => {
      if (!name.trim()) return;
      if (!useCredits(10, 'Board created')) return;

      const newBoard: Board = {
        id: Date.now(),
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        createdAt: new Date().toISOString().split('T')[0],
        products: [],
      };

      try {
        await api.saveBoard(newBoard);
        setBoards(prev => [...prev, newBoard]);
        setShowCreateBoardModal(false);
        setSelectedBoard(newBoard);
        setCurrentView('board-detail');
        setName('');
        setDescription('');
        setIcon('🎯');
        setColor('rose');
      } catch (error) {
        console.error('Error creating board:', error);
        showToast('Failed to create board', 'error');
      }
    };

    if (!showCreateBoardModal) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Create New Board</h3>
            <Button
              onClick={() => {
                setShowCreateBoardModal(false);
                setName('');
                setDescription('');
                setIcon('🎯');
                setColor('rose');
              }}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Board Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Vitamin C Serums Analysis"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Description (optional)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this board for?"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {icons.map(i => (
                    <Button
                      key={i}
                      onClick={() => setIcon(i)}
                      variant={icon === i ? 'default' : 'outline'}
                      size="sm"
                      className="text-xl"
                    >
                      {i}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-xl bg-${c}-500 ${color === c ? 'ring-2 ring-white scale-110' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Button
              onClick={createBoard}
              disabled={!name.trim()}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              Create Board <span className="text-rose-200 text-sm ml-2">10◆</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <AddProductModal />
      <CreateBoardModal />
      <main className="ml-72 p-8">
        {loading && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
            <div className="text-white">Loading...</div>
          </div>
        )}
        {currentView === 'boards' && <BoardsListView />}
        {currentView === 'board-detail' && <BoardDetailView />}
        {currentView === 'decoded-detail' && <DecodedDetailView />}
        {currentView === 'competitor-analysis' && <CompetitorAnalysisView />}
      </main>
    </div>
  );
};

export default InspirationBoards;

