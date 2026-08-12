import { CookingType, CookingRecipeIngredients } from '../types';

export const FARMERS_FACTORY_URL = 'https://farmersfactory.com';
export const IGO_MART_URL = 'https://igomart.com';

export const COOKING_RECIPE_MAP: Record<CookingType, CookingRecipeIngredients> = {
  Biryani: {
    cookingType: 'Biryani',
    dishName: 'Royal Dum Biryani',
    cookingTime: '45-50 Mins',
    servingSize: '3-4 Persons',
    vegetables: [
      {
        id: 'veg-1',
        name: 'Fresh Mint Leaves (Pudina)',
        category: 'vegetable',
        quantity: '1 Fresh Bunch',
        estimatedPrice: 20,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/fresh-mint-leaves`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'veg-2',
        name: 'Organic Cilantro / Coriander',
        category: 'vegetable',
        quantity: '1 Fresh Bunch',
        estimatedPrice: 15,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/fresh-coriander`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1588879460405-5dd2a19777df?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'veg-3',
        name: 'Red Onions (Crispy Fried Barista)',
        category: 'vegetable',
        quantity: '1 kg Pack',
        estimatedPrice: 35,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/red-onions`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'veg-4',
        name: 'Country Juicy Tomatoes',
        category: 'vegetable',
        quantity: '500g Pack',
        estimatedPrice: 25,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/fresh-tomatoes`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'veg-5',
        name: 'Farm Spicy Green Chillies',
        category: 'vegetable',
        quantity: '100g Pack',
        estimatedPrice: 12,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/green-chillies`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=300'
      }
    ],
    masalasAndSpices: [
      {
        id: 'masala-1',
        name: 'Royal Aged Long-Grain Basmati Rice',
        category: 'masala_spice',
        quantity: '1 kg Seal Pack',
        estimatedPrice: 185,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/groceries/basmati-rice`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'masala-2',
        name: 'Shahi Hyderabadi Dum Biryani Masala',
        category: 'masala_spice',
        quantity: '100g Pouch',
        estimatedPrice: 65,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/spices/biryani-masala`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'masala-3',
        name: 'Whole Spices Combo (Cardamom, Star Anise, Cloves)',
        category: 'masala_spice',
        quantity: '50g Box',
        estimatedPrice: 85,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/spices/whole-khada-masala`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'masala-4',
        name: 'Pure Desi Cow Ghee (A2 Quality)',
        category: 'masala_spice',
        quantity: '200 ml Jar',
        estimatedPrice: 210,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/dairy/a2-desi-ghee`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1627485937980-221c88ab04f9?auto=format&fit=crop&q=80&w=300'
      }
    ]
  },
  'Curry / Gravy': {
    cookingType: 'Curry / Gravy',
    dishName: 'Traditional Rich Meat Gravy',
    cookingTime: '30-35 Mins',
    servingSize: '3-4 Persons',
    vegetables: [
      {
        id: 'veg-curry-1',
        name: 'Sliced Red Onions',
        category: 'vegetable',
        quantity: '500g Pack',
        estimatedPrice: 20,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/red-onions`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'veg-curry-2',
        name: 'Farm Fresh Tomatoes & Curry Leaves',
        category: 'vegetable',
        quantity: '500g Pack',
        estimatedPrice: 28,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/tomatoes-curry-leaves`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'veg-curry-3',
        name: 'Crushed Ginger & Garlic Paste Combo',
        category: 'vegetable',
        quantity: '200g Pack',
        estimatedPrice: 38,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/ginger-garlic-paste`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=300'
      }
    ],
    masalasAndSpices: [
      {
        id: 'masala-curry-1',
        name: 'Chettinad & Pepper Meat Curry Powder',
        category: 'masala_spice',
        quantity: '100g Pack',
        estimatedPrice: 55,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/spices/chettinad-curry-powder`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'masala-curry-2',
        name: 'Roasted Cumin & Coriander Masala',
        category: 'masala_spice',
        quantity: '100g Pack',
        estimatedPrice: 48,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/spices/coriander-masala`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'masala-curry-3',
        name: 'Cold-Pressed Wood Pressed Gingelly Oil',
        category: 'masala_spice',
        quantity: '500 ml Bottle',
        estimatedPrice: 145,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/oils/gingelly-oil`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300'
      }
    ]
  },
  'Fry / Roast': {
    cookingType: 'Fry / Roast',
    dishName: 'Spicy Sukka / Pepper Roast',
    cookingTime: '20-25 Mins',
    servingSize: '2-3 Persons',
    vegetables: [
      {
        id: 'veg-fry-1',
        name: 'Small Sambhar Shallots Onions',
        category: 'vegetable',
        quantity: '250g Pack',
        estimatedPrice: 32,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/small-shallots`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'veg-fry-2',
        name: 'Fresh Aromatic Curry Leaves & Green Chillies',
        category: 'vegetable',
        quantity: '100g Pack',
        estimatedPrice: 15,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/curry-leaves`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=300'
      }
    ],
    masalasAndSpices: [
      {
        id: 'masala-fry-1',
        name: 'Black Pepper Sukka Roast Masala',
        category: 'masala_spice',
        quantity: '100g Pack',
        estimatedPrice: 58,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/spices/pepper-roast-masala`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'masala-fry-2',
        name: 'Crispy Fry Coating Mix',
        category: 'masala_spice',
        quantity: '200g Pack',
        estimatedPrice: 42,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/groceries/crispy-fry-mix`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=300'
      }
    ]
  },
  'Kebab / Tandoori': {
    cookingType: 'Kebab / Tandoori',
    dishName: 'Smoky Tandoori Tikka Kebabs',
    cookingTime: '25-30 Mins',
    servingSize: '2-3 Persons',
    vegetables: [
      {
        id: 'veg-kebab-1',
        name: '3-Color Bell Peppers / Capsicum',
        category: 'vegetable',
        quantity: '300g Pack',
        estimatedPrice: 48,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/capsicum-bell-peppers`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'veg-kebab-2',
        name: 'Mint Chutney Herbs & Juicy Lemons',
        category: 'vegetable',
        quantity: '1 Pack',
        estimatedPrice: 25,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/mint-lemon-chutney-kit`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&q=80&w=300'
      }
    ],
    masalasAndSpices: [
      {
        id: 'masala-kebab-1',
        name: 'Smoky Tandoori Marinade Tikka Masala',
        category: 'masala_spice',
        quantity: '100g Pouch',
        estimatedPrice: 68,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/spices/tandoori-tikka-masala`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'masala-kebab-2',
        name: 'Thick Hung Curd & Kasuri Methi Pack',
        category: 'masala_spice',
        quantity: '400g Pack',
        estimatedPrice: 50,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/dairy/hung-curd-kasuri-methi`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1627485937980-221c88ab04f9?auto=format&fit=crop&q=80&w=300'
      }
    ]
  },
  'Soup / Broth': {
    cookingType: 'Soup / Broth',
    dishName: 'Nourishing Warm Bone Broth & Soup',
    cookingTime: '40-60 Mins',
    servingSize: '2-4 Persons',
    vegetables: [
      {
        id: 'veg-soup-1',
        name: 'Sweet Carrots & Celery Stalks',
        category: 'vegetable',
        quantity: '300g Pack',
        estimatedPrice: 35,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/soup-veg-kit`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1598170845058-12ef4a457939?auto=format&fit=crop&q=80&w=300'
      }
    ],
    masalasAndSpices: [
      {
        id: 'masala-soup-1',
        name: 'Tellicherry Black Pepper & Himalayan Salt',
        category: 'masala_spice',
        quantity: '100g Jar',
        estimatedPrice: 75,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/spices/black-pepper-sea-salt`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=300'
      }
    ]
  },
  'Salad / Meal Prep': {
    cookingType: 'Salad / Meal Prep',
    dishName: 'Lean High-Protein Meal Prep Salad',
    cookingTime: '15 Mins',
    servingSize: '1-2 Persons',
    vegetables: [
      {
        id: 'veg-salad-1',
        name: 'Crisp Iceberg Lettuce & Cucumber',
        category: 'vegetable',
        quantity: '400g Pack',
        estimatedPrice: 55,
        redirectTarget: 'farmers_factory',
        redirectUrl: `${FARMERS_FACTORY_URL}/products/iceberg-lettuce-cucumber`,
        storeName: "Farmer's Factory",
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300'
      }
    ],
    masalasAndSpices: [
      {
        id: 'masala-salad-1',
        name: 'Honey Mustard Garlic Salad Dressing',
        category: 'masala_spice',
        quantity: '250 ml Bottle',
        estimatedPrice: 140,
        redirectTarget: 'igo_mart',
        redirectUrl: `${IGO_MART_URL}/condiments/honey-mustard-dressing`,
        storeName: 'IGO Mart',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300'
      }
    ]
  }
};
