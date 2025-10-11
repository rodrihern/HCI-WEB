// Core API
export { Api } from "./api";

// User API
export {
    UserApi,
    Credentials,
    User,
    type UserData,
    type LoginResponse,
    type CredentialsData,
    type RegisterData,
    type VerifyAccountData,
    type ResetPasswordData,
    type ChangePasswordData,
} from "./user";

// Category API
export {
    CategoryApi,
    Category,
    CategoryMetadata,
    type CategoryData,
    type CategoryMetadataData,
    type GetAllCategoriesOptions,
} from "./category";

// Shopping List API
export {
    ShoppingListApi,
    ShoppingList,
    type ShoppingListData,
    type GetAllShoppingListsOptions,
    type ShareListData,
    type PurchaseMetadata,
} from "./shoppingList";

// Product API
export {
    ProductApi,
    Product,
    ProductMetadata,
    type ProductData,
    type GetAllProductsOptions,
} from "./product";

// Pantry API
export {
    PantryApi,
    Pantry,
    PantryItem,
    type PantryData,
    type PantryItemData,
    type GetAllPantriesOptions,
    type GetPantryItemsOptions,
    type AddPantryItemData,
    type UpdatePantryItemData,
} from "./pantry";

// List Item API
export {
    ListItemApi,
    ListItem,
    type ListItemData,
    type AddListItemData,
    type UpdateListItemData,
    type TogglePurchasedData,
    type GetListItemsOptions,
} from "./listItem";

// Purchase API
export {
    PurchaseApi,
    Purchase,
    type PurchaseData,
    type GetAllPurchasesOptions,
} from "./purchase";

// Common types
export type { PaginatedResponse } from "./category";
