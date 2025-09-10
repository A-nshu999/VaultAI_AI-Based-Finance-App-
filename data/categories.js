export const defaultCategories = [
  // Income Categories
  {
    id: "salary",
    name: "Salary",
    type: "INCOME",
    color: "#4CAF50", // soft green
    icon: "Wallet",
  },
  {
    id: "freelance",
    name: "Freelance",
    type: "INCOME",
    color: "#00ACC1", // calm cyan
    icon: "Laptop",
  },
  {
    id: "investments",
    name: "Investments",
    type: "INCOME",
    color: "#5C6BC0", // muted indigo
    icon: "TrendingUp",
  },
  {
    id: "business",
    name: "Business",
    type: "INCOME",
    color: "#F06292", // soft pink
    icon: "Building",
  },
  {
    id: "rental",
    name: "Rental",
    type: "INCOME",
    color: "#FFB74D", // warm amber
    icon: "Home",
  },
  {
    id: "other-income",
    name: "Other Income",
    type: "INCOME",
    color: "#90A4AE", // cool gray
    icon: "Plus",
  },

  // Expense Categories
  {
    id: "housing",
    name: "Housing",
    type: "EXPENSE",
    color: "#E57373", // muted red
    icon: "Home",
  },
  {
    id: "transportation",
    name: "Transportation",
    type: "EXPENSE",
    color: "#FF8A65", // soft orange
    icon: "Car",
  },
  {
    id: "groceries",
    name: "Groceries",
    type: "EXPENSE",
    color: "#9CCC65", // fresh lime
    icon: "Shopping",
  },
  {
    id: "utilities",
    name: "Utilities",
    type: "EXPENSE",
    color: "#4DD0E1", // aqua blue
    icon: "Zap",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    type: "EXPENSE",
    color: "#9575CD", // lavender violet
    icon: "Film",
  },
  {
    id: "food",
    name: "Food",
    type: "EXPENSE",
    color: "#F48FB1", // light rose
    icon: "UtensilsCrossed",
  },
  {
    id: "shopping",
    name: "Shopping",
    type: "EXPENSE",
    color: "#BA68C8", // soft purple
    icon: "ShoppingBag",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    type: "EXPENSE",
    color: "#4DB6AC", // teal green
    icon: "HeartPulse",
  },
  {
    id: "education",
    name: "Education",
    type: "EXPENSE",
    color: "#7986CB", // dusty blue
    icon: "GraduationCap",
  },
  {
    id: "personal",
    name: "Personal Care",
    type: "EXPENSE",
    color: "#CE93D8", // light lilac
    icon: "Smile",
  },
  {
    id: "travel",
    name: "Travel",
    type: "EXPENSE",
    color: "#64B5F6", // sky blue
    icon: "Plane",
  },
  {
    id: "insurance",
    name: "Insurance",
    type: "EXPENSE",
    color: "#90A4AE", // neutral slate gray
    icon: "Shield",
  },
  {
    id: "gifts",
    name: "Gifts & Donations",
    type: "EXPENSE",
    color: "#F48FB1", // pastel pink
    icon: "Gift",
  },
  {
    id: "bills",
    name: "Bills & Fees",
    type: "EXPENSE",
    color: "#AED581", // pale green
    icon: "Receipt",
  },
  {
    id: "other-expense",
    name: "Other Expenses",
    type: "EXPENSE",
    color: "#B0BEC5", // soft gray
    icon: "MoreHorizontal",
  },
];

export const categoryColors = defaultCategories.reduce((acc, category) => {
  acc[category.id] = category.color;
  return acc;
}, {});
