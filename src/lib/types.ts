
// Matches the GenAI flow's FoodItemSchema for inventory
export interface InventoryFoodItem {
  name: string;
  quantity: number;
  nutritionalInfo: string;
}

// Extended FoodItem for internal app use
export interface AppFoodItem extends InventoryFoodItem {
  id: string; // Unique identifier
  unit: string; // e.g., kg, L, un
  lowStockThreshold: number;
  // Add any other app-specific fields here
}

// Matches the GenAI flow's MenuItemSchema
export interface MenuItem {
  name: string;
  ingredients: string[];
  nutritionalValue: string;
}

export interface MenuSuggestion {
  menuItems: MenuItem[];
  reasoning: string;
}
