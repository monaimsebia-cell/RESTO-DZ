import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  DollarSign,
  Utensils,
  Calculator,
  Percent,
  CheckCircle2,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Recipe, Category } from '../../core/types';
import { calculateRecipeCost, formatDA } from '../../core/calculations';

export const CatalogRecipesManager: React.FC = () => {
  const { products, categories, inventoryItems, currentTenant, t, language } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'products' | 'recipes'>('products');

  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];

  const recipe = activeProduct?.recipe;
  const costing = recipe
    ? calculateRecipeCost(
        recipe.ingredients,
        recipe.packagingCost,
        recipe.laborEstimateCost,
        activeProduct.price
      )
    : null;

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-600/40 rounded-xl text-[#E53935]">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.navCatalog} & Fiches Recettes
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Gestion de la carte, fiches techniques, coût de revient matières et marges brutes en DA
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-[#161618] border border-[#2D2D35] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'products' ? 'bg-[#E53935] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Articles & Prix ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'recipes' ? 'bg-[#E53935] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Fiches Techniques & Coût Matière
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        /* PRODUCTS LIST VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(prod => {
            const cat = categories.find(c => c.id === prod.categoryId);
            return (
              <div
                key={prod.id}
                className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-2xl flex flex-col justify-between hover:border-[#E53935]/50 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">
                      {prod.categoryId === 'cat_burgers' ? '🍔' : prod.categoryId === 'cat_drinks' ? '🥤' : '🍟'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A2A30] text-amber-400 font-bold uppercase">
                      {cat?.name || 'Général'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-2">{prod.name}</h3>
                  <p className="text-xs text-[#9CA3AF] line-clamp-2 mt-1">{prod.description}</p>

                  {/* Variations count */}
                  {prod.variations?.length > 0 && (
                    <div className="mt-2 text-[11px] text-[#D1D5DB]">
                      <strong>{prod.variations.length}</strong> déclinaison(s) disponible(s)
                    </div>
                  )}
                  {prod.extras?.length > 0 && (
                    <div className="text-[11px] text-[#9CA3AF]">
                      <strong>{prod.extras.length}</strong> supplément(s)
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#2D2D35] flex items-center justify-between">
                  <div className="font-black text-base text-white">
                    {formatDA(prod.price, language === 'ar')}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      setActiveTab('recipes');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Fiche Recette</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* RECIPES & COSTING VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Product Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#9CA3AF] uppercase">Choisir un Plat</label>
            <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl p-2 space-y-1 max-h-[500px] overflow-y-auto">
              {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    selectedProductId === p.id
                      ? 'bg-[#E53935] text-white shadow-md'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-[#25252A]'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  <span className="font-mono text-[11px]">{p.price} DA</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Recipe Breakdown & Costing Calculations */}
          <div className="lg:col-span-2 space-y-4">
            {activeProduct && costing && recipe ? (
              <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl p-5 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2D2D35] pb-4 gap-2">
                  <div>
                    <h2 className="text-lg font-black text-white">{activeProduct.name}</h2>
                    <p className="text-xs text-[#9CA3AF]">Fiche technique de préparation & Décomposition du coût</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9CA3AF]">Prix de vente :</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {formatDA(costing.sellingPrice, language === 'ar')}
                    </span>
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#161618] p-3 rounded-xl border border-[#2D2D35]">
                    <span className="text-[11px] text-[#9CA3AF]">Coût Total de Production</span>
                    <div className="text-xl font-black text-white font-mono mt-1">
                      {formatDA(costing.totalCost, language === 'ar')}
                    </div>
                    <span className="text-[10px] text-[#9CA3AF]">Matières + Emballage + Main d'oeuvre</span>
                  </div>

                  <div className="bg-[#161618] p-3 rounded-xl border border-[#2D2D35]">
                    <span className="text-[11px] text-[#9CA3AF]">Marge Brute par Portion</span>
                    <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                      +{formatDA(costing.grossProfit, language === 'ar')}
                    </div>
                    <span className="text-[10px] text-emerald-300">Bénéfice direct par plat vendu</span>
                  </div>

                  <div className="bg-[#161618] p-3 rounded-xl border border-[#2D2D35]">
                    <span className="text-[11px] text-[#9CA3AF]">Taux de Marge Brute</span>
                    <div className="text-xl font-black text-amber-400 font-mono mt-1">
                      {costing.grossMarginPercent}%
                    </div>
                    <span className="text-[10px] text-amber-300">Rentabilité matière</span>
                  </div>
                </div>

                {/* Ingredients Table */}
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Ingrédients & Matières Premières Consommées
                  </h3>
                  <div className="bg-[#161618] border border-[#2D2D35] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-[#D1D5DB]">
                      <thead className="bg-[#121214] text-[#9CA3AF] text-[10px] uppercase border-b border-[#2D2D35]">
                        <tr>
                          <th className="py-2.5 px-3">Ingrédient</th>
                          <th className="py-2.5 px-3">Quantité / Portion</th>
                          <th className="py-2.5 px-3">Prix d'Achat Unitaire</th>
                          <th className="py-2.5 px-3 text-right">Coût Portion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2D2D35]">
                        {recipe.ingredients.map((ing, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-white">{ing.name}</td>
                            <td className="py-2 px-3 font-mono">
                              {ing.quantity} {ing.unit}
                            </td>
                            <td className="py-2 px-3 font-mono text-[#9CA3AF]">
                              {formatDA(ing.unitCost, language === 'ar')} /{ing.unit}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-white">
                              {formatDA(Math.round(ing.quantity * ing.unitCost), language === 'ar')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional costs */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#161618] p-3 rounded-xl border border-[#2D2D35] flex justify-between">
                    <span className="text-[#9CA3AF]">Packaging / Boîte :</span>
                    <span className="font-mono font-bold">{recipe.packagingCost} DA</span>
                  </div>
                  <div className="bg-[#161618] p-3 rounded-xl border border-[#2D2D35] flex justify-between">
                    <span className="text-[#9CA3AF]">Estimation Main d'Oeuvre :</span>
                    <span className="font-mono font-bold">{recipe.laborEstimateCost} DA</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl p-8 text-center text-[#9CA3AF]">
                <Utensils className="w-10 h-10 text-[#6B7280] mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">Aucune recette configurée</h3>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Ce plat n'a pas encore de fiche technique d'ingrédients. Vous pouvez en associer une pour activer la déduction automatique des stocks lors des ventes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
