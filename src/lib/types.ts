
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

// Types for Meal Scheduling
export type MealType = "lanche_manha" | "almoco" | "lanche_tarde";

export const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: "lanche_manha", label: "Lanche da Manhã" },
  { value: "almoco", label: "Almoço" },
  { value: "lanche_tarde", label: "Lanche da Tarde" },
];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  lanche_manha: "Lanche da Manhã",
  almoco: "Almoço",
  lanche_tarde: "Lanche da Tarde",
};

export interface AgendamentoItem {
  id: string;
  date: string; // Store as ISO string for easier localStorage and Date object reconstruction
  mealType: MealType;
  studentName: string; // Simplified for now
  status: 'agendado' | 'cancelado' | 'realizado';
}
