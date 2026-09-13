export const getProductionItems = () => {
  return [
    {
      id: 1,
      name: 'Beef Burger Patties',
      predicted: 120,
      recommended: 135,
      unit: 'pcs',
      status: 'In Progress',
      ingredients: ['Ground Beef (15kg)', 'Spices (200g)', 'Onions (2kg)']
    },
    {
      id: 2,
      name: 'Tomato Sauce Base',
      predicted: 15,
      recommended: 20,
      unit: 'Liters',
      status: 'Pending',
      ingredients: ['Tomatoes (25kg)', 'Garlic (500g)', 'Olive Oil (1L)']
    },
    {
      id: 3,
      name: 'Fresh Salad Mix',
      predicted: 80,
      recommended: 85,
      unit: 'Portions',
      status: 'Completed',
      ingredients: ['Lettuce (10kg)', 'Cucumber (5kg)', 'Carrots (3kg)']
    },
  ];
};
