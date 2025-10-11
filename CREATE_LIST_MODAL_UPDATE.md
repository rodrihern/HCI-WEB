# CreateListModal - Updated to Match PreviewListModal Design

## Overview
The CreateListModal has been updated to match the design and functionality of PreviewListModal, including the ability to add collaborators/share the list while creating it.

## New Features Added

### 1. **Collaborators Section**
- ✅ Shows list of collaborators with avatars
- ✅ Default "Yo" (You) as the owner
- ✅ **+ Button** to add new collaborators
- ✅ Email input to invite people to the list
- ✅ Remove collaborator functionality (with X button)
- ✅ Visual distinction between owner and collaborators

### 2. **Improved Layout**
The modal now has the same structure as PreviewListModal:

#### Left Column:
- **List Name Input** (styled as header)
- **Collaborators Section**
  - Chips showing each collaborator
  - + button to add new ones
  - Email input (appears when + is clicked)
- **Products Section**
  - List of added products
  - QuantityControls component (matching PreviewListModal)
  - Delete button for each product

#### Right Column:
- **Search Bar**
- **Quick Add** (search tag with + button)
- **Product List Area** (ready for future product browsing)

### 3. **Share Functionality**
```typescript
// Add collaborator by email
const shareList = () => {
  if (emailToShare.value.trim()) {
    const email = emailToShare.value.trim()
    const newCollaborator = {
      id: Date.now().toString(),
      name: email.split('@')[0] || email,
      avatar: '👥',
      isOwner: false
    }
    collaborators.value.push(newCollaborator)
  }
}
```

When the list is created, the API will:
1. Create the list
2. Automatically share it with all added collaborators
3. Call `ShoppingListApi.share(listId, email)` for each collaborator

## Visual Changes

### Before:
- Simple name input at top
- Products list
- Basic quantity controls with +/- buttons

### After:
- **List name input styled as header** (larger, bold)
- **Collaborators section** with:
  - Avatar chips for each person
  - Owner badge (you)
  - + button to add more
  - Expandable email input
- **Products list** with:
  - Same QuantityControls component as PreviewListModal
  - Consistent styling and layout

## Component Structure

```vue
<template>
  <BaseModal>
    <div class="flex"> <!-- Two columns -->
      <!-- Left: List Info & Products -->
      <div class="w-1/2">
        <!-- List Name Input (header style) -->
        <!-- Collaborators Section -->
        <!-- Products List -->
        <!-- Create Button -->
      </div>
      
      <!-- Right: Search & Add Products -->
      <div class="w-1/2">
        <!-- Search Bar -->
        <!-- Quick Add Tag -->
        <!-- Product Browser -->
      </div>
    </div>
  </BaseModal>
</template>
```

## API Integration

When creating a list with collaborators:

1. **Create List**
   ```typescript
   POST /api/shopping-lists
   {
     "name": "List Name",
     "description": "Nueva lista",
     "recurring": false
   }
   ```

2. **Share with Collaborators** (for each non-owner)
   ```typescript
   POST /api/shopping-lists/{id}/share
   {
     "email": "collaborator@email.com"
   }
   ```

## User Experience

### Adding Collaborators:
1. Click **+ button** next to collaborators
2. Email input appears with smooth animation
3. Enter email and press **Enter** or click **Agregar**
4. New collaborator appears as a chip
5. Can remove by clicking X on the chip

### Creating the List:
1. Enter list name
2. (Optional) Add collaborators
3. (Optional) Add products
4. Click **"Crear Lista"**
5. List is created and shared with all collaborators
6. View refreshes automatically

## Benefits

- ✅ **Consistent UX**: Same layout as PreviewListModal
- ✅ **Share While Creating**: No need to create first, then share
- ✅ **Visual Feedback**: See who has access before creating
- ✅ **Easy Management**: Add/remove collaborators with simple clicks
- ✅ **Familiar Interface**: Users know what to expect from PreviewListModal

## Future Enhancements

- [ ] Show real user avatars from API
- [ ] Email validation
- [ ] Autocomplete for existing users
- [ ] Permission levels (view/edit)
- [ ] Share notification emails
