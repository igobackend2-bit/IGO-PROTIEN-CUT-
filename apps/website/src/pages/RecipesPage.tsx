import React, { useState } from 'react';
import { ChefHat, ShoppingBag, X, Check } from 'lucide-react';
import { Recipe, Product, ProductWeightOption } from '../types';
import { INITIAL_RECIPES } from '../data/mockData';

interface RecipesPageProps {
  products: Product[];
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
}

export const RecipesPage: React.FC<RecipesPageProps> = ({ products, onAddToCart }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [added, setAdded] = useState(false);

  const handleBuyIngredients = (recipe: Recipe) => {
    const matchedProduct = products.find((p) => p.id === recipe.relatedProductId) || products[0];
    onAddToCart(matchedProduct, matchedProduct.weightOptions[0], 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="bg-[#08120B] border border-black rounded-3xl p-8 text-center max-w-3xl mx-auto space-y-2 text-white shadow-2xl">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
          <ChefHat className="w-4 h-4" /> MASTER CHEF RECIPE COLLECTION
        </span>
        <h1 className="text-3xl font-black tracking-tight">Authentic Indian & World Meat Recipes</h1>
        <p className="text-xs text-neutral-300">
          Step-by-step cooking guides created by professional butchers and chefs. Buy exact portion cuts in 1-click.
        </p>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INITIAL_RECIPES.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-white border border-neutral-200 hover:border-emerald-400 rounded-3xl overflow-hidden transition cursor-pointer group shadow-sm hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/9 bg-neutral-100 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0F7B3A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {recipe.difficulty}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-base font-bold text-[#08120B] group-hover:text-emerald-600 transition">
                  {recipe.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>Prep: <strong>{recipe.prepTime}</strong></span>
                  <span>Cook: <strong>{recipe.cookTime}</strong></span>
                  <span className="text-emerald-700 font-bold">{recipe.protein}</span>
                </div>

                <div className="text-xs text-neutral-500 line-clamp-2">
                  Ingredients: {recipe.ingredients.join(', ')}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                type="button"
                className="w-full bg-neutral-50 hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-300 text-[#08120B] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                View Step-by-Step Cooking Guide
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full text-[#08120B] p-6 relative shadow-2xl my-auto">
            <button
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#08120B] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#08120B] mb-2">{selectedRecipe.title}</h2>
            <div className="flex items-center gap-4 text-xs text-neutral-600 mb-4">
              <span>Difficulty: <strong className="text-[#08120B]">{selectedRecipe.difficulty}</strong></span>
              <span>Protein: <strong className="text-emerald-700">{selectedRecipe.protein}</strong></span>
              <span>Calories: <strong className="text-[#08120B]">{selectedRecipe.calories}</strong></span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
              <div>
                <h4 className="font-bold text-emerald-700 text-xs uppercase mb-2">Ingredients Required</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-600">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-emerald-700 text-xs uppercase mb-2">Cooking Instructions</h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-600">
                  {selectedRecipe.steps.map((st, idx) => (
                    <li key={idx} className="leading-relaxed">{st}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between gap-4">
              <button
                onClick={() => handleBuyIngredients(selectedRecipe)}
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-900/20"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-white" /> Cut Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> 1-Click Buy Main Cut Ingredients
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
