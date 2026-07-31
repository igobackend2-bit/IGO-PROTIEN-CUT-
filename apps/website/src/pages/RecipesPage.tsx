import React, { useState } from 'react';
import { ChefHat, ShoppingBag, X, Check, Flame, Beef, Clock3, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Recipe, Product, ProductWeightOption } from '../types';
import { INITIAL_RECIPES } from '../data/mockData';

interface RecipesPageProps {
  products: Product[];
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
  onNavigate?: (path: string) => void;
  // When set (via the /recipes/:id route), the page renders the recipe as
  // its own full page instead of the grid — a real, shareable/bookmarkable
  // URL instead of only being reachable through a modal that resets on
  // refresh.
  initialRecipeId?: string;
}

export const RecipesPage: React.FC<RecipesPageProps> = ({ products, onAddToCart, onNavigate, initialRecipeId }) => {
  const [added, setAdded] = useState(false);

  const handleBuyIngredients = (recipe: Recipe) => {
    const matchedProduct = products.find((p) => p.id === recipe.relatedProductId) || products[0];
    onAddToCart(matchedProduct, matchedProduct.weightOptions[0], 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const openRecipe = (recipe: Recipe) => {
    if (onNavigate) onNavigate(`/recipes/${recipe.id}`);
  };

  const activeRecipe = initialRecipeId ? INITIAL_RECIPES.find((r) => r.id === initialRecipeId) : null;

  // ---------------------------------------------------------------------
  // FULL PAGE — single recipe (/recipes/:id)
  // ---------------------------------------------------------------------
  if (initialRecipeId) {
    if (!activeRecipe) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="text-xl font-bold text-[#08120B]">Recipe not found</h1>
          <button
            onClick={() => onNavigate && onNavigate('/recipes')}
            className="text-emerald-700 font-bold text-sm hover:underline cursor-pointer"
          >
            Back to All Recipes
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => onNavigate && onNavigate('/recipes')}
          className="text-xs font-bold text-neutral-500 hover:text-emerald-700 flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Recipes
        </button>

        <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="relative h-64 sm:h-80 lg:h-96 bg-neutral-100">
            <img
              src={activeRecipe.image}
              alt={activeRecipe.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute top-5 left-5 bg-[#0F7B3A] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {activeRecipe.difficulty}
            </span>
            <h1 className="absolute bottom-5 left-6 right-6 text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              {activeRecipe.title}
            </h1>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Beef className="w-3.5 h-3.5" /> {activeRecipe.protein} Protein
              </span>
              <span className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs font-bold px-3 py-1.5 rounded-full">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> {activeRecipe.calories}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs font-bold px-3 py-1.5 rounded-full">
                <Clock3 className="w-3.5 h-3.5 text-emerald-600" /> Prep {activeRecipe.prepTime} + Cook {activeRecipe.cookTime}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-emerald-700 text-xs uppercase tracking-wider mb-3">Ingredients Required</h4>
                <ul className="space-y-2 text-sm text-neutral-600">
                  {activeRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-emerald-700 text-xs uppercase tracking-wider mb-3">Cooking Instructions</h4>
                <ol className="space-y-3 text-sm text-neutral-600">
                  {activeRecipe.steps.map((st, idx) => (
                    <li key={idx} className="flex items-start gap-3 leading-relaxed">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      {st}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <button
                onClick={() => handleBuyIngredients(activeRecipe)}
                className="w-full sm:w-auto bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-900/20"
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
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // GRID — all recipes (/recipes)
  // ---------------------------------------------------------------------
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
            onClick={() => openRecipe(recipe)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  openRecipe(recipe);
                }}
                className="w-full bg-neutral-50 hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-300 text-[#08120B] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                View Step-by-Step Cooking Guide
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
