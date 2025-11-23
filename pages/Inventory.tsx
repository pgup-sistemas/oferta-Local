
import React, { useState, useRef } from 'react';
import { 
  Package, Upload, Plus, Minus, Search, FileSpreadsheet, 
  AlertCircle, CheckCircle, Download, X, Tag, Eye, EyeOff
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { Promotion, PromotionStatus } from '../types';

const Inventory: React.FC = () => {
  const { promotions, updateStock, updatePromotionStatus, bulkCreatePromotions } = useStore();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // CSV Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter promotions for current business
  const myInventory = promotions.filter(p => p.business_id === (user?.id || 'b1'));
  
  const filteredInventory = myInventory.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CSV Parsing Logic (Simple Client-Side Parser)
  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error("O arquivo parece vazio ou inválido.");
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''));
    
    // Expected headers: name, category, price, price_promo, quantity, validity (days)
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/['"]+/g, ''));
      
      // Basic validation
      if (values.length < 4) return null;
      
      const priceBefore = parseFloat(values[2]);
      const priceNow = parseFloat(values[3]);
      const stock = parseInt(values[4]) || 0;
      const validityDays = parseInt(values[5]) || 7;
      
      const validityDate = new Date();
      validityDate.setDate(validityDate.getDate() + validityDays);

      return {
        product_name: values[0],
        category: values[1] || 'outros',
        price_before: priceBefore,
        price_now: priceNow,
        stock_count: stock,
        valid_until: validityDate.toISOString()
      };
    }).filter(item => item !== null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    setUploadError('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = parseCSV(text);
        setParsedData(data);
      } catch (err) {
        setUploadError('Erro ao ler CSV. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  };

  const confirmUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newPromos: Promotion[] = parsedData.map((item, idx) => ({
        id: `bulk-${Date.now()}-${idx}`,
        business_id: user?.id || 'b1',
        product_name: item.product_name,
        description: 'Importado via CSV',
        category: item.category,
        price_before: item.price_before,
        price_now: item.price_now,
        discount_percent: Math.round(((item.price_before - item.price_now) / item.price_before) * 100),
        quantity: item.stock_count > 0 ? 'limited' : 'unlimited',
        stock_count: item.stock_count,
        valid_until: item.valid_until,
        photo_url: 'https://via.placeholder.com/400x300?text=Product',
        qr_code: `PROMO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: PromotionStatus.PAUSED, // Import as paused by default
        views_count: 0,
        saves_count: 0,
        qr_scans: 0,
        created_at: new Date().toISOString()
      }));

      bulkCreatePromotions(newPromos);
      setIsProcessing(false);
      setShowUploadModal(false);
      setCsvFile(null);
      setParsedData([]);
    }, 1500);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nome do Produto,Categoria,Preco Original,Preco Promo,Estoque,Validade(Dias)\nTomate,hortifruti,5.99,2.99,50,7\nPão de Queijo,padaria,20.00,15.00,10,2";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_importacao.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-primary-600" /> Gestão de Estoque
          </h1>
          <p className="text-gray-500 text-sm">Gerencie seus produtos e ative ofertas rapidamente.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <FileSpreadsheet size={18} className="text-green-600" />
          Importar CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou categoria..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Inventory Table/List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Produto</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Estoque</th>
                <th className="p-4 font-semibold text-right">Preço Promo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventory.length > 0 ? (
                filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{item.product_name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                             <Tag size={10} /> {item.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => updatePromotionStatus(
                          item.id, 
                          item.status === PromotionStatus.ACTIVE ? PromotionStatus.PAUSED : PromotionStatus.ACTIVE
                        )}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          item.status === PromotionStatus.ACTIVE
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {item.status === PromotionStatus.ACTIVE ? (
                          <><Eye size={12} /> Ativo</>
                        ) : (
                          <><EyeOff size={12} /> Pausado</>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => updateStock(item.id, (item.stock_count || 0) - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className={`text-sm font-mono font-bold w-8 text-center ${
                          (item.stock_count || 0) < 5 ? 'text-red-500' : 'text-gray-700'
                        }`}>
                          {item.stock_count || 0}
                        </span>
                        <button 
                          onClick={() => updateStock(item.id, (item.stock_count || 0) + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-gray-900 text-sm">R$ {item.price_now.toFixed(2)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Upload className="text-primary-600" size={20} /> Importar Produtos
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {!csvFile ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative">
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileSpreadsheet className="text-gray-400 mb-3" size={40} />
                    <p className="font-medium text-gray-900">Clique ou arraste seu arquivo CSV</p>
                    <p className="text-xs text-gray-500 mt-1">Máximo 5MB</p>
                  </div>
                  
                  <button 
                    onClick={handleDownloadTemplate}
                    className="w-full py-3 text-sm font-bold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Baixar Modelo CSV
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div className="flex-1">
                      <p className="font-bold text-green-800 text-sm">Arquivo Carregado!</p>
                      <p className="text-xs text-green-600">{csvFile.name} • {parsedData.length} produtos detectados</p>
                    </div>
                    <button onClick={() => setCsvFile(null)} className="text-green-700 hover:text-green-900 text-sm underline">Alterar</button>
                  </div>

                  {uploadError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                      <AlertCircle size={16} /> {uploadError}
                    </div>
                  )}
                  
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2">Produto</th>
                          <th className="p-2">Preço</th>
                          <th className="p-2">Estoque</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="p-2 truncate max-w-[100px]">{row.product_name}</td>
                            <td className="p-2">R$ {row.price_now}</td>
                            <td className="p-2">{row.stock_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 5 && (
                      <div className="p-2 text-center text-gray-400 italic border-t border-gray-100">
                        ...e mais {parsedData.length - 5} produtos
                      </div>
                    )}
                  </div>

                  <button
                    onClick={confirmUpload}
                    disabled={isProcessing}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-gray-800 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <><span className="animate-spin">⏳</span> Processando...</> : 'Confirmar Importação'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
