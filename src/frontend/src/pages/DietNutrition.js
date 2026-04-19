import React, { useState } from 'react';
import { ChefHat, Utensils, Heart, Leaf, Globe, Star, Clock, Flame, Search, Filter } from 'lucide-react';

const DietNutrition = () => {
  const [activeTab, setActiveTab] = useState('western');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedRecipes, setExpandedRecipes] = useState({});

  const toggleRecipe = (recipeId) => {
    setExpandedRecipes(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
  };

  const westernRecipes = [
    {
      id: 1,
      name: 'Quinoa Buddha Bowl',
      category: 'lunch',
      time: '25 min',
      calories: 420,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
      difficulty: 'Easy',
      benefits: ['High Protein', 'Low GI', 'Anti-inflammatory'],
      ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Spinach', 'Cherry tomatoes', 'Tahini dressing'],
      instructions: [
        'Cook quinoa according to package directions',
        'Roast chickpeas with olive oil and spices at 400°F for 20 minutes',
        'Arrange quinoa, chickpeas, fresh veggies in a bowl',
        'Drizzle with tahini dressing and serve'
      ]
    },
    {
      id: 2,
      name: 'Salmon with Roasted Vegetables',
      category: 'dinner',
      time: '30 min',
      calories: 480,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
      difficulty: 'Medium',
      benefits: ['Omega-3', 'High Protein', 'Hormone Balance'],
      ingredients: ['Wild salmon fillet', 'Broccoli', 'Bell peppers', 'Olive oil', 'Lemon', 'Garlic'],
      instructions: [
        'Preheat oven to 425°F',
        'Season salmon with lemon, garlic, and herbs',
        'Toss vegetables with olive oil and seasonings',
        'Bake for 20-25 minutes until salmon is cooked through'
      ]
    },
    {
      id: 3,
      name: 'Greek Yogurt Parfait',
      category: 'breakfast',
      time: '10 min',
      calories: 280,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
      difficulty: 'Easy',
      benefits: ['Probiotic', 'High Protein', 'Low Sugar'],
      ingredients: ['Greek yogurt', 'Mixed berries', 'Chia seeds', 'Almonds', 'Cinnamon'],
      instructions: [
        'Layer Greek yogurt in a glass',
        'Add fresh berries and chia seeds',
        'Top with crushed almonds',
        'Sprinkle with cinnamon and serve'
      ]
    },
    {
      id: 4,
      name: 'Zucchini Noodles with Pesto',
      category: 'lunch',
      time: '20 min',
      calories: 320,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
      difficulty: 'Easy',
      benefits: ['Low Carb', 'Nutrient Dense', 'Anti-inflammatory'],
      ingredients: ['Zucchini', 'Basil pesto', 'Cherry tomatoes', 'Pine nuts', 'Parmesan'],
      instructions: [
        'Spiralize zucchini into noodles',
        'Sauté zucchini noodles for 2-3 minutes',
        'Toss with homemade basil pesto',
        'Top with cherry tomatoes and pine nuts'
      ]
    }
  ];

  const desiRecipes = [
    {
      id: 5,
      name: 'Moong Dal Khichdi',
      category: 'lunch',
      time: '30 min',
      calories: 350,
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
      difficulty: 'Easy',
      benefits: ['Easy Digestion', 'High Protein', 'Low GI'],
      ingredients: ['Moong dal', 'Brown rice', 'Turmeric', 'Cumin', 'Ghee', 'Vegetables'],
      instructions: [
        'Wash and soak moong dal and rice for 15 minutes',
        'Pressure cook with turmeric and vegetables',
        'Temper with cumin seeds and ghee',
        'Serve hot with yogurt'
      ]
    },
    {
      id: 6,
      name: 'Palak Paneer (Low Fat)',
      category: 'dinner',
      time: '35 min',
      calories: 380,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
      difficulty: 'Medium',
      benefits: ['Iron Rich', 'High Protein', 'Hormone Support'],
      ingredients: ['Spinach', 'Low-fat paneer', 'Onions', 'Tomatoes', 'Ginger-garlic', 'Spices'],
      instructions: [
        'Blanch spinach and blend into smooth paste',
        'Sauté onions, ginger-garlic paste, and tomatoes',
        'Add spinach puree and spices',
        'Add grilled paneer cubes and simmer'
      ]
    },
    {
      id: 7,
      name: 'Methi Paratha with Dahi',
      category: 'breakfast',
      time: '25 min',
      calories: 320,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
      difficulty: 'Medium',
      benefits: ['Blood Sugar Control', 'Fiber Rich', 'Hormone Balance'],
      ingredients: ['Whole wheat flour', 'Fresh methi leaves', 'Yogurt', 'Spices', 'Minimal oil'],
      instructions: [
        'Mix chopped methi with whole wheat flour',
        'Knead dough with water and spices',
        'Roll out parathas and cook on tawa',
        'Serve with fresh yogurt'
      ]
    },
    {
      id: 8,
      name: 'Chana Chaat',
      category: 'snack',
      time: '15 min',
      calories: 250,
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
      difficulty: 'Easy',
      benefits: ['High Protein', 'Low GI', 'Fiber Rich'],
      ingredients: ['Boiled chickpeas', 'Onions', 'Tomatoes', 'Cucumber', 'Lemon', 'Chaat masala'],
      instructions: [
        'Boil chickpeas until tender',
        'Chop vegetables finely',
        'Mix all ingredients with spices',
        'Add lemon juice and serve fresh'
      ]
    }
  ];

  const dietPlans = {
    western: {
      title: 'Western PCOS-Friendly Diet Plan',
      description: 'Mediterranean-inspired meal plan focusing on whole foods, lean proteins, and healthy fats',
      meals: [
        {
          time: 'Breakfast (7-8 AM)',
          options: [
            'Greek yogurt parfait with berries and nuts',
            'Avocado toast on whole grain bread with poached eggs',
            'Smoothie bowl with spinach, banana, and protein powder'
          ]
        },
        {
          time: 'Mid-Morning Snack (10-11 AM)',
          options: [
            'Handful of almonds and walnuts',
            'Apple slices with almond butter',
            'Carrot sticks with hummus'
          ]
        },
        {
          time: 'Lunch (1-2 PM)',
          options: [
            'Quinoa buddha bowl with grilled chicken',
            'Salmon salad with mixed greens and olive oil',
            'Zucchini noodles with turkey meatballs'
          ]
        },
        {
          time: 'Evening Snack (4-5 PM)',
          options: [
            'Protein smoothie with berries',
            'Celery with peanut butter',
            'Hard-boiled eggs'
          ]
        },
        {
          time: 'Dinner (7-8 PM)',
          options: [
            'Grilled fish with roasted vegetables',
            'Chicken stir-fry with cauliflower rice',
            'Lentil soup with side salad'
          ]
        }
      ]
    },
    desi: {
      title: 'Desi PCOS-Friendly Diet Plan',
      description: 'Traditional South Asian meals adapted for PCOS management with low GI ingredients',
      meals: [
        {
          time: 'Breakfast (7-8 AM)',
          options: [
            'Methi paratha with low-fat dahi',
            'Moong dal cheela with mint chutney',
            'Oats upma with vegetables'
          ]
        },
        {
          time: 'Mid-Morning Snack (10-11 AM)',
          options: [
            'Roasted makhana (fox nuts)',
            'Fruit chaat with chaat masala',
            'Sprouted moong with lemon'
          ]
        },
        {
          time: 'Lunch (1-2 PM)',
          options: [
            'Moong dal khichdi with vegetables',
            'Brown rice with palak paneer and salad',
            'Roti with rajma and cucumber raita'
          ]
        },
        {
          time: 'Evening Snack (4-5 PM)',
          options: [
            'Chana chaat',
            'Roasted chana with green tea',
            'Vegetable soup'
          ]
        },
        {
          time: 'Dinner (7-8 PM)',
          options: [
            'Grilled fish with sautéed vegetables',
            'Dal with quinoa and salad',
            'Vegetable curry with millet roti'
          ]
        }
      ]
    }
  };

  const nutritionTips = [
    {
      icon: Leaf,
      title: 'Choose Low GI Foods',
      description: 'Opt for whole grains, legumes, and non-starchy vegetables to maintain stable blood sugar levels',
      color: 'green'
    },
    {
      icon: Heart,
      title: 'Healthy Fats',
      description: 'Include omega-3 rich foods like fish, walnuts, and flaxseeds to reduce inflammation',
      color: 'pink'
    },
    {
      icon: Flame,
      title: 'Anti-inflammatory Spices',
      description: 'Use turmeric, cinnamon, and ginger regularly to combat PCOS-related inflammation',
      color: 'orange'
    },
    {
      icon: Star,
      title: 'Protein at Every Meal',
      description: 'Include lean proteins to improve satiety and support hormone balance',
      color: 'purple'
    }
  ];

  const currentRecipes = activeTab === 'western' ? westernRecipes : desiRecipes;
  const filteredRecipes = selectedCategory === 'all' 
    ? currentRecipes 
    : currentRecipes.filter(r => r.category === selectedCategory);

  return (
    <div className="p-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Diet & Nutrition</h1>
            <p className="text-slate-500 text-sm">PCOS-friendly meal plans and recipes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-pink-100 hover:bg-pink-50 transition-colors">
            <Search className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">Search</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-pink-100 hover:bg-pink-50 transition-colors">
            <Filter className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* Nutrition Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {nutritionTips.map((tip, index) => (
          <div key={index} className="glass-card p-6 rounded-3xl bg-white/60 border border-white/60 hover:shadow-lg transition-all">
            <div className={`size-12 rounded-2xl bg-${tip.color}-100 flex items-center justify-center text-${tip.color}-500 mb-4`}>
              <tip.icon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">{tip.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{tip.description}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('western')}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
            activeTab === 'western'
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
              : 'bg-white text-slate-600 border border-pink-100 hover:bg-pink-50'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span>Western Cuisine</span>
        </button>
        <button
          onClick={() => setActiveTab('desi')}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
            activeTab === 'desi'
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
              : 'bg-white text-slate-600 border border-pink-100 hover:bg-pink-50'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span>Desi Cuisine</span>
        </button>
      </div>

      {/* Diet Plan Section */}
      <div className="glass-card p-8 rounded-3xl mb-8 bg-gradient-to-br from-pink-50 to-purple-50 border border-white/60">
        <h2 className="text-2xl font-bold text-slate-800 mb-3">{dietPlans[activeTab].title}</h2>
        <p className="text-slate-600 mb-6">{dietPlans[activeTab].description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dietPlans[activeTab].meals.map((meal, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-slate-800">{meal.time}</h3>
              </div>
              <ul className="space-y-2">
                {meal.options.map((option, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-pink-500 mt-1">•</span>
                    <span>{option}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                : 'bg-white text-slate-600 border border-pink-100 hover:bg-pink-50'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRecipes.map((recipe) => (
          <RecipeCard 
            key={`${activeTab}-${recipe.id}`}
            recipe={recipe} 
            isExpanded={expandedRecipes[recipe.id] || false}
            onToggle={() => toggleRecipe(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe, isExpanded, onToggle }) => {
  
  return (
    <div className="glass-card rounded-3xl overflow-hidden bg-white/60 border border-white/60 hover:shadow-xl transition-all group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.image} 
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-pink-600">{recipe.difficulty}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-bold text-lg">{recipe.name}</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-pink-500" />
            <span>{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{recipe.calories} cal</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.benefits.map((benefit, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100"
            >
              {benefit}
            </span>
          ))}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            console.log(`Button clicked for recipe ${recipe.id}`);
            onToggle();
          }}
          className="w-full py-3 rounded-xl bg-pink-500 text-white font-bold hover:bg-pink-600 transition-colors"
        >
          {isExpanded ? 'Hide Recipe' : 'View Recipe'}
        </button>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-pink-100 space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-pink-500" />
                Ingredients
              </h4>
              <ul className="space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-pink-500 mt-1">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-pink-500" />
                Instructions
              </h4>
              <ol className="space-y-2">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="font-bold text-pink-500">{index + 1}.</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietNutrition;
